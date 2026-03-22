# LOGOS API仕様（詳細）

## ベースURL
- ローカル: `http://localhost`
- 本番: `https://gs-f04.sakura.ne.jp`
- 環境変数: `process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost"`

## 認証方式
- Laravel Sanctumのトークン認証（APIトークン方式）
- NextAuth.jsは使わない（ユーザー管理の二重化を避けるため）
- VercelとさくらがドメインをまたぐためCookieではなくTokenベース
- トークン保存: localStorage（フェーズ2簡易実装）→ フェーズ3でhttpOnly Cookie化予定

## エンドポイント一覧

### 認証
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| POST | /api/register | 新規登録・トークン発行（name/email/password/password_confirmation） | 不要 |
| POST | /api/login | ログイン・Sanctumトークン発行 | 不要 |
| POST | /api/logout | ログアウト・トークン削除 | 要トークン |

### ユーザー
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/user/me | 認証済みユーザー情報（id/name/email/avatar/is_pro/is_admin/unread_notifications_count） | 要トークン |

### トピック
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/topics | トピック一覧（ページネーション・sort・category・per_page対応） | 不要 |
| GET | /api/topics/{id} | トピック詳細 | 不要 |
| POST | /api/topics | トピック作成（PRO限定・title/content/category_ids/timeline） | 要トークン |
| PUT | /api/topics/{topic} | トピック編集（作成者限定・title/content/category_ids/timeline・手動編集で is_ai:false） | 要トークン |

### エビデンス（情報タブ）
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| POST | /api/topics/{topic}/posts | エビデンス投稿（url/category/comment/is_published）・公開時OGP取得・通知送信・下書き時はスキップ | 要トークン |
| PATCH | /api/posts/{post} | 下書き編集（作成者限定・下書きのみ・本投稿昇格時OGP取得・通知送信） | 要トークン |
| POST | /api/posts/{post}/supplement | 投稿補足（投稿者本人・1回のみ・supplement） | 要トークン |
| DELETE | /api/posts/{post} | 投稿削除（投稿者本人のみ） | 要トークン |
| POST | /api/posts/{post}/like | いいねトグル（liked/likes_count 返却） | 要トークン |

### コメント・返信
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| POST | /api/topics/{topic}/comments | 親コメント投稿（1人1件制限・body） | 要トークン |
| POST | /api/comments/{comment}/reply | 返信投稿（投稿主5件・他1件制限・body） | 要トークン |
| DELETE | /api/comments/{comment} | コメント/返信削除（自分のみ） | 要トークン |
| POST | /api/comments/{comment}/like | コメントいいねトグル（liked/likes_count 返却） | 要トークン |

### 分析ツール
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/user/analyses | 自分の分析一覧（モーダル用） | 要トークン |
| POST | /api/analyses | 分析作成（type/title/data） | 要トークン |
| PUT | /api/analyses/{analysis} | 分析更新 | 要トークン |
| DELETE | /api/analyses/{analysis} | 分析削除（自分のみ） | 要トークン |
| POST | /api/analyses/{analysis}/publish | トピックへ公開（topic_id） | 要トークン |
| POST | /api/analyses/{analysis}/supplement | 分析補足（投稿者本人・1回のみ・supplement） | 要トークン |
| POST | /api/analyses/{analysis}/like | 分析いいねトグル（liked/likes_count 返却） | 要トークン |
| POST | /api/tools/ai-assist | Gemini AI連携プロキシ | 要トークン |

### ブックマーク・その他
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| POST | /api/topics/{topic}/bookmark | ブックマークトグル（bookmarked 返却） | 要トークン |
| GET | /api/user/bookmarks | 保存トピック一覧（上限10件） | 要トークン |
| GET | /api/user/likes | いいね一覧 | 要トークン |
| GET | /api/og?url=... | OGPプロキシ（title/thumbnail_url 返却） | 不要 |
| GET | /api/history | 閲覧履歴（12件ページネーション） | 要トークン |
| GET | /api/notifications | 通知一覧 | 要トークン |
| PATCH | /api/notifications/read-all | 全通知既読 | 要トークン |
| PATCH | /api/notifications/{id}/read | 個別既読 | 要トークン |
| GET | /api/dashboard | ダッシュボード一括取得 | 要トークン |
| GET | /api/profile | プロフィール情報（name_updated_at付き） | 要トークン |
| POST | /api/profile | プロフィール更新（multipart/form-data） | 要トークン |
| PUT | /api/profile/password | パスワード変更 | 要トークン |
| DELETE | /api/profile | アカウント削除 | 要トークン |

### カテゴリ
| メソッド | エンドポイント | 説明 | 認証 |
|---|---|---|---|
| GET | /api/categories | 親カテゴリ＋children階層構造で返却 | 不要 |
| POST | /api/categories | カテゴリ追加（admin限定・name/sort_order/parent_id） | 要トークン（admin） |
| PATCH | /api/categories/{id} | カテゴリ編集（admin限定・name/sort_order） | 要トークン（admin） |
| DELETE | /api/categories/{id} | カテゴリ削除（admin限定） | 要トークン（admin） |

## APIリクエスト例

### 認証が必要なリクエスト
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});
```

### トピック一覧（クエリパラメータ）
```
GET /api/topics?sort=newest&page=1
GET /api/topics?sort=popular&page=1
GET /api/topics?sort=oldest&page=1
GET /api/topics?category={id}&per_page=5
```

## 重要: LaravelのAPI boolean値
- LaravelのAPIはbooleanフィールドを `true/false` ではなく整数の `0/1` で返す
- Next.jsのJSXで条件レンダリングする際は必ず `!!` で明示的にboolean変換すること
  - 正しい: `{!!user.is_admin && <Link>}`
  - バグになる: `{user.is_admin && <Link>}` ← 0がテキスト表示される
- 対象フィールド: `is_admin`, `is_pro` など全てのbooleanフィールド

## AuthUser型定義
```typescript
type AuthUser = {
  id: number;
  name: string;
  email: string;
  is_pro: boolean;   // APIからは 0/1 で返る → !! 変換必須
  is_admin: boolean; // APIからは 0/1 で返る → !! 変換必須
  avatar?: string | null;
  unread_notifications_count?: number;
};
```

## 認証ライブラリ（lib/auth.ts）
- `getToken()` — localStorageからトークン取得
- `setToken(token)` — localStorageにトークン保存
- `removeToken()` — localStorageからトークン削除
- `getAuthHeaders()` — `Authorization: Bearer <token>` ヘッダー生成

## 実装済みバックエンド（logos-new側・参照のみ）
- `app/Http/Controllers/Api/TopicApiController.php`
- `routes/api.php`
- laravel/sanctum ^4.3 インストール済み
- personal_access_tokens テーブル作成済み（ローカル・さくら両方）
- CORS設定済み（Vercelドメイン許可）
