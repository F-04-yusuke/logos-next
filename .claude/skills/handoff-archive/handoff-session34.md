# LOGOSプロジェクト 引継ぎプロンプト（Session 34）

作成: 2026-03-25 / Session 33 完了時点

---

## Session 33 完了内容

### テキストサイズ ワンサイズアップ（全残ページ対応）

Session 30 で対応済みのページ以外、残りの全ページのテキストサイズをトピックページ基準に引き上げた。

**対応済みページ:**

| ページ | ファイル | 主な変更 |
|---|---|---|
| 閲覧履歴 | `app/history/page.tsx` | h1 → text-2xl、リスト本文 → text-lg |
| 通知 | `app/notifications/page.tsx` | h1 → text-2xl、通知本文 → text-base |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | h1 → text-2xl、中分類リンク → text-lg |
| カテゴリ別トピック一覧 | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | h1 → text-2xl、本文 → text-base |
| トピック作成 | `app/topics/create/page.tsx` | h2 → text-2xl、ラベル/input/textarea → text-lg |
| トピック編集 | `app/topics/[id]/edit/page.tsx` | 同上 |
| ダッシュボード | `app/dashboard/page.tsx` | h1 → text-2xl、タブ → text-lg |
| 参考になった | `app/likes/page.tsx` | h1 → text-2xl、タブ → text-lg |
| 分析スタンドアロン | `app/analyses/[id]/page.tsx` | h2 → text-2xl、各テキスト1段階アップ |
| 分析ツール（ロジックツリー） | `app/tools/tree/page.tsx` | h1 → text-2xl、本文/ボタン → text-base |
| 分析ツール（総合評価表） | `app/tools/matrix/page.tsx` | h1 → text-2xl、本文/ボタン → text-base |
| 分析ツール（SWOT/PEST） | `app/tools/swot/page.tsx` | h1 → text-2xl、本文/ボタン → text-base |
| PostModal | `app/topics/[id]/_components/PostModal.tsx` | タイトル → text-xl、ラベル → text-base |
| AnalysisModal | `app/topics/[id]/_components/AnalysisModal.tsx` | タイトル → text-xl、タブ → text-base |

### ルール更新
- `design-spec.md` に「ページレベルのテキストサイズ目標（Session 33 確定ルール）」セクションを追加

**Gitタグ:** `v6.17-session32-dashboard-refactor` → （Session 33 タグ未付与）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.17-session32-dashboard-refactor` | 未コミットあり |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 34 最優先タスク

### テキストサイズアップ 未対応ページ

Session 33 で手が回らなかったページ（handoff-session33.md のリストに入っていたが未着手）:

| ページ | ファイル | メモ |
|---|---|---|
| プロフィール | `app/profile/page.tsx` | フォーム・入力欄多め |
| カテゴリ管理(admin) | `app/categories/page.tsx` | CRUD UI |
| ログイン | `app/login/page.tsx` | 小さい |
| 登録 | `app/register/page.tsx` | 小さい |

### Session 33 コミット・タグ付与

Session 33 の変更がまだ未コミットの場合は先にコミット・タグ付与:

```bash
cd ~/logos-next
git add -p  # または git add app/tools/ app/.claude/
git commit -m "feat: テキストサイズ ワンサイズアップ（分析ツール3本・design-spec更新）"
git tag v6.18-session33-text-size-up
git push origin main --tags
```

---

## テキストサイズアップ作業ルール（Session 33 確定版）

`design-spec.md` の「ページレベルのテキストサイズ目標」セクション参照。

**要点:**
- **最初から目標サイズに直接変換する（2段階に分けない）**
- h1/h2 → `text-2xl`
- タブ → `text-lg`
- メイン本文・ラベル・input/textarea → `text-lg`
- 説明文・注記 → `text-base`
- カードコンポーネント（PostCard / CommentCard / AnalysisCard）は**触らない**

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
