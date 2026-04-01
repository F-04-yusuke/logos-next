"use client";

import { useSidebar } from "@/context/SidebarContext";

const BENEFITS = [
  {
    color: "text-blue-400",
    text: "ロジックツリーで論点を構造化",
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    color: "text-purple-400",
    text: "総合評価表で選択肢を◎〇△×で比較",
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    color: "text-green-400",
    text: "SWOT / PEST分析でリスクを整理",
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    color: "text-yellow-400",
    text: "Gemini AIによる分析アシスト",
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    color: "text-red-400",
    text: "トピックの新規作成と図解の公開",
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
];

export function ProModal() {
  const { proModalOpen, proModalFeature, closeProModal } = useSidebar();

  if (!proModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
      onClick={closeProModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pro-modal-title"
    >
      <div
        className="bg-logos-surface border border-logos-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-br from-yellow-500/20 to-transparent px-6 pt-6 pb-5 border-b border-gray-700/50">
          <button
            onClick={closeProModal}
            className="absolute top-4 right-4 text-logos-sub hover:text-logos-text transition-colors"
            aria-label="閉じる"
          >
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-yellow-500/20 border border-yellow-500/40">
              <svg aria-hidden="true" className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="text-xs font-bold tracking-wider text-yellow-400 uppercase">PRO会員限定</span>
          </div>

          <h2 id="pro-modal-title" className="text-lg font-bold text-logos-text">
            {proModalFeature}はPRO会員専用です
          </h2>
          <p className="mt-1 text-sm text-logos-sub">
            この機能を使うにはPROプランへのアップグレードが必要です。
          </p>
        </div>

        {/* ベネフィットリスト */}
        <div className="px-6 py-5">
          <p className="text-xs font-bold text-logos-sub uppercase tracking-wider mb-3">PROプランでできること</p>
          <ul className="space-y-3">
            {BENEFITS.map((b, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-logos-text">
                <span className={`shrink-0 h-5 w-5 ${b.color}`}>{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
        </div>

        {/* CTAボタン（フェーズ4でStripe URLに差し替え） */}
        <div className="px-6 pb-6">
          <a
            href="/"
            className="block w-full text-center bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-yellow-500/20"
          >
            PROプランにアップグレードする
          </a>
          <button
            onClick={closeProModal}
            className="mt-3 block w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
          >
            今はしない
          </button>
        </div>
      </div>
    </div>
  );
}
