# Session 42 → 43 引継ぎプロンプト

最終更新: 2026-04-01

---

## このファイルの使い方

新しいセッション開始時に以下をそのままプロンプトに貼り付ける:

```
'/home/tasaki/logos-next/.claude/skills/handoff-session42.md'
```

---

## プロジェクト概要

- **フロント:** Next.js (`~/logos-next`) → Vercel
- **バックエンド:** Laravel (`~/logos-laravel`) → さくらサーバー
- **詳細仕様:** `CLAUDE.md` および `.claude/skills/` 配下の各ファイルを参照

---

## Session 42 完了内容（2026-04-01）

### 1. システム構成図の見直し ✅
卒業制作仕様書向けに Mermaid 構成図を現状のみに整理。

**修正内容:**
- Session Storage 削除（未使用）→ Local Storage のみに
- Zustand 削除（未実装）→ SWR に変更
- Nginx → Apache（現状はさくら標準の Apache）
- PostgreSQL / AWS → MySQL 8.0 / さくらレンタルサーバーに変更
- GitHub / GitHub Actions を追加（CI/CD 実装済み）
- Webブラウザ・Webアプリの二重ノードを Next.js 単一ノードに統合
- 将来構想（React Native・AWS・Stripe 等）を全削除 → 現状のみの図に

### 2. user10_pro@logos.com を PRO 昇格 ✅
本番（さくら）DB に PHP スクリプト転送方式で適用。

### 3. 企画書 URL 更新 ✅
両リポジトリの roadmap.md の企画書リンクを新 URL に変更。
- 旧: Google スライド
- 新: https://drive.google.com/file/d/1pAIJl_2i70py_H3gTF0BthXi46ccvudk/view?usp=sharing

### 4. ダークモード固定の調査 ✅（実装は次セッション）
**調査結果:**
- `app/layout.tsx` 37行目: `<html className="... dark">` で `dark` クラスがハードコード
- `body` の背景色も `bg-[#131314]` と直接指定
- OS のダーク/ライト設定を完全に無視している
- `globals.css` には `:root`（ライト）と `.dark`（ダーク）の両変数が定義済みなので、構造上は対応可能

---

## 現在のタグ

- **logos-next:** `v6.57-session41-home-category-tabs`（Session 42 はコード変更なし）
- **logos-laravel:** `v4.4-session31-liked-by-me`（Session 42 は変更なし）

---

## Session 43 最優先タスク

### ダークモード → OS 設定追従への変更

**実装方針:**
1. `app/layout.tsx` の `<html>` から `dark` クラスを削除
2. `body` の `bg-[#131314]` を CSS 変数ベース（`bg-background`）に変更
3. `globals.css` の `:root`（ライトモード）の色変数を LOGOS デザインに合わせて調整
   - 現状の `:root` は shadcn デフォルト（白背景）なので、LOGOS らしい配色に変更が必要
4. ライトモード時の各コンポーネントの見た目確認・調整

**影響ファイル（事前確認推奨）:**
- `app/layout.tsx`
- `app/globals.css`
- ハードコードで暗色を指定しているコンポーネント（`bg-[#131314]` `bg-[#1e1f20]` 等を Grep で洗い出す）

**注意点:**
- `g-text`（`#E3E3E3`）・`g-sub`（`#C4C7C5`）はダーク専用の色のため、ライトモード用の値も定義が必要
- スクロールバーの色もダーク前提（`rgba(255,255,255,0.15)`）→ ライト対応が必要
- 全ページ確認が必要な大きめの変更

### その他候補タスク（優先度順）
1. スマホ版レスポンシブ全体確認（history・notifications・dashboard・likes）
2. トピックページタブ下コンテンツのモバイル最適化
3. Cookie 認証導入（大型・Phase 4）

---

## 引継ぎ時の注意

- タグ付けルール: **コードを変更するすべての回答で、毎回・必ず・最初にタグを打つこと**
- ローカル起動: `cd ~/logos-laravel && ./vendor/bin/sail up -d` → `cd ~/logos-next && npm run dev`
- 終了時: **必ず** `cd ~/logos-laravel && ./vendor/bin/sail down` を実行してから WSL を閉じる
