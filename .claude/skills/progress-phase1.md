# Phase 1 完了記録：MVPの磨き込み（Laravel Blade版）

完了日: 2026-03-19
Gitタグ (logos-laravel): `v1.0-phase1-complete`

---

## フェーズの目的

Laravel Breeze ベースで構築した Blade 版 LOGOS を「MVP として本番公開できる水準」まで仕上げる。
UI/UX の品質向上・バリデーション強化・テスト実装・CI/CD 構築・本番デプロイが主なスコープ。

---

## 完了済み項目

### UI/UX

- **モーダルのフォームリセット（`$watch`）**: 投稿モーダルを閉じると Alpine.js の `$watch` でフォームを自動リセット
- **下書きUIブラッシュアップ**: 下書き保存時は OGP スクレイピング・通知をスキップし高速処理。`draft_saved=true` セッション付きでダッシュボードへリダイレクト→「下書き」タブが自動選択される
- **x-cloakフラッシュ問題修正**: `app.blade.php` の `<head>` に `<style>[x-cloak] { display: none !important; }</style>` をインライン追加。Viteバンドルより先にCSSを適用し、Alpine.js初期化前のPROモーダル点滅を完全に解消
- **ロゴ重複問題修正**: `application-logo.blade.php` コンポーネント内にすでに「LOGOS」テキストが含まれているため、`guest.blade.php` 側の重複 `<span>LOGOS</span>` を削除。ログイン・登録画面でのロゴ二重表示を修正

### エッジケースのバリデーション強化（実装済み）

- `PostController::store/update`: URL `max:2048`、コメント `max:2000`、不正URL形式を拒否。取得 thumbnail_url を 2048 文字でトランケート
- `TopicController::store/update`: 本文 `max:20000`、時系列イベント `max:500`、日付 `max:50`
- `AnalysisController::update`: `data: required|array`、`title: max:255` を追加（以前はバリデーションなし）
- `AnalysisController::aiAssist`: `prompt: max:5000`、`context: max:10000`
- `analyses.destroy` ルート: `auth` ミドルウェアを追加（以前は未設定）
- `RequiresPro` ミドルウェア: 未定義の `upgrade.show` ルート参照を `url('/upgrade')` 固定値に修正

### テスト

- `tests/Feature/EdgeCaseValidationTest.php`: **31ケース（65 assertions）** 全グリーン確認済み
- 全体テスト: `tests/Feature/` に **56ケース・126assertions** 全グリーン確認済み

### 通知機能

- トリガー: 他ユーザーがいいね / 返信 / エビデンスを追加したタイミングで通知レコードを生成
- 自己通知の除外: 自分が起こしたアクションは通知しない（PostController・CommentController内で制御）
- 既読管理: 通知一覧を開いた時点で全件既読。個別既読 + 全件一括既読の両方に対応
- UI: ヘッダーの鈴アイコンに未読バッジ表示。通知一覧画面（notifications/index.blade.php）

### PROアクセスガード

- ミドルウェア: `RequiresPro`（`app/Http/Middleware/RequiresPro.php`）。`is_pro = false` のユーザーをトピック一覧へリダイレクト。JSON リクエストには 403 を返す
- Policy: `AnalysisPolicy`（`app/Policies/AnalysisPolicy.php`）。分析の閲覧を「作成者本人 OR PRO会員」に限定
- モーダル: `pro-modal.blade.php` コンポーネント。PRO機能にアクセスした無料会員にアップグレード案内を表示
- ルートガード: `tools.*` グループは全て `['auth', 'pro']` ミドルウェアで保護

### 情報の下書き保存機能

- DBカラム: `posts.is_published` boolean（default: true）。既存レコードは全て公開済み扱い
- 投稿モーダル: 「下書き保存」「投稿する」の2ボタン。Alpine.js `isDraft` 変数で hidden input を切り替え
- 下書き保存時: OGPスクレイピング・通知をスキップし高速処理
- 編集制限: `is_published=false`（下書き）のみ `PostController::edit/update` を許可。公開済みは 403
- 本投稿への昇格: 編集画面の「本投稿する」ボタンで `is_published=true` に変更。昇格時のみOGP再取得・通知送信
- ダッシュボード下書きUI: サムネイル部分は点線枠の「準備中」プレースホルダー、タイトル部分は「※本投稿時にサムネイルとタイトルを自動取得します」と表示
- トピック詳細: `where('is_published', true)` でフィルタし、他人の下書きは一切表示しない

### コメント制限ロジック（バックエンド実装）

- 親コメント（Root）: 1ユーザーにつき1トピックあたり **1件のみ**（`whereNull('parent_id')` で判定）
- 補足（自コメントへの返信）: 同一コメントに対して投稿者本人は **最大5回** まで補足可能
- 他ユーザーの返信: 他人のコメントに対して **1回のみ** 返信可（賛同・異論問わず）
- エビデンス補足: 投稿者本人が **1回だけ** 補足を追加できる（`supplement` カラム）
- バックエンドバリデーション（`CommentController`）実装済み

### CI/CD・インフラ

- GitHub Actionsによる自動デプロイ構築（mainブランチpushで自動実行）
- さくらのレンタルサーバーへのデプロイ完了（2026-03-18）
- タグ: `v1.0-laravel-only`（GitHub Actions動作確認版）→ `v1.0-phase1-complete`（Phase1完成）

---

## 2026-03-19 障害の教訓

カテゴリ管理調査中に以下が発生した:
- `DB_CONNECTION=sqlite` への変更でMySQL接続が切断
- パスワード複数回リセットによる.envとの不一致
- `categories/index.blade.php` が `likes/index.blade.php` の内容で汚染（a5a335aコミット）
- サーバー上での直接ファイル作成によるgit pull競合

→ **Gitの履歴が調査・復元の唯一の手段となった。こまめなコミットを継続すること。**
→ **migrate:fresh・db:wipe・migrate:rollback・sqlite切り替えはローカル・本番問わず絶対に実行しない。要確認**
→ **編集前にバックアップコミットを作成する**

## 2026-03-21 ローカルDB障害の教訓

ローカルの `personal_access_tokens` テーブルが消失し、ログイン不能になった:
- **直接原因**: Sanctumのマイグレーションを `vendor:publish` + `migrate` で実行したが、生成された migration ファイルをgitにコミットしていなかった
- **結果**: DB再構築時に `migrate` を実行してもテーブルが復元されなかった
- **bash履歴で判明**: `migrate:fresh` は過去にPhase1開発中（ユーザー操作）で2回実行されていた。Claude Codeによる実行はなし
- `navigation.blade.php` の `auth()->id() === 1` ハードコードが原因でadminの「カテゴリ管理」リンクが非表示になった（DBリセット後にadminのIDが変わったため）

→ **マイグレーションファイルはpublish・作成直後に必ずgitコミットすること**
→ **ローカル開発ユーザーはadmin@test.comがID=1になるよう管理すること**
