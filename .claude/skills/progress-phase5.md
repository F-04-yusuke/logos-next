# Phase 5 進行中記録

最終更新: 2026-04-03（Session 51）

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

**React Hook Form + Zod 導入:**

| ファイル | スキーマ | 変更内容 |
|---|---|---|
| `app/login/page.tsx` | `loginSchema`（email・password） | useState+手動バリデーション → RHF+Zod にリライト |
| `app/register/page.tsx` | `registerSchema`（name・email・password・password_confirmation） | 同上 |

- `npm install react-hook-form zod @hookform/resolvers` 導入済み
- エラーメッセージは `errors.field?.message` で一元管理
- submit 時のみ Laravel API エラーを `setError("root")` でフォームに反映

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

### Git タグ（Session 50）
- `v6.86` 〜 `v6.94-session50-after-httpcookie-complete`（詳細は progress-roadmap.md 参照）

---

## Step 2: 表示速度最適化 ✅ 完了（Session 51 / 2026-04-03）

### 実施内容

#### ① Dead code 削除

**背景:** httpOnly Cookie + catch-all プロキシ（`/api/proxy/[...path]`）への完全移行完了。
残存していた旧 Route Handler 群・ユーティリティは不要になっていた。

**削除したファイル（7件）:**

| ファイル | 理由 |
|---|---|
| `app/api/topics/route.ts` | `/api/proxy/topics` に統合済み |
| `app/api/topics/[id]/route.ts` | `/api/proxy/topics/[id]` に統合済み |
| `app/api/categories/route.ts` | `/api/proxy/categories` に統合済み |
| `app/api/categories/[id]/featured-post/route.ts` | `/api/proxy/categories/[id]/featured-post` に統合済み |
| `app/api/analyses/[id]/route.ts` | `/api/proxy/analyses/[id]` に統合済み |
| `lib/proxy-fetch.ts` | Route Handler 削除により不要（`apiFetch` 等の内部ユーティリティ） |
| `lib/auth.ts` | httpOnly Cookie 移行完了・localStorage 実装削除済み（Session 50 スタブ → Session 51 冒頭に正式削除確認） |

**削除前にクライアント側を `/api/proxy/` に移行したファイル:**
- `app/_components/HomeClient.tsx` — 3つの fetch を `/api/proxy/` に変更
- `app/categories/[id]/_components/CategoryTopicsClient.tsx` — 同上
- `app/topics/create/page.tsx` — `/api/categories` → `/api/proxy/categories`
- `app/topics/[id]/edit/page.tsx` — 同上

#### ② Sonner 導入（旧 Step 3 を前倒し実施）

**対象:** `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`
- Session 27 実装の自作トースト（`fixed top-4 right-4` の `useState` + `setTimeout` パターン）を廃止
- `npm install sonner` 導入
- `app/layout.tsx` に `<Toaster richColors position="top-right" />` 追加
- 各ページで `showToast(msg, "success/error")` → `toast.success(msg)` / `toast.error(msg)` に置換
- 3ページ合計で約 50 行のボイラープレート削減

#### ③ next/image 移行（`<img>` → `<Image>`）

**背景:** `<img>` タグではブラウザが画像を圧縮・最適化できず、フルサイズの JPEG を毎回ダウンロード。
Next.js の `<Image>` は WebP 変換・サイズ最適化・遅延ロードを自動で行う。

**next.config.ts 変更:**
```typescript
// NEXT_PUBLIC_API_BASE_URL から動的に hostname を抽出（AWS移行などドメイン変更に対応）
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";
let apiHostname = "localhost";
let apiProtocol: "http" | "https" = "http";
try {
  const parsed = new URL(apiBaseUrl);
  apiHostname = parsed.hostname;
  apiProtocol = parsed.protocol === "https:" ? "https" : "http";
} catch {}
const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: apiProtocol, hostname: apiHostname }] },
};
```

**移行したファイル（6件）:**

| ファイル | 変更箇所 | パターン |
|---|---|---|
| `components/UserAvatar.tsx` | アバター画像 | `fill` + relative wrapper div |
| `components/Header/UserMenu.tsx` | アバター画像 | `fill` + relative wrapper div |
| `app/notifications/page.tsx` | actorアバター画像 | `fill` + relative wrapper div |
| `app/topics/[id]/_components/AnalysisCard.tsx` | アバター + 分析プレビュー画像 | アバター: `fill` / 分析画像: `width={0} height={0} sizes` |
| `app/topics/[id]/_components/PostCard.tsx` | サムネイル + lightbox 画像 | サムネイル: `fill` / lightbox: `width={0} height={0} sizes="90vw"` |
| `app/analyses/[id]/page.tsx` | 分析プレビュー画像 | `width={0} height={0} sizes` |

**注意: `app/profile/page.tsx` の previewSrc は `data:` URL のため `<img>` のまま維持（`<Image>` は data: URL 未対応）**

#### ⚠️ Session 52 で修正必要な既知バグ

**① アバター `fill` → 明示的サイズへの変更（パフォーマンス問題）:**
- `fill` + `sizes` 未指定の場合、Next.js は `100vw` をデフォルトと見なし 1920px 相当の画像をダウンロード
- アバター（実際は 28〜40px）に 1920px を配信するのは `<img>` より悪化する可能性あり
- 修正対象: `components/UserAvatar.tsx`、`components/Header/UserMenu.tsx`
  - `<Image fill>` → `<Image width={sz} height={sz}>` の明示的ピクセル指定に変更
  - UserAvatar の sm/md/lg サイズは 28/32/40px、UserMenu アバターは 36px

**② アバター不一致（プロフィール保存後のナビゲーション表示ずれ）:**
- 根本原因: `fetchUser()` in `AuthContext.tsx` の `fetch("/api/auth/me")` に `cache: "no-store"` が不足
  → ブラウザが古い /api/auth/me レスポンスをキャッシュし、プロフィール保存後も旧アバターが表示される
- 修正方針:
  1. `fetchUser()` の fetch に `cache: "no-store"` を追加
  2. `updateUser(partial)` ヘルパーを AuthContext に追加（SWR optimistic update）
  3. `profile/page.tsx` の `handleProfileSaved` で保存レスポンスから即時 UI 更新

### Git タグ（Session 51）
- `v6.95-session51-before-doc-fixes`
- `v6.96-session51-before-directorymap-fix`
- `v6.97-session51-before-phase5-rhfzod`
- `v6.98-session51-before-step2-cleanup`
- `v6.99-session51-before-sonner`
- `v7.00-session51-before-image-migration`
- `v7.01-session51-after-step2-complete`（Step 2 完了タグ）

---

## Step 3: SSR 化（未着手）

httpOnly Cookie 認証解禁により、Server Component からも認証済み API リクエストが可能になった。

- `/analyses/[id]` SSR 化（Phase 3 F-1 残タスク）
- `/categories/[id]` SSR 化（Phase 4 Session 23 技術的負債）

---

## Step 4 以降（未着手）

- AnalysisCard 抜本的改革（共通コンポーネント化）
- SEO（h1/h2・OGP）
- LP 作成
- Stripe Webhook
- パスワードリセット
- KPI 設定
