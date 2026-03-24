"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";

type LikedPost = {
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

type LikedComment = {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  topic: { id: number; title: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

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

function ThumbUpIcon({ filled, size = "md" }: { filled: boolean; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill={filled ? "currentColor" : "none"}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={cls}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
    </svg>
  );
}

function PostCard({ post }: { post: LikedPost }) {
  const [openComment, setOpenComment] = useState(false);
  const [openSupplementView, setOpenSupplementView] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const commentRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = commentRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [post.comment]);

  const domain = (() => {
    try { return new URL(post.url).hostname; } catch { return ""; }
  })();
  const isYoutube = domain.includes("youtube.com") || domain.includes("youtu.be");
  const isX = domain.includes("x.com") || domain.includes("twitter.com");

  return (
    <div className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
      <div className="flex flex-col md:flex-row gap-4 min-h-[170px]">
        {/* 左列: サムネイル + タイトル */}
        <div className="md:w-[30%] flex-shrink-0">
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="block group mb-2">
            {post.thumbnail_url ? (
              <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img src={post.thumbnail_url} alt="サムネイル" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : isYoutube ? (
              <div className="w-full aspect-video bg-white rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700 group-hover:border-gray-400 transition-colors">
                <svg viewBox="0 0 90 20" xmlns="http://www.w3.org/2000/svg" className="w-24" aria-label="YouTube">
                  <path d="M27.97 3.06S27.68 1.1 26.84.24C25.78-.89 24.59-.9 24.04-.84 20.1-.56 14.54-.56 14.54-.56h-.01s-5.56 0-9.5-.28C4.48-.9 3.3-.89 2.23.24 1.39 1.1 1.1 3.06 1.1 3.06S.8 5.35.8 7.64v2.14c0 2.29.3 4.58.3 4.58s.29 1.96 1.13 2.82c1.07 1.13 2.48 1.1 3.11 1.21 2.26.22 9.6.29 9.6.29s5.57-.01 9.51-.29c.55-.07 1.74-.07 2.8-1.21.84-.86 1.13-2.82 1.13-2.82s.3-2.29.3-4.58V7.64c0-2.29-.3-4.58-.3-4.58zM11.52 13.27V5.87l7.56 3.71-7.56 3.69z" fill="#FF0000"/>
                  <path d="M35.4 12.69V4.94h1.82l2.44 5.37 2.43-5.37h1.81v7.75H42.4V7.25l-2.14 5.44h-1.2L36.9 7.25v5.44H35.4zm13.25.14c-.81 0-1.49-.22-2.04-.67-.55-.45-.82-1.12-.82-2.02V8.66c0-.85.27-1.52.81-2.01.54-.49 1.22-.73 2.05-.73.83 0 1.51.24 2.04.72.53.48.8 1.15.8 2.02v1.48h-4.16v.4c0 .39.1.69.3.92.2.22.5.33.88.33.3 0 .55-.07.73-.21.18-.14.3-.33.36-.58l1.8.19c-.13.56-.42 1-.87 1.32-.45.32-1.03.49-1.75.49zm-.01-6.44c-.34 0-.61.1-.82.31-.2.2-.31.49-.31.87v.36h2.26V7.53c0-.38-.1-.67-.31-.87-.21-.21-.48-.31-.82-.31zm5.25 6.3V6.06h1.54v.77c.36-.56.87-.85 1.53-.85.52 0 .93.16 1.23.49.3.33.45.79.45 1.39v4.83H56.1V8.07c0-.29-.07-.52-.2-.68-.13-.16-.32-.24-.57-.24-.26 0-.5.1-.71.31-.21.21-.31.49-.31.84v4.43H53.9zm8.17-7.75v1.7h1.1v1.24h-1.1v3.46c0 .24.05.41.15.5.1.09.28.14.55.14h.4v1.3h-.78c-.63 0-1.1-.14-1.4-.43-.3-.28-.46-.73-.46-1.35V7.88H59.6V6.64h.92V4.94h1.54zm4.7 7.89c-.81 0-1.49-.22-2.04-.67-.55-.45-.82-1.12-.82-2.02V8.66c0-.85.27-1.52.81-2.01.54-.49 1.22-.73 2.05-.73.83 0 1.51.24 2.04.72.53.48.8 1.15.8 2.02v1.48h-4.16v.4c0 .39.1.69.3.92.2.22.5.33.88.33.3 0 .55-.07.73-.21.18-.14.3-.33.36-.58l1.8.19c-.13.56-.42 1-.87 1.32-.45.32-1.03.49-1.75.49zm-.01-6.44c-.34 0-.61.1-.82.31-.2.2-.31.49-.31.87v.36h2.26V7.53c0-.38-.1-.67-.31-.87-.21-.21-.48-.31-.82-.31zm4.17 6.3V6.06h1.54v.85c.16-.3.4-.54.71-.7.31-.16.65-.24 1.01-.24.1 0 .19.01.27.02v1.6c-.14-.04-.28-.06-.42-.06-.42 0-.77.14-1.04.41-.27.27-.41.62-.41 1.05v3.7H70.93zm5.67 0V6.06h1.54v6.63H76.6zm0-7.64v-1.5h1.54v1.5H76.6zm5.29 7.78c-.81 0-1.49-.22-2.04-.67-.55-.45-.82-1.12-.82-2.02V8.66c0-.85.27-1.52.81-2.01.54-.49 1.22-.73 2.05-.73.83 0 1.51.24 2.04.72.53.48.8 1.15.8 2.02v1.48h-4.16v.4c0 .39.1.69.3.92.2.22.5.33.88.33.3 0 .55-.07.73-.21.18-.14.3-.33.36-.58l1.8.19c-.13.56-.42 1-.87 1.32-.45.32-1.03.49-1.75.49zm-.01-6.44c-.34 0-.61.1-.82.31-.2.2-.31.49-.31.87v.36h2.26V7.53c0-.38-.1-.67-.31-.87-.21-.21-.48-.31-.82-.31z" fill="#282828"/>
                </svg>
              </div>
            ) : isX ? (
              <div className="w-full aspect-video bg-black rounded-md flex items-center justify-center border border-gray-700 group-hover:border-gray-500 transition-colors">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" aria-label="X" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gray-100 dark:bg-[#131314] rounded-md flex flex-col items-center justify-center text-gray-400 border border-gray-200 dark:border-gray-700 group-hover:border-gray-500 transition-colors">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs">No Image</span>
              </div>
            )}
          </a>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="group">
            <h4 className="font-bold text-sm text-gray-900 dark:text-g-text group-hover:text-blue-500 dark:group-hover:text-blue-400 line-clamp-2 leading-tight transition-colors">
              {post.title || "タイトルを取得できませんでした"}
            </h4>
          </a>
        </div>

        {/* 右列: ユーザー情報・概要・アクション */}
        <div className="md:w-[70%] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-2 cursor-pointer">
                <UserAvatar user={post.user} size="sm" />
                <span className="text-[13px] text-gray-900 dark:text-g-text">{post.user.name}</span>
              </div>
              <span className="text-[11px] text-gray-500 dark:text-g-sub">{timeAgo(post.created_at)}</span>
              <span className="ml-2 inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-g-sub">
                {post.category}
              </span>
            </div>
            {post.comment && (
              <div className="mt-2 break-all">
                <p
                  ref={commentRef}
                  className={`text-[15px] text-gray-800 dark:text-g-text leading-relaxed${openComment ? "" : " line-clamp-3"}`}
                >
                  {post.comment}
                </p>
                {!openComment && isTruncated && (
                  <button type="button" onClick={() => setOpenComment(true)} className="text-[13px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/[0.05] transition-colors mt-1 px-2 py-1.5 rounded-full cursor-pointer">
                    続きを読む
                  </button>
                )}
                {openComment && (
                  <button type="button" onClick={() => setOpenComment(false)} className="text-[13px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/[0.05] transition-colors mt-1 px-2 py-1.5 rounded-full cursor-pointer">
                    閉じる
                  </button>
                )}
              </div>
            )}
          </div>

          {/* アクション行 */}
          <div className="mt-2 flex items-center">
            {post.supplement && (
              <button type="button" onClick={() => setOpenSupplementView((v) => !v)} className="text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] transition-colors py-1 px-2 rounded-full cursor-pointer">
                📎 補足あり {openSupplementView ? "▲" : "▼"}
              </button>
            )}
            <div className="ml-auto flex items-center gap-3 pr-2">
              <div className="flex items-center space-x-1 text-gray-500 dark:text-g-sub py-1 px-2">
                <span className="sr-only">いいね済み</span>
                <ThumbUpIcon filled size="md" />
                {post.likes_count > 0 && <span className="text-sm" aria-hidden="true">{post.likes_count}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 補足展開 */}
      {post.supplement && openSupplementView && (
        <div className="flex md:gap-4">
          <div className="hidden md:block md:w-[30%] flex-shrink-0" />
          <div className="flex-1 pt-2 pb-1">
            <span className="text-xs text-gray-500 dark:text-g-sub block mb-1">投稿者からの補足</span>
            <p className="text-[13px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">{post.supplement}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function CommentCard({ comment }: { comment: LikedComment }) {
  return (
    <div className="-ml-3 pl-3 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-4 items-start py-4">
        <div className="shrink-0 mt-1">
          <UserAvatar user={comment.user} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-[13px] text-gray-900 dark:text-g-text">{comment.user.name}</span>
            <span className="text-[11px] text-gray-500">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[15px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
            {comment.body}
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center space-x-1 text-gray-900 dark:text-white font-bold py-1 pr-2">
              <span className="sr-only">いいね</span>
              <ThumbUpIcon filled size="sm" />
              {comment.likes_count > 0 && (
                <span className="text-xs sm:text-sm" aria-hidden="true">{comment.likes_count}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type Tab = "info" | "comments" | "analysis";

export default function LikesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [likedPosts, setLikedPosts] = useState<LikedPost[]>([]);
  const [likedComments, setLikedComments] = useState<LikedComment[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const [fetching, setFetching] = useState(true);

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
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  const tabClass = (tab: Tab) =>
    activeTab === tab
      ? "border-gray-900 text-gray-900 dark:border-gray-200 dark:text-white font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300";

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="sm:rounded-lg overflow-hidden">

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${tabClass("info")}`}
            >
              情報 ({likedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${tabClass("comments")}`}
            >
              コメント ({likedComments.length})
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${tabClass("analysis")}`}
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
                  <p className="text-center text-gray-500 py-6 text-sm">いいねした情報はありません。</p>
                ) : (
                  likedPosts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard post={post} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-g-sub">
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

            {/* コメントタブ */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                {likedComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-6 text-sm">いいねしたコメントはありません。</p>
                ) : (
                  likedComments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1.5">
                      <CommentCard comment={comment} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-g-sub">
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

            {/* 分析・図解タブ */}
            {activeTab === "analysis" && (
              <div className="space-y-6">
                <p className="text-center text-gray-500 py-6 text-sm">いいねした分析・図解はありません。</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
