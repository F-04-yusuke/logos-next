# LOGOSプロジェクト 引継ぎプロンプト（Session 50）

作成: 2026-04-02 / Session 49 完了時点

---

## Session 49 完了内容

### ① design-spec.md 全面再整理
- 最終デザインシステム（Session 43-47確立）をすべて収録
- セマンティックカラー変数テーブル、gradient pill、アンダーラインタブ、select+chevron等をコード付きで定義
- 没デザイン9件を「変遷記録」として追記（カテゴリタブ変遷・セグメントコントロール→アンダーライン・AppLogo 3D-L→Λ等）

### ② progress-phase4 を5ファイルに分割
- `progress-phase4.md` → overview/index に置き換え（全48Session一覧）
- `progress-phase4-s20-s31.md` / `progress-phase4-s32-s41.md` / `progress-phase4-s42-s48.md` 新規作成
- **Session 42-44 の内容はもともと progress-phase4.md に未記録だったため handoff-archive から取り込んで保存**

### ③ handoff-archive 全削除（41ファイル）
- Sessions 6-11: Session 11 で progress-phase3.md 等に統合済みと確認
- Sessions 12-48: progress-phase4-s*.md に統合済み

### ④ フェーズ計画更新・ドキュメント整理
- `progress-roadmap.md`: Phase 4 完了・Phase 5 定義を詳細化（技術的負債・集客・スケール）
- `logos-laravel/roadmap.md`: 重複排除・logos-nextへの参照に絞りシンプル化
- `security.md`: UI/UXトンマナ（14ルール）を削除 → `design-spec.md` への参照1行に置き換え
- `CLAUDE.md`（両リポジトリ）: 必読ファイルに `design-spec.md` を追加

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.85-session49-before-phase5-prep` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 50 最優先タスク（Phase 5 開始）

### Phase 5 着手順序

ユーザー方針: **まず技術的負債（httpOnly Cookie + 表示速度最適化）から着手**

#### タスク1: httpOnly Cookie 化（最優先・大型作業）

**現状:** localStorage にトークンを保存（Phase 2 暫定実装）

**実装方針（決定済み）:**
- Vercel（Next.js）とさくら（Laravel）がドメインをまたぐため、同一ドメイン化が必要
- **オプションA**: Next.js の Route Handler 経由でLaravel APIをプロキシ（Vercelドメイン統一）
- **オプションB**: さくら側にカスタムドメインを設定してCookieをクロスサイトで共有
- **推奨**: オプションAの方が確実。`/app/api/proxy/[...path]/route.ts` で全APIをプロキシ化
  - Cookieは Vercelドメインに設定（`HttpOnly; Secure; SameSite=Strict`）
  - LocalStorage のトークンを段階的に廃止

**影響ファイル:**
- `context/AuthContext.tsx`（localStorage 操作を全廃）
- `lib/api.ts` or 各fetch箇所（Authorization header → Cookie に変更）
- `app/api/proxy/` 以下（新規 Route Handler群）
- `app/login/page.tsx`・`app/register/page.tsx`（レスポンスのトークン保存廃止）

**着手前に必ず確認:**
- `~/logos-laravel/.claude/skills/infra.md`（さくらサーバー設定）
- `~/logos-laravel/.claude/skills/features.md`（認証フロー）
- `~/logos-laravel/.claude/skills/security.md`

#### タスク2: 表示速度最適化

**1. アバター自動リサイズ（Laravel側）**
- ライブラリ: `intervention/image`（Laravel向け）
- `ProfileApiController::update()` の avatar 保存処理に追加
- 最大 400×400px・JPEG 85% 圧縮

**2. 不要なコードの削減（Next.js側）**
- `npx @next/bundle-analyzer` でバンドルサイズ確認
- 使われていない import・dead code の検出

**3. 画像最適化**
- `<img>` タグ → Next.js の `<Image>` コンポーネントへの移行確認

---

## Phase 5 技術的負債 全リスト

| 優先度 | 項目 | 出典 |
|---|---|---|
| 最優先 | httpOnly Cookie 化 | Phase 2 持越し |
| 最優先 | アバター自動リサイズ（intervention/image） | Phase 4 Session 40 |
| 最優先 | 表示速度最適化（画像圧縮・コード削減） | Phase 4 計画持越し |
| 高 | AnalysisCard 抜本的改革（共通コンポーネント化） | Phase 4 Session 48 |
| 高 | SEO対策（h1/h2整備・OGP設定） | Phase 4 計画持越し |
| 高 | LP作成（welcome.blade.php 未実装） | Phase 4 計画持越し |
| 中 | Stripe Webhook 受け口のみ実装 | Phase 4 計画持越し |
| 中 | パスワードリセット機能 | Phase 2 持越し |
| 中 | /analyses/[id] SSR化（Cookie認証後） | Phase 3 F-1 残タスク |
| 中 | /categories/[id] SSR化（Cookie認証後） | Phase 4 Session 23 |
| 低 | メール認証（MustVerifyEmail 有効化） | Phase 2 持越し |
| 低 | KPI設定（計測基盤） | Phase 4 計画持越し |

---

## ライブラリ導入検討（Phase 5）

### Sonner（トーストライブラリ）

**現状:** 分析ツール3本に自作インページトースト（`fixed top-4 right-4`、Session 27実装）

**導入メリット:**
- shadcn/ui 標準推奨・スタック表示・progress bar・位置設定対応
- 自作実装（約20行×3ファイル）をゼロにできる
- より洗練されたUX

**推奨:** Phase 5 で導入。httpOnly Cookie 化・表示速度最適化の後に対応。

**導入箇所:**
- `app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`（現在の自作トーストを置き換え）
- 将来: カテゴリ管理・プロフィール更新等のフィードバックにも活用

### React Hook Form + Zod

**現状:** 全フォームが `useState` + 手動バリデーション

**主要対象フォーム:**
- ログイン（`app/login/page.tsx`）
- 登録（`app/register/page.tsx`）
- トピック作成・編集（`app/topics/create/page.tsx`・`app/topics/[id]/edit/page.tsx`）
- プロフィール編集（`app/profile/page.tsx`）

**導入メリット:**
- バリデーション一元管理（Zod スキーマ）・型安全
- 非制御コンポーネントによるパフォーマンス向上（入力のたびに再レンダリングしない）
- エラーメッセージの一貫したUX
- Laravel の FormRequest バリデーションとの対応関係が明確になる

**推奨:** Phase 5 導入推奨。httpOnly Cookie 化（ログイン・登録フォームの再設計）と同タイミングが効率的。

**インストール:**
```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## design-spec.md と security.md の整理（Session 49 確立ルール）

### 引継ぎ時のデザイン参照ルール（**改訂版**）

| 状況 | 参照先 |
|---|---|
| UIデザイン変更・新規コンポーネント作成 | `.claude/skills/design-spec.md`（必読） |
| 機能追加・ロジック変更 | `~/logos-laravel/.claude/skills/features.md`（必読） |
| セキュリティ・コーディングルール | `~/logos-laravel/.claude/skills/security.md` |

**⚠️ security.md の UI/UXトンマナは Session 49 で削除済み。**
design-spec.md が唯一のデザイン仕様書。

---

## 起動手順

```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d
cd ~/logos-next && npm run dev
# → http://localhost:3000

# hydration error が出た場合
rm -rf .next && npm run dev
```

## 検証コマンド

```bash
cd ~/logos-next && npx tsc --noEmit
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
