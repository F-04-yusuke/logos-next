"use client";

import { useState } from "react";
import { UserAvatar } from "@/components/UserAvatar";
import { timeAgo } from "@/lib/utils";

export type SharedReply = {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
};

export type SharedComment = {
  id: number;
  body: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  replies?: SharedReply[];
  topic: { id: number; title: string };
};

function ThumbUpFilledIcon() {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
    </svg>
  );
}

export function CommentCard({ comment }: { comment: SharedComment }) {
  const [openReplies, setOpenReplies] = useState(false);
  const replies = comment.replies ?? [];

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
          <div className="mt-2 flex items-center gap-1 -ml-2">
            <div className="flex items-center space-x-1 text-gray-500 dark:text-g-sub py-1 px-2">
              <span className="sr-only">いいね</span>
              <ThumbUpFilledIcon />
              {comment.likes_count > 0 && (
                <span className="text-xs" aria-hidden="true">{comment.likes_count}</span>
              )}
            </div>
          </div>

          {/* 返信トグル（トピックページ準拠） */}
          {replies.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => setOpenReplies(!openReplies)}
                className="flex items-center gap-2 text-[13px] font-bold text-[#3ea6ff] hover:bg-blue-50 dark:hover:bg-[#263850] px-3 py-1.5 -ml-3 rounded-full transition-colors"
              >
                <svg
                  aria-hidden="true"
                  className={`w-4 h-4 transition-transform duration-200 ${openReplies ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                <span>{openReplies ? "返信を隠す" : `${replies.length}件の返信`}</span>
              </button>

              {openReplies && (
                <div className="mt-3 space-y-4">
                  {replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 items-start">
                      <div className="shrink-0 mt-0.5">
                        <UserAvatar user={reply.user} size="sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-[12px] text-gray-900 dark:text-g-text">{reply.user.name}</span>
                          <span className="text-[11px] text-gray-500">{timeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-[13px] text-gray-800 dark:text-g-text mt-0.5 whitespace-pre-wrap leading-relaxed">
                          {reply.body}
                        </p>
                        {reply.likes_count > 0 && (
                          <div className="mt-1 flex items-center space-x-1 text-gray-500 dark:text-g-sub">
                            <ThumbUpFilledIcon />
                            <span className="text-xs">{reply.likes_count}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
