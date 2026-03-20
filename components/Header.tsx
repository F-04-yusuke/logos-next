"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useRef, useEffect } from "react";
import AppLogo from "@/components/AppLogo";
import { useAuth } from "@/context/AuthContext";

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
// デフォルトアバターアイコン
// ────────────────────────────────────────────────
function DefaultAvatar({ size = "h-8 w-8" }: { size?: string }) {
  return (
    <div
      className={`${size} rounded-full bg-gray-800 flex items-center justify-center border border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5 text-gray-400"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────
// Header
// ────────────────────────────────────────────────
export default function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);   // スマホ: アカウントメニュー
  const [searchOpen, setSearchOpen] = useState(false); // スマホ: 検索スライドダウン
  const [dropdownOpen, setDropdownOpen] = useState(false); // PC: アバタードロップダウン
  const [query, setQuery] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  async function handleLogout() {
    setDropdownOpen(false);
    setMenuOpen(false);
    logout();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 bg-[#131314] border-b border-transparent">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* ── 左: ロゴ ── */}
          <div className="flex items-center shrink-0 gap-2">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <AppLogo />
            </Link>
          </div>

          {/* ── 中央: 検索バー（PC） ── */}
          <div className="hidden sm:flex flex-1 items-center justify-center px-4 sm:px-6 lg:px-12">
            <div className="w-full max-w-2xl flex justify-center">
              <form onSubmit={handleSearch} className="flex w-full">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="トピックを検索..."
                  className="w-full bg-[#121212] border border-gray-700 rounded-l-full px-5 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-sm shadow-inner transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#222222] border border-l-0 border-gray-700 rounded-r-full px-5 py-2 text-gray-400 hover:bg-[#303030] transition-colors flex items-center justify-center"
                >
                  <span className="sr-only">検索する</span>
                  <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* ── 右: PC用ナビ ── */}
          <div className="hidden sm:flex sm:items-center gap-2">
            {loading ? null : user ? (
              <>
                {/* カテゴリ管理（is_admin のみ） */}
                {user.is_admin && (
                  <Link
                    href="/categories"
                    className="text-sm text-gray-300 hover:text-white transition-colors mr-2"
                  >
                    カテゴリ管理
                  </Link>
                )}

                {/* 通知ベル */}
                <Link
                  href="/notifications"
                  className="relative p-2 rounded-full text-gray-400 hover:bg-gray-800 transition-colors"
                  aria-label="通知"
                >
                  <BellIcon className="h-5 w-5" />
                </Link>

                {/* アバタードロップダウン */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((prev) => !prev)}
                    className="flex items-center justify-center rounded-full focus:outline-none transition-transform hover:scale-105 border-2 border-transparent hover:border-gray-600 p-0.5"
                    aria-label="アカウントメニュー"
                    aria-expanded={dropdownOpen}
                  >
                    <DefaultAvatar size="h-8 w-8" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1e1f20] border border-gray-700 rounded-xl shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/history"
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                        onClick={() => setDropdownOpen(false)}
                      >
                        閲覧履歴
                      </Link>
                      <div className="border-t border-gray-700 my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-white text-black font-medium rounded-full px-4 py-1.5 hover:bg-gray-200 transition-colors"
                >
                  登録
                </Link>
              </>
            )}
          </div>

          {/* ── 右: スマホ用アイコン群 ── */}
          <div className="flex items-center gap-1 sm:hidden">
            {user && (
              /* 通知ベル（スマホ） */
              <Link
                href="/notifications"
                className="relative p-2 rounded-md text-gray-500 hover:text-gray-400 hover:bg-[#222222] focus:outline-none transition"
                aria-label="通知"
              >
                <BellIcon className="h-6 w-6" />
              </Link>
            )}

            {/* 検索トグル（虫眼鏡） */}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-400 hover:bg-[#222222] focus:outline-none transition"
              aria-label="検索を開く"
            >
              <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* ハンバーガー（アカウントメニュー） */}
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-400 hover:bg-[#222222] focus:outline-none transition"
              aria-label="アカウントメニューを開く"
            >
              {menuOpen ? (
                <svg aria-hidden="true" className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── スマホ: 検索スライドダウン ── */}
      {searchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-3 bg-[#131314] shadow-sm">
          <form onSubmit={handleSearch} className="flex w-full">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="トピックを検索..."
              autoFocus
              className="w-full bg-[#121212] border border-gray-700 rounded-l-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white text-sm transition-colors"
            />
            <button
              type="submit"
              className="bg-[#222222] border border-l-0 border-gray-700 rounded-r-full px-4 py-2 text-gray-400 hover:bg-[#303030] transition-colors flex items-center justify-center"
            >
              <span className="sr-only">検索する</span>
              <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ── スマホ: アカウントメニュー展開 ── */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-800 bg-[#131314]">
          {user ? (
            <>
              {/* カテゴリ管理（is_admin のみ） */}
              {user.is_admin && (
                <div className="pt-2 pb-1 px-4 space-y-1">
                  <Link
                    href="/categories"
                    className="block text-sm text-gray-300 hover:text-white py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    カテゴリ管理
                  </Link>
                </div>
              )}

              {/* ユーザー情報 */}
              <div className="pt-4 pb-1 border-t border-gray-700">
                <div className="px-4 flex items-center">
                  <div className="shrink-0 mr-3">
                    <DefaultAvatar size="h-10 w-10" />
                  </div>
                  <div>
                    <div className="font-medium text-base text-gray-200">{user.name}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 pb-3">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#222222] hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-[#222222] hover:text-white transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    閲覧履歴
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#222222] hover:text-white transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* 未ログイン時スマホメニュー */
            <div className="px-4 py-4 flex flex-col gap-3">
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
        </div>
      )}
    </header>
  );
}
