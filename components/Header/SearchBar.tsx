"use client";

import { FormEvent } from "react";

// ────────────────────────────────────────────────
// SearchBar（PC・スマホ両方で使い回す検索フォーム）
// ────────────────────────────────────────────────
export default function SearchBar({
  query,
  setQuery,
  onSearch,
  inputClassName,
  buttonClassName,
  autoFocus = false,
}: {
  query: string;
  setQuery: (q: string) => void;
  onSearch: (e: FormEvent) => void;
  inputClassName?: string;
  buttonClassName?: string;
  autoFocus?: boolean;
}) {
  return (
    <form onSubmit={onSearch} className="flex w-full">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="トピックを検索..."
        autoFocus={autoFocus}
        className={
          inputClassName ??
          "w-full bg-logos-input border border-logos-border rounded-l-full px-5 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-logos-text text-sm shadow-inner transition-colors"
        }
      />
      <button
        type="submit"
        className={
          buttonClassName ??
          "bg-logos-hover border border-l-0 border-logos-border rounded-r-full px-5 py-2.5 text-logos-sub hover:bg-logos-elevated transition-colors flex items-center justify-center"
        }
      >
        <span className="sr-only">検索する</span>
        <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
