# LOGOSプロジェクト 引継ぎプロンプト（Session 20）

作成: 2026-03-24 / Session 19 完了時点（Phase 4 UI/UX改善 Session 8）

---

## 前回セッション（Session 19）の完了内容

### U-16: コメントタブ テストデータ充実 + UI調整

#### テストデータ投入（tinker）

トピック1「AIの規制はどこまで必要か」に投入：
- 親コメント 4件（user1/user2/admin/Test User、異なる論点）
- 返信 9件（補足・他ユーザー返信含む）
- いいね バラつきあり（最大3件）

#### UI調整

| 変更 | 変更前 | 変更後 |
|---|---|---|
| コメント並び替えselect スタイル | `border-gray-300 shadow-sm` 等 | 情報タブと統一（`border border-gray-200 bg-white dark:bg-[#131314] hover:...`） |
| LikeButton 左端アライン | アクション行 `mt-2 flex gap-4` | `-ml-3` 追加でアイコン左端をコンテンツ左に揃え |
| アバター・ユーザー名 | カーソルデフォルト | `cursor-pointer`（親コメント・返信両方） |
| コメント入力 placeholder | `このトピックに対するコメント（※1人1件まで）` | `このトピックに対するあなたの意見を教えてください（※1人1件まで）` |
| 返信フォーム placeholder | `返信を追加...` / `追加の補足を記入...` | `返信を追加する（※1件まで）` / `追加の補足をする（※全5件まで）` |

### user2 PRO化・分析タブ テストデータ投入

- user2（id=4, user2@test.com）を `is_pro=1` に変更
- PROユーザー（ローカル）: admin / user1 / user2 の3名体制

分析テストデータ（トピック1）:

| ID | タイプ | タイトル | 投稿者 | いいね |
|---|---|---|---|---|
| 1 | tree | AI規制の賛否：論点ロジックツリー | admin | 3 |
| 2 | matrix | AI規制アプローチ 総合評価表 | user1 | 2 |
| 3 | swot | 日本のAI規制導入 SWOT分析 | user2 | 2 |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.9-session19-analysis-testdata | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 20 の作業内容

### 優先①：分析タブ UI/UX 改善

### 優先②：トップページ（トピック一覧）UI/UX 改善

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 20**: 分析タブ UI/UX 改善
- トップページ（トピック一覧）UI/UX 改善
- その他全ページ

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）・h1/h2 タグ整理
- **Stripe Webhook受け口**: 受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化
- **/analyses/[id] SSR化**: Cookie認証導入後に対応
- **パスワードリセット機能**: SMTP設定と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等
- **SNSログイン**: Laravel Socialite（Google / X）
- **インフラ移行**: さくら → AWS（将来）

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

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **テキストカラー**: ダークモードは `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
3. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
4. **一度に編集するファイルは5ファイル以内**
5. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
