import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy-fetch";

/** GET /api/topics — トピック一覧プロキシ（クエリ文字列をそのまま転送） */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.toString();
  return proxyGet(`/api/topics${q ? `?${q}` : ""}`);
}
