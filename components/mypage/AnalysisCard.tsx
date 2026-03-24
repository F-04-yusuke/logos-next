"use client";

import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export type SharedAnalysis = {
  id: number;
  title: string;
  type: "tree" | "matrix" | "swot";
  is_published: boolean;
  topic_id: number | null;
  created_at: string;
};

const TYPE_INFO = {
  tree: {
    label: "ロジックツリー",
    badgeColor: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20",
    accent: "border-l-blue-400 dark:border-l-blue-600",
    editPath: "/tools/tree",
  },
  matrix: {
    label: "総合評価表",
    badgeColor: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20",
    accent: "border-l-purple-400 dark:border-l-purple-600",
    editPath: "/tools/matrix",
  },
  swot: {
    label: "SWOT/PEST分析",
    badgeColor: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20",
    accent: "border-l-green-400 dark:border-l-green-600",
    editPath: "/tools/swot",
  },
} as const;

export function AnalysisCard({
  analysis,
  onDelete,
}: {
  analysis: SharedAnalysis;
  onDelete: () => void;
}) {
  const typeInfo = TYPE_INFO[analysis.type];

  return (
    <div className={`-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors border-l-2 ${typeInfo.accent}`}>
      {/* ヘッダー: バッジ・公開状態・時刻 */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeInfo.badgeColor}`}>
          {typeInfo.label}
        </span>
        {!!analysis.is_published ? (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500">
            公開済み
          </span>
        ) : (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-dashed border-gray-300 dark:border-gray-600 text-gray-400">
            非公開
          </span>
        )}
        <span className="text-[11px] text-gray-400">{timeAgo(analysis.created_at)}</span>
      </div>

      {/* タイトル */}
      <p className="font-bold text-sm text-gray-900 dark:text-g-text mb-3 truncate">
        {analysis.title}
      </p>

      {/* アクション行 */}
      <div className="flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        {/* 閲覧リンク（公開済みのみ） */}
        {!!analysis.is_published && (
          <Link
            href={`/analyses/${analysis.id}`}
            className="text-xs font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-0.5"
          >
            閲覧 <span className="text-[10px]" aria-hidden="true">▶</span>
          </Link>
        )}

        {/* 編集リンク（非公開のみ） */}
        {!analysis.is_published && (
          <Link
            href={`${typeInfo.editPath}?edit=${analysis.id}`}
            className="text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            編集
          </Link>
        )}

        <span className="text-gray-300 dark:text-gray-700">|</span>

        <button
          onClick={onDelete}
          className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
        >
          削除
        </button>
      </div>
    </div>
  );
}
