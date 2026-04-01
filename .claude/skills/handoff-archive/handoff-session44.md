# Session 44 → 45 引継ぎプロンプト

最終更新: 2026-04-01

---

## このファイルの使い方

新しいセッション開始時に以下をそのままプロンプトに貼り付ける:

```
'/home/tasaki/logos-next/.claude/skills/handoff-session44.md'
```

---

## プロジェクト概要

- **フロント:** Next.js (`~/logos-next`) → Vercel
- **バックエンド:** Laravel (`~/logos-laravel`) → さくらサーバー
- **詳細仕様:** `CLAUDE.md` および `.claude/skills/` 配下の各ファイルを参照

---

## Session 44 完了内容（2026-04-01）

### トピックページ（`/topics/[id]`）UI 全面リデザイン ✅

Session 43 のトップページリデザインに続き、トピックページを世界最高品質に引き上げた。

#### 確立したデザインシステム（全ページ共通ルール）

**1. タブ — アンダーライン型**

```tsx
// コンテナ
<div className="flex border-b border-logos-border mb-5 overflow-x-auto overflow-y-hidden">
// アクティブ
"border-b-2 border-indigo-500 text-logos-text"
// 非アクティブ
"border-transparent text-logos-sub hover:text-logos-text hover:border-logos-border"
// サイズ: py-2.5 px-5 text-base font-semibold -mb-px
```

理由: コンテナ背景なし = 浮かない・GitHub/Linear/Vercel と同スタイル・ライト/ダーク両対応

**2. セクションヘッダー — グラデーントアクセントバー**

```tsx
<h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  セクション名
</h3>
// PRO/分析系には yellow-orange バー
// from-yellow-400 to-orange-500
```

**3. アクションボタン — グラデーション pill**

```tsx
// Primary（投稿・一般アクション）
"bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all"

// PRO/分析系
"bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all"

// コメント投稿・フォーム送信
"bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-all disabled:opacity-50"
```

**4. select ドロップダウン — appearance-none + カスタム chevron**

```tsx
// ラッパー div（hidden sm:block は div 側に）
<div className="relative">
  <select className="text-sm rounded-full bg-logos-hover text-logos-text pl-3 pr-8 py-1.5 cursor-pointer hover:bg-logos-elevated transition-colors focus:outline-none appearance-none">
    ...
  </select>
  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-logos-sub pointer-events-none" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
</div>
```

**5. カテゴリバッジ — ライト/ダーク両対応**

```tsx
"px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors duration-100"
```

**6. PostCard（SNS スタイル）— 枠なし・ホバーのみ**

```tsx
// 枠なし・ホバー時のみ背景色変化（Twitter/X・Reddit・LinkedIn と同スタイル）
"-ml-3 pl-3 py-4 pr-4 rounded-xl flex flex-col transition-colors hover:bg-logos-hover"
```

**7. セマンティックカラー変数の使用ルール**

| 用途 | 変数 | ライト | ダーク |
|---|---|---|---|
| ページ背景 | `bg-logos-bg` | #F9FAFB | #131314 |
| カード・入力背景 | `bg-logos-surface` | #FFFFFF | #1e1f20 |
| ホバー背景 | `bg-logos-hover` | #F3F4F6 | #2a2b2c |
| Elevated要素 | `bg-logos-elevated` | #E5E7EB | #303030 |
| ボーダー | `border-logos-border` | #E5E7EB | #374151 |
| 本文テキスト | `text-logos-text` | #111827 | #E3E3E3 |
| サブテキスト | `text-logos-sub` | #6B7280 | #C4C7C5 |

**禁止パターン（ハードコード色）:**
- `text-gray-*`（dark: プレフィックスなしの単体使用）→ `text-logos-text` / `text-logos-sub`
- `bg-gray-50` / `bg-gray-100` → `bg-logos-hover`
- `bg-white` 単体 → `bg-logos-surface`
- `border-gray-200 dark:border-logos-border` → `border-logos-border` に統一
- `dark:bg-*` / `dark:text-*` のみ（light 未対応）

---

## 現在のタグ

- **logos-next:** `v6.69-session44-before-tab-text-scroll`（Session 44 最終タグ、実装はその先）
- **logos-laravel:** `v4.4-session31-liked-by-me`（Session 44 は変更なし）

---

## Session 45 最優先タスク

### 全ページへのデザインシステム適用

Session 43-44 で確立したデザインシステムを、以下のページに順次適用する。

---

### 1. Dashboard（`/dashboard`）— 最優先・最複雑

**ファイル:** `app/dashboard/page.tsx`

**主な修正ポイント:**

| 箇所 | 現状 | 対応 |
|---|---|---|
| タブ切替（5タブ） | 独自スタイル（border-l-4等） | アンダーライン型タブに統一 |
| セクションヘッダー（複数） | `pl-3 border-l-4 border-indigo-500` | グラデーントアクセントバー |
| アクションボタン（L295-319） | `bg-blue-600 rounded-md` など単色 | グラデーション pill |
| `text-gray-500` 多数 | dark: 未対応 | `text-logos-sub` |
| `border-gray-200` | light モード非統一 | `border-logos-border` |
| `bg-gray-50 dark:bg-logos-bg` | 混在 | `bg-logos-hover` |
| `text-gray-300 dark:text-gray-700` セパレーター | 非セマンティック | `text-logos-border` |

---

### 2. Notifications（`/notifications/page.tsx`）

**主な修正ポイント:**

- `divide-gray-100 dark:divide-gray-800/60` → `divide-logos-border`
- `border-gray-200 dark:border-logos-border` → `border-logos-border`
- `bg-gray-100 dark:bg-gray-800` → `bg-logos-hover`
- `bg-blue-50/60 dark:bg-blue-950/20` → `bg-indigo-50 dark:bg-indigo-500/10`
- `text-gray-600 dark:text-g-sub` → `text-logos-sub`
- `rounded-md` → `rounded-lg` or `rounded-xl`
- ページネーションボタン → グラデーション pill

---

### 3. Likes（`/likes/page.tsx`）

**主な修正ポイント:**

- `text-gray-500` 複数箇所（dark: 未対応） → `text-logos-sub`
- `border-gray-200 dark:border-logos-border` → `border-logos-border`
- `bg-white/[0.06]`, `bg-white/[0.04]` → `bg-logos-hover` / `bg-logos-surface`
- `rounded-md` → `rounded-lg`
- ページネーション `rounded-md` → pill

---

### 4. History（`/history/page.tsx`）

**主な修正ポイント:**

- `text-gray-300 dark:text-gray-600` → `text-logos-border`
- `text-gray-500 dark:text-g-sub` → `text-logos-sub`
- `bg-gray-50 dark:bg-logos-bg` → `bg-logos-hover`
- `hover:bg-gray-100 dark:hover:bg-logos-hover` → `hover:bg-logos-hover`
- ページネーション `rounded-md` → `rounded-full`
- `text-blue-600 dark:text-blue-400` リンク → `text-logos-link`

---

### 5. Category List（`/category-list/page.tsx`）

**主な修正ポイント:**

- `text-gray-600 dark:text-g-sub` / `text-gray-500 dark:text-g-sub` → `text-logos-sub`
- `text-gray-400 dark:text-gray-500` → `text-logos-sub`
- `border-gray-200 dark:border-gray-800` → `border-logos-border`
- `bg-gray-50 dark:bg-logos-bg` → `bg-logos-hover`
- `hover:bg-gray-100 dark:hover:bg-white/[0.04]` → `hover:bg-logos-hover`
- カードのカテゴリバッジ → 確立済みスタイルに統一

---

### 6. 分析ツール（`/tools/tree`, `/tools/matrix`, `/tools/swot`）

各ツールページは PRO 限定・複雑な UI。以下を確認・修正:
- ツールバー・ヘッダーのボタン → グラデーション pill
- セクションヘッダー → グラデーントアクセントバー
- select ドロップダウン → appearance-none + カスタム chevron
- カード類 → セマンティック変数統一

---

### 7. その他候補（優先度低）

- `/profile` — フォーム・ボタンスタイル
- `/categories/[id]` — フィルター select、カード
- `/login`, `/register` — フォームスタイル

---

## 作業方針（Session 45 向け）

1. **1ページずつ進める**（ファイル5枚以内ルール）
2. **着手前に必ずタグ打ち**
3. **Blade 参照不要**（UIデザイン変更のみのため）
4. 確立済みデザインシステムのクラス文字列をそのまま使うこと（数値を勝手に変えない）
5. ビルド確認: `npx tsc --noEmit`

---

## 引継ぎ時の注意

- タグ付けルール: **コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと**
- ローカル起動: `cd ~/logos-laravel && ./vendor/bin/sail up -d` → `cd ~/logos-next && npm run dev`
- 終了時: **必ず** `cd ~/logos-laravel && ./vendor/bin/sail down` を実行してから WSL を閉じる
- `.next` キャッシュ起因の hydration エラーが出たら: `rm -rf .next && npm run dev`
