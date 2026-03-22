# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 7）

作成: 2026-03-22 / Session 6 完了時点

---

## 前回セッション（Session 6）の完了内容

### B-3: FormRequest クラス化 ✅ 完了・push 済み

`app/Http/Requests/Api/` に16ファイルを新規作成し、全 ApiController のバリデーションを FormRequest に移行。

| コミット | 対象コントローラー | 作成ファイル |
|---|---|---|
| 1 | PostApiController | StorePostRequest / UpdatePostRequest / SupplementRequest（Post+Analysis共用） |
| 2 | CommentApiController | StoreCommentRequest（store/reply共用） |
| 3 | AnalysisApiController part1 | StoreAnalysisRequest / UpdateAnalysisRequest |
| 4 | AnalysisApiController part2 | PublishAnalysisRequest / StoreAnalysisImageRequest / AiAssistRequest |
| 5 | ProfileApiController | UpdateProfileRequest / UpdatePasswordRequest / DestroyProfileRequest |
| 6 | CategoryApiController | StoreCategoryRequest / UpdateCategoryRequest |
| 7 | TopicApiController | StoreTopicRequest / UpdateTopicRequest |

**特記事項:**
- `SupplementRequest` は PostApiController::supplement と AnalysisApiController::supplement で共用
- `UpdateProfileRequest` は `$canChangeName` 条件を `rules()` 内で `$this->user()` を使って処理
- `StoreCommentRequest` は CommentApiController::store と ::reply の両方で共用

**検証済み（2026-03-22）:**
- ✅ 全7コミット後に `php artisan route:list --path=api` でルート確認
- ✅ `curl -X POST http://localhost/api/topics` に空ボディ送信 → 422 バリデーションエラー正常返却
- **Gitタグ**: `v3.3-b3-form-requests`（logos-laravel push済み）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v3.2-f5-swr | クリーン |
| ~/logos-laravel | main | v3.3-b3-form-requests | クリーン |

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
| F-5 | SWR 導入（AuthContext/useTopicPage/notifications） | Session 4 |
| B-4 | OgpService 共通化 | Session 5 |
| **B-3** | **FormRequest クラス化（16ファイル・全ApiController）** | **Session 6** |

---

## 次セッションの候補タスク

Phase 3 の主要タスク（B-1〜B-4・F-1〜F-5）は全て完了。残りは低優先度項目のみ。

### 低優先度候補（次フェーズ検討）

| ID | 内容 | コスト |
|---|---|---|
| B-5 | ApiResource クラスでレスポンス形式を統一 | 中（全Controller影響） |
| B-6 | Like モデルの逆向きリレーション追加 | 低 |
| F-6 | Header.tsx・Sidebar.tsx の細分化 | 高 |
| F-7 | 共有コンポーネントの整理 | 高 |

**次セッションで実施するか、新しいフェーズ（Phase 4）として計画するかはユーザーと相談する。**

---

## 起動手順（確認用）

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # logos-laravel.test-1 が Running ならOK
# 起動していない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

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
6. **`migrate:fresh`・`db:wipe`・`migrate:rollback`・`sqlite切り替え` は絶対に実行しない**
