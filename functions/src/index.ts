import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GEMINI_API_KEY } from "./config";
import { processChat } from "./gemini-agent";
import { generateServiceSpec } from "./spec-generator";
import { generateMockupHtml } from "./mockup-generator";
import {
  ConversationTurn,
  HearingData,
  HearingPhase,
} from "./types";

initializeApp();
const db = getFirestore();

const REGION = "asia-northeast1";

const PHASE_ORDER: HearingPhase[] = [
  "problem",
  "users",
  "features",
  "design",
  "tech",
  "confirm",
  "build_together",
  "next_steps",
];

function getNextPhase(currentPhase: HearingPhase): HearingPhase | null {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  if (currentIndex < 0 || currentIndex >= PHASE_ORDER.length - 1) {
    return null;
  }
  return PHASE_ORDER[currentIndex + 1];
}

function applyExtractedData(
  hearingData: HearingData,
  extractedData: { field: string; value: unknown }[]
): HearingData {
  const updated = { ...hearingData };
  for (const { field, value } of extractedData) {
    switch (field) {
      case "problemStatement":
        updated.problemStatement = String(value);
        break;
      case "targetUsers":
        updated.targetUsers = String(value);
        break;
      case "userRoles":
        if (Array.isArray(value)) {
          updated.userRoles = [
            ...(updated.userRoles ?? []),
            ...value.map(String),
          ];
        }
        break;
      case "features":
        if (typeof value === "object" && value !== null) {
          const featVal = value as Record<string, unknown>;
          updated.features = {
            must: [
              ...(updated.features?.must ?? []),
              ...(Array.isArray(featVal.must)
                ? featVal.must.map(String)
                : []),
            ],
            should: [
              ...(updated.features?.should ?? []),
              ...(Array.isArray(featVal.should)
                ? featVal.should.map(String)
                : []),
            ],
            nice: [
              ...(updated.features?.nice ?? []),
              ...(Array.isArray(featVal.nice)
                ? featVal.nice.map(String)
                : []),
            ],
          };
        }
        break;
      case "designPreferences":
        updated.designPreferences = String(value);
        break;
      case "techConstraints":
        updated.techConstraints = String(value);
        break;
      case "platformTargets":
        if (Array.isArray(value)) {
          updated.platformTargets = [
            ...(updated.platformTargets ?? []),
            ...value.map(String),
          ];
        }
        break;
    }
  }
  return updated;
}

/**
 * rabit48Chat
 * Handles a single chat turn in the hearing process.
 */
export const rabit48Chat = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY] },
  async (request) => {
    const { projectId, message } = request.data as {
      projectId: string;
      message: string;
    };

    if (!projectId || !message) {
      throw new HttpsError(
        "invalid-argument",
        "projectId and message are required."
      );
    }

    const apiKey = GEMINI_API_KEY.value();

    // Load project
    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new HttpsError("not-found", "Project not found.");
    }

    const projectData = projectSnap.data()!;
    const currentPhase: HearingPhase = projectData.currentPhase ?? "problem";
    const hearingData: HearingData = projectData.hearingData ?? {};

    // Load conversation history
    const messagesSnap = await projectRef
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const conversationHistory: ConversationTurn[] = messagesSnap.docs.map(
      (doc) => {
        const data = doc.data();
        return {
          role: data.role === "user" ? "user" : "model",
          parts: [{ text: data.text }],
        };
      }
    );

    // Add the new user message to history
    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    // Save user message to Firestore
    await projectRef.collection("messages").add({
      role: "user",
      text: message,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Call Gemini agent
    const agentResponse = await processChat(
      apiKey,
      conversationHistory,
      currentPhase,
      hearingData
    );

    // Apply extracted data
    const updatedHearingData = applyExtractedData(
      hearingData,
      agentResponse.extractedData
    );

    // Determine next phase
    let nextPhase = currentPhase;
    if (agentResponse.phaseComplete) {
      const next = getNextPhase(currentPhase);
      if (next) {
        nextPhase = next;
      }
    }

    // Save agent response message
    await projectRef.collection("messages").add({
      role: "assistant",
      text: agentResponse.reply,
      phase: currentPhase,
      phaseComplete: agentResponse.phaseComplete,
      extractedData: agentResponse.extractedData,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update project
    const updatePayload: Record<string, unknown> = {
      hearingData: updatedHearingData,
      currentPhase: nextPhase,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // If next_steps phase is complete, mark session as finished
    if (currentPhase === "next_steps" && agentResponse.phaseComplete) {
      updatePayload.status = "hearing_complete";
    }

    await projectRef.update(updatePayload);

    return {
      reply: agentResponse.reply,
      currentPhase: nextPhase,
      phaseComplete: agentResponse.phaseComplete,
      extractedData: agentResponse.extractedData,
      hearingComplete:
        currentPhase === "next_steps" && agentResponse.phaseComplete,
    };
  }
);

/**
 * rabit48GenerateSpec
 * Generates SERVICE_SPEC.md from the collected hearing data.
 */
export const rabit48GenerateSpec = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY] },
  async (request) => {
    const { projectId } = request.data as { projectId: string };

    if (!projectId) {
      throw new HttpsError("invalid-argument", "projectId is required.");
    }

    const apiKey = GEMINI_API_KEY.value();

    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new HttpsError("not-found", "Project not found.");
    }

    const projectData = projectSnap.data()!;
    const hearingData: HearingData = projectData.hearingData ?? {};
    const projectTitle: string = projectData.title ?? "Untitled Project";

    // Generate spec
    const specMd = await generateServiceSpec(apiKey, hearingData, projectTitle);

    // Save to project
    await projectRef.update({
      serviceSpecMd: specMd,
      status: "reviewing",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      serviceSpecMd: specMd,
      status: "reviewing",
    };
  }
);

/**
 * rabit48GenerateMockups
 * Generates HTML mockup pages based on the spec and hearing data.
 */
export const rabit48GenerateMockups = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY], timeoutSeconds: 300 },
  async (request) => {
    const { projectId } = request.data as { projectId: string };

    if (!projectId) {
      throw new HttpsError("invalid-argument", "projectId is required.");
    }

    const apiKey = GEMINI_API_KEY.value();

    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new HttpsError("not-found", "Project not found.");
    }

    const projectData = projectSnap.data()!;
    const hearingData: HearingData = projectData.hearingData ?? {};
    const specMd: string = projectData.serviceSpecMd ?? "";

    if (!specMd) {
      throw new HttpsError(
        "failed-precondition",
        "Service spec must be generated before mockups."
      );
    }

    // Generate mockups
    const htmlPages = await generateMockupHtml(apiKey, specMd, hearingData);

    // Save mockup data to project
    const mockups = htmlPages.map((html, index) => ({
      index,
      html,
      createdAt: new Date().toISOString(),
    }));

    await projectRef.update({
      mockups,
      status: "mockups_generated",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      mockupCount: htmlPages.length,
      status: "mockups_generated",
    };
  }
);

/**
 * rabit48RegenerateSpec
 * Regenerates SERVICE_SPEC.md with user feedback incorporated.
 */
export const rabit48RegenerateSpec = onCall(
  { region: REGION, secrets: [GEMINI_API_KEY] },
  async (request) => {
    const { projectId, feedback } = request.data as {
      projectId: string;
      feedback: string;
    };

    if (!projectId || !feedback) {
      throw new HttpsError(
        "invalid-argument",
        "projectId and feedback are required."
      );
    }

    const apiKey = GEMINI_API_KEY.value();

    const projectRef = db.collection("projects").doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      throw new HttpsError("not-found", "Project not found.");
    }

    const projectData = projectSnap.data()!;
    const hearingData: HearingData = projectData.hearingData ?? {};
    const projectTitle: string = projectData.title ?? "Untitled Project";
    const previousSpec: string = projectData.serviceSpecMd ?? "";

    // Generate updated spec using Gemini with feedback context
    const genAI = await import("@google/generative-ai");
    const ai = new genAI.GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `あなたはプロのプロダクトマネージャーです。
以下のサービス仕様書に対してユーザーからフィードバックを受けました。
フィードバックを反映して仕様書を改善してください。

## 現在の仕様書
${previousSpec}

## ユーザーからのフィードバック
${feedback}

## ヒアリングデータ
${JSON.stringify(hearingData, null, 2)}

## プロジェクトタイトル
${projectTitle}

## ルール
- 既存の仕様書のフォーマットを維持してください
- フィードバックを適切に反映してください
- Markdownテキストのみを出力してください（コードブロックのラッパー不要）
- 日本語で出力してください`;

    const result = await model.generateContent(prompt);
    let specMd = result.response.text();

    // Remove markdown code block wrapper if present
    const codeBlockMatch = specMd.match(/```(?:markdown)?\s*([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1].includes("# ")) {
      specMd = codeBlockMatch[1].trim();
    }

    // Save updated spec
    await projectRef.update({
      serviceSpecMd: specMd,
      specRevisionHistory: FieldValue.arrayUnion({
        feedback,
        regeneratedAt: new Date().toISOString(),
      }),
      status: "reviewing",
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      serviceSpecMd: specMd,
      status: "reviewing",
    };
  }
);
