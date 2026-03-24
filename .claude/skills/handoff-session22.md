# LOGOSプロジェクト 引継ぎプロンプト（Session 22）

作成: 2026-03-24 / Session 21 完了時点（Phase 4 UI/UX改善 Session 10）

---

## 前回セッション（Session 21）の完了内容

### マイページ群 UI/UX 統一（5ページ）

トピックページ基準（`design-spec.md`）に従い以下5ページを改修。

| ページ | タグ | 主な変更 |
|---|---|---|
| ダッシュボード | `v5.2-session21-dashboard` | 外枠ボックス除去・カードフラット化・ホバー・-ml-3アライメント・コメント15px・タブcursor-pointer |
| 参考になった | `v5.3-session21-likes` | 同上 |
| 閲覧履歴 | `v5.4-session21-history` | 同上 |
| 通知 | `v5.5-session21-notifications` | 外枠除去・ホバー統一・TypeBadge border色修正 |
| トピック作成 | `v5.6-session21-topic-create` | 外枠除去・cursor-pointer |

### PostCard をトピックページ基準に構造統一（`v5.7-session21-postcard-align`）

ダッシュボード・参考になったの PostCard（各ページ内インライン定義）を `app/topics/[id]/_components/PostCard.tsx` と同一の visual 構造に揃えた。

| 修正項目 | 内容 |
|---|---|
| 左列幅 | `md:w-1/4` → `md:w-[30%]` |
| 右列幅 | `md:w-3/4` → `md:w-[70%]` |
| 最小高さ | `min-h-[170px]` 追加 |
| YouTube/X ロゴ | URL から自動判定してロゴ表示（トピックページと同一 SVG） |
| コメントテキスト | `text-[13px]` → `text-[15px]` |
| 続きを読む | `line-clamp-3` + truncate 検知で展開ボタン表示 |
| 補足 | インライン青ボックス → 📎補足あり▼ トグル（トピックページ準拠） |
| 分析タブ 編集ボタン | `!analysis.is_published` 条件付きで表示（**公開済み分析は編集ボタン非表示**） |

**注意**: PostCard は現在も dashboard/likes 各ページ内にインライン定義。真の共通コンポーネント化は将来タスク（型定義の共通化・`is_liked_by_me` オプショナル化が必要）。

### Blade 参照ルールの更新

- **UIデザインのみの変更（色・ホバー・ボーダー等）**: Blade 参照は不要
- **機能追加・ロジック変更・新規移植時**: 従来通り Blade 必読
- `CLAUDE.md` および memory に反映済み

### テストデータ追加（admin ユーザー id=2）

| データ | 追加後 |
|---|---|
| 下書き | 3件（記事・YouTube・X） |
| 分析 | 4件（tree×2・matrix・swot）|
| 投稿いいね | 4件 |
| コメントいいね | 5件 |
| 閲覧履歴 | 4件（今日・昨日・2日前・1週間前） |
| 通知 | 12件（new_post・comment_reply タイプ追加・未読10/既読2） |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v5.7-session21-postcard-align | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 22 の作業内容

### 優先①：トップページ（トピック一覧）UI/UX 改善

`app/page.tsx` と関連コンポーネントを `design-spec.md` のトピックページ UI ルールに従って改修。

**改修ポイント候補:**
- トピックカードのホバー・背景をトピックページ基準に統一
- 外枠ボックス除去（border・shadow-sm削除）
- フォントウェイト・テキストサイズ統一
- セレクト・ボタンスタイルの統一
- cursor-pointer の付与

### 優先②：プロフィールページ UI/UX 改善

`app/profile/page.tsx` をトピックページ基準に統一。

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 22**: トップページ UI/UX 改善
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
10. **PostCard はダッシュボード・参考になったページ内にインライン定義**（`app/topics/[id]/_components/PostCard.tsx` は直接使えない・型が異なる）
