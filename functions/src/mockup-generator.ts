import { GoogleGenerativeAI } from "@google/generative-ai";
import { HearingData } from "./types";

const MOCKUP_SYSTEM_PROMPT = `あなたはUIデザイナーです。
サービス仕様書とヒアリングデータを元に、HTMLモックアップページを生成してください。

## 出力ルール
- 各画面を独立したHTMLファイルとして生成してください
- Tailwind CSSをCDNで読み込んでください: <script src="https://cdn.tailwindcss.com"></script>
- 自己完結型のHTMLファイルにしてください（外部依存なし、Tailwind CDN以外）
- レスポンシブデザインにしてください
- 日本語UIにしてください
- モダンで洗練されたデザインにしてください
- 各HTMLは<!DOCTYPE html>から始めてください
- ダミーデータを使ってリアルな見た目にしてください

## 出力フォーマット
以下のJSON形式で出力してください:

\`\`\`json
{
  "pages": [
    {
      "name": "画面名",
      "html": "<!DOCTYPE html>..."
    }
  ]
}
\`\`\`

## 生成する画面
仕様書の「画面一覧」セクションから主要な画面を3〜5ページ生成してください。
最低限以下を含めてください:
1. ログイン/トップページ
2. メインダッシュボード
3. 主要機能の画面`;

interface MockupPage {
  name: string;
  html: string;
}

function parseMockupResponse(raw: string): string[] {
  let jsonStr = raw.trim();

  // Remove markdown code block wrapper if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.pages && Array.isArray(parsed.pages)) {
      return parsed.pages.map((page: MockupPage) => page.html);
    }
  } catch {
    // Try to find JSON in the text
    const jsonMatch = raw.match(/\{[\s\S]*"pages"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.pages && Array.isArray(parsed.pages)) {
          return parsed.pages.map((page: MockupPage) => page.html);
        }
      } catch {
        // Fall through
      }
    }

    // Last resort: try to extract HTML blocks directly
    const htmlBlocks = raw.match(/<!DOCTYPE html>[\s\S]*?<\/html>/gi);
    if (htmlBlocks && htmlBlocks.length > 0) {
      return htmlBlocks;
    }
  }

  // Fallback: return empty array
  return [];
}

export async function generateMockupHtml(
  apiKey: string,
  specMd: string,
  hearingData: HearingData
): Promise<string[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const designContext = `
## デザイン要望
${hearingData.designPreferences ?? "特になし（モダンでクリーンなデザイン）"}

## プラットフォーム
${hearingData.platformTargets?.join(", ") ?? "Web"}

## サービス仕様書
${specMd}
`;

  const result = await model.generateContent([
    MOCKUP_SYSTEM_PROMPT,
    designContext,
  ]);

  const responseText = result.response.text();
  return parseMockupResponse(responseText);
}
