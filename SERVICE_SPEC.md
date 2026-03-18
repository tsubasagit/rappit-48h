# ラピットくん 48h 無料開発エージェント - サービス仕様書

## 1. サービス概要
- **一言で**: AIエージェントが要件をヒアリングし、48時間以内にWebアプリを無料開発・OSS公開するサービス
- **対象ユーザー**: Webアプリのアイデアを持つ個人・スタートアップ
- **解決する課題**: 開発リソースがない段階でのプロトタイプ構築
- **ステータス**: MVP

## 2. ユーザーロールと権限
| ロール | できること |
|---|---|
| 顧客 | チャットで要件を伝える、設計書を承認/修正依頼、ステータス確認 |
| 管理者（つばさ） | プロジェクト一覧閲覧、ステータス更新、構築・納品 |

## 3. 機能一覧
### MVP（実装済み）
- [x] LP（サービス紹介 + CTA）
- [x] チャットUI（ラピットくんとの対話）
- [x] AIヒアリング（Claude API、3フェーズ）
- [x] SERVICE_SPEC.md 自動生成
- [x] 設計書プレビュー + 承認/修正フロー
- [x] ステータス管理（5段階）
- [x] 48時間カウントダウン表示
- [x] 管理画面（プロジェクト一覧）

### Phase 2以降
- [ ] メール通知（ステータス変更時）
- [ ] Slack通知（spec_approved時）
- [ ] 顧客認証（メールリンク）
- [ ] 48時間自動タイムアウト
- [ ] テンプレートプリセット
- [ ] 完全自動コード生成

## 4. 画面一覧
| 画面 | パス | 対象ロール | 概要 |
|---|---|---|---|
| LP | `/` | 顧客 | サービス紹介、CTA |
| チャット | `/chat/:projectId` | 顧客 | ラピットくんとの対話 |
| ステータス | `/status/:projectId` | 顧客 | 進捗確認、48hタイマー |
| 管理画面 | `/admin` | 管理者 | プロジェクト一覧 |

## 5. データモデル
### `projects`
- プロジェクトの状態管理
- 主要フィールド: status(string), name(string), description(string), specMarkdown(string), revisionCount(number), createdAt(number), approvedAt(number), githubUrl(string), deployUrl(string)

### `conversations`
- 会話履歴の保存
- 主要フィールド: messages(array), phase(string), turnCount(number)

## 6. 外部連携
- **認証**: なし（URLトークンベース）
- **DB**: Firestore
- **AI**: Claude API (claude-sonnet-4-20250514)
- **ホスティング**: Firebase Hosting

## 7. ビジネスルール
- ステータス遷移: hearing → spec_review → spec_approved → building → delivered
- 設計書の修正は最大3回まで
- 48時間カウントは spec_approved からスタート
- 成果物はGitHubでパブリック公開が条件

## 8. 非機能要件
- **想定ユーザー数**: 初期10件/月
- **パフォーマンス**: チャット応答5秒以内
- **セキュリティ**: Firestore直接書き込み禁止、Cloud Functions経由のみ

## 9. 技術スタック
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS
- Backend: Firebase Cloud Functions (Node.js 22)
- DB: Firestore
- AI: @anthropic-ai/sdk
- Hosting: Firebase Hosting
- Icons: lucide-react

## 10. 更新履歴
| 日付 | 内容 |
|---|---|
| 2026-03-18 | MVP 初版作成 |
