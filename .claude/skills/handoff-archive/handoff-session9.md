# LOGOSプロジェクト 引継ぎプロンプト（Phase 3 技術改善 Session 9）

作成: 2026-03-23 / Session 8 完了時点

---

## 前回セッション（Session 8）の完了内容

### F-7: 共有コンポーネント整理 ✅ 完了・push 済み

| 作業 | 内容 |
|---|---|
| `components/UserAvatar.tsx` 新規作成 | avatar画像対応・sm(28px)/md(32px)/lg(40px) 3サイズ統一 |
| `components/LikeButton.tsx` 新規作成 | topics版をそのまま共有化 |
| `topics/_components/UserAvatar.tsx` | 中身削除 → shared への re-export 1行に |
| `topics/_components/LikeButton.tsx` | 同上 |
| `PostCard.tsx`・`CommentCard.tsx` | 引数を `name={x.user.name}` → `user={x.user}` に統一 |
| `dashboard/page.tsx`・`likes/page.tsx` | インライン `UserAvatar` 定義（計60行）を削除・import 置換 |

**効果:** 137行削減（96行追加）・3ヶ所の重複コード解消

**検証済み（2026-03-23）:**
- ✅ `npx tsc --noEmit` エラーなし
- ✅ `npm run build` エラーなし
- **Gitタグ**: `v3.6-f7-shared-components`（logos-next push済み）

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | v3.6-f7-shared-components | クリーン |
| ~/logos-laravel | main | v3.5-b6-like-relations | クリーン |

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
| B-3 | FormRequest クラス化（16ファイル・全ApiController） | Session 6 |
| B-5 | ApiResource クラス導入（AnalysisResource/CategoryResource） | Session 7 |
| B-6 | Like モデル逆向きリレーション追加 | Session 7 |
| **F-7** | **共有コンポーネント整理（UserAvatar/LikeButton）** | **Session 8** |

---

## 今セッションのタスク: F-6（Header/Sidebar 細分化）

### 現状

| ファイル | 行数 | 内部構成 |
|---|---|---|
| `components/Header.tsx` | 377行 | BellIcon / Avatar / NotificationBadge / Header（メイン） |
| `components/Sidebar.tsx` | 374行 | LockIcon / Sidebar（メイン） |

### 目標ディレクトリ構成

```
components/
├── Header/
│   ├── NotificationBell.tsx   ← BellIcon + NotificationBadge + ベルボタンロジック
│   ├── UserMenu.tsx           ← Avatar + ドロップダウンメニューロジック
│   ├── SearchBar.tsx          ← 検索フォームロジック
│   └── index.tsx              ← メイン Header（上3つを組み合わせる）
├── Sidebar/
│   ├── NavLinks.tsx           ← ナビリンク一覧（主要・PRO機能・分析ツール）
│   └── index.tsx              ← メイン Sidebar（NavLinks + 保存トピック）
├── Header.tsx                 ← 後方互換 re-export（import先を壊さないため）
└── Sidebar.tsx                ← 後方互換 re-export（同上）
```

### 実装方針

1. **既存の `Header.tsx`・`Sidebar.tsx` は最後まで残す**
   - `LayoutShell.tsx` 等が `import Header from "@/components/Header"` で使っているため
   - 分割完了後に中身を `Header/index.tsx` への re-export 1行に差し替える

2. **段階的に実施（5ファイル以内ルール厳守）**
   - Step 1: `Header/NotificationBell.tsx` 作成（BellIcon + NotificationBadge + ベルエリア）
   - Step 2: `Header/SearchBar.tsx` 作成
   - Step 3: `Header/UserMenu.tsx` 作成（Avatar + ドロップダウン）
   - Step 4: `Header/index.tsx` 作成 → `Header.tsx` を re-export に差し替え
   - Step 5: `Sidebar/NavLinks.tsx` 作成 → `Sidebar/index.tsx` 作成 → `Sidebar.tsx` を re-export に差し替え

3. **各ステップで `npm run build` を確認してから次へ**

### 注意事項

- Header は `useAuth`・`useRouter`・`useSidebarContext` など複数のコンテキストを使っている
  → 分割したコンポーネントに必要な props を渡す設計にする（Context は index.tsx で一括取得 → props 経由で渡す）
- Sidebar は `bookmarkRefreshKey`・`openProModal`・`user` など `SidebarContext`・`AuthContext` 両方を参照
- **UIは一切変更しない**（ピクセルレベルで同一を維持・Blade の navigation.blade.php と一致している状態を保つ）

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
# 型チェック
cd ~/logos-next && npx tsc --noEmit

# Next.js ビルド確認
cd ~/logos-next && npm run build
```

---

## 重要な注意事項（ルール再掲）

1. **実装前に必ず読む:**
   - `~/logos-laravel/.claude/skills/features.md`
   - `~/logos-laravel/.claude/skills/security.md`
2. **LaravelのAPIはboolean値を `0/1` で返す** → JSXでは `!!` 変換または `transforms.ts` 経由
3. **一度に編集するファイルは5ファイル以内**
4. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
5. **UIは変更しない** — Header/Sidebar の分割はロジック・JSX の移動のみ。見た目ゼロ変化を保証してから push
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
