"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

type NotificationItem = {
  id: number;
  type: "new_post" | "comment_reply" | "post_like" | "system" | string;
  text: string;
  is_unread: boolean;
  created_at: string;
  topic_id: number | null;
  actor: { id: number; name: string; avatar?: string | null } | null;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

type NotificationsResponse = {
  data: NotificationItem[];
  current_page: number;
  last_page: number;
  has_unread: boolean;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "たった今";
  if (mins < 60) return `${mins}分前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}ヶ月前`;
  return `${Math.floor(months / 12)}年前`;
}

function TypeBadge({ type }: { type: string }) {
  const base =
    "absolute -bottom-0.5 -right-0.5 flex items-center justify-center h-4 w-4 rounded-full border-2 border-white dark:border-[#131314]";

  if (type === "new_post") {
    return (
      <span className={`${base} bg-blue-500`}>
        <svg aria-hidden="true" className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  if (type === "comment_reply") {
    return (
      <span className={`${base} bg-green-500`}>
        <svg aria-hidden="true" className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </span>
    );
  }
  if (type === "post_like") {
    return (
      <span className={`${base} bg-red-500`}>
        <svg aria-hidden="true" className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`${base} bg-yellow-500`}>
      <svg aria-hidden="true" className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [readingAll, setReadingAll] = useState(false);

  const { data: notifData, isLoading: fetching, mutate } = useSWR(
    user ? `${API_BASE}/api/notifications?page=${currentPage}` : null,
    async (url) => {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error();
      return res.json() as Promise<NotificationsResponse>;
    },
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );

  const notifications = notifData?.data ?? [];
  const lastPage = notifData?.last_page ?? 1;
  const hasUnread = notifData?.has_unread ?? false;

  // 未ログインならリダイレクト
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  async function handleReadAll() {
    setReadingAll(true);
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      mutate(
        (prev) =>
          prev
            ? { ...prev, data: prev.data.map((n) => ({ ...n, is_unread: false })), has_unread: false }
            : prev,
        { revalidate: false }
      );
    } finally {
      setReadingAll(false);
    }
  }

  async function handleClick(notification: NotificationItem) {
    // 未読なら既読にする
    if (notification.is_unread) {
      await fetch(`${API_BASE}/api/notifications/${notification.id}/read`, {
        method: "PATCH",
        headers: getAuthHeaders(),
      });
      mutate(
        (prev) => {
          if (!prev) return prev;
          const updatedData = prev.data.map((n) =>
            n.id === notification.id ? { ...n, is_unread: false } : n
          );
          return { ...prev, data: updatedData, has_unread: updatedData.some((n) => n.is_unread) };
        },
        { revalidate: false }
      );
    }
    // 関連トピックへ遷移
    if (notification.topic_id) {
      router.push(`/topics/${notification.topic_id}`);
    }
  }

  if (authLoading || fetching) {
    return (
      <div className="py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-7 bg-white/[0.06] rounded-md w-1/4 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/[0.04] rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* ページヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold dark:text-g-text pl-3 border-l-4 border-indigo-500">
            通知
          </h1>
          {hasUnread && (
            <button
              onClick={handleReadAll}
              disabled={readingAll}
              className="text-xs text-blue-500 hover:text-blue-400 font-bold transition-colors duration-100 disabled:opacity-50 cursor-pointer"
            >
              すべて既読にする
            </button>
          )}
        </div>

        {/* 通知リスト */}
        <div className="rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800/60">
          {notifications.length === 0 ? (
            <div className="py-16 text-center">
              <svg
                aria-hidden="true"
                className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                通知はありません
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`w-full text-left flex items-start gap-3 px-4 py-4 transition-colors duration-100 cursor-pointer ${
                  notification.is_unread
                    ? "bg-blue-50/60 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    : "hover:bg-gray-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                {/* アクターアバター + 種別バッジ */}
                <div className="relative shrink-0 mt-0.5">
                  {notification.actor ? (
                    <div className="h-9 w-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  ) : (
                    // system通知はLOGOSロゴ
                    <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-[11px] font-bold">
                        L
                      </span>
                    </div>
                  )}
                  <TypeBadge type={notification.type} />
                </div>

                {/* テキスト + 時刻 */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] leading-snug ${
                      notification.is_unread
                        ? "text-gray-900 dark:text-g-text font-bold"
                        : "text-gray-600 dark:text-g-sub"
                    }`}
                  >
                    {notification.text}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                    {timeAgo(notification.created_at)}
                  </p>
                </div>

                {/* 未読ドット */}
                <div className="shrink-0 flex items-center self-center pl-2">
                  {notification.is_unread ? (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  ) : (
                    <span className="h-2 w-2" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* ページネーション */}
        {lastPage > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage <= 1 || fetching}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-g-sub border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.04] disabled:opacity-40 transition-colors duration-100 cursor-pointer"
            >
              前へ
            </button>
            <span className="px-4 py-2 text-sm text-gray-500 dark:text-g-sub">
              {currentPage} / {lastPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage >= lastPage || fetching}
              className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-g-sub border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-white/[0.04] disabled:opacity-40 transition-colors duration-100 cursor-pointer"
            >
              次へ
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
