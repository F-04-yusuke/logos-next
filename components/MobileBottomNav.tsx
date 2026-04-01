"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

export default function MobileBottomNav() {
  const { user } = useAuth();
  const { setSidebarOpen } = useSidebar();
  const pathname = usePathname();

  const unreadCount = user?.unread_notifications_count ?? 0;

  const itemBase = "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 text-[10px] transition-colors duration-100";
  const activeColor = "text-indigo-400";
  const inactiveColor = "text-gray-500";

  const isActive = (href: string, exact = true) =>
    exact ? pathname === href : pathname.startsWith(href);

  const cls = (href: string, exact = true) =>
    `${itemBase} ${isActive(href, exact) ? activeColor : inactiveColor}`;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-logos-surface border-t border-logos-border flex h-14">
      {/* ホーム */}
      <Link href="/" className={cls("/")}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span>ホーム</span>
      </Link>

      {/* カテゴリ */}
      <Link href="/category-list" className={cls("/category-list")}>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <span>カテゴリ</span>
      </Link>

      {user ? (
        <>
          {/* 通知（バッジあり） */}
          <Link href="/notifications" className={cls("/notifications")}>
            <div className="relative">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span>通知</span>
          </Link>

          {/* マイページ */}
          <Link href="/dashboard" className={cls("/dashboard")}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span>マイページ</span>
          </Link>

          {/* メニュー（サイドバーを開く） */}
          <button
            onClick={() => setSidebarOpen(true)}
            className={`${itemBase} ${inactiveColor}`}
            aria-label="メニューを開く"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span>メニュー</span>
          </button>
        </>
      ) : (
        <>
          {/* スペーサー */}
          <div className="flex-1" />

          {/* ログイン */}
          <Link href="/login" className={cls("/login")}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>ログイン</span>
          </Link>

          {/* 新規登録 */}
          <Link href="/register" className={cls("/register")}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0112 21c-2.278 0-4.412-.616-6.25-1.765z" />
            </svg>
            <span>新規登録</span>
          </Link>
        </>
      )}
    </nav>
  );
}
