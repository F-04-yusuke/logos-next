# Session 45 → 46 引継ぎプロンプト

最終更新: 2026-04-02

---

## このファイルの使い方

新しいセッション開始時に以下をそのままプロンプトに貼り付ける:

```
'/home/tasaki/logos-next/.claude/skills/handoff-session45.md'
```

---

## プロジェクト概要

- **フロント:** Next.js (`~/logos-next`) → Vercel
- **バックエンド:** Laravel (`~/logos-laravel`) → さくらサーバー
- **詳細仕様:** `CLAUDE.md` および `.claude/skills/` 配下の各ファイルを参照

---

## Session 45 完了内容（2026-04-02）

Session 44 で確立したデザインシステムを以下のページへ適用した。

### 適用済みページ ✅

| ページ | ファイル | 主な変更 |
|---|---|---|
| ダッシュボード | `app/dashboard/page.tsx` | タブ/セクションヘッダー/ボタン/セマンティック変数統一 |
| 参考になった | `app/likes/page.tsx` | タブ/ヘッダー/セマンティック変数統一 |
| 閲覧履歴 | `app/history/page.tsx` | ヘッダー/日付グループヘッダー/カード/ページネーション統一 |
| 通知 | `app/notifications/page.tsx` | ヘッダー/未読ハイライト/セマンティック変数統一 |
| トピック作成 | `app/topics/create/page.tsx` | 視認性修正・フォームスタイル統一 |
| トピック編集 | `app/topics/[id]/edit/page.tsx` | 視認性修正・フォームスタイル統一 |

---

## 現在のタグ

- **logos-next:** `v6.74-session45-before-topic-create-edit-redesign`（Session 45 最終タグ、実装はその先）
- **logos-laravel:** `v4.4-session31-liked-by-me`（Session 45 は変更なし）

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

## Session 46 タスク（優先順）

### 1. カテゴリ一覧（`/category-list`）— 137行・最小

**ファイル:** `app/category-list/page.tsx`

**修正ポイント:**
- `text-gray-600 dark:text-g-sub` / `text-gray-500` → `text-logos-sub`
- `border-gray-200 dark:border-gray-800` → `border-logos-border`
- `bg-gray-50 dark:bg-logos-bg` / `hover:bg-gray-100 dark:hover:bg-white/[0.04]` → `hover:bg-logos-hover`
- カテゴリバッジ → 確立済みスタイルに統一
- ページヘッダー → グラデーントアクセントバー

---

### 2. カテゴリ管理（`/categories`）— admin CRUD + 一般一覧

**ファイル:** `app/categories/page.tsx`

**修正ポイント:**
- ヘッダー / ボタン / フォームを確立済みスタイルに統一

---

### 3. プロフィール（`/profile`）— 509行

**ファイル:** `app/profile/page.tsx`

**修正ポイント:**
- ヘッダー → グラデーントアクセントバー
- フォーム → Session 45 確立のフォームスタイル
- ボタン → グラデーション pill
- セマンティック変数統一

---

### 4. 分析ツール（`/tools/tree`, `/tools/matrix`, `/tools/swot`）— 各700行前後・最複雑

**ファイル:**
- `app/tools/tree/page.tsx`（703行）
- `app/tools/matrix/page.tsx`（702行）
- `app/tools/swot/page.tsx`（548行）

**共通修正ポイント:**
- ツールバー・ヘッダーのボタン → グラデーション pill（PRO系: yellow-orange）
- セクションヘッダー → グラデーントアクセントバー（h-4、yellow-orange）
- select ドロップダウン → appearance-none + カスタム chevron
- カード・パネル → セマンティック変数統一
- `text-gray-*` / `border-gray-*` / `bg-gray-*` → セマンティック変数
- 1ファイルずつ進めること（5ファイル以内ルール）

---

## 作業方針（Session 46 向け）

1. **1ページずつ進める**（ファイル5枚以内ルール）
2. **着手前に必ずタグ打ち**（コードを変更するすべての回答で毎回）
3. **Blade 参照不要**（UIデザイン変更のみのため）
4. 確立済みデザインシステムのクラス文字列をそのまま使う（数値を勝手に変えない）
5. ビルド確認: `npx tsc --noEmit`

---

## 引継ぎ時の注意

- タグ付けルール: **コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと**
- ローカル起動: `cd ~/logos-laravel && ./vendor/bin/sail up -d` → `cd ~/logos-next && npm run dev`
- 終了時: **必ず** `cd ~/logos-laravel && ./vendor/bin/sail down` を実行してから WSL を閉じる
- `.next` キャッシュ起因の hydration エラーが出たら: `rm -rf .next && npm run dev`
