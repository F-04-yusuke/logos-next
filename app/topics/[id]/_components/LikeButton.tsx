"use client";

export function LikeButton({
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
