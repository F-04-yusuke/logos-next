# Vercel デプロイ設定

## 接続情報
- GitHubリポジトリ: F-04-yusuke/logos-next
- ブランチ: main（pushで自動デプロイ）
- フレームワーク: Next.js（自動検出）
- Root Directory: /（ルートのまま）

## 環境変数（Vercelダッシュボードで設定・コードに書かない）

| 変数名 | 値 | 備考 |
|---|---|---|
| NEXT_PUBLIC_API_BASE_URL | https://gs-f04.sakura.ne.jp | 本番API URL |

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

### 将来の対応（フェーズ3・SEO対策時）
- SSRに戻すことが望ましい（SEO・初期表示速度の観点）
- Vercelとさくら間のネットワーク設定（IPホワイトリスト等）を解決する必要がある
- または Next.js の Route Handler（app/api/）経由でプロキシする方式も検討

### 教訓
- Vercelのビルドログはエラーなしでもランタイムエラーになりうる
- SSR/CSRの使い分けはVercelとバックエンドのネットワーク疎通を事前確認してから決める
