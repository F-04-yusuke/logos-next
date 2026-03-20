@AGENTS.md

# LOGOS フロントエンド仕様書（logos-next）
最終更新: 2026-03-20

---

# 0. 最重要ルール（必ず最初に読むこと）

## リポジトリの役割
| リポジトリ | 役割 | 触っていいか |
|---|---|---|
| logos-new（~/logos） | Laravel Blade版・さくら本番・参照専用 | **絶対に編集・push禁止** |
| logos-next（~/logos-next） | Next.jsフロントエンド | **ここだけ編集する** |

## Cursorの使い分け
- Cursor1（~/logos）: Laravel版Bladeの参照専用。`cat`で読むのみ
- Cursor2（~/logos-next）: **Claude Codeはここで起動・作業する**

## UI/UXの鉄則
- 実装前に必ず `cat ~/logos/resources/views/layouts/[該当ファイル]` で Laravel版を読む
- 読まずに実装禁止
- 勝手なデザイン変更・簡略化・削除禁止
- 実装後は必ず localhost:3000 でブラウザ確認 → スクショをclaude.aiに送る
- ビルド成功だけで完了としない

---

# 1. システム構成

```
[ユーザー]
    ↓
[Vercel] logos-next（本リポジトリ）
    ↓ API（HTTPS）
[さくらレンタルサーバー] logos-new（Laravel）
    ↓
[MySQL] mysql3113.db.sakura.ne.jp / gs-f04_logos
```

## フロントエンド（本リポジトリ）
- フレームワーク: Next.js 16.2.0 + TypeScript
- スタイル: Tailwind CSS + shadcn/ui
- デプロイ先: Vercel
- GitHub: https://github.com/F-04-yusuke/logos-next
- Vercelデプロイ: mainブランチpushで自動反映

## バックエンド（logos-new・触らない）
- フレームワーク: Laravel 12.x
- デプロイ先: さくらレンタルサーバー
- URL: https://gs-f04.sakura.ne.jp
- GitHub: https://github.com/F-04-yusuke/logos-new
- デプロイ: GitHub Actions（mainブランチpushで自動反映）
- adminユーザー: admin@test.com（is_pro・is_admin設定済み）

---

# 2. 環境変数

## ローカル（.env.local）
```
NEXT_PUBLIC_API_BASE_URL=http://localhost
```

## Vercel（ダッシュボードから手動設定）
```
NEXT_PUBLIC_API_BASE_URL=https://gs-f04.sakura.ne.jp
```

## 注意事項
- `NEXT_PUBLIC_` をつけた変数はブラウザに公開される
- Gemini APIキー等の秘密情報には絶対に `NEXT_PUBLIC_` をつけない
- サーバーサイド専用の変数は `NEXT_PUBLIC_` なしで定義する

---

# 3. ローカル開発の起動手順

```bash
# 1. Laravelを起動（APIを叩くため必須・必ず先に起動）
cd ~/logos
./vendor/bin/sail up -d

# 2. Next.jsを起動
cd ~/logos-next
npm run dev

# 3. ブラウザで確認
# http://localhost:3000
```

---

# 4. Laravel API仕様

## 認証
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| POST | /api/login | ログイン・Sanctumトークン発行 | 不要 |
| POST | /api/logout | ログアウト・トークン削除 | 要トークン |

## ユーザー
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/user/me | 認証済みユーザー情報 | 要トークン |

## トピック
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/topics | トピック一覧（ページネーション） | 不要 |
| GET | /api/topics/{id} | トピック詳細 | 不要 |

## 認証方式
- Laravel Sanctumのトークン認証（APIトークン方式）
- NextAuth.jsは使わない（ユーザー管理の二重化を避けるため）
- VercelとさくらがドメインをまたぐためCookieではなくTokenベース
- トークン保存: localStorage（フェーズ2簡易実装）

## リクエスト例
```typescript
// 認証が必要なAPIリクエスト
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
```

## Laravel APIのboolean値に関する注意（2026-03-21追記）
- LaravelのAPIはbooleanフィールドを true/false ではなく整数の 0/1 で返す
- Next.jsのJSXで条件レンダリングする際は必ず !! で明示的にboolean変換すること
  例: {!!user.is_admin && <Link>} ← 正しい
  例: {user.is_admin && <Link>}   ← 0がテキスト表示されるバグになる
- 対象フィールド: is_admin, is_pro など全てのbooleanフィールド

---

# 5. Next.jsディレクトリ構成

```
logos-next/
├── CLAUDE.md
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx           # ルートレイアウト（AuthProvider・Sidebar・Header含む）
│   ├── page.tsx             # トピック一覧
│   ├── login/
│   │   └── page.tsx         # ログイン画面
│   └── topics/
│       └── [id]/
│           └── page.tsx     # トピック詳細
├── components/
│   ├── AppLogo.tsx          # 共通ロゴコンポーネント
│   ├── Header.tsx           # ヘッダー（navigation.blade.phpを移植）
│   ├── Sidebar.tsx          # サイドバー（sidebar.blade.phpを移植）※未実装
│   └── ui/
│       └── button.tsx       # shadcn/uiコンポーネント
├── context/
│   └── AuthContext.tsx      # 認証コンテキスト（useAuthフック）
├── lib/
│   ├── auth.ts              # トークン管理（getToken/setToken/removeToken）
│   └── utils.ts
├── public/                  # SVG等の静的ファイル
├── .env.example
├── .env.local               # ローカル環境変数（gitignore済み）
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Laravel版の対応Bladeファイル（参照先）
| Next.jsファイル | 参照するBladeファイル |
|---|---|
| components/Header.tsx | ~/logos/resources/views/layouts/navigation.blade.php |
| components/Sidebar.tsx | ~/logos/resources/views/layouts/sidebar.blade.php |
| app/login/page.tsx | ~/logos/resources/views/auth/login.blade.php |
| app/page.tsx | ~/logos/resources/views/topics/index.blade.php |
| app/topics/[id]/page.tsx | ~/logos/resources/views/topics/show.blade.php |

---

# 6. デザイン仕様

## カラー
- ベース背景: `#131314`
- カード等要素の背景: `#1e1f20`
- ボーダー: `border-gray-700`

## デザイン基準
- YouTube・Gemini・X（Twitter）ライクなモダンで洗練されたデザイン
- ダークモード固定
- 余分なボーダー・箱型デザインは避ける
- ホバー時: `hover:shadow-md` または `hover:scale-105`

## レスポンシブ
- モバイルファーストで実装
- sm: 640px / md: 768px / lg: 1024px

## アクセシビリティ
- aria-hidden・aria-label等を必ず付ける
- スクリーンリーダー対応（sr-onlyクラス活用）
- タップ領域は最低44px確保

---

# 7. Gitタグ履歴

## logos-next（本リポジトリ）
| タグ | 内容 | 日付 |
|---|---|---|
| （Step3作り直し完了後に打つ） | | |

## logos-new（参照用・バックエンド）
| タグ | 内容 | 日付 |
|---|---|---|
| v1.0-laravel-only | GitHub Actions動作確認版 | 2026-03-18 |
| v1.0-phase1-complete | Phase1完成・Laravel Blade版本番稼働確認済み | 2026-03-19 |
| v1.1-phase2-step4-complete | Phase2 Step4完了・Sanctum認証API追加済み | 2026-03-20 |

---

# 8. 開発進捗

## 完了済み（logos-new側・バックエンド）
- GET /api/topics（トピック一覧・ページネーション）
- GET /api/topics/{id}（トピック詳細）
- GET /api/user/me（auth:sanctum）
- POST /api/login・POST /api/logout
- laravel/sanctum ^4.3インストール済み
- personal_access_tokensテーブル作成済み
- CORS設定済み（Vercelドメイン許可）

## 現在のタスク（優先順）
1. 通知バッジ実装（未読数 > 0 の時のみ表示）
   - /api/user/me のレスポンスに unread_notifications_count を追加
   - logos-newのroutes/api.phpを修正（このチャットで確認済み・安全）
   - 参照: ~/logos/resources/views/layouts/navigation.blade.php
2. Vercel環境変数 NEXT_PUBLIC_API_BASE_URL を追加
   - https://vercel.com ダッシュボードから手動設定
   - 値: https://gs-f04.sakura.ne.jp
3. サイドバー実装
   - 参照: ~/logos/resources/views/layouts/sidebar.blade.php

---

# 9. Vercelデプロイ設定

## 接続情報
- GitHubリポジトリ: F-04-yusuke/logos-next
- ブランチ: main（pushで自動デプロイ）
- フレームワーク: Next.js（自動検出）
- Root Directory: /（ルートのまま）

## 環境変数（Vercelダッシュボードで設定・コードに書かない）
| 変数名 | 値 | 備考 |
|---|---|---|
| NEXT_PUBLIC_API_BASE_URL | https://gs-f04.sakura.ne.jp | 本番API URL |

## デプロイ時の注意
- `npm run build` がローカルで通ることを確認してからpushする
- TypeScriptの型エラーはビルドエラーになるため必ず解消する
- 環境変数が未設定だとAPIリクエストが全て失敗する
- Vercelの環境変数変更後は再デプロイが必要

---

# 10. AI役割分担（厳守）

- claude.ai（このチャット）: 設計判断・UIレビュー・エラーデバッグ・スクショ確認・方針確認
- Claude Code（CLI）: コード実装・ファイル編集・git操作・コマンド実行
- **UIの変更は必ずclaude.aiチャットで確認してから実装する**
- 実装完了後は必ずlocalhost:3000でブラウザ確認 → スクショをclaude.aiに送る

## Claude Codeへの指示原則
1. 実装前に必ず `cat ~/logos/resources/views/layouts/[該当ファイル]` でLaravel版を読む
2. Laravel版のデザイン・レスポンシブ・アクセシビリティを忠実移植
3. 勝手な簡略化・削除禁止
4. 一度に編集するファイルは5ファイル以内
5. ~/logos は読むだけ・編集・pushは絶対禁止

---

# 11. 新チャット開始時のプロンプト（毎回これを使う）

```
あなたは「リードエンジニア兼PM」としてLOGOSのフェーズ2開発をサポートしてください。
添付のCLAUDE.mdが最新の仕様書です。必ず最初に熟読してください。

【重要】
- 開発対象: ~/logos-next（Next.jsフロントエンドのみ）
- 参照専用: ~/logos（Laravel Blade版・UIUXの確認用・編集禁止）
- バックエンドAPI: https://gs-f04.sakura.ne.jp

【ローカル起動順序（必ず守ること）】
1. cd ~/logos && ./vendor/bin/sail up -d
2. cd ~/logos-next && npm run dev
3. http://localhost:3000 で確認

【現在のタスク】
CLAUDE.mdの「現在のタスク」セクションを参照すること
```
