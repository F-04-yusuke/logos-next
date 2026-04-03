# logos-next ディレクトリ構成
最終更新: 2026-04-03（Session 51 / Phase 5 Step 2 完了・Dead code削除・Sonner・next/image移行）

```
logos-next/
├── CLAUDE.md                            # 仕様書メイン（ルール・現状・スキルファイルインデックス）
├── app/
│   ├── favicon.ico
│   ├── globals.css                      # グローバルCSS（tree-line等カスタムクラス含む・スクロールバーCSS）
│   ├── layout.tsx                       # ルートレイアウト（AuthProvider・SidebarProvider + LayoutShell）
│   ├── page.tsx                         # / トピック一覧【SSR Server Component】初期データfetch → HomeClient に渡す
│   ├── _components/
│   │   └── HomeClient.tsx               # / トピック一覧CSR部分（ソート・ページネーション・タブ・useAuth）
│   ├── api/                             # Route Handler プロキシ層（F-1 Phase3 / auth・proxy Phase5）
│   │   ├── auth/                        # 認証エンドポイント群（Phase 5 Step 1 新規）
│   │   │   ├── login/
│   │   │   │   └── route.ts             # POST: Laravel /api/login → logos_token Cookie セット
│   │   │   ├── logout/
│   │   │   │   └── route.ts             # POST: Cookie 削除 + Laravel ログアウト（best effort）
│   │   │   ├── me/
│   │   │   │   └── route.ts             # GET: Cookie 読み取り → Laravel /api/user/me 転送
│   │   │   └── register/
│   │   │       └── route.ts             # POST: Laravel /api/register → logos_token Cookie セット
│   │   ├── proxy/
│   │   │   └── [...path]/
│   │   │       └── route.ts             # catch-all プロキシ（GET/POST/PUT/PATCH/DELETE、multipart 対応）（Phase 5 Step 1 新規）
│   │   └── revalidate/
│   │       └── route.ts                 # POST: On-Demand ISR revalidate（Cookie 認証・Phase 5 Step 1 で変更）
│   ├── analyses/
│   │   └── [id]/
│   │       ├── page.tsx                 # /analyses/[id] 分析スタンドアロン閲覧【SSR Server Component・Session 53】Cookie認証→Laravel直接fetch
│   │       └── _components/
│   │           └── AnalysisShowClient.tsx  # 分析閲覧CSR部分（"use client"・handleBack・全描画ロジック・Analysis型をexport）
│   ├── login/
│   │   └── page.tsx                     # /login ログイン画面（Blade忠実再現・eKYC/SNSボタンUI）
│   ├── register/
│   │   └── page.tsx                     # /register ユーザー登録（eKYC/SNS coming soon + 開発用フォーム）
│   ├── categories/
│   │   ├── page.tsx                     # /categories カテゴリ（admin: インライン編集CRUD / 一般: グリッド一覧）
│   │   └── [id]/
│   │       ├── page.tsx                 # /categories/[id] カテゴリ別トピック一覧【SSR Server Component・Session 53完全SSR化】トピック+カテゴリ名両方fetch
│   │       └── _components/
│   │           └── CategoryTopicsClient.tsx  # カテゴリ別トピック一覧CSR（propsでカテゴリ名受取・ソート・ページネーション）
│   ├── category-list/
│   │   └── page.tsx                     # /category-list カテゴリ公開グリッド一覧【SSR Server Component・Session 38】（大分類・中分類 → /categories/[id]）
│   ├── notifications/
│   │   └── page.tsx                     # /notifications 通知一覧（TypeBadge・既読・ページネーション）
│   ├── likes/
│   │   └── page.tsx                     # /likes 参考になった一覧（3タブ: 情報/コメント/分析）
│   ├── dashboard/
│   │   ├── page.tsx                     # /dashboard ダッシュボード（5タブ: 投稿/下書き/コメント/分析/トピック・JSX描画のみ）
│   │   ├── _hooks/
│   │   │   └── useDashboard.ts          # state・fetch・全ハンドラ集約（useTopicPage パターン準拠・Session 32）
│   │   └── _components/
│   │       └── DraftEditModal.tsx       # 下書き編集モーダル（Session 32 抽出）
│   ├── profile/
│   │   └── page.tsx                     # /profile プロフィール編集（アバター・名前クールダウン・パスワード変更・アカウント削除）
│   ├── history/
│   │   └── page.tsx                     # /history 閲覧履歴（日付グループ・YouTube風ラベル・ページネーション）
│   ├── topics/
│   │   ├── create/
│   │   │   └── page.tsx                 # /topics/create トピック作成（PRO限定・カテゴリmax2・timeline行追加削除）
│   │   └── [id]/
│   │       ├── page.tsx                 # /topics/[id] トピック詳細メイン【SSR Server Component】初期データfetch
│   │       ├── edit/
│   │       │   └── page.tsx             # /topics/[id]/edit トピック編集（PRO作成者限定・timeline is_ai制御）
│   │       ├── _types.ts                # 型定義（TimelineItem/Post/Reply/Comment/TopicAnalysis/TopicDetail・AnalysisData Discriminated Union）
│   │       ├── _helpers.ts              # API_BASE / timeAgo / formatDateTime
│   │       ├── hooks/
│   │       │   └── useTopicPage.ts      # 全state・handler・computed値を集約（F-2 Phase3）
│   │       └── _components/
│   │           ├── TopicPageClient.tsx  # トピック詳細CSR部分（"use client"・useTopicPage呼び出し・全JSX）
│   │           ├── UserAvatar.tsx       # → components/UserAvatar への re-export（F-7 Phase3）
│   │           ├── LikeButton.tsx       # → components/LikeButton への re-export（F-7 Phase3）
│   │           ├── PostCard.tsx         # エビデンスカード【全ページ共用】（isDraft/onLike?/onDelete?/onSupplement? optional props・lightbox・続きを読む）
│   │           ├── CommentCard.tsx      # コメントカード【全ページ共用】（全アクション optional props・返信制限制御）
│   │           ├── PostModal.tsx        # エビデンス投稿モーダル（OGPプレビュー・画像添付・タイトル手動入力）
│   │           ├── AnalysisCard.tsx     # typeBadge / AnalysisPreview をエクスポート
│   │           └── AnalysisModal.tsx    # 分析・図解投稿モーダル（オリジナル画像アップロード対応）
│   └── tools/
│       ├── tree/
│       │   └── page.tsx                 # /tools/tree ロジックツリー作成（PRO限定・AIアシスタント・保存/上書き保存）
│       ├── matrix/
│       │   └── page.tsx                 # /tools/matrix 総合評価表作成（PRO限定・列行追加/削除・スコア集計・AI）
│       └── swot/
│           └── page.tsx                 # /tools/swot SWOT/PEST分析作成（PRO限定・SWOT/PEST切替・AI）
├── components/
│   ├── AppLogo.tsx                      # 共通ロゴコンポーネント
│   ├── Header.tsx                       # 後方互換 re-export → Header/index.tsx に転送（F-6 Phase3）
│   ├── Header/                          # Header サブコンポーネント群（F-6 Phase3）
│   │   ├── index.tsx                    # メイン Header（全 state/handler・3サブコンポを組み合わせ）
│   │   ├── NotificationBell.tsx         # ベルアイコン+バッジ+Link（PC/スマホ共用・linkClassName/iconClassName）
│   │   ├── SearchBar.tsx                # 検索フォーム（PC/スマホ共用・autoFocus 対応）
│   │   └── UserMenu.tsx                 # Avatar helper（named export）+ PC アバタードロップダウン
│   ├── LayoutShell.tsx                  # /login・/register でHeader/Sidebar非表示制御・ProModal配置
│   ├── LikeButton.tsx                   # 共有いいねボタン（F-7 Phase3・sm/md/lg サイズ対応）
│   ├── ProModal.tsx                     # PRO誘導モーダル（非PRO会員がPRO機能を押したとき表示）
│   ├── Sidebar.tsx                      # 後方互換 re-export → Sidebar/index.tsx に転送（F-6 Phase3）
│   ├── Sidebar/                         # Sidebar サブコンポーネント群（F-6 Phase3）
│   │   ├── index.tsx                    # メイン Sidebar（aside ラッパー・トグルボタン・ロゴ・NavLinks）
│   │   └── NavLinks.tsx                 # メインナビ+ログイン時セクション全体（sidebarOpen props で opacity 制御）
│   ├── SidebarAwareLayout.tsx           # サイドバー連動コンテンツ幅調整
│   ├── UserAvatar.tsx                   # 共有アバターコンポーネント（sm/md/lg 3サイズ・F-7 Phase3）
│   ├── mypage/                          # ダッシュボード・参考になった用 re-export + 型定義
│   │   ├── PostCard.tsx                 # → topics/_components/PostCard への re-export + SharedPost 型
│   │   ├── CommentCard.tsx              # → topics/_components/CommentCard への re-export + SharedComment 型
│   │   └── AnalysisCard.tsx             # ダッシュボード専用表示カード（SharedAnalysis型・保留中）
│   └── ui/
│       └── button.tsx                   # shadcn/ui コンポーネント
├── context/
│   ├── AuthContext.tsx                  # 認証コンテキスト（httpOnly Cookie + SWR + /api/auth/me・useAuthフック・unread_notifications_count）
│   └── SidebarContext.tsx               # サイドバー開閉・bookmarkRefreshKey・openProModal を管理
├── lib/
│   ├── transforms.ts                    # boolean型変換レイヤー（transformUser/Post/Comment/Reply/Analysis/Topic）（F-3 Phase3）
│   └── utils.ts                         # shadcn/ui utility（cn関数）+ timeAgo（Session 22 共通化）
├── public/                              # SVG等の静的ファイル
├── .env.example
├── .env.local                           # ローカル環境変数（gitignore済み）
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   └── skills/                          # 詳細仕様ファイル群
│       ├── api-spec.md                  # API仕様・認証・boolean注意・型定義
│       ├── design-spec.md               # デザインシステム全定義（Session 49 大幅改修・セマンティックカラー・没デザイン記録含む）
│       ├── directory-map.md             # このファイル
│       ├── deploy-config.md             # Vercel設定・環境変数ルール・CSR/SSR障害記録
│       ├── progress-roadmap.md          # プロジェクト理念・フェーズ定義・全ロードマップ・Gitタグ履歴
│       ├── progress-phase1.md           # Phase 1 完了記録（Laravel Blade版MVP）
│       ├── progress-phase2.md           # Phase 2 完了記録（Next.js移行・Step1〜14）
│       ├── progress-phase3.md           # Phase 3 完了記録（技術改善 B-1〜B-6 / F-1〜F-7）
│       ├── progress-phase4.md           # Phase 4 完了記録（Session 12〜48 overview/index）
│       ├── progress-phase4-s12-s19.md   # Phase 4 記録（Session 12〜19・早期UI改善）
│       ├── progress-phase4-s20-s31.md   # Phase 4 記録（Session 20〜31・UI基準確立・共通コンポーネント化）
│       ├── progress-phase4-s32-s41.md   # Phase 4 記録（Session 32〜41・テキストサイズ・分析UI・スマホ対応）
│       ├── progress-phase4-s42-s48.md   # Phase 4 記録（Session 42〜48・ライトモード・デザインシステム全適用）
│       ├── progress-phase5.md           # Phase 5 進行中記録（Session 50〜）
│       ├── handoff-session52.md         # 最新引継ぎプロンプト（Session 52用）
│       └── handoff-archive/             # 過去セッション引継ぎ（Session 49・50・51）
├── next.config.ts                       # images.remotePatterns を NEXT_PUBLIC_API_BASE_URL から動的生成（Phase 5 Step 2）
├── package.json                         # swr@^2.4.1・sonner・react-hook-form・zod など依存関係
├── tailwind.config.ts
└── tsconfig.json
```

---

## 実装済みページ一覧

| パス | ファイル | SSR/CSR | 状態 |
|---|---|---|---|
| `/` | app/page.tsx | SSR（Phase 3 F-1） | ✅ |
| `/login` | app/login/page.tsx | CSR | ✅ |
| `/register` | app/register/page.tsx | CSR | ✅ |
| `/categories` | app/categories/page.tsx | CSR | ✅ |
| `/categories/[id]` | app/categories/[id]/page.tsx | SSR（Session 53 完全SSR化） | ✅ |
| `/category-list` | app/category-list/page.tsx | SSR（Session 38） | ✅ |
| `/notifications` | app/notifications/page.tsx | CSR | ✅ |
| `/likes` | app/likes/page.tsx | CSR | ✅ |
| `/dashboard` | app/dashboard/page.tsx | CSR | ✅ |
| `/profile` | app/profile/page.tsx | CSR | ✅ |
| `/history` | app/history/page.tsx | CSR | ✅ |
| `/topics/create` | app/topics/create/page.tsx | CSR | ✅ |
| `/topics/[id]` | app/topics/[id]/page.tsx | SSR（Phase 3 F-1） | ✅ |
| `/topics/[id]/edit` | app/topics/[id]/edit/page.tsx | CSR | ✅ |
| `/analyses/[id]` | app/analyses/[id]/page.tsx | SSR（Session 53・Cookie認証） | ✅ |
| `/tools/tree` | app/tools/tree/page.tsx | CSR | ✅ |
| `/tools/matrix` | app/tools/matrix/page.tsx | CSR | ✅ |
| `/tools/swot` | app/tools/swot/page.tsx | CSR | ✅ |

---

## 旧「将来構想」メモ（当時の移行計画・参考）

Phase 2 着手前に想定していたディレクトリ構成。実際はこれより詳細に実装済み。

```
logos-next/
├── app/
│   ├── (auth)/               # 認証 (login/page.tsx, register/page.tsx)
│   ├── dashboard/
│   ├── topics/
│   ├── tools/
│   ├── history/
│   ├── likes/
│   ├── api/                  # Stripe Webhook, AI Proxy等
│   └── page.tsx
├── components/
│   ├── ui/                   # 汎用部品
│   ├── logos/                # トピック関連 (PostCard, CommentCard)
│   └── tools/                # ツール専用 (MatrixTable, TreeNode)
├── actions/                  # サーバーアクション（旧Controller）
├── lib/
│   ├── prisma.ts
│   └── gemini.ts
├── hooks/
└── types/
```

方針メモ: Blade をコンポーネント単位で分割する際は、将来的にReactコンポーネントへ変換しやすいようにロジックを分離する。
