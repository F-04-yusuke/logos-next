"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLogo from "@/components/AppLogo";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import NavLinks from "./NavLinks";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, bookmarkRefreshKey, openProModal } = useSidebar();
  const { user } = useAuth();

  const [bookmarks, setBookmarks] = useState<{ id: number; title: string }[]>([]);

  useEffect(() => {
    if (!user) { setBookmarks([]); return; }
    fetch(`${API_BASE}/api/user/bookmarks`, { headers: getAuthHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setBookmarks(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user, bookmarkRefreshKey]);

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
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:bg-gray-900 hover:text-gray-300 focus:outline-none transition shrink-0 cursor-pointer"
            aria-label={sidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {sidebarOpen && (
            <Link href="/" className="ml-1 flex items-center hover:opacity-80 transition-opacity">
              <AppLogo />
            </Link>
          )}
        </div>

        {/* ── スクロール可能コンテンツ ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <NavLinks
            user={user}
            bookmarks={bookmarks}
            openProModal={openProModal}
            sidebarOpen={sidebarOpen}
          />
        </div>
      </aside>
    </>
  );
}
