# logos-next ディレクトリ構成

```
logos-next/
├── CLAUDE.md                            # 仕様書メイン（スリム版）
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                       # ルートレイアウト（AuthProvider・SidebarProvider + LayoutShell）
│   ├── page.tsx                         # トピック一覧（実装済み・CSR）
│   ├── login/
│   │   └── page.tsx                     # ログイン画面（実装済み）
│   ├── register/
│   │   └── page.tsx                     # ユーザー登録（実装済み・eKYC/SNS coming soon）
│   ├── categories/
│   │   └── page.tsx                     # カテゴリ（admin: CRUD / 一般: グリッド一覧）
│   └── topics/
│       ├── create/
│       │   └── page.tsx                 # トピック作成（PRO限定・実装済み）
│       └── [id]/
│           └── page.tsx                 # トピック詳細（CSR骨格・タブ詳細は未実装）
├── components/
│   ├── AppLogo.tsx                      # 共通ロゴコンポーネント
│   ├── Header.tsx                       # ヘッダー（実装済み）
│   ├── LayoutShell.tsx                  # /login・/register でHeader/Sidebar非表示制御
│   ├── Sidebar.tsx                      # サイドバー（実装済み）
│   ├── SidebarAwareLayout.tsx           # サイドバー連動コンテンツ幅調整
│   └── ui/
│       └── button.tsx                   # shadcn/uiコンポーネント
├── context/
│   ├── AuthContext.tsx                  # 認証コンテキスト（useAuthフック）
│   └── SidebarContext.tsx              # サイドバー開閉コンテキスト
├── lib/
│   ├── auth.ts                          # トークン管理（getToken/setToken/removeToken/getAuthHeaders）
│   └── utils.ts
├── public/                              # SVG等の静的ファイル
├── .env.example
├── .env.local                           # ローカル環境変数（gitignore済み）
├── .claude/
│   ├── settings.json
│   ├── settings.local.json
│   └── skills/                          # 詳細仕様ファイル群
│       ├── api-spec.md                  # API仕様・認証・boolean注意
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

## 未実装ページ（実装優先順）

| 優先 | パス | 作成ファイル | 参照Blade |
|---|---|---|---|
| 1 | /topics/[id] 強化 | app/topics/[id]/page.tsx | resources/views/topics/show.blade.php |
| 2 | /notifications | app/notifications/page.tsx | resources/views/notifications/index.blade.php |
| 3 | /dashboard | app/dashboard/page.tsx | resources/views/dashboard.blade.php |
| 4 | /profile | app/profile/page.tsx | resources/views/profile/edit.blade.php |
| 5 | /history | app/history/page.tsx | resources/views/history/index.blade.php |
| 6 | /likes | app/likes/page.tsx | resources/views/likes/index.blade.php |
| 7 | /tools/tree | app/tools/tree/page.tsx | resources/views/tools/tree.blade.php |
| 7 | /tools/matrix | app/tools/matrix/page.tsx | resources/views/tools/matrix.blade.php |
| 7 | /tools/swot | app/tools/swot/page.tsx | resources/views/tools/swot.blade.php |

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
