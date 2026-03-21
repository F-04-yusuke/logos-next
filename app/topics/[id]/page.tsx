"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

// ===== Types =====

type TimelineItem = {
  date?: string;
  event?: string;
  is_ai?: boolean;
};

type Post = {
  id: number;
  url: string;
  title?: string | null;
  thumbnail_url?: string | null;
  comment?: string | null;
  supplement?: string | null;
  category: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

type Reply = {
  id: number;
  body: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

type Comment = {
  id: number;
  body: string;
  likes_count: number;
  is_liked_by_me?: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  replies: Reply[];
};

type TopicDetail = {
  id: number;
  title: string;
  content: string;
  timeline?: TimelineItem[] | null;
  created_at: string;
  user: { id: number; name: string };
  categories: { id: number; name: string }[];
  posts: Post[];
  comments: Comment[];
  user_has_commented?: boolean;
  is_bookmarked?: boolean;
};

// ===== Constants =====
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

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ===== Sub-components =====

function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes: Record<string, { outer: string; inner: string }> = {
    sm: { outer: "h-7 w-7", inner: "h-4 w-4" },
    md: { outer: "h-8 w-8", inner: "h-5 w-5" },
    lg: { outer: "h-10 w-10", inner: "h-6 w-6" },
  };
  const { outer, inner } = sizes[size];
  return (
    <div
      className={`${outer} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className={`${inner} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}

function LikeButton({
  liked,
  count,
  size = "md",
  onClick,
}: {
  liked?: boolean;
  count: number;
  size?: "sm" | "md";
  onClick: () => void;
}) {
  const iconCls = size === "sm" ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-5 h-5";
  const textCls = size === "sm" ? "text-[11px] sm:text-xs" : "text-sm";
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-1 transition-colors duration-200 py-1 px-2 ${
        liked
          ? "text-gray-900 dark:text-white font-bold"
          : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      <span className="sr-only">いいね</span>
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill={liked ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={iconCls}
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
      {count > 0 && (
        <span className={textCls} aria-hidden="true">
          {count}
        </span>
      )}
    </button>
  );
}

function PostCard({
  post,
  onLike,
}: {
  post: Post;
  onLike: () => void;
}) {
  return (
    <div className="p-3 bg-white dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-transparent shadow-sm flex flex-col md:flex-row gap-3 transition-colors">
      <div className="md:w-1/4 flex-shrink-0">
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block group"
        >
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

      <div className="md:w-3/4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserAvatar name={post.user.name} size="sm" />
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-[13px] text-gray-900 dark:text-gray-100">
                {post.user.name}
              </span>
              <span className="text-[11px] text-gray-500">
                {timeAgo(post.created_at)}
              </span>
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
              <span
                className="font-bold text-blue-600 dark:text-blue-400 text-[10px] block mb-1"
                aria-hidden="true"
              >
                ✅ 投稿者からの補足
              </span>
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {post.supplement}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <LikeButton
            liked={!!post.is_liked_by_me}
            count={post.likes_count}
            onClick={onLike}
          />
        </div>
      </div>
    </div>
  );
}

function CommentCard({
  comment,
  onLike,
  onReplyLike,
}: {
  comment: Comment;
  onLike: () => void;
  onReplyLike: (replyId: number) => void;
}) {
  const [openReplies, setOpenReplies] = useState(false);

  return (
    <div className="flex gap-4 items-start py-4 border-b border-gray-100 dark:border-gray-800/60">
      <div className="shrink-0 mt-1">
        <UserAvatar name={comment.user.name} size="lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-[13px] text-gray-900 dark:text-gray-100">
            {comment.user.name}
          </span>
          <span className="text-[11px] text-gray-500">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        <p className="text-[14px] text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </p>

        <div className="mt-2 flex items-center gap-4">
          <LikeButton
            liked={!!comment.is_liked_by_me}
            count={comment.likes_count}
            size="sm"
            onClick={onLike}
          />
        </div>

        {comment.replies.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setOpenReplies(!openReplies)}
              className="flex items-center gap-2 text-[13px] font-bold text-[#3ea6ff] hover:bg-blue-50 dark:hover:bg-[#263850] px-3 py-2 sm:py-1.5 -ml-3 rounded-full transition-colors"
            >
              <svg
                aria-hidden="true"
                className={`w-4 h-4 transition-transform duration-200 ${openReplies ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span>
                {openReplies
                  ? "返信を隠す"
                  : `${comment.replies.length}件の返信`}
              </span>
            </button>

            {openReplies && (
              <div className="mt-3 space-y-4">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 items-start">
                    <div className="shrink-0 mt-0.5">
                      <UserAvatar name={reply.user.name} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[12px] text-gray-900 dark:text-gray-100">
                          {reply.user.name}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-800 dark:text-gray-200 mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {reply.body}
                      </p>
                      <div className="mt-1">
                        <LikeButton
                          liked={!!reply.is_liked_by_me}
                          count={reply.likes_count}
                          size="sm"
                          onClick={() => onReplyLike(reply.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PostModal({
  onClose,
  url,
  onUrlChange,
  category,
  onCategoryChange,
  comment,
  onCommentChange,
  onSubmit,
  submitting,
}: {
  onClose: () => void;
  url: string;
  onUrlChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onSubmit: (isDraft: boolean) => void;
  submitting: boolean;
}) {
  const [ogPreview, setOgPreview] = useState<{ title: string | null; thumbnail: string | null } | null>(null);
  const [ogLoading, setOgLoading] = useState(false);

  useEffect(() => {
    setOgPreview(null);
    setOgLoading(false);
    if (!url || !url.startsWith("http")) return;
    const timer = setTimeout(async () => {
      setOgLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/og?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          setOgPreview({ title: data.title, thumbnail: data.thumbnail_url });
        }
      } catch {
        // ignore
      } finally {
        setOgLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="relative transform overflow-hidden bg-white dark:bg-[#18191a] rounded-t-2xl sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 text-left shadow-2xl w-full h-[85vh] sm:h-auto sm:max-w-xl flex flex-col">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1e1f20]">
              <h3
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
                id="modal-title"
              >
                エビデンスを投稿
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 focus:outline-none transition-colors"
              >
                <span className="sr-only">閉じる</span>
                <span className="text-2xl leading-none" aria-hidden="true">
                  &times;
                </span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white dark:bg-[#131314]">
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  参考URL (必須)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  required
                  placeholder="https://..."
                />
                {/* OGP プレビュー */}
                {ogLoading && (
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">URLを取得中...</p>
                )}
                {!ogLoading && ogPreview && (ogPreview.title || ogPreview.thumbnail) && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-[#1e1f20] rounded-md border border-gray-200 dark:border-gray-700 flex gap-2 items-start">
                    {ogPreview.thumbnail && (
                      <img src={ogPreview.thumbnail} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
                    )}
                    {ogPreview.title && (
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-3 leading-snug">{ogPreview.title}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  メディア分類 (必須)
                </label>
                <select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  required
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
              <div className="mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  補足・コメント (任意)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  rows={4}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  placeholder="URLに対する補足や、どの部分が参考になるかなどを記入"
                />
              </div>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-3 bg-gray-50 dark:bg-[#1e1f20]">
              <button
                onClick={onClose}
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-bold py-3 px-4 sm:py-2 rounded-md text-sm transition-colors"
              >
                キャンセル
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSubmit(true)}
                  disabled={submitting || !url || !category}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-3 px-4 sm:py-2 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  下書き保存
                </button>
                <button
                  type="button"
                  onClick={() => onSubmit(false)}
                  disabled={submitting || !url || !category}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3 px-6 sm:py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  投稿する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisModal({
  onClose,
}: {
  onClose: () => void;
  topicId: number;
}) {
  const [uploadTab, setUploadTab] = useState<"select" | "upload">("select");

  return (
    <div
      className="relative z-50"
      aria-labelledby="analysis-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="relative transform overflow-hidden bg-white dark:bg-[#1e1f20] rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-left shadow-2xl w-full sm:my-8 sm:w-full sm:max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
                id="analysis-modal-title"
              >
                分析・図解の投稿
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2 focus:outline-none"
              >
                <span className="sr-only">閉じる</span>
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
              <button
                onClick={() => setUploadTab("select")}
                className={`py-3 px-4 text-sm transition-colors whitespace-nowrap ${
                  uploadTab === "select"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                作成済みツールから選択
              </button>
              <button
                onClick={() => setUploadTab("upload")}
                className={`py-3 px-4 text-sm transition-colors flex items-center whitespace-nowrap ${
                  uploadTab === "upload"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                オリジナル画像のアップロード
              </button>
            </div>

            {uploadTab === "select" && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                  マイページに公開可能な分析データがありません。
                </p>
                <Link
                  href="/dashboard"
                  className="text-blue-500 hover:underline text-sm font-bold py-2 px-4 rounded-md bg-blue-50 dark:bg-blue-900/20 inline-block"
                >
                  マイページで新しく作成する
                </Link>
              </div>
            )}

            {uploadTab === "upload" && (
              <div className="bg-gray-50 dark:bg-[#131314] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    図解のタイトル
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full text-base sm:text-sm rounded border-gray-300 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-white py-3 sm:py-2"
                    placeholder="例：〇〇問題のステークホルダーマップ"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    画像ファイルを選択 (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-[#1e1f20] dark:file:text-blue-400 dark:hover:file:bg-gray-800 cursor-pointer"
                  />
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                    ※ファイルサイズは最大5MBまで。オリジナルで作成した図解やグラフのみアップロード可能です。
                  </p>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => alert("この機能は近日公開予定です")}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 sm:py-2 px-6 rounded transition-colors"
                  >
                    アップロードして公開
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Main Page =====

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState<"info" | "comments" | "analysis">(
    "info"
  );
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const [postFilter, setPostFilter] = useState("");
  const [postSort, setPostSort] = useState<"popular" | "newest" | "oldest">(
    "popular"
  );
  const [commentSort, setCommentSort] = useState<
    "popular" | "newest" | "oldest"
  >("popular");

  const [commentBody, setCommentBody] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postComment, setPostComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch topic (with auth headers for auth-aware response)
  useEffect(() => {
    fetch(`${API_BASE}/api/topics/${id}`, { headers: getAuthHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setTopic(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  // Tab persistence via sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(`activeTab_${id}`);
    if (saved === "info" || saved === "comments" || saved === "analysis") {
      setActiveTab(saved);
    }
  }, [id]);

  const handleTabChange = (tab: "info" | "comments" | "analysis") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`activeTab_${id}`, tab);
    }
  };

  const handlePostSubmit = async (isDraft: boolean) => {
    if (!postUrl || !postCategory) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          url: postUrl,
          category: postCategory,
          comment: postComment || undefined,
          is_published: !isDraft,
        }),
      });
      if (!res.ok) throw new Error();
      const newPost = await res.json();
      setTopic((prev) =>
        prev ? { ...prev, posts: [newPost, ...prev.posts] } : prev
      );
      setShowPostModal(false);
      setPostUrl("");
      setPostCategory("");
      setPostComment("");
    } catch {
      alert("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ body: commentBody }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "コメント投稿に失敗しました");
        return;
      }
      const newComment = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, newComment],
              user_has_commented: true,
            }
          : prev
      );
      setCommentBody("");
    } catch {
      alert("コメント投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostLike = async (postId: number) => {
    if (!user) {
      alert("いいねするにはログインが必要です");
      return;
    }
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts.map((p) =>
                p.id === postId
                  ? { ...p, likes_count: data.likes_count, is_liked_by_me: data.liked }
                  : p
              ),
            }
          : prev
      );
    }
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) {
      alert("いいねするにはログインが必要です");
      return;
    }
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? { ...c, likes_count: data.likes_count, is_liked_by_me: data.liked }
                  : c
              ),
            }
          : prev
      );
    }
  };

  const handleReplyLike = async (commentId: number, replyId: number) => {
    if (!user) {
      alert("いいねするにはログインが必要です");
      return;
    }
    const res = await fetch(`${API_BASE}/api/comments/${replyId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      replies: c.replies.map((r) =>
                        r.id === replyId
                          ? { ...r, likes_count: data.likes_count, is_liked_by_me: data.liked }
                          : r
                      ),
                    }
                  : c
              ),
            }
          : prev
      );
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert("ブックマークするにはログインが必要です");
      return;
    }
    const res = await fetch(`${API_BASE}/api/topics/${id}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev ? { ...prev, is_bookmarked: data.bookmarked } : prev
      );
    }
  };

  const filteredPosts = (topic?.posts ?? [])
    .filter((p) => !postFilter || p.category === postFilter)
    .slice()
    .sort((a, b) => {
      if (postSort === "popular") return b.likes_count - a.likes_count;
      if (postSort === "newest")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

  const sortedComments = (topic?.comments ?? []).slice().sort((a, b) => {
    if (commentSort === "popular") return b.likes_count - a.likes_count;
    if (commentSort === "newest")
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </main>
    );
  }

  if (error || !topic) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-400 text-sm">トピックの取得に失敗しました</p>
      </main>
    );
  }

  const isOwner = !!user && user.id === topic.user.id;
  const timeline = topic.timeline ?? [];

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-gray-900 dark:text-gray-100">

        {/* ===== Topic Header ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">

          {/* Left: title / content / timeline */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{topic.title}</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 mb-3">
              {topic.content}
            </p>

            {/* Timeline */}
            <div className="mt-1 mb-1">
              <div className="flex flex-wrap items-center justify-between gap-6 mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center shrink-0">
                  <span className="mr-1" aria-hidden="true">⏳</span>{" "}
                  前提となる時系列
                </h3>
              </div>

              {timeline.length > 0 && (
                <>
                  <div className="border-l-[1.5px] border-gray-300 dark:border-gray-700 ml-1.5 pl-3">
                    {timeline.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="relative flex items-start sm:items-center py-0.5 sm:py-1"
                      >
                        <div className="absolute left-[-16.5px] top-2.5 sm:top-1/2 sm:-translate-y-1/2 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                        <div className="w-20 sm:w-24 text-sm text-gray-700 dark:text-gray-300 shrink-0">
                          {item.date ?? ""}
                        </div>
                        <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 sm:truncate">
                          {item.event ?? ""}
                        </div>
                        {(item.is_ai === undefined || !!item.is_ai) && (
                          <span className="ml-2 text-[9px] bg-gray-100 dark:bg-[#1e1f20] text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-gray-800">
                            AI生成
                          </span>
                        )}
                      </div>
                    ))}

                    {timelineExpanded &&
                      timeline.slice(3).map((item, i) => (
                        <div
                          key={i + 3}
                          className="relative flex items-start sm:items-center py-0.5 sm:py-1"
                        >
                          <div className="absolute left-[-16.5px] top-2.5 sm:top-1/2 sm:-translate-y-1/2 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                          <div className="w-20 sm:w-24 text-sm text-gray-700 dark:text-gray-300 shrink-0">
                            {item.date ?? ""}
                          </div>
                          <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 sm:truncate">
                            {item.event ?? ""}
                          </div>
                          {(item.is_ai === undefined || !!item.is_ai) && (
                            <span className="ml-2 text-[9px] bg-gray-100 dark:bg-[#1e1f20] text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-gray-800">
                              AI生成
                            </span>
                          )}
                        </div>
                      ))}
                  </div>

                  {timeline.length > 3 && (
                    <button
                      onClick={() => setTimelineExpanded(!timelineExpanded)}
                      className="mt-1 ml-3 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {timelineExpanded ? "▲ 閉じる" : "▼ もっと見る"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: categories / meta / actions */}
          <div className="flex flex-col items-end flex-shrink-0 space-y-1">
            {topic.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end mb-1">
                {topic.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className="px-2 py-0.5 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 text-right space-y-0.5">
              <p>作成者: {topic.user.name}</p>
              <p>{formatDateTime(topic.created_at)}</p>
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/topics/${topic.id}/edit`}
                    className="text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors flex items-center"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    編集する
                  </Link>
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                </>
              )}

              <button
                onClick={handleBookmark}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex items-center"
              >
                {topic.is_bookmarked ? (
                  <>
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    保存済み
                  </>
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    保存する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <div className="mt-4">
          <div className="flex border-b border-gray-300 dark:border-gray-800 mb-4 overflow-x-auto">
            {(["info", "comments", "analysis"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center ${
                  activeTab === tab
                    ? tab === "analysis"
                      ? "border-yellow-500 text-gray-900 dark:text-white font-bold"
                      : "border-gray-900 text-gray-900 dark:border-gray-200 dark:text-white font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
                }`}
              >
                {tab === "info" && "情報"}
                {tab === "comments" && "コメント"}
                {tab === "analysis" && (
                  <>
                    分析・図解
                    <span className="ml-1.5 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1.5 py-0.5 rounded font-black tracking-wider">
                      PRO
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* ===== Info Tab ===== */}
          {activeTab === "info" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {filteredPosts.length}件の投稿
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <select
                      value={postFilter}
                      onChange={(e) => setPostFilter(e.target.value)}
                      className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1"
                    >
                      <option value="">すべてのメディア</option>
                      <option value="YouTube">YouTube</option>
                      <option value="X">X</option>
                      <option value="記事">記事</option>
                      <option value="知恵袋">知恵袋</option>
                      <option value="本">本</option>
                      <option value="その他">その他</option>
                    </select>
                    <select
                      value={postSort}
                      onChange={(e) =>
                        setPostSort(
                          e.target.value as "popular" | "newest" | "oldest"
                        )
                      }
                      className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1 hidden sm:block"
                    >
                      <option value="popular">人気順</option>
                      <option value="newest">新着順</option>
                      <option value="oldest">古い順</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) {
                        alert("投稿するにはログインが必要です");
                        return;
                      }
                      setShowPostModal(true);
                    }}
                    className="bg-white border border-gray-300 hover:bg-gray-50 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 font-bold py-1.5 px-3 sm:py-1.5 sm:px-4 rounded text-xs sm:text-sm transition-colors flex items-center shrink-0"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="sr-only">エビデンスを投稿する</span>
                    <span className="hidden sm:inline" aria-hidden="true">
                      投稿する
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">
                    投稿はありません
                  </p>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onLike={() => handlePostLike(post.id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== Comments Tab ===== */}
          {activeTab === "comments" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {topic.comments.length}件のコメント
                </h3>
                <select
                  value={commentSort}
                  onChange={(e) =>
                    setCommentSort(
                      e.target.value as "popular" | "newest" | "oldest"
                    )
                  }
                  className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1"
                >
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                </select>
              </div>

              {user && !topic.user_has_commented && (
                <div className="p-4 bg-gray-50 dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-transparent mb-6">
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 dark:bg-[#131314] dark:border-gray-700 dark:text-white mb-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      placeholder="このトピックに対するコメント（※1人1件まで）"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gray-800 hover:bg-gray-900 dark:bg-[#131314] dark:text-gray-200 border border-transparent dark:border-gray-700 dark:hover:bg-gray-800 text-white font-bold py-2 px-4 sm:py-1.5 rounded text-sm transition-colors shadow-sm disabled:opacity-50"
                      >
                        コメントする
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {sortedComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">
                    まだコメントはありません。最初のコメントを投稿しましょう！
                  </p>
                ) : (
                  sortedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onLike={() => handleCommentLike(comment.id)}
                      onReplyLike={(replyId) =>
                        handleReplyLike(comment.id, replyId)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== Analysis Tab ===== */}
          {activeTab === "analysis" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  0件の分析・図解
                </h3>
                <button
                  onClick={() => {
                    if (!user) {
                      alert("投稿するにはログインが必要です");
                      return;
                    }
                    setShowAnalysisModal(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 sm:py-1.5 sm:px-4 rounded text-xs sm:text-sm transition-colors flex items-center shrink-0"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="sr-only">分析・図解を投稿する</span>
                  <span className="hidden sm:inline" aria-hidden="true">
                    分析・図解を投稿
                  </span>
                </button>
              </div>

              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#131314]/50">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">
                  まだ分析・図解は投稿されていません
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm">
                  プレミアムプランに登録すると、オリジナル図解をアップロードしたり、「ロジックツリー」や「総合評価表」を作成してここに公開することができます。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ===== Evidence Modal ===== */}
        {showPostModal && (
          <PostModal
            onClose={() => {
              setShowPostModal(false);
              setPostUrl("");
              setPostCategory("");
              setPostComment("");
            }}
            url={postUrl}
            onUrlChange={setPostUrl}
            category={postCategory}
            onCategoryChange={setPostCategory}
            comment={postComment}
            onCommentChange={setPostComment}
            onSubmit={handlePostSubmit}
            submitting={submitting}
          />
        )}

        {/* ===== Analysis Modal ===== */}
        {showAnalysisModal && (
          <AnalysisModal
            onClose={() => setShowAnalysisModal(false)}
            topicId={topic.id}
          />
        )}

        {/* ===== Back Link ===== */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6 pb-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-sm transition-colors py-2 px-4 -ml-4 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e1f20]"
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
