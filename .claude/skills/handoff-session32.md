# LOGOSプロジェクト 引継ぎプロンプト（Session 32）

作成: 2026-03-25 / Session 31 完了時点（Phase 4 UI/UX改善 Session 20）

---

## Session 31 完了内容

### PostCard・CommentCard 真の共通コンポーネント化

| 対象 | 変更内容 |
|---|---|
| PostCard | topics版をベースに `isDraft` / `onLike?` / `onDelete?` / `onSupplement?` を optional 化。mypage版を re-export に差し替え。 |
| CommentCard | 全アクション props を optional 化。mypage版を re-export に差し替え。 |
| AnalysisCard | **保留（次フェーズ対応予定）** |
| dashboard API | posts/drafts/comments に `is_liked_by_me` を追加 |
| likes API | likedPosts/likedComments に `is_liked_by_me=true`・avatar・replies を追加 |
| ダッシュボード（投稿タブ） | いいね・削除・補足追加が使えるようになった |
| ダッシュボード（コメントタブ） | いいね・削除・補足返信・返信削除が使えるようになった |
| 参考になった（情報タブ） | いいねが使えるようになった |
| 参考になった（コメントタブ） | いいねが使えるようになった |

**技術的負債解消:**
- PostCard 2系統 → ✅ 解消（topics版1本）
- CommentCard 2系統 → ✅ 解消（topics版1本）
- AnalysisCard 2系統 → 🔴 保留

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.15-session31-card-unification` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 32 最優先タスク

### 残りの全ページ テキストサイズ ワンサイズアップ

**背景:** Session 30 でトピックページ・ホームページ・ダッシュボード・サイドバーのテキストをワンサイズアップした。カード内テキストは Session 31 の共通コンポーネント化で自動解決。残りのページはまだ対応していない。

**対象ページ（優先度順）:**

| ページ | ファイル | 作業量 |
|---|---|---|
| 閲覧履歴 | `app/history/page.tsx` | 小 |
| 通知 | `app/notifications/page.tsx` | 小 |
| プロフィール | `app/profile/page.tsx` | 小〜中 |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | 小 |
| カテゴリ管理(admin) | `app/categories/page.tsx` | 小〜中 |
| カテゴリ別トピック一覧 | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | 小 |
| ログイン | `app/login/page.tsx` | 小 |
| 登録 | `app/register/page.tsx` | 小 |
| トピック作成 | `app/topics/create/page.tsx` | 小〜中 |
| トピック編集 | `app/topics/[id]/edit/page.tsx` | 小〜中 |
| 分析スタンドアロン | `app/analyses/[id]/page.tsx` | 中 |
| 分析ツール3本 | `app/tools/tree` / `matrix` / `swot` | 中 |

**作業ルール（Session 30 準拠）:**
- `text-[11px]` → `text-xs`、`text-[13px]` → `text-sm`、`text-[15px]` → `text-base`
- `text-xs` → `text-sm`、`text-sm` → `text-base`、`text-base` → `text-lg`
- ページ内の主要本文テキストを対象とする
- 一度に5ファイル以内の制限を守り、ページ単位で確認しながら進める

### AnalysisCard 真の共通コンポーネント化（保留）

Session 31 で PostCard・CommentCard を共通化したが、AnalysisCard は型の差異が大きいため保留。
- `components/mypage/AnalysisCard.tsx` は `SharedAnalysis`（dataなし）型の独自実装のまま
- `app/topics/[id]/_components/AnalysisCard.tsx` はフル機能版（TopicAnalysis型・プレビュー付き）
- 対応する際は dashboard API の `/api/dashboard` が analyses の `data` フィールドを返すよう Laravel 側修正も必要

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
