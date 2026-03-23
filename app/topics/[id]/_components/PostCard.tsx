"use client";

import { useState, useRef, useEffect } from "react";
import type { Post } from "../_types";
import { timeAgo } from "../_helpers";
import { UserAvatar } from "./UserAvatar";
import { LikeButton } from "./LikeButton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

export function PostCard({
  post,
  currentUserId,
  onLike,
  onSupplement,
  onDelete,
}: {
  post: Post;
  currentUserId?: number;
  onLike: () => void;
  onSupplement?: (postId: number, supplement: string) => Promise<void>;
  onDelete?: (postId: number) => void;
}) {
  const isOwner = currentUserId === post.user.id;
  const [openSupplement, setOpenSupplement] = useState(false);
  const [supplementBody, setSupplementBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [openSupplementView, setOpenSupplementView] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLParagraphElement>(null);

  const domain = (() => {
    try { return new URL(post.url).hostname; } catch { return ""; }
  })();
  const isYoutube = domain.includes("youtube.com") || domain.includes("youtu.be");
  const isX = domain.includes("x.com") || domain.includes("twitter.com");

  useEffect(() => {
    const el = commentRef.current;
    if (!el) return;
    setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [post.comment]);

  const handleSupplementSubmit = async () => {
    if (!supplementBody.trim() || !onSupplement) return;
    setSubmitting(true);
    try {
      await onSupplement(post.id, supplementBody);
      setOpenSupplement(false);
      setSupplementBody("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSupplementBody(e.target.value);
    const el = e.target;
    el.style.height = "";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div>
      {/* lightbox */}
      {post.custom_thumbnail && lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <img
            src={`${API_BASE}/storage/${post.custom_thumbnail}`}
            alt="添付画像"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="pl-3 pt-3 pb-3 pr-5 bg-gray-50 dark:bg-[#131314] rounded-lg flex flex-col md:flex-row gap-3 transition-colors min-h-[170px] hover:bg-gray-100 dark:hover:bg-white/[0.04]">
        {/* 左列: サムネイル + タイトル */}
        <div className="md:w-[30%] flex-shrink-0">
          {/* サムネイルエリア */}
          {post.custom_thumbnail ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="block w-full group relative mb-2"
            >
              <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={`${API_BASE}/storage/${post.custom_thumbnail}`}
                  alt="添付画像"
                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-200"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">拡大</span>
              </div>
            </button>
          ) : (
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group mb-2"
            >
              {post.thumbnail_url ? (
                <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={post.thumbnail_url}
                    alt="サムネイル"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
            </a>
          )}

          {/* タイトル（サムネ下・URLリンク） */}
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 line-clamp-2 leading-tight transition-colors">
              {post.title || "タイトルを取得できませんでした"}
            </h4>
          </a>
        </div>

        {/* 右列: ユーザー情報・概要・いいね */}
        <div className="md:w-[70%] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UserAvatar user={post.user} size="sm" />
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-[13px] text-gray-900 dark:text-gray-100">
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
              <div className="mt-1 min-h-[4.5rem] break-all">
                <p
                  ref={commentRef}
                  className={`text-[14px] text-gray-800 dark:text-gray-300 leading-relaxed${openComment ? "" : " line-clamp-3"}`}
                >
                  {post.comment}
                </p>
                {!openComment && isTruncated && (
                  <button
                    type="button"
                    onClick={() => setOpenComment(true)}
                    className="text-[13px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/[0.05] transition-colors mt-0.5 px-1.5 py-0.5 rounded-full"
                  >
                    続きを読む
                  </button>
                )}
                {openComment && (
                  <button
                    type="button"
                    onClick={() => setOpenComment(false)}
                    className="text-[13px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-white/[0.05] transition-colors mt-1 px-1.5 py-0.5 rounded-full"
                  >
                    閉じる
                  </button>
                )}
              </div>
            )}

            {!post.supplement && isOwner && onSupplement ? (
              <div className="mt-2">
                {!openSupplement ? (
                  <button
                    onClick={() => setOpenSupplement(true)}
                    type="button"
                    className="text-[11px] text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 font-bold transition-colors py-1 px-2 rounded-full"
                  >
                    ＋ 補足を追加する（※1回のみ）
                  </button>
                ) : (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-[#131314] rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                    <textarea
                      ref={textareaRef}
                      value={supplementBody}
                      onChange={handleTextareaInput}
                      rows={2}
                      className="w-full text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-white mb-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      placeholder="URLに対する追加の補足や、時間の経過による状況の変化などを入力してください（※後から編集はできません）"
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => { setOpenSupplement(false); setSupplementBody(""); }}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold py-1.5 px-2"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={handleSupplementSubmit}
                        disabled={submitting || !supplementBody.trim()}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50"
                      >
                        {submitting ? "投稿中..." : "補足を投稿"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-start gap-3">
            {post.supplement && (
              <button
                type="button"
                onClick={() => setOpenSupplementView((v) => !v)}
                className="text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] transition-colors py-1 px-2 rounded-full"
              >
                📎 補足あり {openSupplementView ? "▲" : "▼"}
              </button>
            )}
            <LikeButton
              liked={!!post.is_liked_by_me}
              count={post.likes_count}
              size="lg"
              onClick={onLike}
            />
            {isOwner && onDelete && (
              <>
                <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">|</span>
                <button
                  onClick={() => {
                    if (confirm("本当に削除しますか？")) onDelete(post.id);
                  }}
                  type="button"
                  className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors py-1 px-2 rounded-full"
                >
                  削除
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {post.supplement && openSupplementView && (
        <div className="px-3 pt-2 pb-3 bg-gray-50 dark:bg-[#131314] rounded-b-lg">
          <span className="text-xs text-gray-500 block mb-1">投稿者からの補足</span>
          <p className="text-[13px] text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {post.supplement}
          </p>
        </div>
      )}
    </div>
  );
}
