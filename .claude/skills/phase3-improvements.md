# Phase 3 技術改善計画

## 概要（2026-03-22 調査・確定）

Phase 2 完了後の技術調査で発覚した「制約起因の負債」と「Next.js の良さを殺していた箇所」をまとめた改善計画。
**LOGOSの思想・機能・デザインに影響しない純粋な技術改善**。段階的に実施する。

---

## バックエンド（logos-laravel）改善計画

### 🔴 優先度: 高

#### B-1: routes/api.php をコントローラーに分割
- **現状**: 1040行・46エンドポイント全てがクロージャで直実装（2ファイル縛りの残骸）
- **理想**: routes/api.php はルート定義のみ50行程度・ロジックはControllerへ
- **分割先**:
  ```
  app/Http/Controllers/Api/
  ├── TopicApiController.php   ← 既存
  ├── PostApiController.php    ← エビデンス CRUD・いいね・supplement
  ├── CommentApiController.php ← コメント・返信 CRUD・いいね
  ├── AnalysisApiController.php ← 図解ツール CRUD・公開・いいね・supplement
  ├── NotificationApiController.php
  ├── ProfileApiController.php
  ├── UserApiController.php    ← likes・bookmarks・analyses
  └── DashboardApiController.php
  ```
- **優先理由**: 以後の機能追加・テスト・デバッグ全てがここを通る。負債解消効果最大

#### B-2: Topic モデルに analyses() リレーション追加 ✅ 完了（2026-03-22）
- **完了内容**: `Topic::hasMany(Analysis::class)` を追加・TopicApiController::show の直接クエリを `$topic->load('analyses' => ...)` に置き換え

### 🟡 優先度: 中

#### B-3: FormRequest クラスによるバリデーション集約
- **現状**: バリデーションが routes/api.php のクロージャ内に直書き（再利用不可）
- **理想**: `app/Http/Requests/` に FormRequest クラスを切り出し、Controller に注入
- **対象**: PostRequest, CommentRequest, AnalysisRequest 等

#### B-4: OGP取得ロジックの共通化
- **現状**: `/api/og` エンドポイントと posts 投稿時の2か所に同じロジックが重複
- **理想**: `app/Services/OgpService.php` に抽出して両方から呼び出す

#### B-5: ApiResource クラスでレスポンス形式を統一
- **現状**: `data` キーありなし混在・toArray() 直返し混在
- **理想**: `app/Http/Resources/` に JsonResource を定義して一貫したレスポンス形式に

### 🟢 優先度: 低

#### B-6: Like モデルの逆向きリレーション追加
- `Like.php` に `post()` / `comment()` / `user()` の belongsTo が未定義

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

#### F-5: SWR / React Query 導入
- **現状**: `useEffect + fetch` パターン・キャッシングなし・重複リクエストあり
- **理想**: SWR 導入でキャッシング・再フェッチ・重複排除を自動化
  - AuthContext の `user/me` 呼び出しなど、複数コンポーネントで同じAPIを叩いている箇所が対象

### 🟢 優先度: 低（将来）

#### F-6: Header.tsx・Sidebar.tsx の細分化
- **現状**: Header 377行・Sidebar 374行（Blade の navigation.blade.php を1:1再現）
- **理想**: `Header/SearchBar.tsx`, `Header/NotificationBell.tsx`, `Header/UserMenu.tsx` に分割

#### F-7: 共有コンポーネントの整理
- **現状**: PostCard 等が topics/[id]/_components/ に局所的
- **理想**: `components/post/`, `components/comment/` 等に移動し全ページで再利用可能に

---

## 優先度まとめ表

| 優先 | ID | 項目 | 効果 | コスト |
|---|---|---|---|---|
| 🔴 高 | F-1 | SSR復帰（Route Handler プロキシ） | SEO・表示速度劇的改善 | 中 |
| 🔴 高 | B-1 | routes/api.php → Controller分割 | 保守性・テスト性大幅向上 | 中〜高 |
| 🔴 高 | F-2 | Custom Hook化 | page.tsx を管理可能サイズに | 中 |
| 🟡 中 | B-2 | Topic::analyses() リレーション追加 | N+1解消・コード簡潔化 | 低 |
| 🟡 中 | F-3 | boolean 型変換レイヤー | バグリスク排除 | 低 |
| 🟡 中 | F-4 | 分析型 Discriminated Union | 型安全・バグを型レベルで防止 | 低 |
| 🟡 中 | F-5 | SWR / React Query | キャッシング・重複排除 | 低〜中 |
| 🟡 中 | B-3 | FormRequest クラス | バリデーション整理 | 低 |
| 🟡 中 | B-4 | OgpService 共通化 | 重複排除 | 低 |
| 🟢 低 | B-5 | ApiResource クラス | レスポンス統一 | 中 |
| 🟢 低 | F-6 | Header/Sidebar 細分化 | コンポーネント管理性 | 高 |
| 🟢 低 | F-7 | 共有コンポーネント整理 | 再利用性向上 | 高 |

---

## 重要な注意事項

- これらの改善は **LOGOSの思想・機能・UIデザインに影響しない純粋な技術改善**
- ユーザーから見える変化は「表示が速くなった（SSR）」のみ
- 各ステップで `npm run build` と `curl` による API 疎通確認を必ず実施
- B-1（Controller分割）は機能に影響しないが規模が大きい → ステップを細かく分けてコミット
