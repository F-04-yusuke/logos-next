"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

// ===== Types =====

type DashboardPost = {
  id: number;
  url: string;
  title: string | null;
  thumbnail_url: string | null;
  category: string;
  comment: string | null;
  supplement: string | null;
  is_published: boolean;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  topic: { id: number; title: string };
};

type DashboardReply = {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

type DashboardComment = {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  replies: DashboardReply[];
  topic: { id: number; title: string };
};

type DashboardTopic = {
  id: number;
  title: string;
  created_at: string;
};

type DashboardData = {
  posts: DashboardPost[];
  drafts: DashboardPost[];
  draft_count: number;
  comments: DashboardComment[];
  analyses: unknown[];
  topics: DashboardTopic[];
};

type Tab = "posts" | "drafts" | "comments" | "analyses" | "topics";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

// ===== Helpers =====

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

// ===== Sub-components =====

function UserAvatar({
  user,
  size = "sm",
}: {
  user: { name: string; avatar?: string | null };
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-10 w-10" : "h-6 w-6";
  const icon = size === "md" ? "h-6 w-6" : "h-4 w-4";
  return user.avatar ? (
    <img
      className={`${dim} rounded-full object-cover border border-gray-200 dark:border-gray-700`}
      src={user.avatar}
      alt={`${user.name}のアイコン`}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className={`${icon} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}

function ThumbUpIcon({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={cls}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 10.25h1.5v9h-1.5v-9Z"
      />
    </svg>
  );
}

function PostCard({
  post,
  isDraft = false,
}: {
  post: DashboardPost;
  isDraft?: boolean;
}) {
  return (
    <div
      className={`p-3 bg-white dark:bg-[#1e1f20] rounded-lg border shadow-sm flex flex-col md:flex-row gap-3 transition-colors ${
        isDraft
          ? "border-dashed border-yellow-300 dark:border-yellow-700"
          : "border-gray-200 dark:border-transparent"
      }`}
    >
      {/* サムネイル */}
      <div className="md:w-1/4 flex-shrink-0">
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="block group">
          {post.thumbnail_url ? (
            <div className="w-full aspect-video rounded-md overflow-hidden mb-2 bg-gray-100 dark:bg-gray-800">
              <img
                src={post.thumbnail_url}
                alt="サムネイル"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-100 dark:bg-[#131314] rounded-md mb-2 flex flex-col items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700 group-hover:border-gray-500 transition-colors">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <span className="text-xs">No Image</span>
            </div>
          )}
          <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 line-clamp-2 leading-tight transition-colors">
            {post.title || "タイトルを取得できませんでした"}
          </h4>
        </a>
      </div>

      {/* 本文 */}
      <div className="md:w-3/4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserAvatar user={post.user} size="sm" />
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[13px] text-gray-900 dark:text-gray-100">
                {post.user.name}
              </span>
              <span className="text-[11px] text-gray-500">{timeAgo(post.created_at)}</span>
            </div>
            <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400">
              {post.category}
            </span>
          </div>
          {post.comment && (
            <div className="text-[13px] text-gray-800 dark:text-gray-300 whitespace-pre-wrap mt-1 leading-relaxed">
              {post.comment}
            </div>
          )}
          {post.supplement && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800/50 text-sm">
              <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] block mb-1" aria-hidden="true">
                ✅ 投稿者からの補足
              </span>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.supplement}</p>
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-end gap-3">
          <div className="flex items-center space-x-1 text-gray-900 dark:text-white font-bold py-1 px-2">
            <span className="sr-only">いいね</span>
            <ThumbUpIcon size="md" />
            {post.likes_count > 0 && (
              <span className="text-sm" aria-hidden="true">{post.likes_count}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyItem({ reply }: { reply: DashboardReply }) {
  return (
    <div className="flex gap-3 items-start py-3 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
      <div className="shrink-0 mt-0.5">
        <UserAvatar user={reply.user} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-[12px] text-gray-900 dark:text-gray-100">
            {reply.user.name}
          </span>
          <span className="text-[11px] text-gray-500">{timeAgo(reply.created_at)}</span>
        </div>
        <p className="text-[13px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {reply.body}
        </p>
        {reply.likes_count > 0 && (
          <div className="mt-1.5 flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <ThumbUpIcon size="sm" />
            <span className="text-xs">{reply.likes_count}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: DashboardComment }) {
  return (
    <div className="bg-white dark:bg-[#1e1f20] px-4 rounded-lg border border-gray-200 dark:border-transparent shadow-sm">
      <div className="flex gap-4 items-start py-4">
        <div className="shrink-0 mt-1">
          <UserAvatar user={comment.user} size="md" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-[13px] text-gray-900 dark:text-gray-100">
              {comment.user.name}
            </span>
            <span className="text-[11px] text-gray-500">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[14px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {comment.body}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center space-x-1 text-gray-900 dark:text-white font-bold py-1 pr-2">
              <span className="sr-only">いいね</span>
              <ThumbUpIcon size="sm" />
              {comment.likes_count > 0 && (
                <span className="text-xs sm:text-sm" aria-hidden="true">
                  {comment.likes_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="pb-3 space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
          {comment.replies.map((reply) => (
            <ReplyItem key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Main Component =====

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      setFetching(true);
      fetch(`${API_BASE}/api/dashboard`, { headers: getAuthHeaders() })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d: DashboardData) => setData(d))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [authLoading, user]);

  async function deleteDraft(postId: number) {
    if (!window.confirm("下書きを削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({
        ...data,
        drafts: data.drafts.filter((p) => p.id !== postId),
        draft_count: data.draft_count - 1,
      });
    }
  }

  async function deleteTopic(topicId: number) {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/topics/${topicId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({ ...data, topics: data.topics.filter((t) => t.id !== topicId) });
    }
  }

  if (authLoading || fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  const posts = data?.posts ?? [];
  const drafts = data?.drafts ?? [];
  const draftCount = data?.draft_count ?? 0;
  const comments = data?.comments ?? [];
  const topics = data?.topics ?? [];

  const blueTab = (tab: Tab) =>
    activeTab === tab
      ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  const yellowTab = (tab: Tab) =>
    activeTab === tab
      ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#1e1f20] shadow-sm sm:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap ${blueTab("posts")}`}
            >
              投稿した情報
            </button>

            <button
              onClick={() => setActiveTab("drafts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center gap-1.5 ${yellowTab("drafts")}`}
            >
              下書き
              {draftCount > 0 && (
                <span className="text-[10px] font-black bg-yellow-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {draftCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap ${blueTab("comments")}`}
            >
              自分のコメント
            </button>

            <button
              onClick={() => setActiveTab("analyses")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center ${yellowTab("analyses")}`}
            >
              作成した分析・図解
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-black tracking-wider">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("topics")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center ${blueTab("topics")}`}
            >
              作成したトピック
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-black tracking-wider">
                PRO
              </span>
            </button>
          </div>

          <div className="p-4 sm:p-6">

            {/* 投稿した情報 */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ投稿した情報はありません。
                  </p>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard post={post} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            {post.topic.title}
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 下書き */}
            {activeTab === "drafts" && (
              <div className="space-y-4">
                {drafts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-sm mb-2">下書きはありません。</p>
                    <p className="text-xs text-gray-400">
                      エビデンス投稿時に「下書き保存」を選ぶと、ここに一覧表示されます。
                    </p>
                  </div>
                ) : (
                  drafts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard post={post} isDraft />
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                            下書き
                          </span>
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-xs font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 border border-yellow-300 dark:border-yellow-700 hover:border-yellow-400 py-1 px-3 rounded-md transition-colors flex items-center gap-1"
                          >
                            <svg
                              aria-hidden="true"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            編集・本投稿
                          </Link>
                          <button
                            onClick={() => deleteDraft(post.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors py-1 px-2"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                            🔗 投稿先:{" "}
                            <Link
                              href={`/topics/${post.topic.id}`}
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              {post.topic.title}
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 自分のコメント */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだコメントしていません。
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1.5">
                      <CommentCard comment={comment} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${comment.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            {comment.topic.title}
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 作成した分析・図解（PRO） */}
            {activeTab === "analyses" && (
              <div className="space-y-6">
                <p className="text-gray-500 text-center py-10 text-sm">
                  まだ作成した分析・図解はありません。
                </p>
              </div>
            )}

            {/* 作成したトピック（PRO） */}
            {activeTab === "topics" && (
              <div className="space-y-3">
                {topics.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ作成したトピックはありません。
                  </p>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="p-4 bg-white dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-gray-800 flex justify-between items-center shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {user && <UserAvatar user={user} size="sm" />}
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[13px] text-gray-900 dark:text-gray-100">
                              {user?.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {timeAgo(topic.created_at)}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/topics/${topic.id}`}
                          className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 dark:text-gray-600 font-bold">
                          編集
                        </span>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
