# LOGOS デザイン仕様（最終版）

最終更新: 2026-04-02（Session 49・Phase 4 完了）

---

## 1. デザイン思想

- **YouTube・Gemini・X（Twitter）・GitHub・Linear・Vercel ライクなモダン洗練デザイン**
- ダークモード/ライトモード OS 設定追従（Session 43 確立）
- 余分なボーダー・箱型デザインを避ける（背景色の微細な違いで表現）
- 「感覚ではなく論理に基づく UI 設計」（Session 13 策定 — 8pt グリッド・色以外の視覚手がかり・アライメント統一）
- 賛否（賛成・反対）UIは導入しない（2項対立でまとめられないテーマが多いため）

---

## 2. カラーシステム

### 2-1. セマンティックカラー変数（Session 43 確立・全ページで必ず使うこと）

`globals.css` の CSS カスタムプロパティに定義済み。OS のダーク/ライト設定に自動追従。

| クラス | 用途 | ライトモード | ダークモード |
|---|---|---|---|
| `bg-logos-bg` | ページ背景 | #F9FAFB | #131314 |
| `bg-logos-surface` | カード・入力背景 | #FFFFFF | #1e1f20 |
| `bg-logos-hover` | ホバー背景・スケルトン | #F3F4F6 | #2a2b2c |
| `bg-logos-elevated` | Elevated 要素（ドロップダウン等） | #E5E7EB | #303030 |
| `border-logos-border` | ボーダー全般 | #E5E7EB | #374151 |
| `text-logos-text` | 本文テキスト（見出し・本文・ユーザー名等） | #111827 | #E3E3E3 |
| `text-logos-sub` | サブテキスト（日時・カテゴリ・メタ情報等） | #6B7280 | #C4C7C5 |

**禁止パターン（ハードコード色 → セマンティック変数に置き換えること）:**
- `text-gray-*`（単体）→ `text-logos-text` / `text-logos-sub`
- `bg-gray-50` / `bg-gray-100` → `bg-logos-hover`
- `bg-white` 単体 → `bg-logos-surface`
- `bg-[#131314]` / `bg-[#1e1f20]` 直接指定 → `bg-logos-bg` / `bg-logos-surface`
- `dark:bg-*` / `dark:text-*` のみ（ライト未対応）→ セマンティック変数に統一

### 2-2. Gemini テキストカラー（Session 17 確立・セマンティック変数の別名）

`globals.css` の `@theme inline` に定義済みのカスタムクラス:

| クラス | 変数 | HEX（ダーク） | 用途 |
|---|---|---|---|
| `text-g-text` | `--color-g-text` | `#E3E3E3` | ≒ `text-logos-text` のダーク値 |
| `text-g-sub` | `--color-g-sub` | `#C4C7C5` | ≒ `text-logos-sub` のダーク値 |

**新規コンポーネント作成時は `text-logos-text` / `text-logos-sub` を優先する。**
`dark:text-g-text` / `dark:text-g-sub` はライトモード未対応なので注意。

### 2-3. アクセントカラー

| 用途 | 色 |
|---|---|
| 一般アクセント（タブ・ボタン・バッジ） | `indigo-500` / `indigo-600` |
| PRO・分析ツール系 | `yellow-400/500` → `orange-500` グラデーション |
| AI アシスタントアイコン | `cyan-300 → cyan-500 → teal-600` グラデーション |
| 未読通知ハイライト | `bg-indigo-50 dark:bg-indigo-500/10` |
| SWOT 象限チント | `blue/red/green/yellow-900/5`（ダーク）|

---

## 3. フォント（Session 17 確立）

- **欧文**: Geist Sans（Vercel製・Next.js最適化済み）
- **日本語**: Noto Sans JP（Google Fonts・全OS統一）
- フォントスタック: `var(--font-geist-sans), var(--font-noto-sans-jp), sans-serif`
- `layout.tsx` で両フォントをロード済み・`globals.css` の `--font-sans` に設定済み

---

## 4. フォントウェイト（Session 16 確立・全ページ適用済み）

- **regular（400）と bold（700）の 2 種類のみ使用**
- `font-semibold`（600）・`font-medium`（500）は使わない
- 見出し・ユーザー名・ボタンラベル: `font-bold`
- 本文・メタ情報・補足的テキスト: regular（クラスなし）

**例外（意図的維持）:**
- `AppLogo.tsx` の `font-black`（"LOGOS"ブランドワードマーク）
- サイドバーセクション見出し（保存トピック・マイページ等）の `font-semibold`（uppercase 小文字ラベル慣習）

---

## 5. テキストサイズ基準

### 5-1. ページレベル目標（Session 33 確定ルール）

**テキストサイズを変更するときは最初から目標サイズに直接変換すること。段階的に2回に分けない。**

| 用途 | 目標サイズ |
|---|---|
| ページタイトル（h1・h2） | `text-2xl` |
| タブ（ページ内タブ切替） | `text-base font-semibold`（-mb-px アンダーライン型） |
| メイン本文・リストタイトル・ラベル・input/textarea | `text-lg` |
| サブテキスト・説明文・注記 | `text-base` |
| 時刻・メタ情報・細かい補助テキスト | `text-sm` |
| カテゴリバッジ | `text-[10px]`（変更禁止） |

### 5-2. カード・共通コンポーネント内テキスト

| 用途 | サイズ |
|---|---|
| カード内リンクタイトル | `text-sm font-bold` |
| 投稿概要・コメント本文 | `text-[15px]` |
| ユーザー名 | `text-[13px]` |
| 日時・メタ情報 | `text-[11px]` |
| バッジ・ラベル | `text-[10px] font-bold` |

**注意（Session 33 の反省）:**
- カードコンポーネント（PostCard / CommentCard / AnalysisCard）は**触らない**（共通化済み）
- 分析ツールのAIチャット（ChatBubble）・AI入力・送信ボタン・AIアシスタント h2 も同ルール適用
- 分析ツールのテーブル内（matrix セル理由テキスト等）は `text-xs` → `text-sm` 止まりでOK（スペース都合）

---

## 6. 全ページ共通デザインシステム（Sessions 43-47 確立・全ページ適用済み）

### 6-1. ページヘッダー — グラデーントアクセントバー（h-6）

```tsx
<h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
  <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  ページタイトル
</h1>
// PRO系ページ（トピック作成・編集・分析ツール等）
// from-yellow-400 to-orange-500
```

### 6-2. セクションヘッダー — グラデーントアクセントバー（h-4）

```tsx
<h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
  セクション名
</h3>
// PRO/分析系: from-yellow-400 to-orange-500
```

### 6-3. タブ — アンダーライン型（最終確立版・Session 44）

```tsx
// コンテナ
<div className="flex border-b border-logos-border overflow-x-auto overflow-y-hidden">
// タブボタン（ベース）
const base = "py-2.5 px-4 sm:px-5 text-base font-semibold transition-all duration-150 focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer -mb-px border-b-2";
// アクティブ（indigo）: border-indigo-500 text-logos-text
// アクティブ（yellow: 分析タブ）: border-yellow-500 text-logos-text
// 非アクティブ: border-transparent text-logos-sub hover:text-logos-text hover:border-logos-border
```

**採用理由:** コンテナ背景なし = 浮かない・GitHub/Linear/Vercel と同スタイル・ライト/ダーク両対応

### 6-4. アクションボタン — グラデーション pill

```tsx
// Primary（indigo: 投稿・一般アクション）
"bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50"

// PRO/分析系（yellow-orange）
"bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all"
```

- **黄色（yellow）ボタンは分析タブの主アクション・PRO系アクション以外では使わない**

### 6-5. select ドロップダウン — appearance-none + カスタム chevron

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

### 6-6. カテゴリバッジ — ライト/ダーク両対応（pill スタイル）

```tsx
"px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors duration-100"
```

- サイズ: `text-[10px] font-bold`（`text-xs` は使わない）
- padding: `px-2`（`px-2.5` は使わない）

### 6-7. PostCard — SNS スタイル（枠なし・ホバーのみ）

```tsx
// 枠なし・ホバー時のみ背景色変化（Twitter/X・Reddit と同スタイル）
"-ml-3 pl-3 py-4 pr-4 rounded-xl flex flex-col transition-colors hover:bg-logos-hover"
```

### 6-8. フォームスタイル（Session 45 確立）

```tsx
// ラベル
"text-base font-bold text-logos-text"

// 入力フィールド
"bg-logos-surface rounded-lg border-logos-border focus:border-indigo-500 focus:ring-indigo-500"

// カテゴリ選択エリア
"bg-logos-hover rounded-xl border-logos-border"
```

---

## 7. ホバー・インタラクション

| 用途 | クラス |
|---|---|
| 通常アイテム（カード・リスト行・ナビ） | `hover:bg-logos-hover transition-colors duration-100` |
| select / 操作ボタン | `hover:bg-logos-elevated transition-colors duration-100` |

- **`hover:bg-gray-800` は使わない**（セマンティック変数に統一）
- **`transition-colors` だけ（duration指定なし）は使わない**（`duration-100` を必ず付ける）
- **`<button>` `<select>` `<a>`** すべてに明示的に `cursor-pointer` を付ける
- アバター画像・ユーザー名エリア（将来プロフィールリンク対応を見越して）も付ける

---

## 8. アクティブ状態（ナビ・タブ）

### サイドバーナビ アクティブ状態

```tsx
"bg-logos-hover text-logos-text relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-indigo-500"
```

- 左端に `indigo-500` の細い縦バー（`w-0.5`）を付ける

### タブ アクティブ状態

```tsx
// 通常タブ: border-b-2 border-indigo-500 text-logos-text
// 分析タブ: border-b-2 border-yellow-500 text-logos-text
```

---

## 9. カード・レイアウト共通パターン

### 左端アライメント（-ml-3 pl-3 パターン）

- カード外枠に `-ml-3 pl-3 py-4 pr-4` を付与する
- コンテンツ左端がセクション見出し（「〇件の投稿」等）と同軸に揃う
- ホバー背景は左に 12px はみ出してよい（初期状態の見た目を優先）

### プレビューとフル表示の統一

- カード内プレビューはフル表示ページ（`/analyses/[id]` 等）と**同一の HTML 構造・CSS クラス**を使う
- 高さを固定（`h-[200px]` or `h-[400px]`）して `overflow-hidden` + グラデーション(`h-8`)でフェードアウト
- 独自アレンジ（記号・別レイアウト）は加えない → ユーザーに違和感を与える

---

## 10. ローディングスケルトン

```jsx
<div className="animate-pulse">
  <div className="h-7 bg-logos-hover rounded-md w-2/3 mb-3" />   {/* タイトル */}
  <div className="h-4 bg-logos-hover rounded w-1/4 mb-8" />       {/* サブ */}
  <div className="space-y-3">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-logos-hover rounded-lg" />)}
  </div>
</div>
```

- 「読み込み中...」テキストは使わない
- `bg-white/[0.06]` などのダーク専用値は使わない → `bg-logos-hover` に統一

---

## 11. AppLogo（最終デザイン・Session 47 確立）

**Λ（ギリシャ文字ラムダ）グラデーション円形バッジ ＋ ワードマーク**

- **Λ記号の意味:** λόγος（ロゴス）の語源。論理・理性・言葉の象徴
- 円形バッジ: `blue-500 → indigo-600` グラデーション、`h-6 w-6`
- 白い Λ ストローク（polyline, `strokeWidth=2.5`, rounded caps）
- drop shadow 廃止（主要アプリのロゴに準拠）
- ワードマーク: `font-black tracking-tight text-logos-text`（単色・グラデーション廃止）
- `gap-2` でバッジとテキストのキャップハイトを均等に

---

## 12. セクション見出し・アクセントバー詳細

| 用途 | クラス |
|---|---|
| ページタイトル（h1） | グラデーションアクセントバー h-6（セクション 6-1 参照） |
| セクション見出し（h3） | グラデーションアクセントバー h-4（セクション 6-2 参照） |
| サイドバーセクション見出し | `pl-2 border-l-2 border-logos-border text-xs font-semibold text-logos-sub tracking-wider uppercase` |
| 分析ツール見出し（PRO系） | グラデーションアクセントバー h-4（yellow-orange） |

---

## 13. 補足（supplement）UI パターン

- 補足がある場合: フッターの「もっと見る」右隣に `📎 補足あり ▼/▲` トグルボタン
- トグル展開でフッター直下にテキスト表示（常時展開しない）
- 補足追加ボタン: `text-blue-500 hover:bg-blue-500/10 rounded-full`（オーナーのみ）
- 補足フォームもフッター直下展開

---

## 14. ページ別背景色の方針

- **ホームページ（トピック一覧）・カテゴリ一覧**: `bg-logos-bg`（現状満足済み・変更不要）
- トピック詳細・ダッシュボード等: `bg-logos-bg` で統一

---

## 15. レスポンシブ

- モバイルファーストで実装
- sm: 640px / md: 768px / lg: 1024px
- スマホ専用: `MobileBottomNav.tsx`（`sm:hidden`）・ボトムナビ5タブ
- スマホ用 `pb-14 sm:pb-0` でコンテンツ隠れ対策

---

## 16. アクセシビリティ（必須）

- `aria-hidden`・`aria-label` 等を必ず付ける
- スクリーンリーダー対応（`sr-only` クラス活用）
- タップ領域は最低 44px 確保

---

## 17. 重要アクションUI原則

- いいね・保存ボタンが隠れていないこと
- アイコン＋テキストのペアを基本とする（アイコン単独は避ける）
- アバター配置: 「左側に丸いアイコン ＋ 右側に小さな文字で名前と時間」を全画面で統一

---

## 18. コメント・階層UI

- 親コメントに対して補足（返信）がインデントされたツリー状にぶら下がる形式
- 返信は最初から全表示せず「〇件の返信 ▼」のアコーディオンでスムーズに開閉
- Next.js では `useState` で制御

---

## 19. 入力フォーム

- 下線のみ（focusでハイライト）のGoogle/YouTubeライクなデザイン
- 入力文字数に合わせて高さが自動拡張するUX
- `useRef` + `useLayoutEffect` で textarea の自動リサイズ（Session 41 実装）

---

## 20. 情報密度

- `text-[13px]` や `text-xs` を多用して情報密度を高める
- 要素の詰め込みすぎを防ぐ

---

## 21. 没デザイン・変遷記録

Phase 4 を通じて試みたが最終的に変更・廃止されたデザインの記録。

### 21-1. カテゴリタブ: 均等幅ボックス型 → Yahoo!風ボックス → pill 型横スクロール

**経緯:**
1. **Session 34（U-26b）**: 均等幅タブ → **Yahoo!風ボックス型**に変更
   - `flex-1` 均等幅・アクティブ `bg-[#131314]`・非アクティブに `border-b`
   - コンテンツエリアとタブが `bg-[#131314]` で接続感
   - 外枠: `border border-white/[0.08] rounded-xl overflow-hidden`
2. **Session 35（U-27）**: Yahoo!風を詳細改善（文字数比率でタブ幅調整）
3. **Session 41（U-x）**: **pill 型横スクロールに刷新**（最終採用）
   - `shrink-0` 自然幅ピル型・`overflow-x-auto` スマホ横スクロール対応
   - アクティブ: `bg-indigo-600` 塗りつぶし

**没理由:** Yahoo!風ボックス型はPC向けには良いが、スマホで項目が増えると幅が詰まりすぎる。pill 型横スクロールの方がスマホ対応しやすく、既存のSNSアプリのカテゴリ切替とも近い。

---

### 21-2. タブデザイン: セグメントコントロール → アンダーライン型

**経緯:**
1. **Session 43**: ライトモード対応のタイミングでカテゴリタブを**セグメントコントロール風**（白ピル + `text-indigo-600` + `shadow-sm`）にリデザイン
2. **Session 44**: トピックページ UI 全面リデザインで**アンダーライン型**に変更（最終採用）
   - コンテナ: `border-b border-logos-border`
   - アクティブ: `border-b-2 border-indigo-500 text-logos-text`

**没理由:** セグメントコントロールはコンテナ背景が必要でライト/ダーク切替時に「浮き感」が変わる。GitHub/Linear/Vercel などのプロ向けツールが採用するアンダーライン型の方が洗練されており、ライト/ダーク両対応が容易。

---

### 21-3. AppLogo: 3D等角投影「L」→ Λ（ラムダ）グラデーション円形バッジ

**経緯:**
1. **初期デザイン（Phase 1〜4 前半）**: 3D等角投影の「L」字（5枚の多角形パスで構成）
   - `font-black tracking-tight text-2xl` のワードマーク「LOGOS」との組み合わせ
   - ワードマークの「L」と SVG の「L」が重複する問題があった
2. **Session 16**: `AppLogo.tsx` コンパクト化（`h-8`→`h-6`、テキスト縮小）
3. **Session 47**: **Λ（ラムダ）グラデーション円形バッジに全面刷新**（最終採用）

**没理由:** 3D等角投影「L」は視覚的に手がかりが多く重い印象。ワードマークと記号の「L」重複も非論理的。Λ（ラムダ）は λόγος（ロゴス）の語源を直接表し、意味的に深い。円形バッジは主要アプリのロゴトレンドに準拠。

---

### 21-4. ホバー色: `bg-gray-800` → `bg-white/[0.04]` → `bg-logos-hover`

**経緯:**
1. **Phase 4 初期**: `hover:bg-gray-800`（ダーク専用固定色）
2. **Session 24（U-13）**: `hover:bg-white/[0.04]`（白もや、ダークモード専用透明度）に統一
3. **Session 43**: `hover:bg-logos-hover`（セマンティック変数）に統一（最終採用）

**没理由:** `bg-gray-800` は色固定でライトモード非対応。`bg-white/[0.04]` はダークモード専用（ライトでは薄すぎて見えない）。セマンティック変数 `bg-logos-hover` がライト/ダーク両対応の正解。

---

### 21-5. カード: `border` + `shadow-sm` → フラットデザイン

**経緯:**
1. **Phase 2〜Phase 4 初期**: カードに `border border-gray-200 dark:border-transparent shadow-sm` を付与
2. **Session 13（U-3）**: PostCard で枠線・影を削除 → ページ背景と同化（フラット）

**没理由:** 枠線・影の付いたカード型デザインは「箱」感が強く、YouTube/X/Reddit のようなモダンなリスト表示と相容れない。背景色の微細な差異とホバーエフェクトだけで十分な視覚的分離が得られる。

---

### 21-6. アクセントバー: `border-l-4 border-indigo-500` → グラデーントアクセントバー span

**経緯:**
1. **Session 24〜42**: ページタイトル・セクション見出しに `pl-3 border-l-4 border-indigo-500` 左ボーダーを使用
2. **Session 44**: 独立した `<span>` 要素によるグラデーントアクセントバーに変更（最終採用）
   - `inline-block w-1 h-6/h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600`

**没理由:** `border-l-4` はシンプルだがグラデーションが使えず単色になる。また `border-l` は左パディングが必要で、ライト/ダーク切替時に `border-gray-*` 系との統一が難しい。独立 span によるグラデーションバーの方が視覚的に豊かで、h-6（ページタイトル）と h-4（セクション）のサイズ差で階層も表現できる。

---

### 21-7. AIアシスタントアイコン: Gemini風ダイヤ → シアン雷ボルト

**経緯:**
1. **Session 27 以前**: Gemini 風ダイヤ（4角星）アイコン（グラデーション）
2. **Session 28（U-22）**: シアン雷ボルト（`from-cyan-300 via-cyan-500 to-teal-600`）に変更（最終採用）

**没理由:** Gemini ダイヤは Gemini ブランドの模倣感が強い。雷ボルトは「AI の素速い応答・エネルギー」を連想させ、LOGOS 独自のトーンに合う。

---

### 21-8. `alert()` → インページトースト（Session 27 廃止）

**経緯:**
1. **Phase 2〜3**: 保存成功・エラー時にブラウザネイティブの `alert()` ダイアログ
2. **Session 27**: `fixed top-4 right-4` のインページトースト（緑/赤・3秒自動消去）に統一

**没理由:** `alert()` はブラウザのネイティブダイアログでデザインが統一できない。モーダルブロッキングで UX も悪い。インページトーストの方がモダンで操作を妨げない。

---

### 21-9. ダークモード固定 → OS設定追従（Session 43 変更）

**経緯:**
1. **Phase 2〜Session 42**: `<html className="dark">` でダークモード固定
2. **Session 43**: `@custom-variant dark (@media (prefers-color-scheme: dark))` で OS 設定追従に変更

**没理由:** ダークモード固定はライトモード利用者を排除する。OS設定追従にすることで、より幅広いユーザーに対応できる（特に卒業制作発表時のデモ等でライト環境での表示が改善）。

---

## Blade参照表（実装前に必ず読む）

| Next.jsファイル | 参照するBladeファイル |
|---|---|
| components/Header.tsx | ~/logos-laravel/resources/views/layouts/navigation.blade.php |
| components/Sidebar.tsx | ~/logos-laravel/resources/views/layouts/sidebar.blade.php |
| app/login/page.tsx | ~/logos-laravel/resources/views/auth/login.blade.php |
| app/register/page.tsx | ~/logos-laravel/resources/views/auth/register.blade.php |
| app/page.tsx | ~/logos-laravel/resources/views/topics/index.blade.php |
| app/topics/[id]/page.tsx | ~/logos-laravel/resources/views/topics/show.blade.php |
| app/topics/create/page.tsx | ~/logos-laravel/resources/views/topics/create.blade.php |
| app/notifications/page.tsx | ~/logos-laravel/resources/views/notifications/index.blade.php |
| app/dashboard/page.tsx | ~/logos-laravel/resources/views/dashboard.blade.php |
| app/categories/page.tsx | ~/logos-laravel/resources/views/categories/list.blade.php |
| app/profile/page.tsx | ~/logos-laravel/resources/views/profile/edit.blade.php |
| app/history/page.tsx | ~/logos-laravel/resources/views/history/index.blade.php |
| app/likes/page.tsx | ~/logos-laravel/resources/views/likes/index.blade.php |
| app/topics/[id]/edit/page.tsx | ~/logos-laravel/resources/views/topics/edit.blade.php |
| app/analyses/[id]/page.tsx | ~/logos-laravel/resources/views/analyses/show.blade.php |
| app/tools/tree/page.tsx | ~/logos-laravel/resources/views/tools/tree.blade.php |
| app/tools/matrix/page.tsx | ~/logos-laravel/resources/views/tools/matrix.blade.php |
| app/tools/swot/page.tsx | ~/logos-laravel/resources/views/tools/swot.blade.php |

共通UIパーツ参照:
| 用途 | 参照先 |
|---|---|
| エビデンスカード | ~/logos-laravel/resources/views/components/post-card.blade.php |
| コメントカード | ~/logos-laravel/resources/views/components/comment-card.blade.php |
| 分析カード | ~/logos-laravel/resources/views/components/analysis-card.blade.php |
| PRO誘導モーダル | ~/logos-laravel/resources/views/components/pro-modal.blade.php |
| ドロップダウン | ~/logos-laravel/resources/views/components/dropdown.blade.php |
