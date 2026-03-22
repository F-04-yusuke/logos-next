# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 4）

作成: 2026-03-22 / Session 3 完了時点

---

## 前回セッション（Session 3）の完了内容

### B-1: routes/api.php → Controller 分割 ✅ 完了・push 済み

- `routes/api.php`: 1040行 → 209行（-80%）
- 全47エンドポイントを9コントローラーに分割
- `docker exec logos-laravel.test-1 php artisan route:list` で全47ルート確認済み
- Gitタグ: `v3.1-b1-controller-split`（logos-laravel・logos-next 両方に付与・push 済み）

**作成したコントローラー（`~/logos-laravel/app/Http/Controllers/Api/`）:**

| コントローラー | メソッド数 | 主な担当 |
|---|---|---|
| TopicApiController（既存+追加） | 8 | index/show/store/update/destroy/bookmark/timelineGenerate/timelineUpdate |
| PostApiController | 5 | store/like/supplement/update/destroy |
| CommentApiController | 4 | store/reply/destroy/like |
| AnalysisApiController | 10 | show/store/update/destroy/publish/like/supplement/userAnalyses/storeImage/aiAssist |
| CategoryApiController（新規） | 3 | store/update/destroy（管理者専用） |
| NotificationApiController | 3 | index/readAll/read |
| ProfileApiController | 4 | show/update/updatePassword/destroy |
| UserApiController | 4 | me/bookmarks/likes/history |
| DashboardApiController | 1 | index |

**残存クロージャ（意図的・変更不要）:**
- `GET /api/og` — OGP取得（公開・認証不要）
- `POST /api/register` — 新規登録
- `POST /api/login` — ログイン
- `POST /api/logout` — ログアウト
- `GET /api/categories` — カテゴリ公開一覧（fn() 1行）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-laravel | main | v3.1-b1-controller-split | クリーン |
| ~/logos-next | main | v3.1-b1-controller-split | クリーン |

---

## Phase 3 完了済み一覧

| ID | 内容 | 完了 Session |
|---|---|---|
| F-1 | SSR復帰（Route Handler プロキシ） | Session 1 |
| F-2 | Custom Hook化（useTopicPage.ts） | Session 1 |
| B-2 | Topic::analyses() リレーション追加 | Session 2 |
| F-3 | boolean型変換レイヤー（lib/transforms.ts） | Session 2 |
| F-4 | 分析型 Discriminated Union | Session 2 |
| **B-1** | **routes/api.php → 9コントローラー分割** | **Session 3** |

---

## 次セッションの推奨タスク（優先順）

### 第1候補: F-5 — SWR / React Query 導入

**現状の問題:**
- `useEffect + fetch` パターン全体に「キャッシュなし・重複リクエストあり」
- 特に `AuthContext` の `user/me` 呼び出しが複数コンポーネントで重複している
- 認証状態の変化（ログイン・ログアウト）後の即時反映が不安定

**理想の状態:**
- `useSWR('/api/user/me', fetcher)` でキャッシュ・再フェッチ・重複排除を自動化
- ログイン後に `mutate()` で即キャッシュ更新
- パッケージ: `npm install swr`（軽量・React Queryより導入コスト低）

**実装対象（優先順）:**
1. `AuthContext.tsx` の user/me 取得
2. `app/topics/[id]/hooks/useTopicPage.ts` のトピック詳細取得
3. `app/notifications/page.tsx` の通知一覧

**注意:** `NEXT_PUBLIC_API_BASE_URL` ベースのフェッチャーを共通化する必要あり

---

### 第2候補: B-3 — FormRequest クラス化

**現状:** バリデーションが各 Controller メソッド内に `$request->validate([...])` で直書き（B-1 完了で整理はされたが、再利用不可）

**理想:**
```
app/Http/Requests/
├── StorePostRequest.php
├── StoreCommentRequest.php
├── StoreAnalysisRequest.php
└── UpdateProfileRequest.php
```

**進め方:** コントローラーごとに1コミット

---

### 第3候補: B-4 — OgpService 共通化

**現状:** OGP 取得ロジック（`file_get_contents` + `preg_match` パターン）が2箇所に重複
- `PostApiController::store()` 内
- `PostApiController::update()` 内（公開昇格時）
- `GET /api/og` クロージャ（routes/api.php:25）

**理想:** `app/Services/OgpService.php` に抽出して3箇所から呼び出し

---

## 起動手順（確認用）

```bash
# Laravelは既存コンテナが動いているはず
docker ps | grep logos-laravel   # logos-laravel.test-1 が Running ならOK
# 動いていない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js
cd ~/logos-next && npm run dev
# → http://localhost:3000
```

## 検証コマンド

```bash
# ルート一覧確認
docker exec logos-laravel.test-1 php artisan route:list --path=api

# Next.js ビルド確認
cd ~/logos-next && npm run build

# 型チェック
cd ~/logos-next && npx tsc --noEmit
```

---

## 重要な注意事項（ルール再掲）

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは `!!` 変換または `transforms.ts` 経由
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **logos-laravel の全ファイル（app/Models/ 含む）は自由に編集可** ただし本番（さくら）への影響に注意してコミットすること
