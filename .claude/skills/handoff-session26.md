# LOGOSプロジェクト 引継ぎプロンプト（Session 26）

作成: 2026-03-24 / Session 25 完了時点（Phase 4 UI/UX改善 Session 14）

---

## 前回セッション（Session 25）の完了内容

### 残ページの豪華化（design-spec.md「豪華要素ルール」に準拠）

| ページ | ファイル | 主な変更 |
|---|---|---|
| ダッシュボード | `app/dashboard/page.tsx` | スケルトン・indigoタブ・ページヘッダー・セクション件数表示 |
| 参考になった | `app/likes/page.tsx` | スケルトン・indigoタブ・ページヘッダー |
| 閲覧履歴 | `app/history/page.tsx` | スケルトン・ページヘッダー・indigo カテゴリバッジ・日付見出しアクセントバー |
| 通知 | `app/notifications/page.tsx` | スケルトン・ページヘッダーアクセントバー化 |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | スケルトン・ページヘッダー・ホバー白もや・indigo hover統一 |
| カテゴリ管理(admin) | `app/categories/page.tsx` | スケルトン・ページヘッダー・セクション見出しアクセントバー |
| カテゴリ別トピック一覧 | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | h1アクセントバー・duration-100統一 |
| プロフィール | `app/profile/page.tsx` | スケルトン・ページヘッダー・セクション見出しアクセントバー |

**共通適用事項（全ページ）:**
- ローディング: テキスト「読み込み中...」→ `animate-pulse` スケルトン
- ページタイトル: `pl-3 border-l-4 border-indigo-500`
- セクション見出し: `pl-2 border-l-2 border-gray-700`
- タブアクティブ: `border-indigo-500 text-white font-bold`（分析・下書きは `border-yellow-500` 維持）
- `transition-colors duration-100` / `hover:bg-white/[0.04]` 統一

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新コミット | 状態 |
|---|---|---|---|
| ~/logos-next | main | Session 25 豪華化コミット | クリーン |
| ~/logos-laravel | main | v4.2-session24-bookmarks-category-char | クリーン |

---

## Session 26 の作業内容

### 最優先：残ページの豪華化（継続）

**着手前に `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず読むこと。**

#### ① ログイン画面（優先度高）
`app/login/page.tsx` をトピックページ基準に統一。
- UIデザインのみの変更 → Blade参照は不要

#### ② 登録画面（優先度高）
`app/register/page.tsx` をトピックページ基準に統一。
- UIデザインのみの変更 → Blade参照は不要

#### ③ トピック作成画面（優先度高）
`app/topics/create/page.tsx` をトピックページ基準に統一。
- 機能変更なし → UIデザインのみ

#### ④ トピック編集画面（優先度高）
`app/topics/[id]/edit/page.tsx` をトピックページ基準に統一。
- 機能変更なし → UIデザインのみ

#### ⑤ 分析ツール（優先度中・確実に次セッション以降）
`app/tools/tree/page.tsx`・`app/tools/matrix/page.tsx`・`app/tools/swot/page.tsx`

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善（豪華化）
- ログイン・登録画面豪華化
- トピック作成・編集画面豪華化
- 分析ツールページ豪華化（tree/matrix/swot）
- /categories/[id] SSR カテゴリ名解決（技術的負債解消）

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）・h1/h2 タグ整理
- **Stripe Webhook受け口**: 受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化
- **/analyses/[id] SSR化**: Cookie認証導入後に対応
- **パスワードリセット機能**: SMTP設定と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等
- **SNSログイン**: Laravel Socialite（Google / X）
- **インフラ移行**: さくら → AWS（将来）

---

## 起動手順

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # logos-laravel-laravel.test-1 が Running ならOK
# 起動していない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js
cd ~/logos-next && npm run dev
# → http://localhost:3000
```

## 検証コマンド

```bash
# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Next.js ビルド確認
cd ~/logos-next && npm run build

# hydration error が出た場合（必ず試す）
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **豪華要素ルール**: `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず参照・数値を変えない
2. **Blade 参照ルール**: UIデザインのみ変更 → 参照不要 / 機能追加・移植 → 必ず先に Blade を読む
3. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
4. **トピックページが UI 基準**: 他ページ改修時は必ずここに準拠
5. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
6. **一度に編集するファイルは5ファイル以内**
7. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
8. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
9. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
10. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
