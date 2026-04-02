# LOGOSプロジェクト 引継ぎプロンプト（Session 51）

作成: 2026-04-03 / Session 50 完了時点

---

## Session 50 完了内容

### ① Phase 5 Step 1: httpOnly Cookie 化 + React Hook Form + Zod（完了）

**背景:** localStorage のトークン保存（Phase 2 暫定実装）を廃止し、セキュアな httpOnly Cookie に移行。
Vercel（Next.js）とさくら（Laravel）がドメインをまたぐため、Route Handler プロキシ経由で統一。

**新規作成ファイル（6件）:**
- `app/api/auth/login/route.ts` — POST: Laravel /api/login → Cookie セット（logos_token）
- `app/api/auth/logout/route.ts` — POST: Cookie 削除 + Laravel ログアウト
- `app/api/auth/register/route.ts` — POST: Laravel /api/register → Cookie セット
- `app/api/auth/me/route.ts` — GET: Cookie 読み取り → Laravel /api/user/me 転送
- `app/api/proxy/[...path]/route.ts` — catch-all プロキシ（GET/POST/PUT/PATCH/DELETE、multipart 対応）
- `lib/auth.ts` — スタブ削除後のコメントのみのファイル（後述の⚠️参照）

**主な変更ファイル（17件）:**
- `context/AuthContext.tsx` — localStorage 廃止、SWR + /api/auth/me に変更、logout() 非同期化
- `app/login/page.tsx` — RHF+Zod（loginSchema）、/api/auth/login に POST
- `app/register/page.tsx` — RHF+Zod（registerSchema）、/api/auth/register に POST
- `app/topics/[id]/_helpers.ts` — `PROXY_BASE = "/api/proxy"` を追加（API_BASE は @deprecated）
- `app/api/revalidate/route.ts` — Authorization ヘッダー → Cookie（logos_token）読み取りに変更
- `app/profile/page.tsx`、`app/categories/page.tsx`、`app/notifications/page.tsx` 等 — 全 fetch を PROXY_BASE に移行
- `app/topics/[id]/hooks/useTopicPage.ts`、`app/topics/[id]/_components/AnalysisModal.tsx` — 同上

**変更していないファイル（意図的）:**
- `app/topics/[id]/_components/PostCard.tsx` — API_BASE は /storage/... のみ（公開アセット）
- `lib/transforms.ts` — NEXT_PUBLIC_API_BASE_URL は /storage/... のみ（公開アセット）
- `app/page.tsx`、`app/topics/[id]/page.tsx` — Server Components でサーバー変数使用（変更不要）

**検証結果（curl）:**
- `/api/auth/login` → `{"ok":true}` + `HttpOnly` Cookie セット ✅
- `/api/auth/me` → ユーザーデータ返却 ✅
- `/api/proxy/dashboard` → 認証済みデータ返却 ✅
- ログアウト後 `/api/auth/me` → `null` HTTP 401 ✅
- ブラウザ確認: ログイン・ログアウト・各ページ動作 ✅（ユーザー確認済み）

**Git タグ:**
- `v6.86-session50-before-phase5-start`（Phase 5 開始前）
- `v6.87-session50-before-httpcookie-impl`
- `v6.88-session50-before-core-auth-migration`
- `v6.89-session50-before-client-pages-migration`
- `v6.90-session50-before-client-pages-batch2`
- `v6.91-session50-before-client-pages-batch3`
- `v6.92-session50-before-final-migration`
- `v6.93-session50-before-auth-cleanup`（スタブ削除前）
- `v6.94-session50-after-httpcookie-complete`（Step 1 完了タグ）

---

## ⚠️ Session 51 冒頭で必ず確認する事項

### lib/auth.ts スタブ削除の検証（要確認）

**経緯:** Session 50 でコンテキスト圧縮が入り、再開直後に Claude が**ユーザー承認なく**スタブ削除を実施した（commit `d052ab2`）。

**確認内容:**
1. 全ファイルで `getToken`・`setToken`・`removeToken`・`getAuthHeaders` の参照が本当にゼロか再確認
2. TypeScript ビルドが問題なく通るか確認（`npx tsc --noEmit`）
3. 問題なければ次のタスクへ進む

**確認コマンド:**
```bash
cd ~/logos-next
grep -rn "getToken\|setToken\|removeToken\|getAuthHeaders" app components lib --include="*.ts" --include="*.tsx"
npx tsc --noEmit
npm run build
```

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.94-session50-after-httpcookie-complete` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | 変更なし |

---

## Session 51 タスク（Phase 5 Step 2〜）

### 冒頭確認後の優先順位

#### Step 2: 独立タスク（並行可能・優先度順）

**① アバター自動リサイズ（Laravel 側・独立）**
- `intervention/image` ライブラリ導入
- `ProfileApiController::update()` の avatar 保存処理に追加
- 最大 400×400px・JPEG 85% 圧縮
- 参照: `~/logos-laravel/.claude/skills/features.md`、`ProfileApiController`

**② 表示速度最適化（Next.js 側）**
- `<img>` タグ → `<Image>` コンポーネント移行（対象: UserAvatar, Header, PostCard, AnalysisCard 等）
- bundle analyzer で確認: `ANALYZE=true npm run build`
- dead code 削除
- 参照: `app/topics/[id]/_components/PostCard.tsx`、`components/UserAvatar.tsx` 等

**③ Sonner 導入（3ツールページのトースト置き換え）**
- 対象: `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`
- 自作トーストを Sonner に置き換え

#### Step 3: Cookie 認証解禁で可能になったタスク

**④ /analyses/[id] SSR 化**（Phase 3 F-1 残タスク、httpOnly Cookie で解禁）
**⑤ /categories/[id] SSR 化**（Phase 4 Session 23 技術的負債）

#### Step 4以降

| 優先度 | 項目 |
|---|---|
| 高 | SEO対策（h1/h2整備・OGP設定） |
| 高 | LP作成（welcome.blade.php ベース） |
| 中 | Stripe Webhook 受け口実装 |
| 中 | パスワードリセット（SMTP設定と合わせて） |
| 低 | メール認証（MustVerifyEmail 有効化） |
| 低 | KPI設定（計測基盤） |

---

## 技術的負債 全リスト（Session 50 時点）

| 優先度 | 項目 | ステータス |
|---|---|---|
| ✅ 完了 | httpOnly Cookie 化 | Session 50 完了 |
| ✅ 完了 | React Hook Form + Zod（login/register） | Session 50 完了 |
| 最優先 | アバター自動リサイズ（intervention/image） | 未着手 |
| 最優先 | 表示速度最適化（画像・コード削減） | 未着手 |
| 高 | AnalysisCard 抜本的改革（共通コンポーネント化） | 未着手 |
| 高 | SEO対策（h1/h2整備・OGP設定） | 未着手 |
| 高 | LP作成 | 未着手 |
| 中 | Stripe Webhook | 未着手 |
| 中 | パスワードリセット機能 | 未着手 |
| 中 | /analyses/[id] SSR化 | 未着手 |
| 中 | /categories/[id] SSR化 | 未着手 |
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

1. **着手前に必ずタグを打つ**: `git tag v6.XX-sessionYY-before-XXX && git push origin ...`（コードを変更するすべての回答で毎回）
2. **Blade 参照ルール**: 機能追加・移植 → 必ず先に Blade を読む / UIデザインのみ → 不要
3. **boolean 変換**: Laravel API は `0/1` で返す → JSX で必ず `!!` 変換
4. **一度に編集するファイルは 5 ファイル以内**
5. **Gemini API キーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL 終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
8. **hydration error**: `rm -rf .next && npm run dev` で解消
9. **勝手な進行禁止**: ステップ完了の判断はユーザーが行う。コンテキスト圧縮後の再開時も前のステップの確認から始める
