import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_BASE_URL ?? "http://localhost";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** POST /api/auth/login — メール/パスワードでLaravelへ認証し、httpOnly Cookieにトークンを保存 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${UPSTREAM}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      return Response.json(data, { status: res.status });
    }

    const cookieStore = await cookies();
    cookieStore.set("logos_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    // トークンをクライアントに返さない
    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ message: "サーバーに接続できませんでした" }, { status: 502 });
  }
}
