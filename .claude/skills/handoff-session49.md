# LOGOSプロジェクト 引継ぎプロンプト（Session 49）

作成: 2026-04-02 / Session 48 完了時点

---

## Session 48 完了内容

### 分析スタンドアロン（`app/analyses/[id]/page.tsx`）デザインシステム適用

**変更ファイル:** `app/analyses/[id]/page.tsx`

- ローディング: `text-gray-500` → `text-g-sub`
- 404状態: `text-gray-400` → `text-g-sub`
- 戻るボタン: `dark:hover:text-gray-200 transition-colors` → `hover:text-g-text transition-colors duration-100`

**Gitタグ:** `v6.81-session48-before-analyses-design`

---

### SWOT色チント復元・Matrix ヘッダー色区別修正（`9a46c4d` ライトモードコミットの副作用）

**変更ファイル:** `app/analyses/[id]/page.tsx`・`app/topics/[id]/_components/AnalysisCard.tsx`

**原因:** ライトモード対応コミット（`9a46c4d`）で SWOT のクラス順が逆転し、`dark:bg-logos-surface` が `dark:bg-blue-900/5` 等の色チントを上書きしていた。

- **SWOT（2ファイル）:** `bg-white ${box.bg} dark:bg-logos-surface` → `bg-logos-surface ${box.bg}`
  - ツール側と同じ順序に修正。チントが後ろで正しく適用されるようになった
- **Matrix ヘッダー/ラベル（`analyses/[id]`）:** `bg-gray-50 dark:bg-logos-surface` → `bg-logos-hover`
- **Matrix データセル（`analyses/[id]`）:** `bg-white dark:bg-logos-surface` → `bg-logos-surface`
- **Matrix フッター:** `bg-gray-50 dark:bg-logos-surface` → `bg-logos-hover`

**Gitタグ:** `v6.82-session48-before-swot-matrix-fix`

---

### AnalysisCard Matrix ヘッダー色を分析スタンドアロンに揃える

**変更ファイル:** `app/topics/[id]/_components/AnalysisCard.tsx`

**原因:** `2630b03`（Session 36「プレビューと閲覧画面を統一」）が不完全で、AnalysisCard の Matrix ヘッダーが `dark:bg-logos-bg`（`#131314`、真っ黒）のまま取り残されていた。

- Matrix ヘッダー/ラベルセル: `bg-gray-50 dark:bg-logos-bg` → `bg-logos-hover`
- Matrix データセル: 背景なし → `bg-logos-surface`（明示的に付与）

**Gitタグ:** `v6.83-session48-before-analysiscard-matrix-fix`

---

## Session 48 の教訓

### ① ライトモード対応コミットで SWOT チントが消える罠
Tailwind の `dark:bg-*` は class 文字列の**後ろ**にある方が CSS 生成順で勝つ。
`bg-logos-surface ${box.bg}` の順にすれば色チントが適用される（ツール側の実装が正解）。
逆順にするとチントが消えて全ボックスが同色になる。

### ② AnalysisCard と analyses/[id] は完全に独立した実装
tree・matrix・SWOT 全タイプで描画コードが二重に存在する（コンポーネント共通化なし）。
AnalysisCard は近い将来「抜本的改革」予定のため、現状は独立維持。改革時に共通化を検討する。

### ③ 「統一済み」コミットの不完全性
Session 36 の `2630b03` でプレビュー/閲覧統一をしたはずが Matrix ヘッダーだけ取り残されていた。
「統一」コミット後も両者を目視比較するブラウザ確認が必要。

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.83-session48-before-analysiscard-matrix-fix` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 49 候補タスク

### 優先1: 残ページのデザインシステム適用

デザインシステム未適用ページを下記コマンドで特定してから着手：

```bash
grep -r "text-gray-\|bg-gray-50\|bg-gray-100\|bg-white " app/ --include="*.tsx" -l
```

優先候補：

| ページ | ファイル | 主な未対応ポイント |
|---|---|---|
| ホームページ | `app/_components/HomeClient.tsx` | 細部のセマンティック変数確認 |

### 優先2: AnalysisCard 抜本的改革（ユーザー指示あり）

- tree・matrix・SWOT の描画コードが `analyses/[id]/page.tsx` と重複
- 改革する場合は共通コンポーネントへの切り出しも検討
- **現状維持方針が決まっているので着手前にユーザーに確認すること**

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
