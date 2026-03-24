# LOGOSプロジェクト 引継ぎプロンプト（Session 23）

作成: 2026-03-24 / Session 22 完了時点（Phase 4 UI/UX改善 Session 11）

---

## 前回セッション（Session 22）の完了内容

### マイページ共通コンポーネント化

`components/mypage/` に PostCard・CommentCard・AnalysisCard を共通コンポーネントとして抽出。
dashboard/likes 両ページから共有。

| ファイル | 型 | 主な機能 |
|---|---|---|
| `components/mypage/PostCard.tsx` | `SharedPost` | isDraft対応・YouTube/Xロゴ・補足トグル・続きを読む |
| `components/mypage/CommentCard.tsx` | `SharedComment`・`SharedReply` | 返信折りたたみトグル（トピックページ準拠） |
| `components/mypage/AnalysisCard.tsx` | `SharedAnalysis` | タイプ別カラーボーダー・公開/非公開バッジ・閲覧リンク |

**注意:** PostCard は現在も dashboard/likes 各ページが `SharedPost` 型経由で使用。`app/topics/[id]/_components/PostCard.tsx` は別型（TopicPost）のため直接流用不可。

`lib/utils.ts` に `timeAgo` を共通化。

### タブアライメント修正

dashboard/likes のタブコンテナに `px-4 sm:px-6` 追加。
カードの左端（`-ml-3 pl-3` のコンテンツ領域）とタブの左端が揃った。

### analyses/[id] スコア計算バグ修正

総合評価表の ◎〇△× バッジ消失・合計スコア文字列結合バグを修正。
原因: API が `score` を文字列で返すのに数値前提で処理していた（Blade 移植時の見落とし）。
修正: `Number(e.score)` 変換を追加。型定義も `score?: number | string` に修正。

### さくらサーバー: user2 作成

user2 / user2@test.com / password / is_pro=1（Sakura 本番）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v5.8-session22-mypage-components | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 23 の作業内容

### 優先①：トップページ（トピック一覧）UI/UX 改善

`app/page.tsx` および `app/_components/HomeClient.tsx` を `design-spec.md` のトピックページ UI ルールに従って改修。

**改修ポイント候補:**
- トピックカードのホバー・背景をトピックページ基準に統一
- 外枠ボックス除去（border・shadow-sm削除）
- フォントウェイト・テキストサイズ統一
- セレクト・ボタンスタイルの統一
- cursor-pointer の付与

**注意:** ホームページ・カテゴリ一覧の背景色はヘッダーに合わせる必要なし（現状満足済み）

### 優先②：プロフィールページ UI/UX 改善

`app/profile/page.tsx` をトピックページ基準に統一。

### 優先③：カテゴリページ UI/UX 改善

`app/categories/page.tsx` をトピックページ基準に統一。

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 23**: トップページ UI/UX 改善
- プロフィールページ UI/UX 改善
- カテゴリページ UI/UX 改善

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

1. **Blade 参照ルール（Session 21 更新）:**
   - UIデザインのみ変更（色・ホバー・ボーダー等）→ Blade 参照不要
   - 機能追加・ロジック変更・新規移植 → 必ず Blade を先に読む
2. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
3. **トピックページが UI 基準**: 他ページ改修時は `design-spec.md` の「トピックページ UI ルール」セクションに準拠
4. **ホームページ・カテゴリ一覧の背景色はヘッダーに合わせる必要なし**（現状満足済み）
5. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
6. **一度に編集するファイルは5ファイル以内**
7. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
8. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
9. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
10. **PostCard はダッシュボード・参考になったページが `SharedPost` 型で共通コンポーネントを使用**（`app/topics/[id]/_components/PostCard.tsx` は別型・直接使用不可）
11. **score フィールドは文字列で来る場合がある** → `Number(e.score)` で変換すること（analyses/[id] で修正済み・他の分析表示箇所も注意）
