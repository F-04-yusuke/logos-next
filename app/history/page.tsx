"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

type HistoryTopic = {
  id: number;
  title: string;
  categories: { id: number; name: string }[];
  last_viewed_at: string;
};

type HistoryResponse = {
  data: HistoryTopic[];
  current_page: number;
  last_page: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

const DAY_NAMES = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

function getDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((today.getTime() - dateDay.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "今日";
  if (diffDays === 1) return "昨日";
  if (diffDays <= 6) return DAY_NAMES[date.getDay()];
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function groupByDate(topics: HistoryTopic[]): { label: string; topics: HistoryTopic[] }[] {
  const map = new Map<string, HistoryTopic[]>();
  for (const topic of topics) {
    const label = getDateLabel(topic.last_viewed_at);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(topic);
  }
  return Array.from(map.entries()).map(([label, topics]) => ({ label, topics }));
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [topics, setTopics] = useState<HistoryTopic[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [fetching, setFetching] = useState(true);

  function fetchHistory(page: number) {
    setFetching(true);
    fetch(`${API_BASE}/api/history?page=${page}`, { headers: getAuthHeaders() })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: HistoryResponse) => {
        setTopics(data.data);
        setCurrentPage(data.current_page);
        setLastPage(data.last_page);
      })
      .catch(() => {})
      .finally(() => setFetching(false));
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      fetchHistory(1);
    }
  }, [authLoading, user]);

  if (authLoading || fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  const groups = groupByDate(topics);

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:rounded-xl overflow-hidden">
          <div className="p-4 sm:p-8">

            {topics.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <p className="text-gray-500 dark:text-g-sub text-sm font-bold">
                  まだ閲覧履歴はありません。
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  トピックを見ると、ここに履歴が残ります。
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  {groups.map(({ label, topics: groupTopics }) => (
                    <div key={label}>
                      <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-g-text mt-8 mb-3 px-2 border-b border-gray-100 dark:border-gray-800/60 pb-2">
                        {label}
                      </h3>
                      <div className="space-y-1.5">
                        {groupTopics.map((topic) => (
                          <div
                            key={topic.id}
                            className="-ml-3 pl-3 py-3 sm:py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/topics/${topic.id}`}
                                className="font-bold text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors line-clamp-1 block mb-1.5 cursor-pointer"
                              >
                                {topic.title}
                              </Link>
                              <div className="flex flex-wrap gap-1.5">
                                {topic.categories.length > 0 ? (
                                  topic.categories.map((cat) => (
                                    <span
                                      key={cat.id}
                                      className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-[#1e1f20] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700"
                                    >
                                      {cat.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 bg-gray-100 dark:bg-[#1e1f20] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                                    未分類
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ページネーション */}
                {lastPage > 1 && (
                  <div className="mt-8 flex justify-center items-center gap-2">
                    <button
                      onClick={() => fetchHistory(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-bold rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-g-text hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← 前
                    </button>
                    <span className="text-sm text-gray-500 px-2">
                      {currentPage} / {lastPage}
                    </span>
                    <button
                      onClick={() => fetchHistory(currentPage + 1)}
                      disabled={currentPage === lastPage}
                      className="px-4 py-2 text-sm font-bold rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-g-text hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      次 →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
