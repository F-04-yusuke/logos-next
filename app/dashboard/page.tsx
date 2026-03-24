"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import { UserAvatar } from "@/components/UserAvatar";

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

type DashboardAnalysis = {
  id: number;
  title: string;
  type: "tree" | "matrix" | "swot";
  is_published: boolean;
  topic_id: number | null;
  created_at: string;
};

type DashboardData = {
  posts: DashboardPost[];
  drafts: DashboardPost[];
  draft_count: number;
  comments: DashboardComment[];
  analyses: DashboardAnalysis[];
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
    <div
      className={`-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors${
        isDraft ? " border-l-2 border-yellow-400 dark:border-yellow-600" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4 min-h-[170px]">
        {/* 左列: サムネイル + タイトル */}
        <div className="md:w-[30%] flex-shrink-0">
          {isDraft && !post.thumbnail_url ? (
            <div className="w-full aspect-video bg-gray-100 dark:bg-[#131314] rounded-md mb-2 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-yellow-300 dark:border-yellow-700">
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-500">準備中</span>
            </div>
          ) : (
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
          )}
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="group">
            <h4 className="font-bold text-sm text-gray-900 dark:text-g-text group-hover:text-blue-500 dark:group-hover:text-blue-400 line-clamp-2 leading-tight transition-colors">
              {isDraft && !post.title
                ? "※本投稿時にサムネイルとタイトルを自動取得します"
                : (post.title || "タイトルを取得できませんでした")}
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
                <span className="sr-only">いいね数</span>
                <ThumbUpIcon size="md" />
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

function ReplyItem({ reply }: { reply: DashboardReply }) {
  return (
    <div className="flex gap-3 items-start py-3 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
      <div className="shrink-0 mt-0.5">
        <UserAvatar user={reply.user} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-[12px] text-gray-900 dark:text-g-text">
            {reply.user.name}
          </span>
          <span className="text-[11px] text-gray-500">{timeAgo(reply.created_at)}</span>
        </div>
        <p className="text-[13px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
          {reply.body}
        </p>
        {reply.likes_count > 0 && (
          <div className="mt-1.5 flex items-center space-x-1 text-gray-500 dark:text-g-sub">
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
    <div className="-ml-3 pl-3 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
      <div className="flex gap-4 items-start py-4">
        <div className="shrink-0 mt-1">
          <UserAvatar user={comment.user} size="lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="font-bold text-[13px] text-gray-900 dark:text-g-text">
              {comment.user.name}
            </span>
            <span className="text-[11px] text-gray-500">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-[15px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
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

  // 下書き編集モーダル
  const [editingDraft, setEditingDraft] = useState<DashboardPost | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  function openDraftEdit(post: DashboardPost) {
    setEditingDraft(post);
    setEditUrl(post.url);
    setEditCategory(post.category);
    setEditComment(post.comment ?? "");
  }

  function closeDraftEdit() {
    setEditingDraft(null);
    setEditUrl("");
    setEditCategory("");
    setEditComment("");
  }

  async function handleDraftUpdate(isPublishing: boolean) {
    if (!editingDraft) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${editingDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          url: editUrl,
          category: editCategory,
          comment: editComment || null,
          is_published: isPublishing,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message ?? "更新に失敗しました");
        return;
      }
      if (isPublishing) {
        // 本投稿: 下書きリストから削除してトピック詳細へ移動
        if (data) {
          setData({
            ...data,
            drafts: data.drafts.filter((p) => p.id !== editingDraft.id),
            draft_count: data.draft_count - 1,
          });
        }
        closeDraftEdit();
        router.push(`/topics/${editingDraft.topic.id}`);
      } else {
        // 下書き保存のまま: リストを更新
        const updated = await res.json();
        if (data) {
          setData({
            ...data,
            drafts: data.drafts.map((p) => (p.id === editingDraft.id ? { ...p, ...updated } : p)),
          });
        }
        closeDraftEdit();
      }
    } catch {
      alert("サーバーに接続できませんでした");
    } finally {
      setEditSubmitting(false);
    }
  }

  // URL ?tab=drafts の場合は下書きタブを初期選択（下書き保存リダイレクト時）
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (tab) setActiveTab(tab);
  }, []);

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

  async function deleteAnalysis(analysisId: number) {
    if (!window.confirm("この分析・図解を削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/analyses/${analysisId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({ ...data, analyses: data.analyses.filter((a) => a.id !== analysisId) });
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
  const analyses = data?.analyses ?? [];
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
    <>
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="sm:rounded-lg overflow-hidden">

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${blueTab("posts")}`}
            >
              投稿した情報
            </button>

            <button
              onClick={() => setActiveTab("drafts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${yellowTab("drafts")}`}
            >
              下書き
              {draftCount > 0 && (
                <span className="text-[10px] font-bold bg-yellow-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {draftCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${blueTab("comments")}`}
            >
              自分のコメント
            </button>

            <button
              onClick={() => setActiveTab("analyses")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${yellowTab("analyses")}`}
            >
              作成した分析・図解
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("topics")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${blueTab("topics")}`}
            >
              作成したトピック
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
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
                          <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                            下書き
                          </span>
                          <button
                            type="button"
                            onClick={() => openDraftEdit(post)}
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
                          </button>
                          <button
                            onClick={() => deleteDraft(post.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors py-1 px-2"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-g-sub">
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

            {/* 作成した分析・図解（PRO） */}
            {activeTab === "analyses" && (
              <div className="space-y-3">
                {/* Create buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link
                    href="/tools/tree"
                    className="inline-flex items-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    ロジックツリー作成
                  </Link>
                  <Link
                    href="/tools/matrix"
                    className="inline-flex items-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    総合評価表作成
                  </Link>
                  <Link
                    href="/tools/swot"
                    className="inline-flex items-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    SWOT/PEST分析作成
                  </Link>
                </div>

                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ作成した分析・図解はありません。上のボタンから作成できます。
                  </p>
                ) : (
                  analyses.map((analysis) => {
                    const typeInfo = {
                      tree: { label: "ロジックツリー", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800", editPath: "/tools/tree" },
                      matrix: { label: "総合評価表", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800", editPath: "/tools/matrix" },
                      swot: { label: "SWOT/PEST分析", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", editPath: "/tools/swot" },
                    }[analysis.type];
                    return (
                      <div
                        key={analysis.id}
                        className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex justify-between items-start hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeInfo.bg} ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            {!!analysis.is_published && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500">
                                公開済み
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400">{timeAgo(analysis.created_at)}</span>
                          </div>
                          <p className="font-bold text-sm text-gray-900 dark:text-g-text truncate">
                            {analysis.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {!analysis.is_published && (
                            <>
                              <Link
                                href={`${typeInfo.editPath}?edit=${analysis.id}`}
                                className="text-xs text-blue-500 hover:text-blue-700 font-bold transition-colors cursor-pointer"
                              >
                                編集
                              </Link>
                              <span className="text-gray-300 dark:text-gray-700">|</span>
                            </>
                          )}
                          <button
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
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
                      className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {user && <UserAvatar user={user} size="sm" />}
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[13px] text-gray-900 dark:text-g-text">
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
                        <Link
                          href={`/topics/${topic.id}/edit`}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold transition-colors"
                        >
                          編集
                        </Link>
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

    {/* 下書き編集モーダル（posts/edit.blade.php 相当） */}
    {editingDraft && (
      <div className="relative z-50" role="dialog" aria-modal="true" aria-labelledby="draft-edit-title">
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80" onClick={closeDraftEdit} />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative bg-white dark:bg-[#18191a] rounded-t-2xl sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 w-full sm:max-w-xl overflow-hidden shadow-2xl">
              {/* ヘッダー */}
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1e1f20]">
                <div>
                  <h3 id="draft-edit-title" className="text-lg font-bold text-gray-900 dark:text-g-text">
                    下書きを編集
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">下書き保存中は他のユーザーには見えません。</p>
                </div>
                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                  下書き
                </span>
              </div>
              {/* フォーム */}
              <div className="p-4 sm:p-6 bg-white dark:bg-[#131314] space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    参考URL (エビデンス)
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    required
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    メディア分類
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 cursor-pointer"
                  >
                    <option value="">選択してください</option>
                    <option value="YouTube">YouTube</option>
                    <option value="X">X</option>
                    <option value="記事">記事</option>
                    <option value="知恵袋">知恵袋</option>
                    <option value="本">本</option>
                    <option value="その他">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    コメント・引用部分の抜粋
                  </label>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                  />
                </div>
              </div>
              {/* フッター */}
              <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-3 bg-gray-50 dark:bg-[#1e1f20]">
                <button
                  type="button"
                  onClick={closeDraftEdit}
                  className="text-gray-600 dark:text-g-sub hover:text-gray-900 dark:hover:text-gray-200 font-bold py-2 px-3 rounded-md text-sm transition-colors"
                >
                  キャンセル
                </button>
                <div className="flex items-center gap-2">
                  {/* 下書き保存のまま */}
                  <button
                    type="button"
                    onClick={() => handleDraftUpdate(false)}
                    disabled={editSubmitting || !editUrl || !editCategory}
                    className="text-gray-600 dark:text-g-sub hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    下書き保存
                  </button>
                  {/* 本投稿する */}
                  <button
                    type="button"
                    onClick={() => handleDraftUpdate(true)}
                    disabled={editSubmitting || !editUrl || !editCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    本投稿する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
