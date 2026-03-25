# LOGOSプロジェクト 引継ぎプロンプト（Session 35）

作成: 2026-03-25 / Session 34 完了時点

---

## Session 34 完了内容

### 1. テキストサイズ ワンサイズアップ（残り2ページ）

Session 33 で手が回らなかった残りページを完了。ログイン・登録は対象外とした。

| ページ | ファイル | 主な変更 |
|---|---|---|
| プロフィール | `app/profile/page.tsx` | h1 → text-2xl、セクションh2 → text-base、フォームラベル/input → text-lg |
| カテゴリ管理(admin) | `app/categories/page.tsx` | h1 → text-2xl、セクションh2 → text-base、フォームラベル/input/select → text-lg |

**Gitタグ:** `v6.19-session34-text-size-up`

---

### 2. トップページ カテゴリタブ Yahoo風UIリデザイン

`app/_components/HomeClient.tsx` を大幅改修。

#### 実装した内容

**タブヘッダー:**
- `flex-1` で全タブを均等幅に自動充填（空きスペースなし）
- アクティブタブ: `bg-[#131314] text-white`（コンテンツエリアと同色で接続・青線なし）
- 非アクティブタブ: `bg-[#1e1f20] text-gray-500 border-b border-white/[0.08]`（ページ背景より明るい帯）
- タブ間に短い縦区切り線 `<span h-3.5 w-px bg-white/[0.15]>`（アクティブタブの隣には表示しない）
- `flatMap` で separator + button を並列出力（Fragment key 問題を回避）
- 縦スクロール防止: `overflow-y-hidden`

**コンテンツエリア:**
- `bg-[#131314]`（アクティブタブと同色 → 接続感）
- `min-h-[260px]` で高さ固定
- `items-stretch` で左右カラムが同じ高さになるよう指定

**トピックリスト（左カラム）:**
- `・` バレット + タイトル（`font-medium`）+ `💬 count` をインライン配置（間が空かない）
- タイトルは `truncate` で長い場合に省略
- per_page=8（従来の5から増加）

**人気トピックパネル（右カラム・sm以上）:**
- `FeaturedTopicPanel` コンポーネントとして独立
- 最もposts_countが多いトピックを表示
- グラデーションプレースホルダー（`aspect-[4/3]`）+ タイトル + 日時
- 縦線なし（border-l 削除済み）

**外枠:** `border border-white/[0.08] rounded-xl overflow-hidden`

**スケルトン:** 左8行 + 右プレースホルダーの2カラム構成

**Gitタグ:** `v6.20-session34-category-tab-yahoo`

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.20-session34-category-tab-yahoo` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 35 最優先タスク

### カテゴリタブ UI の続き改善

Session 34 終了時点のスクリーンショット（`スクリーンショット 2026-03-25 212331.png`）では
Yahoo のデザインにかなり近づいたが、まだ改善余地がある。

**確認済みの残課題（ユーザーコメント: "まだまだ改善の余地はありそう"）:**

| 項目 | 詳細 |
|---|---|
| 右パネル | トピックに実画像がないためグラデーションプレースホルダー。将来的にOGP画像取得等を検討 |
| トピック件数 | per_page=8 だがテストデータが少ない（3件程度）ため縦幅が余り気味 |
| タブ底線 | 非アクティブタブの `border-b` とアクティブタブの無border の境目がもう少し自然にできるか |
| 全体スペーシング | Yahoo と比べてまだ微調整の余地あり |

**作業方針:**
- ブラウザで確認してもらいながら細部を詰める
- 実画像がない問題は「サムネなし」スタイルへの変更も検討
- カテゴリタブの改善が落ち着いたら次のUI課題へ

### その他の候補タスク

- トップページ全体の他のUI改善
- 右サイドバーの人気トピックとカテゴリタブ右パネルの差別化
- CLAUDE.md の最新タグ更新

---

## テキストサイズ完了状況（Session 34 で全ページ完了）

| ページ | 状態 |
|---|---|
| トピック詳細 (`/topics/[id]`) | ✅ Session 30 以前 |
| ダッシュボード | ✅ Session 33 |
| 参考になった | ✅ Session 33 |
| 閲覧履歴 | ✅ Session 33 |
| 通知 | ✅ Session 33 |
| カテゴリ公開一覧 | ✅ Session 33 |
| カテゴリ別トピック一覧 | ✅ Session 33 |
| トピック作成・編集 | ✅ Session 33 |
| 分析スタンドアロン | ✅ Session 33 |
| 分析ツール 3本 | ✅ Session 33 |
| PostModal / AnalysisModal | ✅ Session 33 |
| プロフィール | ✅ Session 34 |
| カテゴリ管理(admin) | ✅ Session 34 |
| ログイン / 登録 | 対象外（ユーザー判断） |

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
