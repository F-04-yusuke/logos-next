# LOGOSプロジェクト 引継ぎプロンプト（Session 12）

作成: 2026-03-23 / Session 12 完了時点（Phase 4 UI/UX改善 Session 1）

---

## 前回セッション（Session 12）の完了内容

### Phase 4 開始 / U-1: PostCard UI改修 ✅ 完了

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`、`components/LikeButton.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| タイトル位置 | 右列先頭（text-lg） | 左列サムネ下（text-sm） |
| カード高さ | min-h-[160px] | min-h-[170px] |
| 概要テキストサイズ | text-[13px] | text-[14px] |
| フォールバック（youtube） | リンクアイコン | YouTube SVGロゴ（白背景・赤ロゴ） |
| フォールバック（X） | リンクアイコン | X SVGロゴ（黒背景・白Xロゴ） |
| 添付画像（custom_thumbnail） | なし | lightboxで拡大表示（URLへのリンクなし） |
| 「続きを読む」 | 常時表示 | useRefで高さ検出・実際に切れている場合のみ表示 |
| LikeButton | sm/mdサイズのみ | lg サイズ追加 |

### U-2: 投稿モーダル機能拡張 ✅ 完了

**ファイル（logos-next）:**
- `app/topics/[id]/_components/PostModal.tsx` — 画像添付トグル・タイトル手動入力トグル追加
- `app/topics/[id]/hooks/useTopicPage.ts` — FormData/JSON 条件切り替え
- `app/topics/[id]/_types.ts` — `custom_thumbnail?: string | null` 追加

**ファイル（logos-laravel）:**
- `database/migrations/2026_03_23_*_add_custom_thumbnail_to_posts_table.php` — 新規マイグレーション
- `app/Models/Post.php` — fillable に `custom_thumbnail` 追加
- `app/Http/Requests/Api/StorePostRequest.php` — `custom_thumbnail`・`custom_title` バリデーション追加
- `app/Http/Controllers/Api/PostApiController.php` — ファイル保存・手動タイトル優先処理追加

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.1-session12-ui-postcard | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン |

---

## 全フェーズ完了状況

| フェーズ | 内容 | 状態 |
|---|---|---|
| Phase 1 | Laravel Blade版MVP磨き込み | ✅ 完了（2026-03-19） |
| Phase 2 | Next.js移行（全17ページ・Step1〜14） | ✅ 完了（2026-03-22） |
| Phase 3 | 技術改善（B-1〜B-6 / F-1〜F-7） | ✅ 完了（2026-03-23） |
| Phase 4 | 集客・マーケティング基盤 | 🔄 進行中（Session 12 〜） |
| Phase 5 | スケールとマネタイズ | 🔲 未着手 |

---

## Phase 4 残タスク（優先度別）

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（現在未着手・登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）の適切な設定・h1/h2タグ整理
- **Stripe Webhook受け口**: 決済コード作り込みなし・受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化（Phase 2 暫定実装の解消）
- **/analyses/[id] SSR化**: Cookie認証導入後に対応（F-1 残タスク）
- **パスワードリセット機能**: SMTP設定（さくら or SendGrid）と合わせて実装
- **UI/UX 継続改善**: 情報タブ以外（コメントタブ・分析タブ・トップページ）

### 優先度低
- **eKYC連携**: TRUSTDOCK等（本人確認・質の高い議論コミュニティの維持）
- **SNSログイン**: Laravel Socialite（Google / X）
- **インフラ移行**: さくら → AWS（将来）

---

## 起動手順

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # logos-laravel-laravel.test-1 が Running ならOK
# 起動していない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js
cd ~/logos-next && npm run dev
# → http://localhost:3000
```

**注意:** Docker Compose の命名規則により、コンテナ名が `logos-laravel-laravel.test-1` になっている場合がある。
`docker ps` で確認してから `docker exec` すること。

## 検証コマンド

```bash
# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Next.js ビルド確認
cd ~/logos-next && npm run build

# ルート確認
docker exec logos-laravel-laravel.test-1 php artisan route:list
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
6. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**（DBデータ消失防止）
