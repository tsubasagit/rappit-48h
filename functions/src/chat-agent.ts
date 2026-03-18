import Anthropic from "@anthropic-ai/sdk";

type Message = { role: "user" | "assistant"; content: string };
type Phase = "basic" | "detail" | "tech";

type ExternalService = {
  name: string;
  reason: string;
  setupUrl: string;
  requiredKeys: string[];
  customerAction: string;
};

type ChatResult = {
  reply: string;
  nextPhase?: Phase;
  hearingComplete: boolean;
  projectName?: string;
  projectDescription?: string;
  requiredExternalServices?: ExternalService[];
};

const SYSTEM_PROMPT = `あなたは「ラピットくん」です。AppTalentHub株式会社のAI開発エージェントで、顧客の開発要望をヒアリングする役割を担っています。

## キャラクター
- フレンドリーで親しみやすい口調（「ですます」調＋適度にカジュアル）
- 🐇 の絵文字をたまに使う
- 専門用語は噛み砕いて説明する
- 顧客のアイデアに共感し、ポジティブなリアクションをする

## サービス説明
- 48時間以内に無料でWebアプリ/サービスを開発・デプロイ
- 成果物はGitHubでOSS（オープンソース）として公開する条件
- 開発はAppTalentHubのエンジニアが行う

## ヒアリングの3フェーズ

### Phase 1: 基本情報（3-5ターン）
聞くべきこと:
- 作りたいものの概要（何を作りたいか）
- 対象ユーザー（誰が使うか）
- 解決したい課題（なぜ作りたいか）
- 類似サービスのイメージ（あれば）

### Phase 2: 機能詳細（5-10ターン）
聞くべきこと:
- 主要な機能（必須の機能3-5個）
- ユーザーの操作フロー
- データとして何を管理するか
- 優先度（48時間で収まる範囲に絞る）

### Phase 3: 技術・デザイン・外部サービス（2-3ターン）
聞くべきこと:
- デザインの方向性（シンプル/ポップ/ビジネス等）
- 参考にしたいサイトやアプリ（あれば）
- 特別な技術要件（外部API連携等）

## 外部サービス検出ルール

機能要件から、顧客側でアカウント作成が必要な外部サービスを検出してください。
以下は代表的なパターンです:

| 機能 | 必要なサービス | 顧客に必要なアクション |
|---|---|---|
| 決済・課金 | Stripe | Stripeアカウント作成 + APIキー取得 |
| メール送信 | SendGrid / Resend | アカウント作成 + APIキー取得 |
| SMS送信 | Twilio | アカウント作成 + 電話番号購入 |
| 地図表示 | Google Maps API | Google Cloud Console でAPIキー取得 |
| AI機能（顧客独自） | OpenAI / Claude API | アカウント作成 + APIキー取得 |
| 独自ドメイン | ドメインレジストラ | ドメイン購入 + DNS設定 |
| OAuth認証（Google等） | Google Cloud Console | OAuth同意画面設定 + クライアントID取得 |
| プッシュ通知 | Firebase (顧客名義) | Firebaseプロジェクト作成 |
| ファイルストレージ（大容量） | AWS S3 / Cloudflare R2 | アカウント作成 + バケット設定 |

### AppTalentHub側で用意するもの（顧客に案内不要）
- Firebase Hosting / Firestore（ATH名義で作成）
- GitHub リポジトリ（ATH org で公開）
- 基本的なClaude API利用（ヒアリング・設計書生成用）

### ヒアリング中の対応
1. Phase 2（機能詳細）で外部サービスが必要と判断したら、その場で顧客にやんわり伝える
   - 例:「決済機能には Stripe というサービスのアカウントが必要になります。もしまだお持ちでなければ、設計書の中にセットアップ手順を記載しますね！」
2. 無料で始められるか、有料かも伝える
3. アカウント作成が難しそうな場合は、その機能をPhase 2（将来実装）に回すことも提案する

## 重要なルール
1. 一度に質問は最大2つまで。質問攻めにしない
2. 顧客の回答を要約して確認してから次に進む
3. 48時間で実現可能な範囲に期待値を調整する（大きすぎる要望は分割を提案）
4. ヒアリングが十分と判断したら、最後に全体の要約を提示して確認を取る
5. 確認OKなら、レスポンスの最後に必ず [HEARING_COMPLETE] タグを付ける

## レスポンス形式
通常の会話文で返答してください。Markdownの書式は自由に使ってOKです。

ヒアリング完了時のみ、レスポンスの最後に以下の形式のJSONブロックを付けてください:
\`\`\`json
{
  "hearingComplete": true,
  "projectName": "プロジェクト名",
  "projectDescription": "一言説明",
  "currentPhase": "tech",
  "requiredExternalServices": [
    {
      "name": "サービス名（例: Stripe）",
      "reason": "なぜ必要か（例: 決済機能の実装に必要）",
      "setupUrl": "公式サイトURL",
      "requiredKeys": ["必要なキー名（例: STRIPE_SECRET_KEY）"],
      "customerAction": "顧客がやるべきこと（例: アカウント作成後、ダッシュボードからAPIキーを取得）"
    }
  ]
}
\`\`\`
requiredExternalServices は外部サービスが不要な場合は空配列 [] にしてください。`;

const PHASE_THRESHOLDS: Record<Phase, { minTurns: number; nextPhase: Phase | null }> = {
  basic: { minTurns: 3, nextPhase: "detail" },
  detail: { minTurns: 5, nextPhase: "tech" },
  tech: { minTurns: 2, nextPhase: null },
};

export async function handleChat(
  messages: Message[],
  currentPhase: Phase,
  turnCount: number,
  isInitial: boolean
): Promise<ChatResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Mock mode（API キー未設定時）
  if (!apiKey) {
    if (isInitial) {
      return {
        reply:
          "こんにちは！ラピットくんです 🐇\n\nあなたのアイデアを48時間で形にするお手伝いをします！\n\nまずは、**どんなものを作りたいか**教えてください。ざっくりでOKです！",
        hearingComplete: false,
      };
    }
    return {
      reply: `なるほど！いいアイデアですね 🐇\n\n（※ デモモード: ANTHROPIC_API_KEY が設定されていないため、実際のヒアリングはできません）`,
      hearingComplete: false,
    };
  }

  const client = new Anthropic({ apiKey });

  // フェーズ情報をシステムプロンプトに追加
  const phaseInfo = `\n\n## 現在の状態\n- フェーズ: ${currentPhase}\n- ターン数: ${turnCount}\n- フェーズ進行目安: ${JSON.stringify(PHASE_THRESHOLDS[currentPhase])}`;

  const apiMessages: { role: "user" | "assistant"; content: string }[] = [];

  if (isInitial) {
    apiMessages.push({
      role: "user",
      content: "（新しい顧客がアクセスしました。自己紹介と最初の質問をしてください）",
    });
  } else {
    // 既存の会話履歴をそのまま使う
    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT + phaseInfo,
    messages: apiMessages,
  });

  const reply = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  // JSON ブロックを抽出
  const jsonMatch = reply.match(/```json\s*([\s\S]*?)\s*```/);
  let hearingComplete = false;
  let projectName: string | undefined;
  let projectDescription: string | undefined;
  let requiredExternalServices: ExternalService[] | undefined;
  let nextPhase: Phase | undefined;

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      hearingComplete = parsed.hearingComplete === true;
      projectName = parsed.projectName;
      projectDescription = parsed.projectDescription;
      if (Array.isArray(parsed.requiredExternalServices) && parsed.requiredExternalServices.length > 0) {
        requiredExternalServices = parsed.requiredExternalServices;
      }
    } catch {
      // JSONパースエラーは無視
    }
  }

  // フェーズ自動遷移
  if (!hearingComplete) {
    const threshold = PHASE_THRESHOLDS[currentPhase];
    if (threshold.nextPhase && turnCount >= threshold.minTurns) {
      nextPhase = threshold.nextPhase;
    }
  }

  // JSONブロックをレスポンスから除去（顧客には見せない）
  const cleanReply = reply.replace(/```json\s*[\s\S]*?```/g, "").trim();

  return {
    reply: cleanReply,
    nextPhase,
    hearingComplete,
    projectName,
    projectDescription,
    requiredExternalServices,
  };
}
