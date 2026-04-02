# Session 47 → 48 引継ぎプロンプト

最終更新: 2026-04-02

---

## このファイルの使い方

新しいセッション開始時に以下をそのままプロンプトに貼り付ける:

```
'/home/tasaki/logos-next/.claude/skills/handoff-session47.md'
```

---

## プロジェクト概要

- **フロント:** Next.js (`~/logos-next`) → Vercel
- **バックエンド:** Laravel (`~/logos-laravel`) → さくらサーバー
- **詳細仕様:** `CLAUDE.md` および `.claude/skills/` 配下の各ファイルを参照

---

## Session 47 完了内容（2026-04-02）

### カテゴリ管理（`app/categories/page.tsx`）
- ページヘッダー・セクションヘッダー → グラデーションアクセントバー
- ボタン → グラデーション pill（indigo）
- フォームスタイル → Session 45 確立スタイルに統一
- セマンティック変数統一（text-gray-* 等除去）

### AppLogo 刷新（`components/AppLogo.tsx`）
- 旧: 3D等角投影「L」→ **新: Λ（ラムダ）円形バッジ ＋ ワードマーク**
- Λ = λόγος（ロゴス）の語源。L字との視覚重複を解消
- blue-500→indigo-600 グラデーション円、shadow なし、tracking-tight 単色テキスト

### Session 47 コミット

```
9b53180 fix: AppLogo — 影除去・サイズバランス調整・テキスト単色化・tracking-tight
6f6b4b0 feat: AppLogo を Λバッジ＋グラデーションワードマークに刷新
39d4515 feat: カテゴリ管理ページをデザインシステムに統一
```

---

## 現在のタグ

- **logos-next:** `v6.80-session47-before-logo-redesign`（Session 47 最終タグ）
- **logos-laravel:** `v4.4-session31-liked-by-me`（Session 47 は変更なし）

---

## Session 48 タスク（優先順）

### 1. 残ページのデザインシステム適用【最優先】

デザインシステムが未適用または部分適用のページを確認・対応する。
優先候補:
- `app/analyses/[id]/page.tsx` — 分析スタンドアロン閲覧ページ
- ホームページ（`app/page.tsx`）の細部確認
- その他 `text-gray-*` / `bg-gray-*` ハードコード残存ページ

確認コマンド:
```bash
grep -r "text-gray-\|bg-gray-50\|bg-gray-100\|bg-white " app/ --include="*.tsx" -l
```

### 2. AppLogo の今後の再検討（中長期）

- ロゴ名「LOGOS」は "Logos Bible Software" と名称がかぶる可能性あり → 将来的に再検討
- Λマーク: 商標調査（J-PlatPat / USPTO）を行ってから確定推奨
- 現デザインは開発継続用の暫定版として扱う

---

## デザインシステム（全ページ共通ルール）

### 1. ページヘッダー — グラデーションアクセントバー（h-6）

```tsx
<h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
  <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  ページタイトル
</h1>
// PRO系ページ（トピック作成・編集・分析ツール等）
// from-yellow-400 to-orange-500
```

### 2. セクションヘッダー — グラデーションアクセントバー（h-4）

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

## 作業方針（Session 48 向け）

1. **1ページずつ進める**（ファイル5枚以内ルール）
2. **着手前に必ずタグ打ち**（コードを変更するすべての回答で毎回）
3. 確立済みデザインシステムのクラス文字列をそのまま使う（数値を勝手に変えない）
4. ビルド確認: `npx tsc --noEmit`

---

## 引継ぎ時の注意

- タグ付けルール: **コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと**
- ローカル起動: `cd ~/logos-laravel && ./vendor/bin/sail up -d` → `cd ~/logos-next && npm run dev`
- 終了時: **必ず** `cd ~/logos-laravel && ./vendor/bin/sail down` を実行してから WSL を閉じる
- `.next` キャッシュ起因の hydration エラーが出たら: `rm -rf .next && npm run dev`
