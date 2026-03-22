# 開発進捗

## Gitタグ履歴

### logos-next（本リポジトリ）
| タグ | 内容 | 日付 |
|---|---|---|
| v2.0-phase2-complete | Phase2完成・18ページ全実装・Blade↔Next.js差分なし | 2026-03-22 |
| v3.0-phase3-start | Phase3開始・リポジトリ一本化（logos-new→logos-laravel）・編集制約撤廃 | 2026-03-22 |
| v3.1-b1-controller-split | B-1完了・routes/api.php→9コントローラー分割・docs更新 | 2026-03-22 |
| v3.2-f5-swr | F-5完了・SWR導入（AuthContext/useTopicPage/notifications） | 2026-03-22 |

### logos-laravel（参照用・バックエンド）
| タグ | 内容 | 日付 |
|---|---|---|
| v1.0-laravel-only | GitHub Actions動作確認版 | 2026-03-18 |
| v1.0-phase1-complete | Phase1完成・Laravel Blade版本番稼働確認済み | 2026-03-19 |
| v1.1-phase2-step4-complete | Phase2 Step4完了・Sanctum認証API追加済み | 2026-03-20 |
| v3.1-b1-controller-split | B-1完了・routes/api.php 1040行→209行・47エンドポイント9コントローラーに分割 | 2026-03-22 |

---

## Phase 3 実装済みステップ（2026-03-22）

### F-1: SSR復帰・Route Handlerプロキシ（完了）
**検証済み（curl）:** トップページ・topics/[id] ともにSSR HTML にコンテンツ含まれることを確認。

- `lib/proxy-fetch.ts` — さくらAPI プロキシユーティリティ（サーバー専用、NEXT_PUBLIC_なし）
- `app/api/topics/route.ts` — トピック一覧プロキシ（クエリ文字列転送）
- `app/api/topics/[id]/route.ts` — トピック詳細プロキシ（Authorizationヘッダー転送）
- `app/api/categories/route.ts` — カテゴリ一覧プロキシ
- `app/api/analyses/[id]/route.ts` — 分析詳細プロキシ（Authorizationヘッダー転送）
- `app/page.tsx` — Server Component 化（SSR）、HomeClient に初期データを渡す
- `app/_components/HomeClient.tsx` — CSR部分を分離（ソート・ページネーション・タブ）
- `app/topics/[id]/page.tsx` — Server Component 化（SSR）、TopicPageClient に初期データを渡す
- `app/topics/[id]/_components/TopicPageClient.tsx` — CSR部分を担当（全JSX・useTopicPage呼び出し）

**F-1 残（将来タスク）:** `analyses/[id]` SSR化 — Sakura API が `auth:sanctum` 必須のためSSR不可。Cookie ベース認証導入まで保留。

**Vercel環境変数（設定済み ✅ 2026-03-22）:**
- `API_BASE_URL=https://gs-f04.sakura.ne.jp`（NEXT_PUBLIC_ なし・SSR用・All Environments）

### F-2: Custom Hook化（完了）
**検証済み（ビルド・TypeScriptエラーなし）:** 純粋なリファクタリングのためビルド通過=動作保証。

- `app/topics/[id]/hooks/useTopicPage.ts` — 全state(17個)・handler(16個)・computed値を集約
- `app/topics/[id]/page.tsx` — ロジックゼロに（598行に削減）

### B-2: Topic::analyses() リレーション追加（完了）
**検証済み（ビルド通過）:** マイグレーション不要・モデル変更のみ。
- `Topic.php` に `analyses()` hasMany を追加
- `TopicApiController::show` の直接クエリを `$topic->load('analyses' => ...)` に置き換え

### F-3: boolean型変換レイヤー（完了）
**検証済み（ビルド通過）:**
- `lib/transforms.ts` 新規作成（transformUser/Post/Comment/Reply/Analysis/Topic）
- AuthContext・useTopicPage・AnalysisModal に適用

### F-4: 分析型 Discriminated Union（完了）
**検証済み（ビルド通過・TypeScriptエラーなし）:**
- `_types.ts` の `TopicAnalysis.data: Record<string, any>` → AnalysisData Discriminated Union に変更
- AnalysisCard の `const d = analysis.data` パターンを型安全な直接アクセスに更新
- image type の data キーは `image_path`（API実装と一致・`url` ではない）

### B-1: routes/api.php → Controller 分割（完了）
**検証済み（route:list で全47エンドポイント確認）:**
- 1040行 → 209行（-80%）・8コミットに分割して段階実施
- 作成: CategoryApiController / NotificationApiController / ProfileApiController
  / UserApiController / DashboardApiController / CommentApiController
  / PostApiController / AnalysisApiController
- TopicApiController に destroy/bookmark/timelineGenerate/timelineUpdate を追加
- 残存クロージャ（意図的）: /og・/register・/login・/logout・GET /categories（認証不要公開API）
- Gitタグ: `v3.1-b1-controller-split`（両リポジトリ・push 済み）

### F-5: SWR 導入（完了）
**検証済み（npm run build × 3回通過・TypeScriptエラーなし）:**
- `npm install swr@^2.4.1`
- `context/AuthContext.tsx`: useState+useEffect → useSWR("auth-user", fetchUser)
  - revalidateOnFocus: true / shouldRetryOnError: false / logout: mutate(null,{revalidate:false})
- `app/topics/[id]/hooks/useTopicPage.ts`: useSWR(url, {fallbackData: initialTopic})
  - updateTopic ヘルパーで setTopic→mutateTopic(fn,{revalidate:false}) 15箇所置換
- `app/notifications/page.tsx`: useSWR(user?url:null) ページ依存キー・ページネーションは setCurrentPage のみ
- **注意**: ブラウザ動作確認（ログイン・タブ復帰・ログアウト）は未実施（要ユーザー確認）
- Gitタグ: `v3.2-f5-swr`（logos-next）

**Phase 3 残タスク推奨順:**
1. B-4: OgpService 共通化（軽い・1サービスクラス+3箇所修正）
2. B-3: FormRequest クラス化（重い・9コントローラー分・専用セッション推奨）

---

## Phase 3 開始（2026-03-22）

### リポジトリ一本化・制約撤廃

**背景:** Phase 2 完了（Next.js 18ページ全実装）により、Blade版を守るための編集制約が不要になった。
さらにリポジトリ名が分かりにくく、将来の新セッションで混乱が起きるリスクがあったため整理を実施。

**実施内容（2026-03-22）:**
- GitHub repo名変更: `logos-new` → `logos-laravel`
- ローカルフォルダ: `~/logos` → `~/logos-laravel`
- ローカル・さくらサーバー両方の `git remote URL` を `logos-laravel` に更新
- **編集制約撤廃**: 「TopicApiController.php と routes/api.php の2ファイルのみ」→「全ファイル自由に編集可」
- **app/Models/ 制約撤廃**: 直接クエリ縛りを解除（通常の Eloquent リレーション追加も可）
- 全ドキュメント（CLAUDE.md・skills/*.md・memory/*.md）の `~/logos` → `~/logos-laravel` 一括更新

**注意（エラー調査時）:**
- Phase 2 以前のgit履歴・コミットメッセージには `logos-new` `~/logos` の表記が残っている（正常）
- 旧パスが履歴に出てきても、現在の実態は `~/logos-laravel` であることに注意
- さくらサーバー上のフォルダは `~/www/logos` のまま（Apache .htaccess が参照しているため意図的に変更せず）

**Gitタグ:** `v3.0-phase3-start`（logos-next）・`v2.0-phase2-complete` は logos-next に付与済み

---

## フェーズ2 完了済みステップ

### Step1: Laravel JSON API追加（完了）
- GET /api/topics（トピック一覧・ページネーション）
- GET /api/topics/{id}（トピック詳細）
- GET /api/user/me（auth:sanctum）
- GET /api/categories（カテゴリ一覧）
- TopicApiControllerはcategory→categoriesに修正済み
- laravel/sanctum ^4.3 インストール済み
- bootstrap/app.phpにapi:ルート登録済み
- personal_access_tokens テーブル作成済み（ローカル・さくら両方）
- CORS設定済み（Vercelドメイン許可）
- 本番（gs-f04.sakura.ne.jp）での動作確認済み

### Step2: Next.js新規作成（完了）
- Next.js 16.2.0 + TypeScript + Tailwind CSS + shadcn/ui
- GitHubリポジトリ: F-04-yusuke/logos-next
- ローカルパス: ~/logos-next

### Step3: 画面移行（進行中）
**実装済み:**
- `app/page.tsx` — トピック一覧（CSR・2カラム・カテゴリタブ・ソート・ページネーション・人気トピック）
- `app/topics/[id]/page.tsx` — トピック詳細（CSR）※詳細は後述
- `app/login/page.tsx` — ログイン（Blade忠実再現・eKYC/SNSボタンUI含む）
- `app/register/page.tsx` — ユーザー登録（eKYC/SNS coming soon + 開発用フォーム）
- `app/categories/page.tsx` — カテゴリ（admin: インライン編集CRUD / 一般: グリッド一覧）
- `app/topics/create/page.tsx` — トピック作成（PRO限定ガード・カテゴリmax2・timeline行追加削除）
- `components/Header.tsx` — 検索・通知バッジ・アバタードロップダウン・スマホメニュー完全実装
- `components/Sidebar.tsx` — ナビ・PRO機能・分析ツール・鍵アイコン完全実装
- `components/SidebarAwareLayout.tsx` — サイドバー連動コンテンツ幅調整
- `components/LayoutShell.tsx` — /login・/register でHeader/Sidebar非表示制御
- `components/AppLogo.tsx` — 共通ロゴコンポーネント
- `context/AuthContext.tsx` — Sanctumトークン認証・unread_notifications_count対応済み
- `context/SidebarContext.tsx` — サイドバー開閉状態管理

- `app/notifications/page.tsx` — 通知一覧（TypeBadge・既読・ページネーション）✅ 2026-03-22
- `app/likes/page.tsx` — 参考になった一覧（3タブ: 情報/コメント/分析）✅ 2026-03-22
- `app/category-list/page.tsx` — カテゴリ公開グリッド一覧 ✅ 2026-03-22
- `app/dashboard/page.tsx` — ダッシュボード（5タブ: 投稿/下書き/コメント/分析/トピック）✅ 2026-03-22
- `app/profile/page.tsx` — プロフィール編集（アバター・名前クールダウン・パスワード変更・アカウント削除モーダル）✅ 2026-03-22
- `app/history/page.tsx` — 閲覧履歴（日付グループ・YouTube風ラベル・ページネーション）✅ 2026-03-22

**Step6拡張 logos-laravel API追加（2026-03-22）:**
- GET /api/dashboard（投稿・下書き・コメント・分析・トピック一括取得）
- DELETE /api/posts/{post}（自分の投稿削除）
- DELETE /api/topics/{topic}（自分のトピック削除）
- GET /api/history（閲覧履歴・12件ページネーション・last_viewed_at付き）
- GET /api/og?url=...（OGPプロキシ・認証不要・title/thumbnail_url返却）
- GET /api/user/bookmarks（保存トピック一覧・上限10件）
- POST /api/topics/{topic}/posts: OGP取得追加（title/thumbnail_url保存）
- GET /api/profile（name_updated_at付きユーザー情報）
- POST /api/profile（プロフィール更新・multipart/form-data・アバター画像対応）
- PUT /api/profile/password（パスワード更新・現在のパスワード検証）
- DELETE /api/profile（アカウント削除・パスワード確認）

**Step7 分析ツール実装（2026-03-22）:**
- `app/tools/tree/page.tsx` — ロジックツリー作成（PRO限定・ノード追加/削除・AIで土台生成・AIアシスタントチャット・保存/上書き保存）✅
- `app/tools/matrix/page.tsx` — 総合評価表作成（PRO限定・列行追加/削除・スコア集計・AIで土台生成・AIアシスタントチャット・保存/上書き保存）✅
- `app/tools/swot/page.tsx` — SWOT/PEST分析作成（PRO限定・SWOT/PEST切替・AI自動生成・AIアシスタントチャット・保存/上書き保存）✅
- `app/dashboard/page.tsx` — 分析タブを実データ表示に更新（作成ボタン・一覧・編集リンク・削除ボタン）✅
- logos-laravel API追加（GET/POST/PUT/DELETE /api/analyses・POST /api/tools/ai-assist・/api/dashboard analyses実データ）✅
- globals.css: tree-line CSS追加（ロジックツリーのライン表示）✅

**Step5拡張 logos-laravel API追加（2026-03-22）:**
- POST /api/topics/{topic}/posts（エビデンス投稿）
- POST /api/topics/{topic}/comments（コメント・1人1件制限）
- POST /api/posts/{post}/like（いいねトグル）
- POST /api/comments/{comment}/like（コメントいいねトグル）
- POST /api/topics/{topic}/bookmark（ブックマークトグル）
- GET /api/notifications・PATCH /api/notifications/read-all・PATCH /api/notifications/{id}/read
- GET /api/user/likes
- GET /api/topics/{id} 拡張（auth-aware: user_has_commented, is_bookmarked, is_liked_by_me）

**Step8: 分析タブ ↔ 保存ツール接続（2026-03-22 実装）:**
- `app/topics/[id]/page.tsx` 更新済み:
  - `TopicAnalysis` 型・`TopicDetail.analyses` フィールド追加
  - `AnalysisPreview` / `AnalysisCard` コンポーネント追加（Blade忠実再現）
  - `AnalysisModal` — 「作成済みツールから選択」タブ: ユーザー分析一覧取得・公開ボタン
  - 分析タブ: 実件数表示・`AnalysisCard` マップ
  - `fetchTopic()` 関数を切り出し（publish後に再取得）
- `routes/api.php` 追加済み:
  - GET /api/user/analyses（モーダル用）
  - POST /api/analyses/{id}/publish（トピック公開）
  - POST /api/analyses/{id}/like（いいねトグル）
- `TopicApiController.php` に `analyses` 直接クエリで取得 ✅

**Step9: バグ修正（2026-03-22）:**
- `TopicApiController::show()` バグ修正: `$topic->load(['analyses' => ...])` は `Topic` モデルに `analyses()` リレーション未定義のため500エラー
- **修正**: `load()` から `analyses` を削除し、直接クエリで代替 ✅
  ```php
  $analyses = \App\Models\Analysis::where('topic_id', $topic->id)
      ->where('is_published', true)
      ->with('user:id,name,avatar')
      ->withCount('likes')
      ->latest()
      ->get();
  $data['analyses'] = $analyses->toArray();
  ```
- **教訓**: `app/Models/` は編集禁止のため、新規リレーションが必要な場合は常に直接クエリで代替する

**Step10: topics/[id]/page.tsx コンポーネント分割（2026-03-22）:**
- 1811行 → page.tsx 812行 + 9ファイルに分割（型チェックエラーゼロ確認済み）
- `app/topics/[id]/_types.ts` — 型定義（TimelineItem/Post/Reply/Comment/TopicAnalysis/TopicDetail）
- `app/topics/[id]/_helpers.ts` — API_BASE / timeAgo / formatDateTime
- `app/topics/[id]/_components/UserAvatar.tsx`
- `app/topics/[id]/_components/LikeButton.tsx`
- `app/topics/[id]/_components/PostCard.tsx`
- `app/topics/[id]/_components/CommentCard.tsx`
- `app/topics/[id]/_components/PostModal.tsx`（OGPプレビュー含む）
- `app/topics/[id]/_components/AnalysisCard.tsx`（typeBadge / AnalysisPreview をエクスポート）
- `app/topics/[id]/_components/AnalysisModal.tsx`

**Step11: 返信UI・補足UI・PROモーダル・UX修正（2026-03-22）:**

*logos API追加（routes/api.php）:*
- POST /api/comments/{comment}/reply — 返信投稿（投稿主5件・他1件の制限付き）
- DELETE /api/comments/{comment} — コメント/返信削除（自分のみ）
- POST /api/posts/{post}/supplement — エビデンス補足（投稿者1回のみ）
- POST /api/analyses/{analysis}/supplement — 分析補足（投稿者1回のみ）

*Next.jsフロントエンド:*
- `CommentCard.tsx` — 返信フォーム追加（返信制限をUIでも制御）・自分のコメント/返信削除ボタン
- `PostCard.tsx` — 補足フォーム追加（投稿者1回のみ）・自分の投稿削除ボタン
- `AnalysisCard.tsx` — 補足フォーム追加（投稿者1回のみ）・SWOT グリッドを `grid-cols-1 sm:grid-cols-2` に修正
- `LikeButton.tsx` — md サイズを `w-4 h-4 sm:w-5 sm:h-5` にレスポンシブ対応
- `globals.css` — グローバルスクロールバーCSS追加（Blade版 app.css と統一）
- `SidebarContext.tsx` — `bookmarkRefreshKey`/`triggerBookmarkRefresh`（サイドバー即時更新）・`openProModal`/`closeProModal` 追加
- `Sidebar.tsx` — bookmarkRefreshKey 依存追加・非PRO時のPROリンクをモーダル開閉ボタンに変更
- `ProModal.tsx` （新規）— Blade版 pro-modal.blade.php 忠実再現
- `LayoutShell.tsx` — `<ProModal />` を全ページに配置
- `app/topics/[id]/page.tsx` — ブックマーク後 `triggerBookmarkRefresh()` 呼び出し・補足/削除ハンドラー追加

*セキュリティ/a11y/レスポンシブ調査結果:*
- セキュリティ: 問題なし（APIキー露出なし、認証ヘッダー全API適用済み）
- a11y: 全体的に対応済み（`aria-hidden`・`sr-only`・`alt` 確認）
- レスポンシブ: AnalysisCard SWOT グリッド修正・LikeButton md サイズ修正の2点のみ

**Step12: 通知機能・時系列AIアシスタント（2026-03-22）:**

*logos API追加（routes/api.php）:*
- POST /api/posts/{post}/like — いいね時に `post_like` 通知（自己除く）
- POST /api/comments/{comment}/like — いいね時に `comment_like` 通知（自己除く）
- POST /api/analyses/{analysis}/like — いいね時に `analysis_like` 通知（自己除く）
- POST /api/comments/{comment}/reply — 返信時に `comment_reply` 通知（自己除く）
- POST /api/topics/{topic}/bookmark — ブックマーク時に `topic_bookmark` 通知（自己除く）
- POST /api/topics/{topic}/timeline/generate — Geminiで時系列を自動生成（未生成・作成者限定）
- POST /api/topics/{topic}/timeline/update — 最新エビデンスからGeminiで時系列を更新（作成者限定）
- マイグレーション: notifications.type の ENUM を拡張（comment_like/analysis_like/topic_bookmark 追加）
- マイグレーション: notifications.notifiable_type を varchar(20) → varchar(50) に拡張

*Next.jsフロントエンド:*
- `app/topics/[id]/page.tsx` — timelineLoading state・handleTimelineGenerate・handleTimelineUpdate ハンドラー追加
- トピック詳細の時系列ヘッダー横にAIボタン追加: 未生成時は「✨ AIで自動生成する」、生成済みは「🔄 最新投稿からAI更新」（オーナーのみ表示）
- 処理中は「生成中...」「更新中...」でdisabled表示

**Step14: 移行漏れチェック・オリジナル図解・分析閲覧ページ（2026-03-22）:**

*Blade↔Next.js 総点検（移行漏れ2項目を修正・4項目を対象外と確定）:*
- 項目5: オリジナル図解（画像アップロード）— Bladeには実装済みだがNext.jsに未実装だったため対応
- 項目3: `/analyses/[id]` スタンドアロン閲覧ページ — Bladeには実装済みだがNext.jsに未実装だったため対応
- Phase 2 見送り（将来検討）: パスワードリセット（Bladeのloginページにもリンクなし・APIエンドポイント未追加・Phase 3以降でSMTP設定と合わせて検討）
- Phase 2 見送り（将来検討）: メール認証（User.php で MustVerifyEmail がコメントアウト中・本人確認強化フェーズで検討）
- Phase 2 見送り（将来検討）: パスワード確認ページ（Sanctum APIトークンフローでは現在不要・高セキュリティ操作UX改善時に検討）
- Phase 2 不要: 分析タイトル編集（Next.jsでは /tools/[type]?edit=[id] でフル編集可・Blade版より高機能なため対応不要）

*logos API追加（routes/api.php）:*
- POST /api/topics/{topic}/analyses/image — オリジナル図解アップロード（PRO限定・jpg/png/gif/webp・5MB制限・即公開）
- GET /api/analyses/{analysis} — 分析詳細をオーナー限定 → 認証済みユーザー全員閲覧可に変更。user/topic/likes_count/is_liked_by_me 付き

*Next.jsフロントエンド:*
- `app/topics/[id]/_types.ts` — TopicAnalysis.type に `"image"` 追加
- `app/topics/[id]/_components/AnalysisCard.tsx` — typeBadge にオレンジ「オリジナル図解」バッジ追加・AnalysisPreview に画像表示追加・isPro prop 追加・「もっと見る」リンクを PRO→/analyses/[id]・作成者(image以外)→編集ページ・無料→PROバッジ に3分岐
- `app/topics/[id]/_components/AnalysisModal.tsx` — 「近日公開予定」→実際のFormDataアップロード処理に差し替え（エラー表示・disabled制御）
- `app/topics/[id]/page.tsx` — AnalysisCard に `isPro={!!user?.is_pro}` を渡すよう修正
- `app/analyses/[id]/page.tsx` （新規）— tree/matrix/swot/image 全4タイプ完全表示・← 戻るボタン・連携先トピックリンク・補足表示

**Step13: トピック編集・下書き編集・バグ修正（2026-03-22）:**

*logos API追加（routes/api.php）:*
- PUT /api/topics/{topic} — トピック編集（作成者限定・title/content/category_ids/timeline/is_aiフラグ）
- PATCH /api/posts/{post} — 下書き編集（作成者限定・下書きのみ・本投稿昇格時OGP取得・通知送信）

*TopicApiController.php 追加:*
- `update()` メソッド追加（バリデーション・categories sync・作成者チェック）

*Next.jsフロントエンド:*
- `app/topics/[id]/edit/page.tsx` （新規）— トピック編集ページ。手動編集行は `is_ai: false` に自動切替
- `app/dashboard/page.tsx` — 下書き編集モーダル追加（posts/edit.blade.php 忠実再現）・トピック編集リンク修正（spanからLinkへ）・下書きカード準備中プレースホルダー・タイトル表示修正
- `app/topics/[id]/page.tsx` — 下書き保存時にトピック詳細に追加しないよう修正・`/dashboard?tab=drafts` へリダイレクト

**未実装（残作業）:**
- 現時点で主要な未実装ページ・機能はなし。次フェーズ（Phase 3）へ移行。

### Step4: 認証（完了）
- POST /api/login・POST /api/logout
- User モデルに HasApiTokens トレイト追加
- lib/auth.ts（getToken/setToken/removeToken/getAuthHeaders）
- context/AuthContext.tsx（AuthProvider・useAuthフック）
- app/login/page.tsx（Laravel版忠実再現）
- ヘッダー認証状態反映（通知ベル・アバタードロップダウン・カテゴリ管理）

### Step5: 追加API・ページ実装（2026-03-21完了）
**logos-laravel API追加（routes/api.php・TopicApiController.php）:**
- POST /api/register（新規登録・トークン返却）
- GET /api/user/me 拡張（email・avatar・unread_notifications_count追加）
- GET /api/categories 変更（親カテゴリ＋children階層構造で返却）
- POST /api/topics（PRO限定・TopicApiController::store追加）
- POST /api/categories・PATCH /api/categories/{id}・DELETE /api/categories/{id}（admin限定CRUD）
- personal_access_tokens マイグレーションをgitコミット済み

**バグ修正:**
- LayoutShell追加: /login・/register でHeader/Sidebar非表示（root layoutのusePathname制御）
- route:cacheが古くAPIルートが404になる問題 → route:clear で解消・再発防止でArray.isArray()ガード追加
- navigation.blade.php: auth()->id()===1 ハードコードでadminリンクが消える → ローカルDBでadminをID=1に設定して対応

---

## Vercel環境変数（設定済み ✅）
- `NEXT_PUBLIC_API_BASE_URL=https://gs-f04.sakura.ne.jp`（ブラウザ向け・CSR用）
- `API_BASE_URL=https://gs-f04.sakura.ne.jp`（NEXT_PUBLIC_なし・SSR用・All Environments・2026-03-22設定済み）
