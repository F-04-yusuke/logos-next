// Server Component — "use client" なし
// 初期トピックデータをさくら API から SSR フェッチし TopicPageClient に渡す。
// ユーザー固有フィールド (is_liked_by_me 等) は TopicPageClient 内で auth 付き再フェッチして補完される。
import { TopicPageClient } from "./_components/TopicPageClient";
import type { TopicDetail } from "./_types";

const API = process.env.API_BASE_URL ?? "http://localhost";

async function fetchInitialTopic(id: string): Promise<TopicDetail | null> {
  try {
    const res = await fetch(`${API}/api/topics/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialTopic = await fetchInitialTopic(id);

  return <TopicPageClient id={id} initialTopic={initialTopic} />;
}
