"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  children: Category[];
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}/api/categories`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .finally(() => setFetching(false));
  }, []);

  if (fetching) {
    return (
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-7 bg-white/[0.06] rounded-md w-1/4 mb-3" />
            <div className="h-4 bg-white/[0.04] rounded w-2/5 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 bg-white/[0.04] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg font-bold dark:text-g-text pl-3 border-l-4 border-indigo-500 mb-2">
            カテゴリ一覧
          </h1>
          <p className="text-sm text-gray-600 dark:text-g-sub">
            興味のあるカテゴリを選択すると、関連するトピックを絞り込んで表示します。
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-[#131314]/50 text-center">
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-g-sub font-bold mb-1">
              カテゴリがありません
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              現在、登録されているカテゴリはまだありません。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((parent) => (
              <div
                key={parent.id}
                className="bg-white dark:bg-[#1e1f20] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors duration-100"
              >
                {/* 大分類ヘッダー */}
                <div className="bg-gray-50 dark:bg-[#131314] border-b border-gray-200 dark:border-gray-800 px-4 sm:px-5 py-4">
                  <Link
                    href={`/categories/${parent.id}`}
                    className="flex items-center group cursor-pointer"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-400 mr-3 transition-colors duration-100 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                      />
                    </svg>
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-g-text group-hover:text-indigo-400 transition-colors duration-100 line-clamp-1">
                      {parent.name}
                    </h3>
                  </Link>
                </div>

                {/* 中分類リスト */}
                <div className="p-2 sm:p-3">
                  {parent.children.length > 0 ? (
                    <ul className="space-y-1">
                      {parent.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/categories/${child.id}`}
                            className="flex items-center px-3 py-2.5 sm:py-2 rounded-lg text-sm text-gray-700 dark:text-g-text hover:bg-gray-100 dark:hover:bg-white/[0.04] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-100 group cursor-pointer"
                          >
                            <svg
                              aria-hidden="true"
                              className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 mr-2 transition-colors duration-100 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                            <span className="truncate">{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic px-3 py-2">
                      中分類はありません
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
