import { proxyGet } from "@/lib/proxy-fetch";

/** GET /api/categories/[id]/featured-post — カテゴリ最多いいね投稿プロキシ */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(`/api/categories/${id}/featured-post`);
}
