"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

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

// ────────────────────────────────────────────────
// Sidebar
// ────────────────────────────────────────────────
export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const { user } = useAuth();

  const unreadCount = user?.unread_notifications_count ?? 0;
  const isPro = !!user?.is_pro;

  const [bookmarks, setBookmarks] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    if (!user) { setBookmarks([]); return; }
    fetch(`${API_BASE}/api/user/bookmarks`, { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBookmarks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  return (
    <>
      {/* ── モバイル用半透明オーバーレイ（fixed・全画面） ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          // モバイル: fixed・全高。PC(md+): relative・flexアイテム
          "fixed md:relative",
          "top-0 bottom-0 left-0 md:top-auto md:bottom-auto md:left-auto",
          "h-full z-30",
          "bg-[#1e1f20] border-r border-gray-800",
          "flex flex-col overflow-hidden",
          "transform transition-all duration-300 ease-in-out",
          // 幅: PC は sidebarOpen で w-64↔w-16、モバイルは常に w-64
          "w-64",
          sidebarOpen ? "md:w-64" : "md:w-16",
          // 位置: モバイルは translate で開閉、PC は常に表示
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        {/* ── トグルボタン行（ハンバーガー ＋ ロゴ） ── */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-transparent">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-gray-900 hover:text-gray-300 focus:outline-none transition shrink-0"
            aria-label={sidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {sidebarOpen && (
            <Link href="/" className="ml-2 flex items-center hover:opacity-80 transition-opacity">
              <AppLogo />
            </Link>
          )}
        </div>

        {/* ── スクロール可能コンテンツ ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div
            className={[
              "py-4 px-3 space-y-6 w-64",
              "transition-opacity ease-out duration-300",
              sidebarOpen ? "opacity-100 delay-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
          >

            {/* ── メインナビ（全員表示） ── */}
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span className="ml-3 font-bold">ホーム</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/category-list"
                  className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                  </svg>
                  <span className="ml-3 font-bold">カテゴリ一覧</span>
                </Link>
              </li>
            </ul>

            {/* ── ログイン時のみ表示 ── */}
            {user && (
              <>
                <hr className="border-gray-700" />

                {/* 保存トピック */}
                <div>
                  <h3 className="px-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    保存トピック
                  </h3>
                  <ul className="space-y-1">
                    {bookmarks.length === 0 ? (
                      <li className="px-2 text-xs text-gray-400">まだ保存したトピックはありません</li>
                    ) : (
                      bookmarks.map((t) => (
                        <li key={t.id}>
                          <Link
                            href={`/topics/${t.id}`}
                            className="flex items-center p-2 text-gray-300 rounded-lg hover:bg-gray-800 group transition-colors"
                          >
                            <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500 bg-gray-800 rounded shrink-0">
                              {t.title.charAt(0)}
                            </span>
                            <span className="ml-3 text-sm truncate">{t.title}</span>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                <hr className="border-gray-700" />

                {/* マイページ */}
                <div>
                  <h3 className="px-2 text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    マイページ
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li>
                      <Link
                        href="/dashboard"
                        className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span className="ml-3">ダッシュボード</span>
                      </Link>
                    </li>

                    {/* 通知（アイコンバッジ + 行末インラインバッジの2種） */}
                    <li>
                      <Link
                        href="/notifications"
                        className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                      >
                        <div className="relative">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white leading-none">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </div>
                        <span className="ml-3">通知</span>
                        {unreadCount > 0 && (
                          <span className="ml-auto text-[10px] font-bold bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/likes"
                        className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
                        </svg>
                        <span className="ml-3">参考になった</span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/history"
                        className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <span className="ml-3">閲覧履歴</span>
                      </Link>
                    </li>

                    {/* トピックの作成（is_pro時のみリンク・非proは鍵アイコン付きボタン） */}
                    <li>
                      {isPro ? (
                        <Link
                          href="/topics/create"
                          className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                          <span className="ml-3">トピックの作成</span>
                          <span className="ml-2 text-[9px] bg-yellow-500 text-white px-1 py-0.5 rounded font-black tracking-wider">PRO</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors group cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                          </svg>
                          <span className="ml-3">トピックの作成</span>
                          <LockIcon />
                        </button>
                      )}
                    </li>
                  </ul>
                </div>

                <hr className="border-gray-700" />

                {/* 分析ツール */}
                <div>
                  <h3 className="px-2 text-sm font-semibold text-yellow-500 uppercase tracking-wider mb-2 flex items-center">
                    分析ツール
                    <span className="ml-1.5 text-[9px] bg-yellow-500 text-white px-1 py-0.5 rounded font-black tracking-wider">PRO</span>
                  </h3>
                  <ul className="space-y-1 text-sm font-bold">

                    {/* ロジックツリー作成 */}
                    <li>
                      {isPro ? (
                        <Link
                          href="/tools/tree"
                          className="flex items-center p-2 rounded-lg hover:bg-gray-800 text-white transition-colors group"
                        >
                          <svg className="w-5 h-5 text-yellow-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <span className="ml-3">ロジックツリー作成</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors group cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 text-yellow-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <span className="ml-3">ロジックツリー作成</span>
                          <LockIcon />
                        </button>
                      )}
                    </li>

                    {/* 総合評価表作成 */}
                    <li>
                      {isPro ? (
                        <Link
                          href="/tools/matrix"
                          className="flex items-center p-2 rounded-lg hover:bg-gray-800 text-white transition-colors group"
                        >
                          <svg className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="ml-3">総合評価表作成</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors group cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 text-purple-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span className="ml-3">総合評価表作成</span>
                          <LockIcon />
                        </button>
                      )}
                    </li>

                    {/* SWOT分析作成 */}
                    <li>
                      {isPro ? (
                        <Link
                          href="/tools/swot"
                          className="flex items-center p-2 rounded-lg hover:bg-gray-800 text-white transition-colors group"
                        >
                          <svg className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="ml-3">SWOT分析作成</span>
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-500 transition-colors group cursor-not-allowed"
                        >
                          <svg className="w-5 h-5 text-green-500/50 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          <span className="ml-3">SWOT分析作成</span>
                          <LockIcon />
                        </button>
                      )}
                    </li>
                  </ul>
                </div>

                <hr className="border-gray-700" />

                {/* 設定 */}
                <ul className="space-y-1 text-sm">
                  <li>
                    <Link
                      href="/profile"
                      className="flex items-center p-2 text-white rounded-lg hover:bg-gray-800 group transition-colors"
                    >
                      <span className="ml-3">設定</span>
                    </Link>
                  </li>
                </ul>
              </>
            )}

          </div>
        </div>
      </aside>
    </>
  );
}
