/**
 * /api/proxy/[...path] — 認証済みAPIリクエストをLaravelへ転送するcatch-allプロキシ
 *
 * 例: /api/proxy/topics/1  →  https://gs-f04.sakura.ne.jp/api/topics/1
 *
 * - httpOnly Cookie（logos_token）を読み取りAuthorizationヘッダーを付与
 * - GET/POST/PUT/PATCH/DELETE 全メソッド対応
 * - multipart/form-data（ファイルアップロード）対応
 */
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const UPSTREAM = process.env.API_BASE_URL ?? "http://localhost";

async function proxy(request: NextRequest, path: string[]): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get("logos_token")?.value;

  const searchParams = request.nextUrl.searchParams.toString();
  const upstreamPath = `/api/${path.join("/")}`;
  const url = searchParams
    ? `${UPSTREAM}${upstreamPath}?${searchParams}`
    : `${UPSTREAM}${upstreamPath}`;

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const method = request.method;
  const init: RequestInit = { method, headers, cache: "no-store" };

  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      // ファイルアップロード: fetchが自動でboundary付きContent-Typeを設定するためヘッダーは設定しない
      init.body = await request.formData();
    } else {
      headers["Content-Type"] = contentType || "application/json";
      init.body = await request.text();
    }
  }

  try {
    const res = await fetch(url, init);
    const responseContentType = res.headers.get("content-type") ?? "";

    if (responseContentType.includes("application/json")) {
      const data = await res.json();
      return Response.json(data, { status: res.status });
    }

    // JSON以外のレスポンス（画像・バイナリ等）
    const body = await res.arrayBuffer();
    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": responseContentType },
    });
  } catch (err) {
    console.error("[proxy] upstream error:", err);
    return Response.json({ error: "upstream unavailable" }, { status: 502 });
  }
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: RouteContext) {
  return proxy(req, (await ctx.params).path);
}
