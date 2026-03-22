# LOGOS フロントエンド仕様書（logos-next）
最終更新: 2026-03-22（Phase 3 開始・リポジトリ一本化完了）

---

# 0. 最重要ルール

## リポジトリの役割
| リポジトリ | 役割 | 触っていいか |
|---|---|---|
| logos-laravel（~/logos-laravel） | Laravel バックエンド・さくら本番 | **自由に編集可**（さくら本番への影響に注意してコミットすること） |
| logos-next（~/logos-next） | Next.jsフロントエンド | **ここだけ編集する** |

## UI/UXの鉄則（違反厳禁）
- 実装前に必ず `~/logos-laravel/resources/views/[該当ファイル]` を読む（`.claude/skills/design-spec.md` にBladeファイル対応表あり）
- **読まずに実装禁止**。Bladeに存在する機能を勝手に削除・省略・簡略化しない
- ビルド成功だけで完了としない。Bladeとの機能差分を必ず確認する
- logos-laravel側のスキルファイルも引き継ぎ情報として重要。**実装前に以下も読むこと**:
  - `~/logos-laravel/.claude/skills/features.md` — コア機能仕様・返信制限・補足ルール
  - `~/logos-laravel/.claude/skills/security.md` — セキュリティ・コーディングルール・UIトンマナ

## コーディング必須ルール
- LaravelのAPIはboolean値を `0/1` で返す → JSXでは必ず `!!` 変換すること
  - 正しい: `{!!user.is_admin && <Link>}`
  - バグ: `{user.is_admin && <Link>}` ← 0がテキスト表示される
- 一度に編集するファイルは **5ファイル以内**
- `app/Models/` は logos-laravel 側のファイル。編集が必要な場合は直接クエリでも `$model->load()` でも可（さくら本番への影響に注意）
  - 直接クエリ例: `\App\Models\Analysis::where('topic_id', $id)->get()`

---

# 1. システム概要

- フロント: Next.js 16.2.0 + TypeScript + Tailwind CSS + shadcn/ui → Vercel
- バックエンド API: https://gs-f04.sakura.ne.jp（Laravel 12.x + Sanctum）
- ローカル API: http://localhost（Laravel Sail起動が必須）
- adminユーザー: admin@test.com（is_pro・is_admin設定済み）

## 起動手順
```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d   # 先にLaravelを起動
cd ~/logos-next && npm run dev           # Next.js起動
# http://localhost:3000 で確認
```

---

# 2. 開発体制（2026-03-22更新）

**Claude Codeがリードエンジニアとしてメインで動く。**

| 役割 | 担当 |
|---|---|
| コード実装・ファイル編集・git操作・技術的検証（ビルド・curl等） | Claude Code |
| ブラウザで判断が必要な視覚的レビュー（スクショ・UIデザイン確認） | AIチャット（claude.ai）|
| ブラウザ確認・スクショ撮影 | ユーザー |

- ブラウザ確認はユーザーが行う。視覚的レビューが必要な時は `/teleport` を使う
- 技術検証（ビルド・curl・型チェック）はClaude Codeが自己完結する
- 大きな方針転換があった場合は必ずCLAUDE.mdに追記してから実装する

---

# 3. セキュリティ・コーディングルール（絶対厳守）

## セキュリティ
1. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
   - `NEXT_PUBLIC_` をつけるとブラウザに公開され攻撃者に悪用される
   - Next.jsからGeminiを呼ぶ場合は必ずサーバーサイド経由（`app/api/` ルートハンドラかLaravel API経由）
   - フロントエンド（ブラウザで動くコード）にAPIキーを書かない
2. 認証情報・APIキーを絶対に露出させない
3. `.env` ファイルを読み取らない

## コーディング原則
1. **コメント・ロジックの保持**: 既存のコメント（`//`）およびJavaScriptロジックは、明確なバグがない限り削除しない
2. **構造の維持**: UIを変更する場合はFlexbox等レイアウト構造を破壊しない
3. **レスポンシブとアクセシビリティ**: Tailwind CSSレスポンシブ + `aria-hidden`/`aria-label`/`sr-only` を常に意識する
4. **タップ領域**: モバイルで最低44px確保

## UIデザイントンマナ（Bladeと統一・勝手な変更禁止）
- スタイル: YouTube・Gemini・X（Twitter）ライクなモダンで洗練されたデザイン
- カラー: ベース背景 `#131314`、カード背景 `#1e1f20`、ボーダー `border-gray-700`
- コントラスト比: `#131314` 背景に対して文字色 4.5:1 以上
- 余白: 重苦しいボーダー・箱型を避ける。ホバー時 `hover:shadow-md` or `hover:scale-105`
- アバター: 「左丸アイコン ＋ 右に名前＋時間」を全画面で統一
- アイコン: アイコン単独は避け、アイコン＋テキストのペアを基本とする
- 賛否UIは導入しない（2項対立でまとめられないテーマが多いため）
- 重要アクション（いいね・保存ボタン）が隠れていないこと

---

# 4. コア機能ルール（Blade側で設計済み・必ず遵守）

## コメント・返信の制限（`~/logos-laravel/.claude/skills/features.md` §3 参照）
これらの制限はバックエンドバリデーション（CommentController）実装済み。フロントエンドのUIも完全に一致させること。

| 操作 | 制限 | 実装箇所 |
|---|---|---|
| 親コメント（Root） | 1ユーザー・1トピックにつき1件のみ | POST /api/topics/{id}/comments（既実装） |
| 自コメントへの補足（返信） | 投稿者本人は最大5件まで | POST /api/comments/{id}/reply（件数チェック実装済み） |
| 他ユーザーの返信 | 他人のコメントに対して1回のみ | POST /api/comments/{id}/reply（件数チェック実装済み） |
| エビデンス補足 | 投稿者本人が1回のみ（supplementカラム） | POST /api/posts/{id}/supplement（実装済み） |
| 分析補足 | 投稿者本人が1回のみ（supplementカラム） | POST /api/analyses/{id}/supplement（実装済み） |

**UIでの制御方法:**
- CommentCard.tsx: `myRepliesCount` を計算して返信ボタンの表示/非表示を制御
  - 自分のコメント: 自分の返信が5件未満なら表示
  - 他人のコメント: 自分の返信が0件なら表示
- PostCard.tsx / AnalysisCard.tsx: supplement が null かつ投稿者本人なら補足フォームを表示

## 補足（Supplement）UI仕様
- 「＋ 補足を追加する（※1回のみ）」ボタン → フォーム開閉（State管理）
- Bladeの `x-show` 相当を React の useState で制御
- テキストエリアは入力量に応じて自動高さ拡張（`scrollHeight` 計算）
- 投稿後は二度と編集できない（後から編集不可の旨をプレースホルダーに明記）

## エビデンス（情報タブ）ルール
- 公開後の編集は一切不可（補足はsupplementカラムで1回のみ）
- 下書き（is_published=false）中のみ編集可
- 投稿者本人は自分の投稿を削除できる（DELETE /api/posts/{id}）

## コメント・階層UIルール
- 親コメントに補足がツリー状にぶら下がる形式
- 返信は最初から全表示せず「〇件の返信 ▼」のアコーディオンで開閉（useState制御）
- 投稿者本人は自分のコメントを削除できる（DELETE /api/comments/{id}）
- 返信した本人は自分の返信を削除できる

---

# 5. 現在のタスク

## 実装済みページ
- `/` — トピック一覧
- `/login` — ログイン
- `/register` — ユーザー登録 ✅
- `/categories` — カテゴリ（admin: CRUD / 一般: 一覧）✅
- `/category-list` — カテゴリ公開一覧 ✅
- `/topics/create` — トピック作成（PRO限定）✅
- `/topics/[id]` — トピック詳細（3タブ・投稿・コメント・いいね・ブックマーク）✅
- `/topics/[id]/edit` — トピック編集（PRO作成者限定）✅
- `/analyses/[id]` — 分析スタンドアロン閲覧（tree/matrix/swot/image 全4タイプ対応・PRO/作成者が「もっと見る」から遷移）✅
- `/notifications` — 通知一覧 ✅
- `/likes` — 参考になった一覧 ✅
- `/dashboard` — ダッシュボード（5タブ・投稿/下書き/コメント/分析/トピック）✅
- `/profile` — プロフィール編集（アバター・名前クールダウン・パスワード変更・アカウント削除）✅
- `/history` — 閲覧履歴（日付グループ・YouTube風ラベル・ページネーション）✅
- `/tools/tree` — ロジックツリー作成（PRO限定・AIアシスタント・Gemini連携）✅
- `/tools/matrix` — 総合評価表作成（PRO限定・AIアシスタント・Gemini連携）✅
- `/tools/swot` — SWOT/PEST分析作成（PRO限定・AIアシスタント・Gemini連携）✅

## 実装済み機能（追加）
- OGP取得: エビデンス投稿時にtitle/thumbnail_urlを自動取得（公開投稿のみ）
- OGPプレビュー: 投稿モーダルのURL入力後800msデバウンスでサムネイル・タイトルをプレビュー表示
- Sidebar 保存トピック: ブックマーク済みトピックを動的表示（GET /api/user/bookmarks）
- 分析ツールAPI: POST/PUT/DELETE /api/analyses + POST /api/tools/ai-assist（Geminiプロキシ）
- ダッシュボード分析タブ: 実データ表示・編集リンク・削除ボタン
- 分析タブ公開連携: トピック詳細に AnalysisCard 表示・AnalysisModal で保存済みツールから選択公開
- 返信投稿UI: 返信制限（投稿主5件・他1件）・自分のコメント/返信削除
- 補足UI: エビデンス・分析の投稿者が1回のみ補足追加（PostCard/AnalysisCard）
- エビデンス削除: 投稿者が自分の投稿を削除できる
- 通知機能: POST like/reply/bookmark の5エンドポイントに Notification::create() 追加。新型(comment_like/analysis_like/topic_bookmark)はnotifications.typeのENUM拡張マイグレーション適用済み
- 時系列AIアシスタント: トピック詳細のオーナーが「AIで自動生成する」「最新投稿からAI更新」ボタンで時系列をGemini生成・更新できる（POST /api/topics/{id}/timeline/generate・update）
- トピック編集: `/topics/[id]/edit` 実装（PRO作成者限定・タイトル/本文/カテゴリmax2/timeline編集・手動編集行は `is_ai: false` 自動切替）PUT /api/topics/{topic} 追加
- 下書き編集モーダル: ダッシュボード下書きタブの「編集・本投稿」ボタンからモーダル表示（`posts/edit.blade.php` 忠実再現）・PATCH /api/posts/{post}（本投稿昇格時のみOGP取得・通知送信）
- 下書き保存フロー修正: 投稿モーダルから下書き保存→ `/dashboard?tab=drafts` へリダイレクト（トピック詳細には表示しない）・点線枠「準備中」プレースホルダー・タイトル「※本投稿時にサムネイルとタイトルを自動取得します」表示
- オリジナル図解アップロード: AnalysisModal の「オリジナル画像のアップロード」タブが実際に動作（PRO限定・POST /api/topics/{topic}/analyses/image・type:image として分析カードに表示）
- 分析スタンドアロン閲覧: AnalysisCard の「もっと見る」→ PRO ユーザーは `/analyses/[id]` へ遷移（作成者はツール編集ページへ遷移・無料ユーザーは PRO バッジ表示）。`GET /api/analyses/{id}` を認証済みユーザー全員閲覧可に変更し user/topic/likes 情報を付加

## コンポーネント分割済み
- `app/topics/[id]/` → `_types.ts` / `_helpers.ts` / `_components/`（8コンポーネント）に分割（Step10）

## Phase 3 開始（2026-03-22）
- **リポジトリ一本化完了**: logos-new → logos-laravel にリネーム（フォルダ: ~/logos → ~/logos-laravel）
- **編集制約撤廃**: logos-laravel の全ファイル（app/Models/ 含む）が自由に編集可能
- **注意（エラー調査時）**: git履歴・旧コミットに `logos-new` `~/logos` の表記が残るが現在の実態は `~/logos-laravel`
- さくらサーバー上のフォルダは `~/www/logos` のまま（Apache .htaccess が参照しているため意図的に変更せず）
- Gitタグ: `v3.0-phase3-start`（logos-next）

## 未実装（残作業）
- 現時点で主要な未実装ページ・機能はなし。Phase 3 の内容は §5「次フェーズ構想」と `.claude/skills/roadmap.md` を参照。

## Phase 2 未対応・将来検討項目
以下は Blade ファイルが存在するが Phase 2 では実装しなかった項目。将来のフェーズで導入を検討する。

| 項目 | Phase 2 で見送った理由 | 将来方針 |
|---|---|---|
| パスワードリセット（`auth/forgot-password.blade.php`, `auth/reset-password.blade.php`） | Blade のログインページにもリンクなく未使用。API エンドポイントも未追加 | Phase 3 以降でメール設定（SMTP）と合わせて検討 |
| メール認証（`auth/verify-email.blade.php`） | `User.php` で `MustVerifyEmail` がコメントアウトされており現在無効 | 本人確認強化フェーズで有効化を検討 |
| パスワード確認（`auth/confirm-password.blade.php`） | Sanctum APIトークン認証フローでは現在使用しない | 高セキュリティ操作（アカウント削除等）の UX 改善時に検討 |
| 分析タイトル編集（`analyses/edit.blade.php`） | Next.js では `/tools/[type]?edit=[id]` でフル編集・上書き保存が可能（Blade より高機能なため対応不要） | 現状の Next.js 実装で十分 |

## Vercel手動設定（未完了・ユーザーが行う）
- 環境変数 `NEXT_PUBLIC_API_BASE_URL=https://gs-f04.sakura.ne.jp` をVercelダッシュボードで設定

---

# 6. スキルファイル（詳細参照先）

## logos-next（本リポジトリ）
| ファイル | 内容 |
|---|---|
| `.claude/skills/api-spec.md` | API全仕様・認証・エンドポイント・boolean注意・型定義 |
| `.claude/skills/design-spec.md` | デザイン・カラー・レスポンシブ・a11y・Blade対応表（全ページ） |
| `.claude/skills/directory-map.md` | ディレクトリ構成・未実装ページ一覧・将来構想 |
| `.claude/skills/deploy-config.md` | Vercel設定・環境変数ルール・CSR/SSR障害記録 |
| `.claude/skills/progress.md` | 進捗・完了済みステップ・Gitタグ履歴 |
| `.claude/skills/phase3-improvements.md` | **Phase 3 技術改善計画**（SSR復帰・Controller分割・CustomHook・型改善等・優先度付き） |

## logos-laravel（バックエンド・必要に応じて参照）
| ファイル | 内容 |
|---|---|
| `~/logos-laravel/.claude/skills/features.md` | コア機能仕様・返信制限・補足ルール・コントローラー一覧 |
| `~/logos-laravel/.claude/skills/security.md` | セキュリティ・コーディングルール・UIトンマナ詳細 |
| `~/logos-laravel/.claude/skills/pro-tools.md` | PRO機能・分析ツール・通知・決済方針 |
| `~/logos-laravel/.claude/skills/infra.md` | さくら本番環境・ローカル開発・GitHub Actions |
