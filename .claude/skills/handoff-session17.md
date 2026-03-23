# LOGOSプロジェクト 引継ぎプロンプト（Session 17）

作成: 2026-03-23 / Session 16 完了時点（Phase 4 UI/UX改善 Session 5）

---

## 前回セッション（Session 16）の完了内容

### U-8: サイドバー UI/UX 改善

#### アクティブ状態・アイコン整合・cursor-pointer

| 変更 | 内容 |
|---|---|
| アクティブ状態 | `usePathname()` で現在ページに `bg-gray-700` ハイライト（全リンク対応） |
| 保存トピックアイコン | `w-5 h-5 bg-gray-800` → `w-6 h-6 border border-gray-600 group-hover:bg-gray-600`（Blade統一） |
| 「設定」アイコン | 歯車アイコン追加（他リンクとの整合性） |
| 非PROボタン | `cursor-pointer` 追加（全3ボタン） |
| ホーム・カテゴリ一覧 | `font-bold` 削除（他リンクと統一） |
| セクション間隔 | `space-y-6` → `space-y-3`（hr前後の余白縮小） |
| ハンバーガー | `cursor-pointer` 追加 |

#### アイコンサイズ・アライメント統一

| 変更 | 内容 |
|---|---|
| アイコンサイズ | `w-5 h-5` → `w-6 h-6`（ハンバーガーと同サイズ） |
| strokeWidth | `1.5` → `2`（ハンバーガーと統一） |
| コンテナpadding | `px-3` → `px-4`（アイコン左端 = ハンバーガー左端 = 24px） |
| 上余白 | `py-4` → `py-2`（LOGOSとホームの間隔縮小） |
| テキスト ml | `ml-3` → `ml-5`（LOGOSアイコン左端 = ナビテキスト左端 = 68px） |
| 保存トピック名 ml | `ml-2` → `ml-5`（他ナビ項目と左端統一） |

#### AppLogo コンパクト化（YouTube ライク）

| 変更 | 内容 |
|---|---|
| SVG | `h-8` → `h-6`（ハンバーガー三本線縦幅に収める） |
| テキスト | `text-2xl tracking-widest` → `text-lg tracking-tight`（縮小・字間詰め） |
| gap | `gap-2` → `gap-1.5` |
| ハンバーガーとの余白 | `ml-2` → `ml-3` |

### フォントウェイト全ページ統一

**ルール:** レギュラー（400）とボールド（700）のみ使用（security.md 準拠）

| 違反パターン | 修正 | 対象 |
|---|---|---|
| `font-black`（900） | → `font-bold` | 全PRO バッジ・スコア表示・通知ロゴ（AppLogoを除く） |
| `font-semibold`（600） | → `font-bold` | 全ページ h1/h2 見出し・カテゴリバッジ |
| `font-medium`（500） | → 削除（font-normal） | ラベル・ユーザー名・メール等 |
| 未読通知テキスト | `font-medium` → `font-bold` | 既読との差別化維持 |

**除外（意図的維持）:**
- `AppLogo.tsx` の `font-black`（"LOGOS"ブランドロゴ）
- サイドバーセクション見出しの `font-semibold`（Blade踏襲）

### トピックページ タイポグラフィ修正

| 変更 | 内容 |
|---|---|
| トピックタイトル | `tracking-tight` 削除（字詰め解消） |
| 件数表示 | `{N}件の投稿` → `{N} 件の投稿`（数字と単位の間にスペース）（投稿・コメント・分析3箇所） |
| PostCard タイトル | `font-semibold` → `font-bold` |
| PostCard ユーザー名 | `font-medium` 削除 |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.5-session16-sidebar-font | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 17 の作業内容

### 優先①：コメントタブ テストデータ充実 → UI/UX 改善

**手順:**
1. tinker でコメントタブに内容の濃いテストデータを投入
   - 親コメント複数（異なるユーザー）
   - 補足（自コメントへの返信）あり
   - 他ユーザーへの返信あり
   - いいね数にバラつきをつける
2. ブラウザでコメントタブの現状UIを確認
3. 改善点を洗い出して実装

**tinker コマンド例:**
```bash
docker exec logos-laravel-laravel.test-1 php artisan tinker --execute="
\App\Models\Comment::create([
  'topic_id' => TOPIC_ID,
  'user_id' => USER_ID,
  'body' => 'コメント内容',
  'parent_id' => null,
]);
"
```

### 優先②：分析タブ UI/UX 改善

### 優先③：トップページ（トピック一覧）UI/UX 改善

---

## 全フェーズ完了状況

| フェーズ | 内容 | 状態 |
|---|---|---|
| Phase 1 | Laravel Blade版MVP磨き込み | ✅ 完了（2026-03-19） |
| Phase 2 | Next.js移行（全17ページ・Step1〜14） | ✅ 完了（2026-03-22） |
| Phase 3 | 技術改善（B-1〜B-6 / F-1〜F-7） | ✅ 完了（2026-03-23） |
| Phase 4 | 集客・マーケティング基盤 | 🔄 進行中（Session 12〜） |
| Phase 5 | スケールとマネタイズ | 🔲 未着手 |

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 17**: コメントタブ テストデータ充実 + UI/UX改善
- 分析タブ UI/UX 改善
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

# コンテナ名確認（docker-compose命名規則で変わる場合あり）
docker ps | grep logos-laravel
```

---

## 重要ルール再掲

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは必ず `!!` 変換
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
6. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
