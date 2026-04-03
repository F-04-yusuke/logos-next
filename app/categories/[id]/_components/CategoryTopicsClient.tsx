"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

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
  categories: Category[];
};

type TopicsResponse = {
  current_page: number;
  last_page: number;
  total: number;
  data: Topic[];
};

type SortOption = "newest" | "popular" | "oldest";

function TopicSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="-ml-3 pl-3 pr-4 py-4 animate-pulse">
          <div className="flex gap-1.5 mb-2">
            <div className="h-4 w-14 rounded-full bg-white/[0.06]" />
          </div>
          <div className="h-5 w-3/4 rounded bg-white/[0.08] mb-2" />
          <div className="h-3 w-full rounded bg-white/[0.05] mb-1.5" />
          <div className="h-3 w-2/3 rounded bg-white/[0.05] mb-3" />
          <div className="flex gap-3">
            <div className="h-3 w-16 rounded bg-white/[0.04]" />
            <div className="h-3 w-20 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}

type Props = {
  categoryId: number;
  initialTopics: Topic[];
  initialPage: number;
  initialLastPage: number;
  initialTotal: number;
  categoryName: string;
  parentCategory: { id: number; name: string } | null;
};

export default function CategoryTopicsClient({
  categoryId,
  initialTopics,
  initialPage,
  initialLastPage,
  initialTotal,
  categoryName,
  parentCategory,
}: Props) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [total, setTotal] = useState(initialTotal);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchTopics = useCallback((page: number, sortVal: SortOption) => {
    setLoading(true);
    setError(false);
    fetch(`/api/proxy/topics?category=${categoryId}&sort=${sortVal}&page=${page}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: TopicsResponse) => {
        setTopics(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        setTotal(data.total);
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [categoryId]);

  const handleSort = (newSort: SortOption) => {
    setSort(newSort);
    fetchTopics(1, newSort);
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── パンくず ── */}
        <div className="flex items-center gap-2 text-xs text-logos-sub mb-6 flex-wrap">
          <Link href="/" className="hover:text-logos-text transition-colors duration-100 cursor-pointer">
            ホーム
          </Link>
          {parentCategory && (
            <>
              <span className="text-logos-border">›</span>
              <Link
                href={`/categories/${parentCategory.id}`}
                className="hover:text-logos-text transition-colors duration-100 cursor-pointer"
              >
                {parentCategory.name}
              </Link>
            </>
          )}
          <span className="text-logos-border">›</span>
          <span className="text-logos-text">{categoryName || "…"}</span>
        </div>

        {/* ── ページヘッダー ── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
              <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
              {categoryName || <span className="inline-block w-24 h-6 rounded bg-white/[0.08] animate-pulse" />}
            </h1>
            {!loading && (
              <p className="text-xs text-logos-sub mt-0.5 pl-3.5">{total}件のトピック</p>
            )}
          </div>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value as SortOption)}
              className="text-sm rounded-full bg-logos-hover text-logos-text pl-3 pr-8 py-1.5 cursor-pointer hover:bg-logos-elevated transition-colors focus:outline-none appearance-none"
            >
              <option value="newest">新着順</option>
              <option value="popular">エビデンスが多い順</option>
              <option value="oldest">古い順</option>
            </select>
            <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-logos-sub pointer-events-none" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* ── トピック一覧 ── */}
        {loading && <TopicSkeleton />}
        {error && (
          <p className="text-red-400 text-sm py-6 text-center">
            トピックの取得に失敗しました
          </p>
        )}

        {!loading && !error && (
          <>
            {topics.length === 0 ? (
              <div className="py-16 text-center text-logos-sub">
                このカテゴリにはまだトピックがありません。
              </div>
            ) : (
              <div>
                {topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/topics/${topic.id}`}
                    className="block -ml-3 pl-3 pr-4 py-4 rounded-xl hover:bg-logos-hover transition-colors duration-100 group cursor-pointer"
                  >
                    {topic.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {topic.categories.map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 transition-colors duration-100"
                          >
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <h2 className="text-lg font-bold text-logos-text mb-1.5 group-hover:text-blue-400 transition-colors duration-100 leading-snug">
                      {topic.title}
                    </h2>

                    {topic.content && (
                      <p className="text-base text-logos-sub line-clamp-2 mb-2 leading-relaxed">
                        {topic.content}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-logos-sub">
                      <span>{topic.user.name}</span>
                      <span className="text-logos-border">·</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        エビデンス {topic.posts_count}件
                      </span>
                      <span className="text-logos-border">·</span>
                      <span>{timeAgo(topic.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* ── ページネーション ── */}
            {lastPage > 1 && (
              <div className="mt-6 flex justify-center items-center gap-3">
                <button
                  onClick={() => fetchTopics(currentPage - 1, sort)}
                  disabled={currentPage <= 1}
                  className="px-4 py-2 text-base rounded-lg bg-logos-surface text-logos-sub hover:bg-logos-hover hover:text-logos-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  ← 前へ
                </button>
                <span className="text-base text-logos-sub px-2">
                  {currentPage} / {lastPage}
                </span>
                <button
                  onClick={() => fetchTopics(currentPage + 1, sort)}
                  disabled={currentPage >= lastPage}
                  className="px-4 py-2 text-base rounded-lg bg-logos-surface text-logos-sub hover:bg-logos-hover hover:text-logos-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  次へ →
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
