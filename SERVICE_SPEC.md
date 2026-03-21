# SERVICE_SPEC.md — rabit48

## 1. サービス概要

| 項目 | 内容 |
|---|---|
| サービス名 | rabit48 |
| タグライン | 48分でAIエージェント開発を体験する |
| 対象ユーザー | AIでアプリを作りたい非エンジニア・スタートアップ・中小企業 |
| 解決する課題 | AIエージェントの使い方がわからない問題を、ガイド付き体験で解決 |
| ポジション | DXBoost研修へのファネル入口（無料/低価格の体験ツール） |
| ステータス | プロトタイプ開発中 |

## 2. 戦略的位置づけ

```
rabit48 (無料/低価格)          DXBoost (35万/人, 助成金後10.5万)
「AIエージェント開発を体験」 →  「60時間でマスター」
                                      ↓
                            プロトタイプ開発 (50-200万)
                            「チームでは難しい部分をATHが」
                                      ↓
                            IT人材紹介 (年収30%)
                            「自走できる人材を採用」
```

## 3. ユーザーロールと権限

| ロール | 権限 |
|---|---|
| ユーザー（顧客） | ガイドセッション参加、テンプレートダウンロード、DXBoost情報閲覧 |
| Proユーザー（将来） | 無制限セッション、テンプレート集、コミュニティアクセス |
| 管理者（将来） | 全プロジェクト閲覧、ユーザー管理、コンバージョン計測 |

## 4. 機能一覧

### 実装済み（MVP）
- Firebase Auth（Google OAuth）によるログイン
- プロジェクト作成・一覧表示
- AIガイドセッション（8フェーズ）:
  1. 課題定義の**やり方**を学ぶ
  2. ペルソナ設計の**考え方**を学ぶ
  3. MoSCoW法で機能を**一緒に分類**する
  4. AIでUIを作る**方法**を知る
  5. 技術選定の**判断基準**を学ぶ
  6. 学んだことの**振り返り**
  7. SERVICE_SPEC.mdとAI開発ツールの**使い方**を学ぶ
  8. さらに学ぶための**次のステップ**（DXBoost CTA）
- SERVICE_SPEC.md 自動生成
- HTMLモックアップ自動生成
- ランディングページ

### 将来
- スターターキット（テンプレート集）ダウンロード機能
- Stripe課金（Pro: 2,980-4,980円/月）
- DXBoost受講生への自動Pro権限付与
- コミュニティ機能
- 管理者ダッシュボード（コンバージョン計測）

## 5. 収益モデル

| Tier | 価格 | 内容 |
|---|---|---|
| Free | 0円 | 1回のガイド付きセッション + 基本スターターキット |
| Pro | 2,980-4,980円/月 | 無制限セッション、テンプレート集、コミュニティ |
| DXBoost連携 | DXBoost受講費に含む | 全DXBoost受講生にPro権限付与 |

## 6. 画面一覧

| 画面 | パス | 権限 | 説明 |
|---|---|---|---|
| ランディング | `/` | 公開 | サービス紹介・CTA |
| ログイン | `/login` | 公開 | Google OAuth ログイン |
| ダッシュボード | `/dashboard` | 認証済 | プロジェクト一覧 |
| 新規プロジェクト | `/new` | 認証済 | プロジェクト作成フォーム |
| チャット | `/project/:id/chat` | 認証済 | AIガイドセッション（8フェーズ） |
| 仕様書レビュー | `/project/:id/spec` | 認証済 | 生成された仕様書の確認・フィードバック |
| モックプレビュー | `/project/:id/mockup` | 認証済 | 生成されたモックの確認 |

## 7. データモデル

### users/{userId}
| フィールド | 型 | 説明 |
|---|---|---|
| email | string | メールアドレス |
| displayName | string | 表示名 |
| photoURL | string | アバターURL |
| createdAt | timestamp | 作成日時 |

### projects/{projectId}
| フィールド | 型 | 説明 |
|---|---|---|
| userId | string | オーナーUID |
| title | string | プロジェクト名 |
| status | string | hearing/generating/reviewing/approved/implementing/completed |
| hearingPhase | string | problem/users/features/design/tech/confirm/build_together/next_steps |
| hearingData | map | 構造化された収集データ |
| serviceSpecMd | string | 生成されたSERVICE_SPEC.md |
| mockupUrls | array | モックアップURL一覧 |
| startedAt | timestamp | 開始日時 |
| deadline | timestamp | 期限 |
| createdAt | timestamp | 作成日時 |
| updatedAt | timestamp | 更新日時 |

### projects/{projectId}/messages/{messageId}
| フィールド | 型 | 説明 |
|---|---|---|
| role | string | user/assistant/system |
| content | string | メッセージ本文 |
| metadata | map | フェーズ情報・抽出データ |
| createdAt | timestamp | 作成日時 |

## 8. 外部連携

| サービス | 用途 |
|---|---|
| Firebase Auth | 認証（Google OAuth） |
| Firestore | データベース |
| Firebase Functions | APIバックエンド |
| Firebase Hosting | フロントエンドホスティング |
| Gemini API | AIガイドセッション・仕様書生成・モック生成 |

## 9. ビジネスルール

- ガイドセッションは8フェーズを順に進行（スキップ不可）
- 各フェーズは教育的な対話を通じて情報を収集する
- Phase 7（build_together）でSERVICE_SPEC.mdの作成方法を教育
- Phase 8（next_steps）でDXBoost/StartPassへの導線を提示
- 仕様書はフィードバックにより再生成可能
- プロジェクトデータはオーナーのみアクセス可

## 10. 非機能要件

- レスポンス: AI応答は10秒以内
- セキュリティ: Gemini APIキーはFunctions経由（クライアント非公開）
- 対応ブラウザ: Chrome, Safari, Edge 最新版

## 11. 既知の課題・制限

- オフライン対応なし
- ファイルアップロード未対応
- 複数ユーザーでの同時編集未対応
- スターターキットのダウンロード機能は未実装

## 12. 更新履歴

| 日付 | 内容 |
|---|---|
| 2026-03-20 | 初版作成（MVP仕様） |
| 2026-03-21 | 戦略ピボット: 「AIが作る」→「AIの使い方を教える」に変更。Phase 7-8追加、教育型プロンプト導入、DXBoostファネル設計 |
