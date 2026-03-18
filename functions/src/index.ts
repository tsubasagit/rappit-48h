import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import { handleChat } from "./chat-agent";
import { generateSpec } from "./spec-generator";

initializeApp();
const db = getFirestore();

setGlobalOptions({ region: "asia-northeast1" });

// CORS ヘルパー
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setCors(res: any) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
}

// プロジェクト作成
export const createProject = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const projectRef = db.collection("projects").doc();
  await projectRef.set({
    status: "hearing",
    createdAt: Date.now(),
    source: req.body.source || "lp",
  });

  // 会話ドキュメントも初期化
  await db.collection("conversations").doc(projectRef.id).set({
    messages: [],
    phase: "basic", // basic → detail → tech
    turnCount: 0,
  });

  res.json({ projectId: projectRef.id });
});

// メッセージ取得
export const getMessages = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const projectId = req.query.projectId as string;
  if (!projectId) { res.status(400).json({ error: "projectId required" }); return; }

  const convDoc = await db.collection("conversations").doc(projectId).get();
  if (!convDoc.exists) { res.json({ messages: [] }); return; }

  res.json({ messages: convDoc.data()?.messages || [] });
});

// チャット（ヒアリング）
export const chat = onRequest({ timeoutSeconds: 120 }, async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const { projectId, message, isInitial } = req.body;
  if (!projectId) { res.status(400).json({ error: "projectId required" }); return; }

  try {
    const convRef = db.collection("conversations").doc(projectId);
    const convDoc = await convRef.get();
    const convData = convDoc.data() || { messages: [], phase: "basic", turnCount: 0 };

    // ユーザーメッセージを追加（初回挨拶以外）
    if (!isInitial && message) {
      convData.messages.push({ role: "user", content: message });
      convData.turnCount++;
    }

    // Claude API でラピットくんの応答を生成
    const result = await handleChat(convData.messages, convData.phase, convData.turnCount, isInitial);

    // アシスタントメッセージを追加
    convData.messages.push({ role: "assistant", content: result.reply });

    // フェーズ更新
    const updatedPhase = result.nextPhase || convData.phase;

    await convRef.set({
      messages: convData.messages,
      phase: updatedPhase,
      turnCount: convData.turnCount,
    });

    // ヒアリング完了 → 設計書生成
    if (result.hearingComplete) {
      const spec = await generateSpec(convData.messages);

      const projectUpdate: Record<string, unknown> = {
        status: "spec_review",
        specMarkdown: spec,
        revisionCount: 0,
        name: result.projectName || "新規プロジェクト",
        description: result.projectDescription || "",
      };

      // 外部サービス要件を保存
      if (result.requiredExternalServices && result.requiredExternalServices.length > 0) {
        projectUpdate.requiredExternalServices = result.requiredExternalServices;
        projectUpdate.setupCompleted = false;
      }

      await db.collection("projects").doc(projectId).update(projectUpdate);
    }

    res.json({ reply: result.reply });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat error:", errMsg);
    res.status(500).json({ error: "チャット処理でエラーが発生しました" });
  }
});

// 設計書承認
export const approveSpec = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const { projectId } = req.body;
  if (!projectId) { res.status(400).json({ error: "projectId required" }); return; }

  // 外部サービスが必要か確認
  const projectDoc = await db.collection("projects").doc(projectId).get();
  const projectData = projectDoc.data();
  const hasExternalServices = projectData?.requiredExternalServices?.length > 0;

  await db.collection("projects").doc(projectId).update({
    status: hasExternalServices ? "waiting_setup" : "spec_approved",
    approvedAt: Date.now(),
  });

  // TODO: Slack通知
  // await notifySlack(`新規プロジェクト承認: ${projectId}`)

  res.json({ success: true, needsSetup: hasExternalServices });
});

// セットアップ完了報告（顧客が外部サービスの準備完了を報告）
export const completeSetup = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const { projectId } = req.body;
  if (!projectId) { res.status(400).json({ error: "projectId required" }); return; }

  await db.collection("projects").doc(projectId).update({
    status: "spec_approved",
    setupCompleted: true,
    setupCompletedAt: Date.now(),
  });

  res.json({ success: true });
});

// ステータス更新（管理者用）
export const updateStatus = onRequest(async (req, res) => {
  setCors(res);
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const { projectId, status, githubUrl, deployUrl } = req.body;
  if (!projectId || !status) { res.status(400).json({ error: "projectId and status required" }); return; }

  const update: Record<string, unknown> = { status };
  if (githubUrl) update.githubUrl = githubUrl;
  if (deployUrl) update.deployUrl = deployUrl;
  if (status === "delivered") update.deliveredAt = Date.now();

  await db.collection("projects").doc(projectId).update(update);
  res.json({ success: true });
});
