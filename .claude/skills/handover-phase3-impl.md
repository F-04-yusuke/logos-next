# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善実装）

## セッション開始前の必須手順

1. **メモリを読み込む:**
   - `/home/tasaki/.claude/projects/-home-tasaki-logos-next/memory/MEMORY.md`（インデックス）
   - `project_phase3_plan.md`（Phase 3 改善計画の要点）
   - `feedback_*.md`（作業ルール・フィードバック全件）

2. **スキルファイルを読む（必須）:**
   - `~/logos-next/.claude/skills/phase3-improvements.md` — **今セッションのメイン作業計画**（優先度・実装方針・コード例が全て入っている）
   - `~/logos-next/.claude/skills/progress.md` — 最新進捗・Gitタグ履歴・Phase 3 開始セクション
   - `~/logos-next/.claude/skills/deploy-config.md` — SSR障害の経緯（F-1実装前に必読）

3. **実装前に必ず Blade ファイルを読む**（`design-spec.md` の対応表参照）
   - ただし今セッションの改善は機能変更を伴わないため、Blade との差分確認より型・構造の確認が中心

---

## プロジェクト現状（2026-03-22時点）

- **Phase 2 完全完了**（Gitタグ: `v2.0-phase2-complete`）
- **Phase 3 開始済み**（Gitタグ: `v3.0-phase3-start`）
- **リポジトリ一本化完了:**
  - 旧 logos-new（~/logos）→ **logos-laravel（~/logos-laravel）** にリネーム済み
  - 編集制約撤廃: `app/Models/` 含む全ファイルが自由に編集可能
  - さくらサーバーフォルダは `~/www/logos` のまま（Apache .htaccess 参照のため意図的に変更せず）
- **リポジトリ:**
  - `~/logos-laravel`（Laravel バックエンド・さくら本番・全ファイル編集可）
  - `~/logos-next`（Next.js フロントエンド・Vercel デプロイ）

---

## 最重要ルール（Phase 3 更新版）

- logos-laravel（`~/logos-laravel`）は **全ファイル自由に編集可**（2ファイル縛り撤廃済み）
- `migrate:fresh`・`db:wipe`・`migrate:rollback`・`sqlite切り替え` は**絶対に実行しない**
- 一度に編集するファイルは **5ファイル以内**
- さくら本番への変更は GitHub Actions 経由（SSH直接編集禁止）
- GeminiのAPIキーに `NEXT_PUBLIC_` をつけない
- **git履歴に `logos-new` `~/logos` が残るが現在の実態は `~/logos-laravel`（正常）**

---

## Phase 3 作業内容（今セッションの目的）

詳細は `~/logos-next/.claude/skills/phase3-improvements.md` を参照。

### 優先順位（推奨着手順）

**ステップ1: F-1 — SSR復帰（Route Handler プロキシ）** ← 最優先・最大インパクト
- `app/api/` に Route Handler を作成してさくら API のプロキシとして機能させる
- タイムアウト問題の根本解決（Vercel サーバー内部完結になる）
- 完了後: `"use client"` を外して Server Component に段階移行
- 最初はトップ（`/`）とトピック詳細（`/topics/[id]`）から

**ステップ2: B-1 — routes/api.php コントローラー分割**
- 1040行のクロージャを機能別 ApiController に移行
- PostApiController → CommentApiController → AnalysisApiController の順

**ステップ3: F-2 — Custom Hook化**
- `topics/[id]/page.tsx`（1004行・useState 17個）を `useTopicPage` 等に分離

**ステップ4以降: 中優先項目**
- B-2: Topic::analyses() リレーション追加
- F-3: boolean 型変換レイヤー
- F-4: 分析型 Discriminated Union
- F-5: SWR / React Query 導入

---

## 着手前の確認コマンド

```bash
# Laravel 起動確認
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js 起動確認
cd ~/logos-next && npm run dev

# さくら API 疎通確認
curl https://gs-f04.sakura.ne.jp/api/topics | head -c 100

# ビルド確認（push前に必須）
cd ~/logos-next && npm run build
```

---

## 重要な注意事項

- **今回の改善はLOGOSの機能・思想・UIデザインに影響しない純粋な技術改善**
- ユーザーから見える変化は「表示が速くなった（SSR）」のみ
- 各ステップでビルド確認・API疎通確認を必ず実施してからコミット
- F-1（SSR）は deploy-config.md の障害記録を熟読してから着手すること
