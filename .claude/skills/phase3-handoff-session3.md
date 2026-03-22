# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 Session 3）

作成日: 2026-03-22

---

## コピペして使う引継ぎプロンプト

```
LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 3）

## プロジェクト構成
- バックエンド: ~/logos-laravel（Laravel 12.x + Sanctum）
- フロントエンド: ~/logos-next（Next.js 16.2.0 + TypeScript + Tailwind）
- 本番: さくらサーバー（Laravel）＋ Vercel（Next.js）

## これまでに完了した作業（Session 1〜2）

### Session 1 完了
- F-1: SSR復帰（Route Handlerプロキシ）— lib/proxy-fetch.ts + Route Handler 4本 + トップ・topics/[id] SSR化
- F-2: Custom Hook化 — useTopicPage.ts に state/handler/computed を集約
- Vercel環境変数: API_BASE_URL=https://gs-f04.sakura.ne.jp（NEXT_PUBLIC_なし・All Environments）✅ 設定済み

### Session 2 完了
- B-2: Topic::analyses() リレーション追加（logos-laravel）
- F-3: lib/transforms.ts 作成 — boolean 変換を API 受取口で一元化
- F-4: TopicAnalysis.data を Discriminated Union 化（any → 型安全）

## 今セッションの推奨タスク

### 選択肢A: B-1（専用セッション必須・高コスト）
routes/api.php（1040行・46エンドポイント全クロージャ）→ Controller分割
- 分割先:
  - app/Http/Controllers/Api/PostApiController.php（エビデンス CRUD・いいね・supplement）
  - app/Http/Controllers/Api/CommentApiController.php（コメント・返信 CRUD・いいね）
  - app/Http/Controllers/Api/AnalysisApiController.php（図解ツール CRUD・公開・いいね・supplement）
  - app/Http/Controllers/Api/NotificationApiController.php
  - app/Http/Controllers/Api/ProfileApiController.php
  - app/Http/Controllers/Api/UserApiController.php（likes・bookmarks・analyses）
  - app/Http/Controllers/Api/DashboardApiController.php
- **注意**: 規模が大きいため、1コントローラーずつコミットして段階的に進めること
- **注意**: routes/api.php の Route::apiResource や名前は変えず、クロージャを Controller に移すだけ

### 選択肢B: F-5（中コスト・B-1より先でも可）
SWR 導入でキャッシング・重複リクエスト排除
- 対象: AuthContext の user/me フェッチ（全ページで毎回叩かれている・最も効果高）
- 手順:
  1. npm install swr
  2. AuthContext.tsx を useSWR ベースに書き換え
  3. HomeClient 等の topics fetch も SWR 化（オプション）
- **注意**: useTopicPage の fetchTopic は SSR initialTopic との絡みが複雑なため対象外

## 重要な参照先
- CLAUDE.md（~/logos-next）: ルール・コーディング規則・boolean変換必須
- .claude/skills/phase3-improvements.md: 全改善項目の詳細仕様・完了済みマーク付き
- .claude/skills/api-spec.md: API仕様・認証・エンドポイント一覧
- ~/logos-laravel/.claude/skills/features.md: バックエンド機能仕様

## 環境情報
- ローカル開発: cd ~/logos-laravel && ./vendor/bin/sail up -d && cd ~/logos-next && npm run dev
- adminユーザー: admin@test.com（is_pro・is_admin設定済み）
- git現状: 両リポジトリ main ブランチ最新・origin/main と同期済み

## 開始手順
CLAUDE.md §0「最重要ルール」と .claude/skills/phase3-improvements.md を読んでから
B-1 か F-5 どちらを実施するか確認し、実装計画をまとめてから着手してください。
```
