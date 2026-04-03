# LOGOSプロジェクト 引継ぎプロンプト（Session 53）

作成: 2026-04-03 / Session 52 完了時点

---

## Session 52 完了内容

### アバター表示バグ完全修正（Step 2 追加修正）

Session 51 で導入した `<Image>` 移行により、アバターが全コンポーネントで表示されなくなっていた。
根本原因2件を特定・修正した。

#### 根本原因①: `imageSizes` 未登録（`/_next/image` が 400）

アバター実寸（28/36/40px）が Next.js のデフォルト `imageSizes` に含まれておらず、
`/_next/image?w=36` が "w parameter (width) of 36 is not allowed" で 400 を返していた。

**修正:** `next.config.ts` の `imageSizes` に 28/36/40px を追加。

#### 根本原因②: 開発環境での private IP ブロック（SSRF 防御）

Next.js の `<Image>` 最適化は `localhost` → `127.0.0.1`（プライベートIP）を SSRF 防御でブロックする。
開発環境では全アバター・サムネイルが表示不可だった。

**修正:** `next.config.ts` に `unoptimized: process.env.NODE_ENV !== "production"` を追加。
本番（Vercel）は公開ドメインのため最適化を維持。

#### その他修正

| 内容 | ファイル |
|---|---|
| `<Image fill>` → 明示サイズ（28/32/36/40px）| UserAvatar / UserMenu Avatar / notifications / AnalysisCard |
| `Avatar` コンポーネントの `sizePx` prop 廃止・`TAILWIND_SIZE_PX` マップで自動導出 | UserMenu.tsx |
| `AuthContext` に `updateUser` 追加・`fetchUser` に `cache:no-store` | AuthContext.tsx |
| プロフィール保存後の即時反映（単一 `updateUser` + `globalMutate` でトピック再検証）| profile/page.tsx |

**Git タグ（Session 52）:** `v7.02` 〜 `v7.07-session52-after-avatar-cleanup`

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v7.07-session52-after-avatar-cleanup` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | 変更なし |

---

## Session 53 タスク（優先順）

### 1. Phase 5 Step 3: SSR 化

httpOnly Cookie 認証により Server Component からも認証済み API リクエストが可能。

**① /analyses/[id] SSR 化**
- 現状: CSR（`useEffect` + `fetch("/api/proxy/analyses/[id]")`）
- 目標: Server Component で `cookies().get("logos_token")` → Laravel 直接 fetch
- Blade 参照: `~/logos-laravel/resources/views/analyses/show.blade.php`

**② /categories/[id] SSR 化**
- 現状: SSR 初期トピック + CSR カテゴリ名解決（Session 23 技術的負債）
- 目標: Server Component でカテゴリ名・トピック両方を fetch
- Blade 参照: `~/logos-laravel/resources/views/categories/show.blade.php`

### 2. Phase 5 Step 4 候補

| 優先度 | 項目 |
|---|---|
| 高 | アバター自動リサイズ（Laravel側・intervention/image） |
| 高 | SEO対策（h1/h2整備・OGP設定） |
| 高 | LP作成（welcome.blade.php ベース） |
| 中 | AnalysisCard 抜本的改革（notifications/AnalysisCard のアバターロジック共通化含む） |
| 中 | Stripe Webhook 受け口実装 |
| 中 | パスワードリセット |
| 低 | メール認証 |
| 低 | KPI設定 |

---

## 技術的負債 全リスト（Session 52 時点）

| 優先度 | 項目 | ステータス |
|---|---|---|
| ✅ 完了 | httpOnly Cookie 化 | Session 50 |
| ✅ 完了 | React Hook Form + Zod（login/register） | Session 50 |
| ✅ 完了 | Dead code 削除（旧 Route Handler・lib/auth・lib/proxy-fetch） | Session 51 |
| ✅ 完了 | Sonner 導入（3ツールページ） | Session 51 |
| ✅ 完了 | next/image 移行（6ファイル）| Session 51 |
| ✅ 完了 | アバター `fill` → 明示サイズ・imageSizes 追加・unoptimized:isDev | Session 52 |
| ✅ 完了 | アバター不一致修正（updateUser・cache:no-store・globalMutate） | Session 52 |
| 高 | アバター自動リサイズ（Laravel 側・intervention/image） | 未着手 |
| 高 | /analyses/[id] SSR 化 | 未着手 |
| 高 | /categories/[id] SSR 化 | 未着手 |
| 高 | SEO対策 | 未着手 |
| 高 | LP作成 | 未着手 |
| 中 | AnalysisCard 抜本的改革（アバターロジック共通化含む） | 未着手 |
| 中 | Stripe Webhook | 未着手 |
| 中 | パスワードリセット | 未着手 |
| 低 | メール認証 | 未着手 |
| 低 | KPI設定 | 未着手 |

### 既知の残存技術的負債（対応不要・記録のみ）

- `profile/page.tsx` の `useEffect` 依存配列に `user` が含まれる → プロフィール保存後に不要な再フェッチが発生するが機能的に問題なし
- `notifications/page.tsx`・`AnalysisCard.tsx` のアバター表示ロジックが `UserAvatar` と重複 → AnalysisCard 抜本改革時に合わせて解消

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
10. **実装前に curl で API 疎通確認**: コード修正前に `curl` で実際のレスポンスを確認する（今セッションの教訓）
