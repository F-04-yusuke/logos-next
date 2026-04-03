// Server Component — 分析スタンドアロン閲覧ページ（httpOnly Cookie認証対応）
import { cookies } from "next/headers";
import Link from "next/link";
import AnalysisShowClient, { type Analysis } from "./_components/AnalysisShowClient";

const API = process.env.API_BASE_URL ?? "http://localhost";

export default async function AnalysisShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("logos_token")?.value;

  const headers: HeadersInit = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let analysis: Analysis | null = null;

  try {
    const res = await fetch(`${API}/api/analyses/${id}`, {
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      analysis = await res.json();
    }
  } catch {
    // upstream error — analysis remains null
  }

  if (!analysis) {
    return (
      <div className="py-12 flex flex-col items-center gap-4">
        <p className="text-logos-sub text-base">分析データが見つかりませんでした。</p>
        <Link href="/" className="text-blue-500 hover:underline text-base">
          トップへ戻る
        </Link>
      </div>
    );
  }

  return <AnalysisShowClient analysis={analysis} />;
}
