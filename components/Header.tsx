"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#131314] border-b border-transparent">
      <div className="max-w-5xl mx-auto px-4 h-full flex items-center gap-4">

        {/* 左: ロゴ */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0">
          <svg
            className="w-5 h-5 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2L2 20h20L12 2z" />
          </svg>
          <span className="text-white font-bold text-xl tracking-tight">
            LOGOS
          </span>
        </Link>

        {/* 中央: 検索バー（PC） */}
        <form
          onSubmit={handleSearch}
          className="hidden sm:flex flex-1 max-w-md mx-auto items-center bg-[#121212] border border-gray-700 rounded-full px-4 py-1.5 gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="トピックを検索..."
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          <button type="submit" aria-label="検索">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </form>

        {/* 右: ナビ（PC） */}
        <nav className="hidden sm:flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-black font-medium rounded-full px-4 py-1.5 hover:bg-gray-200 transition-colors"
          >
            登録
          </Link>
        </nav>

        {/* 右: ハンバーガー（スマホ） */}
        <button
          className="sm:hidden ml-auto text-gray-300 hover:text-white"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="メニューを開く"
        >
          {menuOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* スマホメニュー展開 */}
      {menuOpen && (
        <div className="sm:hidden bg-[#131314] border-t border-gray-800 px-4 pb-4 flex flex-col gap-3">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-[#121212] border border-gray-700 rounded-full px-4 py-1.5 gap-2 mt-3"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="トピックを検索..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <button type="submit" aria-label="検索">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white py-1"
            onClick={() => setMenuOpen(false)}
          >
            ログイン
          </Link>
          <Link
            href="/register"
            className="text-sm bg-white text-black font-medium rounded-full px-4 py-2 text-center hover:bg-gray-200 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            登録
          </Link>
        </div>
      )}
    </header>
  );
}
