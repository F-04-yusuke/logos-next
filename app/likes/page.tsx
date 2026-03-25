"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import { PostCard, SharedPost } from "@/components/mypage/PostCard";
import { CommentCard, SharedComment } from "@/components/mypage/CommentCard";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

type Tab = "info" | "comments" | "analysis";

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [likedPosts, setLikedPosts] = useState<SharedPost[]>([]);
  const [likedComments, setLikedComments] = useState<SharedComment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [fetching, setFetching] = useState(true);

  async function handleCommentLike(commentId: number) {
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const result = await res.json();
      setLikedComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, is_liked_by_me: result.liked, likes_count: result.likes_count }
            : c
        )
      );
    }
  }

  async function handlePostLike(postId: number) {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const result = await res.json();
      setLikedPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, is_liked_by_me: result.liked, likes_count: result.likes_count } : p
        )
      );
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      setFetching(true);
      fetch(`${API_BASE}/api/user/likes`, { headers: getAuthHeaders() })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data) => {
          setLikedPosts(Array.isArray(data.posts) ? data.posts : []);
          setLikedComments(Array.isArray(data.comments) ? data.comments : []);
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [authLoading, user]);

  if (authLoading || fetching) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
          <div className="animate-pulse">
            <div className="h-7 bg-white/[0.06] rounded-md w-1/4 mb-6" />
            <div className="h-10 bg-white/[0.04] rounded-md w-full mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/[0.04] rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const indigoTab = (tab: Tab) =>
    activeTab === tab
      ? "border-indigo-500 text-white font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  const yellowTab = (tab: Tab) =>
    activeTab === tab
      ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="sm:rounded-lg overflow-hidden">

          {/* ページヘッダー */}
          <div className="px-4 sm:px-6 pt-2 mb-5">
            <h1 className="text-xl font-bold dark:text-g-text pl-3 border-l-4 border-indigo-500">
              参考になった
            </h1>
          </div>

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto px-4 sm:px-6">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-6 border-b-2 text-base transition-colors duration-100 focus:outline-none whitespace-nowrap cursor-pointer ${indigoTab("info")}`}
            >
              情報 ({likedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 border-b-2 text-base transition-colors duration-100 focus:outline-none whitespace-nowrap cursor-pointer ${indigoTab("comments")}`}
            >
              コメント ({likedComments.length})
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`py-3 px-6 border-b-2 text-base transition-colors duration-100 focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${yellowTab("analysis")}`}
            >
              分析・図解 (0)
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
                PRO
              </span>
            </button>
          </div>

          <div className="p-4 sm:p-6">

            {/* 情報タブ */}
            {activeTab === "info" && (
              <div className="space-y-6">
                {likedPosts.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-base">いいねした情報はありません。</p>
                ) : (
                  likedPosts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard
                        post={post}
                        currentUserId={user?.id}
                        onLike={() => handlePostLike(post.id)}
                      />
                      <div className="text-right px-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-100"
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

            {/* コメントタブ */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                {likedComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-base">いいねしたコメントはありません。</p>
                ) : (
                  likedComments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1.5">
                      <CommentCard
                        comment={comment}
                        currentUserId={user?.id}
                        onLike={() => handleCommentLike(comment.id)}
                      />
                      <div className="text-right px-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${comment.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-100"
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

            {/* 分析・図解タブ */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                <p className="text-center text-gray-500 py-6 text-base">いいねした分析・図解はありません。</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
