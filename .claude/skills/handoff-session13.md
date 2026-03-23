# LOGOSプロジェクト 引継ぎプロンプト（Session 13）

作成: 2026-03-23 / Session 13 完了時点（Phase 4 UI/UX改善 Session 2）

---

## 前回セッション（Session 13）の完了内容

### UI/UX 改善方針の確立

参考記事: https://coliss.com/articles/build-websites/operation/work/logic-driven-ui-design-tips.html
（Logic-Driven UI Design Tips / 20年以上のキャリアを持つデザイナーによる14の原則）

採用項目: 1, 2, 4, 6, 7, 8, 9, 11, 12（+ 10 は Session 12 で実施済み）

**実装バッチ計画（トピックページ集中）:**
| バッチ | 項目 | 内容 | 状態 |
|---|---|---|---|
| Batch 1 | 10（前セッション）, 7 | カードbg同化・ホバー全ボタン | ✅ 完了 |
| Batch 2 | 8 + 12 + 11 | アライメント・一貫性・フォントウェイト | 🔲 次回 |
| Batch 3 | 6 + 9 + 2 | 大見出し字間・コントラスト監査 | 🔲 次回 |
| Batch 4 | 4 + 1 | タップターゲット・スペーシング | 🔲 次回 |

---

### Batch 1 完了内容

#### U-3: PostCard背景ブレンド（項目10相当）✅

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| カード枠線 | `border border-gray-200 dark:border-transparent` | 削除 |
| カード影 | `shadow-sm` | 削除 |
| カード背景 | `bg-white dark:bg-[#1e1f20]` | `bg-gray-50 dark:bg-[#131314]`（背景と同化） |
| ホバー効果 | なし | `hover:bg-gray-100 dark:hover:bg-white/[0.04]`（全投稿統一） |
| 補足セクション | `bg-white dark:bg-[#1e1f20] border border-t-0 ...` | `bg-gray-50 dark:bg-[#131314]`（枠線削除） |

#### U-4: 全ボタン YouTube ライク ホバー + Tooltip（項目7）✅

**新規追加:** `components/ui/tooltip.tsx`（shadcn add tooltip / @base-ui/react ベース）

**Tooltip スタイル（YouTube ライク）:**
- 背景: `bg-[#212121]/90`（暗いチャコール・半透明）
- テキスト: `text-white text-[13px]`
- パディング: `px-2 py-1`（コンパクト）
- 角丸: `rounded`
- 矢印: なし
- 表示遅延: 500ms（`TooltipProvider delay={500}` in `LayoutShell.tsx`）

**変更ファイル:**

| ファイル | 変更内容 |
|---|---|
| `components/LayoutShell.tsx` | `TooltipProvider delay={500}` で全体ラップ |
| `components/LikeButton.tsx` | `TooltipTrigger` でボタン置き換え・`rounded-full hover:bg-white/10`・"参考になった" tooltip |
| `app/topics/[id]/_components/PostCard.tsx` | 削除: `rounded-full hover:bg-red-500/10` / 補足あり: `hover:bg-white/[0.07]` / 続きを読む・閉じる: `hover:bg-white/[0.05]` / 補足追加: `hover:bg-blue-500/10` |
| `app/topics/[id]/_components/TopicPageClient.tsx` | タブ非アクティブ: `hover:bg-white/[0.05]` / ブックマーク・編集: `rounded-full hover:bg-white/10` |

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v4.2-session13-ui-hover-tooltip | クリーン |
| ~/logos-laravel | main | v4.0-p4-custom-thumbnail | クリーン（変更なし） |

---

## 全フェーズ完了状況

| フェーズ | 内容 | 状態 |
|---|---|---|
| Phase 1 | Laravel Blade版MVP磨き込み | ✅ 完了（2026-03-19） |
| Phase 2 | Next.js移行（全17ページ・Step1〜14） | ✅ 完了（2026-03-22） |
| Phase 3 | 技術改善（B-1〜B-6 / F-1〜F-7） | ✅ 完了（2026-03-23） |
| Phase 4 | 集客・マーケティング基盤 | 🔄 進行中（Session 12 〜） |
| Phase 5 | スケールとマネタイズ | 🔲 未着手 |

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善（トピックページ→全ページ）

**トピックページ Batch 2〜4（上記バッチ計画参照）:**
- **Batch 2**: Items 8 + 12 + 11 → PostCard のアライメント統一・border-radius一貫性・フォントウェイト整理
- **Batch 3**: Items 6 + 9 + 2 → トピックタイトル字間・小テキストコントラスト(4.5:1)・UIコントラスト(3:1)
- **Batch 4**: Items 4 + 1 → タップターゲット48px・8ptグリッドスペーシング

**トピックページ完了後:**
- コメントタブの UI/UX 改善
- 分析タブの UI/UX 改善
- トップページ（トピック一覧）の UI/UX 改善

### 優先度高
- **LP作成**: /（トップ）のランディングページ実装（現在未着手・登録誘導）
- **SEO対策**: Next.js メタデータ（OGP）の適切な設定・h1/h2タグ整理
- **Stripe Webhook受け口**: 決済コード作り込みなし・受け取るだけの最小実装

### 優先度中
- **認証セキュリティ強化**: localStorage → httpOnly Cookie 化（Phase 2 暫定実装の解消）
- **/analyses/[id] SSR化**: Cookie認証導入後に対応（F-1 残タスク）
- **パスワードリセット機能**: SMTP設定（さくら or SendGrid）と合わせて実装

### 優先度低
- **eKYC連携**: TRUSTDOCK等（本人確認・質の高い議論コミュニティの維持）
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

**注意:** Docker Compose の命名規則により、コンテナ名が `logos-laravel-laravel.test-1` になっている場合がある。
`docker ps` で確認してから `docker exec` すること。

## 検証コマンド

```bash
# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Next.js ビルド確認
cd ~/logos-next && npm run build

# ルート確認
docker exec logos-laravel-laravel.test-1 php artisan route:list
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
6. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**（DBデータ消失防止）
