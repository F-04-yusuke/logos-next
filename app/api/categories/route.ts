import { proxyGet } from "@/lib/proxy-fetch";

/** GET /api/categories — カテゴリ一覧プロキシ */
export async function GET() {
  return proxyGet("/api/categories");
}
