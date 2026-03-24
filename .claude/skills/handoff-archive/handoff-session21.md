# LOGOSプロジェクト 引継ぎプロンプト（Session 21）

作成: 2026-03-24 / Session 20 完了時点（Phase 4 UI/UX改善 Session 9）

---

## 前回セッション（Session 20）の完了内容

### U-17: 分析タブ UI全面刷新

情報タブで確立した UI 思想（カード背景同化・ホバー・-ml-3 アライメント）を分析タブに完全適用。

#### 主要変更

| ファイル | 変更内容 |
|---|---|
| `AnalysisCard.tsx` | カード外枠をページ背景と同化・hover背景・-ml-3 pl-3 アライメント・補足トグル・並び替え・テーマ表示追加 |
| `TopicPageClient.tsx` | 分析投稿ボタン黄色→グレー・並び替えselect追加 |
| `useTopicPage.ts` | `analysisSort` / `sortedAnalyses` 追加 |
| `CommentCard.tsx` | コメント本文 `text-[14px]` → `text-[15px]`（情報タブと統一） |
| `app/analyses/[id]/page.tsx` | Next.js 16 params Promise エラー修正（`use(params)`） |

#### プレビューをフル表示と完全統一

- tree: カード型ノード表示（`/analyses/[id]` の TreeNodeCard と同一構造）
- matrix: 実テーブル（バッジ + reason テキスト）
- swot: `border-t-4` カラーボックス4分割

#### プレビューボックス高さ固定

- 全分析タイプ: `h-[200px]` 固定 + `overflow-hidden` + `h-8` グラデーションフェード

### トピックページ UI 基準確立

- `app/topics/[id]/` を全ページ UI デザイン基準として公式化
- ルールを `.claude/skills/design-spec.md`「トピックページ UI ルール」セクションに文書化
- `CLAUDE.md` に「トピックページが UI 基準」として明記

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v5.0-session20-analysis-ui | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 21 の作業内容

### 優先①：トップページ（トピック一覧）UI/UX 改善

`app/page.tsx` と関連コンポーネントを `design-spec.md` のトピックページ UI ルールに従って改修。

**改修ポイント候補:**
- トピックカードのホバー・背景をトピックページ基準に統一
- フォントウェイト・テキストサイズ・カラーをルール適用
- セレクト・ボタンスタイルの統一
- cursor-pointer の付与

### 優先②：ダッシュボード UI/UX 改善

`app/dashboard/page.tsx` をトピックページ基準に統一。

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 21**: トップページ UI/UX 改善
- ダッシュボード UI/UX 改善
- その他全ページ（通知・いいね・閲覧履歴・プロフィール等）

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

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
   - `.claude/skills/design-spec.md`（トピックページ UI ルールセクション）
2. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
3. **トピックページが UI 基準**: 他ページ改修時は `design-spec.md` の「トピックページ UI ルール」セクションに準拠
4. **ホームページ・カテゴリ一覧の背景色はヘッダーに合わせる必要なし**（現状満足済み）
5. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
6. **一度に編集するファイルは5ファイル以内**
7. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
8. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
9. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
