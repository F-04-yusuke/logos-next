# Session 46 → 47 引継ぎプロンプト

最終更新: 2026-04-02

---

## このファイルの使い方

新しいセッション開始時に以下をそのままプロンプトに貼り付ける:

```
'/home/tasaki/logos-next/.claude/skills/handoff-session46.md'
```

---

## プロジェクト概要

- **フロント:** Next.js (`~/logos-next`) → Vercel
- **バックエンド:** Laravel (`~/logos-laravel`) → さくらサーバー
- **詳細仕様:** `CLAUDE.md` および `.claude/skills/` 配下の各ファイルを参照

---

## Session 46 完了内容（2026-04-02）

Session 45 で確立したデザインシステムを以下のページへ適用した。

### 適用済みページ ✅

| ページ | ファイル | 主な変更 |
|---|---|---|
| 分析ツール（ロジックツリー） | `app/tools/tree/page.tsx` | 保存ボタン(yellow-orange pill)・AIボタン(indigo pill)・select chevron・セマンティック変数統一 |
| 分析ツール（総合評価表） | `app/tools/matrix/page.tsx` | テーブルヘッダー/セル・ボタン・セマンティック変数統一 |
| 分析ツール（SWOT/PEST） | `app/tools/swot/page.tsx` | BoxPanel・フレームワーク選択select chevron・セマンティック変数統一 |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | h1グラデーントspan・カード/カードヘッダーセマンティック変数統一 |
| カテゴリ別トピック | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | h1グラデーントspan・パンくず修正・ソートselect chevron・バッジ・ホバー統一 |
| プロフィール | `app/profile/page.tsx` | h1/h2グラデーントspan・フォームスタイル統一・ボタンpill・モーダルセマンティック変数 |
| 通知ベル（ナビバー） | `components/Header/NotificationBell.tsx` + `components/Header/index.tsx` | strokeWidth 1.5→2・text-gray-400→text-logos-sub・hover:bg-gray-800→hover:bg-logos-hover |

### Session 46 コミット

```
4099ea2 fix: ナビゲーションバーの通知アイコンをサイドバーと統一
639e775 feat: プロフィールページをデザインシステムに統一
7dfd39d feat: カテゴリ一覧・カテゴリ別トピックページをデザインシステムに統一
5a336fc feat: 分析ツール3本をデザインシステムに統一
```

---

## 現在のタグ

- **logos-next:** `v6.78-session46-before-notif-icon-fix`（Session 46 最終タグ）
- **logos-laravel:** `v4.4-session31-liked-by-me`（Session 46 は変更なし）

---

## Session 47 タスク（優先順）

### 1. カテゴリ管理（`/categories`）— admin CRUD + 一般一覧【最優先】

**ファイル:** `app/categories/page.tsx`

**修正ポイント:**
- ページヘッダー → グラデーントアクセントバー (h-6, blue-indigo)
- ボタン → グラデーション pill（indigo）
- フォーム → Session 45 確立のフォームスタイル
- セマンティック変数統一（text-gray-* / bg-gray-* / border-gray-* を置き換え）

**注意:** admin と一般ユーザーで表示が異なるページ。Blade（`resources/views/categories/`）を事前に確認すること。

---

## デザインシステム（全ページ共通ルール）

### 1. ページヘッダー — グラデーントアクセントバー（h-6）

```tsx
<h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
  <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  ページタイトル
</h1>
// PRO系ページ（トピック作成・編集・分析ツール等）
// from-yellow-400 to-orange-500
```

### 2. セクションヘッダー — グラデーントアクセントバー（h-4）

```tsx
<h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  セクション名
</h3>
// PRO/分析系: from-yellow-400 to-orange-500
```

### 3. タブ — アンダーライン型（-mb-px）

```tsx
// コンテナ
<div className="flex border-b border-logos-border overflow-x-auto overflow-y-hidden">
// タブボタン（ベース）
const base = "py-2.5 px-4 sm:px-5 text-base font-semibold transition-all duration-150 focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer -mb-px border-b-2";
// アクティブ（indigo）: border-indigo-500 text-logos-text
// アクティブ（yellow）: border-yellow-500 text-logos-text
// 非アクティブ: border-transparent text-logos-sub hover:text-logos-text hover:border-logos-border
```

### 4. アクションボタン — グラデーション pill

```tsx
// Primary（indigo）
"bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50"

// PRO/分析系（yellow-orange）
"bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all"
```

### 5. select ドロップダウン — appearance-none + カスタム chevron

```tsx
<div className="relative">
  <select className="text-sm rounded-full bg-logos-hover text-logos-text pl-3 pr-8 py-1.5 cursor-pointer hover:bg-logos-elevated transition-colors focus:outline-none appearance-none">
    ...
  </select>
  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-logos-sub pointer-events-none" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
</div>
```

### 6. カテゴリバッジ — ライト/ダーク両対応

```tsx
"px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors duration-100"
```

### 7. PostCard — 枠なし・ホバーのみ

```tsx
"-ml-3 pl-3 py-4 pr-4 rounded-xl flex flex-col transition-colors hover:bg-logos-hover"
```

### 8. セマンティックカラー変数

| 用途 | 変数 |
|---|---|
| ページ背景 | `bg-logos-bg` |
| カード・入力背景 | `bg-logos-surface` |
| ホバー背景 | `bg-logos-hover` |
| ボーダー | `border-logos-border` / `divide-logos-border` |
| 本文テキスト | `text-logos-text` |
| サブテキスト | `text-logos-sub` |

**禁止パターン（ハードコード色）:**
- `text-gray-*`（dark:なし）→ `text-logos-text` / `text-logos-sub`
- `bg-gray-50`, `bg-gray-100` → `bg-logos-hover`
- `bg-white` 単体 → `bg-logos-surface`
- `border-gray-200`, `border-gray-700` → `border-logos-border`

### 9. フォームスタイル（Session 45 確立）

```tsx
// ラベル
<label className="block text-base font-bold text-logos-text mb-1">

// 入力フィールド
className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"

// カテゴリ選択エリア
className="p-4 bg-logos-hover rounded-xl border border-logos-border"

// 補足テキスト
className="text-sm text-logos-sub"
```

---

## 作業方針（Session 47 向け）

1. **1ページずつ進める**（ファイル5枚以内ルール）
2. **着手前に必ずタグ打ち**（コードを変更するすべての回答で毎回）
3. **カテゴリ管理ページはBladeを確認してから実装**（admin/一般で表示分岐あり）
4. 確立済みデザインシステムのクラス文字列をそのまま使う（数値を勝手に変えない）
5. ビルド確認: `npx tsc --noEmit`

---

## 引継ぎ時の注意

- タグ付けルール: **コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと**
- ローカル起動: `cd ~/logos-laravel && ./vendor/bin/sail up -d` → `cd ~/logos-next && npm run dev`
- 終了時: **必ず** `cd ~/logos-laravel && ./vendor/bin/sail down` を実行してから WSL を閉じる
- `.next` キャッシュ起因の hydration エラーが出たら: `rm -rf .next && npm run dev`
