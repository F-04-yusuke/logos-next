"use client";

import { buildAvatarUrl } from "@/lib/transforms";

export function UserAvatar({
  user,
  size = "md",
}: {
  user: { name: string; avatar?: string | null };
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-10 w-10" : size === "md" ? "h-8 w-8" : "h-7 w-7";
  const icon = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  const avatarSrc = buildAvatarUrl(user.avatar);
  return avatarSrc ? (
    <img
      className={`${dim} rounded-full object-cover border border-gray-200 dark:border-gray-700`}
      src={avatarSrc}
      alt={`${user.name}のアイコン`}
    />
  ) : (
    <div
      className={`${dim} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className={`${icon} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}
