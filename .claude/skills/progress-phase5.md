# Phase 5 進行中記録

最終更新: 2026-04-03（Session 54）

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

### Git タグ（Session 51）
- `v6.95-session51-before-doc-fixes`
- `v6.96-session51-before-directorymap-fix`
- `v6.97-session51-before-phase5-rhfzod`
- `v6.98-session51-before-step2-cleanup`
- `v6.99-session51-before-sonner`
- `v7.00-session51-before-image-migration`
- `v7.01-session51-after-step2-complete`（Step 2 完了タグ）

---

## Step 2 追加修正: アバター表示バグ完全修正 ✅（Session 52 / 2026-04-03）

### 実施内容

#### ① `<Image fill>` → 明示的サイズ（Bug 1 完全修正）

| ファイル | 変更 |
|---|---|
| `components/UserAvatar.tsx` | `fill` → `width={px} height={px}`（sm=28/md=32/lg=40）、`relative` 削除 |
| `components/Header/UserMenu.tsx` | `fill` → `width={px} height={px}`、`sizePx` prop 廃止・`TAILWIND_SIZE_PX` マップで自動導出 |
| `app/notifications/page.tsx` | `fill` → `width={36} height={36}`、`relative` 削除 |
| `app/topics/[id]/_components/AnalysisCard.tsx` | `fill` → `width={32} height={32}`、`relative` 削除 |

#### ② AuthContext updateUser + cache:no-store（Bug 2 修正）

| ファイル | 変更 |
|---|---|
| `context/AuthContext.tsx` | `fetchUser()` に `cache: "no-store"` 追加、`updateUser(partial)` 追加 |
| `app/profile/page.tsx` | `refetch()` → 単一 `updateUser(patch)` 呼び出し + `globalMutate` でトピック SWR 再検証 |

#### ③ next.config.ts 修正（根本原因2件）

**問題1:** `imageSizes` にアバター実寸（28/36/40px）が未登録 → `/_next/image` が 400 を返す
→ `imageSizes: [16, 28, 32, 36, 40, 48, 64, 96, 128, 256, 384]` に追加

**問題2:** 開発環境で `localhost` → `127.0.0.1`（プライベートIP）と判定され Next.js SSRF 防御でブロック
→ `unoptimized: process.env.NODE_ENV !== "production"` で開発環境は最適化をバイパス
（本番 Vercel は公開ドメインのため最適化維持）

#### ④ スマホヘッダー Avatar sizePx 修正

`components/Header/index.tsx`: `<Avatar size="h-10 w-10">` に `sizePx={40}` を追加 → 後に `sizePx` prop 廃止で不要に

### 技術的教訓（Session 52）

- **検証なし実装の危険性**: `/_next/image` の 400 エラーと private IP ブロックは curl 1行で発見できた。コード修正前に API 疎通確認を徹底する
- **Next.js `<Image>` + localhost**: 開発環境では `localhost` がプライベートIPとしてブロックされる。`unoptimized: isDev` が正解
- **`imageSizes`**: `<Image width={px}>` で指定する px は `imageSizes` または `deviceSizes` に含まれている必要がある

### Git タグ（Session 52）
- `v7.02-session52-before-avatar-fix`
- `v7.03-session52-after-avatar-fix`
- `v7.04-session52-after-avatar-complete`
- `v7.05-session52-after-imagesizes-fix`
- `v7.06-session52-after-unoptimized-dev`
- `v7.07-session52-after-avatar-cleanup`（Session 52 最終タグ）

---

## Step 3: SSR 化 ✅ 完了（Session 53 / 2026-04-03）

httpOnly Cookie 認証解禁により、Server Component からも認証済み API リクエストが可能になった。

### ① /categories/[id] 完全 SSR 化

**変更ファイル:** `app/categories/[id]/page.tsx`・`app/categories/[id]/_components/CategoryTopicsClient.tsx`

- `page.tsx` に `fetchCategoryInfo()` を追加（`revalidate: 3600`）
- カテゴリ名・親カテゴリを Server Component で解決し props として渡す
- `CategoryTopicsClient.tsx` の `useEffect`（`/api/proxy/categories` CSRフェッチ）を削除

**背景:** Phase 4 Session 23 時点は「Server Component から `http://localhost/api/categories` を fetch すると中分類が null」の不具合で CSR 解決を余儀なくされていた。Session 53 で curl 確認したところ不具合が再現せず、SSR化を完了。

### ② /analyses/[id] SSR 化（Phase 3 F-1 残タスク）

**変更ファイル:** `app/analyses/[id]/page.tsx`（書き換え）・`app/analyses/[id]/_components/AnalysisShowClient.tsx`（新規）

- `page.tsx` → Server Component。`cookies()` で `logos_token` 取得 → `${API_BASE_URL}/api/analyses/${id}` に直接 fetch（`cache: "no-store"`）
- 未認証（401）/ 404 → SSR で「分析データが見つかりませんでした」を返却（ローディング状態なし）
- `AnalysisShowClient.tsx` → `"use client"`。全描画ロジック・`handleBack`・`Analysis` 型（export）を担当
- `topics/[id]`（Server Component → TopicPageClient）と同一パターンに統一

**検証結果（curl）:**
- Cookie 付き `/analyses/11` → 分析内容がSSR HTML に含まれる ✅
- Cookie なし → 「見つかりませんでした」がSSR HTML に含まれる ✅
- `/categories/7` → 「国際情勢」「政治」がSSR HTML に含まれる ✅

### Blade 参照ルール整理（同 Session）

技術的リファクタリング（SSR化・型改善等）では Blade 参照が不要であることを CLAUDE.md に明記。
「機能追加・ロジック変更」の曖昧な表現を作業種別ごとの表に整理した。

### Git タグ（Session 53）
- `v7.08-session53-before-ssr`（着手前）
- `v7.09-session53-after-ssr`（Step 3 完了）

---

---

## Step 3 追加修正: 技術的負債2件解消 ✅（Session 54 / 2026-04-03）

### ① `profile/page.tsx` useEffect 不要再フェッチ修正

`useEffect` deps に `user` が含まれていたため、プロフィール保存後に `updateUser()` が呼ばれると
`user` が更新され → useEffect 再実行 → `/profile` を不要に再フェッチする問題を修正。

**変更:** `hasFetched` ref を追加し `hasFetched.current` チェックで初回フェッチのみ実行。
- `app/profile/page.tsx`: `useRef(false)` 追加、`if (hasFetched.current) return;` + `hasFetched.current = true;` 追加

### ② アバター自動リサイズ実装（Laravel 側）

アップロードされた画像を保存前に自動でリサイズする仕組みを追加。
`intervention/image` v4.0.0（2026-03-28 リリース）を導入。

**変更:** `ProfileApiController::update()`
- `scaleDown(400, 400)` で最大 400×400px にリサイズ（縦横比維持）
- `JpegEncoder(85)` で JPEG 85品質に変換
- GD ドライバー使用（さくら PHP 8.3・Sail PHP 8.5 両対応）

**本番適用済み（Session 54）:** `git pull` + `composer install` + `config:cache` + `route:cache` 完了

### Git タグ（Session 54）
- `v7.10-session54-before-profile-fix`（着手前）

---

## Step 4 以降（未着手）

- Laravel Socialite（Google / X ログイン）※Session 54 で導入コスト調査済み（3〜3.5セッション）
- SEO（h1/h2・OGP）
- LP 作成
- AnalysisCard 抜本的改革（共通コンポーネント化）
- Stripe Webhook
- パスワードリセット
- KPI 設定
