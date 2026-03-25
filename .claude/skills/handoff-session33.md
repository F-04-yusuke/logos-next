# LOGOSプロジェクト 引継ぎプロンプト（Session 33）

作成: 2026-03-25 / Session 32 完了時点

---

## Session 32 完了内容

### ドキュメント整理

- `progress-phase4.md` を Session 12〜19（`progress-phase4-s12-s19.md`）と Session 20〜31（メイン）に分割

### R-1: dashboard リファクタリング ✅

`app/dashboard/page.tsx` が 774行に肥大化していたため、`useTopicPage.ts` パターンに準拠した構成に整理。

| ファイル | 行数 | 内容 |
|---|---|---|
| `app/dashboard/_hooks/useDashboard.ts` | 334行（新規） | state・fetch・全10ハンドラ・下書き編集ロジック集約 |
| `app/dashboard/_components/DraftEditModal.tsx` | 134行（新規） | 下書き編集モーダルUIを独立コンポーネントとして抽出 |
| `app/dashboard/page.tsx` | 421行（旧774行） | JSX描画・レイアウトのみ |

**Gitタグ:** `v6.16-session32-before-dashboard-refactor` → `v6.17-session32-dashboard-refactor`

---

## 現在のリポジトリ状態

| リポジトリ | ブランチ | 最新タグ | 状態 |
|---|---|---|---|
| ~/logos-next | main | `v6.17-session32-dashboard-refactor` | クリーン |
| ~/logos-laravel | main | `v4.4-session31-liked-by-me` | クリーン |

---

## Session 33 最優先タスク

### 残りの全ページ テキストサイズ ワンサイズアップ

**背景:** Session 30 でトピックページ・ホームページ・ダッシュボード・サイドバーをワンサイズアップ済み。カード内テキストは Session 31 の共通コンポーネント化で自動解決。残りのページはまだ未対応。

**作業ルール（Session 30 準拠）:**
- `text-[11px]` → `text-xs`、`text-[13px]` → `text-sm`、`text-[15px]` → `text-base`
- `text-xs` → `text-sm`、`text-sm` → `text-base`、`text-base` → `text-lg`
- ページ内の主要本文テキストを対象とする
- 一度に5ファイル以内の制限を守り、ページ単位で確認しながら進める

**対象ページ（優先度順）:**

| ページ | ファイル | 作業量 |
|---|---|---|
| 閲覧履歴 | `app/history/page.tsx` | 小 |
| 通知 | `app/notifications/page.tsx` | 小 |
| プロフィール | `app/profile/page.tsx` | 小〜中 |
| カテゴリ公開一覧 | `app/category-list/page.tsx` | 小 |
| カテゴリ管理(admin) | `app/categories/page.tsx` | 小〜中 |
| カテゴリ別トピック一覧 | `app/categories/[id]/_components/CategoryTopicsClient.tsx` | 小 |
| ログイン | `app/login/page.tsx` | 小 |
| 登録 | `app/register/page.tsx` | 小 |
| トピック作成 | `app/topics/create/page.tsx` | 小〜中 |
| トピック編集 | `app/topics/[id]/edit/page.tsx` | 小〜中 |
| 分析スタンドアロン | `app/analyses/[id]/page.tsx` | 中 |
| 分析ツール3本 | `app/tools/tree` / `matrix` / `swot` | 中 |

---

## 起動手順

```bash
# Laravel コンテナ確認
docker ps | grep logos-laravel   # Running ならOK
# 起動していない場合:
cd ~/logos-laravel && ./vendor/bin/sail up -d

# Next.js
cd ~/logos-next && npm run dev
# → http://localhost:3000

# hydration error が出た場合（必ず試す）
cd ~/logos-next && rm -rf .next && npm run dev
```

## 検証コマンド

```bash
cd ~/logos-next && npx tsc --noEmit
cd ~/logos-next && npm run build
```

---

## 重要ルール再掲

1. **豪華要素ルール**: `.claude/skills/design-spec.md` の「豪華要素ルール」セクション参照・数値を変えない
2. **Blade 参照ルール**: UIデザインのみ変更 → 不要 / 機能追加・移植 → 必ず先に Blade を読む
3. **テキストカラー**: `dark:text-g-text` / `dark:text-g-sub` を使う（`dark:text-gray-*` は使わない）
4. **boolean変換**: LaravelのAPIは `0/1` で返す → JSXで必ず `!!` 変換
5. **一度に編集するファイルは5ファイル以内**
6. **GeminiのAPIキーは絶対に `NEXT_PUBLIC_` をつけない**
7. **`migrate:fresh`・`db:wipe` 等は絶対に実行しない**
8. **WSL終了前に `cd ~/logos-laravel && ./vendor/bin/sail down` を必ず実行**
9. **カテゴリバッジ統一値**: `px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20`
10. **hydration error**: `rm -rf .next && npm run dev` で解消
