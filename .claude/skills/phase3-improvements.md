# Phase 3 技術改善計画

## 概要（2026-03-22 調査・確定）

Phase 2 完了後の技術調査で発覚した「制約起因の負債」と「Next.js の良さを殺していた箇所」をまとめた改善計画。
**LOGOSの思想・機能・デザインに影響しない純粋な技術改善**。段階的に実施する。

---

## バックエンド（logos-laravel）改善計画

### 🔴 優先度: 高

#### B-1: routes/api.php をコントローラーに分割 ✅ 完了（2026-03-22）
- **完了内容**: 1040行→209行(-80%)・全47エンドポイントを9コントローラーに分割
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
- **残クロージャ**: /og(公開)・/register・/login・/logout・GET /categories(公開) ← 意図的に残存

#### B-2: Topic モデルに analyses() リレーション追加 ✅ 完了（2026-03-22）
- **完了内容**: `Topic::hasMany(Analysis::class)` を追加・TopicApiController::show の直接クエリを `$topic->load('analyses' => ...)` に置き換え

### 🟡 優先度: 中

#### B-3: FormRequest クラスによるバリデーション集約 ✅ 完了（2026-03-22）
- **完了内容**: `app/Http/Requests/Api/` に16ファイル作成・全 ApiController のバリデーションを移行
  ```
  StorePostRequest / UpdatePostRequest / SupplementRequest（Post+Analysis共用）
  StoreCommentRequest（store+reply共用）
  StoreAnalysisRequest / UpdateAnalysisRequest / PublishAnalysisRequest / StoreAnalysisImageRequest / AiAssistRequest
  UpdateProfileRequest（$canChangeName 条件を rules() 内で処理）/ UpdatePasswordRequest / DestroyProfileRequest
  StoreCategoryRequest / UpdateCategoryRequest
  StoreTopicRequest / UpdateTopicRequest
  ```
- **検証済み**: 全7コミット後 route:list 確認・curl で 422 バリデーションエラー正常返却を確認
- **Gitタグ**: `v3.3-b3-form-requests`（logos-laravel push済み）

#### B-4: OGP取得ロジックの共通化 ✅ 完了（2026-03-22）
- **完了内容**: `app/Services/OgpService.php` 新規作成。3箇所の重複ロジックを共通化
  - `PostApiController::store()` — OGP try ブロック(22行) → `OgpService::fetch($url)` 1行
  - `PostApiController::update()` — OGP try ブロック(17行) → `OgpService::fetch($url)` 1行（timeout未設定→5秒に統一）
  - `GET /api/og` クロージャ（routes/api.php）— 30行 → `OgpService::fetch($url)` 1行
- **検証済み**: route:list確認・tinker直接呼び出し・curl /api/og（有効URL・無効URL両方）
- **コミット**: ea0b980（logos-laravel push済み）

#### B-5: ApiResource クラスでレスポンス形式を統一 ✅ 完了（2026-03-23）
- **現状**: `data` キーありなし混在・toArray() 直返し混在
- **理想**: `app/Http/Resources/` に JsonResource を定義して一貫したレスポンス形式に
- **実装方針（Session 7 確定）**:
  - `JsonResource::withoutWrapping()` で data ラッピングなし（Next.js 側の変更ゼロ）
  - 適用対象: `AnalysisResource`（show/userAnalyses）・`CategoryResource`
  - **スキップ**: `TopicApiController::show` は `$topic->toArray()` + 認証フィールド手動追加が複雑で、Resource 化すると PostResource/CommentResource/ReplyResource/AnalysisResource の芋づる式作業になるため今回対象外

**【技術的負債①】paginator 系レスポンスの data ラッピング**
- **現状**: `index` 系エンドポイントは Laravel paginator が自動で `{data:[...], current_page, last_page, ...}` を返す
- **意図的に維持**: Next.js 側が既にこの形式に対応済みのため変更しない判断をした（Session 7）
- **将来対応時の注意**: Next.js 全体で `response.data` / `response.current_page` / `response.last_page` へのアクセス箇所を一括修正する必要がある。Phase 2 完了タグ（v2.0-phase2-complete）を比較元にすること

**【技術的負債②】単一リソース系のフラットレスポンス**
- **現状**: `show` / `store` / `update` 系は `data` キーなし（フラット）で返している
- **意図的に維持**: Next.js 側が `response.title` 等フラットアクセスに対応済みのため、`data` ラッピングを入れると全フロントが壊れる（Session 7）
- **将来対応時の注意**: `withoutWrapping()` を外して data ラッピングを入れる場合、Next.js の全フェッチ呼び出しで `response.data.xxx` に変更が必要

**【技術的負債③】TopicApiController::show の Resource 化**
- **現状の問題**: `$data = $topic->toArray()` でモデル全フィールドを展開し、認証ユーザーのいいね・ブックマーク状態を手動ループで追加している
- **理想**: `TopicResource`（+ ネストした PostResource/CommentResource/ReplyResource/AnalysisResource）で明示的なフィールド定義に統一
- **着手条件**: 関連 Resource（Post/Comment/Reply/Analysis）を全て揃えてから一括対応が望ましい
- **優先度**: 低（現状バグなし・機能に影響しない純粋な技術改善）

### 🟢 優先度: 低

#### B-6: Like モデルの逆向きリレーション追加 ✅ 完了（2026-03-23）
- `Like.php` に `user()` / `post()` の belongsTo を追加（comment は likes テーブルでなく comment_likes ピボットのため対象外）
- Gitタグ: `v3.5-b6-like-relations`（logos-laravel）

---

## フロントエンド（logos-next）改善計画

### 🔴 優先度: 高（Phase 3 の核心）

#### F-1: SSR 復帰（Route Handler プロキシ方式）✅ 完了（2026-03-22）
- **完了内容**: Route Handler 4本（topics/categories/analyses）+ `/` と `/topics/[id]` の SSR 化
- **検証済み**: curl で HTML にコンテンツ含まれることを確認
- **F-1 将来タスク**: `/analyses/[id]` SSR化 — `auth:sanctum` 必須のため Cookie ベース認証導入まで保留
- **Vercel追加設定**: `API_BASE_URL=https://gs-f04.sakura.ne.jp`（NEXT_PUBLIC_なし・All Environments）✅ 2026-03-22設定済み
- **旧状況メモ**: 全17ページが `"use client"` CSR（Vercel↔さくら間ネットワーク疎通問題の暫定対処）
  - deploy-config.md に経緯記録済み（ERROR 3292540420）
- **問題**: SEO ペナルティ・初期表示遅延・FCP低下
- **解決策**: Next.js Route Handler（`app/api/`）をプロキシとして作成
  ```typescript
  // app/api/topics/route.ts
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
- **移行方針**: Route Handler 作成後、ページを `"use client"` → Server Component に段階移行
- **SSR優先ページ**: トップ（`/`）・トピック詳細（`/topics/[id]`）・分析閲覧（`/analyses/[id]`）

#### F-2: Custom Hook によるロジック分離（page.tsx の肥大化解消）✅ 完了（2026-03-22）
- **完了内容**: `useTopicPage.ts` に全state/handler/computed値を抽出。page.tsx: 1004行→598行
- **検証済み**: ビルド通過・TypeScriptエラーなし（純粋リファクタリングのためビルド=動作保証）
- **旧状況メモ**: `topics/[id]/page.tsx` が1004行・useState 17個が1ファイルに集中
- **問題**: 状態とハンドラーが page.tsx に全集中 → 子コンポーネントは再利用不可
- **理想**: Custom Hook にロジックを抽出
  ```typescript
  // app/topics/[id]/hooks/useTopicPage.ts
  export function useTopicPage(id: string) {
    // 全 useState・useEffect・ハンドラーをここに移す
    return { topic, loading, activeTab, handlePostLike, handleComment, ... };
  }
  // page.tsx は Hook を呼んで JSX を組み立てるだけになる（200行程度に）
  ```
- **対象**: topics/[id]・dashboard・tools/ 各ページ

### 🟡 優先度: 中

#### F-3: boolean 型変換レイヤーの導入 ✅ 完了（2026-03-22）
- **完了内容**: `lib/transforms.ts` 新規作成（transformUser/Post/Comment/Reply/Analysis/Topic）
- **適用済み**: AuthContext（is_pro/is_admin）・useTopicPage（is_liked_by_me/is_bookmarked）・AnalysisModal（is_published）
- **JSX整理**: `!!user?.is_pro` → `user?.is_pro ?? false` に変更

#### F-4: 分析ツール型の Discriminated Union 化 ✅ 完了（2026-03-22）
- **完了内容**: `_types.ts` の `TopicAnalysis.data: Record<string, any>` → Discriminated Union に変更
- **型定義**: tree（nodes/theme/meta）/ matrix（patterns/items/theme）/ swot（framework/theme/box1-4）/ image（image_path）
- **AnalysisCard**: `analysis.data` を型安全な直接アクセスに更新
- **注意**: image type の data キーは `image_path`（`url` ではない）—APIの実装と一致

#### F-5: SWR / React Query 導入 ✅ 完了（2026-03-22）
- **完了内容**: `npm install swr@^2.4.1` 済み。3ファイルを SWR 化
  - `context/AuthContext.tsx`: useState+useEffect → useSWR("auth-user", fetchUser)。revalidateOnFocus: true / logout: mutate(null,{revalidate:false})
  - `app/topics/[id]/hooks/useTopicPage.ts`: useSWR(url, {fallbackData: initialTopic}) + updateTopic ヘルパー（mutateTopic経由で15箇所置換）
  - `app/notifications/page.tsx`: useSWR(user?url:null) ページ依存キー
- **検証済み**: ビルド×3回通過・ブラウザ確認（user/me取得・revalidateOnFocus・logout即時切替）・ページネーション（tinker25件→curl確認→クリーンアップ）
- **Gitタグ**: `v3.2-f5-swr`（logos-next）

### 🟢 優先度: 低（将来）

#### F-6: Header.tsx・Sidebar.tsx の細分化 ✅ 完了（2026-03-23）
- **完了内容**:
  - `Header.tsx`（377行）→ `Header/NotificationBell.tsx` + `Header/SearchBar.tsx` + `Header/UserMenu.tsx` + `Header/index.tsx` に分割
  - `Sidebar.tsx`（374行）→ `Sidebar/NavLinks.tsx` + `Sidebar/index.tsx` に分割
  - `Header.tsx` / `Sidebar.tsx` は後方互換 re-export として維持（import先への影響ゼロ）
  - UIは一切変更なし
- **検証済み**: `npx tsc --noEmit` + `npm run build` エラーなし
- **Gitタグ**: `v3.7-f6-header-sidebar-split`（logos-next push済み）

#### F-7: 共有コンポーネントの整理 ✅ 完了（2026-03-23）
- **完了内容**:
  - `components/UserAvatar.tsx` 新規作成（avatar画像対応・sm/md/lg 3サイズ）
  - `components/LikeButton.tsx` 新規作成
  - `topics/_components/UserAvatar.tsx` → shared へ re-export
  - `topics/_components/LikeButton.tsx` → shared へ re-export
  - `PostCard.tsx`・`CommentCard.tsx` の引数を `name=` → `user=` に統一
  - `dashboard/page.tsx`・`likes/page.tsx` のインライン定義（計60行）を削除・import に置換
- **PostCard・CommentCard 等は移動対象外**: 各ページで型が異なるため topics/_components/ に残置（適切な設計判断）
- **検証済み**: 型チェック（noEmit）・npm run build 両方エラーなし

---

## 優先度まとめ表

| 優先 | ID | 項目 | 効果 | コスト |
|---|---|---|---|---|
| 🔴 高 | F-1 | SSR復帰（Route Handler プロキシ） | SEO・表示速度劇的改善 | 中 |
| 🔴 高 | B-1 | routes/api.php → Controller分割 ✅ | 保守性・テスト性大幅向上 | 中〜高 |
| 🔴 高 | F-2 | Custom Hook化 | page.tsx を管理可能サイズに | 中 |
| 🟡 中 | B-2 | Topic::analyses() リレーション追加 | N+1解消・コード簡潔化 | 低 |
| 🟡 中 | F-3 | boolean 型変換レイヤー | バグリスク排除 | 低 |
| 🟡 中 | F-4 | 分析型 Discriminated Union | 型安全・バグを型レベルで防止 | 低 |
| 🟡 中 | F-5 | SWR / React Query ✅ | キャッシング・重複排除 | 低〜中 |
| 🟡 中 | B-3 | FormRequest クラス ✅ | バリデーション整理 | 低 |
| 🟡 中 | B-4 | OgpService 共通化 ✅ | 重複排除 | 低 |
| 🟢 低 | B-5 | ApiResource クラス | レスポンス統一 | 中 |
| 🟢 低 ✅ | F-6 | Header/Sidebar 細分化 ✅ | コンポーネント管理性 | 高 |
| 🟢 低 ✅ | F-7 | 共有コンポーネント整理 | 再利用性向上 | 高 |

---

## 重要な注意事項

- これらの改善は **LOGOSの思想・機能・UIデザインに影響しない純粋な技術改善**
- ユーザーから見える変化は「表示が速くなった（SSR）」のみ
- 各ステップで `npm run build` と `curl` による API 疎通確認を必ず実施
- B-1（Controller分割）は機能に影響しないが規模が大きい → ステップを細かく分けてコミット
