# LOGOSプロジェクト 引継ぎプロンプト（Session 18）

作成: 2026-03-23 / Session 17 完了時点（Phase 4 UI/UX改善 Session 6）

---

## 前回セッション（Session 17）の完了内容

### U-9: トピックページ タイポグラフィ調整
| 変更 | 変更前 | 変更後 |
|---|---|---|
| トピックタイトル | `text-2xl` | `text-xl` |
| トピック概要テキスト | `text-sm` | `text-base` |
| PostCard 投稿概要 | `text-[14px]` | `text-[15px]` |

### U-10: サイドバー幅・トピックページ余白 Gemini ライク
| 変更 | 変更前 | 変更後 |
|---|---|---|
| サイドバー展開幅 | `w-64` (256px) | `w-72` (288px) |
| サイドバー折畳幅 | `md:w-16` (64px) | `md:w-14` (56px) |
| トピックページ余白 | `px-4 sm:px-6 lg:px-8` | `px-6 sm:px-10 lg:px-16` |

### U-11: Gemini テキストカラー全ページ統一
- `globals.css` に `--color-g-text: #E3E3E3` / `--color-g-sub: #C4C7C5` 定義
- 全16ファイル・172箇所を置換（`dark:text-gray-100/200/300/400` → `dark:text-g-text`/`dark:text-g-sub`）
- **新規コンポーネントのルール**: ダークモードテキストは必ず `text-g-text` / `text-g-sub` を使うこと

### U-12: Noto Sans JP フォント追加
- `layout.tsx` に `Noto_Sans_JP` を追加、`globals.css` のフォントスタックに組み込み
- 日本語フォントが全OS・全ブラウザで統一された

### ハイドレーションエラー修正（教訓）
- 原因: `.next` キャッシュに古いサーバーレンダリング結果が残存
- 解決: `rm -rf .next && npm run dev`

---

## ハンドオフアーカイブ整理（Session 17 実施）

| 状態 | ファイル |
|---|---|
| アーカイブ済み（正常） | session6〜13、session15〜17 |
| **欠番（操作ミスで消失）** | **session14**（logos-nextのみ・意図的欠番として扱う） |
| 重複削除済み | session11、12、15、16（skills/から削除・archive/に統合） |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.6-session17-gemini-typography | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 18 の作業内容

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

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善
- **Session 18**: コメントタブ テストデータ充実 + UI/UX改善
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
