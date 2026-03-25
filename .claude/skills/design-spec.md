# LOGOS デザイン仕様

## カラーシステム
- ベース背景: `#131314`
- カード等要素の背景: `#1e1f20`
- ボーダー: `border-gray-700`
- コントラスト比: `#131314` 背景に対して文字色 4.5:1 以上を確保すること

### テキストカラー（Gemini準拠・Session 17確立）
`globals.css` の `@theme inline` に定義済みのカスタムクラスを使うこと:

| クラス | 変数 | HEX | 用途 |
|---|---|---|---|
| `text-g-text` | `--color-g-text` | `#E3E3E3` | メインテキスト（見出し・本文・ユーザー名等） |
| `text-g-sub` | `--color-g-sub` | `#C4C7C5` | サブテキスト（日時・カテゴリ・メタ情報等） |

**新規コンポーネント作成時のルール:**
- ダークモードのメインテキスト → `dark:text-g-text`（`dark:text-gray-100/200/300` は使わない）
- ダークモードのサブテキスト → `dark:text-g-sub`（`dark:text-gray-400` は使わない）
- `text-white` はボタン・バッジ等の白抜き文字のみ使用可

## フォント（Session 17確立）
- **欧文**: Geist Sans（Vercel製・Next.js最適化済み）
- **日本語**: Noto Sans JP（Google Fonts・全OS統一）
- フォントスタック: `var(--font-geist-sans), var(--font-noto-sans-jp), sans-serif`
- layout.tsx で両フォントをロード済み・globals.css の `--font-sans` に設定済み

## デザイン基準
- YouTube・Gemini・X（Twitter）ライクなモダンで洗練されたデザイン
- ダークモード固定
- 余分なボーダー・箱型デザインは避ける（背景色の微細な違いで表現）
- ホバー時: `hover:shadow-md` または `hover:scale-105`
- 賛否（賛成・反対）UIは導入しない（2項対立でまとめられないテーマが多いため）

---

## 豪華要素ルール（Session 24 確立・全ページ共通）

新規ページ・既存ページ改修時は以下を必ず適用すること。数値を変えない。

### ホバー
| 用途 | クラス |
|---|---|
| 通常アイテム（ナビ・カード等） | `hover:bg-white/[0.04] transition-colors duration-100` |
| select / 操作ボタン | `hover:bg-[#1e1f20] transition-colors duration-100` |
- **`hover:bg-gray-800` は使わない**（白もやに統一）
- **`transition-colors` だけ（duration指定なし）は使わない**（duration-100 を必ず付ける）

### アクティブ状態（ナビ・タブ）
```
bg-white/[0.06] text-g-text
relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-indigo-500
```
- 左端に indigo-500 の細い縦バー（`w-0.5`）を付ける
- タブのアクティブ下線: `border-b-2 border-indigo-500 text-white font-bold`（分析タブのみ `border-yellow-500`）

### カテゴリバッジ（pill スタイル）
```
px-2 py-0.5 text-[10px] font-bold rounded-full
bg-indigo-500/10 text-indigo-300 border border-indigo-500/20
hover:bg-indigo-500/20 transition-colors duration-100
```
- サイズ: `text-[10px] font-bold`（`text-xs` は使わない）
- 色: `text-indigo-300`（`text-indigo-400` は使わない）
- padding: `px-2`（`px-2.5` は使わない）

### セクション見出し・タイトルアクセントバー
| 用途 | クラス |
|---|---|
| ページタイトル（h2等） | `pl-3 border-l-4 border-indigo-500` |
| セクション見出し（「N件の投稿」等） | `pl-2 border-l-2 border-gray-700` |
| サイドバーセクション見出し | `pl-2 border-l-2 border-gray-600 text-xs font-semibold text-g-sub tracking-wider` |
| 分析ツール見出し（PRO系） | `pl-2 border-l-2 border-yellow-500/60 text-xs font-semibold text-yellow-500 tracking-wider` |

### ローディングスケルトン
```jsx
<div className="animate-pulse">
  <div className="h-7 bg-white/[0.06] rounded-md w-2/3 mb-3" />   {/* タイトル */}
  <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-8" />       {/* サブ */}
  <div className="space-y-3">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-white/[0.04] rounded-lg" />)}
  </div>
</div>
```
- 「読み込み中...」テキストは使わない
- カード高さは用途に応じて調整可（`h-32` / `h-24` 等）

---

## トピックページ UI ルール（Phase 4 Session 12〜20 で確立・全ページ共通基準）

**トピックページ（`app/topics/[id]/`）が UI 基準。他ページ改修時はここに準拠すること。**

### カード背景・ホバー
- カード外枠背景: `bg-gray-50 dark:bg-[#131314]`（ページ背景と同化）
- `border` / `shadow-sm` は**削除**（浮き上がり感を出さない）
- ホバー: `hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors`

### 左端アライメント（-ml-3 pl-3 パターン）
- カード外枠に `-ml-3 pl-3 py-4 pr-4` を付与する
- コンテンツ左端がセクション見出し（「〇件の投稿」等）と同軸に揃う
- ホバー背景は左に 12px はみ出してよい（初期状態の見た目を優先）

### 並び替え select スタイル（情報・コメント・分析タブ共通）
```
text-xs sm:text-sm rounded border border-gray-200 dark:border-gray-700
bg-white dark:bg-[#131314] dark:text-white
px-2 sm:px-3 py-1.5 cursor-pointer
hover:bg-gray-100 dark:hover:bg-[#1e1f20]
transition-colors focus:outline-none focus:border-gray-400 dark:focus:border-gray-500
```

### 投稿・アクションボタン（グレー系）
```
bg-white border border-gray-300 hover:bg-gray-50
dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800
font-bold py-1.5 px-3 sm:px-4 rounded text-xs sm:text-sm transition-colors cursor-pointer
```
- **黄色（yellow）ボタンは分析タブの主アクション以外では使わない**
- 補足投稿ボタン: `bg-blue-500 hover:bg-blue-600`（PostCard 準拠）

### cursor-pointer
- `<button>` `<select>` `<a>` すべてに明示的に `cursor-pointer` を付ける
- アバター画像・ユーザー名エリア（将来プロフィールリンク対応を見越して）も付ける

### フォントウェイト（Session 16 確立・全ページ適用済み）
- **regular（400）と bold（700）の 2 種類のみ使用**
- `font-semibold`（600）・`font-medium`（500）は使わない
- 見出し・ユーザー名・ボタンラベル: `font-bold`
- 本文・メタ情報・補足的テキスト: regular（クラスなし）

### テキストサイズ基準（トピックページ）
| 用途 | サイズ |
|---|---|
| カード内リンクタイトル | `text-sm font-bold` |
| 投稿概要・コメント本文 | `text-[15px]` |
| ユーザー名 | `text-[13px]` |
| 日時・メタ情報 | `text-[11px]` |
| バッジ・ラベル | `text-[10px] font-bold` |

### ページレベルのテキストサイズ目標（Session 33 確定ルール）

**テキストサイズを変更するときは最初から目標サイズに直接変換すること。段階的に2回に分けない。**

| 用途 | 目標サイズ |
|---|---|
| ページタイトル（h1・h2） | `text-2xl` |
| タブ（ページ内タブ切替） | `text-lg` |
| メイン本文・リストタイトル・ラベル・input/textarea | `text-lg` |
| サブテキスト・説明文・注記 | `text-base` |
| 時刻・メタ情報・細かい補助テキスト | `text-sm` |
| カテゴリバッジ | `text-[10px]`（変更禁止） |

**参照元:** トピックページ（`app/topics/[id]/`）がUIの基準。タブ = `text-lg`、ページタイトル = `text-2xl`。

**変換の注意（Session 33 の反省）:**
- カードコンポーネント（PostCard / CommentCard / AnalysisCard）は**触らない**（共通化済み）
- 分析ツールのAIチャット（ChatBubble）・AI入力・送信ボタン・AIアシスタント h2 も同ルール適用
- 分析ツールのテーブル内（matrix セル理由テキスト等）は `text-xs` → `text-sm` 止まりでOK（スペース都合）

### 補足（supplement）UI パターン
- 補足がある場合: フッターの「もっと見る」右隣に `📎 補足あり ▼/▲` トグルボタン
- トグル展開でフッター直下にテキスト表示（常時展開しない）
- 補足追加ボタン: `text-blue-500 hover:bg-blue-500/10 rounded-full`（オーナーのみ）
- 補足フォームもフッター直下展開

### プレビューとフル表示の統一
- カード内プレビューはフル表示ページ（`/analyses/[id]` 等）と**同一の HTML 構造・CSS クラス**を使う
- 高さを固定（`h-[200px]`）して `overflow-hidden` + グラデーション(`h-8`)でフェードアウト
- 独自アレンジ（記号・別レイアウト）は加えない → ユーザーに違和感を与える

### ページ別背景色の方針
- **ホームページ（トピック一覧）・カテゴリ一覧**: コンテンツエリアの背景色は現状維持。ヘッダーと同じ背景色に揃える必要はない（満足済み）
- トピック詳細・ダッシュボード等: `bg-[#131314]` でヘッダーと統一

## レスポンシブ
- モバイルファーストで実装
- sm: 640px / md: 768px / lg: 1024px

## アクセシビリティ（必須）
- `aria-hidden`・`aria-label` 等を必ず付ける
- スクリーンリーダー対応（`sr-only` クラス活用）
- タップ領域は最低 44px 確保

## 重要アクションUI原則
- いいね・保存ボタンが隠れていないこと
- アイコン＋テキストのペアを基本とする（アイコン単独は避ける）
- アバター配置: 「左側に丸いアイコン ＋ 右側に小さな文字で名前と時間」を全画面で統一

## コメント・階層UI
- 親コメントに対して補足（返信）がインデントされたツリー状にぶら下がる形式
- 返信は最初から全表示せず「〇件の返信 ▼」のアコーディオンでスムーズに開閉
- Alpine.js の `x-show` 相当の実装で対応（Next.js では useState で制御）

## 入力フォーム
- 下線のみ（focusでハイライト）のGoogle/YouTubeライクなデザイン
- 入力文字数に合わせて高さが自動拡張するUX

## 情報密度
- `text-[13px]` や `text-xs` を多用して情報密度を高める
- 要素の詰め込みすぎを防ぐ

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
