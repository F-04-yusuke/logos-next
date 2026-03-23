# LOGOSプロジェクト 引継ぎプロンプト（Session 19）

作成: 2026-03-24 / Session 18 完了時点（Phase 4 UI/UX改善 Session 7）

---

## 前回セッション（Session 18）の完了内容

### U-13: ヘッダー・サイドバー UI調整

| 変更 | 変更前 | 変更後 |
|---|---|---|
| ヘッダー高さ | `h-16` | `h-14`（サイドバー上部と統一） |
| 検索バー縦幅 | `py-2` | `py-2.5` |
| 右ナビ gap | `gap-2` | `gap-4` |
| 通知ベルアイコン | `h-5 w-5` | `h-6 w-6` |
| アバターサイズ | `h-8 w-8` / iconSize `h-5 w-5` | `h-9 w-9` / iconSize `h-6 w-6` |
| サイドバー上部行 | `h-16` | `h-14` |
| ホーム・カテゴリ文字サイズ | デフォルト大 | `text-sm`（`<ul>` に追加・他ナビ項目と統一） |

### U-14: PostCard 構造改善

- ホバー左切れ修正: `pl-0` → `-ml-3 pl-3`
- カード構造: 2カラムラッパー（`flex flex-col md:flex-row gap-4 min-h-[170px]`）分離。補足展開・補足フォームは外側に配置
- いいね・削除ボタン: 右列下部に移動（右寄せ `ml-auto`）
- 非オーナーいいねのアイライン: `invisible pointer-events-none` プレースホルダーでオーナーと位置統一
- 補足を追加するボタン: アクション行左側（補足ありと同位置）
- 補足フォーム: flex spacer（`hidden md:block md:w-[30%] flex-shrink-0` + `md:gap-4`）で右列と同位置
- インデント整合修正（全ファイル rewrite）

### U-15: 情報タブ セレクト UI調整

- `bg-transparent` → `bg-white dark:bg-[#131314]`（OS白背景ドロップダウンバグ修正）
- `hover:bg-gray-100 dark:hover:bg-[#1e1f20]` 追加
- padding / border 調整

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.7-session18-ui-header-postcard | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 19 の作業内容

### 優先①：コメントタブ テストデータ充実 → UI/UX 改善

**手順:**
1. tinker でコメントタブに内容の濃いテストデータを投入
   - 親コメント複数（異なるユーザー）
   - 補足（自コメントへの返信）あり
   - 他ユーザーへの返信あり
   - いいね数にバラつきをつける
2. ブラウザでコメントタブの現状UIを確認（ユーザーがスクショ）
3. 改善点を洗い出して実装

**tinker コマンド例:**
```bash
docker exec logos-laravel-laravel.test-1 php artisan tinker --execute="
\App\Models\Comment::create([
  'topic_id' => TOPIC_ID,
  'user_id' => USER_ID,
  'body' => 'コメント内容',
  'parent_id' => null,
]);
"
```

### 優先②：分析タブ UI/UX 改善

### 優先③：トップページ（トピック一覧）UI/UX 改善

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 19**: コメントタブ テストデータ充実 + UI/UX改善
- 分析タブ UI/UX 改善
- トップページ（トピック一覧）UI/UX 改善
- その他全ページ

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）・h1/h2 タグ整理
- **Stripe Webhook受け口**: 受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化
- **/analyses/[id] SSR化**: Cookie認証導入後に対応
- **パスワードリセット機能**: SMTP設定と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等
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

## 検証コマンド

```bash
# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Next.js ビルド確認
cd ~/logos-next && npm run build

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
3. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
4. **一度に編集するファイルは5ファイル以内**
5. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
