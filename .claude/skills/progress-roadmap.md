# ロードマップ・Gitタグ履歴・プロジェクト理念

最終更新: 2026-03-23（Session 12 Phase 4 開始）

---

## プロジェクト理念

- **目的**: 感情的な「レスバ（不毛な論争）」を防ぎ、エビデンスに基づいた俯瞰的・建設的な議論を促進する。
- **課題感**: ネット上の二重基準、カオスな世論誘導、一喜一憂するだけのニュース消費を是正する。
- **ターゲット**: 知的で論理的な議論を好み、情報を体系的に整理したい層。
- **企画書**: https://drive.google.com/file/d/1pAIJl_2i70py_H3gTF0BthXi46ccvudk/view?usp=sharing

---

## フェーズ定義

| フェーズ | 名称 | 期間 | 状態 |
|---|---|---|---|
| Phase 1 | MVPの磨き込み（Laravel Blade版） | 〜2026-03-19 | ✅ 完了 |
| Phase 2 | フロントエンドのモダン化（Next.js移行） | 2026-03-19〜2026-03-22 | ✅ 完了 |
| Phase 3 | 技術的負債解消・コード品質改善 | 2026-03-22〜2026-03-23 | ✅ 完了 |
| Phase 4 | 集客・マーケティング基盤 | 2026-03-23〜 | 🔄 進行中 |
| Phase 5 | スケールとマネタイズ | 未着手 | 🔲 未着手 |

※ 旧ドキュメントでは「Phase 3」が「集客・マーケティング」として定義されていたが、実際には技術改善（B-1〜B-6・F-1〜F-7）を Phase 3 として実施した。集客・マーケティングは Phase 4 に繰り下げ。

---

## フェーズ別ロードマップ

### Phase 1：MVPの磨き込み（完了 2026-03-19）

- UI/UXの総点検: モーダルのフォームリセット、下書きUIブラッシュアップ
- エッジケースのテスト: PHPUnit 56ケース・126assertions 全グリーン
- 通知機能: いいね・返信・エビデンス追加時の通知。既読管理・ヘッダーバッジUI
- PROアクセスガード: ミドルウェア・Policy・モーダルによる有料機能の保護
- 情報の下書き保存機能: `posts.is_published` カラム追加
- コメント制限ロジックのバックエンド実装: 親コメント1件/トピック、自己返信5回、他者返信1回
- UIバグ修正: x-cloakフラッシュ修正、ログイン画面ロゴ重複修正
- CI/CD: GitHub Actionsによる自動デプロイ構築
- さくらのレンタルサーバーへのデプロイ完了（2026-03-18）

### Phase 2：フロントエンドのモダン化（完了 2026-03-22）

- **ゴール**: Next.js + LaravelのAPI構成でWebが動くこと
- Step1〜14 で全18ページ実装（詳細 → `progress-phase2.md`）
- Blade版との機能差分をゼロに
- **技術方針（2026-03-19確定）**:
  - ZustandやReact Nativeなどフェーズ4以降の要素は今は設計に含めない
  - フェーズ4で完成形を決めるときに困らないよう、特定ライブラリへの過度な依存は避ける
  - 機能要件: ダークモード対応、レスポンシブUI、SPA（画面遷移なしの快適な操作）
  - **認証方針（2026-03-20確定）**: Laravel Sanctumのトークン認証（APIトークン方式）を使う。NextAuth.jsは使わない（ユーザー管理の二重化を避けるため）。VercelとさくらがドメインをまたぐためCookieではなくTokenベース認証。トークン保存はlocalStorage（フェーズ2簡易実装）→フェーズ3でhttpOnly Cookie化

### Phase 3：技術的負債解消（完了 2026-03-23）

- バックエンド改善（B-1〜B-6）・フロントエンド改善（F-1〜F-7）
- LOGOSの思想・機能・UIデザインに影響しない純粋な技術改善
- 詳細 → `progress-phase3.md`

### Phase 4：集客・マーケティング基盤（進行中 2026-03-23〜）

- SEO対策: 適切なHTMLタグ（h1, h2）の使用、メタデータ（OGP設定）
- 表示速度の最適化: 画像の圧縮、不要なコードの削減
- LP作成: LOGOSの魅力（レスバではなく議論、AIサポートなど）を伝える登録用ページ
- KPI設定: 新規登録者数、トピック投稿数、継続率などの計測
- Stripe Webhook受け口のみ実装（決済コードの作り込みはしない）
- トークン認証 → httpOnly Cookie化（セキュリティ向上）

### Phase 5：スケールとマネタイズ（未着手）

- インフラ移行: さくら環境からAWSやVercel等へ。Docker等を用いた本格運用
- 本人確認（eKYC）: TRUSTDOCK連携等による質の高いユーザー層の担保
- 有料課金（Stripe連携）: PRO機能や特定トピック作成権限などのサブスク決済システム実装
- AIの全自動更新: エビデンス投稿時に、AIが自動的に時系列や評価表をアップデートするロジック構築
- Laravel Socialite: Google / X (Twitter) ワンクリック登録（SNSログイン）
- Liquid eKYC / TRUSTDOCK: 本人確認・質の高い議論コミュニティの維持

---

## 技術スタック全体図

### ユーザー層
- 無料ユーザー: ROM専 / コメント可能
- PROユーザー: 分析ツール利用 / トピック作成 / 月額課金

### システム構成（現在）
```
[ユーザー]
    ↓
[Vercel] logos-next（Next.js 16.2.0）
    ↓ API（HTTPS）
[さくらレンタルサーバー] logos-laravel（Laravel 12.x）
    ↓
[MySQL 8.0] mysql3113.db.sakura.ne.jp / gs-f04_logos
```

### システム構成（将来）
```
[ユーザー]
    ↓
[Vercel] logos-next（Next.js）
    ↓ API（HTTPS）
[AWS] logos-laravel（Laravel）
    ↓
[PostgreSQL on AWS RDS]
（WebサーバーはNginxに移行）
```

---

## 重要な注意事項
- DBはMySQLで完結。Supabase等のBaaSは絶対に使用しない。VercelはNext.js専用。

---

## Gitタグ履歴

### logos-next

| タグ | 内容 | 日付 |
|---|---|---|
| v2.0-phase2-complete | Phase2完成・18ページ全実装・Blade↔Next.js差分なし | 2026-03-22 |
| v3.0-phase3-start | Phase3開始・リポジトリ一本化（logos-new→logos-laravel）・編集制約撤廃 | 2026-03-22 |
| v3.1-b1-controller-split | B-1完了・routes/api.php→9コントローラー分割・docs更新 | 2026-03-22 |
| v3.2-f5-swr | F-5完了・SWR導入（AuthContext/useTopicPage/notifications） | 2026-03-22 |
| v3.3-f1f2-ssr-hooks | F-1完了（SSR復帰・Route Handlerプロキシ）・F-2完了（useTopicPage Custom Hook化） | 2026-03-22 |
| v3.4-f3f4-types | F-3完了（boolean transforms.ts）・F-4完了（AnalysisData Discriminated Union） | 2026-03-22 |
| v3.6-f7-shared-components | F-7完了・UserAvatar/LikeButton を components/ に共有化・重複インライン定義60行削除 | 2026-03-23 |
| v3.7-f6-header-sidebar-split | F-6完了・Header/Sidebar を各4/2サブコンポーネントに分割・後方互換re-export維持 | 2026-03-23 |
| v3.8-session9-docs-complete | Session9ドキュメント総仕上げ | 2026-03-23 |
| v4.1-session12-ui-postcard | Phase4開始・PostCard UI改修（YouTube/X SVGフォールバック・lightbox・続きを読む）・PostModal画像添付・タイトル手動入力 | 2026-03-23 |
| v6.57-session41-home-category-tabs | Session41完了・ホームカテゴリタブをピル型横スクロール対応にリデザイン | 2026-04-01 |
| v6.58-session43-before-lightmode | Session43開始・OS追従ダーク/ライトモード実装前 | 2026-04-01 |
| v6.59-session43-before-ui-polish | Session43・ロゴ/タブ/ボタンpolish前 | 2026-04-01 |
| v6.60-session43-before-full-ui-redesign | Session43・全体UIリデザイン前 | 2026-04-01 |
| v6.61-session43-before-topic-redesign | Session43完了・トピックページリデザイン前（次セッション課題） | 2026-04-01 |

### logos-laravel

| タグ | 内容 | 日付 |
|---|---|---|
| v1.0-laravel-only | GitHub Actions動作確認版 | 2026-03-18 |
| v1.0-phase1-complete | Phase1完成・Laravel Blade版本番稼働確認済み | 2026-03-19 |
| v1.1-phase2-step4-complete | Phase2 Step4完了・Sanctum認証API追加済み | 2026-03-20 |
| v3.1-b1-controller-split | B-1完了・routes/api.php 1040行→209行・47エンドポイント9コントローラーに分割 | 2026-03-22 |
| v3.2-b4-ogp-service | B-4完了・OgpService共通化（3箇所の重複ロジックをapp/Services/OgpService.phpに集約） | 2026-03-22 |
| v3.3-b3-form-requests | B-3完了・FormRequest16ファイル作成・全ApiControllerのvalidate()をFormRequestに移行 | 2026-03-22 |
| v3.4-b5-api-resource | B-5完了・AnalysisResource/CategoryResource新規作成・withoutWrapping()設定 | 2026-03-23 |
| v3.5-b6-like-relations | B-6完了・Like::user()/post() belongsTo追加 | 2026-03-23 |
| v4.0-p4-custom-thumbnail | Phase4開始・posts.custom_thumbnailカラム追加・ファイルアップロード対応・StorePostRequest更新 | 2026-03-23 |

---

## リポジトリ一本化記録（2026-03-22）

**背景:** Phase 2 完了（Next.js 18ページ全実装）により、Blade版を守るための編集制約が不要になった。
さらにリポジトリ名が分かりにくく、将来の新セッションで混乱が起きるリスクがあったため整理を実施。

**実施内容:**
- GitHub repo名変更: `logos-new` → `logos-laravel`
- ローカルフォルダ: `~/logos` → `~/logos-laravel`
- ローカル・さくらサーバー両方の `git remote URL` を `logos-laravel` に更新
- **編集制約撤廃**: 「TopicApiController.php と routes/api.php の2ファイルのみ」→「全ファイル自由に編集可」
- **app/Models/ 制約撤廃**: 直接クエリ縛りを解除（通常の Eloquent リレーション追加も可）

**注意（エラー調査時）:**
- Phase 2 以前のgit履歴・コミットメッセージには `logos-new` `~/logos` の表記が残っている（正常）
- 旧パスが履歴に出てきても、現在の実態は `~/logos-laravel` であることに注意
- さくらサーバー上のフォルダは `~/www/logos` のまま（Apache .htaccess が参照しているため意図的に変更せず）

**Gitタグ:** `v3.0-phase3-start`（logos-next）

---

## Phase 2 未対応・将来検討項目

以下は Blade ファイルが存在するが Phase 2 では実装しなかった項目。

| 項目 | Phase 2 で見送った理由 | 将来方針 |
|---|---|---|
| パスワードリセット（`auth/forgot-password.blade.php`, `auth/reset-password.blade.php`） | Blade のログインページにもリンクなく未使用。API エンドポイントも未追加 | Phase 4 以降でメール設定（SMTP）と合わせて検討 |
| メール認証（`auth/verify-email.blade.php`） | `User.php` で `MustVerifyEmail` がコメントアウトされており現在無効 | 本人確認強化フェーズで有効化を検討 |
| パスワード確認（`auth/confirm-password.blade.php`） | Sanctum APIトークン認証フローでは現在使用しない | 高セキュリティ操作（アカウント削除等）の UX 改善時に検討 |
| 分析タイトル編集（`analyses/edit.blade.php`） | Next.js では `/tools/[type]?edit=[id]` でフル編集・上書き保存が可能（Blade より高機能なため対応不要） | 現状の Next.js 実装で十分 |
