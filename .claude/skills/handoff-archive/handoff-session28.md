# LOGOSプロジェクト 引継ぎプロンプト（Session 28）

作成: 2026-03-24 / Session 27 完了時点（Phase 4 UI/UX改善 Session 16）

---

## 前回セッション（Session 27）の完了内容

### U-21: 分析ツール3本 豪華化（tree / matrix / swot）

| 改修項目 | 内容 |
|---|---|
| `alert()` 廃止 | インページトースト（緑/赤・3秒自動消去・`fixed top-4 right-4`） |
| スケルトン化 | `return null`（真っ白）→ `animate-pulse` スケルトン |
| テーマ入力 統一 | 3ツールをSWOTスタイルに統一（コンパクトカード + インライン「AIで自動生成」） |
| 保存ボタン統一 | 「保存する」に統一 |
| 横幅統一 | 全ツール `max-w-5xl` に統一 |
| Gemini Chat UI | 背景`#131314`・ユーザー=`#1e1f20`枠付き・AI=グラデーション星アイコン+バブルなし |
| matrix 外枠削除・色階層 | header/footer:`#252627`・左列:`#1e1f20`・データ:`#1a1b1c` |
| matrix 最高スコア強調 | `ring-2 ring-blue-500` |
| SWOT 象限背景色 | 各象限に薄いテーマカラー背景 |
| 説明テキスト移動 | ツリーの説明を「分岐を追加」ボタン直上に移動 |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.7-session27-tools-luxury` | クリーン |
| ~/logos-laravel | main | `v4.2-session24-bookmarks-category-char` | クリーン |

---

## Session 28 の作業内容

### 最優先：分析ツール 残回収項目（ユーザーが確認後に指摘する予定）

前回セッション終了時点でユーザーが「まだ回収してほしい部分がある」と言及していた。
**セッション開始時にユーザーから具体的な指摘を受けてから着手すること。**

着手前に `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず読むこと。

### Phase 4 総点検・フェーズクローズ検討

分析ツール改修が完了した時点で、Phase 4 UI/UX改善の全ページを振り返り、
未対応・改善余地があるページをリストアップしてフェーズクローズを判断する。

---

## Phase 5 へ持ち越し（Phase 4 完了後）

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
2. **PRO系見出し**: `pl-2 border-l-2 border-yellow-500/60 text-xs font-semibold text-yellow-500 tracking-wider`（ただし分析ツールでは不使用・SVGアイコン採用）
3. **Blade 参照ルール**: UIデザインのみ変更 → 参照不要 / 機能追加・移植 → 必ず先に Blade を読む
4. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
5. **トピックページが UI 基準**: 他ページ改修時は必ずここに準拠
6. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
7. **一度に編集するファイルは5ファイル以内**
8. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
9. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
10. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
11. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
