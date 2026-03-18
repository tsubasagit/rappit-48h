# CLAUDE.md — ラピットくん 48h 無料開発エージェント

## プロジェクト構成

```
rappit_48h/
├── dashboard/          # LP + チャットUI (React + Vite + Tailwind)
│   └── src/
│       ├── pages/      # Landing, Chat, ProjectStatus, Admin
│       ├── components/ # ChatMessage, ChatInput, SpecPreview, Timer
│       └── lib/        # firebase.ts
├── functions/          # Cloud Functions
│   └── src/
│       ├── index.ts           # エンドポイント定義
│       ├── chat-agent.ts      # ヒアリングエージェント
│       └── spec-generator.ts  # 設計書生成
├── firebase.json
├── firestore.rules
└── SERVICE_SPEC.md
```

## コマンド

```bash
# Dashboard
cd dashboard && npm run dev      # 開発サーバー
cd dashboard && npm run build    # ビルド

# Functions
cd functions && npm run build    # TypeScript コンパイル
cd functions && npm run serve    # エミュレータ起動

# デプロイ
npm run deploy                   # 全体デプロイ
npm run deploy:hosting           # Hosting のみ
npm run deploy:functions         # Functions のみ
```

## 環境変数

### functions/.env
```
ANTHROPIC_API_KEY=sk-ant-...
```

### dashboard/.env
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Firebase プロジェクト
- プロジェクトID: `rappit-48h`
- リージョン: `asia-northeast1`

## Firestore ステータス遷移
```
hearing → spec_review → spec_approved → building → delivered
```

## Cloud Functions エンドポイント
| エンドポイント | メソッド | 用途 |
|---|---|---|
| `createProject` | POST | プロジェクト新規作成 |
| `getMessages` | GET | 会話履歴取得 |
| `chat` | POST | ヒアリングチャット |
| `approveSpec` | POST | 設計書承認 |
| `updateStatus` | POST | ステータス更新（管理者用） |
