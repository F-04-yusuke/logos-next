import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy-fetch";

/** GET /api/analyses/[id] — 分析詳細プロキシ（Authorization ヘッダーを転送） */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("Authorization");
  return proxyGet(
    `/api/analyses/${id}`,
    authHeader ? { Authorization: authHeader } : undefined
  );
}
