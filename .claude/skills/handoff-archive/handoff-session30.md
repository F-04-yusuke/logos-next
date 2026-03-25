# LOGOSプロジェクト 引継ぎプロンプト（Session 30）

作成: 2026-03-25 / Session 29 完了時点（Phase 4 UI/UX改善 Session 18）

---

## 前回セッション（Session 29）の完了内容

### B-1: Vercel本番で情報投稿が500エラー → 修正済み ✅
- **原因**: `add_custom_thumbnail_to_posts_table` 他2件のマイグレーションが本番DBに未適用
- **修正**: `create_personal_access_tokens_table` をべき等化（`Schema::hasTable` チェック） → `migrate --force` で3件適用
- **教訓**: `logos-laravel/.claude/skills/infra.md`「2026-03-25 Session 29 本番APIエラーの教訓」参照

### B-2: Vercel本番でOGPサムネイルが取得できない → 修正済み ✅
- **原因①**: さくらサーバーで `file_get_contents` によるHTTPS取得が失敗（SSL設定問題）
- **原因②**: さくらのIPがYouTubeのサーバーサイドbot判定を受けフルHTMLが返らない
- **修正**: `OgpService.php` を `curl` ベースに全面書き替え＋YouTube は oEmbed API から取得
- **技術的負債**: `CURLOPT_SSL_VERIFYPEER => false`（低リスク・Phase 5以降で改善検討）
- **教訓**: `logos-laravel/.claude/skills/infra.md`「2026-03-25 Session 29 さくらサーバーの外部HTTP取得制約」参照

### 本番テストデータ投入 ✅
- トピック3（EV環境問題・admin）・トピック4（リモートワーク・user1）新規作成
- 全4トピックに情報・コメント・分析（ツリー/マトリクス/SWOT）のデータを投入
- admin・user1 それぞれ下書き（投稿1件＋分析1件）を準備済み

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.12-session29-docs-testdata` | クリーン |
| ~/logos-laravel | main | `v4.3-session29-ogp-migration-fix` | クリーン |

### 本番データ状態（Vercel確認用）
| トピックID | タイトル | 情報 | コメント | 分析 |
|---|---|---|---|---|
| 1 | イラン情勢 | 3件 | 2件 | 1件(ツリー) |
| 2 | 日米首脳会談 | 5件 | 3件 | 1件(マトリクス) |
| 3 | 電気自動車（EV） | 5件(下書き1含む) | 3件+返信2 | 2件(ツリー公開+SWOT) |
| 4 | リモートワーク | 4件(下書き1含む) | 2件+返信2 | 2件(マトリクス+ツリー下書き) |

---

## Session 30 の作業候補

### 最優先: Phase 4 総点検・フェーズクローズ検討

Session 28 で分析ツール改修が完了したため、Phase 4 UI/UX改善の全ページを振り返り、
未対応・改善余地があるページをリストアップしてフェーズクローズを判断する。

**着手前に必ず読むこと:**
- `.claude/skills/design-spec.md` の「豪華要素ルール」セクション
- `app/topics/[id]/` が全ページのUI基準（トピックページに準拠させる）

### Phase 4 残タスク候補（ユーザーと相談して優先度を決める）

| 優先 | ページ | 内容 |
|---|---|---|
| 高 | `/dashboard` | 各タブのUIを豪華要素ルールに統一 |
| 高 | `/history` | 閲覧履歴のUIを豪華要素ルールに統一 |
| 中 | `/notifications` | 通知一覧のUI統一 |
| 中 | `/likes` | 参考になった一覧のUI統一 |
| 低 | `/profile` | プロフィール編集のUI統一 |

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

# 本番APIの動作確認（エラー調査時）
TOKEN=$(curl -s -X POST "https://gs-f04.sakura.ne.jp/api/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password"}' | python3 -c "import sys,json; print(json.load(sys.stdin).get('token',''))")
curl -s "https://gs-f04.sakura.ne.jp/api/対象エンドポイント" -H "Authorization: Bearer $TOKEN"
```

---

## 重要ルール再掲

1. **豪華要素ルール**: `.claude/skills/design-spec.md` の「豪華要素ルール」セクションを必ず参照・数値を変えない
2. **PRO系見出し**: `pl-2 border-l-2 border-yellow-500/60 text-xs font-semibold text-yellow-500 tracking-wider`（ただし分析ツールでは不使用）
3. **Blade 参照ルール**: UIデザインのみ変更 → 参照不要 / 機能追加・移植 → 必ず先に Blade を読む
4. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
5. **トピックページが UI 基準**: 他ページ改修時は必ずここに準拠
6. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
7. **一度に編集するファイルは5ファイル以内**
8. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
9. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
10. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
11. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
12. **本番バグ調査**: まず `migrate:status` → 次に curl で直接APIを叩く（詳細は `deploy-config.md` 参照）
13. **本番テストデータ投入**: Seeder を使うこと（`/tmp/*.php` 直接流し込みは非推奨。詳細は `infra.md` 参照）
