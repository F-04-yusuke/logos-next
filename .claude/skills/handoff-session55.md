# LOGOSプロジェクト 引継ぎプロンプト（Session 55）

作成: 2026-04-03 / Session 54 完了時点

---

## Session 54 完了内容

### ① `profile/page.tsx` useEffect 不要再フェッチ修正

`app/profile/page.tsx:445` の `useEffect` deps に `user` が含まれていたため、
プロフィール保存後に `updateUser()` → AuthContext `user` 更新 → useEffect 再実行 → `/profile` 再フェッチ
という不要な二重フェッチが発生していた問題を修正。

**修正:** `hasFetched` ref を追加。`hasFetched.current` チェックで初回フェッチのみ実行し、
`user` が変化しても再フェッチしない。

```typescript
const hasFetched = useRef(false);

useEffect(() => {
  if (authLoading) return;
  if (!user) { router.replace("/login"); return; }
  if (hasFetched.current) return;
  hasFetched.current = true;
  fetch(`${PROXY_BASE}/profile`) ...
}, [authLoading, user, router]);
```

### ② アバター自動リサイズ実装（Laravel 側）

**インストール:** `intervention/image` v4.0.0（`composer require intervention/image`）

**変更:** `app/Http/Controllers/Api/ProfileApiController.php` の `update()` メソッド

```php
// 変更前
$path = $request->file('avatar')->store('avatars', 'public');
$user->avatar = $path;

// 変更後
$manager = new ImageManager('gd');
$image = $manager->read($request->file('avatar')->getRealPath());
$image->scaleDown(400, 400);
$encoded = $image->encode(new JpegEncoder(85));
$filename = 'avatars/' . uniqid() . '.jpg';
Storage::disk('public')->put($filename, (string) $encoded);
$user->avatar = $filename;
```

- どんな大きな画像をアップしても最大 400×400px・JPEG 85品質に圧縮
- `EncodedImage` は `Stringable` 実装済みのため `(string)` キャストで文字列化
- GD ドライバー使用（さくら PHP 8.3・Sail PHP 8.5 両方で動作確認済み）

**本番適用済み（Session 54）:** `git pull` + `composer install` + `config:cache` + `route:cache` 完了

**Git タグ（Session 54）:**
- `v7.10-session54-before-profile-fix`（着手前）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v7.10-session54-before-profile-fix` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン（intervention/image 追加済み） |

---

## Session 55 タスク（優先順）

### Phase 5 Step 4 候補

| 優先度 | 項目 | 備考 |
|---|---|---|
| 高 | **Laravel Socialite: Google / X ログイン** | 導入コスト: 3〜3.5セッション（Session 54 で調査済み） |
| 高 | SEO対策（h1/h2整備・OGP設定） | Next.js metadata API で実装 |
| 高 | LP作成 | トップ `/` をランディングページ化（登録誘導） |
| 中 | AnalysisCard 抜本的改革（アバターロジック共通化含む） | `analyses/[id]` と `AnalysisCard` の描画コード重複解消 |
| 中 | Stripe Webhook 受け口実装 | 最小実装（受け取るだけ） |
| 中 | パスワードリセット | SMTP設定（さくら or SendGrid）と合わせて実装 |
| 低 | メール認証 | 本人確認強化フェーズで有効化 |
| 低 | KPI設定 | |

### Laravel Socialite 導入の設計メモ（Session 54 調査結果）

**最大の難所:** Vercel（Next.js）+ さくら（Laravel）の跨りドメイン構成でのトークン橋渡し。
推奨方式は **一時コード（one-time code）経由**:

```
1. Laravelコールバック → DB に短命 one-time code を保存（5分TTL）
2. https://vercel.app/auth/callback?code=XXXX にリダイレクト
3. Next.js が code を Laravel に POST → Sanctum トークンを受け取る
4. code を即削除
```

**必要な作業:**
- Laravel: `composer require laravel/socialite` + `config/services.php` + マイグレーション（`google_id`・`twitter_id` カラム追加・`password` nullable化）+ `SocialAuthController`
- Next.js: login ページにボタン追加 + `/auth/callback` ページ実装
- SNSのみユーザーはパスワードがnull → `PasswordSection` の条件分岐対応が必要
- X(Twitter): Developer App 申請（無料プランあり）+ OAuth 2.0 Callback URL 設定

---

## 技術的負債 全リスト（Session 54 時点）

| 優先度 | 項目 | ステータス |
|---|---|---|
| ✅ 完了 | httpOnly Cookie 化 | Session 50 |
| ✅ 完了 | React Hook Form + Zod（login/register） | Session 50 |
| ✅ 完了 | Dead code 削除（旧 Route Handler・lib/auth・lib/proxy-fetch） | Session 51 |
| ✅ 完了 | Sonner 導入（3ツールページ） | Session 51 |
| ✅ 完了 | next/image 移行（6ファイル）| Session 51 |
| ✅ 完了 | アバター `fill` → 明示サイズ・imageSizes 追加・unoptimized:isDev | Session 52 |
| ✅ 完了 | アバター不一致修正（updateUser・cache:no-store・globalMutate） | Session 52 |
| ✅ 完了 | /analyses/[id] SSR 化 | Session 53 |
| ✅ 完了 | /categories/[id] SSR 化 | Session 53 |
| ✅ 完了 | profile useEffect 不要再フェッチ修正（hasFetched ref） | Session 54 |
| ✅ 完了 | アバター自動リサイズ（Laravel 側・intervention/image v4） | Session 54 |
| 高 | SEO対策 | 未着手 |
| 高 | LP作成 | 未着手 |
| 高 | Laravel Socialite（Google/X ログイン） | 未着手 |
| 中 | AnalysisCard 抜本的改革（アバターロジック共通化含む） | 未着手 |
| 中 | Stripe Webhook | 未着手 |
| 中 | パスワードリセット | 未着手 |
| 低 | メール認証 | 未着手 |
| 低 | KPI設定 | 未着手 |

### 既知の残存技術的負債（対応不要・記録のみ）

- `notifications/page.tsx`・`AnalysisCard.tsx` のアバター表示ロジックが `UserAvatar` と重複 → AnalysisCard 抜本改革時に合わせて解消

---

## 起動手順

```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d
cd ~/logos-next && npm run dev
# → http://localhost:3000

# hydration error が出た場合
cd ~/logos-next && rm -rf .next && npm run dev
```

## 検証コマンド

```bash
cd ~/logos-next && npx tsc --noEmit
cd ~/logos-next && npm run build
```

---

## 重要ルール再掲

1. **着手前に必ずタグを打つ**: `git tag v7.XX-sessionYY-before-XXX && git push origin ...`（コードを変更するすべての回答で毎回・1回答1タグ）
2. **Blade 参照ルール**: 新機能追加・未実装ページ移植 → 必ず先に Blade を読む / 技術的リファクタリング・UIデザイン → 不要（CLAUDE.md の表を参照）
3. **boolean 変換**: Laravel API は `0/1` で返す → JSX で必ず `!!` 変換
4. **一度に編集するファイルは 5 ファイル以内**
5. **Gemini API キーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL 終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
8. **hydration error**: `rm -rf .next && npm run dev` で解消
9. **勝手な進行禁止**: ステップ完了の判断はユーザーが行う
10. **実装前に curl で API 疎通確認**: コード修正前に `curl` で実際のレスポンスを確認する
