import { GoogleGenerativeAI } from "@google/generative-ai";
import { HearingData } from "./types";

const SPEC_TEMPLATE_PROMPT = `あなたはプロのプロダクトマネージャーです。
ヒアリングで収集したデータを元に、SERVICE_SPEC.md（サービス仕様書）を生成してください。

## 出力フォーマット
以下のMarkdown形式で出力してください。各セクションを充実させ、実際の開発で使える品質にしてください。

\`\`\`markdown
# {プロジェクトタイトル} - サービス仕様書

## 1. サービス概要
### 1.1 サービス名
### 1.2 コンセプト
### 1.3 解決する課題
### 1.4 ターゲットユーザー
### 1.5 提供価値

## 2. ユーザーロールと権限
| ロール | 説明 | 主な権限 |
|---|---|---|

## 3. 機能一覧
### 3.1 Must（必須機能）
### 3.2 Should（推奨機能）
### 3.3 Nice to Have（あれば嬉しい機能）

## 4. 画面一覧
| # | 画面名 | 概要 | 主要機能 |
|---|---|---|---|

## 5. データモデル
### 5.1 主要エンティティ
### 5.2 ER図（概要）

## 6. 外部連携
| サービス | 用途 | 必須/任意 |
|---|---|---|

## 7. ビジネスルール
-

## 8. 非機能要件
### 8.1 パフォーマンス
### 8.2 セキュリティ
### 8.3 可用性

## 9. 既知の課題・制限
-

## 10. 更新履歴
| 日付 | バージョン | 変更内容 |
|---|---|---|
\`\`\`

## ルール
- Markdown形式のみで出力してください（JSON不要）
- コードブロックのラッパー(\`\`\`markdown ... \`\`\`)は含めず、Markdownテキストそのものを出力してください
- 各セクションは具体的に記述してください
- ヒアリングデータに含まれない情報は、合理的に推測して補完してください
- 日本語で出力してください`;

export async function generateServiceSpec(
  apiKey: string,
  hearingData: HearingData,
  projectTitle: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const hearingDataSummary = `
## プロジェクトタイトル
${projectTitle}

## ヒアリングデータ
- 課題・概要: ${hearingData.problemStatement ?? "未定義"}
- ターゲットユーザー: ${hearingData.targetUsers ?? "未定義"}
- ユーザーロール: ${hearingData.userRoles?.join(", ") ?? "未定義"}
- 必須機能: ${hearingData.features?.must?.join(", ") ?? "未定義"}
- 推奨機能: ${hearingData.features?.should?.join(", ") ?? "未定義"}
- あれば嬉しい機能: ${hearingData.features?.nice?.join(", ") ?? "未定義"}
- デザイン要望: ${hearingData.designPreferences ?? "未定義"}
- 技術制約: ${hearingData.techConstraints ?? "未定義"}
- プラットフォーム: ${hearingData.platformTargets?.join(", ") ?? "未定義"}
`;

  const result = await model.generateContent([
    SPEC_TEMPLATE_PROMPT,
    hearingDataSummary,
  ]);

  let specMd = result.response.text();

  // Remove markdown code block wrapper if Gemini wrapped it
  const codeBlockMatch = specMd.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1].includes("# ")) {
    specMd = codeBlockMatch[1].trim();
  }

  return specMd;
}
