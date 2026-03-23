# Phase 4 進行中：集客・マーケティング基盤

最終更新: 2026-03-23（Session 13）

---

## フェーズの目的

Phase 3 完了後の次ステージ。ユーザー獲得・SEO・UI/UX強化・セキュリティ改善を目指す。
Session 12 より開始。まず UI/UX の大幅改善から着手。

---

## Session 12: PostCard UI改修 + 投稿モーダル機能拡張（2026-03-23）

### 変更の目的

情報タブの投稿カード（PostCard）の UI を改善し、
YouTube/X/知恵袋のようにOGPが取れないURLでも「有益情報の本体（スクショ等）」を
投稿できる機能を追加。

**思想:** 有益情報の本体はURLの先にあるのではなく、YouTubeの返信欄・X・知恵袋の回答欄・
ヤフーニュースの返信欄などのスクショにある。それを貼れることが重要。

---

### U-1: PostCard UI改修 ✅（logos-next）

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`、`app/topics/[id]/_types.ts`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| タイトル位置 | 右列先頭（text-lg） | 左列サムネ下（text-sm） |
| カード高さ | min-h-[160px] | min-h-[170px] |
| 概要テキストサイズ | text-[13px] | text-[14px] |
| フォールバック（youtube） | リンクアイコン | YouTube SVGロゴ（白背景・赤ロゴ） |
| フォールバック（X） | リンクアイコン | X SVGロゴ（黒背景・白Xロゴ） |
| 添付画像（custom_thumbnail） | なし | lightboxで拡大表示（URLへのリンクなし） |

**ドメイン判定ロジック:**
```ts
const domain = (() => { try { return new URL(post.url).hostname; } catch { return ""; } })();
const isYoutube = domain.includes("youtube.com") || domain.includes("youtu.be");
const isX = domain.includes("x.com") || domain.includes("twitter.com");
```

**_types.ts への追加:**
```ts
export type Post = {
  ...
  custom_thumbnail?: string | null;  // アップロード画像パス（storage/post-images/〇〇）
};
```

---

### U-2: 投稿モーダル機能拡張 ✅（logos-next + logos-laravel）

#### フロントエンド変更

**ファイル:** `app/topics/[id]/_components/PostModal.tsx`、`app/topics/[id]/hooks/useTopicPage.ts`

| 追加機能 | 詳細 |
|---|---|
| 📎 画像添付トグル | 「サムネが取得できない場合は画像を添付する ▼」→ file input展開 → プレビュー表示 |
| ✏️ タイトル手動入力トグル | 「タイトルを手動入力する ▼」→ テキスト入力欄展開（OGPより優先） |
| 送信切り替え | 画像あり → FormData 送信 / 画像なし → JSON 送信（従来通り） |

**`onSubmit` シグネチャ変更:**
```ts
// Before
onSubmit: (isDraft: boolean) => void;
// After
onSubmit: (isDraft: boolean, imageFile?: File, customTitle?: string) => void;
```

**FormData 送信（画像ありの場合）:**
```ts
const formData = new FormData();
formData.append("url", postUrl);
formData.append("category", postCategory);
formData.append("custom_thumbnail", imageFile);
if (customTitle) formData.append("custom_title", customTitle);
formData.append("is_published", isDraft ? "0" : "1");
// Content-Type は設定しない（ブラウザが multipart/form-data + boundary を自動付与）
res = await fetch(..., { headers: getAuthHeaders(), body: formData });
```

#### バックエンド変更

**ファイル（logos-laravel）:**
- `database/migrations/2026_03_23_*_add_custom_thumbnail_to_posts_table.php`
- `app/Models/Post.php`
- `app/Http/Requests/Api/StorePostRequest.php`
- `app/Http/Controllers/Api/PostApiController.php`

| 変更 | 詳細 |
|---|---|
| Migration | `posts` テーブルに `custom_thumbnail`（string, nullable, after thumbnail_url）追加 |
| Post.php | fillable に `custom_thumbnail` 追加 |
| StorePostRequest.php | `custom_thumbnail`（nullable\|image\|max:5120）・`custom_title`（nullable\|string\|max:255）追加 |
| PostApiController.php | ファイルを `post-images/` に保存・手動タイトルでOGPタイトルを上書き |

**ストレージ:** `Storage::disk('public')->store('post-images', 'public')` → `/storage/post-images/〇〇`
**表示:** `${API_BASE}/storage/${post.custom_thumbnail}`

---

### Gitタグ（Session 12）

- logos-next: `v4.1-session12-ui-postcard`
- logos-laravel: `v4.0-p4-custom-thumbnail`

---

## Session 13: UI/UX 改善方針確立 + Batch 1 実装（2026-03-23）

### UI/UX 改善方針

参考: https://coliss.com/articles/build-websites/operation/work/logic-driven-ui-design-tips.html
採用項目: 1, 2, 4, 6, 7, 8, 9, 11, 12（+10 は Session 12 で実施済み）

**思想: 「感覚ではなく論理に基づく UI 設計」**
- スペースは関連性で決める（8pt グリッド）
- 色以外の視覚手がかりを必ず用意する
- アライメント・radius・ウェイトを統一する
- すべてのインタラクティブ要素にホバーフィードバックを付与する

**実装バッチ計画（トピックページ優先）:**

| バッチ | 採用項目 | 内容 | 状態 |
|---|---|---|---|
| Batch 1 | 10, 7 | カードbg同化 + 全ボタンYouTubeライクホバー | ✅ 完了 |
| Batch 2 | 8, 12, 11 | アライメント統一・radius一貫性・フォントウェイト整理 | ✅ 完了 |
| Batch 3 | 6, 9, 2 | 大見出し字間・小テキストコントラスト・UIコントラスト | 🔲 次回 |
| Batch 4 | 4, 1 | タップターゲット48px・8ptスペーシング | ✅ 完了 |

---

### U-3: PostCard 背景ブレンド ✅（logos-next）

**ファイル:** `app/topics/[id]/_components/PostCard.tsx`

| 変更 | 変更前 | 変更後 |
|---|---|---|
| カード枠線 | `border border-gray-200 dark:border-transparent` | 削除 |
| カード影 | `shadow-sm` | 削除 |
| カード背景 | `bg-white dark:bg-[#1e1f20]` | `bg-gray-50 dark:bg-[#131314]`（ページ背景と同化） |
| ホバー効果 | なし | `hover:bg-gray-100 dark:hover:bg-white/[0.04]` |
| 補足セクション背景 | `bg-white dark:bg-[#1e1f20]` + 枠線 | `bg-gray-50 dark:bg-[#131314]`（枠線削除） |

---

### U-4: 全ボタン YouTube ライクホバー + Tooltip ✅（logos-next）

**新規追加コンポーネント:** `components/ui/tooltip.tsx`（shadcn / @base-ui/react ベース）

**Tooltip スタイル仕様（YouTube ライク）:**
```
背景: bg-[#212121]/90（暗いチャコール・半透明）
テキスト: text-white text-[13px]
パディング: px-2 py-1（コンパクト）
角丸: rounded（控えめ）
矢印: なし
表示遅延: 500ms
```

**変更ファイル:**

| ファイル | 変更内容 |
|---|---|
| `components/LayoutShell.tsx` | `TooltipProvider delay={500}` で全体ラップ |
| `components/LikeButton.tsx` | `TooltipTrigger` でボタン置き換え・`rounded-full hover:bg-white/10`・"参考になった" tooltip |
| `app/topics/[id]/_components/PostCard.tsx` | 削除: `rounded-full hover:bg-red-500/10` / 補足あり: `hover:bg-white/[0.07]` / 続きを読む・閉じる: `hover:bg-white/[0.05]` / 補足追加: `hover:bg-blue-500/10` |
| `app/topics/[id]/_components/TopicPageClient.tsx` | タブ非アクティブ: `hover:bg-white/[0.05]` / ブックマーク・編集: `rounded-full hover:bg-white/10` |

---

### Gitタグ（Session 13）

- logos-next: `v4.2-session13-ui-hover-tooltip`
- logos-laravel: `v4.0-p4-custom-thumbnail`（変更なし）

---

## Phase 4 残タスク（優先度別）

### 最優先：UI/UX 継続改善

**トピックページ（Batch 3〜4 未完了）:**
- Batch 3（6+9+2）: トピックタイトル字間・コントラスト監査
- Batch 4（4+1）: タップターゲット・スペーシング

**トピックページ完了後:**
- コメントタブ UI/UX 改善
- 分析タブ UI/UX 改善
- トップページ（トピック一覧）UI/UX 改善
- その他全ページ

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
