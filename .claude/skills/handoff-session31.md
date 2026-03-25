# LOGOSプロジェクト 引継ぎプロンプト（Session 31）

作成: 2026-03-25 / Session 30 完了時点（Phase 4 UI/UX改善 Session 19）

---

## Session 30 完了内容

### トピックページ UI 改善

| 修正内容 | 詳細 |
|---|---|
| ヘッダー右divはみ出し修正 | `flex-1 min-w-0` で左div幅オーバーフロー防止・右divに `min-w-[120px]` |
| ユーザー情報レイアウト変更 | アイコン+名前を日時の上に分離表示 |
| タイムライン折り返し対応 | `sm:truncate` 削除・`items-start` 統一 |
| 全テキストワンサイズアップ | TopicPageClient / PostCard / CommentCard / AnalysisCard |
| 概要テキスト: `text-lg` | topic.content のサイズ調整（xl→lg） |
| タイムライン・タブ: `text-lg` | 時系列・タブラベルをさらにアップ |
| 投稿概要・コメント本文: `text-lg` | PostCard/CommentCard の主要本文 |
| タイムライン日付列幅拡張 | `w-20 sm:w-24` → `w-24 sm:w-28`（日付折り返し防止） |
| PostCard レイアウト調整 | サムネ列 30%→35%・右列 70%→65%・縦幅 170→180px |
| 「前提となる時系列」→「時系列」 | ラベル短縮 |

### ホームページ UI 改善
- 全テキストワンサイズアップ（HomeClient.tsx）
- カスタムpxも標準スケールへ統一（`text-[11px]`→xs, `text-[13px]`→sm, `text-[15px]`→base）

### ダッシュボード・参考になった UI 改善
- ページ固有テキスト（タイトル・タブ・空メッセージ等）をワンサイズアップ
- **カードコンポーネント内テキストは未対応**（理由: 次セッションで真の共通コンポーネント化を行うため）

### サイドバー
- NavLinks のテキストをワンサイズアップ（`text-xs`→sm, `text-sm`→base）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.13-session30-topic-text-size` | クリーン（タグ以降もコミット済み） |
| ~/logos-laravel | main | `v4.3-session29-ogp-migration-fix` | クリーン |

> **注意:** Session 30 のコミットはタグ `v6.13` 以降に積まれているが、まだタグは未付与。セッション開始時に `git log --oneline -8` で確認すること。

---

## Session 31 最優先タスク

### 🔴 PostCard / CommentCard / AnalysisCard 真の共通コンポーネント化

**背景・経緯:**
- Session 22 で `components/mypage/PostCard.tsx` 等を作成し「共通化」したが、型が異なるため実質2系統が存在している
- `app/topics/[id]/_components/PostCard.tsx` … `TopicPost` 型（いいね・削除・補足フル機能）
- `components/mypage/PostCard.tsx` … `SharedPost` 型（表示のみ・アクション機能なし）
- **ユーザー要望:** ダッシュボード・参考になったページからも削除・いいね・補足ができるべき

**実装方針:**
1. `TopicPost` と `SharedPost` の型差分を調査・統合（または optional 化）
2. `app/topics/[id]/_components/PostCard.tsx` をベースに props でアクション有無を切り替え
3. `components/mypage/PostCard.tsx` を新コンポーネントで置き換え
4. `app/dashboard/page.tsx` / `app/likes/page.tsx` でハンドラ（onLike・onDelete・onSupplement）を配線
5. CommentCard・AnalysisCard も同様に対応
6. 変更後はテキストサイズ等のUIが自動的に統一される

**注意:**
- 変更ファイル数が多い（8〜10ファイル）ので、PostCard → CommentCard → AnalysisCard の順に1つずつ完結させる
- API エンドポイントは既存のものをそのまま使用（新規追加不要なはず）
- ダッシュボードの投稿削除は `DELETE /api/posts/{id}`、いいねは `POST /api/posts/{id}/like`

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

# hydration error が出た場合（必ず試す）
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
