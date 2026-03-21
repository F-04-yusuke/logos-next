# 開発進捗

## Gitタグ履歴

### logos-next（本リポジトリ）
| タグ | 内容 | 日付 |
|---|---|---|
| （Step3作り直し完了後に打つ） | | |

### logos-new（参照用・バックエンド）
| タグ | 内容 | 日付 |
|---|---|---|
| v1.0-laravel-only | GitHub Actions動作確認版 | 2026-03-18 |
| v1.0-phase1-complete | Phase1完成・Laravel Blade版本番稼働確認済み | 2026-03-19 |
| v1.1-phase2-step4-complete | Phase2 Step4完了・Sanctum認証API追加済み | 2026-03-20 |

---

## フェーズ2 完了済みステップ

### Step1: Laravel JSON API追加（完了）
- GET /api/topics（トピック一覧・ページネーション）
- GET /api/topics/{id}（トピック詳細）
- GET /api/user/me（auth:sanctum）
- GET /api/categories（カテゴリ一覧）
- TopicApiControllerはcategory→categoriesに修正済み
- laravel/sanctum ^4.3 インストール済み
- bootstrap/app.phpにapi:ルート登録済み
- personal_access_tokens テーブル作成済み（ローカル・さくら両方）
- CORS設定済み（Vercelドメイン許可）
- 本番（gs-f04.sakura.ne.jp）での動作確認済み

### Step2: Next.js新規作成（完了）
- Next.js 16.2.0 + TypeScript + Tailwind CSS + shadcn/ui
- GitHubリポジトリ: F-04-yusuke/logos-next
- ローカルパス: ~/logos-next

### Step3: 画面移行（進行中）
**実装済み:**
- `app/page.tsx` — トピック一覧（CSR・2カラム・カテゴリタブ・ソート・ページネーション・人気トピック）
- `app/topics/[id]/page.tsx` — トピック詳細（CSR）※詳細は後述
- `app/login/page.tsx` — ログイン（Blade忠実再現・eKYC/SNSボタンUI含む）
- `app/register/page.tsx` — ユーザー登録（eKYC/SNS coming soon + 開発用フォーム）
- `app/categories/page.tsx` — カテゴリ（admin: インライン編集CRUD / 一般: グリッド一覧）
- `app/topics/create/page.tsx` — トピック作成（PRO限定ガード・カテゴリmax2・timeline行追加削除）
- `components/Header.tsx` — 検索・通知バッジ・アバタードロップダウン・スマホメニュー完全実装
- `components/Sidebar.tsx` — ナビ・PRO機能・分析ツール・鍵アイコン完全実装
- `components/SidebarAwareLayout.tsx` — サイドバー連動コンテンツ幅調整
- `components/LayoutShell.tsx` — /login・/register でHeader/Sidebar非表示制御
- `components/AppLogo.tsx` — 共通ロゴコンポーネント
- `context/AuthContext.tsx` — Sanctumトークン認証・unread_notifications_count対応済み
- `context/SidebarContext.tsx` — サイドバー開閉状態管理

- `app/notifications/page.tsx` — 通知一覧（TypeBadge・既読・ページネーション）✅ 2026-03-22
- `app/likes/page.tsx` — 参考になった一覧（3タブ: 情報/コメント/分析）✅ 2026-03-22
- `app/category-list/page.tsx` — カテゴリ公開グリッド一覧 ✅ 2026-03-22

**Step5拡張 logos-new API追加（2026-03-22）:**
- POST /api/topics/{topic}/posts（エビデンス投稿）
- POST /api/topics/{topic}/comments（コメント・1人1件制限）
- POST /api/posts/{post}/like（いいねトグル）
- POST /api/comments/{comment}/like（コメントいいねトグル）
- POST /api/topics/{topic}/bookmark（ブックマークトグル）
- GET /api/notifications・PATCH /api/notifications/read-all・PATCH /api/notifications/{id}/read
- GET /api/user/likes
- GET /api/topics/{id} 拡張（auth-aware: user_has_commented, is_bookmarked, is_liked_by_me）

**未実装（優先順）:**
1. /dashboard — ダッシュボード（Blade: `resources/views/dashboard.blade.php`）
2. /profile — プロフィール編集（Blade: `resources/views/profile/edit.blade.php`）
3. /history — 閲覧履歴（Blade: `resources/views/history/index.blade.php`）
4. /tools/tree, /tools/matrix, /tools/swot — 分析ツール（PRO限定）

### Step4: 認証（完了）
- POST /api/login・POST /api/logout
- User モデルに HasApiTokens トレイト追加
- lib/auth.ts（getToken/setToken/removeToken/getAuthHeaders）
- context/AuthContext.tsx（AuthProvider・useAuthフック）
- app/login/page.tsx（Laravel版忠実再現）
- ヘッダー認証状態反映（通知ベル・アバタードロップダウン・カテゴリ管理）

### Step5: 追加API・ページ実装（2026-03-21完了）
**logos-new API追加（routes/api.php・TopicApiController.php）:**
- POST /api/register（新規登録・トークン返却）
- GET /api/user/me 拡張（email・avatar・unread_notifications_count追加）
- GET /api/categories 変更（親カテゴリ＋children階層構造で返却）
- POST /api/topics（PRO限定・TopicApiController::store追加）
- POST /api/categories・PATCH /api/categories/{id}・DELETE /api/categories/{id}（admin限定CRUD）
- personal_access_tokens マイグレーションをgitコミット済み

**バグ修正:**
- LayoutShell追加: /login・/register でHeader/Sidebar非表示（root layoutのusePathname制御）
- route:cacheが古くAPIルートが404になる問題 → route:clear で解消・再発防止でArray.isArray()ガード追加
- navigation.blade.php: auth()->id()===1 ハードコードでadminリンクが消える → ローカルDBでadminをID=1に設定して対応

---

## Vercel手動設定（未完了・ユーザーが行う）
- 環境変数 `NEXT_PUBLIC_API_BASE_URL=https://gs-f04.sakura.ne.jp` をVercelダッシュボードで設定
