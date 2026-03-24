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

function stanceStyle(stance?: string) {
  if (stance === "反論") return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
  if (stance === "賛成・補足") return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
  if (stance === "疑問") return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800";
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-g-sub dark:border-gray-700";
}

function AnalysisPreview({ analysis }: { analysis: TopicAnalysis }) {
  if (analysis.type === "tree") {
    const nodes = (analysis.data.nodes ?? []) as { speaker?: string; stance?: string; text?: string; children?: { speaker?: string; stance?: string; text?: string }[] }[];
    const meta = analysis.data.meta as { url?: string; description?: string } | undefined;
    return (
      <div>
        {meta && (meta.url || meta.description) && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-[#131314] rounded border border-gray-200 dark:border-gray-700">
            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">事前情報</div>
            {meta.description && <p className="text-xs text-gray-700 dark:text-g-text mb-1">{meta.description}</p>}
            {meta.url && <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{meta.url}</a>}
          </div>
        )}
        <div className="pl-4 space-y-3">
          {nodes.slice(0, 5).map((node, i) => {
            const isSelf = node.speaker?.includes("自") ?? false;
            return (
              <div key={i}>
                <div className="bg-gray-50 dark:bg-[#131314] p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 inline-block min-w-[200px] max-w-full">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold ${isSelf ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-g-text"}`}>{node.speaker}</span>
                    {node.stance && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${stanceStyle(node.stance)}`}>{node.stance}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-800 dark:text-g-text leading-relaxed">{node.text}</p>
                </div>
                {node.children?.slice(0, 2).map((child, j) => (
                  <div key={j} className="ml-8 mt-2">
                    <div className="bg-gray-50 dark:bg-[#131314] p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 inline-block min-w-[200px] max-w-full">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-xs font-bold ${child.speaker?.includes("自") ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-g-text"}`}>{child.speaker}</span>
                        {child.stance && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${stanceStyle(child.stance)}`}>{child.stance}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-800 dark:text-g-text leading-relaxed">{child.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  if (analysis.type === "matrix") {
    const items = (analysis.data.items ?? []) as { itemTitle?: string; evaluations?: { score?: number | string; reason?: string }[]; scores?: { score?: number | string; reason?: string }[] }[];
    const patterns = (analysis.data.patterns ?? []) as { title?: string; description?: string }[];
    const badgeInfo = (val: number | string) => {
      const v = Number(val ?? -1);
      if (v === 3) return { text: "◎ 最適 (3pt)", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      if (v === 2) return { text: "〇 良い (2pt)", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" };
      if (v === 1) return { text: "△ 懸念 (1pt)", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" };
      if (v === 0) return { text: "× 不可 (0pt)", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
      return null;
    };
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr>
              <th className="p-2 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131314] text-[10px] font-bold text-gray-500 dark:text-g-sub w-28 align-bottom">
                評価項目 ＼ 比較パターン
              </th>
              {patterns.map((p, i) => (
                <th key={i} className="p-2 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131314] align-top">
                  <div className="font-bold text-blue-600 dark:text-blue-400 mb-0.5 text-xs">{p.title}</div>
                  <p className="text-[10px] text-gray-500 dark:text-g-sub font-normal line-clamp-2">{p.description}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, ri) => {
              const evals = item.evaluations ?? item.scores ?? [];
              return (
                <tr key={ri}>
                  <td className="p-2 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131314] font-bold text-xs text-gray-900 dark:text-g-text">
                    {item.itemTitle}
                  </td>
                  {patterns.map((_, ci) => {
                    const e = evals[ci];
                    const badge = badgeInfo(e?.score ?? -1);
                    return (
                      <td key={ci} className="p-2 border-b border-r border-gray-200 dark:border-gray-700 align-top">
                        {badge && <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded mb-1 ${badge.color}`}>{badge.text}</span>}
                        <p className="text-[10px] text-gray-700 dark:text-g-text line-clamp-2">{e?.reason ?? ""}</p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
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
    const b1 = (analysis.data.box1 ?? []) as string[];
    const b2 = (analysis.data.box2 ?? []) as string[];
    const b3 = (analysis.data.box3 ?? []) as string[];
    const b4 = (analysis.data.box4 ?? []) as string[];
    const boxes = [
      { label: isPest ? "Politics" : "Strengths", sub: isPest ? "政治" : "強み", items: b1, border: "border-blue-500", title: "text-blue-600 dark:text-blue-400", bullet: "text-blue-500" },
      { label: isPest ? "Economy" : "Weaknesses", sub: isPest ? "経済" : "弱み", items: b2, border: "border-red-500", title: "text-red-600 dark:text-red-400", bullet: "text-red-500" },
      { label: isPest ? "Society" : "Opportunities", sub: isPest ? "社会" : "機会", items: b3, border: "border-green-500", title: "text-green-600 dark:text-green-400", bullet: "text-green-500" },
      { label: isPest ? "Technology" : "Threats", sub: isPest ? "技術" : "脅威", items: b4, border: "border-yellow-500", title: "text-yellow-600 dark:text-yellow-400", bullet: "text-yellow-500" },
    ];
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {boxes.map((box, i) => (
          <div key={i} className={`bg-white dark:bg-[#1e1f20] border-t-4 ${box.border} rounded-lg p-3 border-x border-b border-gray-200 dark:border-transparent`}>
            <h3 className={`text-sm font-bold ${box.title} mb-2 border-b border-gray-200 dark:border-gray-700 pb-1.5 flex items-center`}>
              <span className="text-base mr-1.5" aria-hidden="true">{box.label[0]}</span>
              {box.label.slice(1)}
              <span className="text-[10px] text-gray-500 dark:text-g-sub ml-1.5 font-normal">{box.sub}</span>
            </h3>
            <ul className="space-y-1 pl-1">
              {box.items.length === 0
                ? <li className="text-xs text-gray-500">記載なし</li>
                : box.items.slice(0, 3).map((item, j) => (
                    <li key={j} className="text-xs text-gray-800 dark:text-g-text flex items-start">
                      <span aria-hidden="true" className={`${box.bullet} mr-1.5 mt-0.5 shrink-0`}>•</span>
                      <span className="line-clamp-2">{item}</span>
                    </li>
                  ))
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
      <div className="flex items-center gap-3 cursor-pointer">
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
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-[14px] text-gray-900 dark:text-g-text">{analysis.user.name}</span>
          <span className="text-[11px] text-gray-500">{timeAgo(analysis.created_at)}</span>
          {typeBadge(analysis.type, analysis.data)}
        </div>
      </div>

      {/* Title */}
      {(() => {
        const theme = analysis.type === "swot"
          ? analysis.title
          : (analysis.data as Record<string, unknown>).theme as string | undefined;
        return theme ? (
          <div className="font-bold text-sm text-gray-900 dark:text-g-text -mb-1">{theme}</div>
        ) : null;
      })()}

      {/* Preview */}
      <div className="rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1f20] p-4 text-sm overflow-hidden relative h-[200px]">
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-[#1e1f20] dark:to-transparent pointer-events-none" />
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
                className="text-[11px] text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 font-bold transition-colors py-1 px-2 rounded-full cursor-pointer"
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
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-md transition-colors disabled:opacity-50"
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
