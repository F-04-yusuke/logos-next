# LOGOS フロントエンド仕様書（logos-next）
最終更新: 2026-03-21

---

# 0. 最重要ルール

## リポジトリの役割
| リポジトリ | 役割 | 触っていいか |
|---|---|---|
| logos-new（~/logos） | Laravel Blade版・さくら本番・参照専用 | **絶対に編集・push禁止**（例外: TopicApiController.php, routes/api.php のみ） |
| logos-next（~/logos-next） | Next.jsフロントエンド | **ここだけ編集する** |

## UI/UXの鉄則
- 実装前に必ず `~/logos/resources/views/[該当ファイル]` を読む（`.claude/skills/design-spec.md` にBladeファイル対応表あり）
- 読まずに実装禁止。勝手なデザイン変更・簡略化・削除禁止
- ビルド成功だけで完了としない

## コーディング必須ルール
- LaravelのAPIはboolean値を `0/1` で返す → JSXでは必ず `!!` 変換すること
  - 正しい: `{!!user.is_admin && <Link>}`
  - バグ: `{user.is_admin && <Link>}` ← 0がテキスト表示される
- 一度に編集するファイルは **5ファイル以内**

---

# 1. システム概要

- フロント: Next.js 16.2.0 + TypeScript + Tailwind CSS + shadcn/ui → Vercel
- バックエンド API: https://gs-f04.sakura.ne.jp（Laravel 12.x + Sanctum）
- ローカル API: http://localhost（Laravel Sail起動が必須）
- adminユーザー: admin@test.com（is_pro・is_admin設定済み）

## 起動手順
```bash
cd ~/logos && ./vendor/bin/sail up -d   # 先にLaravelを起動
cd ~/logos-next && npm run dev           # Next.js起動
# http://localhost:3000 で確認
```

---

# 2. 開発体制（2026-03-21更新）

**Claude Codeがリードエンジニアとしてメインで動く。**

| 役割 | 担当 |
|---|---|
| コード実装・ファイル編集・git操作・技術的検証（ビルド・curl等） | Claude Code |
| ブラウザで判断が必要な視覚的レビュー（スクショ・UIデザイン確認） | AIチャット（claude.ai）|
| ブラウザ確認・スクショ撮影 | ユーザー |

- ブラウザ確認はユーザーが行う。視覚的レビューが必要な時は `/teleport` を使う
- 技術検証（ビルド・curl・型チェック）はClaude Codeが自己完結する
- 大きな方針転換があった場合は必ずCLAUDE.mdに追記してから実装する

---

# 3. 現在のタスク

## 実装済みページ
- `/` — トピック一覧
- `/login` — ログイン
- `/register` — ユーザー登録 ✅
- `/categories` — カテゴリ（admin: CRUD / 一般: 一覧）✅
- `/category-list` — カテゴリ公開一覧 ✅
- `/topics/create` — トピック作成（PRO限定）✅
- `/topics/[id]` — トピック詳細（3タブ・投稿・コメント・いいね・ブックマーク）✅
- `/notifications` — 通知一覧 ✅
- `/likes` — 参考になった一覧 ✅
- `/dashboard` — ダッシュボード（5タブ・投稿/下書き/コメント/分析/トピック）✅

## 未実装ページ（実装優先順）
1. `/profile` — プロフィール編集（Blade: `resources/views/profile/edit.blade.php`）
3. `/history` — 閲覧履歴（Blade: `resources/views/history/index.blade.php`）
4. `/tools/tree` `/tools/matrix` `/tools/swot` — 分析ツール（PRO限定）

## Vercel手動設定（未完了・ユーザーが行う）
- 環境変数 `NEXT_PUBLIC_API_BASE_URL=https://gs-f04.sakura.ne.jp` をVercelダッシュボードで設定

---

# 4. スキルファイル（詳細参照先）

詳細仕様は必要に応じて以下を読むこと:

| ファイル | 内容 |
|---|---|
| `.claude/skills/api-spec.md` | API全仕様・認証・エンドポイント・boolean注意・型定義 |
| `.claude/skills/design-spec.md` | デザイン・カラー・レスポンシブ・a11y・Blade対応表（全ページ） |
| `.claude/skills/directory-map.md` | ディレクトリ構成・未実装ページ一覧・将来構想 |
| `.claude/skills/deploy-config.md` | Vercel設定・環境変数ルール・CSR/SSR障害記録 |
| `.claude/skills/progress.md` | 進捗・完了済みステップ・Gitタグ履歴 |
