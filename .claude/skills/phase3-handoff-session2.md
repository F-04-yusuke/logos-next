# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 Session 2）

作成日: 2026-03-22

---

## コピペして使う引継ぎプロンプト

```
LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 2）

## プロジェクト構成
- バックエンド: ~/logos-laravel（Laravel 12.x + Sanctum）
- フロントエンド: ~/logos-next（Next.js 16.2.0 + TypeScript + Tailwind）
- 本番: さくらサーバー（Laravel）＋ Vercel（Next.js）

## 前セッションで完了した作業

### F-1: SSR復帰（Route Handlerプロキシ）✅ 完了
- lib/proxy-fetch.ts（さくらAPI プロキシユーティリティ・サーバー専用）
- app/api/topics/route.ts・app/api/topics/[id]/route.ts（プロキシ Route Handler）
- app/api/categories/route.ts・app/api/analyses/[id]/route.ts（同上）
- app/page.tsx → Server Component 化（SSR）・HomeClient.tsx にCSR部分を分離
- app/topics/[id]/page.tsx → Server Component 化（SSR）・TopicPageClient.tsx にCSR分離
- 検証済み: curl でSSR HTML にコンテンツ含まれることを確認

### F-2: Custom Hook化 ✅ 完了
- app/topics/[id]/hooks/useTopicPage.ts に state17個・handler16個・computed値を抽出
- TopicPageClient.tsx が useTopicPage を呼んでJSXを組み立てる構成に
- 検証済み: npm run build 通過・TypeScriptエラーなし

### F-1 残タスク（将来）
- analyses/[id] SSR化 → Sakura APIが auth:sanctum 必須のためCookieベース認証まで保留
- Vercel環境変数: API_BASE_URL=https://gs-f04.sakura.ne.jp（NEXT_PUBLIC_なし）をユーザーがVercelダッシュボードで設定する必要あり

## 今セッションの推奨タスク順（効率重視）

### 優先: B-2 → F-3 → F-4（低コスト・1セッションで完結推奨）

#### B-2: Topic::analyses() リレーション追加（logos-laravel側）
- 対象: ~/logos-laravel/app/Models/Topic.php
- 現状: TopicApiController に `Analysis::where('topic_id', $id)->get()` が直接クエリで残存
- 理想: `public function analyses() { return $this->hasMany(Analysis::class); }` を追加
- 注意: マイグレーション不要・モデル変更のみ・さくら本番への直接影響なし

#### F-3: boolean型変換レイヤー（lib/transforms.ts 新規）
- 対象: ~/logos-next/lib/transforms.ts（新規作成）
- 現状: `!!user?.is_pro` が各コンポーネントに11箇所以上散在
- 理想: APIレスポンス受取口で一括変換 → JSX内で !! 不要
- 対象型: User / Post / Comment / Analysis の is_* フィールド全て

#### F-4: 分析型 Discriminated Union（any → 型安全）
- 対象: ~/logos-next/app/topics/[id]/_types.ts
- 現状: `TopicAnalysis.data: Record<string, any>` で型安全でない
- 理想: type で絞ったら data の型が自動確定する Union型

### 次セッション以降: B-1（高コスト・専用セッション推奨）
- routes/api.php（1040行・46エンドポイント全クロージャ）→ Controller分割
- 分割先: PostApiController / CommentApiController / AnalysisApiController 等

## 重要な参照先
- CLAUDE.md（本リポジトリ）: ルール・コーディング規則・boolean変換必須
- .claude/skills/phase3-improvements.md: 全改善項目の詳細仕様
- .claude/skills/api-spec.md: API仕様・認証・型定義
- ~/logos-laravel/.claude/skills/features.md: バックエンド機能仕様

## 環境情報
- ローカル開発: cd ~/logos-laravel && ./vendor/bin/sail up -d && cd ~/logos-next && npm run dev
- adminユーザー: admin@test.com（is_pro・is_admin設定済み）
- git現状: main ブランチ最新・origin/main と同期済み

## 開始手順
まず .claude/skills/phase3-improvements.md を読んで B-2・F-3・F-4 の詳細仕様を確認し、
実装計画をまとめてから着手してください。
CLAUDE.md §0「最重要ルール」も必ず確認すること。
```
