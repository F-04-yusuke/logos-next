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

// 後方互換スタブ（段階的移行用 — 各ページのProxy移行完了後に削除する）
/** @deprecated httpOnly Cookie移行済み。削除予定 */
export function getToken(): null { return null; }
/** @deprecated httpOnly Cookie移行済み。削除予定 */
export function setToken(_token: string): void { /* no-op */ }
/** @deprecated httpOnly Cookie移行済み。削除予定 */
export function removeToken(): void { /* no-op */ }
/** @deprecated httpOnly Cookie移行済み。削除予定 */
export function getAuthHeaders(): Record<string, string> {
  return { Accept: "application/json" };
}
