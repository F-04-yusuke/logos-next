# Phase 4 進行中：集客・マーケティング基盤

最終更新: 2026-03-25（Session 31 追記）

---

## フェーズの目的

Phase 3 完了後の次ステージ。ユーザー獲得・SEO・UI/UX強化・セキュリティ改善を目指す。
Session 12 より開始。まず UI/UX の大幅改善から着手。

---

## Session 31: PostCard・CommentCard 真の共通コンポーネント化（2026-03-25）

### F-8: PostCard 共通コンポーネント化 ✅（logos-next）

**変更ファイル:**
- `app/topics/[id]/_components/PostCard.tsx`
- `components/mypage/PostCard.tsx`
- `app/dashboard/page.tsx`
- `app/likes/page.tsx`

| 変更内容 | 詳細 |
|---|---|
| `isDraft` prop 追加 | 下書き時: 黄ボーダー・準備中サムネ・タイトル代替テキスト |
| `onLike` optional 化 | 未渡し時は表示のみいいね数（LikeButtonなし） |
| `onDelete?` / `onSupplement?` optional 維持 | トピックページと同じ動作を全ページで共有 |
| mypage版を re-export に差し替え | `SharedPost = Post & { topic }` 定義のみ10行 |
| dashboard に handlePostLike/Delete/Supplement 配線 | 投稿タブでいいね・削除・補足が使えるようになった |
| likes に handlePostLike 配線 | 情報タブでいいねが使えるようになった |

### F-9: CommentCard 共通コンポーネント化 ✅（logos-next）

**変更ファイル:**
- `app/topics/[id]/_components/CommentCard.tsx`
- `components/mypage/CommentCard.tsx`
- `app/dashboard/page.tsx`
- `app/likes/page.tsx`

| 変更内容 | 詳細 |
|---|---|
| 全 action props を optional 化 | onLike?/onReplyLike?/onReply?/onDeleteComment?/onDeleteReply? |
| `replies ?? []` で安全化 | likes API で replies が未ロードの場合もクラッシュしない |
| mypage版を re-export に差し替え | `SharedComment = Comment & { topic }` 定義のみ10行 |
| dashboard に4ハンドラ配線 | コメントタブでいいね・削除・補足返信・返信削除が使えるようになった |
| likes に handleCommentLike 配線 | コメントタブでいいねが使えるようになった |

### B-API: ダッシュボード・参考になったAPI強化 ✅（logos-laravel）

| 変更内容 | 詳細 |
|---|---|
| DashboardApiController | posts/drafts/comments に `is_liked_by_me` を追加 |
| UserApiController（likes） | likedPosts/likedComments に `is_liked_by_me=true` を追加 |
| UserApiController（likes） | user に `avatar` を追加、likedComments に `replies` を追加 |

**技術的負債解消状況:**
| 負債 | 状態 |
|---|---|
| PostCard の2系統実装 | ✅ 解消（topics版1本に統一） |
| CommentCard の2系統実装 | ✅ 解消（topics版1本に統一） |
| AnalysisCard の2系統実装 | 🔴 保留（次フェーズで対応予定） |

---

## Session 30: テキストサイズ全体ワンサイズアップ（2026-03-25）

### U-25: 全テキストワンサイズアップ ✅

| ページ/コンポーネント | ファイル | 主な変更 |
|---|---|---|
| トピックページ | `TopicPageClient.tsx`・`PostCard.tsx`・`CommentCard.tsx`・`AnalysisCard.tsx` | 全テキストワンサイズアップ |
| トピックページ調整 | `TopicPageClient.tsx` | 概要テキスト xl→lg・タイムライン/タブ text-lg |
| タイムライン日付列 | `TopicPageClient.tsx` | `w-20 sm:w-24` → `w-24 sm:w-28`（折り返し防止） |
| PostCard レイアウト | `PostCard.tsx` | サムネ35%・右列65%・縦幅180px |
| 「時系列」ラベル短縮 | `TopicPageClient.tsx` | 「前提となる時系列」→「時系列」 |
| ホームページ | `HomeClient.tsx` | 全テキストワンサイズアップ・カスタムpxを標準スケールへ |
| ダッシュボード | `app/dashboard/page.tsx` | ページ固有テキスト（タイトル・タブ・空メッセージ等）ワンサイズアップ |
| 参考になった | `app/likes/page.tsx` | 同上 |
| サイドバー | `components/Sidebar/NavLinks.tsx` | `text-xs`→sm / `text-sm`→base |

**注記:** Session 30 時点でカードコンポーネント内テキストは未対応。Session 31 の共通コンポーネント化により、トピックページ版（更新済み）が自動的に全ページで共有されたため解消済み。

---

## Session 29: 本番バグ修正・テストデータ投入（2026-03-25）

### B-1: Vercel本番で情報投稿が500エラー ✅（logos-laravel側修正）
- マイグレーション3件未適用（`add_custom_thumbnail`・`add_notification_types`・`create_personal_access_tokens`）
- `create_personal_access_tokens` をべき等化（`Schema::hasTable` チェック追加）→ `migrate --force` で解決

### B-2: Vercel本番でOGPサムネイルが取得できない ✅（logos-laravel側修正）
- `file_get_contents` がさくらサーバーでHTTPS取得失敗 → `curl` に切り替え
- YouTubeはさくらIPがbot判定を受けフルHTMLが返らない → oEmbed API 対応
- `OgpService.php` を全面書き直し（`curlGet` ヘルパー追加・YouTube分岐）

### テストデータ投入（本番Vercel確認用）✅
- トピック3（EV環境問題・admin作成）・トピック4（リモートワーク・user1作成）を新規作成
- 全4トピックに情報タブ・コメントタブ・分析タブのデータを投入
- 分析3種類（ロジックツリー・総合評価表・SWOT）＋ 下書きパターンも準備

---

## Session 28: 分析ツール AIアイコン刷新・ロジックツリー YouTube風UI全面刷新（2026-03-25）

### U-22: 分析ツール3本 AIアシスタントUI刷新 ✅

**ファイル:** `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`

| 改修項目 | 内容 |
|---|---|
| AIアイコン刷新 | Gemini風ダイヤ → シアン雷ボルト（`AiIcon` 関数・`from-cyan-300 via-cyan-500 to-teal-600` グラデーション背景） |
| ヒントテキスト移動 | カード内初期メッセージ廃止 → 「AIアシスタント」見出し右隣に `text-[11px]` テキストとして配置 |
| アイコン位置 | 見出しテキスト左に `w-5 h-5 rounded` グラデーション背景付きアイコンを配置 |
| 初期チャット廃止 | `chatMsgs` 初期値を `[]`（空）に変更（3ツール共通） |

### U-23: 総合評価表 テーブル角丸統一 ✅

**ファイル:** `app/tools/matrix/page.tsx`

| 改修項目 | 内容 |
|---|---|
| テーブル外枠 | `rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden` ラッパー追加 |
| スクロール | 内側に `overflow-x-auto custom-scroll` を別divで配置（2段ネスト構成で `overflow-hidden` と競合回避） |

### U-24: ロジックツリー YouTube風UI全面刷新 ✅

**ファイル:** `app/tools/tree/page.tsx`

| 改修項目 | 内容 |
|---|---|
| `NodeEditor` 全面再設計 | `flex gap-3` レイアウト（アバター列 `w-8` + コンテンツ列 `flex-1`） |
| アバター円 | 自動採番ラベル（自1 / A1 / B2 等）を円形バッジで表示（自分: `bg-blue-600`・他: `bg-gray-800`） |
| スタンスバッジ | `rounded-full border` 付きセレクトを見出し行に配置（色はスタンス別） |
| 本文 | `text-[15px]` textarea（auto-resize対応） |
| 返信ボタン | `mt-1 text-[13px]` で「＋ 返信を追加」ボタンをコンテンツ下部に配置 |
| SPEAKERS 拡充 | 「自分 (自)」を先頭に・ユーザーA〜E・その他の7択 |
| STANCES 拡充 | 主張/反論/賛成・補足/疑問/解決策/根拠/事実/仮説/前提 の9択 |
| getStanceStyle 拡充 | 解決策(blue)・根拠(purple)・事実(teal)・仮説(orange)・前提(indigo) の色スタイル追加 |
| 垂れ下がり線バグ修正 | 子ノードを親 flex row の外に出す（`children section: outside parent flex row`）ことで `flex-1` の延伸を親コンテンツ高さに限定 |
| 線のつなぎ目修正 | 全縦線を `border-l-2 marginLeft:15px` に統一・全コネクターを `left=-29px` に統一（外端 x=15px で一致） |
| T字コネクター | `border-l-2 height:calc(100%+16px)` + `border-b-2 width:29px` の2要素構成 |
| L字コネクター | `border-l-2 border-b-2 rounded-bl-lg width:29px height:16px` の1要素構成 |

**Gitタグ:** `v6.8-session28-start`→`v6.9-session28-ai-icon`→`v6.10-session28-tree-ux-start`→`v6.11-session28-tree-ux-complete`

---

## Session 27: 分析ツール3本 豪華化・UI統一（2026-03-24）

### U-21: 分析ツール豪華化（tree / matrix / swot）✅

**ファイル:** `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`

| 改修項目 | 内容 |
|---|---|
| `alert()` 廃止 | 保存成功・エラー時のブラウザ alert → `fixed top-4 right-4` インページトースト（緑/赤・3秒自動消去） |
| スケルトン化 | `if (isLoading \|\| !user) return null`（真っ白）→ `animate-pulse` スケルトン |
| h1 SVGアイコン | ツールごとの色付きSVGアイコンを保持（ツリー:紫、マトリクス:紫table、SWOT:緑4象限） |
| テーマ入力 統一 | 3ツールのテーマ入力をSWOTスタイルに統一（コンパクトカード + インライン「AIで自動生成」ボタン） |
| AIアシスタント h2 | 「AI SWOT・アシスタント」等 → シンプルに「AIアシスタント」に統一 |
| 保存ボタン | 「ツリーを保存する」等 → 「保存する」に統一 |
| 横幅統一 | tree `max-w-4xl`→`max-w-5xl`・matrix `max-w-7xl`→`max-w-5xl`・swot `max-w-5xl`（変更なし） |
| Gemini Chat UI | チャット背景 `#131314`（ページ背景と同化）・ユーザー発言=`#1e1f20`枠付きカード・AI回答=グラデーション4角星アイコン+バブルなしテキスト |
| Chat入力エリア | `#1e1f20`背景（`border-t`線なし） |
| Chat外枠 | `border border-gray-800 rounded-xl` を付与（入力エリアは外枠内に収める） |
| matrix 外枠削除 | テーブル外側の `bg-[#1e1f20] border` ラッパー削除 → テーブルを広げ色階層で視認性確保 |
| matrix 色階層 | header/footer: `#252627`・左列: `#1e1f20`・データセル: `#1a1b1c`（hover: `#252627`） |
| matrix 最高スコア強調 | `tfoot` の最高スコアパターンに `ring-2 ring-blue-500 rounded` 付与 |
| SWOT 背景色 | 各象限に薄い色背景（box1: `dark:bg-blue-900/5`・box2: `dark:bg-red-900/5`・box3: `dark:bg-green-900/5`・box4: `dark:bg-yellow-900/5`） |
| 説明テキスト移動 | ツリー: 「各コメントに自動でID...」テキストを「分岐を追加」ボタン直上に移動 |
| matrix 初期値整理 | 「パターンA: 米国に同調」等→「パターンA」「パターンB」「評価項目1」に汎用化 |

---

## Session 26: ログイン・登録・トピック作成・編集ページ豪華化・分析ツール設計調査（2026-03-24）

### U-19: ログイン・登録画面 豪華化 ✅

**ファイル:** `app/login/page.tsx`、`app/register/page.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| h2タイトル | 「LOGOSを始める」「新規アカウント作成」を中央配置（カード内タイトルはアクセントバー不要） |
| ボタン | `transition-colors` → `duration-100` 統一 |

### U-20: トピック作成・編集ページ 豪華化 ✅

**ファイル:** `app/topics/create/page.tsx`、`app/topics/[id]/edit/page.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| ローディング | 「読み込み中...」テキスト → `animate-pulse` スケルトン |
| h2タイトル | `pl-3 border-l-4 border-indigo-500` アクセントバー追加 |
| 保存・作成ボタン | `transition-colors` → `duration-100` 統一 |

### D-2: 分析ツール 設計調査・改修方針決定 ✅

`app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx` を読み込み調査。
次フェーズ（Phase 5）での実装に向けた方針を決定。

**確認した問題点と優先度:**
1. **最優先:** `alert()` → インページトースト通知（保存成功・エラー）
2. **高:** h1/h2に `border-l-2 border-yellow-500/60` アクセントバー（PRO系ルール適用）
3. **高:** ローディング `return null` → スケルトン
4. **中:** matrixの最高スコアパターンを強調（`ring-2 ring-blue-500`等）
5. **中:** SWOTの4象限ボックスに薄い色背景追加

**PROゲート画面について:** 既存のモーダル（PRO会員限定・機能一覧・アップグレードCTA付き）が
訴求を担っているため改修不要。LP完成後にそこへの導線を追加する。

---

## Session 25: 残ページ豪華化（ダッシュボード・参考になった・閲覧履歴・通知・カテゴリ・プロフィール）（2026-03-24）

### U-18: 残ページ 豪華化 ✅

| ページ | ファイル | 主な変更 |
|---|---|---|
| ダッシュボード | `app/dashboard/page.tsx` | スケルトン・indigoタブ・ページヘッダーアクセントバー・セクション件数表示 |
| 参考になった | `app/likes/page.tsx` | スケルトン・indigoタブ・ページヘッダー |
| 閲覧履歴 | `app/history/page.tsx` | スケルトン・ページヘッダー・indigoカテゴリバッジ・日付見出しアクセントバー |
| 通知 | `app/notifications/page.tsx` | スケルトン・ページヘッダーアクセントバー化 |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | スケルトン・ページヘッダー・ホバー白もや・indigo hover統一 |
| カテゴリ管理(admin) | `app/categories/page.tsx` | スケルトン・ページヘッダー・セクション見出しアクセントバー |
| カテゴリ別トピック一覧 | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | h1アクセントバー・duration-100統一 |
| プロフィール | `app/profile/page.tsx` | スケルトン・ページヘッダー・セクション見出しアクセントバー |

**共通適用事項:** ローディングスケルトン化・ページタイトルアクセントバー・`duration-100`統一

---

## Session 24: サイドバー・トピックページ豪華化・デザインルール策定（2026-03-24）

### U-13: サイドバー UI 豪華化・ホバー高速化 ✅

**ファイル:** `components/Sidebar/index.tsx`、`components/Sidebar/NavLinks.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| ホバー速度 | `transition-colors` → `duration-100` に統一（150ms→100ms） |
| ホバー色 | `hover:bg-gray-800` → `hover:bg-white/[0.04]`（白もやに統一） |
| アクティブ状態 | `bg-gray-700` → `bg-white/[0.06]` + 左端 indigo-500 縦バー（`before:` pseudo） |
| セクション見出し | テキストのみ → `border-l-2` アクセントバー付き（保存トピック・マイページ・分析ツール） |
| 保存トピックアイコン | `border border-gray-600` → `bg-indigo-500/15 rounded-md`（indigo pill） |
| ハンバーガーボタン | `hover:bg-gray-900` → `hover:bg-white/[0.04]` |

### U-14: トピックページ UI 豪華化・ヘッダー刷新 ✅

**ファイル:** `app/topics/[id]/_components/TopicPageClient.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| タイトル | `border-l-4 border-indigo-500` 左アクセントバー追加 |
| 「概要を見る」 | テキストのみ → シェブロンSVG + `duration-100` |
| カテゴリバッジ | 枠線のみ → pill + indigo tint（`text-[10px] font-bold text-indigo-300 px-2`・トップページ統一） |
| カテゴリリンク先 | `/?category=ID` → `/categories/ID` に統一 |
| 作成者・日時 | テキスト2行 → `UserAvatar` + インライン1行 |
| 保存ボタン | 無彩色 → 保存済み=indigo・ホバー=indigo tint |
| タブ | アクティブ色を `border-indigo-500` に統一（analysis タブのみ `border-yellow-500` 維持）+ `duration-100` |
| タブ下ヘッダー | `border-l-2 border-gray-700` アクセントバー |
| ローディング | テキスト → パルスアニメーションスケルトン |

### U-15: 保存トピックアイコン → カテゴリ頭文字化 ✅（logos-next + logos-laravel）

**フロント:** `components/Sidebar/index.tsx`・`components/Sidebar/NavLinks.tsx`
**バックエンド:** `app/Http/Controllers/Api/UserApiController.php`（logos-laravel）

- `/api/user/bookmarks` に `category_char` フィールドを追加（categories を eager load・ID昇順で先頭の名前の1文字目）
- カテゴリなしの場合は `null` → bookmark SVGアイコンでフォールバック
- 複数カテゴリ付きトピックは ID が一番若いカテゴリを採用

### D-1: 豪華要素デザインルール策定・design-spec.md 更新 ✅

`.claude/skills/design-spec.md` に「豪華要素ルール」セクションを新設。
ホバー速度・色・カテゴリバッジ・アクセントバー・スケルトンの具体的なクラス値を定義。
次セッション以降の他ページ改修で数値を統一するための基準として機能する。

**教訓:** コンポーネントのクラス名変更後に hydration mismatch エラーが発生することがある。
対処: `rm -rf .next && npm run dev`（CLAUDE.md にも記載済み）

---

## Session 23: トップページ刷新・カテゴリ別トピックページ新設・APIバグ修正（2026-03-24）

### U-11: トップページ（HomeClient）豪華版リデザイン ✅

**ファイル:** `app/_components/HomeClient.tsx`

| 変更箇所 | 変更内容 |
|---|---|
| トピックカード | ボックス廃止 → フラット `-ml-3 pl-3` パターン・`hover:bg-white/[0.04]` |
| テキストカラー | `text-gray-100/400/500` → `text-g-text` / `text-g-sub` に統一 |
| 日時表示 | `formatDate` → `timeAgo`（相対表示・lib/utils.ts 共通関数使用） |
| ローディング | 「読み込み中...」テキスト → パルスアニメーションスケルトン |
| カテゴリバッジ | 角丸四角 → pill（rounded-full）+ indigo tint |
| ランキングバッジ | 単色 → 金銀銅グラデーション（1位〜3位） |
| セクション見出し | 🆕🔥 絵文字 → アクセントバー（青/オレンジ） |
| sort select | hover なし → `cursor-pointer` + `hover:bg-[#1e1f20]` |
| 新規作成ボタン | ＋テキスト → SVGアイコン + `rounded-lg` |
| `user?.is_pro` | バグあり → `!!user?.is_pro` に修正 |
| カテゴリタブ行 | 件数バッジ・日時に固定幅（`w-7` / `w-14`）を付与しカラム揃え |

### U-12: カテゴリ別トピック一覧ページ新設 ✅

**新規ファイル:**
- `app/categories/[id]/page.tsx` — SSR（初期トピックのみ取得）
- `app/categories/[id]/_components/CategoryTopicsClient.tsx` — CSR（カテゴリ名解決・ソート・ページネーション）

**変更ファイル:**
- `app/_components/HomeClient.tsx` — 「もっと見る」リンク `/?category=ID` → `/categories/ID`
- `app/category-list/page.tsx` — 大分類・中分類リンク `/?category=ID` → `/categories/ID`

**技術的負債（将来改善）:**
カテゴリ名の解決を SSR で行おうとしたが、Server Component から `http://localhost/api/categories` を
fetch しても中分類が null を返す不具合（原因不明・Node.js 単体では正常）。
暫定措置として `CategoryTopicsClient` の `useEffect` でクライアント側から `/api/categories` を取得。
将来の改善: httpOnly Cookie 認証導入後に SSR 化を再試みるか、`unstable_noStore` 等で安定化を図る。

### B-7: TopicApiController カテゴリフィルタ追加 ✅（logos-laravel）

**ファイル:** `app/Http/Controllers/Api/TopicApiController.php`

**背景:** `GET /api/topics?category=ID` が Blade 版ではフィルタされるが API 版では全件返していた。
Blade 版の `TopicController` には実装済みだったが `TopicApiController` に未移植。

**修正内容:**
- 大分類 ID 指定時に中分類も `whereHas` で検索する処理を追加
- `per_page` クエリパラメータ（最大50）対応を追加
- logos-laravel コミット: `fix: TopicApiController に category フィルタと per_page パラメータを追加`

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

---

## Session 20: 分析タブ UI全面刷新・トピックページ UI基準確立（2026-03-24）

### U-17: 分析タブ UI全面刷新 ✅

**変更ファイル:** `app/topics/[id]/_components/AnalysisCard.tsx`、`app/topics/[id]/_components/TopicPageClient.tsx`、`app/topics/[id]/hooks/useTopicPage.ts`、`app/topics/[id]/_components/CommentCard.tsx`、`app/analyses/[id]/page.tsx`

#### AnalysisCard.tsx 主要変更

| 変更 | 変更前 | 変更後 |
|---|---|---|
| カード外枠背景 | `p-4 bg-white dark:bg-[#1e1f20] border shadow-sm` | `-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors` |
| プレビューボックス | `bg-gray-50 dark:bg-[#131314] maxHeight:400px` | `bg-white dark:bg-[#1e1f20] h-[200px]`（固定高さ） |
| グラデーション | `h-16 from-gray-50 dark:from-[#131314]` | `h-8 from-white dark:from-[#1e1f20]` |
| ヘッダー行 | `flex flex-col`（2行） | `flex items-center gap-2 flex-wrap`（1行・ユーザー名+バッジ横並び） |
| 補足表示 | 常時展開 | `📎 補足あり ▼/▲` トグルボタン（「もっと見る」右隣） |
| 補足追加ボタン | `bg-yellow-500` | `text-blue-500 hover:bg-blue-500/10 rounded-full` |
| 投稿ボタン | `bg-yellow-500` | `bg-white border border-gray-300 dark:bg-[#1e1f20]`（グレー系） |
| テーマ表示 | なし | tree/matrix: `data.theme`、swot: `analysis.title`（`font-bold text-sm`） |

#### プレビューをフル表示と統一

| 分析タイプ | プレビュー内容（`/analyses/[id]` と同一構造） |
|---|---|
| tree | カード型ノード（`bg-gray-50 p-2.5 rounded-lg border`）、子ノード2件表示 |
| matrix | 実テーブル（バッジ: ◎最適/〇良い/△懸念/×不可 + reason テキスト） |
| swot | `border-t-4` カラーボックス4分割（英ラベル+日本語サブ+色付き箇条書き） |

#### 並び替え機能追加（人気順/新着順/古い順）

- `useTopicPage.ts` に `analysisSort`・`sortedAnalyses` 追加
- `TopicPageClient.tsx` に情報タブと同スタイルの select 追加

#### コメントタブ テキストサイズ調整

- `CommentCard.tsx`: コメント本文 `text-[14px]` → `text-[15px]`（情報タブ投稿概要と統一）

#### Next.js 16 params Promise 修正

- `app/analyses/[id]/page.tsx`: `params.id` を直接参照 → `const { id } = use(params)` に修正

### トピックページ UI 基準確立 ✅

- `app/topics/[id]/` が全ページの UI デザイン基準として確立
- ルールを `.claude/skills/design-spec.md` の「トピックページ UI ルール」セクションに文書化
- `CLAUDE.md` に「トピックページが UI 基準」として明記

### Gitタグ（Session 20）

- logos-next: `v5.0-session20-analysis-ui`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 21: マイページ群 UI/UX 統一（2026-03-24）

### U-21: マイページ群 5ページ UI統一 ✅

トピックページ基準（`design-spec.md`）に従い以下5ページを改修。

| ページ | タグ | 主な変更 |
|---|---|---|
| ダッシュボード | `v5.2-session21-dashboard` | 外枠ボックス除去・カードフラット化・ホバー・-ml-3アライメント・コメント15px・タブcursor-pointer |
| 参考になった | `v5.3-session21-likes` | 同上 |
| 閲覧履歴 | `v5.4-session21-history` | 同上 |
| 通知 | `v5.5-session21-notifications` | 外枠除去・ホバー統一・TypeBadge border色修正 |
| トピック作成 | `v5.6-session21-topic-create` | 外枠除去・cursor-pointer |

### U-22: PostCard をトピックページ基準に構造統一 ✅

ダッシュボード・参考になったの PostCard をトピックページと同一の visual 構造に揃えた。

| 修正項目 | 内容 |
|---|---|
| 列幅 | `md:w-1/4` → `md:w-[30%]` / `md:w-3/4` → `md:w-[70%]` |
| 最小高さ | `min-h-[170px]` 追加 |
| YouTube/X ロゴ | URL から自動判定してロゴ表示（トピックページと同一 SVG） |
| コメントテキスト | `text-[13px]` → `text-[15px]` |
| 続きを読む | `line-clamp-3` + truncate 検知で展開ボタン表示 |
| 補足 | インライン青ボックス → 📎補足あり▼ トグル |
| 分析タブ 編集ボタン | `!analysis.is_published` 条件付きで表示 |

### Blade 参照ルール更新 ✅

- UIデザインのみの変更（色・ホバー等）→ Blade 参照**不要**に変更
- 機能追加・ロジック変更・新規移植 → 従来通り Blade 必読

### Gitタグ（Session 21）

- logos-next: `v5.7-session21-postcard-align`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Session 22: マイページ共通コンポーネント化・バグ修正（2026-03-24）

### U-23: PostCard/CommentCard/AnalysisCard 共通コンポーネント化 ✅

**新規ファイル:**
- `components/mypage/PostCard.tsx` — `SharedPost` 型 + `PostCard`（isDraft 対応・YouTube/X ロゴ・補足トグル・続きを読む）
- `components/mypage/CommentCard.tsx` — `SharedComment`・`SharedReply` 型 + `CommentCard`（返信折りたたみトグル・トピックページ準拠）
- `components/mypage/AnalysisCard.tsx` — `SharedAnalysis` 型 + `AnalysisCard`（タイプ別カラーボーダー・公開/非公開バッジ・閲覧リンク）

**`lib/utils.ts`:** `timeAgo` 関数を共通ユーティリティとして追加・各ページのインライン定義を削除

**改修:**
- `app/dashboard/page.tsx` — インライン PostCard/CommentCard/ThumbUpIcon/timeAgo 削除・共通コンポーネントをインポート
- `app/likes/page.tsx` — 同上

**CommentCard の UI 改善（トピックページ準拠）:**
- 返信を常時表示 → 折りたたみトグル「X件の返信」ボタン（色: `text-[#3ea6ff]`）

**AnalysisCard の UI 改善:**
- タイプ別左ボーダーアクセント（青/紫/緑）
- 「非公開」バッジ（点線ボーダー）追加
- 公開済み分析に「閲覧▶」リンク追加

### U-24: タブアライメント修正 ✅

dashboard/likes のタブコンテナに `px-4 sm:px-6` 追加。
カード（`-ml-3 pl-3` のコンテンツ領域）とタブの左端を視覚的に揃えた。

### B-1: analyses/[id] スコア計算バグ修正 ✅

**ファイル:** `app/analyses/[id]/page.tsx`

**バグ:** 総合評価表の ◎〇△× バッジ消失・合計スコアが文字列結合（例: `"01100"`）

**原因:** API が `score` を文字列（`"3"` 等）で返すにもかかわらず、厳密等値比較（`=== 3`）・数値加算を行っていた。Blade からの移植時の見落とし。

**修正:**
```ts
// Before
const val = e.score ?? -1;
// After
const val = e.score !== undefined && e.score !== null ? Number(e.score) : -1;
```

型定義も `score?: number | string` に修正済み。

### さくらサーバー: user2 作成 ✅

- user2 / user2@test.com / password / is_pro=1

### Gitタグ（Session 22）

- logos-next: `v5.8-session22-mypage-components`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善

**完了済み:**
- トピックページ Batch 1〜4（Session 13〜14）
- ホバー強化・概要折りたたみ（Session 15）
- サイドバー UI改善・フォント統一（Session 16）
- Geminiカラー・フォント・タイポグラフィ統一（Session 17）
- ヘッダー・サイドバー・PostCard・情報タブ UI調整（Session 18）
- コメントタブ UI調整（Session 19）
- 分析タブ UI全面刷新・トピックページ UI基準確立（Session 20）
- マイページ群 5ページ UI統一（Session 21）
- マイページ共通コンポーネント化・バグ修正（Session 22）

**次のターゲット（Session 23 予定）:**
- トップページ（トピック一覧）UI/UX 改善
- プロフィールページ UI/UX 改善
- カテゴリページ UI/UX 改善

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（現在未着手・登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）の適切な設定・h1/h2タグ整理
- **Stripe Webhook受け口**: 決済コード作り込みなし・受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化（Phase 2 暫定実装の解消）
- **/analyses/[id] SSR化**: Cookie認証導入後に対応（F-1 残タスク）
- **パスワードリセット機能**: SMTP設定（さくら or SendGrid）と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等（本人確認・質の高い議論コミュニティの維持）
- **SNSログイン**: Laravel Socialite（Google / X）
- **インフラ移行**: さくら → AWS（将来）
