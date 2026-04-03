# Vercel デプロイ設定

## 接続情報
- GitHubリポジトリ: F-04-yusuke/logos-next
- ブランチ: main（pushで自動デプロイ）
- フレームワーク: Next.js（自動検出）
- Root Directory: /（ルートのまま）

## 環境変数（Vercelダッシュボードで設定・コードに書かない）

| 変数名 | 値 | 備考 |
|---|---|---|
| NEXT_PUBLIC_API_BASE_URL | https://gs-f04.sakura.ne.jp | 本番API URL（CSR用・ブラウザから読める） |
| API_BASE_URL | https://gs-f04.sakura.ne.jp | SSR用・NEXT_PUBLIC_なし・All Environments（2026-03-22設定済み） |

## ローカル環境変数（.env.local）
```
NEXT_PUBLIC_API_BASE_URL=http://localhost
```

## 環境変数ルール
- `NEXT_PUBLIC_` をつけた変数はブラウザに公開される
- Gemini APIキー等の秘密情報には絶対に `NEXT_PUBLIC_` をつけない
- サーバーサイド専用の変数は `NEXT_PUBLIC_` なしで定義する
- Next.jsからGeminiを呼ぶ場合は `app/api/` ルートハンドラかLaravel API経由（絶対にフロントに書かない）
- 参考: https://gigazine.net/news/20260227-google-api-key-gemini/

## デプロイ時の注意
- `npm run build` がローカルで通ることを確認してからpushする
- TypeScriptの型エラーはビルドエラーになるため必ず解消する
- 環境変数が未設定だとAPIリクエストが全て失敗する
- Vercelの環境変数変更後は再デプロイが必要

---

## Vercelランタイムエラー障害記録（2026-03-21）

### 発生した問題
- SSR（サーバーサイドレンダリング）でAPIフェッチしていたため、VercelサーバーからさくらへのHTTPリクエストがタイムアウトした
- 症状: "This page couldn't load / A server error occurred"（ERROR 3292540420）
- ビルドは成功するがランタイムで失敗するため原因特定に時間がかかった

### 対処（暫定・現在もこの方式）
- `app/page.tsx` と `app/topics/[id]/page.tsx` を CSR（クライアントサイドレンダリング）に変換
- APIフェッチをVercelサーバーではなくユーザーのブラウザから行うことで解消
- `API_BASE_URL` → `NEXT_PUBLIC_API_BASE_URL` に変更（ブラウザから読める変数名に統一）
- **新ページを作る際は `"use client"` でCSR実装を基本とする（フェーズ3まで）**

### 解決済み（Phase 3 F-1・2026-03-22）
- Next.js Route Handler（`app/api/`）をプロキシとして作成し、SSRに復帰
- Vercel サーバーがさくら API を叩き、ブラウザには Vercel が返す構成（Vercel内部完結）
- `/` と `/topics/[id]` が SSR Server Component に移行済み
- **当時の残タスク**: `/analyses/[id]` のSSR化 — `auth:sanctum` 必須のためCookie認証導入まで保留 → **Phase 5 Session 53 で完了済み**

### Session 38 パフォーマンス改善（2026-03-26）
- `vercel.json` 新規作成 — `regions: ["hnd1"]`（東京）でVercel↔さくら間RTT削減
- SSR fetch `cache: "no-store"` → `next: { revalidate: 30 }` / カテゴリは `revalidate: 3600`
- `/category-list` を Server Component に SSR 化（認証不要ページ）
- LCP 画像（`FeaturedTopicPanel`）に `fetchPriority="high"` + `loading="eager"` 追加
- **結果**: Vercel LCP 2.96s → 0.56s（Good）

### 教訓
- Vercelのビルドログはエラーなしでもランタイムエラーになりうる
- SSR/CSRの使い分けはVercelとバックエンドのネットワーク疎通を事前確認してから決める

---

## Vercel環境のみAPIが失敗する場合の診断方法（Session 29 教訓）

「ローカルでは動くがVercelでは動かない」APIエラーは、フロント側の `catch` がエラーを握りつぶしているため原因が見えにくい。以下の手順で診断する。

### Step 1: マイグレーション漏れを確認
本番APIが 500 を返す最多原因は「マイグレーション未適用」。新しいカラムへの書き込みで即500になる。

```bash
ssh gs-f04@gs-f04.sakura.ne.jp 'cd ~/www/logos && php artisan migrate:status'
# Pending が表示されたら即 migrate --force を実行
ssh gs-f04@gs-f04.sakura.ne.jp 'cd ~/www/logos && php artisan migrate --force'
```

### Step 2: curlで実際のAPIレスポンスを確認
フロントの `alert("投稿に失敗しました")` だけではHTTPステータスもエラー内容もわからない。curlで直接叩くこと。

```bash
# トークン取得
TOKEN=$(curl -s -X POST "https://gs-f04.sakura.ne.jp/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")

# 失敗しているエンドポイントを直接テスト
curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "https://gs-f04.sakura.ne.jp/api/topics/2/posts" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"url":"https://example.com","category":"記事","is_published":true}'
```

### Step 3: ローカルとVercelの差異を切り分ける
| 状況 | 疑うべき原因 |
|---|---|
| 特定のエンドポイントだけ失敗 | マイグレーション未適用・バリデーションエラー |
| 全エンドポイントが失敗 | 環境変数 `NEXT_PUBLIC_API_BASE_URL` 未設定・CORS |
| サムネ・OGPだけ取れない | さくらサーバーの外部HTTP制約（→ logos-laravel の infra.md 参照） |
| ローカルでは動く | ローカルとさくらのIP・環境差（さくらは `file_get_contents` でHTTPS外部取得が失敗する） |
