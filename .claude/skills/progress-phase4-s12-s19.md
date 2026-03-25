# Phase 4 アーカイブ：Session 12〜19（早期UI/UX改善）

作成: 2026-03-25（Session 32 にてアーカイブ分割）
対象期間: 2026-03-23〜2026-03-24

---

## Session 12: PostCard UI改修 + 投稿モーダル機能拡張（2026-03-23）

### 変更の目的

情報タブの投稿カード（PostCard）の UI を改善し、
YouTube/X/知恵袋のようにOGPが取れないURLでも「有益情報の本体（スクショ等）」を
投稿できる機能を追加。

**思想:** 有益情報の本体はURLの先にあるのではなく、YouTubeの返信欄・X・知恵袋の回答欄・
ヤフーニュースの返信欄などのスクショにある。それを貼れることが重要。

---

### U-1: PostCard UI改修 ✅（logos-next）

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`、`app/topics/[id]/_types.ts`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| タイトル位置 | 右列先頭（text-lg） | 左列サムネ下（text-sm） |
| カード高さ | min-h-[160px] | min-h-[170px] |
| 概要テキストサイズ | text-[13px] | text-[14px] |
| フォールバック（youtube） | リンクアイコン | YouTube SVGロゴ（白背景・赤ロゴ） |
| フォールバック（X） | リンクアイコン | X SVGロゴ（黒背景・白Xロゴ） |
| 添付画像（custom_thumbnail） | なし | lightboxで拡大表示（URLへのリンクなし） |

**ドメイン判定ロジック:**
```ts
const domain = (() => { try { return new URL(post.url).hostname; } catch { return ""; } })();
const isYoutube = domain.includes("youtube.com") || domain.includes("youtu.be");
const isX = domain.includes("x.com") || domain.includes("twitter.com");
```

**_types.ts への追加:**
```ts
export type Post = {
  ...
  custom_thumbnail?: string | null;  // アップロード画像パス（storage/post-images/〇〇）
};
```

---

### U-2: 投稿モーダル機能拡張 ✅（logos-next + logos-laravel）

#### フロントエンド変更

**ファイル:** `app/topics/[id]/_components/PostModal.tsx`、`app/topics/[id]/hooks/useTopicPage.ts`

| 追加機能 | 詳細 |
|---|---|
| 📎 画像添付トグル | 「サムネが取得できない場合は画像を添付する ▼」→ file input展開 → プレビュー表示 |
| ✏️ タイトル手動入力トグル | 「タイトルを手動入力する ▼」→ テキスト入力欄展開（OGPより優先） |
| 送信切り替え | 画像あり → FormData 送信 / 画像なし → JSON 送信（従来通り） |

**`onSubmit` シグネチャ変更:**
```ts
// Before
onSubmit: (isDraft: boolean) => void;
// After
onSubmit: (isDraft: boolean, imageFile?: File, customTitle?: string) => void;
```

**FormData 送信（画像ありの場合）:**
```ts
const formData = new FormData();
formData.append("url", postUrl);
formData.append("category", postCategory);
formData.append("custom_thumbnail", imageFile);
if (customTitle) formData.append("custom_title", customTitle);
formData.append("is_published", isDraft ? "0" : "1");
// Content-Type は設定しない（ブラウザが multipart/form-data + boundary を自動付与）
res = await fetch(..., { headers: getAuthHeaders(), body: formData });
```

#### バックエンド変更

**ファイル（logos-laravel）:**
- `database/migrations/2026_03_23_*_add_custom_thumbnail_to_posts_table.php`
- `app/Models/Post.php`
- `app/Http/Requests/Api/StorePostRequest.php`
- `app/Http/Controllers/Api/PostApiController.php`

| 変更 | 詳細 |
|---|---|
| Migration | `posts` テーブルに `custom_thumbnail`（string, nullable, after thumbnail_url）追加 |
| Post.php | fillable に `custom_thumbnail` 追加 |
| StorePostRequest.php | `custom_thumbnail`（nullable\|image\|max:5120）・`custom_title`（nullable\|string\|max:255）追加 |
| PostApiController.php | ファイルを `post-images/` に保存・手動タイトルでOGPタイトルを上書き |

**ストレージ:** `Storage::disk('public')->store('post-images', 'public')` → `/storage/post-images/〇〇`
**表示:** `${API_BASE}/storage/${post.custom_thumbnail}`

---

### Gitタグ（Session 12）

- logos-next: `v4.1-session12-ui-postcard`
- logos-laravel: `v4.0-p4-custom-thumbnail`

---

## Session 13: UI/UX 改善方針確立 + Batch 1 実装（2026-03-23）

### UI/UX 改善方針

参考: https://coliss.com/articles/build-websites/operation/work/logic-driven-ui-design-tips.html
採用項目: 1, 2, 4, 6, 7, 8, 9, 11, 12（+10 は Session 12 で実施済み）

**思想: 「感覚ではなく論理に基づく UI 設計」**
- スペースは関連性で決める（8pt グリッド）
- 色以外の視覚手がかりを必ず用意する
- アライメント・radius・ウェイトを統一する
- すべてのインタラクティブ要素にホバーフィードバックを付与する

**実装バッチ計画（トピックページ優先）:**

| バッチ | 採用項目 | 内容 | 状態 |
|---|---|---|---|
| Batch 1 | 10, 7 | カードbg同化 + 全ボタンYouTubeライクホバー | ✅ 完了 |
| Batch 2 | 8, 12, 11 | アライメント統一・radius一貫性・フォントウェイト整理 | ✅ 完了 |
| Batch 3 | 6, 9, 2 | 大見出し字間・小テキストコントラスト・UIコントラスト | ✅ 完了 |
| Batch 4 | 4, 1 | タップターゲット48px・8ptスペーシング | ✅ 完了 |

---

### U-3: PostCard 背景ブレンド ✅（logos-next）

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| カード枠線 | `border border-gray-200 dark:border-transparent` | 削除 |
| カード影 | `shadow-sm` | 削除 |
| カード背景 | `bg-white dark:bg-[#1e1f20]` | `bg-gray-50 dark:bg-[#131314]`（ページ背景と同化） |
| ホバー効果 | なし | `hover:bg-gray-100 dark:hover:bg-white/[0.04]` |
| 補足セクション背景 | `bg-white dark:bg-[#1e1f20]` + 枠線 | `bg-gray-50 dark:bg-[#131314]`（枠線削除） |

---

### U-4: 全ボタン YouTube ライクホバー + Tooltip ✅（logos-next）

**新規追加コンポーネント:** `components/ui/tooltip.tsx`（shadcn / @base-ui/react ベース）

**Tooltip スタイル仕様（YouTube ライク）:**
```
背景: bg-[#212121]/90（暗いチャコール・半透明）
テキスト: text-white text-[13px]
パディング: px-2 py-1（コンパクト）
角丸: rounded（控えめ）
矢印: なし
表示遅延: 500ms
```

**変更ファイル:**

| ファイル | 変更内容 |
|---|---|
| `components/LayoutShell.tsx` | `TooltipProvider delay={500}` で全体ラップ |
| `components/LikeButton.tsx` | `TooltipTrigger` でボタン置き換え・`rounded-full hover:bg-white/10`・"参考になった" tooltip |
| `app/topics/[id]/_components/PostCard.tsx` | 削除: `rounded-full hover:bg-red-500/10` / 補足あり: `hover:bg-white/[0.07]` / 続きを読む・閉じる: `hover:bg-white/[0.05]` / 補足追加: `hover:bg-blue-500/10` |
| `app/topics/[id]/_components/TopicPageClient.tsx` | タブ非アクティブ: `hover:bg-white/[0.05]` / ブックマーク・編集: `rounded-full hover:bg-white/10` |

---

### Gitタグ（Session 13）

- logos-next: `v4.2-session13-ui-hover-tooltip`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 14: UI/UX 改善 Batch 2〜4 + 間隔・アライメント調整（2026-03-23）

### 実装内容

| バッチ / 調整 | 変更ファイル | 変更内容 |
|---|---|---|
| Batch 2（8+12+11） | `PostCard.tsx` | 右列`justify-between`追加・タイトル`font-semibold`・ユーザー名`font-medium`・補足ボタン`rounded-md` |
| Batch 4（4+1）先行 | `PostCard.tsx`, `TopicPageClient.tsx` | カードpadding `p-4`統一・gap `gap-4`・コメントmin-h削除・続きを読むpy拡大・カードリスト`space-y-4` |
| Batch 3（6+9+2） | `PostCard.tsx`, `TopicPageClient.tsx` | h2に`tracking-tight`・timeAgo/補足ラベル`dark:text-gray-400`・区切り`dark:text-gray-500` |
| 間隔・アライメント調整 | `PostCard.tsx`, `TopicPageClient.tsx` | タイトルmb-3・概要mb-5（時系列との間隔拡大）・カードpl-0（サムネ左端をページ基準軸に統一） |

### アライメント設計方針（Session 14 で確立）

- PostCard の左パディングを撤廃（`pl-0`）し、サムネイル左端をタイトル・タブバーと同じ基準軸に揃える
- ホバー背景はカード全幅に広がるためアライメントを崩さない
- 「枠がない状態での初見の印象」を優先する設計

### Gitタグ（Session 14）

- logos-next: `v4.3-session14-ui-spacing-alignment`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 15: ホバー強化・トピック概要折りたたみ・カード間隔調整（2026-03-23）

### 変更ファイル

| ファイル | 変更内容 |
|---|---|
| `app/topics/[id]/_components/TopicPageClient.tsx` | ホバー強化全般・概要折りたたみ実装・カード間隔縮小 |
| `app/topics/[id]/_components/PostCard.tsx` | cursor-pointer追加（続きを読む/閉じる・ユーザーエリア） |
| `components/LikeButton.tsx` | cursor-pointer追加 |

### U-5: ホバー強化 ✅

| 要素 | 変更内容 |
|---|---|
| 並び替えselect（情報タブ・コメントタブ） | `cursor-pointer` 追加 |
| 時系列各行 | `hover:bg-gray-100 dark:hover:bg-[#1e1f20]` + `transition-colors` |
| タイムライン「もっと見る/閉じる」 | ホバー背景 + `cursor-pointer` |
| AI自動生成・AI更新ボタン | `cursor-pointer` |
| タブ切替 | `cursor-pointer` |
| 投稿ボタン | `cursor-pointer` |
| トピック保存（ブックマーク） | `cursor-pointer` |
| サムズアップ（LikeButton） | `cursor-pointer` |
| 続きを読む/閉じる | `cursor-pointer` |
| ユーザーアイコン＋名前 | `cursor-pointer` ラップ（将来プロフィールリンクを見越して） |

### U-6: トピック概要折りたたみ ✅

- 初期状態：**閉じている**（`contentExpanded = false`）
- タイトル直下・左寄せに「▼ トピックの概要を見る」ボタン（展開時「▲ 閉じる」）
- ボタン左端をタイトル左端に揃える（`pl-0`）
- 閉じている時はヘッダー`mb-0` + タブ`mt-0` でタイトル→タブを詰める
- 展開時は従来の間隔（`mb-2` / `mt-4`）を維持

### U-7: カード間隔調整 ✅

- 投稿・分析カードリスト `space-y-4` → `space-y-3`

### Gitタグ（Session 15）

- logos-next: `v4.4-session15-ui-hover-collapse`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 16: サイドバー UI/UX 改善・フォント統一（2026-03-23）

### U-8: サイドバー UI/UX 改善 ✅

**変更ファイル:** `components/Sidebar/NavLinks.tsx`、`components/Sidebar/index.tsx`、`components/AppLogo.tsx`

#### アクティブ状態・アイコン整合・cursor-pointer

| 変更 | 内容 |
|---|---|
| アクティブ状態 | `usePathname()` で現在ページに `bg-gray-700` ハイライト（全リンク対応） |
| 保存トピックアイコン | `w-5 h-5 bg-gray-800` → `w-6 h-6 border border-gray-600 group-hover:bg-gray-600`（Blade統一） |
| 「設定」アイコン | 歯車アイコン追加（他リンクとの整合性） |
| 非PROボタン | `cursor-pointer` 追加（全3ボタン） |
| ホーム・カテゴリ一覧 | `font-bold` 削除（他リンクと統一） |
| セクション間隔 | `space-y-6` → `space-y-3`（hr前後の余白縮小） |
| ハンバーガー | `cursor-pointer` 追加 |

#### アイコンサイズ・アライメント統一

| 変更 | 内容 |
|---|---|
| アイコンサイズ | `w-5 h-5` → `w-6 h-6`（ハンバーガーと同サイズ） |
| strokeWidth | `1.5` → `2`（ハンバーガーと統一） |
| コンテナpadding | `px-3` → `px-4`（アイコン左端 = ハンバーガー左端 = 24px） |
| 上余白 | `py-4` → `py-2`（LOGOSとホームの間隔縮小） |
| テキスト ml | `ml-3` → `ml-5`（LOGOSアイコン左端 = ナビテキスト左端 = 68px） |
| 保存トピック名 ml | `ml-2` → `ml-5`（他ナビ項目と左端統一） |

#### AppLogo コンパクト化（YouTube ライク）

| 変更 | 内容 |
|---|---|
| SVG | `h-8` → `h-6`（ハンバーガー三本線縦幅に収める） |
| テキスト | `text-2xl tracking-widest` → `text-lg tracking-tight`（縮小・字間詰め） |
| gap | `gap-2` → `gap-1.5` |
| ハンバーガーとの余白 | `ml-2` → `ml-3` |

### フォントウェイト全ページ統一 ✅

**ルール:** レギュラー（400）とボールド（700）のみ使用（security.md 準拠）

**変更ファイル:** 15ファイル（全ページ横断）

| 違反パターン | 修正 | 対象 |
|---|---|---|
| `font-black`（900） | → `font-bold` | 全PRO バッジ・スコア表示・通知ロゴ（AppLogoを除く） |
| `font-semibold`（600） | → `font-bold` | 全ページ h1/h2 見出し・カテゴリバッジ |
| `font-medium`（500） | → 削除（font-normal） | ラベル・ユーザー名・メール等 |
| 未読通知テキスト | `font-medium` → `font-bold` | 既読との差別化維持 |

**除外（意図的維持）:**
- `AppLogo.tsx` の `font-black`（"LOGOS"ブランドロゴ）
- サイドバーセクション見出し（保存トピック・マイページ）の `font-semibold`（Blade踏襲・uppercase小文字ラベル慣習）

### トピックページ タイポグラフィ修正 ✅

| 変更 | 内容 |
|---|---|
| トピックタイトル | `tracking-tight` 削除（字詰め解消） |
| 件数表示 | `{N}件の投稿` → `{N} 件の投稿`（数字と単位の間にスペース）（投稿・コメント・分析3箇所） |
| PostCard タイトル | `font-semibold` → `font-bold` |
| PostCard ユーザー名 | `font-medium` 削除 |

### Gitタグ（Session 16）

- logos-next: `v4.5-session16-sidebar-font`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 17: Geminiカラー・フォント・タイポグラフィ統一（2026-03-23）

### U-9: トピックページ タイポグラフィ調整 ✅

**ファイル:** `app/topics/[id]/_components/TopicPageClient.tsx`、`PostCard.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| トピックタイトル | `text-2xl` | `text-xl` |
| トピック概要テキスト | `text-sm` | `text-base` |
| PostCard 投稿概要 | `text-[14px]` | `text-[15px]` |

### U-10: サイドバー幅・トピックページ余白 Gemini ライク調整 ✅

**ファイル:** `components/Sidebar/index.tsx`、`NavLinks.tsx`、`TopicPageClient.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| サイドバー展開幅 | `w-64` (256px) | `w-72` (288px) |
| サイドバー折畳幅 | `md:w-16` (64px) | `md:w-14` (56px) |
| トピックページ余白 | `px-4 sm:px-6 lg:px-8` | `px-6 sm:px-10 lg:px-16` |

### U-11: Gemini テキストカラー全ページ統一 ✅

**ファイル:** `globals.css`（カラー定義）+ 全16ファイル・172箇所

**カラー定義（`globals.css` @theme inline）:**
```css
--color-g-text: #E3E3E3;  /* メインテキスト */
--color-g-sub:  #C4C7C5;  /* サブテキスト */
```

| 置換前 | 置換後 | 意味 |
|---|---|---|
| `dark:text-gray-100/200/300` | `dark:text-g-text` | 明るすぎた白系テキストを Gemini 値に統一 |
| `dark:text-gray-400` | `dark:text-g-sub` | 暗すぎたサブテキストを Gemini 値に統一 |
| `text-white`（layout.tsx body） | `text-g-text` | 基底テキスト色を Gemini 値に |
| サイドバー `text-white`/アイコン `text-gray-400` | `text-g-text`/`text-g-sub` | サイドバーテキスト統一 |

### U-12: Noto Sans JP フォント追加 ✅

**ファイル:** `app/layout.tsx`、`app/globals.css`

- 日本語フォントを未指定（OS依存）→ **Noto Sans JP** に統一
- フォントスタック: `Geist Sans（欧文）, Noto Sans JP（日本語）, sans-serif`

### ハイドレーションエラー修正

- 原因: `.next` キャッシュに古いサーバーレンダリング結果が残存
- 解決: `rm -rf .next && npm run dev` で再ビルド
- **WSL環境での注意**: コード変更後に hydration error が出た場合は `.next` 削除で解決

### Gitタグ（Session 17）

- logos-next: `v4.6-session17-gemini-typography`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 18: ヘッダー・サイドバー・PostCard・情報タブ UI調整（2026-03-24）

### U-13: ヘッダー・サイドバー UI調整 ✅

**変更ファイル:** `components/Header/index.tsx`、`components/Header/SearchBar.tsx`、`components/Header/UserMenu.tsx`、`components/Sidebar/index.tsx`、`components/Sidebar/NavLinks.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| ヘッダー高さ | `h-16` | `h-14`（サイドバー上部と統一） |
| 検索バー縦幅 | `py-2` | `py-2.5` |
| 右ナビ gap | `gap-2` | `gap-4` |
| 通知ベルアイコン | `h-5 w-5` | `h-6 w-6` |
| アバターサイズ | `h-8 w-8` | `h-9 w-9`、iconSize `h-5 w-5` → `h-6 w-6` |
| サイドバー上部行 | `h-16` | `h-14`（ヘッダーと統一） |
| サイドバー ホーム・カテゴリ文字サイズ | デフォルト（他より大きめ） | `text-sm`（`<ul>` に追加・他ナビ項目と統一） |

### U-14: PostCard 構造改善 ✅

**変更ファイル:** `app/topics/[id]/_components/PostCard.tsx`

| 変更 | 内容 |
|---|---|
| ホバー左切れ修正 | `pl-0` → `-ml-3 pl-3`（負マージンで左方向にホバー背景を拡張） |
| カード構造 | 2カラムレイアウト（`flex flex-col md:flex-row gap-4 min-h-[170px]`）を内側ラッパーに分離。補足展開・補足フォームを外側に配置 |
| いいね・削除ボタン位置 | 右列下部に移動（`ml-auto`で右寄せ） |
| 非オーナー アライン | 削除ボタン位置に `invisible pointer-events-none` プレースホルダーを配置し、いいねボタンのアイラインをオーナーと統一 |
| 補足を追加するボタン | アクション行左側（`補足あり`ボタンと同位置）に移動 |
| 補足フォーム | 2カラム外・右列と同位置（flex spacer `hidden md:block md:w-[30%] flex-shrink-0` + `md:gap-4`）に配置 |
| インデント整合 | 2カラムラッパー追加後のインデント不整合を修正（8sp → 10sp）|

### U-15: 情報タブ セレクト UI調整 ✅

**変更ファイル:** `app/topics/[id]/_components/TopicPageClient.tsx`

| 変更 | 内容 |
|---|---|
| セレクト背景 | `bg-transparent` → `bg-white dark:bg-[#131314]`（`bg-transparent` だとOS既定の白背景ドロップダウンで白文字が消えるバグ修正） |
| セレクト枠線 | `border-gray-700` → `border border-gray-200 dark:border-gray-700` |
| セレクトホバー | `hover:bg-gray-100 dark:hover:bg-[#1e1f20]` 追加 |
| セレクトpadding | `px-2 sm:px-3 py-1.5` に調整 |

### Gitタグ（Session 18）

- logos-next: `v4.7-session18-ui-header-postcard`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 19: コメントタブ UI調整（2026-03-24）

### U-16: コメントタブ テストデータ充実 + UI調整 ✅

**変更ファイル:** `app/topics/[id]/_components/TopicPageClient.tsx`、`app/topics/[id]/_components/CommentCard.tsx`

#### テストデータ投入（tinker）

トピック1「AIの規制はどこまで必要か」に投入：
- 親コメント 4件（user1/user2/admin/Test User、異なる論点）
- 返信 9件（補足・他ユーザー返信含む）
- いいね バラつきあり（最大3件）

#### UI調整

| 変更 | 変更前 | 変更後 |
|---|---|---|
| コメント並び替えselect スタイル | `border-gray-300 shadow-sm focus:ring-gray-500` 等 | 情報タブと統一（`border border-gray-200 bg-white dark:bg-[#131314] hover:bg-gray-100 dark:hover:bg-[#1e1f20] transition-colors`） |
| LikeButton 左端アライン | アクション行 `mt-2 flex gap-4` | `-ml-3` 追加でアイコン左端をコンテンツ左に揃え |
| アバター・ユーザー名 | カーソルデフォルト | `cursor-pointer`（親コメント・返信両方） |
| コメント入力 placeholder | `このトピックに対するコメント（※1人1件まで）` | `このトピックに対するあなたの意見を教えてください（※1人1件まで）` |
| 返信フォーム placeholder | `返信を追加...` / `追加の補足を記入...` | `返信を追加する（※1件まで）` / `追加の補足をする（※全5件まで）` |

### Gitタグ（Session 19 前半）

- logos-next: `v4.8-session19-ui-comment-tab`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 19 追記: user2 PRO化・分析タブテストデータ投入（2026-03-24）

### PROユーザー追加

| ユーザー | 変更前 | 変更後 |
|---|---|---|
| user2（id=4, user2@test.com） | is_pro=0 | is_pro=1 |

PROユーザー一覧（ローカル）: admin（id=2）・user1（id=3）・user2（id=4）

### 分析タブ テストデータ投入（tinker）

トピック1「AIの規制はどこまで必要か」に投入：

| ID | タイプ | タイトル | 投稿者 | いいね | supplement |
|---|---|---|---|---|---|
| 1 | tree | AI規制の賛否：論点ロジックツリー | admin | 3 | あり |
| 2 | matrix | AI規制アプローチ 総合評価表 | user1 | 2 | なし |
| 3 | swot | 日本のAI規制導入 SWOT分析 | user2 | 2 | あり |

全件 `is_published: true`

### Gitタグ（Session 19 完了）

- logos-next: `v4.9-session19-analysis-testdata`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）
