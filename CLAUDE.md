# LOGOS フロントエンド仕様書（logos-next）
最終更新: 2026-04-02（Session 48 / 分析スタンドアロン・SWOT/Matrixバグ修正）

---

# 0. 最重要ルール

## リポジトリの役割
| リポジトリ | 役割 | 触っていいか |
|---|---|---|
| logos-laravel（~/logos-laravel） | Laravel バックエンド・さくら本番 | **自由に編集可**（さくら本番への影響に注意してコミットすること） |
| logos-next（~/logos-next） | Next.js フロントエンド | **ここだけ編集する** |

## UI/UX の鉄則（違反厳禁）
- **機能追加・ロジック変更・新規ページ移植時**: 実装前に必ず `~/logos-laravel/resources/views/[該当ファイル]` を読む（`design-spec.md` に Blade ファイル対応表あり）
- **UIデザインのみの変更（色・ホバー・ボーダー・スペーシング等）**: Blade 参照は不要
- **読まずに実装禁止**（機能追加・移植時）。Blade に存在する機能を勝手に削除・省略・簡略化しない
- ビルド成功だけで完了としない。Blade との機能差分を必ず確認する
- 実装前に以下も必読:
  - `~/logos-laravel/.claude/skills/features.md` — コア機能仕様・返信制限・補足ルール
  - `~/logos-laravel/.claude/skills/security.md` — セキュリティ・コーディングルール・UI トンマナ

## トピックページが UI 基準（Session 20 確立）
**`app/topics/[id]/` が全ページの UI デザイン基準。他ページ改修時は必ずここに準拠すること。**
- カード背景・ホバー・アライメント（-ml-3 pl-3）・セレクトスタイル・ボタンスタイル・テキストサイズ等のルールは `.claude/skills/design-spec.md` の「トピックページ UI ルール」セクションを参照すること
- **ホームページ（トピック一覧）・カテゴリ一覧の背景色はヘッダーに合わせる必要なし**（現状満足済み・変更不要）
- ダッシュボード・その他ページを改修する際は design-spec.md のルールに従って順次統一していく

## Git タグ付けルール（厳守）

**コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと。**
（「前の回答でタグを打ったから今回は不要」は誤り。回答ごとに毎回打つ）

```bash
# 形式: v{major}.{minor}-session{N}-before-{作業内容}
git tag v6.50-session41-before-xxx && git push origin v6.50-session41-before-xxx
```

- タグを打つタイミング: **コード編集・ファイル変更を始める前**（ユーザーに指示されなくても自律的に実行する）
- **1回答＝1タグ**（コードを変更するすべての回答でタグが必要。コミットごとには打たない）
- `docs:` のみのコミット（引継ぎ・CLAUDE.md更新）はタグ不要
- タグ名は作業内容が分かる英語で（例: `before-avatar-fix`・`before-tab-border-fix`）
- **違反した場合**: その回答は出戻りが困難になる。コンテキストが増えると自動で見えなくなり再現不可能になるためタグが唯一の復元手段

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

## 本番テストデータ投入ルール（Session 29 策定）

本番DBにテストデータを入れる場合は **必ず Seeder を使うこと**。`/tmp/*.php` を直接流し込む方法は避ける。

```bash
# Seeder作成（ローカル）→ git push → 本番適用
ssh gs-f04@gs-f04.sakura.ne.jp 'cd ~/www/logos && php artisan db:seed --class=TestDataSeeder --force'
```

詳細手順・さくらサーバー（csh）でのPHPスクリプト実行方法・主要テーブルのカラム名早見表は
`~/logos-laravel/.claude/skills/infra.md` の「2026-03-25 Session 29 本番テストデータ投入の教訓」セクション参照。

## Next.js の .next キャッシュ起因の hydration エラー（Session 24 の教訓）
**症状:** コンポーネントのクラス名変更後にブラウザコンソールで hydration mismatch エラーが出る。
**原因:** `.next` ディレクトリが古いサーバーレンダリング結果をキャッシュしており、新しいクライアントコードと食い違う。
**対処:** `cd ~/logos-next && rm -rf .next && npm run dev` でキャッシュを削除して再起動する。

## 豪華要素デザインルール（Session 24 策定）
UIを改修・新規ページを作成する際は **`.claude/skills/design-spec.md` の「豪華要素ルール」セクション**を必ず参照すること。
ホバー速度・ホバー色・カテゴリバッジ・アクセントバー・スケルトンの具体的なクラス値が定義されている。数値を勝手に変えない。

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

## 実装済みページ（全18ページ・Phase 4 Session 23追加）

| パス | 説明 |
|---|---|
| `/` | トピック一覧（SSR） |
| `/login` | ログイン |
| `/register` | ユーザー登録 |
| `/categories` | カテゴリ（admin: CRUD / 一般: 一覧） |
| `/categories/[id]` | カテゴリ別トピック一覧（大分類・中分類対応・SSR初期データ+CSRカテゴリ名解決） |
| `/category-list` | カテゴリ公開一覧（大分類・中分類リンク → /categories/[id]）【SSR・Session 38】 |
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
- logos-next: `v6.83-session48-before-analysiscard-matrix-fix`（Session 48 最終タグ）
- logos-laravel: `v4.4-session31-liked-by-me`（Session 48 は変更なし）

## /categories/[id] の実装上の注意（Session 23 技術的負債）

`app/categories/[id]/page.tsx` はトピック初期データのみ SSR で取得し、
カテゴリ名（大分類・中分類）の解決は `CategoryTopicsClient` の `useEffect` でクライアント側が担う。

**理由:** Server Component から `http://localhost/api/categories` を fetch すると
中分類の検索ロジックが null を返す不具合が確認された（原因不明・Node.js 単体では正常動作）。

**将来の改善方針:** httpOnly Cookie 認証導入後に SSR 化を検討。
または Next.js の Route Segment Config（`export const dynamic = 'force-dynamic'`）や
`unstable_noStore` を試して SSR fetch の安定化を図る。

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
| `.claude/skills/progress-phase4.md` | Phase 4 進行中記録（UI/UX改善・Session 20〜） |
| `.claude/skills/progress-phase4-s12-s19.md` | Phase 4 アーカイブ（Session 12〜19・早期UI改善記録） |
| `.claude/skills/handoff-session49.md` | **最新引継ぎプロンプト**（Session 49用） |
| `.claude/skills/handoff-archive/` | 過去セッション引継ぎ（Session 6〜42 アーカイブ） |

## logos-laravel（バックエンド・必要に応じて参照）

| ファイル | 内容 |
|---|---|
| `~/logos-laravel/.claude/skills/features.md` | コア機能仕様・返信制限・補足ルール・コントローラー一覧 |
| `~/logos-laravel/.claude/skills/security.md` | セキュリティ・コーディングルール・UIトンマナ詳細（全14ルール） |
| `~/logos-laravel/.claude/skills/pro-tools.md` | PRO機能・分析ツール・通知・決済方針・外部API連携 |
| `~/logos-laravel/.claude/skills/infra.md` | さくら本番環境・SSH・デプロイフロー・ローカル開発・障害教訓 |
| `~/logos-laravel/.claude/skills/directory-map.md` | ディレクトリ構成・Bladeファイル一覧 |
| `~/logos-laravel/.claude/skills/roadmap.md` | フェーズ計画・将来構想（詳細進捗は本リポジトリの progress-*.md 参照） |
