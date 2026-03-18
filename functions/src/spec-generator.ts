import Anthropic from "@anthropic-ai/sdk";

type Message = { role: "user" | "assistant"; content: string };

const SPEC_SYSTEM_PROMPT = `あなたはソフトウェア設計書を生成する専門家です。ヒアリングの会話履歴を読み、SERVICE_SPEC.md 形式の設計書を生成してください。

## 出力形式

以下のテンプレートに沿って Markdown で出力してください。過不足なく、48時間で構築可能な現実的な範囲に絞ってください。

\`\`\`markdown
# {サービス名} - サービス仕様書

## 1. サービス概要
- **一言で**: （1行の説明）
- **対象ユーザー**: （誰が使うか）
- **解決する課題**: （何を解決するか）
- **ステータス**: MVP

## 2. ユーザーロールと権限
| ロール | できること |
|---|---|
| ... | ... |

## 3. 機能一覧
### MVP（48時間で実装）
- [ ] 機能名 — 説明
- [ ] ...

### Phase 2以降（将来実装）
- [ ] 機能名 — 説明

## 4. 画面一覧
| 画面 | パス | 対象ロール | 概要 |
|---|---|---|---|
| ... | ... | ... | ... |

## 5. データモデル
### \`collection_name\`
- 説明
- 主要フィールド: field1(型), field2(型)

## 6. 外部連携
- **認証**: （方式）
- **DB**: Firestore
- **ホスティング**: Firebase Hosting
- **その他API**: （必要なもの）

## 7. ビジネスルール
- ルール1
- ルール2

## 8. 非機能要件
- **想定ユーザー数**: （初期）
- **パフォーマンス**: （目標）
- **セキュリティ**: （方針）

## 9. 技術スタック
- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Firebase Cloud Functions
- DB: Firestore
- Hosting: Firebase Hosting
- その他: （追加があれば）

## 10. デザイン方針
- テーマ: （方向性）
- カラー: （メインカラー）
- レスポンシブ対応: Yes
\`\`\`

## 重要なルール
1. Markdownのみ出力（コードブロックで囲まない）
2. 48時間で実現可能な範囲に必ず絞る（大きすぎる機能は Phase 2 に回す）
3. 技術スタックは React + Vite + Firebase をベースにする
4. 日本語で記述する
5. 具体的で実装者がすぐ着手できる粒度にする`;

export async function generateSpec(messages: Message[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Mock mode
  if (!apiKey) {
    return `# サンプルプロジェクト - サービス仕様書

## 1. サービス概要
- **一言で**: デモ用のサンプル設計書です
- **対象ユーザー**: テストユーザー
- **解決する課題**: デモ表示の確認
- **ステータス**: MVP

（※ ANTHROPIC_API_KEY が未設定のため、実際の設計書は生成されていません）`;
  }

  const client = new Anthropic({ apiKey });

  // 会話履歴をコンテキストとしてまとめる
  const conversationText = messages
    .map((m) => `${m.role === "user" ? "顧客" : "ラピットくん"}: ${m.content}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: SPEC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `以下のヒアリング内容から SERVICE_SPEC.md を生成してください。\n\n---\n\n${conversationText}`,
      },
    ],
  });

  const specText = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return specText;
}
