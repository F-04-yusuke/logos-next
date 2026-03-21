# logos-next ディレクトリ構成
最終更新: 2026-03-22（Step10 コンポーネント分割反映）

```
logos-next/
├── CLAUDE.md                            # 仕様書メイン（ルール・進捗概要）
├── app/
│   ├── favicon.ico
│   ├── globals.css                      # グローバルCSS（tree-line等カスタムクラス含む）
│   ├── layout.tsx                       # ルートレイアウト（AuthProvider・SidebarProvider + LayoutShell）
│   ├── page.tsx                         # / トピック一覧（CSR・2カラム・カテゴリタブ・ソート・ページネーション）
│   ├── login/
│   │   └── page.tsx                     # /login ログイン画面（Blade忠実再現・eKYC/SNSボタンUI）
│   ├── register/
│   │   └── page.tsx                     # /register ユーザー登録（eKYC/SNS coming soon + 開発用フォーム）
│   ├── categories/
│   │   └── page.tsx                     # /categories カテゴリ（admin: インライン編集CRUD / 一般: グリッド一覧）
│   ├── category-list/
│   │   └── page.tsx                     # /category-list カテゴリ公開グリッド一覧
│   ├── notifications/
│   │   └── page.tsx                     # /notifications 通知一覧（TypeBadge・既読・ページネーション）
│   ├── likes/
│   │   └── page.tsx                     # /likes 参考になった一覧（3タブ: 情報/コメント/分析）
│   ├── dashboard/
│   │   └── page.tsx                     # /dashboard ダッシュボード（5タブ: 投稿/下書き/コメント/分析/トピック）
│   ├── profile/
│   │   └── page.tsx                     # /profile プロフィール編集（アバター・名前クールダウン・パスワード変更・アカウント削除）
│   ├── history/
│   │   └── page.tsx                     # /history 閲覧履歴（日付グループ・YouTube風ラベル・ページネーション）
│   ├── topics/
│   │   ├── create/
│   │   │   └── page.tsx                 # /topics/create トピック作成（PRO限定・カテゴリmax2・timeline行追加削除）
│   │   └── [id]/
│   │       ├── page.tsx                 # /topics/[id] トピック詳細メイン（状態管理・ハンドラー・タブJSX 812行）
│   │       ├── _types.ts                # 型定義（Post/Comment/TopicAnalysis/TopicDetail等）
│   │       ├── _helpers.ts             # API_BASE / timeAgo / formatDateTime
│   │       └── _components/
│   │           ├── UserAvatar.tsx
│   │           ├── LikeButton.tsx
│   │           ├── PostCard.tsx
│   │           ├── CommentCard.tsx
│   │           ├── PostModal.tsx        # エビデンス投稿モーダル（OGPプレビュー含む）
│   │           ├── AnalysisCard.tsx     # typeBadge / AnalysisPreview をエクスポート
│   │           └── AnalysisModal.tsx    # 分析・図解投稿モーダル
│   └── tools/
│       ├── tree/
│       │   └── page.tsx                 # /tools/tree ロジックツリー作成（PRO限定・AIアシスタント・Gemini連携・保存/上書き保存）
│       ├── matrix/
│       │   └── page.tsx                 # /tools/matrix 総合評価表作成（PRO限定・列行追加/削除・スコア集計・AI・保存）
│       └── swot/
│           └── page.tsx                 # /tools/swot SWOT/PEST分析作成（PRO限定・SWOT/PEST切替・AI・保存）
├── components/
│   ├── AppLogo.tsx                      # 共通ロゴコンポーネント
│   ├── Header.tsx                       # ヘッダー（検索・通知バッジ・アバタードロップダウン・スマホメニュー）
│   ├── LayoutShell.tsx                  # /login・/register でHeader/Sidebar非表示制御
│   ├── Sidebar.tsx                      # サイドバー（ナビ・PRO機能・分析ツール・保存トピック動的表示）
│   ├── SidebarAwareLayout.tsx           # サイドバー連動コンテンツ幅調整
│   └── ui/
│       └── button.tsx                   # shadcn/uiコンポーネント
├── context/
│   ├── AuthContext.tsx                  # 認証コンテキスト（Sanctumトークン・useAuthフック・unread_notifications_count）
│   └── SidebarContext.tsx               # サイドバー開閉コンテキスト
├── lib/
│   ├── auth.ts                          # トークン管理（getToken/setToken/removeToken/getAuthHeaders）
│   └── utils.ts                         # shadcn/ui utility
├── public/                              # SVG等の静的ファイル
├── .env.example
├── .env.local                           # ローカル環境変数（gitignore済み）
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   └── skills/                          # 詳細仕様ファイル群
│       ├── api-spec.md                  # API仕様・認証・boolean注意・型定義
│       ├── design-spec.md               # デザイン・カラー・a11y・Blade参照表
│       ├── directory-map.md             # このファイル
│       ├── deploy-config.md             # Vercel設定・CSR/SSR障害記録
│       └── progress.md                  # 進捗・Gitタグ・完了済みステップ
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 実装済みページ一覧

| パス | ファイル | 状態 |
|---|---|---|
| `/` | app/page.tsx | ✅ |
| `/login` | app/login/page.tsx | ✅ |
| `/register` | app/register/page.tsx | ✅ |
| `/categories` | app/categories/page.tsx | ✅ |
| `/category-list` | app/category-list/page.tsx | ✅ |
| `/notifications` | app/notifications/page.tsx | ✅ |
| `/likes` | app/likes/page.tsx | ✅ |
| `/dashboard` | app/dashboard/page.tsx | ✅ |
| `/profile` | app/profile/page.tsx | ✅ |
| `/history` | app/history/page.tsx | ✅ |
| `/topics/create` | app/topics/create/page.tsx | ✅ |
| `/topics/[id]` | app/topics/[id]/page.tsx | ✅ |
| `/tools/tree` | app/tools/tree/page.tsx | ✅ |
| `/tools/matrix` | app/tools/matrix/page.tsx | ✅ |
| `/tools/swot` | app/tools/swot/page.tsx | ✅ |

## 未実装（残作業）

| 優先 | 内容 | 対象ファイル |
|---|---|---|
| 1 | 分析タブの動作確認（AnalysisModal 選択公開・AnalysisCard 表示） | app/topics/[id]/_components/ |
| 2 | 返信投稿UI（返信フォーム） | app/topics/[id]/_components/CommentCard.tsx |
| 3 | 投稿・トピック編集画面 | 未作成 |

---

## Next.js移行計画（将来構想・logos-new CLAUDE.mdより）

```
logos-next/
├── app/
│   ├── (auth)/               # 認証 (login/page.tsx, register/page.tsx)
│   ├── dashboard/            # マイページ (page.tsx)
│   ├── topics/
│   │   ├── page.tsx          # 一覧
│   │   └── [id]/page.tsx     # 詳細
│   ├── tools/                # 有料ツール（PRO）
│   │   ├── tree/page.tsx
│   │   ├── swot/page.tsx
│   │   └── matrix/page.tsx
│   ├── history/
│   ├── likes/
│   ├── api/                  # Stripe Webhook, AI Proxy等
│   ├── layout.tsx
│   └── page.tsx              # トップページ (LP)
├── components/
│   ├── ui/                   # 汎用部品 (Button, Input, Modal)
│   ├── logos/                # トピック関連 (PostCard, CommentCard)
│   └── tools/                # ツール専用 (MatrixTable, TreeNode)
├── actions/                  # サーバーアクション（旧Controller）
│   ├── topicActions.ts
│   ├── toolActions.ts
│   └── aiActions.ts
├── lib/
│   ├── prisma.ts
│   └── gemini.ts
├── hooks/
├── types/
└── public/
```

方針: 現在のBladeをコンポーネント単位で分割する際は、将来的にReactコンポーネントへ変換しやすいようにロジックを分離しておく。
