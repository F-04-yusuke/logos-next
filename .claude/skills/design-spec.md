# LOGOS デザイン仕様

## カラーシステム
- ベース背景: `#131314`
- カード等要素の背景: `#1e1f20`
- ボーダー: `border-gray-700`
- コントラスト比: `#131314` 背景に対して文字色 4.5:1 以上を確保すること

## デザイン基準
- YouTube・Gemini・X（Twitter）ライクなモダンで洗練されたデザイン
- ダークモード固定
- 余分なボーダー・箱型デザインは避ける（背景色の微細な違いで表現）
- ホバー時: `hover:shadow-md` または `hover:scale-105`
- 賛否（賛成・反対）UIは導入しない（2項対立でまとめられないテーマが多いため）

## レスポンシブ
- モバイルファーストで実装
- sm: 640px / md: 768px / lg: 1024px

## アクセシビリティ（必須）
- `aria-hidden`・`aria-label` 等を必ず付ける
- スクリーンリーダー対応（`sr-only` クラス活用）
- タップ領域は最低 44px 確保

## 重要アクションUI原則
- いいね・保存ボタンが隠れていないこと
- アイコン＋テキストのペアを基本とする（アイコン単独は避ける）
- アバター配置: 「左側に丸いアイコン ＋ 右側に小さな文字で名前と時間」を全画面で統一

## コメント・階層UI
- 親コメントに対して補足（返信）がインデントされたツリー状にぶら下がる形式
- 返信は最初から全表示せず「〇件の返信 ▼」のアコーディオンでスムーズに開閉
- Alpine.js の `x-show` 相当の実装で対応（Next.js では useState で制御）

## 入力フォーム
- 下線のみ（focusでハイライト）のGoogle/YouTubeライクなデザイン
- 入力文字数に合わせて高さが自動拡張するUX

## 情報密度
- `text-[13px]` や `text-xs` を多用して情報密度を高める
- 要素の詰め込みすぎを防ぐ

---

## Blade参照表（実装前に必ず読む）

| Next.jsファイル | 参照するBladeファイル |
|---|---|
| components/Header.tsx | ~/logos/resources/views/layouts/navigation.blade.php |
| components/Sidebar.tsx | ~/logos/resources/views/layouts/sidebar.blade.php |
| app/login/page.tsx | ~/logos/resources/views/auth/login.blade.php |
| app/register/page.tsx | ~/logos/resources/views/auth/register.blade.php |
| app/page.tsx | ~/logos/resources/views/topics/index.blade.php |
| app/topics/[id]/page.tsx | ~/logos/resources/views/topics/show.blade.php |
| app/topics/create/page.tsx | ~/logos/resources/views/topics/create.blade.php |
| app/notifications/page.tsx | ~/logos/resources/views/notifications/index.blade.php |
| app/dashboard/page.tsx | ~/logos/resources/views/dashboard.blade.php |
| app/categories/page.tsx | ~/logos/resources/views/categories/list.blade.php |
| app/profile/page.tsx | ~/logos/resources/views/profile/edit.blade.php |
| app/history/page.tsx | ~/logos/resources/views/history/index.blade.php |
| app/likes/page.tsx | ~/logos/resources/views/likes/index.blade.php |
| app/topics/[id]/edit/page.tsx | ~/logos/resources/views/topics/edit.blade.php |
| app/analyses/[id]/page.tsx | ~/logos/resources/views/analyses/show.blade.php |
| app/tools/tree/page.tsx | ~/logos/resources/views/tools/tree.blade.php |
| app/tools/matrix/page.tsx | ~/logos/resources/views/tools/matrix.blade.php |
| app/tools/swot/page.tsx | ~/logos/resources/views/tools/swot.blade.php |

共通UIパーツ参照:
| 用途 | 参照先 |
|---|---|
| エビデンスカード | ~/logos/resources/views/components/post-card.blade.php |
| コメントカード | ~/logos/resources/views/components/comment-card.blade.php |
| 分析カード | ~/logos/resources/views/components/analysis-card.blade.php |
| PRO誘導モーダル | ~/logos/resources/views/components/pro-modal.blade.php |
| ドロップダウン | ~/logos/resources/views/components/dropdown.blade.php |
