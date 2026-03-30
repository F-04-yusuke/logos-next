"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { timeAgo } from "@/lib/utils";

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

type FeaturedPost = {
  id: number;
  title: string;
  topic_id: number;
  topic_title: string | null;
  thumbnail_url: string | null;
  likes_count: number;
  created_at: string;
};

// ────────────────────────────────────────────────
// 日時フォーマット（M/D HH:MM）
// ────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day}(${dow}) ${hh}:${mm}`;
}

// ────────────────────────────────────────────────
// カテゴリの最終更新日時フォーマット
// ────────────────────────────────────────────────
function formatTabUpdated(topics: Topic[]): string {
  if (!topics || topics.length === 0) return "";
  const latest = topics.reduce((a, b) =>
    new Date(a.created_at) > new Date(b.created_at) ? a : b
  );
  const d = new Date(latest.created_at);
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  const m = d.getMonth() + 1;
  const date = d.getDate();
  const day = days[d.getDay()];
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${date}(${day}) ${hh}:${mm}更新`;
}

// ────────────────────────────────────────────────
// ランクバッジ（金銀銅グラデーション）
// ────────────────────────────────────────────────
function rankBadgeClass(index: number): string {
  if (index === 0)
    return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-sm shadow-yellow-900/30";
  if (index === 1)
    return "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 shadow-sm";
  if (index === 2)
    return "bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-sm shadow-amber-900/30";
  return "bg-[#2a2b2c] text-gray-500";
}

// ────────────────────────────────────────────────
// スケルトンローダー
// ────────────────────────────────────────────────
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

// ────────────────────────────────────────────────
// カテゴリタブ: 最多いいね投稿パネル（右側）
// ────────────────────────────────────────────────
function FeaturedTopicPanel({ post }: { post: FeaturedPost | null | undefined }) {
  if (!post) return null;
  return (
    <div className="hidden sm:flex flex-col w-48 xl:w-52 shrink-0 pt-4 pr-4 pb-3 pl-3 overflow-hidden">
      <Link href={`/topics/${post.topic_id}`} className="flex flex-col group cursor-pointer">
        {post.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.thumbnail_url}
            alt={post.title ?? ""}
            className="w-full aspect-[16/9] rounded-md object-cover mb-2"
            fetchPriority="high"
            loading="eager"
          />
        ) : (
          <div className="w-full aspect-[16/9] rounded-md bg-gradient-to-br from-indigo-900/70 via-blue-900/50 to-indigo-800/60 border border-indigo-500/20 mb-2 flex items-center justify-center">
            <svg className="w-10 h-10 text-indigo-300/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )}
        <p className="text-base font-bold text-g-text group-hover:underline line-clamp-2 leading-snug">
          {post.topic_title}
        </p>
        <p className="text-xs text-g-sub mt-1">{formatDate(post.created_at)}</p>
      </Link>
    </div>
  );
}

// ────────────────────────────────────────────────
// Props
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState<number | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [tabTopics, setTabTopics] = useState<Record<number, Topic[]>>({});
  const [featuredPosts, setFeaturedPosts] = useState<Record<number, FeaturedPost | null>>({});

  const [popularTopics, setPopularTopics] = useState<Topic[]>(
    [...initialTopics].sort((a, b) => b.posts_count - a.posts_count).slice(0, 5)
  );


  // ── トピック一覧フェッチ ──
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

  // ── カテゴリタブ用フェッチ ──
  useEffect(() => {
    if (categories.length === 0) return;
    categories.forEach((cat) => {
      fetch(`/api/topics?category=${cat.id}&per_page=8`)
        .then((r) => r.json())
        .then((data: TopicsResponse) => {
          setTabTopics((prev) => ({ ...prev, [cat.id]: data.data ?? [] }));
        })
        .catch(() => {});

      fetch(`/api/categories/${cat.id}/featured-post`)
        .then((r) => r.json())
        .then((data: FeaturedPost | null) => {
          setFeaturedPosts((prev) => ({ ...prev, [cat.id]: data }));
        })
        .catch(() => {});
    });
  }, [categories]);

  // ── ソート変更時のみ再フェッチ（初回は SSR データを使用）──
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
        <div className="w-full lg:w-2/3 min-w-0 space-y-8">

          {/* ── ページヘッダー ── */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-bold text-2xl text-g-text leading-tight">
                情報共有プラットフォーム
              </h2>
              <p className="text-sm text-g-sub mt-1">
                政治・経済・エンタメ・スポーツ・その他
              </p>
            </div>
            {!!user?.is_pro && (
              <Link
                href="/topics/create"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-base transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                新規トピック作成
              </Link>
            )}
          </div>

          {/* ── カテゴリタブ ── */}
          {categories.length > 0 && (
            <div className="rounded-xl overflow-hidden border border-white/[0.08]">
              {/* タブヘッダー: ピル型 + 横スクロール */}
              <div
                className="flex gap-1.5 px-2 py-2 bg-[#1e1f20] overflow-x-auto border-b border-white/[0.06]"
                style={{ scrollbarWidth: "none" }}
              >
                {categories.map((cat) => {
                  const isActive = activeTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveTab(cat.id)}
                      className={[
                        "shrink-0 px-4 py-1.5 text-sm font-bold rounded-full whitespace-nowrap cursor-pointer transition-all duration-150",
                        isActive
                          ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/50"
                          : "text-g-sub hover:text-g-text hover:bg-white/[0.06]",
                      ].join(" ")}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* タブコンテンツ */}
              <div className="bg-[#131314]">
              {categories.map((cat) =>
                activeTab === cat.id ? (
                  <div key={cat.id}>
                    {!tabTopics[cat.id] ? (
                      // カテゴリ読み込み中スケルトン
                      <div className="flex min-h-[260px]">
                        <div className="flex-1 p-3 space-y-1 animate-pulse">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-7 rounded bg-white/[0.05]" />
                          ))}
                        </div>
                        <div className="hidden sm:block w-48 xl:w-52 shrink-0 p-3 border-l border-white/[0.06] animate-pulse">
                          <div className="w-full aspect-[4/3] rounded-md bg-white/[0.05] mb-2" />
                          <div className="h-3 rounded bg-white/[0.05] mb-1.5" />
                          <div className="h-3 rounded bg-white/[0.05] w-2/3" />
                        </div>
                      </div>
                    ) : tabTopics[cat.id].length === 0 ? (
                      <p className="p-6 text-center text-sm text-g-sub min-h-[260px] flex items-center justify-center">
                        このカテゴリにはまだトピックがありません。
                      </p>
                    ) : (
                      <div className="flex min-h-[260px] items-stretch">
                        {/* 左: トピックリスト */}
                        <div className="flex-1 min-w-0 flex flex-col pt-1.5 pb-2">
                          {formatTabUpdated(tabTopics[cat.id]) && (
                            <p className="px-4 pb-1 text-xs text-g-sub">{formatTabUpdated(tabTopics[cat.id])}</p>
                          )}
                          <ul className="flex-1">
                            {tabTopics[cat.id].map((topic) => (
                              <li key={topic.id}>
                                <Link
                                  href={`/topics/${topic.id}`}
                                  className="flex items-center px-4 py-1 group cursor-pointer overflow-hidden"
                                >
                                  <span className="text-gray-300 shrink-0 mr-1 select-none text-base">・</span>
                                  <span className="text-base leading-snug truncate">
                                    <span className="font-medium text-[#A8C7FA] group-hover:underline">{topic.title}</span>
                                    <span className="ml-2 inline-flex items-center gap-0.5 text-sm text-gray-300 tabular-nums">
                                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                      </svg>
                                      {topic.posts_count}
                                    </span>
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          <div className="px-4 pt-2">
                            <Link
                              href={`/categories/${cat.id}`}
                              className="text-sm text-white hover:underline cursor-pointer"
                            >
                              {cat.name}のトピックをもっと見る →
                            </Link>
                          </div>
                        </div>

                        {/* 右: 最多いいね投稿パネル */}
                        <FeaturedTopicPanel post={featuredPosts[cat.id]} />
                      </div>
                    )}
                  </div>
                ) : null
              )}
              </div>
            </div>
          )}

          {/* ── トピック一覧 ── */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-bold text-g-text flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-blue-500 inline-block" />
                トピック一覧
              </h3>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-sm sm:text-base rounded border border-gray-700 bg-[#131314] text-white px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-[#1e1f20] transition-colors focus:outline-none focus:border-gray-500"
              >
                <option value="newest">新着順</option>
                <option value="popular">エビデンスが多い順</option>
                <option value="oldest">古い順</option>
              </select>
            </div>

            {loading && <TopicSkeleton />}
            {error && (
              <p className="text-red-400 text-base py-6 text-center">
                トピックの取得に失敗しました
              </p>
            )}

            {!loading && !error && (
              <>
                {topics.length === 0 ? (
                  <div className="py-12 text-center text-g-sub">
                    トピックがありません。
                  </div>
                ) : (
                  <div>
                    {topics.map((topic) => (
                      <Link
                        key={topic.id}
                        href={`/topics/${topic.id}`}
                        className="block -ml-3 pl-3 pr-4 py-4 hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      >
                        {/* カテゴリバッジ */}
                        {topic.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {topic.categories.map((cat) => (
                              <span
                                key={cat.id}
                                className="inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                              >
                                {cat.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <h4 className="text-lg font-bold text-g-text mb-1.5 group-hover:text-[#A8C7FA] transition-colors leading-snug">
                          {topic.title}
                        </h4>

                        {topic.content && (
                          <p className="text-base text-g-sub line-clamp-2 mb-2 leading-relaxed">
                            {topic.content}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-g-sub">
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            エビデンス {topic.posts_count}件
                          </span>
                          <span className="text-white/20">·</span>
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
                      className="px-4 py-2 text-base rounded-lg bg-[#1e1f20] text-g-sub hover:bg-white/[0.08] hover:text-g-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      ← 前へ
                    </button>
                    <span className="text-base text-g-sub px-2">
                      {currentPage} / {lastPage}
                    </span>
                    <button
                      onClick={() => fetchTopics(currentPage + 1, sort)}
                      disabled={currentPage >= lastPage}
                      className="px-4 py-2 text-base rounded-lg bg-[#1e1f20] text-g-sub hover:bg-white/[0.08] hover:text-g-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
        <div className="w-full lg:w-1/3">
          <div className="lg:sticky lg:top-6">
            <h3 className="text-lg font-bold text-g-text mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
              人気トピック
            </h3>

            {popularTopics.length === 0 ? (
              <p className="text-base text-g-sub text-center py-4">
                まだトピックがありません。
              </p>
            ) : (
              <ul className="space-y-1">
                {popularTopics.map((topic, index) => (
                  <li key={topic.id}>
                    <Link
                      href={`/topics/${topic.id}`}
                      className="flex items-start gap-3 -ml-2 pl-2 pr-3 py-3 hover:bg-white/[0.04] rounded-xl transition-colors group cursor-pointer"
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-sm font-bold mt-0.5 ${rankBadgeClass(index)}`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-g-text group-hover:text-[#A8C7FA] transition-colors line-clamp-2 leading-snug mb-1">
                          {topic.title}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-g-sub">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            {topic.posts_count}件
                          </span>
                          <span>·</span>
                          <span>{timeAgo(topic.created_at)}</span>
                        </div>
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
