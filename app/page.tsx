// Server Component — "use client" なし
// 初期データをさくら API から直接 SSR フェッチし、HomeClient に渡す。
// ユーザーのインタラクション（ソート・ページネーション・タブ）は HomeClient（CSR）が担当。
import HomeClient from "./_components/HomeClient";

type Category = {
  id: number;
  name: string;
  sort_order: number;
  parent_id: number | null;
};

type Topic = {
  id: number;
  title: string;
  content: string;
  posts_count: number;
  comments_count: number;
  created_at: string;
  user: { id: number; name: string };
  categories: Category[];
};

type TopicsResponse = {
  current_page: number;
  last_page: number;
  total: number;
  data: Topic[];
};

// サーバー専用変数（NEXT_PUBLIC_ なし → ブラウザ非公開）
const API = process.env.API_BASE_URL ?? "http://localhost";

async function fetchInitialTopics(): Promise<TopicsResponse | null> {
  try {
    const res = await fetch(`${API}/api/topics?sort=newest`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const [topicsData, allCategories] = await Promise.all([
    fetchInitialTopics(),
    fetchCategories(),
  ]);

  const rootCategories = (allCategories ?? []).filter((c) => c.parent_id === null);

  return (
    <HomeClient
      initialTopics={topicsData?.data ?? []}
      initialPage={topicsData?.current_page ?? 1}
      initialLastPage={topicsData?.last_page ?? 1}
      categories={rootCategories}
    />
  );
}
