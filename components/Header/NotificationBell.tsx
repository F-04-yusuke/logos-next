"use client";

import Link from "next/link";

// ────────────────────────────────────────────────
// 通知ベルアイコン（navigation.blade.php と同一SVG）
// ────────────────────────────────────────────────
function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className ?? "h-5 w-5"}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  );
}

// ────────────────────────────────────────────────
// 通知バッジ（未読 > 0 の時のみ表示）
// ────────────────────────────────────────────────
function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}

// ────────────────────────────────────────────────
// NotificationBell（PC/スマホ両方で使用）
// ────────────────────────────────────────────────
export default function NotificationBell({
  unreadCount,
  linkClassName,
  iconClassName = "h-5 w-5",
}: {
  unreadCount: number;
  linkClassName?: string;
  iconClassName?: string;
}) {
  return (
    <Link href="/notifications" className={linkClassName} aria-label="通知">
      <BellIcon className={iconClassName} />
      <NotificationBadge count={unreadCount} />
    </Link>
  );
}
