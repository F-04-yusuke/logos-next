"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// -------- 型定義 --------
type TreeNode = {
  speaker?: string;
  stance?: string;
  text?: string;
  children?: TreeNode[];
};

type MatrixPattern = { title?: string; description?: string };
type MatrixEvaluation = { score?: number | string; reason?: string };
type MatrixItem = { itemTitle?: string; evaluations?: MatrixEvaluation[]; scores?: MatrixEvaluation[] };

type Analysis = {
  id: number;
  title: string;
  type: "tree" | "matrix" | "swot" | "image";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
  supplement?: string | null;
  likes_count: number;
  is_liked_by_me: boolean;
  created_at: string;
  user: { id: number; name: string; avatar?: string | null };
  topic?: { id: number; title: string } | null;
};

// -------- スタンスバッジスタイル --------
function getStanceStyle(stance?: string) {
  switch (stance) {
    case "主張":
      return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-400/10 dark:text-g-sub dark:border-gray-400/30";
    case "反論":
      return "bg-red-100 text-red-600 border-red-200 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/30";
    case "賛成":
    case "賛成・補足":
      return "bg-green-100 text-green-600 border-green-200 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/30";
    case "疑問":
      return "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/30";
    case "解決策":
      return "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/30";
    case "根拠":
      return "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-400/10 dark:text-purple-400 dark:border-purple-400/30";
    case "事実":
      return "bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-400/10 dark:text-teal-400 dark:border-teal-400/30";
    case "仮説":
      return "bg-orange-100 text-orange-600 border-orange-200 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/30";
    case "前提":
      return "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-400/10 dark:text-indigo-400 dark:border-indigo-400/30";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-400/10 dark:text-g-sub dark:border-gray-400/30";
  }
}

// -------- アバター配色（自が最も目立つ、A〜Eは薄い別色） --------
function getAvatarStyle(speaker: string): string {
  const s = speaker ?? "";
  if (s.includes("自分") || s.includes("自")) return "bg-blue-600 text-white";
  if (s.includes("A")) return "bg-purple-500/25 text-purple-400";
  if (s.includes("B")) return "bg-amber-500/25 text-amber-400";
  if (s.includes("C")) return "bg-teal-500/25 text-teal-400";
  if (s.includes("D")) return "bg-pink-500/25 text-pink-400";
  if (s.includes("E")) return "bg-indigo-500/25 text-indigo-400";
  return "bg-gray-500/20 text-gray-400";
}

// -------- ラベル生成 --------
function computeViewLabels(nodes: TreeNode[]): Map<TreeNode, string> {
  const map = new Map<TreeNode, string>();
  const counts: Record<string, number> = {};

  function traverse(list: TreeNode[]) {
    for (const node of list) {
      const s = node.speaker ?? "";
      let p = "他";
      if (s.includes("自分") || s.includes("自")) p = "自";
      else if (s.includes("A")) p = "A";
      else if (s.includes("B")) p = "B";
      else if (s.includes("C")) p = "C";
      else if (s.includes("D")) p = "D";
      else if (s.includes("E")) p = "E";
      counts[p] = (counts[p] || 0) + 1;
      map.set(node, p + counts[p]);
      traverse(node.children ?? []);
    }
  }
  traverse(nodes);
  return map;
}

// -------- ツリーノード（YouTubeライクな縦線＋等間隔スレッド） --------
function ViewTreeNode({ node, labels }: { node: TreeNode; labels: Map<TreeNode, string> }) {
  const label = labels.get(node) ?? "";
  const speaker = node.speaker ?? "";
  const isSelf = speaker.includes("自分") || speaker.includes("自");
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const avatarClass = getAvatarStyle(speaker);

  return (
    <div className="flex gap-3">
      {/* 左カラム: アバター + 縦線（子がある場合のみ） */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarClass}`}
        >
          {label}
        </div>
        {hasChildren && (
          <div className="w-0.5 flex-1 bg-gray-300 dark:bg-gray-700 mt-2" />
        )}
      </div>

      {/* 右カラム: コンテンツ + 子ノード */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <span
            className={`text-sm font-bold ${
              isSelf ? "text-blue-500 dark:text-blue-400" : "text-gray-700 dark:text-g-text"
            }`}
          >
            {speaker}
          </span>
          {node.stance && (
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border font-bold ${getStanceStyle(node.stance)}`}
            >
              {node.stance}
            </span>
          )}
        </div>
        <p className="text-base text-gray-900 dark:text-g-text whitespace-pre-wrap leading-relaxed pb-5">
          {node.text}
        </p>
        {hasChildren && (
          <div className="space-y-8">
            {children.map((child, i) => (
              <ViewTreeNode key={i} node={child} labels={labels} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// -------- コンテンツ本体 --------
function AnalysisContent({ analysis }: { analysis: Analysis }) {
  const d = analysis.data ?? {};

  if (analysis.type === "tree") {
    const nodes: TreeNode[] = Array.isArray(d.nodes) ? d.nodes : (Array.isArray(d) ? d : []);
    const meta = d.meta as { url?: string; description?: string } | undefined;
    const labels = computeViewLabels(nodes);
    return (
      <div>
        {meta && (meta.url || meta.description) && (
          <div className="bg-white dark:bg-[#1e1f20] p-4 sm:p-6 shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-800 mb-6">
            <h3 className="font-bold text-gray-900 dark:text-g-text flex items-center mb-3">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              事前情報
            </h3>
            {meta.description && <p className="text-sm text-gray-700 dark:text-g-text mb-2 whitespace-pre-wrap">{meta.description}</p>}
            {meta.url && (
              <a href={meta.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-start sm:items-center break-all transition-colors">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 shrink-0 mt-0.5 sm:mt-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {meta.url}
              </a>
            )}
          </div>
        )}
        <div className="py-2">
          <div className="space-y-8">
            {nodes.length > 0
              ? nodes.map((node, i) => <ViewTreeNode key={i} node={node} labels={labels} />)
              : <p className="text-gray-500">ツリーデータがありません。</p>
            }
          </div>
        </div>
      </div>
    );
  }

  if (analysis.type === "matrix") {
    const patterns: MatrixPattern[] = Array.isArray(d.patterns) ? d.patterns : [];
    const items: MatrixItem[] = Array.isArray(d.items) ? d.items : [];
    const totals: number[] = Array(patterns.length).fill(0);
    const isCalculated: boolean[] = Array(patterns.length).fill(false);
    items.forEach((item) => {
      const evals = item.evaluations ?? item.scores ?? [];
      evals.forEach((e, i) => {
        const val = e.score !== undefined && e.score !== null ? Number(e.score) : -1;
        if (val !== -1) { totals[i] += val; isCalculated[i] = true; }
      });
    });
    const scoreStyle = (val: number) => {
      if (val === 3) return { text: "◎ 最適 (3pt)", cls: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" };
      if (val === 2) return { text: "〇 良い (2pt)", cls: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" };
      if (val === 1) return { text: "△ 懸念 (1pt)", cls: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" };
      if (val === 0) return { text: "× 不可 (0pt)", cls: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" };
      return null;
    };
    const maxTotal = isCalculated.reduce((max, calc, i) => calc && totals[i] > max ? totals[i] : max, -Infinity);
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 border-b border-r border-gray-200 dark:border-gray-700 w-48 bg-gray-50 dark:bg-[#1e1f20] align-bottom text-xs font-bold text-gray-500 dark:text-g-sub">
                評価項目 ＼ 比較パターン
              </th>
              {patterns.map((p, i) => (
                <th key={i} className="p-4 border-b border-r border-gray-200 dark:border-gray-700 w-64 bg-gray-50 dark:bg-[#1e1f20] align-top">
                  <div className="font-bold text-blue-600 dark:text-blue-400 mb-1 text-lg">{p.title}</div>
                  <p className="text-sm text-gray-600 dark:text-g-sub whitespace-pre-wrap font-normal">{p.description}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, ri) => {
              const evals = item.evaluations ?? item.scores ?? [];
              return (
                <tr key={ri}>
                  <td className="p-3 border-b border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1e1f20] font-bold text-base text-gray-900 dark:text-g-text">
                    {item.itemTitle}
                  </td>
                  {patterns.map((_, ci) => {
                    const e = evals[ci];
                    const val = e?.score !== undefined && e?.score !== null ? Number(e.score) : -1;
                    const style = scoreStyle(val);
                    return (
                      <td key={ci} className="p-3 border-b border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252627] align-top">
                        {style && <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border mb-2 ${style.cls}`}>{style.text}</span>}
                        <p className="text-sm text-gray-800 dark:text-g-text whitespace-pre-wrap">{e?.reason ?? ""}</p>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 dark:bg-[#1e1f20]">
            <tr>
              <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-right text-xs font-bold text-gray-500 dark:text-g-sub">総合評価</td>
              {totals.map((total, i) => {
                const isMax = isCalculated[i] && total === maxTotal;
                return (
                  <td key={i} className={`p-3 border-r border-gray-200 dark:border-gray-700 text-center${isMax ? " ring-2 ring-inset ring-blue-500" : ""}`}>
                    {isCalculated[i]
                      ? <><span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{total}</span><span className="text-xs text-gray-500 ml-1">pt</span></>
                      : <span className="text-sm text-gray-400">未評価</span>
                    }
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    );
  }

  if (analysis.type === "swot") {
    const isPest = d.framework === "PEST";
    const b1: string[] = Array.isArray(d.box1) ? d.box1 : [];
    const b2: string[] = Array.isArray(d.box2) ? d.box2 : [];
    const b3: string[] = Array.isArray(d.box3) ? d.box3 : [];
    const b4: string[] = Array.isArray(d.box4) ? d.box4 : [];
    const boxes = [
      { label: isPest ? "Politics" : "Strengths", sub: isPest ? "政治" : "強み", items: b1, border: "border-blue-500", title: "text-blue-600 dark:text-blue-400", bullet: "text-blue-500", bg: "dark:bg-blue-900/5" },
      { label: isPest ? "Economy" : "Weaknesses", sub: isPest ? "経済" : "弱み", items: b2, border: "border-red-500", title: "text-red-600 dark:text-red-400", bullet: "text-red-500", bg: "dark:bg-red-900/5" },
      { label: isPest ? "Society" : "Opportunities", sub: isPest ? "社会" : "機会", items: b3, border: "border-green-500", title: "text-green-600 dark:text-green-400", bullet: "text-green-500", bg: "dark:bg-green-900/5" },
      { label: isPest ? "Technology" : "Threats", sub: isPest ? "技術" : "脅威", items: b4, border: "border-yellow-500", title: "text-yellow-600 dark:text-yellow-400", bullet: "text-yellow-500", bg: "dark:bg-yellow-900/5" },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {boxes.map((box, i) => (
          <div key={i} className={`bg-white ${box.bg} dark:bg-[#1e1f20] border-t-4 ${box.border} rounded-lg p-5 shadow-sm border-x border-b dark:border-transparent border-gray-200`}>
            <h2 className={`text-lg font-bold ${box.title} mb-3 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center`}>
              <span className="text-2xl mr-2" aria-hidden="true">{box.label[0]}</span>
              {box.label.slice(1)}
              <span className="text-xs text-gray-500 dark:text-g-sub ml-2 font-normal">{box.sub}</span>
            </h2>
            <ul className="space-y-2 pl-1">
              {box.items.map((item, j) => (
                <li key={j} className="bg-gray-50 dark:bg-[#131314] p-2 rounded border border-gray-200 dark:border-gray-800 text-base text-gray-800 dark:text-g-text flex items-start">
                  <span aria-hidden="true" className={`${box.bullet} mr-2 mt-0.5 shrink-0`}>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (analysis.type === "image") {
    const imagePath = d.image_path as string | undefined;
    return imagePath ? (
      <div className="bg-white dark:bg-[#1e1f20] p-4 sm:p-6 shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-800 flex justify-center">
        <img
          src={`${API_BASE}/storage/${imagePath}`}
          alt={analysis.title}
          className="max-w-full object-contain rounded border border-gray-200 dark:border-gray-700 shadow-sm"
        />
      </div>
    ) : null;
  }

  return null;
}

// -------- ページ本体 --------
export default function AnalysisShowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/analyses/${id}`, { headers: getAuthHeaders() })
      .then(async (res) => {
        if (!res.ok) { setNotFound(true); return; }
        setAnalysis(await res.json());
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBack = () => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("from") === "dashboard") {
      router.push("/dashboard?tab=analyses");
    } else {
      router.back();
    }
  };

  const typeLabel = () => {
    if (!analysis) return "";
    if (analysis.type === "tree") return "ロジックツリー分析";
    if (analysis.type === "matrix") return "総合評価表";
    if (analysis.type === "swot") {
      return analysis.data?.framework === "PEST" ? "PEST分析" : "SWOT分析";
    }
    if (analysis.type === "image") return "オリジナル図解";
    return "分析・図解";
  };

  const typeIcon = () => {
    if (!analysis) return null;
    if (analysis.type === "tree")
      return <svg aria-hidden="true" className="h-4 w-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    if (analysis.type === "matrix")
      return <svg aria-hidden="true" className="h-4 w-4 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
    if (analysis.type === "swot")
      return <svg aria-hidden="true" className="h-4 w-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    if (analysis.type === "image")
      return <svg aria-hidden="true" className="h-4 w-4 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
    return null;
  };

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <p className="text-gray-500 text-base">読み込み中...</p>
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="py-12 flex flex-col items-center gap-4">
        <p className="text-gray-400 text-base">分析データが見つかりませんでした。</p>
        <Link href="/" className="text-blue-500 hover:underline text-base">トップへ戻る</Link>
      </div>
    );
  }

  const strippedTitle = analysis.title.includes(": ")
    ? analysis.title.split(": ").slice(1).join(": ")
    : analysis.title;

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 情報カード: ツール種別（小）+ 戻るボタン / タイトル（大）+ メタ情報 */}
        <div className="mb-8">
          {/* 上段: ツール種別ラベル + 戻るボタン */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-g-sub">
              {typeIcon()}
              <span>{typeLabel()}</span>
            </div>
            <button
              onClick={handleBack}
              className="text-sm font-bold text-gray-500 hover:text-gray-700 dark:text-g-sub dark:hover:text-gray-200 transition-colors py-1 pl-2"
            >
              ← 戻る
            </button>
          </div>

          {/* 下段: タイトル（大）+ メタ情報 */}
          <div className="flex items-start justify-between gap-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-g-text leading-tight">
              {strippedTitle}
            </h1>
            <div className="text-xs text-gray-500 dark:text-g-sub text-right shrink-0 space-y-1 mt-0.5">
              <div className="font-bold text-sm text-gray-700 dark:text-g-text">
                {analysis.user.name}
              </div>
              <div>
                {new Date(analysis.created_at).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
              {analysis.topic && (
                <div>
                  <Link
                    href={`/topics/${analysis.topic.id}`}
                    className="text-blue-500 hover:underline transition-colors"
                  >
                    → {analysis.topic.title}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <AnalysisContent analysis={analysis} />

        {/* 補足 */}
        {analysis.supplement && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800/50">
            <span className="font-bold text-yellow-600 dark:text-yellow-500 text-[10px] block mb-1">✅ 投稿者からの補足</span>
            <p className="text-base text-gray-800 dark:text-g-text whitespace-pre-wrap">{analysis.supplement}</p>
          </div>
        )}

      </div>
    </div>
  );
}
