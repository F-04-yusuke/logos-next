import { cookies } from "next/headers";
import { transformUser } from "@/lib/transforms";

const UPSTREAM = process.env.API_BASE_URL ?? "http://localhost";

/** GET /api/auth/me — httpOnly CookieからトークンをLaravelに渡してユーザー情報を返す */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("logos_token")?.value;

  if (!token) {
    return Response.json(null, { status: 401 });
  }

  try {
    const res = await fetch(`${UPSTREAM}/api/user/me`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return Response.json(null, { status: 401 });
    const user = await res.json();
    return Response.json(transformUser(user));
  } catch {
    return Response.json(null, { status: 502 });
  }
}
