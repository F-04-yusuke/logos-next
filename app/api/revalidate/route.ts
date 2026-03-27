import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_BASE_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Laravelでトークンを検証し、adminか確認
  const userRes = await fetch(`${API}/api/user`, {
    headers: { Authorization: authHeader, Accept: "application/json" },
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
