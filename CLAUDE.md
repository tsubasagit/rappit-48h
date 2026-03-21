# CLAUDE.md — rabit48

## Overview

rabit48 は「AIエージェント開発を体験する」教育型SaaS。ラピットくん（AIガイド）との対話を通じて、課題定義・ペルソナ設計・機能設計・技術選定のプロセスを学びながら、SERVICE_SPEC.mdの作り方やAIエージェントへの指示の出し方を習得する。DXBoost研修へのファネル入口として機能。

## Tech Stack

| レイヤー | 技術 |
|---|---|
| Frontend | Vite + React 18 + TypeScript + React Router v6 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| State | Zustand（チャットUI状態） |
| Auth | Firebase Auth（Google OAuth） |
| DB | Firestore |
| AI | Gemini API via Firebase Functions |
| Hosting | Firebase Hosting |

## Directory Structure

```
rabit48/
├── src/
│   ├── App.tsx, main.tsx, app.css
│   ├── components/
│   │   ├── Layout.tsx, Sidebar.tsx, ProtectedRoute.tsx
│   │   ├── ui/       (Button, Card, Badge, LoadingSpinner, Avatar)
│   │   ├── chat/     (ChatContainer, ChatMessage, ChatInput, PhaseIndicator, TypingIndicator)
│   │   ├── project/  (ProjectCard, StatusBadge, CountdownTimer)
│   │   ├── spec/     (SpecViewer, SpecFeedback)
│   │   ├── mockup/   (MockupPreview, MockupGallery)
│   │   └── landing/  (Hero, Features, HowItWorks, Footer)
│   ├── pages/        (Landing, Login, Dashboard, NewProject, Chat, SpecReview, MockupPreview)
│   ├── hooks/        (useAuth, useProject, useProjects, useMessages, useCountdown)
│   ├── stores/       (useChatStore.ts)
│   ├── contexts/     (AuthContext.tsx)
│   ├── lib/          (firebase.ts, firestore.ts, api.ts)
│   └── types/        (index.ts)
├── functions/
│   └── src/          (index.ts, config.ts, gemini-agent.ts, spec-generator.ts, mockup-generator.ts, types.ts)
├── firebase.json, firestore.rules, .firebaserc
├── package.json, vite.config.ts, tsconfig*.json
├── SERVICE_SPEC.md, CLAUDE.md
└── public/rabit48.svg
```

## Commands

```bash
npm install          # 依存関係インストール
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド

cd functions
npm install          # Functions依存関係
npm run build        # Functions TypeScriptビルド
npm run deploy       # Functionsデプロイ
```

## Environment Variables

`.env` ファイルに以下を設定:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Functions用:
```bash
firebase functions:secrets:set GEMINI_API_KEY
```

## Key Patterns

- **Firestore リアルタイム**: hooks が `onSnapshot` でリアルタイム購読
- **Phase-based AI**: 8フェーズのステートマシンで教育型ガイドセッションを進行（problem→users→features→design→tech→confirm→build_together→next_steps）
- **Gemini JSON出力**: Functions経由でGeminiを呼び出し、構造化JSONで応答を受け取る
- **APIキー秘匿**: Gemini APIキーはFunctions内のみ（クライアント非公開）

## Rules

- コードは TypeScript を使用
- コンポーネントは named export
- カスタムカラーは `rabit-*`（紫）と `accent-*`（オレンジ）
- Firebase Functionsのリージョンは `asia-northeast1`
