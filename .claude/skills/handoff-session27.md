# LOGOSプロジェクト 引継ぎプロンプト（Session 27）

作成: 2026-03-24 / Session 26 完了時点（Phase 4 UI/UX改善 Session 15）

---

## 前回セッション（Session 26）の完了内容

### 残ページ豪華化（継続）

| ページ | ファイル | 主な変更 |
|---|---|---|
| ログイン | `app/login/page.tsx` | h2中央配置・`duration-100`統一 |
| 登録 | `app/register/page.tsx` | h2中央配置・`duration-100`統一 |
| トピック作成 | `app/topics/create/page.tsx` | スケルトン化・h2アクセントバー・`duration-100` |
| トピック編集 | `app/topics/[id]/edit/page.tsx` | スケルトン化・h2アクセントバー・`duration-100` |

### 分析ツール設計調査完了

3ツール（tree/matrix/swot）を読み込み調査。次セッションでの実装方針を決定済み。

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.5-session26-luxury-ui` | クリーン |
| ~/logos-laravel | main | `v4.2-session24-bookmarks-category-char` | クリーン |

---

## Session 27 の作業内容

### 最優先：分析ツール豪華化（Phase 4 最後の大物）

**着手前に `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず読むこと。**
**分析ツールのPRO系見出しは `pl-2 border-l-2 border-yellow-500/60 text-yellow-500` を使う（design-spec.md参照）。**

3ツール共通の改修事項:

#### ① `alert()` → インページトースト通知（最優先）
- 保存成功・エラー時のブラウザネイティブ`alert()`を廃止
- ページ内に `<div>` ベースの一時表示トースト（成功=緑/エラー=赤、3秒後に消える）に置き換え
- 対象: `saveTree()` / `saveMatrix()` / `saveSwot()` の `alert(data.message)` と `alert(e.message)`

#### ② h1・AIセクションh2のアクセントバー適用
- h1 `ロジックツリー作成 (PRO)` など → `pl-2 border-l-2 border-yellow-500/60` + PROバッジ分離
  - `(PRO)` テキストを削除し、隣に `bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-xs font-bold` のバッジを置く
- h2 `AIアシスタント (Gemini)` など → 同じ yellow アクセントバー

#### ③ ローディングスケルトン
- 現在 `if (isLoading || !user) return null`（画面が真っ白）
- → スケルトン表示に変更

#### ④ matrixの最高スコアパターン強調
- `tfoot` の総合評価セルで最高スコアのパターンに `ring-2 ring-blue-500 rounded` 等を付与

#### ⑤ SWOTの4象限ボックス背景色
- 各ボックスに薄い色背景追加（box1=`dark:bg-blue-900/5`、box2=`dark:bg-red-900/5`等）

---

## Phase 4 残タスク（フェーズ終了後は次フェーズへ）

### UI/UX 改善（Phase 4 内）
- 分析ツール豪華化（上記・今セッション）
- Phase 4 UI総点検完了後にフェーズクローズ

### 次フェーズ（Phase 5）へ持ち越し
- **LP作成**: `/`（トップ）のランディングページ実装（登録誘導・PRO訴求）
- **SEO対策**: Next.js メタデータ（OGP）・h1/h2 タグ整理
- **Stripe Webhook受け口**: 受け取るだけの最小実装
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化
- **パスワードリセット機能**: SMTP設定と合わせて実装

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
2. **PRO系見出し**: `pl-2 border-l-2 border-yellow-500/60 text-xs font-semibold text-yellow-500 tracking-wider`
3. **Blade 参照ルール**: UIデザインのみ変更 → 参照不要 / 機能追加・移植 → 必ず先に Blade を読む
4. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
5. **トピックページが UI 基準**: 他ページ改修時は必ずここに準拠
6. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
7. **一度に編集するファイルは5ファイル以内**
8. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
9. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
10. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
11. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
