"use client";

import { useState, useRef } from "react";
import type { Comment } from "../_types";
import { timeAgo } from "../_helpers";
import { UserAvatar } from "./UserAvatar";
import { LikeButton } from "./LikeButton";

export function CommentCard({
  comment,
  currentUserId,
  onLike,
  onReplyLike,
  onReply,
  onDeleteComment,
  onDeleteReply,
}: {
  comment: Comment;
  currentUserId?: number;
  onLike?: () => void;
  onReplyLike?: (replyId: number) => void;
  onReply?: (commentId: number, body: string) => Promise<void>;
  onDeleteComment?: (commentId: number) => void;
  onDeleteReply?: (commentId: number, replyId: number) => void;
}) {
  const [openReplies, setOpenReplies] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const replies = comment.replies ?? [];
  const isOwner = currentUserId === comment.user.id;

  // 返信制限: 投稿主は最大5件・他ユーザーは1件のみ
  const myRepliesCount = currentUserId
    ? replies.filter((r) => r.user.id === currentUserId).length
    : 0;
  const canReply = !!onReply && !!currentUserId
    && (isOwner ? myRepliesCount < 5 : myRepliesCount < 1);

  const handleReplySubmit = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await onReply?.(comment.id, replyBody);
      setReplyBody("");
      setOpenReply(false);
      setOpenReplies(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReplyBody(e.target.value);
    const el = e.target;
    el.style.height = "";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <div className="flex gap-4 items-start py-4 border-b border-gray-100 dark:border-gray-800/60">
      <div className="shrink-0 mt-1 cursor-pointer">
        <UserAvatar user={comment.user} size="lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-[13px] text-gray-900 dark:text-g-text cursor-pointer">
            {comment.user.name}
          </span>
          <span className="text-[11px] text-gray-500">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        <p className="text-lg text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </p>

        <div className="mt-2 flex items-center gap-4 -ml-3">
          {onLike ? (
            <LikeButton
              liked={!!comment.is_liked_by_me}
              count={comment.likes_count}
              size="md"
              onClick={onLike}
            />
          ) : (
            <div className="flex items-center space-x-1 text-gray-500 dark:text-g-sub py-1 px-2">
              <span className="sr-only">いいね</span>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
              </svg>
              {comment.likes_count > 0 && <span className="text-xs" aria-hidden="true">{comment.likes_count}</span>}
            </div>
          )}

          {canReply && (
            <button
              onClick={() => setOpenReply(!openReply)}
              type="button"
              className="text-[12px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors py-1 px-2 -ml-2"
            >
              {isOwner ? "補足を追加する" : "返信する"}
            </button>
          )}

          {isOwner && onDeleteComment && (
            <button
              onClick={() => {
                if (confirm("本当に削除しますか？\n※返信がついている場合、返信もすべて削除されます。")) {
                  onDeleteComment(comment.id);
                }
              }}
              type="button"
              className="text-[12px] text-red-400 hover:text-red-600 transition-colors py-1 px-2"
            >
              削除
            </button>
          )}
        </div>

        {openReply && (
          <div className="mt-3">
            <div className="flex flex-col items-end gap-2">
              <textarea
                ref={textareaRef}
                value={replyBody}
                onChange={handleTextareaInput}
                rows={1}
                className="w-full text-[13px] border-0 border-b border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:ring-0 focus:border-blue-500 resize-none overflow-hidden py-1"
                required
                placeholder={isOwner ? "追加の補足をする（※全5件まで）" : "返信を追加する（※1件まで）"}
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setOpenReply(false); setReplyBody(""); }}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-g-sub dark:hover:text-gray-200 font-bold px-3 py-2 sm:py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleReplySubmit}
                  disabled={submitting || !replyBody.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 sm:py-1.5 px-4 rounded-full transition-colors disabled:opacity-50"
                >
                  {submitting ? "投稿中..." : "投稿"}
                </button>
              </div>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="mt-1">
            <button
              onClick={() => setOpenReplies(!openReplies)}
              className="flex items-center gap-2 text-[13px] font-bold text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 sm:py-1.5 -ml-3 rounded-full transition-colors"
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
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3 items-start">
                    <div className="shrink-0 mt-0.5 cursor-pointer">
                      <UserAvatar user={reply.user} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[12px] text-gray-900 dark:text-g-text cursor-pointer">
                          {reply.user.name}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-[13px] text-gray-800 dark:text-g-text mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {reply.body}
                      </p>
                      <div className="mt-1 flex items-center gap-3">
                        {onReplyLike ? (
                          <LikeButton
                            liked={!!reply.is_liked_by_me}
                            count={reply.likes_count}
                            size="sm"
                            onClick={() => onReplyLike(reply.id)}
                          />
                        ) : (
                          reply.likes_count > 0 && (
                            <div className="flex items-center space-x-1 text-gray-500 dark:text-g-sub py-1 px-2">
                              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
                              </svg>
                              <span className="text-xs">{reply.likes_count}</span>
                            </div>
                          )
                        )}
                        {currentUserId === reply.user.id && onDeleteReply && (
                          <button
                            onClick={() => {
                              if (confirm("削除しますか？")) {
                                onDeleteReply(comment.id, reply.id);
                              }
                            }}
                            type="button"
                            className="text-[11px] text-red-400 hover:text-red-600 transition-colors py-1 px-2"
                          >
                            削除
                          </button>
                        )}
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
