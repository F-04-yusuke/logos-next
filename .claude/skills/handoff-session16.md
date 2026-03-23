# LOGOSプロジェクト 引継ぎプロンプト（Session 16）

作成: 2026-03-23 / Session 15 完了時点（Phase 4 UI/UX改善 Session 4）

---

## 前回セッション（Session 15）の完了内容

### ホバー強化・トピック概要折りたたみ・カード間隔調整

#### U-5: ホバー強化

| 要素 | 変更内容 |
|---|---|
| 並び替えselect（情報タブ・コメントタブ） | `cursor-pointer` 追加 |
| 時系列各行 | `hover:bg-gray-100 dark:hover:bg-[#1e1f20]` + `transition-colors` |
| タイムライン「もっと見る/閉じる」 | ホバー背景 + `cursor-pointer` |
| AI自動生成・AI更新ボタン | `cursor-pointer` |
| タブ切替 | `cursor-pointer` |
| 投稿ボタン | `cursor-pointer` |
| トピック保存（ブックマーク） | `cursor-pointer` |
| サムズアップ（LikeButton） | `cursor-pointer` |
| 続きを読む/閉じる | `cursor-pointer` |
| ユーザーアイコン＋名前 | `cursor-pointer` ラップ（将来プロフィールリンクを見越して） |

#### U-6: トピック概要折りたたみ

- 初期状態：**閉じている**（`contentExpanded = false`）
- タイトル直下・左寄せに「▼ トピックの概要を見る」ボタン（展開時「▲ 閉じる」）
- ボタン左端をタイトル左端に揃える（`pl-0`）
- 閉じている時はヘッダー`mb-0` + タブ`mt-0`（タイトル→タブを詰める）
- 展開時は従来の間隔（`mb-2` / `mt-4`）を維持

#### U-7: カード間隔調整

- 投稿・分析カードリスト `space-y-4` → `space-y-3`

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.4-session15-ui-hover-collapse | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## Session 16 の作業内容

### 優先①：サイドバー UI/UX 改善

**方針:** トピックページの初期印象が最重要。サイドバーは常に表示されるため、全体の印象を決める。

**確認手順:**
1. ブラウザでサイドバーの現状UIを確認
2. 改善点を洗い出して実装

**改善観点（事前チェックリスト）:**
- ナビゲーションアイテムのホバー・アクティブ状態
- アイコンとラベルのアライメント
- 間隔・余白の一貫性（8ptグリッド準拠か）
- フォントウェイト・サイズの統一感
- モバイル表示との整合性

**関連ファイル:**
- `components/Sidebar/index.tsx`
- `components/Sidebar/NavLinks.tsx`
- `components/SidebarAwareLayout.tsx`
- `components/LayoutShell.tsx`

### 優先②：コメントタブ テストデータ充実 → UI/UX 改善（Session 17以降）

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
- **Session 16**: サイドバー UI/UX 改善
- **Session 17以降**: コメントタブ テストデータ充実 + UI/UX改善
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
