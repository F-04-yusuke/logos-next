# LOGOSプロジェクト 引継ぎプロンプト（Session 24）

作成: 2026-03-24 / Session 23 完了時点（Phase 4 UI/UX改善 Session 12）

---

## 前回セッション（Session 23）の完了内容

### トップページ（HomeClient）豪華版リデザイン

`app/_components/HomeClient.tsx` を全面刷新。

| 変更 | 内容 |
|---|---|
| トピックカード | ボックス廃止・フラット `-ml-3 pl-3` パターン |
| テキストカラー | `text-g-text` / `text-g-sub` に統一 |
| 日時表示 | `timeAgo`（相対表示）に変更 |
| ローディング | パルスアニメーションスケルトンに変更 |
| カテゴリバッジ | pill スタイル + indigo tint |
| ランキングバッジ | 金銀銅グラデーション |
| セクション見出し | 絵文字 → アクセントバー |
| タブ行カラム | 件数バッジ `w-7`・日時 `w-14` 固定幅で揃え |
| `user?.is_pro` | `!!user?.is_pro` バグ修正 |

### カテゴリ別トピック一覧ページ新設（/categories/[id]）

**新規ファイル:**
- `app/categories/[id]/page.tsx` — SSR（初期トピックのみ）
- `app/categories/[id]/_components/CategoryTopicsClient.tsx` — CSR（カテゴリ名・ソート・ページネーション）

**リンク変更:**
- HomeClient・category-list の「もっと見る」「中分類リンク」を `/categories/[id]` に統一

**技術的負債（将来改善）:**
カテゴリ名の解決は本来 SSR で行うべきだが、Server Component から `http://localhost/api/categories`
を fetch すると中分類が null を返す不具合（原因不明）が発生。
暫定措置として `useEffect` でクライアント側から解決している。
将来の改善: `unstable_noStore` / `export const dynamic = 'force-dynamic'` で再試み、
または httpOnly Cookie 認証導入後に SSR 化する。

### TopicApiController カテゴリフィルタ追加（logos-laravel）

`TopicApiController::index()` に `?category=ID` フィルタ（大分類→中分類も含む）と
`per_page` パラメータを追加。Blade 版にはあったが API 版に未移植だったバグを修正。

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v6.0-session23-category-page | クリーン |
| ~/logos-laravel | main | v4.1-session23-topic-api-category-filter | クリーン |

---

## Session 24 の作業内容

### 優先①：プロフィールページ UI/UX 改善

`app/profile/page.tsx` をトピックページ基準に統一。

### 優先②：カテゴリ管理ページ UI/UX 改善

`app/categories/page.tsx` をトピックページ基準に統一。

### 優先③：/categories/[id] SSR カテゴリ名解決の改善（技術的負債）

現状はクライアント側で `useEffect` + `/api/categories` フェッチでカテゴリ名を解決しているが、
本来は SSR で解決すべき構成。以下を試みる：

```ts
// page.tsx に追加して SSR fetch を強制する
export const dynamic = 'force-dynamic';
// または
import { unstable_noStore as noStore } from 'next/cache';
noStore();
```

改善できればカテゴリ名の初期表示（"…" プレースホルダー）がなくなりより自然になる。

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- プロフィールページ UI/UX 改善
- カテゴリ管理ページ UI/UX 改善
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

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **Blade 参照ルール（Session 21 更新）:**
   - UIデザインのみ変更（色・ホバー・ボーダー等）→ Blade 参照不要
   - 機能追加・ロジック変更・新規移植 → 必ず Blade を先に読む
2. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
3. **トピックページが UI 基準**: 他ページ改修時は `design-spec.md` の「トピックページ UI ルール」セクションに準拠
4. **ホームページ・カテゴリ一覧の背景色はヘッダーに合わせる必要なし**（現状満足済み）
5. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
6. **一度に編集するファイルは5ファイル以内**
7. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
8. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
9. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
10. **PostCard はダッシュボード・参考になったページが `SharedPost` 型で共通コンポーネントを使用**（`app/topics/[id]/_components/PostCard.tsx` は別型・直接使用不可）
11. **score フィールドは文字列で来る場合がある** → `Number(e.score)` で変換すること
12. **`/categories/[id]` のカテゴリ名は CSR（useEffect）で解決**（SSR fetch 不具合のため暫定・将来改善予定）
