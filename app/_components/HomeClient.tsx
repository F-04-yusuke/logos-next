"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// ────────────────────────────────────────────────
// 型定義
// ────────────────────────────────────────────────
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

type SortOption = "newest" | "popular" | "oldest";

// ────────────────────────────────────────────────
// ユーティリティ
// ────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function rankBadgeClass(index: number): string {
  if (index === 0) return "bg-yellow-500 text-white";
  if (index === 1) return "bg-gray-400 text-white";
  if (index === 2) return "bg-amber-600 text-white";
  return "bg-gray-700 text-gray-400";
}

// ────────────────────────────────────────────────
// Props（Server Component から初期データを受け取る）
// ────────────────────────────────────────────────
type Props = {
  initialTopics: Topic[];
  initialPage: number;
  initialLastPage: number;
  categories: Category[];
};

// ────────────────────────────────────────────────
// HomeClient
// ────────────────────────────────────────────────
export default function HomeClient({
  initialTopics,
  initialPage,
  initialLastPage,
  categories,
}: Props) {
  const { user } = useAuth();

  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [lastPage, setLastPage] = useState(initialLastPage);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(false); // SSR初期データがあるため false から開始
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [tabTopics, setTabTopics] = useState<Record<number, Topic[]>>({});

  // 人気トピック: 初期データから posts_count 上位5件
  const [popularTopics, setPopularTopics] = useState<Topic[]>(
    [...initialTopics].sort((a, b) => b.posts_count - a.posts_count).slice(0, 5)
  );

  // ── トピック一覧フェッチ（Route Handler 経由・同一オリジン）──
  const fetchTopics = useCallback((page: number, sortVal: SortOption) => {
    setLoading(true);
    setError(false);
    fetch(`/api/topics?sort=${sortVal}&page=${page}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data: TopicsResponse) => {
        setTopics(data.data ?? []);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
        const sorted = [...(data.data ?? [])].sort((a, b) => b.posts_count - a.posts_count);
        setPopularTopics(sorted.slice(0, 5));
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── カテゴリタブ用トピックフェッチ（Route Handler 経由）──
  useEffect(() => {
    if (categories.length === 0) return;
    categories.forEach((cat) => {
      fetch(`/api/topics?category=${cat.id}&per_page=5`)
        .then((r) => r.json())
        .then((data: TopicsResponse) => {
          setTabTopics((prev) => ({ ...prev, [cat.id]: data.data ?? [] }));
        })
        .catch(() => {});
    });
  }, [categories]);

  // ── ソート変更時のみ再フェッチ（初回マウント時は SSR データを使用）──
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    fetchTopics(1, sort);
    setCurrentPage(1);
  }, [sort, fetchTopics]);

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">

        {/* ── 左メインカラム（2/3） ── */}
        <div className="w-full lg:w-2/3 space-y-8">

          {/* ── ページヘッダー ── */}
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-xl text-gray-100 leading-tight flex items-center gap-2">
              情報共有プラットフォーム
              <span className="text-xs font-normal text-gray-500 ml-2 mt-1">
                政治・経済・エンタメ・スポーツ・その他
              </span>
            </h2>
            {!!user?.is_pro && (
              <Link
                href="/topics/create"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors shadow-sm"
              >
                ＋ 新規トピック作成
              </Link>
            )}
          </div>

          {/* ── カテゴリタブ ── */}
          {categories.length > 0 && (
            <div className="bg-[#1e1f20] rounded-lg border border-transparent overflow-hidden">
              {/* タブヘッダー */}
              <div className="flex overflow-x-auto border-b border-gray-800 scrollbar-hide">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={[
                      "flex-1 min-w-[100px] py-3 px-4 text-center text-sm border-b-2 transition-colors whitespace-nowrap",
                      activeTab === cat.id
                        ? "border-blue-500 text-blue-400 font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-300",
                    ].join(" ")}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* タブコンテンツ */}
              {categories.map((cat) =>
                activeTab === cat.id ? (
                  <div key={cat.id}>
                    {!tabTopics[cat.id] || tabTopics[cat.id].length === 0 ? (
                      <p className="p-6 text-center text-sm text-gray-400">
                        このカテゴリにはまだトピックがありません。
                      </p>
                    ) : (
                      <>
                        <ul className="divide-y divide-gray-800">
                          {tabTopics[cat.id].map((topic) => (
                            <li key={topic.id}>
                              <Link
                                href={`/topics/${topic.id}`}
                                className="block p-4 hover:bg-[#131314] transition-colors group"
                              >
                                <h4 className="font-bold text-gray-100 group-hover:text-blue-400 transition-colors line-clamp-1 mb-1">
                                  {topic.title}
                                </h4>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>{formatDate(topic.created_at)}</span>
                                  <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-400">
                                    💬 {topic.posts_count}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <div className="bg-[#131314] p-2 text-center border-t border-gray-800">
                          <Link
                            href={`/?category=${cat.id}`}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {cat.name}のトピックをもっと見る →
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : null
              )}
            </div>
          )}

          {/* ── トピック一覧 ── */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-100 flex items-center">
                <span className="mr-2">🆕</span> トピック一覧
              </h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-sm rounded-md border border-gray-700 bg-[#131314] text-white py-1 px-2 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="newest">新着順</option>
                <option value="popular">エビデンスが多い順</option>
                <option value="oldest">古い順</option>
              </select>
            </div>

            {loading && (
              <p className="text-zinc-400 text-sm py-6 text-center">読み込み中...</p>
            )}
            {error && (
              <p className="text-red-400 text-sm py-6 text-center">トピックの取得に失敗しました</p>
            )}

            {!loading && !error && (
              <>
                {topics.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 bg-[#1e1f20] rounded-lg">
                    トピックがありません。
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topics.map((topic) => (
                      <div
                        key={topic.id}
                        className="bg-[#1e1f20] rounded-lg border border-transparent p-5 hover:border-gray-700 transition-colors"
                      >
                        <Link href={`/topics/${topic.id}`} className="block group">
                          {/* カテゴリバッジ（複数対応） */}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {topic.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-[#131314] text-indigo-300 border border-gray-800"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>

                          <h4 className="text-xl font-bold text-gray-100 mb-2 group-hover:text-blue-400 transition-colors">
                            {topic.title}
                          </h4>

                          {topic.content && (
                            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                              {topic.content}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>作成: {topic.user.name}</span>
                            <div className="flex items-center space-x-3">
                              <span className="font-bold flex items-center">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                エビデンス {topic.posts_count}件
                              </span>
                              <span>{formatDate(topic.created_at)}</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ページネーション（前へ/次へ） ── */}
                {lastPage > 1 && (
                  <div className="mt-6 flex justify-center items-center gap-4">
                    <button
                      onClick={() => fetchTopics(currentPage - 1, sort)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 text-sm rounded-md bg-[#1e1f20] text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← 前へ
                    </button>
                    <span className="text-sm text-gray-400">
                      {currentPage} / {lastPage}
                    </span>
                    <button
                      onClick={() => fetchTopics(currentPage + 1, sort)}
                      disabled={currentPage >= lastPage}
                      className="px-4 py-2 text-sm rounded-md bg-[#1e1f20] text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      次へ →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 右サイドバー（1/3）sticky ── */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-[#1e1f20] rounded-lg border border-transparent p-5 lg:sticky lg:top-6">
            <h3 className="text-lg font-bold text-gray-100 mb-4 pb-2 border-b border-gray-800 flex items-center">
              <span className="mr-2 text-xl">🔥</span> 総合人気トピック
            </h3>

            {popularTopics.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">まだトピックがありません。</p>
            ) : (
              <ul className="space-y-4">
                {popularTopics.map((topic, index) => (
                  <li key={topic.id}>
                    <Link href={`/topics/${topic.id}`} className="flex items-start group">
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold mr-3 mt-0.5 ${rankBadgeClass(index)}`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-200 group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight mb-1">
                          {topic.title}
                        </h4>
                        <span className="text-xs text-gray-500 font-medium">
                          エビデンス: {topic.posts_count}件
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
