# LOGOSプロジェクト 引継ぎプロンプト（Session 36）

作成: 2026-03-26 / Session 35 完了時点

---

## Session 35 完了内容

### トップページ カテゴリタブ UI 詳細改善

`app/_components/HomeClient.tsx` を中心に細部を詰めた。

| 改修項目 | 内容 |
|---|---|
| タイトルリンク色 | `text-[#A8C7FA]`（Gemini青）に統一 |
| 情報密度UP | 行パディング `py-[7px]` → `py-1` |
| アイコン統一 | 吹き出し絵文字 → スタックSVG・色を `text-gray-300` に明るく |
| タブコントラスト | アクティブのみ `font-bold`・非アクティブ `text-gray-300` |
| タブ横幅 | 文字数比率 + `TAB_BASE=4` で均一余白・右端まで充填 |
| 全体幅固定 | 左カラム `min-w-0`・右パネル `overflow-hidden` |
| テキストサイズ | カテゴリタブ内全要素ワンサイズアップ |
| 更新日時表示 | 各カテゴリの最新トピック `created_at` を `M/D(曜) HH:MM更新` で表示 |
| 作成者名削除 | トピック一覧カードから作成者名を除去 |

### 右パネル刷新（最多いいね投稿パネル）

| 項目 | 詳細 |
|---|---|
| 新API | `GET /api/categories/{id}/featured-post`（Laravel + Next.js proxy） |
| ロジック | 親+子カテゴリのトピックから最多いいねの公開済み投稿を取得 |
| 表示 | 16:9サムネ（OGP画像）・トピックタイトル・投稿日時 `M/D(曜) HH:MM` |
| サムネなし | グラデーションプレースホルダー表示 |
| Next.js proxy | `app/api/categories/[id]/featured-post/route.ts` 新規作成 |

**Gitタグ:** `v6.21-session35-category-tab-polish`

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.21-session35-category-tab-polish` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 36 候補タスク

### 他ページのUI改修継続

Session 30〜35 でトップページ・トピックページは概ね完成。
次は残りページのUI改善を順次進める。

**優先候補（design-spec.md のルールに従い統一）:**

| ページ | 改善ポイント |
|---|---|
| `/dashboard` | カード・セクション・タブのデザイン精査 |
| `/likes` | トピック一覧・カード表示の統一 |
| `/history` | 日付グループ・カード表示の統一 |
| `/notifications` | 通知アイテムのデザイン精査 |
| `/category-list` | カテゴリカードのデザイン精査 |
| `/categories/[id]` | カテゴリ別トピック一覧のUI統一 |

**作業方針:**
- ブラウザでスクリーンショットを確認しながら各ページを詰める
- design-spec.md のトピックページUI基準に準拠
- 一度に5ファイル以内の制約を守る

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
