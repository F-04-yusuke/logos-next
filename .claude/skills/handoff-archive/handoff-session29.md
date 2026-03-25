# LOGOSプロジェクト 引継ぎプロンプト（Session 29）

作成: 2026-03-25 / Session 28 完了時点（Phase 4 UI/UX改善 Session 17）

---

## Session 29 完了内容（本番バグ修正）

### B-1: Vercel本番で情報投稿が500エラー（マイグレーション未適用）

- **原因**: `add_custom_thumbnail_to_posts_table`（2026-03-23）が本番DBに未適用。`create_personal_access_tokens_table` が既存テーブルと衝突してそれ以降のマイグレーションをブロックしていた
- **修正**: `create_personal_access_tokens_table` に `Schema::hasTable()` チェック追加 → `php artisan migrate --force` で3件のPendingを適用
- **教訓**: 詳細は `logos-laravel/.claude/skills/infra.md` の「2026-03-25 Session 29」セクション参照

### B-2: Vercel本番でOGPサムネイルが取得できない

- **原因①**: さくらサーバーの `file_get_contents` でHTTPS外部取得が失敗（SSL設定問題）
- **原因②**: さくらのIPがYouTubeのサーバーサイドbot判定を受けており、curlでも最小HTMLしか返らない
- **修正**: `OgpService` を curl ベースに全面書き替え + YouTube URL は oEmbed API から取得
- **技術的負債**: `CURLOPT_SSL_VERIFYPEER => false` が残存（低リスク・Phase 5以降で改善検討）
- **教訓**: 詳細は `logos-laravel/.claude/skills/infra.md` の「2026-03-25 Session 29」セクション参照

---

## 前回セッション（Session 28）の完了内容

### U-22: 分析ツール3本 AIアシスタントUI刷新

| 改修項目 | 内容 |
|---|---|
| AIアイコン刷新 | Gemini風ダイヤ → シアン雷ボルト（`AiIcon` 関数・`from-cyan-300 via-cyan-500 to-teal-600` グラデーション背景） |
| ヒントテキスト移動 | カード内初期メッセージ廃止 → 「AIアシスタント」見出し右隣に `text-[11px]` テキストとして配置 |
| アイコン配置 | 見出しテキスト左に `w-5 h-5 rounded` グラデーション背景付きアイコン |
| 初期チャット廃止 | `chatMsgs` 初期値 `[]`（空）に変更（tree / matrix / swot 共通） |

### U-23: 総合評価表 テーブル角丸統一

| 改修項目 | 内容 |
|---|---|
| テーブル外枠 | `rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden` ラッパー追加 |
| スクロール | 内側に `overflow-x-auto custom-scroll` div を別途配置（2段ネストで `overflow-hidden` 競合回避） |

### U-24: ロジックツリー YouTube風UI全面刷新

| 改修項目 | 内容 |
|---|---|
| NodeEditor 全面再設計 | `flex gap-3` レイアウト（アバター列 `w-8` + コンテンツ列 `flex-1`） |
| アバター円 | 自動採番ラベル（自1/A1/B2 等）・自分: `bg-blue-600`・他: `bg-gray-800` |
| スタンスバッジ | `rounded-full border` セレクト・スタンス別色 |
| 本文 | `text-[15px]` textarea（auto-resize） |
| 返信ボタン | `mt-1 text-[13px]` 「＋ 返信を追加」 |
| SPEAKERS | 「自分 (自)」先頭・ユーザーA〜E・その他（7択） |
| STANCES | 主張/反論/賛成・補足/疑問/解決策/根拠/事実/仮説/前提（9択） |
| 垂れ下がり線バグ修正 | 子ノードを親 flex row の外に切り出し → `flex-1` が親コンテンツ高さのみに限定 |
| 線のつなぎ目修正 | 全縦線を `border-l-2 marginLeft:15px`・全コネクターを `left=-29px` に統一（外端 x=15px 一致） |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.11-session28-tree-ux-complete` | クリーン |
| ~/logos-laravel | main | `v4.2-session24-bookmarks-category-char` | クリーン |

---

## Session 29 の作業候補

### 最優先: Phase 4 総点検・フェーズクローズ検討

分析ツール改修が完了したので、Phase 4 UI/UX改善の全ページを振り返り、
未対応・改善余地があるページをリストアップしてフェーズクローズを判断する。

着手前に `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず読むこと。

### Phase 5 へ持ち越し（Phase 4 完了後）

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
