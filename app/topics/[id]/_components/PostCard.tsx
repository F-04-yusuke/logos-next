"use client";

import type { Post } from "../_types";
import { timeAgo } from "../_helpers";
import { UserAvatar } from "./UserAvatar";
import { LikeButton } from "./LikeButton";

export function PostCard({
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
