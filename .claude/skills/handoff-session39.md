# LOGOSプロジェクト 引継ぎプロンプト（Session 39）

作成: 2026-03-26 / Session 38 完了時点

---

## Session 38 完了内容

### U-37: 分析タブ プレビューUI を閲覧画面と統一・縦幅拡大

**変更ファイル:** `app/topics/[id]/_components/AnalysisCard.tsx`

- `tree`: シンプルカード積み上げ → 閲覧画面と同一のアバター丸＋コネクタ線（`PreviewTreeNode` 新規追加）
- `swot`: 箇条書きのみ → 閲覧画面と同一の `bg-gray-50` パネル囲みアイテム・全件表示
- `image`: `max-h` 制限のみ → 閲覧画面と同一の白カード（`rounded-xl border`）内配置
- `matrix`: 変更なし（すでに閲覧画面と同一）
- プレビュー高さ: `h-[200px]` → `h-[400px]`

**Gitタグ:** `v6.36-session38-analysis-preview-unified`

### P-1: Vercel パフォーマンス改善

**変更ファイル:** `vercel.json`（新規）/ `app/page.tsx` / `app/categories/[id]/page.tsx` / `app/category-list/page.tsx` / `app/_components/HomeClient.tsx`

**結果:** Vercel LCP 2.96s (Bad) → **0.56s (Good)**

| 対応 | 内容 |
|---|---|
| `vercel.json` 新規 | `regions: ["hnd1"]`（東京）でVercel↔さくら間RTT削減 |
| SSRキャッシュ追加 | topics `revalidate:30` / categories `revalidate:3600` |
| `/category-list` SSR化 | `"use client"` + `useEffect` → Server Component |
| LCP画像優先読み込み | `fetchPriority="high"` + `loading="eager"` |

**Gitタグ:** `v6.37-session38-ssr-perf`

---

## Session 38 の教訓

### ① CLSの計測ページに注意
LCP/CLS等のパフォーマンス指標は計測ページによって大きく異なる。改修前後の比較は必ず同じページで行う。`/analyses/[id]` のCSRページはmatrixテーブルの遅延レンダリングでCLSが高くなりやすい。

### ② Vercelリージョン変更の効果が最大
SSR→さくら間のRTT削減が最も効く。`vercel.json` の `regions: ["hnd1"]` 1行で LCP が 2.96s → 0.56s に改善した。

### ③ `no-store` → `revalidate` で ISR 化
SSR フェッチの `cache: "no-store"` はリクエストのたびにさくらを叩く。`next: { revalidate: N }` に変えると Vercel がキャッシュし、さくらへの問い合わせ回数を削減できる。

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.37-session38-ssr-perf` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 39 候補タスク

### 優先1: 残りページの UI 改修継続

| ページ | 改善ポイント |
|---|---|
| `/dashboard` | カード・セクション・タブのデザイン精査 |
| `/likes` | トピック一覧・カード表示の統一 |
| `/history` | 日付グループ・カード表示の統一 |
| `/notifications` | 通知アイテムのデザイン精査 |
| `/categories/[id]` | カテゴリ別トピック一覧のUI統一 |

### 優先2: Cookie認証導入（大きなタスク）

`/analyses/[id]` SSR化・`/dashboard` 等のSSR化には httpOnly Cookie 認証が前提。
影響範囲が大きいため、UI改修が一段落してから着手するのが現実的。

**着手時の影響ファイル:**
- `context/AuthContext.tsx` — localStorage → Cookie に移行
- `lib/auth.ts` — `getToken` / `getAuthHeaders` の Cookie 対応
- `app/api/` 配下の Route Handler — Cookie転送
- 全 Server Component — `getAuthHeaders()` でCookieヘッダー転送

---

## 起動手順

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # Running ならOK
# 起動していない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js
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

1. **豪華要素ルール**: `.claude/skills/design-spec.md` の「豪華要素ルール」セクション参照・数値を変えない
2. **Blade 参照ルール**: UIデザインのみ変更 → 不要 / 機能追加・移植 → 必ず先に Blade を読む
3. **テキストカラー**: `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
4. **boolean変換**: LaravelのAPIは `0/1` で返す → JSXで必ず `!!` 変換
5. **一度に編集するファイルは5ファイル以内**
6. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
7. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
8. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
9. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
10. **hydration error**: `rm -rf .next && npm run dev` で解消
11. **未コミット変更がある状態で `git restore` しない**（`git stash` を使う）
12. **ロジックツリーのコネクタ線 `+Npx` は `space-y-N`（px値）と一致させること**
13. **ダッシュボードタブ戻り**: `window.location.href` でフルナビゲーション（`router.push` はキャッシュで `useEffect` 再実行されない）
14. **Vercel リージョン**: `vercel.json` で `regions: ["hnd1"]`（東京）設定済み
15. **SSRフェッチ**: 公開API（トピック/カテゴリ）は `revalidate:30` or `revalidate:3600`。認証必須APIは CSR のまま
