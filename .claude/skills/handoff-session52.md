# LOGOSプロジェクト 引継ぎプロンプト（Session 52）

作成: 2026-04-03 / Session 51 完了時点

---

## Session 51 完了内容

### Phase 5 Step 2: 表示速度最適化 ✅ 完了

#### ① Dead code 削除

旧 Route Handler 群（`/api/proxy/` 統合前の残骸）と旧ユーティリティを削除。

**削除ファイル（7件）:**
- `app/api/topics/route.ts`
- `app/api/topics/[id]/route.ts`
- `app/api/categories/route.ts`
- `app/api/categories/[id]/featured-post/route.ts`
- `app/api/analyses/[id]/route.ts`
- `lib/proxy-fetch.ts`（旧 Route Handler 用ユーティリティ）
- `lib/auth.ts`（localStorage 実装・スタブ削除確認）

削除前に以下クライアントページを `/api/proxy/` に移行済み:
- `app/_components/HomeClient.tsx`
- `app/categories/[id]/_components/CategoryTopicsClient.tsx`
- `app/topics/create/page.tsx`
- `app/topics/[id]/edit/page.tsx`

**検証:** `npx tsc --noEmit` → エラーなし ✅

#### ② Sonner 導入

`app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx` の自作トーストを置き換え。
- `app/layout.tsx` に `<Toaster richColors position="top-right" />` 追加
- `toast.success(msg)` / `toast.error(msg)` に統一

#### ③ next/image 移行

`next.config.ts` に動的 `remotePatterns`（`NEXT_PUBLIC_API_BASE_URL` から hostname 抽出）を追加し、
以下 6 ファイルで `<img>` → `<Image>` に移行:

| ファイル | パターン |
|---|---|
| `components/UserAvatar.tsx` | `fill` + relative wrapper |
| `components/Header/UserMenu.tsx` | `fill` + relative wrapper |
| `app/notifications/page.tsx` | `fill` + relative wrapper |
| `app/topics/[id]/_components/AnalysisCard.tsx` | アバター: `fill` / 分析画像: `width={0} height={0} sizes` |
| `app/topics/[id]/_components/PostCard.tsx` | サムネイル: `fill` / lightbox: `width={0} height={0} sizes="90vw"` |
| `app/analyses/[id]/page.tsx` | `width={0} height={0} sizes` |

`app/profile/page.tsx` の previewSrc は `data:` URL のため `<img>` のまま維持。

### その他（Session 51 冒頭）
- `directory-map.md` を現在の構成に合わせて大幅修正（削除ファイルの除去・handoff-archive 追加等）
- `progress-phase5.md` に Step 1 の RHF+Zod 記載を追加
- `handoff-session51.md` → `handoff-archive/` に移動

**Git タグ（Session 51）:**
- `v6.95` 〜 `v7.01-session51-after-step2-complete`

---

## ⚠️ Session 52 冒頭で必ず修正する既知バグ

### Bug 1: アバター `<Image fill>` → 明示的サイズへの修正（パフォーマンス）

**問題:** `fill` + `sizes` 未指定 → Next.js は `100vw` をデフォルト → 1920px 相当の画像をダウンロード。
アバター（28〜40px）に 1920px を配信するのは `<img>` より悪化する可能性あり。

**修正対象・値:**
- `components/UserAvatar.tsx`: sm=28px / md=32px / lg=40px
  ```tsx
  // 現状: <Image src={...} fill className="object-cover" />
  // 修正: <Image src={...} width={sizeMap[size]} height={sizeMap[size]} className="object-cover" />
  // relative + overflow-hidden の wrapper div も削除可
  ```
- `components/Header/UserMenu.tsx`: アバターは 36px（h-9 w-9）
  ```tsx
  // 現状: fill + wrapper div
  // 修正: <Image width={36} height={36} className="object-cover rounded-full" />
  ```
- `app/notifications/page.tsx`: actorアバターは 36px（h-9 w-9）（同上）
- `app/topics/[id]/_components/AnalysisCard.tsx`: アバターは 32px（h-8 w-8）

### Bug 2: アバター不一致（プロフィール保存後のナビ表示ずれ）再発

**根本原因:**
`AuthContext.tsx` の `fetchUser()` で `fetch("/api/auth/me")` に `cache: "no-store"` が不足。
ブラウザが古い /api/auth/me レスポンスをキャッシュし、プロフィール保存後も旧アバターが表示される。

**修正方針（3ステップ）:**
1. `context/AuthContext.tsx` の `fetchUser()` の fetch に `cache: "no-store"` を追加
2. AuthContext に `updateUser(partial: Partial<User>)` を追加（SWR optimistic update で即時反映）
3. `app/profile/page.tsx` の `handleProfileSaved` で保存レスポンスから `updateUser` を呼ぶ

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v7.01-session51-after-step2-complete` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | 変更なし |

---

## Session 52 タスク（優先順）

### 1. Bug 修正（上記 Bug 1・2）

### 2. Phase 5 Step 3: SSR 化

httpOnly Cookie 認証解禁により、Server Component からも認証済み API リクエストが可能になった。

**① /analyses/[id] SSR 化**
- 現状: CSR（`useEffect` + `fetch("/api/proxy/analyses/[id]")`）
- 目標: Server Component で `cookies().get("logos_token")` → Laravel 直接 fetch
- Blade 参照: `~/logos-laravel/resources/views/analyses/show.blade.php`

**② /categories/[id] SSR 化**
- 現状: SSR 初期トピック + CSR カテゴリ名解決（Session 23 技術的負債）
- 目標: Server Component でカテゴリ名・トピック両方を fetch
- Blade 参照: `~/logos-laravel/resources/views/categories/show.blade.php`

### 3. Phase 5 Step 4 候補

| 優先度 | 項目 |
|---|---|
| 高 | アバター自動リサイズ（Laravel側・intervention/image）← Bug 1 修正後に実施 |
| 高 | SEO対策（h1/h2整備・OGP設定） |
| 高 | LP作成（welcome.blade.php ベース） |
| 中 | AnalysisCard 抜本的改革 |
| 中 | Stripe Webhook 受け口実装 |
| 中 | パスワードリセット |
| 低 | メール認証 |
| 低 | KPI設定 |

---

## 技術的負債 全リスト（Session 51 時点）

| 優先度 | 項目 | ステータス |
|---|---|---|
| ✅ 完了 | httpOnly Cookie 化 | Session 50 |
| ✅ 完了 | React Hook Form + Zod（login/register） | Session 50 |
| ✅ 完了 | Dead code 削除（旧 Route Handler・lib/auth・lib/proxy-fetch） | Session 51 |
| ✅ 完了 | Sonner 導入（3ツールページ） | Session 51 |
| ✅ 完了 | next/image 移行（6ファイル） | Session 51 |
| 最優先 | アバター `fill` → 明示的サイズ（Bug 1） | 未修正 |
| 最優先 | アバター不一致修正・AuthContext cache:no-store（Bug 2） | 未修正 |
| 最優先 | アバター自動リサイズ（Laravel 側・intervention/image） | 未着手 |
| 高 | /analyses/[id] SSR 化 | 未着手 |
| 高 | /categories/[id] SSR 化 | 未着手 |
| 高 | SEO対策 | 未着手 |
| 高 | LP作成 | 未着手 |
| 中 | AnalysisCard 抜本的改革 | 未着手 |
| 中 | Stripe Webhook | 未着手 |
| 中 | パスワードリセット | 未着手 |
| 低 | メール認証 | 未着手 |
| 低 | KPI設定 | 未着手 |

---

## 起動手順

```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d
cd ~/logos-next && npm run dev
# → http://localhost:3000

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

## 検証コマンド

```bash
cd ~/logos-next && npx tsc --noEmit
cd ~/logos-next && npm run build
```

---

## 重要ルール再掲

1. **着手前に必ずタグを打つ**: `git tag v7.XX-sessionYY-before-XXX && git push origin ...`（コードを変更するすべての回答で毎回・1回答1タグ）
2. **Blade 参照ルール**: 機能追加・移植 → 必ず先に Blade を読む / UIデザインのみ → 不要
3. **boolean 変換**: Laravel API は `0/1` で返す → JSX で必ず `!!` 変換
4. **一度に編集するファイルは 5 ファイル以内**
5. **Gemini API キーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL 終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
8. **hydration error**: `rm -rf .next && npm run dev` で解消
9. **勝手な進行禁止**: ステップ完了の判断はユーザーが行う
