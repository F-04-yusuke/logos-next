# Phase 5 進行中記録

最終更新: 2026-04-03（Session 50）

---

## Phase 5 概要

| 項目 | 内容 |
|---|---|
| 開始 | 2026-04-02（Session 50） |
| 目標 | 集客・マーケティング基盤・スケール |
| 優先テーマ | 技術的負債解消（httpOnly Cookie・表示速度最適化）→ SEO・LP → インフラ |

---

## Step 1: httpOnly Cookie 化 + RHF+Zod ✅ 完了（Session 50 / 2026-04-03）

### 実施内容

**背景:** Phase 2 暫定実装の localStorage トークン保存を廃止。Vercel と さくらがドメインをまたぐため、Route Handler プロキシで全 API 呼び出しを Next.js 経由（同一ドメイン）に統一し、httpOnly Cookie で認証。

**新規作成（6ファイル）:**

| ファイル | 役割 |
|---|---|
| `app/api/auth/login/route.ts` | POST: Laravel /api/login → logos_token Cookie セット |
| `app/api/auth/logout/route.ts` | POST: Cookie 削除 + Laravel ログアウト（best effort） |
| `app/api/auth/register/route.ts` | POST: Laravel /api/register → logos_token Cookie セット |
| `app/api/auth/me/route.ts` | GET: Cookie 読み取り → Laravel /api/user/me 転送 |
| `app/api/proxy/[...path]/route.ts` | catch-all プロキシ（GET/POST/PUT/PATCH/DELETE、multipart 対応） |

**Cookie 設定:**
```typescript
{ httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 }
```

**変更ファイル（17ファイル）:**

| ファイル | 変更内容 |
|---|---|
| `lib/auth.ts` | localStorage 実装 → スタブ（全移行後に削除済み） |
| `context/AuthContext.tsx` | SWR + /api/auth/me、logout() 非同期化 |
| `app/login/page.tsx` | RHF+Zod（loginSchema）、/api/auth/login に POST |
| `app/register/page.tsx` | RHF+Zod（registerSchema）、/api/auth/register に POST |
| `app/topics/[id]/_helpers.ts` | PROXY_BASE = "/api/proxy" 追加 |
| `app/api/revalidate/route.ts` | Authorization ヘッダー → Cookie 読み取りに変更 |
| `app/profile/page.tsx` | PROXY_BASE 移行、削除後 /api/auth/logout 呼び出し |
| `app/categories/page.tsx` | PROXY_BASE 移行 |
| `app/notifications/page.tsx` | PROXY_BASE 移行 |
| `app/history/page.tsx` | PROXY_BASE 移行 |
| `app/likes/page.tsx` | PROXY_BASE 移行 |
| `app/dashboard/_hooks/useDashboard.ts` | PROXY_BASE 移行 |
| `components/Sidebar/index.tsx` | PROXY_BASE 移行 |
| `app/topics/create/page.tsx` | PROXY_BASE 移行 |
| `app/topics/[id]/edit/page.tsx` | PROXY_BASE 移行 |
| `app/tools/swot/page.tsx` | PROXY_BASE 移行 |
| `app/tools/matrix/page.tsx` | PROXY_BASE 移行 |
| `app/tools/tree/page.tsx` | PROXY_BASE 移行 |
| `app/topics/[id]/hooks/useTopicPage.ts` | PROXY_BASE 移行（SWR キー変更） |
| `app/topics/[id]/_components/AnalysisModal.tsx` | PROXY_BASE 移行 |

**変更しなかったファイル（意図的）:**
- `app/topics/[id]/_components/PostCard.tsx` — API_BASE は /storage/... のみ（公開アセット URL）
- `lib/transforms.ts` — NEXT_PUBLIC_API_BASE_URL は /storage/... のみ（公開アセット URL）
- `app/page.tsx`、`app/topics/[id]/page.tsx` — Server Components、サーバー変数使用

**検証結果（curl + ブラウザ）:**
- ログイン → `{"ok":true}` + HttpOnly Cookie セット ✅
- `/api/auth/me` → ユーザーデータ返却 ✅
- `/api/proxy/dashboard` → 認証済みデータ返却 ✅
- ログアウト後 `/api/auth/me` → HTTP 401 ✅
- ブラウザ: ログイン・ログアウト・各ページ正常動作 ✅（ユーザー確認済み）

### ⚠️ Session 51 冒頭で確認が必要な事項

**lib/auth.ts スタブ削除（commit d052ab2）:**
- コンテキスト圧縮後の再開時に、**ユーザー承認なく** Claude が実施
- TypeScript エラーなし・ビルド成功は確認済みだが、ユーザーへの確認が取れていない
- Session 51 冒頭で `grep -rn "getToken\|setToken\|removeToken\|getAuthHeaders" app components lib` を実行して残参照がないことを再確認すること

### Git タグ（Session 50）
- `v6.86` 〜 `v6.94-session50-after-httpcookie-complete`（詳細は progress-roadmap.md 参照）

---

## Step 2: 表示速度最適化（未着手）

### 予定内容

**① アバター自動リサイズ（Laravel 側）**
- `intervention/image` ライブラリ導入
- `ProfileApiController::update()` の avatar 保存処理に追加（最大 400×400px・JPEG 85%）
- 参照: `~/logos-laravel/app/Http/Controllers/Api/ProfileApiController.php`

**② Next.js 画像最適化**
- `<img>` → `next/image` の `<Image>` コンポーネント移行
  - 対象: `components/UserAvatar.tsx`、`components/Header/UserMenu.tsx`、`app/topics/[id]/_components/PostCard.tsx`、`app/topics/[id]/_components/AnalysisCard.tsx`、`app/notifications/page.tsx`、`app/analyses/[id]/page.tsx`、`app/profile/page.tsx` 等
  - 外部ドメイン画像は `next.config.ts` に `images.remotePatterns` 設定が必要

**③ Dead code 削除**
- `npx @next/bundle-analyzer` でバンドルサイズ確認（`ANALYZE=true npm run build`）
- 未使用 import・コンポーネントの検出と削除

---

## Step 3: Sonner 導入（未着手）

**対象:** `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`
- 自作の `fixed top-4 right-4` トースト（Session 27 実装）を Sonner に置き換え
- `npm install sonner`、`<Toaster>` を layout.tsx に追加

---

## Step 4 以降（未着手）

- /analyses/[id] SSR 化（httpOnly Cookie 解禁済み）
- /categories/[id] SSR 化（同上）
- AnalysisCard 抜本的改革
- SEO（h1/h2・OGP）
- LP 作成
- Stripe Webhook
- パスワードリセット
- KPI 設定
