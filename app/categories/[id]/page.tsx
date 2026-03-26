// Server Component — カテゴリ別トピック一覧ページ
// カテゴリ名解決はクライアント側で行う（SSR fetch の不安定さを避けるため）
import CategoryTopicsClient from "./_components/CategoryTopicsClient";

type Topic = {
  id: number;
  title: string;
  content: string;
  posts_count: number;
  comments_count: number;
  created_at: string;
  user: { id: number; name: string };
  categories: { id: number; name: string; sort_order: number; parent_id: number | null }[];
};

type TopicsResponse = {
  current_page: number;
  last_page: number;
  total: number;
  data: Topic[];
};

const API = process.env.API_BASE_URL ?? "http://localhost";

async function fetchInitialTopics(categoryId: string): Promise<TopicsResponse | null> {
  try {
    const res = await fetch(`${API}/api/topics?category=${categoryId}&sort=newest`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function CategoryTopicsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topicsData = await fetchInitialTopics(id);

  return (
    <CategoryTopicsClient
      categoryId={parseInt(id)}
      initialTopics={topicsData?.data ?? []}
      initialPage={topicsData?.current_page ?? 1}
      initialLastPage={topicsData?.last_page ?? 1}
      initialTotal={topicsData?.total ?? 0}
    />
  );
}
