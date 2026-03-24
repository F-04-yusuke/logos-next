"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { TopicAnalysis } from "../_types";
import { API_BASE, timeAgo } from "../_helpers";

export function typeBadge(type: TopicAnalysis["type"], data: Record<string, unknown>) {
  if (type === "tree")
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-blue-200 text-blue-600 dark:border-blue-800 dark:text-blue-400">
        ロジックツリー
      </span>
    );
  if (type === "matrix")
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-purple-200 text-purple-600 dark:border-purple-800 dark:text-purple-400">
        総合評価表
      </span>
    );
  if (type === "swot") {
    const isPest = data?.framework === "PEST";
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-green-200 text-green-600 dark:border-green-800 dark:text-green-400">
        {isPest ? "PEST分析" : "SWOT分析"}
      </span>
    );
  }
  if (type === "image")
    return (
      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded border border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400">
        オリジナル図解
      </span>
    );
  return null;
}

function AnalysisPreview({ analysis }: { analysis: TopicAnalysis }) {
  if (analysis.type === "tree") {
    const nodes = analysis.data.nodes ?? [];
    const meta = analysis.data.meta;
    return (
      <div>
        {meta && (meta.url || meta.description) && (
          <div className="mb-3 p-3 bg-white dark:bg-[#1e1f20] rounded border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">事前情報</div>
            {meta.description && <p className="text-xs text-gray-800 dark:text-g-text mb-1">{meta.description}</p>}
            {meta.url && <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{meta.url}</a>}
          </div>
        )}
        <div className="space-y-2">
          {nodes.slice(0, 5).map((node, i) => (
            <div key={i}>
              <div className="flex gap-2">
                <span className="font-bold text-blue-500 shrink-0">{node.speaker}:</span>
                <span className="text-gray-700 dark:text-g-text truncate">{node.text}</span>
              </div>
              {node.children?.slice(0, 1).map((child, j) => (
                <div key={j} className="ml-4 flex gap-2 border-l-2 border-gray-300 dark:border-gray-700 pl-2 mt-1">
                  <span className="font-bold text-gray-500 shrink-0">↳ {child.speaker}:</span>
                  <span className="text-gray-600 dark:text-g-sub truncate">{child.text}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (analysis.type === "matrix") {
    const items = analysis.data.items ?? [];
    return (
      <div>
        <div className="font-bold text-gray-500 mb-2 text-sm">【評価項目一覧】</div>
        <ul className="list-disc list-inside text-gray-700 dark:text-g-text space-y-1 ml-1">
          {items.slice(0, 5).map((item, i) => (
            <li key={i} className="truncate text-sm">{item.itemTitle}</li>
          ))}
        </ul>
      </div>
    );
  }
  if (analysis.type === "image") {
    const imagePath = analysis.data.image_path;
    return imagePath ? (
      <div>
        <div className="font-bold text-base text-gray-900 dark:text-g-text mb-3">{analysis.title}</div>
        <div className="w-full flex justify-center bg-white dark:bg-[#1e1f20] rounded p-2">
          <img
            src={`${API_BASE}/storage/${imagePath}`}
            alt={analysis.title}
            className="max-w-full max-h-[350px] object-contain rounded border border-gray-200 dark:border-gray-700 shadow-sm"
          />
        </div>
      </div>
    ) : null;
  }
  if (analysis.type === "swot") {
    const isPest = analysis.data.framework === "PEST";
    const b1 = analysis.data.box1 ?? [];
    const b2 = analysis.data.box2 ?? [];
    const b3 = analysis.data.box3 ?? [];
    const b4 = analysis.data.box4 ?? [];
    const boxes = [
      { label: isPest ? "P (政治)" : "S (強み)", items: b1, color: "text-blue-500" },
      { label: isPest ? "E (経済)" : "W (弱み)", items: b2, color: "text-red-500" },
      { label: isPest ? "S (社会)" : "O (機会)", items: b3, color: "text-green-500" },
      { label: isPest ? "T (技術)" : "T (脅威)", items: b4, color: "text-yellow-500" },
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {boxes.map((box, i) => (
          <div key={i}>
            <span className={`font-bold mb-1 inline-block text-sm ${box.color}`}>{box.label}:</span>
            <ul className="list-disc list-inside text-gray-700 dark:text-g-text space-y-0.5 text-xs">
              {box.items.length === 0
                ? <li className="text-gray-500">記載なし</li>
                : box.items.slice(0, 3).map((txt, j) => <li key={j} className="truncate">{txt}</li>)
              }
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function AnalysisCard({
  analysis,
  currentUserId,
  isPro,
  onDelete,
  onLike,
  onSupplement,
}: {
  analysis: TopicAnalysis;
  currentUserId?: number;
  isPro?: boolean;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onSupplement?: (analysisId: number, supplement: string) => Promise<void>;
}) {
  const isOwner = currentUserId === analysis.user.id;
  const [openSupplement, setOpenSupplement] = useState(false);
  const [openSupplementView, setOpenSupplementView] = useState(false);
  const [supplementBody, setSupplementBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSupplementSubmit = async () => {
    if (!supplementBody.trim() || !onSupplement) return;
    setSubmitting(true);
    try {
      await onSupplement(analysis.id, supplementBody);
      setOpenSupplement(false);
      setSupplementBody("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSupplementBody(e.target.value);
    const el = e.target;
    el.style.height = "";
    el.style.height = el.scrollHeight + "px";
  };
  const avatarSrc = analysis.user.avatar
    ? `${API_BASE}/storage/${analysis.user.avatar}`
    : null;

  return (
    <div className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex flex-col gap-3 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1 cursor-pointer">
        <div className="shrink-0 mt-0.5">
          {avatarSrc ? (
            <img className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" src={avatarSrc} alt={analysis.user.name} />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
              <svg aria-hidden="true" className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[14px] text-gray-900 dark:text-g-text">{analysis.user.name}</span>
            <span className="text-[11px] text-gray-500">{timeAgo(analysis.created_at)}</span>
          </div>
          <div className="mt-0.5">{typeBadge(analysis.type, analysis.data)}</div>
        </div>
      </div>

      {/* Title for swot */}
      {analysis.type === "swot" && (
        <div className="font-bold text-base text-gray-900 dark:text-g-text -mb-1">{analysis.title}</div>
      )}

      {/* Preview */}
      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f20] p-4 text-sm overflow-hidden relative" style={{ maxHeight: "400px" }}>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent dark:from-[#1e1f20] dark:to-transparent pointer-events-none" />
        <AnalysisPreview analysis={analysis} />
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="flex items-center justify-between">
          {/* Left: もっと見る + 補足ありトグル or 補足追加ボタン */}
          <div className="flex items-center gap-1">
            {isOwner && analysis.type !== "image" ? (
              <Link
                href={`/tools/${analysis.type}?edit=${analysis.id}`}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center py-1 pr-2"
              >
                もっと見る <span className="ml-1 text-[10px]" aria-hidden="true">▶</span>
              </Link>
            ) : !isOwner && !!isPro ? (
              <Link
                href={`/analyses/${analysis.id}`}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center py-1 pr-2"
              >
                もっと見る <span className="ml-1 text-[10px]" aria-hidden="true">▶</span>
              </Link>
            ) : !isOwner && !isPro ? (
              <span className="text-xs font-bold text-yellow-500 flex items-center gap-1 py-1 pr-2">
                <svg aria-hidden="true" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                もっと見る <span className="text-[9px] ml-0.5 bg-yellow-500/20 text-yellow-400 px-1 rounded font-bold">PRO</span>
              </span>
            ) : null}

            {analysis.supplement ? (
              <button
                type="button"
                onClick={() => setOpenSupplementView((v) => !v)}
                className="text-[13px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.07] transition-colors py-1 px-2 rounded-full cursor-pointer"
              >
                📎 補足あり {openSupplementView ? "▲" : "▼"}
              </button>
            ) : isOwner && onSupplement && !openSupplement ? (
              <button
                type="button"
                onClick={() => setOpenSupplement(true)}
                className="text-[11px] text-yellow-600 dark:text-yellow-500 hover:bg-yellow-500/10 font-bold transition-colors py-1 px-2 rounded-full cursor-pointer"
              >
                ＋ 補足を追加する（※1回のみ）
              </button>
            ) : null}
          </div>

          {/* Right: 削除 | いいね */}
          <div className="flex items-center gap-4">
            {isOwner && (
              <>
                <button
                  onClick={() => onDelete(analysis.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors py-1 px-2 cursor-pointer"
                >
                  削除
                </button>
                <span className="text-gray-300 dark:text-gray-700" aria-hidden="true">|</span>
              </>
            )}
            <button
              onClick={() => onLike(analysis.id)}
              className={`flex items-center space-x-1 transition-colors py-1 px-2 -mr-2 cursor-pointer ${
                analysis.is_liked_by_me ? "text-gray-900 dark:text-white font-bold" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span className="sr-only">いいね</span>
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill={analysis.is_liked_by_me ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 1.5.58c.36.31.6.76.68 1.25.04.24.06.49.06.75 0 .76-.23 1.48-.63 2.08-.2.31-.05.73.3.88l3.126.33a2.25 2.25 0 0 1 1.954 2.65l-1.42 6.75c-.24 1.14-1.28 1.96-2.45 1.96H13.5a5.5 5.5 0 0 1-2.5-.6l-3.11-1.42a4.5 4.5 0 0 0-1.43-.24H5.9c-.83 0-1.5-.67-1.5-1.5V11.75c0-.83.67-1.5 1.5-1.5h.733Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 10.25h1.5v9h-1.5v-9Z" />
              </svg>
              {analysis.likes_count > 0 && <span className="text-sm" aria-hidden="true">{analysis.likes_count}</span>}
            </button>
          </div>
        </div>

        {/* 補足展開コンテンツ */}
        {analysis.supplement && openSupplementView && (
          <div className="pt-2 pb-1">
            <span className="text-xs text-gray-500 dark:text-g-sub block mb-1">投稿者からの補足</span>
            <p className="text-[13px] text-gray-800 dark:text-g-text whitespace-pre-wrap leading-relaxed">
              {analysis.supplement}
            </p>
          </div>
        )}

        {/* 補足追加フォーム */}
        {!analysis.supplement && isOwner && onSupplement && openSupplement && (
          <div className="pt-2 pb-3">
            <textarea
              ref={textareaRef}
              value={supplementBody}
              onChange={handleTextareaInput}
              rows={2}
              className="w-full text-sm rounded-md border-gray-300 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-white mb-2 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
              required
              placeholder="この分析に対する追加の考察や結論などを入力してください（※後から編集はできません）"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setOpenSupplement(false); setSupplementBody(""); }}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold py-1.5 px-2"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSupplementSubmit}
                disabled={submitting || !supplementBody.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1.5 px-4 rounded transition-colors disabled:opacity-50"
              >
                {submitting ? "投稿中..." : "補足を投稿"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
