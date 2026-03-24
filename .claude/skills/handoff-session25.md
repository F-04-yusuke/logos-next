# LOGOSプロジェクト 引継ぎプロンプト（Session 25）

作成: 2026-03-24 / Session 24 完了時点（Phase 4 UI/UX改善 Session 13）

---

## 前回セッション（Session 24）の完了内容

### U-13: サイドバー UI 豪華化・ホバー高速化

**ファイル:** `components/Sidebar/index.tsx`、`components/Sidebar/NavLinks.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| ホバー速度 | `transition-colors` → `duration-100` に統一（150ms→100ms） |
| ホバー色 | `hover:bg-gray-800` → `hover:bg-white/[0.04]`（白もやに統一） |
| アクティブ状態 | `bg-gray-700` → `bg-white/[0.06]` + 左端 indigo-500 縦バー（`before:` pseudo） |
| セクション見出し | テキストのみ → `border-l-2` アクセントバー付き |
| 保存トピックアイコン | `border border-gray-600` → `bg-indigo-500/15 rounded-md`（indigo pill） |
| ハンバーガーボタン | `hover:bg-gray-900` → `hover:bg-white/[0.04]` |

### U-14: トピックページ UI 豪華化・ヘッダー刷新

**ファイル:** `app/topics/[id]/_components/TopicPageClient.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| タイトル | `border-l-4 border-indigo-500` 左アクセントバー追加 |
| カテゴリバッジ | pill + indigo tint（`text-[10px] font-bold text-indigo-300 px-2`） |
| カテゴリリンク先 | `/?category=ID` → `/categories/ID` に統一 |
| 作成者・日時 | テキスト2行 → `UserAvatar` + インライン1行 |
| 保存ボタン | 保存済み=indigo・ホバー=indigo tint |
| タブ | アクティブ色を `border-indigo-500` に統一（analysis タブのみ `border-yellow-500` 維持） |
| ローディング | テキスト → パルスアニメーションスケルトン |

### U-15: 保存トピックアイコン → カテゴリ頭文字化

- `/api/user/bookmarks` に `category_char` フィールド追加（logos-laravel の `UserApiController`）
- 複数カテゴリ付きトピックは ID が一番若いカテゴリの頭文字を採用
- カテゴリなし → bookmark SVGアイコンでフォールバック

### D-1: 豪華要素デザインルール策定

`.claude/skills/design-spec.md` に「豪華要素ルール」セクションを新設。
**次セッション以降は必ずこのセクションを参照して数値を統一すること。**

**教訓:** クラス名変更後に hydration mismatch が出たら `rm -rf .next && npm run dev`（CLAUDE.md 記載済み）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v6.3-session24-luxury-ui | クリーン |
| ~/logos-laravel | main | v4.2-session24-bookmarks-category-char | クリーン |

---

## Session 25 の作業内容

### 最優先：残ページの豪華化（design-spec.md「豪華要素ルール」に準拠）

**着手前に `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず読むこと。**
カテゴリバッジ・ホバー・アクセントバー・スケルトンの具体的なクラス値がすべてそこにある。

#### ① ダッシュボードページ（優先度高）
`app/dashboard/page.tsx` をトピックページ基準に統一。
- 参照 Blade: `~/logos-laravel/resources/views/dashboard.blade.php`
- 5タブ（投稿・下書き・コメント・分析・トピック）の UI 改善

#### ② プロフィールページ（優先度高）
`app/profile/page.tsx` をトピックページ基準に統一。
- 参照 Blade: `~/logos-laravel/resources/views/profile/edit.blade.php`

#### ③ 通知ページ（優先度中）
`app/notifications/page.tsx` をトピックページ基準に統一。

#### ④ 閲覧履歴・参考になった一覧（優先度中）
`app/history/page.tsx`・`app/likes/page.tsx`

#### ⑤ カテゴリ管理ページ（優先度中）
`app/categories/page.tsx`（admin: CRUD / 一般: 一覧）

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善（豪華化）
- ダッシュボードページ豪華化
- プロフィールページ豪華化
- 通知・履歴・参考になった豪華化
- カテゴリ管理ページ豪華化
- /categories/[id] SSR カテゴリ名解決（技術的負債解消）

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

# hydration error が出た場合（必ず試す）
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **豪華要素ルール**: `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず参照・数値を変えない
2. **Blade 参照ルール**: UIデザインのみ変更 → 参照不要 / 機能追加・移植 → 必ず先に Blade を読む
3. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
4. **トピックページが UI 基準**: 他ページ改修時は必ずここに準拠
5. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
6. **一度に編集するファイルは5ファイル以内**
7. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
8. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
9. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
10. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`（`text-xs` や `text-indigo-400` は使わない）
