# LOGOSプロジェクト 引継ぎプロンプト（Session 11）

作成: 2026-03-23 / Session 11 完了時点（ドキュメント整理）

---

## 前回セッション（Session 11）の完了内容

### ドキュメント整理 ✅ 完了

**logos-next CLAUDE.md**: 大幅に短縮（仕様書+進捗の混在 → 必須ルール+ページ一覧+スキルファイルインデックスのみに）

**logos-laravel CLAUDE.md**: 同様に短縮（実装詳細を skills ファイルへ移動）

**新規作成（logos-next/.claude/skills/）:**
- `progress-roadmap.md` — プロジェクト理念・フェーズ定義・全ロードマップ・Gitタグ履歴（両リポジトリ）
- `progress-phase1.md` — Phase 1 完了記録（Laravel Blade版MVP・障害教訓）
- `progress-phase2.md` — Phase 2 完了記録（Next.js移行・Step1〜14・全17ページ）
- `progress-phase3.md` — Phase 3 完了記録（B-1〜B-6 / F-1〜F-7）・技術的負債

**アーカイブ（logos-next/.claude/skills/handoff-archive/）:**
- handoff-session6.md 〜 handoff-session10.md → アーカイブ済み（情報は progress-*.md に統合）

**旧 progress.md / phase3-improvements.md**: 内容は新ファイルに統合済み。インデックスに更新。

**directory-map.md（両リポジトリ）**: 更新済み

**logos-laravel/roadmap.md**: 将来構想のみに整理（詳細進捗は logos-next 側に統合）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v3.8-session9-docs-complete | クリーン |
| ~/logos-laravel | main | v3.5-b6-like-relations | クリーン |

---

## 全フェーズ完了状況

| フェーズ | 内容 | 状態 |
|---|---|---|
| Phase 1 | Laravel Blade版MVP磨き込み | ✅ 完了（2026-03-19） |
| Phase 2 | Next.js移行（全17ページ・Step1〜14） | ✅ 完了（2026-03-22） |
| Phase 3 | 技術改善（B-1〜B-6 / F-1〜F-7） | ✅ 完了（2026-03-23） |
| Phase 4 | 集客・マーケティング基盤 | 🔲 未着手 |
| Phase 5 | スケールとマネタイズ | 🔲 未着手 |

---

## 次のセッションでやること候補（Phase 4 以降）

### 優先度高
- **LP作成**: welcome.blade.php の実装（現在未着手・トップページとして機能していない）
- **SEO対策**: Next.js メタデータ（OGP）の適切な設定・h1/h2タグ整理
- **Stripe Webhook受け口**: 決済コード作り込みなし・受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化（Phase 2 暫定実装の解消）
- **/analyses/[id] SSR化**: Cookie認証導入後に対応（現在 F-1 残タスク）
- **パスワードリセット機能**: SMTP設定（さくら or SendGrid）と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等（本人確認・質の高い議論コミュニティの維持）
- **SNSログイン**: Laravel Socialite（Google / X）
- **インフラ移行**: さくら → AWS（将来）

---

## 起動手順

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # logos-laravel.test-1 が Running ならOK
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

# PHPUnit
docker exec logos-laravel.test-1 php artisan test

# ルート確認
docker exec logos-laravel.test-1 php artisan route:list
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは `!!` 変換または `transforms.ts` 経由
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **UIは変更しない** — ロジック移動のみ。見た目ゼロ変化を保証してから push
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
