// Server Component — カテゴリ別トピック一覧ページ
import CategoryTopicsClient from "./_components/CategoryTopicsClient";

type Category = {
  id: number;
  name: string;
  sort_order: number;
  parent_id: number | null;
  children?: Category[];
};

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

async function fetchCategoryInfo(
  categoryId: number
): Promise<{ categoryName: string; parentCategory: { id: number; name: string } | null }> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 3600 } });
    if (!res.ok) return { categoryName: "", parentCategory: null };
    const cats: Category[] = await res.json();
    // 大分類を探す
    const root = cats.find((c) => c.id === categoryId);
    if (root) return { categoryName: root.name, parentCategory: null };
    // 中分類を探す
    for (const parent of cats) {
      const child = (parent.children ?? []).find((c) => c.id === categoryId);
      if (child) return { categoryName: child.name, parentCategory: { id: parent.id, name: parent.name } };
    }
    return { categoryName: "", parentCategory: null };
  } catch {
    return { categoryName: "", parentCategory: null };
  }
}

export default async function CategoryTopicsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = parseInt(id);

  const [topicsData, categoryInfo] = await Promise.all([
    fetchInitialTopics(id),
    fetchCategoryInfo(categoryId),
  ]);

  return (
    <CategoryTopicsClient
      categoryId={categoryId}
      initialTopics={topicsData?.data ?? []}
      initialPage={topicsData?.current_page ?? 1}
      initialLastPage={topicsData?.last_page ?? 1}
      initialTotal={topicsData?.total ?? 0}
      categoryName={categoryInfo.categoryName}
      parentCategory={categoryInfo.parentCategory}
    />
  );
}
