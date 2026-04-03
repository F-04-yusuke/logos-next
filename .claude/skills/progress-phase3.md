# Phase 3 完了記録：技術的負債解消・コード品質改善

完了日: 2026-03-23
Gitタグ (logos-next): `v3.8-session9-docs-complete`
Gitタグ (logos-laravel): `v3.5-b6-like-relations`

---

## フェーズの目的

Phase 2 完了後の技術調査で発覚した「制約起因の負債」と「Next.js の良さを殺していた箇所」をまとめた改善計画。
**LOGOSの思想・機能・デザインに影響しない純粋な技術改善**。ユーザーから見える変化は「表示が速くなった（SSR）」のみ。

---

## バックエンド改善（logos-laravel）

### B-1: routes/api.php をコントローラーに分割 ✅（2026-03-22）

**完了内容**: 1040行→209行(-80%)・全47エンドポイントを9コントローラーに分割

```
app/Http/Controllers/Api/
├── TopicApiController.php      ← index/show/store/update/destroy/bookmark/timelineGenerate/timelineUpdate
├── PostApiController.php       ← store/like/supplement/update/destroy
├── CommentApiController.php    ← store/reply/destroy/like
├── AnalysisApiController.php   ← show/store/update/destroy/publish/like/supplement/userAnalyses/storeImage/aiAssist
├── CategoryApiController.php   ← store/update/destroy（管理者専用）
├── NotificationApiController.php ← index/readAll/read
├── ProfileApiController.php    ← show/update/updatePassword/destroy
├── UserApiController.php       ← me/bookmarks/likes/history
└── DashboardApiController.php  ← index
```

- **検証済み**: route:list で全47エンドポイント確認・8コミットに分割して段階的に実施
- **残クロージャ（意図的）**: /og（公開）・/register・/login・/logout・GET /categories（認証不要公開API）
- **Gitタグ**: `v3.1-b1-controller-split`（logos-laravel・logos-next 両方）

---

### B-2: Topic モデルに analyses() リレーション追加 ✅（2026-03-22）

**完了内容**: `Topic::hasMany(Analysis::class)` を追加・TopicApiController::show の直接クエリを `$topic->load('analyses' => ...)` に置き換え

- **検証済み**: ビルド通過・マイグレーション不要・モデル変更のみ
- ※ Phase 2 Step9 の教訓（`app/Models/` 編集禁止）が撤廃されたため実現。直接クエリは不要になった

---

### B-3: FormRequest クラスによるバリデーション集約 ✅（2026-03-22）

**完了内容**: `app/Http/Requests/Api/` に16ファイル作成・全 ApiController のバリデーションを移行

```
StorePostRequest / UpdatePostRequest / SupplementRequest（Post+Analysis共用）
StoreCommentRequest（store+reply共用）
StoreAnalysisRequest / UpdateAnalysisRequest / PublishAnalysisRequest / StoreAnalysisImageRequest / AiAssistRequest
UpdateProfileRequest（$canChangeName 条件を rules() 内で処理・$this->user() 使用）/ UpdatePasswordRequest / DestroyProfileRequest
StoreCategoryRequest / UpdateCategoryRequest
StoreTopicRequest / UpdateTopicRequest
```

- **検証済み**: 全7コミット後 route:list 確認・curl で 422 バリデーションエラー正常返却を確認
- 全コントローラーから `$request->validate([...])` を削除し `$request->validated()` に置換
- **Gitタグ**: `v3.3-b3-form-requests`（logos-laravel push済み）

---

### B-4: OGP取得ロジックの共通化 ✅（2026-03-22）

**完了内容**: `app/Services/OgpService.php` 新規作成。3箇所の重複ロジックを共通化

- `PostApiController::store()` — OGP try ブロック(22行) → `OgpService::fetch($url)` 1行
- `PostApiController::update()` — OGP try ブロック(17行) → `OgpService::fetch($url)` 1行（timeout未設定→5秒に統一）
- `GET /api/og` クロージャ（routes/api.php）— 30行 → `OgpService::fetch($url)` 1行

- **検証済み**: route:list確認・tinker直接呼び出し・curl /api/og（有効URL・無効URL両方）
- **Gitタグ**: `v3.2-b4-ogp-service`（logos-laravel push済み・コミット ea0b980）

---

### B-5: ApiResource クラスでレスポンス形式を統一 ✅（2026-03-23）

**完了内容**:

- `app/Http/Resources/Api/AnalysisResource.php` 新規作成（whenLoaded/whenCounted/動的 is_liked_by_me）
- `app/Http/Resources/Api/CategoryResource.php` 新規作成
- `AppServiceProvider::boot()` に `JsonResource::withoutWrapping()` 追加
- `AnalysisApiController::show` を Resource 経由に変更（`toArray()` 直返し廃止）
- `CategoryApiController::store/update` を Resource 経由に変更

- **実装方針**: `JsonResource::withoutWrapping()` で data ラッピングなし（Next.js 側の変更ゼロ）
- **検証済み**: GET /api/analyses/{id} → フラット Resource 形式・201/200 ステータス正常確認
- **Gitタグ**: `v3.4-b5-api-resource`（logos-laravel）

**スキップ対象（理由付き）**: `TopicApiController::show` は `$topic->toArray()` + 認証フィールド手動追加が複雑で、Resource 化すると PostResource/CommentResource/ReplyResource/AnalysisResource の芋づる式作業になるため今回対象外。

---

### B-6: Like モデルの逆向きリレーション追加 ✅（2026-03-23）

**完了内容**: `Like.php` に `user()` / `post()` の belongsTo を追加

- comment は likes テーブルでなく comment_likes ピボットのため対象外
- **検証済み（tinker）**: like->user・like->post どちらも正常取得確認
- **Gitタグ**: `v3.5-b6-like-relations`（logos-laravel）

---

## フロントエンド改善（logos-next）

### F-1: SSR 復帰（Route Handler プロキシ方式）✅（2026-03-22）

**背景**: 全17ページが `"use client"` CSR（Vercel↔さくら間ネットワーク疎通問題の暫定対処）。SEO ペナルティ・初期表示遅延・FCP低下の問題があった（ERROR 3292540420 記録 → deploy-config.md 参照）。

**完了内容**: Route Handler 4本（topics/categories/analyses）+ `/` と `/topics/[id]` の SSR 化

```typescript
// 解決策: Next.js Route Handler（app/api/）をプロキシとして作成
// Vercel サーバーがさくら API を叩き、ブラウザには Vercel が返す
// → Vercel内部完結になりタイムアウト問題が解消
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const res = await fetch(`${INTERNAL_API_URL}/api/topics?${searchParams}`, {
    headers: { 'Accept': 'application/json' }
  });
  return Response.json(await res.json());
}
```

**作成ファイル:**
- `lib/proxy-fetch.ts` — さくらAPI プロキシユーティリティ（サーバー専用、NEXT_PUBLIC_なし）
- `app/api/topics/route.ts` — トピック一覧プロキシ（クエリ文字列転送）
- `app/api/topics/[id]/route.ts` — トピック詳細プロキシ（Authorizationヘッダー転送）
- `app/api/categories/route.ts` — カテゴリ一覧プロキシ
- `app/api/analyses/[id]/route.ts` — 分析詳細プロキシ（Authorizationヘッダー転送）
- `app/page.tsx` — Server Component 化（SSR）、HomeClient に初期データを渡す
- `app/_components/HomeClient.tsx` — CSR部分を分離（ソート・ページネーション・タブ）
- `app/topics/[id]/page.tsx` — Server Component 化（SSR）、TopicPageClient に初期データを渡す
- `app/topics/[id]/_components/TopicPageClient.tsx` — CSR部分を担当（全JSX・useTopicPage呼び出し）

- **検証済み（curl）**: トップページ・topics/[id] ともにSSR HTML にコンテンツ含まれることを確認
- **Vercel環境変数**: `API_BASE_URL=https://gs-f04.sakura.ne.jp`（NEXT_PUBLIC_なし・SSR用）✅ 2026-03-22設定済み

**F-1 残（当時の将来タスク）**: `/analyses/[id]` SSR化 — Sakura API が `auth:sanctum` 必須のためSSR不可。Cookie ベース認証導入まで保留。→ **Phase 5 Session 50 で httpOnly Cookie 化・Session 53 で SSR化 完了済み**

---

### F-2: Custom Hook によるロジック分離 ✅（2026-03-22）

**背景**: `topics/[id]/page.tsx` が1004行・useState 17個が1ファイルに集中。子コンポーネントが再利用不可。

**完了内容**: `useTopicPage.ts` に全state/handler/computed値を抽出。page.tsx: 1004行→598行

- `app/topics/[id]/hooks/useTopicPage.ts` — 全state(17個)・handler(16個)・computed値を集約
- `app/topics/[id]/page.tsx` — ロジックゼロに（598行に削減）

- **検証済み（ビルド・TypeScriptエラーなし）**: 純粋なリファクタリングのためビルド通過=動作保証

---

### F-3: boolean 型変換レイヤーの導入 ✅（2026-03-22）

**背景**: LaravelのAPIはboolean値を `0/1` で返す。JSXで `{user.is_admin && ...}` と書くと 0 がテキスト表示されるバグ。

**完了内容**:
- `lib/transforms.ts` 新規作成（transformUser/Post/Comment/Reply/Analysis/Topic）
- AuthContext・useTopicPage・AnalysisModal に適用
- JSX整理: `!!user?.is_pro` → `user?.is_pro ?? false` に変更

---

### F-4: 分析ツール型の Discriminated Union 化 ✅（2026-03-22）

**完了内容**:
- `_types.ts` の `TopicAnalysis.data: Record<string, any>` → Discriminated Union に変更
- 型定義: tree（nodes/theme/meta）/ matrix（patterns/items/theme）/ swot（framework/theme/box1-4）/ image（image_path）
- `AnalysisCard` を型安全な直接アクセスに更新

- **注意**: image type の data キーは `image_path`（`url` ではない）— APIの実装と一致

---

### F-5: SWR 導入 ✅（2026-03-22）

**完了内容**: `npm install swr@^2.4.1` 済み。3ファイルを SWR 化

- `context/AuthContext.tsx`: useState+useEffect → `useSWR("auth-user", fetchUser)`
  - revalidateOnFocus: true / shouldRetryOnError: false / logout: `mutate(null,{revalidate:false})`
- `app/topics/[id]/hooks/useTopicPage.ts`: `useSWR(url, {fallbackData: initialTopic})`
  - updateTopic ヘルパーで setTopic→mutateTopic(fn,{revalidate:false}) 15箇所置換
- `app/notifications/page.tsx`: `useSWR(user?url:null)` ページ依存キー

**検証済み（全4確認完了）:**
- 検証1: ビルド × 3回通過・TypeScriptエラーなし
- 検証2: ブラウザ確認（user/me取得・revalidateOnFocus・logout即時切り替え）→ ✅ ユーザー確認済み
- 検証3: ページネーション → tinker で通知25件作成 → curl page=1/2 確認 → コードレビュー → クリーンアップ ✅
- **Gitタグ**: `v3.2-f5-swr`（logos-next）

---

### F-6: Header.tsx・Sidebar.tsx の細分化 ✅（2026-03-23）

**背景**: Header.tsx（377行）・Sidebar.tsx（374行）が肥大化し管理困難。

**完了内容**:

- `components/Header/NotificationBell.tsx` — BellIcon + NotificationBadge + Link（PC/スマホ両用・linkClassName/iconClassName でカスタマイズ）
- `components/Header/SearchBar.tsx` — 検索フォーム共用（PC/スマホ両用・autoFocus 対応）
- `components/Header/UserMenu.tsx` — Avatar helper（named export）+ PC アバタードロップダウン
- `components/Header/index.tsx` — 全 state/handler + 3サブコンポーネントを組み合わせるメイン Header
- `components/Sidebar/NavLinks.tsx` — メインナビ + ログイン時セクション全体（sidebarOpen props で opacity 制御）
- `components/Sidebar/index.tsx` — aside ラッパー + トグルボタン + ロゴ + NavLinks
- `components/Header.tsx` → `Header/index.tsx` への後方互換 re-export 1行に差し替え
- `components/Sidebar.tsx` → `Sidebar/index.tsx` への後方互換 re-export 1行に差し替え

- **効果**: Header 377行・Sidebar 374行がそれぞれ管理可能なサブコンポーネントに分割・UI変更ゼロ
- **検証済み**: `npx tsc --noEmit` + `npm run build` エラーなし
- **Gitタグ**: `v3.7-f6-header-sidebar-split`（logos-next push済み）

---

### F-7: 共有コンポーネントの整理 ✅（2026-03-23）

**背景**: UserAvatar・LikeButton が複数箇所（topics/_components・dashboard・likes）でインライン重複定義されていた。

**完了内容**:

- `components/UserAvatar.tsx` 新規作成（avatar画像対応・sm/md/lg 3サイズ統一）
- `components/LikeButton.tsx` 新規作成（topics版をそのまま共有化）
- `topics/_components/UserAvatar.tsx`・`LikeButton.tsx` → shared へ re-export
- `dashboard/page.tsx`・`likes/page.tsx` のインライン定義（計60行）削除・import に置換
- `PostCard.tsx`・`CommentCard.tsx` の引数を `name=` → `user=` に統一

- **効果**: 3ヶ所の重複コード解消・137行削減（96行追加）
- **PostCard・CommentCard 等は移動対象外**: 各ページで型が異なるため topics/_components/ に残置（適切な設計判断）
- **検証済み**: 型チェック（noEmit）・npm run build 両方エラーなし
- **Gitタグ**: `v3.6-f7-shared-components`（logos-next）

---

## 優先度まとめ（当初計画）

| 優先 | ID | 項目 | 効果 | コスト | 状態 |
|---|---|---|---|---|---|
| 🔴 高 | F-1 | SSR復帰（Route Handler プロキシ） | SEO・表示速度劇的改善 | 中 | ✅ |
| 🔴 高 | B-1 | routes/api.php → Controller分割 | 保守性・テスト性大幅向上 | 中〜高 | ✅ |
| 🔴 高 | F-2 | Custom Hook化 | page.tsx を管理可能サイズに | 中 | ✅ |
| 🟡 中 | B-2 | Topic::analyses() リレーション追加 | N+1解消・コード簡潔化 | 低 | ✅ |
| 🟡 中 | F-3 | boolean 型変換レイヤー | バグリスク排除 | 低 | ✅ |
| 🟡 中 | F-4 | 分析型 Discriminated Union | 型安全・バグを型レベルで防止 | 低 | ✅ |
| 🟡 中 | F-5 | SWR 導入 | キャッシング・重複排除 | 低〜中 | ✅ |
| 🟡 中 | B-3 | FormRequest クラス | バリデーション整理 | 低 | ✅ |
| 🟡 中 | B-4 | OgpService 共通化 | 重複排除 | 低 | ✅ |
| 🟢 低 | B-5 | ApiResource クラス | レスポンス統一 | 中 | ✅ |
| 🟢 低 | F-6 | Header/Sidebar 細分化 | コンポーネント管理性 | 高 | ✅ |
| 🟢 低 | F-7 | 共有コンポーネント整理 | 再利用性向上 | 高 | ✅ |

**Phase 3 全タスク完了。**

---

## 技術的負債（意図的に先送り・記録）

### 【負債①】paginator 系レスポンスの data ラッピング

- **現状**: `index` 系エンドポイントは Laravel paginator が自動で `{data:[...], current_page, last_page, ...}` を返す
- **意図的に維持**: Next.js 側が既にこの形式に対応済みのため変更しない判断をした（Phase 3 Session 7）
- **将来対応時の注意**: Next.js 全体で `response.data` / `response.current_page` / `response.last_page` へのアクセス箇所を一括修正する必要がある。Phase 2 完了タグ（v2.0-phase2-complete）を比較元にすること

### 【負債②】単一リソース系のフラットレスポンス

- **現状**: `show` / `store` / `update` 系は `data` キーなし（フラット）で返している
- **意図的に維持**: Next.js 側が `response.title` 等フラットアクセスに対応済みのため、`data` ラッピングを入れると全フロントが壊れる（Phase 3 Session 7）
- **将来対応時の注意**: `withoutWrapping()` を外して data ラッピングを入れる場合、Next.js の全フェッチ呼び出しで `response.data.xxx` に変更が必要

### 【負債③】TopicApiController::show の Resource 化

- **現状の問題**: `$data = $topic->toArray()` でモデル全フィールドを展開し、認証ユーザーのいいね・ブックマーク状態を手動ループで追加している
- **理想**: `TopicResource`（+ ネストした PostResource/CommentResource/ReplyResource/AnalysisResource）で明示的なフィールド定義に統一
- **着手条件**: 関連 Resource（Post/Comment/Reply/Analysis）を全て揃えてから一括対応が望ましい
- **優先度**: 低（現状バグなし・機能に影響しない純粋な技術改善）

### 【負債④】/analyses/[id] SSR 化 ✅ **Phase 5 Session 53 で解消済み**

- ~~**現状**: CSR のまま（auth:sanctum 必須のため SSR 不可）~~
- ~~**着手条件**: Cookie ベース認証（httpOnly Cookie）の導入後~~
- **解消**: Phase 5 Session 50 で httpOnly Cookie 化 → Session 53 で Server Component + AnalysisShowClient.tsx に分離してSSR化完了

---

## Phase 3 実施期間のセッション記録

| セッション | 完了内容 |
|---|---|
| Session 1（Phase 3 開始） | F-1（SSR復帰）・F-2（Custom Hook化） |
| Session 2 | B-2（analyses()リレーション）・F-3（boolean transforms）・F-4（Discriminated Union） |
| Session 3 | B-1（Controller分割） |
| Session 4 | F-5（SWR導入） |
| Session 5 | B-4（OgpService共通化） |
| Session 6 | B-3（FormRequest クラス化） |
| Session 7 | B-5（ApiResource導入）・B-6（Like逆向きリレーション） |
| Session 8 | F-7（共有コンポーネント整理） |
| Session 9 | F-6（Header/Sidebar細分化） |
| Session 10 | （Session 9のドキュメント総仕上げ） |
| Session 11 | ドキュメント整理（本セッション） |
