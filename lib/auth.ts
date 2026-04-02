/**
 * 認証ユーティリティ
 *
 * Phase 5 httpOnly Cookie 移行済み。
 * トークンはサーバーサイドの httpOnly Cookie（logos_token）で管理する。
 * ブラウザ側JavaScript からはトークンを読み取れない設計。
 *
 * - /api/auth/login  → ログイン + Cookie設定
 * - /api/auth/logout → ログアウト + Cookie削除
 * - /api/auth/me     → 認証ユーザー情報取得
 * - /api/proxy/...   → 認証済みAPIプロキシ
 */
