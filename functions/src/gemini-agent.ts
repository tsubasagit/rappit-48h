import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AgentResponse,
  ConversationTurn,
  HearingData,
  HearingPhase,
} from "./types";

const PHASE_PROMPTS: Record<HearingPhase, string> = {
  problem: `ユーザーが解決したい課題を**一緒に定義する方法**を教えてください。
- まず「誰の、どんな困りごとですか？」と問いかけてください
- 曖昧な回答には「それは具体的にどんな場面で起きますか？」と深掘りの**やり方**を見せてください
- 課題定義のフレームワーク（誰が・いつ・どこで・何に困っている）を自然に紹介してください
- 「こうやって課題を言語化するのが、アプリ開発の第一歩です」と学びを意識させてください`,

  users: `ペルソナ設計の**考え方**を教えてください。
- 「理想的なユーザー像を一人思い浮かべてみてください」と促してください
- 年齢・職業・ITリテラシー・利用シーンなど、ペルソナに必要な要素を説明しながら聞いてください
- 「ペルソナを具体的にすると、必要な機能が自然に見えてきます」と教育的に導いてください
- 複数の役割（管理者・一般ユーザー等）がある場合は、役割分けの考え方も教えてください`,

  features: `MoSCoW法（優先度分類）を**一緒にやって**みてください。
- まず「MoSCoW法」を簡潔に説明してください（Must/Should/Could/Won't）
- ユーザーが挙げた機能を一緒にMust/Should/Niceに分類してください
- 「全部Mustにしたくなりますが、MVPでは絞ることが成功の鍵です」とアドバイスしてください
- AIエージェントに機能を伝えるときも、この優先度が重要であることを教えてください`,

  design: `AIツール（v0、bolt.new等）でUIを作る**方法**を見せてください。
- 「参考にしたいアプリやサイトはありますか？」と聞いてください
- 色・雰囲気・レイアウトの好みを聞きつつ、「これをAIへのプロンプトにするとこうなります」と例を示してください
- 「AIにデザインを依頼するコツは、具体的な参考例を示すことです」と教えてください
- プロンプトの書き方のコツ（具体性、参考URL、トーン指定）を自然に教えてください`,

  tech: `技術選定の**判断基準**を教えてください。
- 「Web？アプリ？どこで使いたいですか？」から始めてください
- プラットフォーム選択の考え方（Web=広いリーチ、アプリ=リッチUX等）を教えてください
- 「AIエージェントに開発を依頼する場合、React+Firebaseの組み合わせが人気です」など実践的な情報を共有してください
- 技術的な制約を確認しつつ、「この判断基準を持っておくと、エンジニアとの会話がスムーズになります」と教育的に伝えてください`,

  confirm: `これまでに学んだことを**振り返り**、次のステップを示してください。
- 収集した情報を要約して見せてください
- 「ここまでで、課題定義→ペルソナ→機能設計→デザイン→技術選定という流れを体験しました」と振り返ってください
- 各フェーズで学んだポイントを簡潔にまとめてください
- 「この情報があれば、AIエージェントにアプリ開発を依頼できます」と次のステップへの期待を持たせてください`,

  build_together: `SERVICE_SPEC.mdの書き方と、AIエージェントでの開発の始め方を教えてください。
- 「ここまでの情報をSERVICE_SPEC.mdというフォーマットにまとめると、AIへの完璧な指示書になります」と説明してください
- SERVICE_SPEC.mdの主要セクション（概要、ユーザーロール、機能一覧、画面一覧、データモデル）を簡潔に紹介してください
- Claude Code や Cursor での使い方を簡潔にデモしてください（「このファイルをプロジェクトルートに置いて、Claude Codeに『SERVICE_SPEC.mdに従って実装して』と指示するだけです」）
- AIへの効果的な指示の出し方（具体的に、段階的に、期待する出力形式を示す）を教えてください
- 「自分でここまでできたということは、AIエージェント開発の基礎はもう身についています」と自信を持たせてください`,

  next_steps: `学びの振り返りと、さらに深く学ぶための選択肢を提示してください。
- 「おめでとうございます！AIエージェント開発の基礎を体験しました」と達成感を伝えてください
- 今回のセッションで学んだことを3つにまとめてください
- 次のステップとして以下を自然に紹介してください:
  1. 「今すぐ始める」: スターターキット（SERVICE_SPEC.mdテンプレート + プロンプト集）のダウンロード
  2. 「もっと深く学ぶ」: DXBoost研修（60時間でAIエージェント開発をマスター、助成金活用で実質10.5万円）の紹介
  3. 「相談する」: StartPassワークショップや無料相談の案内
- 押し売りにならないよう、あくまで「選択肢の紹介」というトーンで伝えてください
- 「どの道を選んでも、今日学んだことが土台になります」と締めくくってください`,
};

function buildSystemPrompt(
  currentPhase: HearingPhase,
  hearingData: HearingData
): string {
  const collectedSummary = Object.entries(hearingData)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `- ${k}: ${JSON.stringify(v)}`)
    .join("\n");

  return `あなたは「ラピットくん」— rabit48のAIガイドです。
ユーザーがAIエージェントを使ったアプリ開発の**やり方を学ぶ**のをサポートする教育ガイドとして機能します。

## あなたの役割
- ユーザーに**アプリ開発の考え方やプロセス**を教えながら、一緒に要件を整理します
- 単に情報を聞き出すのではなく、**なぜその情報が必要か、どう活用するか**を教えてください
- 各フェーズで「AIエージェントにこう伝えると良いですよ」という実践的なアドバイスを含めてください
- フレンドリーで励まし上手、でもプロフェッショナルなトーンで会話してください
- ユーザーが「自分にもできそう」と思えるように導いてください

## 学習フェーズ（8ステップ）
1. problem - 課題定義の**やり方**を学ぶ
2. users - ペルソナ設計の**考え方**を学ぶ
3. features - 機能優先度分類（MoSCoW法）を**体験する**
4. design - AIでUIを作る**方法**を知る
5. tech - 技術選定の**判断基準**を学ぶ
6. confirm - 学んだことの**振り返り**
7. build_together - SERVICE_SPEC.mdとAI開発ツールの**使い方**を学ぶ
8. next_steps - さらに学ぶための**次のステップ**

## 現在のフェーズ: ${currentPhase}
${PHASE_PROMPTS[currentPhase]}

## これまでに収集したデータ
${collectedSummary || "(まだデータはありません)"}

## 回答フォーマット
必ず以下のJSON形式で回答してください。JSON以外のテキストは含めないでください。

\`\`\`json
{
  "reply": "ユーザーへの返答メッセージ（日本語）",
  "currentPhase": "${currentPhase}",
  "phaseComplete": false,
  "extractedData": [
    { "field": "フィールド名", "value": "抽出した値" }
  ]
}
\`\`\`

### フィールド説明
- reply: ユーザーに表示するメッセージ。教育的で励まし上手、次の質問や学びのポイントを含めてください。
- currentPhase: 現在のフェーズ名（変更しないでください）
- phaseComplete: このフェーズで十分な学びと情報収集ができたらtrueにしてください
- extractedData: 今回の会話から抽出できたデータ。フィールド名は以下のいずれか:
  - problemStatement, targetUsers, userRoles, features, designPreferences, techConstraints, platformTargets

### extractedDataのルール
- 抽出できるデータがない場合は空配列 [] にしてください
- userRolesとplatformTargetsは文字列の配列として抽出してください
- featuresは { "must": [], "should": [], "nice": [] } の形式で抽出してください
- 1回の会話で複数のフィールドを抽出しても構いません
- build_togetherとnext_stepsフェーズでは、extractedDataは空配列で構いません`;
}

function parseAgentResponse(
  raw: string,
  currentPhase: HearingPhase
): AgentResponse {
  // Try to extract JSON from the response
  let jsonStr = raw.trim();

  // Remove markdown code block wrapper if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      reply: parsed.reply ?? raw,
      currentPhase: parsed.currentPhase ?? currentPhase,
      phaseComplete: parsed.phaseComplete ?? false,
      extractedData: Array.isArray(parsed.extractedData)
        ? parsed.extractedData
        : [],
    };
  } catch {
    // If JSON parsing fails, try to find a JSON object in the text
    const jsonMatch = raw.match(/\{[\s\S]*"reply"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          reply: parsed.reply ?? raw,
          currentPhase: parsed.currentPhase ?? currentPhase,
          phaseComplete: parsed.phaseComplete ?? false,
          extractedData: Array.isArray(parsed.extractedData)
            ? parsed.extractedData
            : [],
        };
      } catch {
        // Fall through to fallback
      }
    }

    // Fallback: treat the entire response as a reply with no extracted data
    return {
      reply: raw,
      currentPhase,
      phaseComplete: false,
      extractedData: [],
    };
  }
}

export async function processChat(
  apiKey: string,
  conversationHistory: ConversationTurn[],
  currentPhase: HearingPhase,
  hearingData: HearingData
): Promise<AgentResponse> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const systemPrompt = buildSystemPrompt(currentPhase, hearingData);

  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: JSON.stringify({
              reply:
                "了解しました。ラピットくんとして、ユーザーのAIエージェント開発の学びをサポートします。",
              currentPhase,
              phaseComplete: false,
              extractedData: [],
            }),
          },
        ],
      },
      ...conversationHistory,
    ],
  });

  // The last message in conversationHistory is the user's latest input
  // Since we included it in the history, we send a follow-up prompt
  // to get the agent's response
  const lastUserMessage =
    conversationHistory.length > 0
      ? conversationHistory[conversationHistory.length - 1]
      : null;

  let result;
  if (lastUserMessage && lastUserMessage.role === "user") {
    // Remove the last user message from history and send it as the new message
    const historyWithoutLast = conversationHistory.slice(0, -1);
    const chatWithCorrectHistory = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            {
              text: JSON.stringify({
                reply:
                  "了解しました。ラピットくんとして、ユーザーのAIエージェント開発の学びをサポートします。",
                currentPhase,
                phaseComplete: false,
                extractedData: [],
              }),
            },
          ],
        },
        ...historyWithoutLast,
      ],
    });
    result = await chatWithCorrectHistory.sendMessage(
      lastUserMessage.parts.map((p) => p.text).join("\n")
    );
  } else {
    // No user message yet — start the conversation
    result = await chat.sendMessage(
      "ガイドセッションを開始してください。最初の質問をお願いします。"
    );
  }

  const responseText = result.response.text();
  return parseAgentResponse(responseText, currentPhase);
}
