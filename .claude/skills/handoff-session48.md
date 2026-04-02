# LOGOSプロジェクト 引継ぎプロンプト（Session 48）

作成: 2026-04-02 / Session 47 完了時点

---

## Session 47 完了内容

### カテゴリ管理ページ（`app/categories/page.tsx`）デザインシステム適用

**変更ファイル:** `app/categories/page.tsx`

- ページヘッダー・セクションヘッダー×2 → グラデーションアクセントバー（h-6・h-4）
- 「今すぐ反映」「追加する」ボタン → グラデーション pill（indigo・rounded-full）
- フォームラベル `text-lg text-gray-300` → `text-base text-logos-text`
- フォーム入力・select → `rounded-lg bg-logos-surface border-logos-border focus:indigo`
- 編集ボタン `bg-gray-700 text-gray-300` → `bg-logos-hover text-logos-text border-logos-border`
- キャンセルボタン `text-gray-500 hover:text-gray-300` → `text-logos-sub hover:text-logos-text`
- 中分類テキスト・区切り線・スケルトン → セマンティック変数統一

**Gitタグ:** `v6.79-session47-before-categories-design`

---

### AppLogo 刷新（`components/AppLogo.tsx`）

**変更ファイル:** `components/AppLogo.tsx`

- 旧: 3D等角投影「L」（5枚の多角形パス）
- 新: **Λ（ギリシャ文字ラムダ）グラデーション円形バッジ ＋ ワードマーク**
  - Λ = λόγος（ロゴス）の語源。「L」アイコン ＋「LOGOS」テキストの視覚的 L 重複を解消
  - blue-500→indigo-600 グラデーション円（h-6 w-6、drop shadow なし）
  - 白い Λ polyline（strokeWidth=2.5, rounded caps）
  - テキスト: font-black tracking-tight text-logos-text（単色・グラデーション廃止）
  - 有名アプリ（YouTube・Claude・Gemini）に倣い shadow なし・シンプルな単色テキスト
- ⚠️ 「LOGOS」という名称は Logos Bible Software と被る可能性あり → 将来再検討

**Gitタグ:** `v6.80-session47-before-logo-redesign`

---

## Session 47 の教訓

### ① AppLogo で filter（drop shadow）を使うと主要アプリと比べて野暮ったくなる
有名アプリのロゴ（YouTube・Claude・Gemini）は shadow なし・単色テキスト。
グラデーションテキストや drop shadow は「やりすぎ」になりやすい。シンプルさが品質の証。

### ② 「L」字アイコン ＋「LOGOS」テキストは視覚的に L が 2 回続いて不自然
アイコンと続くテキストが同じ文字で始まる場合、アイコンを別コンセプトに変える必要がある。
今回は λόγος の語源である Λ（ラムダ）に変更することで解消。

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.80-session47-before-logo-redesign` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 48 候補タスク

### 優先1: 残ページのデザインシステム適用

デザインシステム未適用ページを下記コマンドで特定してから着手：

```bash
grep -r "text-gray-\|bg-gray-50\|bg-gray-100\|bg-white " app/ --include="*.tsx" -l
```

優先候補：

| ページ | ファイル | 主な未対応ポイント |
|---|---|---|
| 分析スタンドアロン閲覧 | `app/analyses/[id]/page.tsx` | ヘッダー・ボタン・カード色など |
| ホームページ | `app/page.tsx` | 細部のセマンティック変数確認 |

---

## 起動手順

```bash
cd ~/logos-laravel && ./vendor/bin/sail up -d
cd ~/logos-next && npm run dev
# → http://localhost:3000

# hydration error が出た場合
rm -rf .next && npm run dev
```

## 検証コマンド

```bash
cd ~/logos-next && npx tsc --noEmit
```

---

## 重要ルール再掲

1. **着手前に必ずタグを打つ**: `git tag v6.XX-sessionYY-before-XXX && git push origin ...`（コードを変更するすべての回答で毎回）
2. **Blade 参照ルール**: 機能追加・移植 → 必ず先に Blade を読む / UIデザインのみ → 不要
3. **boolean 変換**: Laravel API は `0/1` で返す → JSX で必ず `!!` 変換
4. **一度に編集するファイルは 5 ファイル以内**
5. **Gemini API キーは絶対に `NEXT_PUBLIC_` をつけない**
6. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
7. **WSL 終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
8. **hydration error**: `rm -rf .next && npm run dev` で解消
