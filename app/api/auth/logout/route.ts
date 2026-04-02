import { cookies } from "next/headers";

const UPSTREAM = process.env.API_BASE_URL ?? "http://localhost";

/** POST /api/auth/logout — Laravelのトークンを無効化し、httpOnly Cookieを削除 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("logos_token")?.value;

  // Laravel側のトークンも無効化（失敗してもCookieは削除する）
  if (token) {
    try {
      await fetch(`${UPSTREAM}/api/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
    } catch {
      // upstream error は許容する
    }
  }

  cookieStore.delete("logos_token");
  return Response.json({ ok: true }, { status: 200 });
}
