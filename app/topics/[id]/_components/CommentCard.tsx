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
  onLike: () => void;
  onReplyLike: (replyId: number) => void;
  onReply: (commentId: number, body: string) => Promise<void>;
  onDeleteComment: (commentId: number) => void;
  onDeleteReply: (commentId: number, replyId: number) => void;
}) {
  const [openReplies, setOpenReplies] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOwner = currentUserId === comment.user.id;

  // 返信制限: 投稿主は最大5件・他ユーザーは1件のみ
  const myRepliesCount = currentUserId
    ? comment.replies.filter((r) => r.user.id === currentUserId).length
    : 0;
  const canReply = currentUserId
    ? isOwner
      ? myRepliesCount < 5
      : myRepliesCount < 1
    : false;

  const handleReplySubmit = async () => {
    if (!replyBody.trim()) return;
    setSubmitting(true);
    try {
      await onReply(comment.id, replyBody);
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
      <div className="shrink-0 mt-1">
        <UserAvatar user={comment.user} size="lg" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-bold text-[13px] text-gray-900 dark:text-g-text">
            {comment.user.name}
          </span>
          <span className="text-[11px] text-gray-500">
            {timeAgo(comment.created_at)}
          </span>
        </div>

        <p className="text-[14px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
          {comment.body}
        </p>

        <div className="mt-2 flex items-center gap-4">
          <LikeButton
            liked={!!comment.is_liked_by_me}
            count={comment.likes_count}
            size="md"
            onClick={onLike}
          />

          {canReply && (
            <button
              onClick={() => setOpenReply(!openReply)}
              type="button"
              className="text-[12px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors py-1 px-2 -ml-2"
            >
              {isOwner ? "補足を追加する" : "返信する"}
            </button>
          )}

          {isOwner && (
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
                placeholder={isOwner ? "追加の補足を記入..." : "返信を追加..."}
              />
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { setOpenReply(false); setReplyBody(""); }}
                  className="text-xs text-gray-600 hover:text-gray-900 dark:text-g-sub dark:hover:text-gray-200 font-bold px-3 py-2 sm:py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleReplySubmit}
                  disabled={submitting || !replyBody.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 sm:py-1.5 px-4 rounded-full transition-colors disabled:opacity-50"
                >
                  {submitting ? "投稿中..." : "投稿"}
                </button>
              </div>
            </div>
          </div>
        )}

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
                      <UserAvatar user={reply.user} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[12px] text-gray-900 dark:text-g-text">
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
                        <LikeButton
                          liked={!!reply.is_liked_by_me}
                          count={reply.likes_count}
                          size="sm"
                          onClick={() => onReplyLike(reply.id)}
                        />
                        {currentUserId === reply.user.id && (
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
