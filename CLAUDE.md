# LOGOS フロントエンド仕様書（logos-next）
最終更新: 2026-03-23（Session 17 / Phase 4 UI/UX改善 Geminiカラー・フォント・タイポグラフィ統一 完了）

---

# 0. 最重要ルール

## リポジトリの役割
| リポジトリ | 役割 | 触っていいか |
|---|---|---|
| logos-laravel（~/logos-laravel） | Laravel バックエンド・さくら本番 | **自由に編集可**（さくら本番への影響に注意してコミットすること） |
| logos-next（~/logos-next） | Next.js フロントエンド | **ここだけ編集する** |

## UI/UX の鉄則（違反厳禁）
- 実装前に必ず `~/logos-laravel/resources/views/[該当ファイル]` を読む（`design-spec.md` に Blade ファイル対応表あり）
- **読まずに実装禁止**。Blade に存在する機能を勝手に削除・省略・簡略化しない
- ビルド成功だけで完了としない。Blade との機能差分を必ず確認する
- 実装前に以下も必読:
  - `~/logos-laravel/.claude/skills/features.md` — コア機能仕様・返信制限・補足ルール
  - `~/logos-laravel/.claude/skills/security.md` — セキュリティ・コーディングルール・UI トンマナ

## コーディング必須ルール
- LaravelのAPIはboolean値を `0/1` で返す → JSXでは必ず `!!` 変換すること
  - 正しい: `{!!user.is_admin && <Link>}`
  - バグ: `{user.is_admin && <Link>}` ← 0がテキスト表示される
- 一度に編集するファイルは **5ファイル以内**
- **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**（ブラウザに公開され攻撃者に悪用される）
  - Next.js から Gemini を呼ぶ場合は必ずサーバーサイド経由（`app/api/` ルートハンドラか Laravel API 経由）
- `migrate:fresh`・`db:wipe` 等は**絶対に実行しない**

## ローカル環境の停止手順（厳守）
**PC終了・WSL再起動・`wsl --shutdown` の前に必ず実行すること:**
```bash
cd ~/logos-laravel && ./vendor/bin/sail down
```
**理由（2026-03-23 の教訓）:** WSL2シャットダウン時にMySQLコンテナが強制終了されDBデータが消失した。`sail down` で安全に停止してからWSL2を終了すれば防げる。さくら本番・Vercelには影響しないがローカルのテストデータが全消えする。
- `sail down` はボリュームを削除しない（データ保持）
- `sail down -v` は**絶対に実行しない**（ボリューム＝全データ削除）

---

# 1. システム概要

- フロント: Next.js 16.2.0 + TypeScript + Tailwind CSS + shadcn/ui → Vercel
- バックエンド API: https://gs-f04.sakura.ne.jp（Laravel 12.x + Sanctum）
- ローカル API: http://localhost（Laravel Sail起動が必須）
- admin ユーザー: admin@test.com（is_pro・is_admin 設定済み）

## 起動手順
```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d   # 先にLaravelを起動
cd ~/logos-next && npm run dev                   # Next.js起動
# http://localhost:3000 で確認
```

---

# 2. 開発体制

**Claude Code がリードエンジニアとしてメインで動く。**

| 役割 | 担当 |
|---|---|
| コード実装・ファイル編集・git操作・技術的検証（ビルド・curl等） | Claude Code |
| ブラウザで判断が必要な視覚的レビュー（スクショ・UIデザイン確認） | AIチャット（claude.ai） |
| ブラウザ確認・スクショ撮影 | ユーザー |

- 大きな方針転換があった場合は必ず CLAUDE.md に追記してから実装する

## 検証方針（ブラウザ確認を求める前に Claude Code で自己完結）

| 検証種別 | Claude Code の手段 | ブラウザ必要か |
|---|---|---|
| ビルド・型エラー | `npm run build` / `npx tsc --noEmit` | 不要 |
| APIレスポンス構造 | `curl` + Bearer トークン | 不要 |
| ページネーション動作 | tinker でテストデータ作成 → curl 複数ページ確認 → クリーンアップ | 不要 |
| DB操作・マイグレーション | `php artisan tinker` / `migrate` | 不要 |
| ルート登録確認 | `php artisan route:list` | 不要 |
| コード構造・ロジック検証 | コードレビュー（Grep・Read） | 不要 |
| 視覚的UIデザイン・レイアウト | — | **必要**（ユーザーまたは AIチャット） |
| 認証フロー・画面遷移の視覚確認 | — | **必要**（ユーザー） |

**tinker 活用パターン（例）:**
```bash
# テストデータ作成
docker exec logos-laravel.test-1 php artisan tinker --execute="..."
# curl で確認
curl -s "http://localhost/api/xxx?page=2" -H "Authorization: Bearer TOKEN" ...
# クリーンアップ（必ずやる）
docker exec logos-laravel.test-1 php artisan tinker --execute="Model::where(...)->delete();"
```

---

# 3. 現在の実装状態

## 実装済みページ（全17ページ・Phase 2完了）

| パス | 説明 |
|---|---|
| `/` | トピック一覧（SSR） |
| `/login` | ログイン |
| `/register` | ユーザー登録 |
| `/categories` | カテゴリ（admin: CRUD / 一般: 一覧） |
| `/category-list` | カテゴリ公開一覧 |
| `/topics/create` | トピック作成（PRO限定） |
| `/topics/[id]` | トピック詳細（3タブ・投稿・コメント・いいね・ブックマーク） |
| `/topics/[id]/edit` | トピック編集（PRO作成者限定） |
| `/analyses/[id]` | 分析スタンドアロン閲覧（tree/matrix/swot/image 全4タイプ対応） |
| `/notifications` | 通知一覧 |
| `/likes` | 参考になった一覧 |
| `/dashboard` | ダッシュボード（5タブ: 投稿/下書き/コメント/分析/トピック） |
| `/profile` | プロフィール編集（アバター・名前クールダウン・パスワード変更・アカウント削除） |
| `/history` | 閲覧履歴（日付グループ・YouTube風ラベル・ページネーション） |
| `/tools/tree` | ロジックツリー作成（PRO限定・AIアシスタント・Gemini連携） |
| `/tools/matrix` | 総合評価表作成（PRO限定・AIアシスタント・Gemini連携） |
| `/tools/swot` | SWOT/PEST分析作成（PRO限定・AIアシスタント・Gemini連携） |

## 現在のタグ
- logos-next: `v4.6-session17-gemini-typography`
- logos-laravel: `v4.0-p4-custom-thumbnail`

## Phase 2 未対応・将来検討項目

| 項目 | 見送り理由 | 将来方針 |
|---|---|---|
| パスワードリセット | Bladeのloginにもリンクなし・API未追加 | Phase 4以降でSMTP設定と合わせて検討 |
| メール認証 | MustVerifyEmail がコメントアウト中 | 本人確認強化フェーズで有効化検討 |
| パスワード確認 | Sanctum APIトークンフローでは現在不要 | 高セキュリティ操作UX改善時に検討 |
| 分析タイトル編集 | /tools/[type]?edit=[id] でフル編集可 | 現状の実装で十分 |

---

# 4. スキルファイル（詳細参照先）

## logos-next（本リポジトリ）

| ファイル | 内容 |
|---|---|
| `.claude/skills/api-spec.md` | API全仕様・認証・エンドポイント・boolean注意・型定義 |
| `.claude/skills/design-spec.md` | デザイン・カラー・レスポンシブ・a11y・Blade対応表（全ページ） |
| `.claude/skills/directory-map.md` | ディレクトリ構成・実装済みページ一覧 |
| `.claude/skills/deploy-config.md` | Vercel設定・環境変数ルール・CSR/SSR障害記録 |
| `.claude/skills/progress-roadmap.md` | プロジェクト理念・フェーズ定義・全ロードマップ・Gitタグ履歴（両リポジトリ） |
| `.claude/skills/progress-phase1.md` | Phase 1 完了記録（Laravel Blade版MVP）・障害教訓 |
| `.claude/skills/progress-phase2.md` | Phase 2 完了記録（Next.js移行・全17ページ・Step1〜14） |
| `.claude/skills/progress-phase3.md` | Phase 3 完了記録（技術改善 B-1〜B-6 / F-1〜F-7）・技術的負債 |
| `.claude/skills/progress-phase4.md` | Phase 4 進行中記録（UI/UX改善・Session 12〜） |
| `.claude/skills/handoff-session18.md` | **最新引継ぎプロンプト** |
| `.claude/skills/handoff-archive/` | 過去セッション引継ぎ（Session 6〜16 アーカイブ） |

## logos-laravel（バックエンド・必要に応じて参照）

| ファイル | 内容 |
|---|---|
| `~/logos-laravel/.claude/skills/features.md` | コア機能仕様・返信制限・補足ルール・コントローラー一覧 |
| `~/logos-laravel/.claude/skills/security.md` | セキュリティ・コーディングルール・UIトンマナ詳細（全14ルール） |
| `~/logos-laravel/.claude/skills/pro-tools.md` | PRO機能・分析ツール・通知・決済方針・外部API連携 |
| `~/logos-laravel/.claude/skills/infra.md` | さくら本番環境・SSH・デプロイフロー・ローカル開発・障害教訓 |
| `~/logos-laravel/.claude/skills/directory-map.md` | ディレクトリ構成・Bladeファイル一覧 |
| `~/logos-laravel/.claude/skills/roadmap.md` | フェーズ計画・将来構想（詳細進捗は本リポジトリの progress-*.md 参照） |
