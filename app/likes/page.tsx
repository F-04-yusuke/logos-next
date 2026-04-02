"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PostCard, SharedPost } from "@/components/mypage/PostCard";
import { CommentCard, SharedComment } from "@/components/mypage/CommentCard";

const PROXY_BASE = "/api/proxy";

type Tab = "info" | "comments" | "analysis";

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [likedPosts, setLikedPosts] = useState<SharedPost[]>([]);
  const [likedComments, setLikedComments] = useState<SharedComment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [fetching, setFetching] = useState(true);

  async function handleCommentLike(commentId: number) {
    const res = await fetch(`${PROXY_BASE}/comments/${commentId}/like`, {
      method: "POST",
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
    const res = await fetch(`${PROXY_BASE}/posts/${postId}/like`, {
      method: "POST",
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
      fetch(`${PROXY_BASE}/user/likes`)
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
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-7 bg-logos-skeleton rounded-md w-1/4 mb-6" />
            <div className="h-10 bg-logos-skeleton-light rounded-md w-full mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-logos-skeleton-light rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tabClass = (tab: Tab, color: "indigo" | "yellow" = "indigo") => {
    const base =
      "py-2.5 px-4 sm:px-5 text-base font-semibold transition-all duration-150 focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer -mb-px border-b-2";
    if (activeTab === tab) {
      return `${base} ${color === "yellow" ? "border-yellow-500" : "border-indigo-500"} text-logos-text`;
    }
    return `${base} border-transparent text-logos-sub hover:text-logos-text hover:border-logos-border`;
  };

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ページヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
            <span
              className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0"
              aria-hidden="true"
            />
            参考になった
          </h1>
        </div>

        {/* タブ */}
        <div className="flex border-b border-logos-border overflow-x-auto overflow-y-hidden">
          <button
            onClick={() => setActiveTab("info")}
            className={tabClass("info")}
          >
            情報 ({likedPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={tabClass("comments")}
          >
            コメント ({likedComments.length})
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={tabClass("analysis", "yellow")}
          >
            分析・図解 (0)
            <span className="text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-400 px-1 py-0.5 rounded font-bold tracking-wider">
              PRO
            </span>
          </button>
        </div>

        {/* タブコンテンツ */}
        <div className="pt-4 sm:pt-6">

          {/* 情報タブ */}
          {activeTab === "info" && (
            <div className="space-y-6">
              {likedPosts.length === 0 ? (
                <p className="text-center text-logos-sub py-6 text-base">いいねした情報はありません。</p>
              ) : (
                likedPosts.map((post) => (
                  <div key={post.id} className="flex flex-col gap-1.5">
                    <PostCard
                      post={post}
                      currentUserId={user?.id}
                      onLike={() => handlePostLike(post.id)}
                    />
                    <div className="text-right px-2">
                      <span className="text-sm sm:text-base font-bold text-logos-sub">
                        🔗 投稿先トピック:{" "}
                        <Link
                          href={`/topics/${post.topic.id}`}
                          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-100"
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
                <p className="text-center text-logos-sub py-6 text-base">いいねしたコメントはありません。</p>
              ) : (
                likedComments.map((comment) => (
                  <div key={comment.id} className="flex flex-col gap-1.5">
                    <CommentCard
                      comment={comment}
                      currentUserId={user?.id}
                      onLike={() => handleCommentLike(comment.id)}
                    />
                    <div className="text-right px-2">
                      <span className="text-sm sm:text-base font-bold text-logos-sub">
                        🔗 投稿先トピック:{" "}
                        <Link
                          href={`/topics/${comment.topic.id}`}
                          className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-100"
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
              <p className="text-center text-logos-sub py-6 text-base">いいねした分析・図解はありません。</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
