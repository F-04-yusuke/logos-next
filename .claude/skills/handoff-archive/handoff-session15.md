# LOGOSプロジェクト 引継ぎプロンプト（Session 15）

作成: 2026-03-23 / Session 14 完了時点（Phase 4 UI/UX改善 Session 3）

---

## 前回セッション（Session 14）の完了内容

### トピックページ UI/UX 改善 Batch 2〜4 + アライメント調整

参考: https://coliss.com/articles/build-websites/operation/work/logic-driven-ui-design-tips.html
採用済み全項目: 1, 2, 4, 6, 7, 8, 9, 10, 11, 12（Session 12〜14 で完了）

| バッチ | 採用項目 | 内容 | 状態 |
|---|---|---|---|
| Batch 1 | 10, 7 | カードbg同化・全ボタンYouTubeライクホバー・Tooltip | ✅ 完了（Session 13） |
| Batch 2 | 8, 12, 11 | アライメント統一・radius一貫性・フォントウェイト整理 | ✅ 完了（Session 14） |
| Batch 3 | 6, 9, 2 | 大見出し字間・小テキストコントラスト・UIコントラスト | ✅ 完了（Session 14） |
| Batch 4 | 4, 1 | タップターゲット・8ptスペーシング | ✅ 完了（Session 14） |

#### 主な変更内容

**Batch 2（PostCard.tsx）:**
- 右列 `justify-between` 追加（いいねボタン常に下部固定）
- タイトル `font-bold` → `font-semibold`、ユーザー名 `font-bold` → `font-medium`
- 補足投稿ボタン `rounded` → `rounded-md`

**Batch 4（PostCard.tsx, TopicPageClient.tsx）:**
- カードpadding `pl-3 pr-5`非対称 → `p-4` 統一（後でpl-0に再調整）
- 列間 `gap-3` → `gap-4`
- コメント欄 `min-h-[4.5rem]` 削除（強制余白解消）
- 続きを読む/閉じる `py-0.5` → `py-1.5`
- カードリスト `space-y-3` → `space-y-4`

**Batch 3（PostCard.tsx, TopicPageClient.tsx）:**
- h2 タイトルに `tracking-tight`
- timeAgo・補足ラベルに `dark:text-gray-400`（コントラスト 4.2→7.2:1）
- 区切り `dark:text-gray-700` → `dark:text-gray-500`（UIコントラスト改善）

**アライメント調整（PostCard.tsx, TopicPageClient.tsx）:**
- タイトル `mb-2` → `mb-3`、概要 `mb-3` → `mb-5`（時系列との間隔拡大）
- カード `pl-4` → `pl-0`（サムネ左端をタイトル・タブバーと同じ基準軸に統一）
- 補足セクションも `pl-0` に統一

#### アライメント設計方針（Session 14 で確立）
- PostCard の左パディングを撤廃し、**サムネイル左端 = タイトル = タブバー** が同一の垂直軸に揃う
- ホバー背景はカード全幅に広がる（アライメントを崩さない）
- 「枠がない状態での初見の印象」を優先する設計思想

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.3-session14-ui-spacing-alignment | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 15 の作業内容

### 優先①：トピックページ ホバー強化

現状の不足箇所：

| 要素 | 現状 | 対応方針 |
|---|---|---|
| 並び替えselect（情報タブ・コメントタブ） | ホバーなし | `cursor-pointer` + select要素のスタイル強化 |
| 時系列エリア（AI自動生成・AI更新ボタン） | `rounded` のみ | ホバー背景・`cursor-pointer` 確認 |
| ユーザーアイコン + ユーザー名 | `cursor-default` | `cursor-pointer` 追加（プロフィールページへの将来リンクを見越して） |
| タイムラインの「もっと見る/閉じる」ボタン | スタイルあるが確認要 | ホバー状態の視覚フィードバック確認 |

### 優先②：コメントタブ テストデータ充実 → UI/UX 改善

**手順:**
1. tinker でコメントタブに内容の濃いテストデータを投入
   - 親コメント複数（異なるユーザー）
   - 補足（自コメントへの返信）あり
   - 他ユーザーへの返信あり
   - いいね数にバラつきをつける
2. ブラウザでコメントタブの現状UIを確認
3. 改善点を洗い出して実装

**tinker コマンド例:**
```bash
docker exec logos-laravel-laravel.test-1 php artisan tinker --execute="
// テストコメントの投入例
\App\Models\Comment::create([
  'topic_id' => TOPIC_ID,
  'user_id' => USER_ID,
  'body' => 'コメント内容',
  'parent_id' => null,
]);
"
```

---

## 全フェーズ完了状況

| フェーズ | 内容 | 状態 |
|---|---|---|
| Phase 1 | Laravel Blade版MVP磨き込み | ✅ 完了（2026-03-19） |
| Phase 2 | Next.js移行（全17ページ・Step1〜14） | ✅ 完了（2026-03-22） |
| Phase 3 | 技術改善（B-1〜B-6 / F-1〜F-7） | ✅ 完了（2026-03-23） |
| Phase 4 | 集客・マーケティング基盤 | 🔄 進行中（Session 12〜） |
| Phase 5 | スケールとマネタイズ | 🔲 未着手 |

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 15**: ホバー強化 + コメントタブ テストデータ充実 + UI/UX改善
- 分析タブ UI/UX 改善
- トップページ（トピック一覧）UI/UX 改善
- その他全ページ

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

# コンテナ名確認（docker-compose命名規則で変わる場合あり）
docker ps | grep logos-laravel
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
6. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
