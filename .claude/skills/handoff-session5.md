# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 5）

作成: 2026-03-22 / Session 4 完了時点

---

## 前回セッション（Session 4）の完了内容

### F-5: SWR 導入 ✅ 完了・push 済み

`npm install swr@^2.4.1` 済み。以下3ファイルを移行。

| ファイル | 変更内容 |
|---|---|
| `context/AuthContext.tsx` | useState+useEffect → useSWR("auth-user", fetchUser) |
| `app/topics/[id]/hooks/useTopicPage.ts` | useSWR(url, {fallbackData: initialTopic}) + updateTopic ヘルパー |
| `app/notifications/page.tsx` | useSWR(user?url:null) ページ依存キー |

**主な改善:**
- `revalidateOnFocus: true` → タブ復帰時に通知数・通知一覧が自動更新
- SSR の `initialTopic` は `fallbackData` で即表示 → バックグラウンドで auth 付き再フェッチ
- `logout` → `mutate(null, {revalidate:false})` で即キャッシュクリア
- 検証: `npm run build` × 3回通過・TypeScriptエラーなし

**⚠️ ブラウザ動作確認が未実施（要ユーザー確認）:**
- ログイン後に user/me が取得されるか
- タブを離れて戻ったときに通知数が更新されるか
- ログアウト後に即座に画面が切り替わるか

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v3.2-f5-swr | クリーン |
| ~/logos-laravel | main | v3.1-b1-controller-split | クリーン |

---

## Phase 3 完了済み一覧

| ID | 内容 | 完了 Session |
|---|---|---|
| F-1 | SSR復帰（Route Handler プロキシ） | Session 1 |
| F-2 | Custom Hook化（useTopicPage.ts） | Session 1 |
| B-2 | Topic::analyses() リレーション追加 | Session 2 |
| F-3 | boolean型変換レイヤー（lib/transforms.ts） | Session 2 |
| F-4 | 分析型 Discriminated Union | Session 2 |
| B-1 | routes/api.php → 9コントローラー分割 | Session 3 |
| **F-5** | **SWR 導入（AuthContext/useTopicPage/notifications）** | **Session 4** |

---

## 次セッションの推奨タスク

### 第1候補: B-4 — OgpService 共通化（軽い・先にやる）

**なぜ先か:** 1サービスクラスを作るだけで完結。コスト低・リスク低。

**現状の問題:** OGP取得ロジック（`file_get_contents` + `preg_match`）が3箇所に重複
1. `PostApiController::store()` — 公開投稿時
2. `PostApiController::update()` — 下書き→本投稿昇格時
3. `GET /api/og` クロージャ（routes/api.php:25付近）

**実装内容:**
```php
// app/Services/OgpService.php（新規作成）
class OgpService {
    public static function fetch(string $url): array
    // ['title' => string|null, 'thumbnail_url' => string|null] を返す
}
```
- PostApiController の2箇所で `OgpService::fetch($url)` を呼ぶ
- routes/api.php の /og クロージャも `OgpService::fetch()` を呼ぶ
- 合計: 新規1ファイル + 既存2ファイル修正

**検証方法:** `docker exec logos-laravel.test-1 php artisan route:list --path=api/og` でルート確認・ビルド確認

---

### 第2候補: B-3 — FormRequest クラス化（重い・専用セッション推奨）

**なぜ後か:** 9コントローラー分のバリデーションを FormRequest に切り出す大規模作業。

**現状の問題:** バリデーションが各コントローラーメソッドに直書きで再利用不可
```php
// 現状: 各メソッド内に散在
$data = $request->validate([
    'url' => 'required|url|max:2048',
    'category' => 'required|string|in:...',
    ...
]);
```

**実装内容:**
```
app/Http/Requests/
├── StorePostRequest.php     ← PostApiController::store
├── UpdatePostRequest.php    ← PostApiController::update
├── StoreCommentRequest.php  ← CommentApiController::store
├── StoreAnalysisRequest.php ← AnalysisApiController::store
├── UpdateAnalysisRequest.php
├── UpdateProfileRequest.php ← ProfileApiController::update
├── UpdatePasswordRequest.php
└── StoreCategoryRequest.php ← CategoryApiController
```

**B-3 の注意点:**
- コントローラーごとに1コミットで進める（8コミット程度）
- `$request->validate([...])` → `StorePostRequest $request` に変更するだけ（ロジック変更なし）
- 検証: 各コミット後に `php artisan route:list` でルート確認

---

## 起動手順（確認用）

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # logos-laravel.test-1 が Running ならOK

# Next.js
cd ~/logos-next && npm run dev
# → http://localhost:3000
```

## 検証コマンド

```bash
# Next.js ビルド確認
cd ~/logos-next && npm run build

# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Laravel ルート確認
docker exec logos-laravel.test-1 php artisan route:list --path=api
```

---

## 重要な注意事項（ルール再掲）

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは `!!` 変換または `transforms.ts` 経由
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **logos-laravel の全ファイル（app/Models/ 含む）は自由に編集可** ただし本番（さくら）への影響に注意
