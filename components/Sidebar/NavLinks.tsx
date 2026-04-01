"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ────────────────────────────────────────────────
// 鍵アイコン（非PRO時）
// ────────────────────────────────────────────────
function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      className="ml-auto h-3.5 w-3.5 text-yellow-500/60 shrink-0"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

type Bookmark = { id: number; title: string; category_char: string | null };
type NavLinksUser = {
  is_pro: boolean | number;
  unread_notifications_count?: number;
};

// ────────────────────────────────────────────────
// NavLinks（メインナビ + ログイン時のセクション全体）
// ────────────────────────────────────────────────
export default function NavLinks({
  user,
  bookmarks,
  openProModal,
  sidebarOpen,
}: {
  user: NavLinksUser | null;
  bookmarks: Bookmark[];
  openProModal: (feature: string) => void;
  sidebarOpen: boolean;
}) {
  const isPro = !!user?.is_pro;
  const unreadCount = user?.unread_notifications_count ?? 0;
  const pathname = usePathname();

  // アクティブ状態クラスを返すヘルパー
  const navClass = (href: string, exact = true) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return [
      "flex items-center p-2 rounded-lg transition-colors duration-100 group relative",
      active
        ? "bg-indigo-50 dark:bg-logos-hover text-indigo-700 dark:text-g-text before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:rounded-r before:bg-indigo-500"
        : "text-logos-text dark:text-g-text hover:bg-logos-hover",
    ].join(" ");
  };

  const iconClass = (href: string, exact = true) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `w-6 h-6 transition-colors duration-100 ${active ? "text-indigo-600 dark:text-g-text" : "text-logos-sub dark:text-g-sub group-hover:text-logos-text dark:group-hover:text-g-text"}`;
  };

  return (
    <div
      className={[
        "py-2 px-4 space-y-3 w-72",
        "transition-opacity ease-out duration-300",
        sidebarOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none",
      ].join(" ")}
    >

      {/* ── メインナビ（全員表示） ── */}
      <ul className="space-y-1 text-base">
        <li>
          <Link href="/" className={navClass("/")}>
            <svg className={iconClass("/")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="ml-5">ホーム</span>
          </Link>
        </li>
        <li>
          <Link href="/category-list" className={navClass("/category-list")}>
            <svg className={iconClass("/category-list")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
            </svg>
            <span className="ml-5">カテゴリ一覧</span>
          </Link>
        </li>
      </ul>

      {/* ── ログイン時のみ表示 ── */}
      {user && (
        <>
          <hr className="border-logos-border" />

          {/* 保存トピック */}
          <div>
            <h3 className="pl-2 border-l-2 border-indigo-300 dark:border-logos-border text-xs font-bold text-logos-sub dark:text-g-sub uppercase tracking-widest mb-2">
              保存トピック
            </h3>
            <ul className="space-y-1">
              {bookmarks.length === 0 ? (
                <li className="px-2 text-sm text-g-sub/60 italic">まだ保存したトピックはありません</li>
              ) : (
                bookmarks.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/topics/${t.id}`}
                      className={navClass(`/topics/${t.id}`)}
                    >
                      <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-indigo-300/80 bg-indigo-500/[0.15] rounded-md shrink-0 transition-colors duration-100">
                        {t.category_char ?? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        )}
                      </span>
                      <span className="ml-5 text-base truncate">{t.title}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          <hr className="border-logos-border" />

          {/* マイページ */}
          <div>
            <h3 className="pl-2 border-l-2 border-indigo-300 dark:border-logos-border text-xs font-bold text-logos-sub dark:text-g-sub uppercase tracking-widest mb-2">
              マイページ
            </h3>
            <ul className="space-y-1 text-base">
              <li>
                <Link href="/dashboard" className={navClass("/dashboard")}>
                  <svg className={iconClass("/dashboard")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span className="ml-5">ダッシュボード</span>
                </Link>
              </li>

              {/* 通知（アイコンバッジ + 行末インラインバッジの2種） */}
              <li>
                <Link href="/notifications" className={navClass("/notifications")}>
                  <div className="relative">
                    <svg className={iconClass("/notifications")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="ml-5">通知</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link href="/likes" className={navClass("/likes")}>
                  <svg className={iconClass("/likes")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
                  </svg>
                  <span className="ml-5">参考になった</span>
                </Link>
              </li>

              <li>
                <Link href="/history" className={navClass("/history")}>
                  <svg className={iconClass("/history")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="ml-5">閲覧履歴</span>
                </Link>
              </li>

              {/* トピックの作成（is_pro時のみリンク・非proは鍵アイコン付きボタン） */}
              <li>
                {isPro ? (
                  <Link href="/topics/create" className={navClass("/topics/create")}>
                    <svg className={iconClass("/topics/create")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    <span className="ml-5">トピックの作成</span>
                    <span className="ml-2 text-[9px] bg-yellow-500 text-white px-1 py-0.5 rounded font-bold tracking-wider">PRO</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openProModal("トピックの作成")}
                    className="w-full flex items-center p-2 rounded-lg hover:bg-logos-hover text-logos-sub dark:text-gray-500 transition-colors duration-100 group cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                    <span className="ml-5">トピックの作成</span>
                    <LockIcon />
                  </button>
                )}
              </li>
            </ul>
          </div>

          <hr className="border-logos-border" />

          {/* 分析ツール */}
          <div>
            <h3 className="pl-2 border-l-2 border-yellow-500/60 text-sm font-semibold text-yellow-500 tracking-wider mb-2 flex items-center gap-1.5">
              分析ツール
              <span className="text-[9px] bg-yellow-500 text-white px-1 py-0.5 rounded font-bold tracking-wider">PRO</span>
            </h3>
            <ul className="space-y-1 text-base font-bold">

              {/* ロジックツリー作成 */}
              <li>
                {isPro ? (
                  <Link href="/tools/tree" className={navClass("/tools/tree")}>
                    <svg className="w-6 h-6 text-yellow-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="ml-5">ロジックツリー作成</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openProModal("ロジックツリー作成")}
                    className="w-full flex items-center p-2 rounded-lg hover:bg-logos-hover text-logos-sub dark:text-gray-500 transition-colors duration-100 group cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-yellow-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span className="ml-5">ロジックツリー作成</span>
                    <LockIcon />
                  </button>
                )}
              </li>

              {/* 総合評価表作成 */}
              <li>
                {isPro ? (
                  <Link href="/tools/matrix" className={navClass("/tools/matrix")}>
                    <svg className="w-6 h-6 text-purple-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-5">総合評価表作成</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openProModal("総合評価表作成")}
                    className="w-full flex items-center p-2 rounded-lg hover:bg-logos-hover text-logos-sub dark:text-gray-500 transition-colors duration-100 group cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-purple-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="ml-5">総合評価表作成</span>
                    <LockIcon />
                  </button>
                )}
              </li>

              {/* SWOT分析作成 */}
              <li>
                {isPro ? (
                  <Link href="/tools/swot" className={navClass("/tools/swot")}>
                    <svg className="w-6 h-6 text-green-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="ml-5">SWOT分析作成</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => openProModal("SWOT分析作成")}
                    className="w-full flex items-center p-2 rounded-lg hover:bg-logos-hover text-logos-sub dark:text-gray-500 transition-colors duration-100 group cursor-pointer"
                  >
                    <svg className="w-6 h-6 text-green-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span className="ml-5">SWOT分析作成</span>
                    <LockIcon />
                  </button>
                )}
              </li>
            </ul>
          </div>

          <hr className="border-logos-border" />

          {/* 設定 */}
          <ul className="space-y-1 text-base">
            <li>
              <Link href="/profile" className={navClass("/profile")}>
                <svg className={iconClass("/profile")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span className="ml-5">設定</span>
              </Link>
            </li>
          </ul>
        </>
      )}

    </div>
  );
}
