/**
 * Route Handler からさくら API をプロキシするユーティリティ。
 * サーバーサイド専用 — ブラウザからは直接呼ばれない。
 * API_BASE_URL は NEXT_PUBLIC_ なし → クライアントバンドルに含まれない。
 */
const UPSTREAM_API = process.env.API_BASE_URL ?? "http://localhost";

/**
 * さくら API へ GET リクエストをプロキシし、レスポンスをそのまま返す。
 * @param path     /api/... 形式のパス（クエリ文字列を含んでもよい）
 * @param extraHeaders Authorization など追加ヘッダー
 */
export async function proxyGet(
  path: string,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  try {
    const res = await fetch(`${UPSTREAM_API}${path}`, {
      headers: {
        Accept: "application/json",
        ...extraHeaders,
      },
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    console.error("[proxy-fetch] upstream error:", err);
    return Response.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
