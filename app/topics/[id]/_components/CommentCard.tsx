"use client";

import { useState } from "react";
import type { Comment } from "../_types";
import { timeAgo } from "../_helpers";
import { UserAvatar } from "./UserAvatar";
import { LikeButton } from "./LikeButton";

export function CommentCard({
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
