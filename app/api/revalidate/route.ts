import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API = process.env.API_BASE_URL ?? "http://localhost";

/** POST /api/revalidate — httpOnly Cookie のトークンで管理者認証し /category-list を再検証 */
export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("logos_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Laravelでトークンを検証し、adminか確認
  const userRes = await fetch(`${API}/api/profile`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!userRes.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await userRes.json();
  if (!user.is_admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  revalidatePath("/category-list");
  return NextResponse.json({ revalidated: true });
}
