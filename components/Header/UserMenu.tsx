"use client";

import Link from "next/link";
import { RefObject } from "react";
import { buildAvatarUrl } from "@/lib/transforms";

type MenuUser = {
  name: string;
  avatar?: string | null;
};

// ────────────────────────────────────────────────
// アバター（画像 or デフォルトSVG）
// ────────────────────────────────────────────────
export function Avatar({
  avatar,
  name,
  size = "h-8 w-8",
  iconSize = "h-5 w-5",
}: {
  avatar?: string | null;
  name?: string;
  size?: string;
  iconSize?: string;
}) {
  const avatarSrc = buildAvatarUrl(avatar);
  if (avatarSrc) {
    return (
      <img
        className={`${size} rounded-full object-cover border border-gray-700`}
        src={avatarSrc}
        alt={name ? `${name}のアイコン` : "アイコン"}
      />
    );
  }
  return (
    <div
      className={`${size} rounded-full bg-gray-800 flex items-center justify-center border border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className={`${iconSize} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────
// UserMenu（PCアバタードロップダウン）
// ────────────────────────────────────────────────
export default function UserMenu({
  user,
  dropdownOpen,
  setDropdownOpen,
  onLogout,
  dropdownRef,
}: {
  user: MenuUser;
  dropdownOpen: boolean;
  setDropdownOpen: (open: boolean) => void;
  onLogout: () => void;
  dropdownRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center justify-center rounded-full focus:outline-none transition-transform hover:scale-105 border-2 border-transparent hover:border-gray-600 p-0.5"
        aria-label="アカウントメニュー"
        aria-expanded={dropdownOpen}
      >
        <Avatar avatar={user.avatar} name={user.name} size="h-9 w-9" iconSize="h-6 w-6" />
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
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
