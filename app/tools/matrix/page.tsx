"use client";

import { useState, useEffect, useLayoutEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

// ===== Types =====

type Pattern = {
  title: string;
  description: string;
};

type Cell = {
  score: string; // "3", "2", "1", "0", "-1"
  reason: string;
};

type MatrixRow = {
  itemTitle: string;
  evaluations: Cell[];
};

type ChatMsg = {
  id: string;
  role: "user" | "ai" | "loading";
  text: string;
};

// ===== Helpers =====

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function createPattern(): Pattern {
  return { title: "新規パターン", description: "" };
}

function createRow(colCount: number): MatrixRow {
  return {
    itemTitle: "新規評価項目",
    evaluations: Array.from({ length: colCount }, () => ({ score: "-1", reason: "" })),
  };
}

function computeTotal(rows: MatrixRow[], colIdx: number): { total: number; hasValue: boolean } {
  let total = 0;
  let hasValue = false;
  for (const row of rows) {
    const val = parseInt(row.evaluations[colIdx]?.score ?? "-1");
    if (val !== -1) {
      total += val;
      hasValue = true;
    }
  }
  return { total, hasValue };
}

function getScoreStyle(score: string) {
  switch (score) {
    case "3":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "2":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "1":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "0":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-g-sub";
  }
}

function scoreLabel(score: string) {
  switch (score) {
    case "3":
      return "◎ 最適 (3pt)";
    case "2":
      return "〇 良い (2pt)";
    case "1":
      return "△ 懸念 (1pt)";
    case "0":
      return "× 不可 (0pt)";
    default:
      return "--";
  }
}

// ===== ChatBubble =====

function AiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-logos-surface border border-logos-border rounded-2xl rounded-tr-sm px-4 py-3 text-base text-logos-text max-w-[85%] whitespace-pre-wrap leading-relaxed">
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.role === "loading") {
    return (
      <div className="flex gap-3 items-start">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-cyan-500/30">
          <AiIcon className="h-3.5 w-3.5 text-logos-text animate-pulse" />
        </div>
        <p className="text-base text-logos-sub animate-pulse pt-1">生成中...</p>
      </div>
    );
  }
  return (
    <div className="flex gap-3 items-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-300 via-cyan-500 to-teal-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-cyan-500/30">
        <AiIcon className="h-3.5 w-3.5 text-logos-text" />
      </div>
      <div className="text-base text-logos-text whitespace-pre-wrap leading-relaxed flex-1 pt-0.5">
        {msg.text}
      </div>
    </div>
  );
}

// ===== Main Page =====

function MatrixPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: isLoading } = useAuth();

  const [theme, setTheme] = useState("");
  const [patterns, setPatterns] = useState<Pattern[]>([
    { title: "パターンA", description: "" },
    { title: "パターンB", description: "" },
  ]);
  const [rows, setRows] = useState<MatrixRow[]>([
    {
      itemTitle: "評価項目1",
      evaluations: [
        { score: "-1", reason: "" },
        { score: "-1", reason: "" },
      ],
    },
  ]);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // patterns/rows が変わるたびにテーブル内の全 textarea を自動リサイズ
  useLayoutEffect(() => {
    if (!tableRef.current) return;
    tableRef.current.querySelectorAll("textarea").forEach((el) => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    });
  }, [patterns, rows]);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // Auth check
  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  // Load edit data if ?edit=ID
  useEffect(() => {
    const editParam = searchParams.get("edit");
    if (!editParam || !user) return;
    const id = parseInt(editParam);
    if (isNaN(id)) return;

    fetch(`${API_BASE}/api/analyses/${id}`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        if (data.type !== "matrix") return;
        setEditId(id);
        const saved = data.data;
        if (saved.theme) setTheme(saved.theme);
        if (saved.patterns) setPatterns(saved.patterns);
        if (saved.items) {
          setRows(
            saved.items.map(
              (item: { itemTitle?: string; title?: string; evaluations?: Cell[]; scores?: Cell[] }) => ({
                itemTitle: item.itemTitle ?? item.title ?? "",
                evaluations: (item.evaluations ?? item.scores ?? []).map((e: Cell) => ({
                  score: String(e.score),
                  reason: e.reason ?? "",
                })),
              })
            )
          );
        }
      })
      .catch(console.error);
  }, [searchParams, user]);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="h-7 bg-white/[0.06] rounded-md w-2/3 mb-3" />
          <div className="h-4 bg-white/[0.04] rounded w-1/4 mb-8" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white/[0.04] rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  if (!user.is_pro) {
    return (
      <div className="py-20 text-center">
        <p className="text-logos-sub mb-4">このページはPRO会員限定です。</p>
        <Link href="/" className="text-blue-500 hover:underline">
          トップへ戻る
        </Link>
      </div>
    );
  }

  // ===== Table operations =====

  function addColumn() {
    setPatterns([...patterns, createPattern()]);
    setRows(rows.map((row) => ({ ...row, evaluations: [...row.evaluations, { score: "-1", reason: "" }] })));
  }

  function removeColumn(idx: number) {
    setPatterns(patterns.filter((_, i) => i !== idx));
    setRows(rows.map((row) => ({ ...row, evaluations: row.evaluations.filter((_, i) => i !== idx) })));
  }

  function addRow() {
    setRows([...rows, createRow(patterns.length)]);
  }

  function removeRow(idx: number) {
    setRows(rows.filter((_, i) => i !== idx));
  }

  function updatePattern(idx: number, updated: Partial<Pattern>) {
    const newPatterns = [...patterns];
    newPatterns[idx] = { ...newPatterns[idx], ...updated };
    setPatterns(newPatterns);
  }

  function updateRow(rowIdx: number, updated: Partial<MatrixRow>) {
    const newRows = [...rows];
    newRows[rowIdx] = { ...newRows[rowIdx], ...updated };
    setRows(newRows);
  }

  function updateCell(rowIdx: number, colIdx: number, updated: Partial<Cell>) {
    const newRows = [...rows];
    const newEvals = [...newRows[rowIdx].evaluations];
    newEvals[colIdx] = { ...newEvals[colIdx], ...updated };
    newRows[rowIdx] = { ...newRows[rowIdx], evaluations: newEvals };
    setRows(newRows);
  }

  // ===== Save =====

  async function saveMatrix() {
    if (isSaving) return;
    setIsSaving(true);
    const payloadData = { theme, patterns, items: rows };
    const title = theme
      ? `評価表: ${theme}`
      : `総合評価表 (${new Date().toLocaleDateString()})`;

    try {
      const url = editId ? `${API_BASE}/api/analyses/${editId}` : `${API_BASE}/api/analyses`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ title, type: "matrix", data: payloadData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "保存に失敗しました");
      showToast(data.message, "success");
      if (!editId && data.id) setEditId(data.id);
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "保存に失敗しました", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ===== AI Generate =====

  async function generateWithAI() {
    if (!theme.trim()) {
      showToast("テーマを入力してください", "error");
      return;
    }
    setIsGenerating(true);
    const prompt = `テーマ: 「${theme}」
このテーマについて、比較すべき2〜3の「パターン（選択肢・方針）」と、それらを評価するための3〜4の「評価項目」を挙げ、総合評価表を作成してください。
各セルには0〜3のスコア（3:最適, 2:良い, 1:懸念, 0:不可）と短い根拠を入れてください。
以下のJSON形式のみを出力してください。他のテキストは一切不要です。
{"patterns":[{"title":"パターン名","description":"概要"}],"items":[{"itemTitle":"評価項目名","evaluations":[{"score":3,"reason":"理由"}]}]}`;

    try {
      const res = await fetch(`${API_BASE}/api/tools/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "JSONのみ出力" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const match = data.reply.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSONの抽出に失敗しました");
      const parsed = JSON.parse(match[0]);
      if (parsed.patterns) setPatterns(parsed.patterns);
      if (parsed.items) {
        setRows(
          parsed.items.map((item: { itemTitle?: string; title?: string; evaluations?: Cell[] }) => ({
            itemTitle: item.itemTitle ?? item.title ?? "",
            evaluations: (item.evaluations ?? []).map((e: Cell) => ({
              score: String(e.score),
              reason: e.reason ?? "",
            })),
          }))
        );
      }
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "AI自動生成に失敗しました", "error");
    } finally {
      setIsGenerating(false);
    }
  }

  // ===== AI Chat =====

  async function sendAiMessage() {
    const text = aiInput.trim();
    if (!text) return;
    setAiInput("");

    const loadingId = genId();
    setChatMsgs((prev) => [
      ...prev,
      { id: genId(), role: "user", text },
      { id: loadingId, role: "loading", text: "" },
    ]);

    const contextText =
      "【現在の総合評価表の構造】\n" +
      JSON.stringify({ theme, patterns, items: rows }, null, 2);

    try {
      const res = await fetch(`${API_BASE}/api/tools/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, context: contextText }),
      });
      const data = await res.json();
      const reply = data.reply || data.error || "エラーが発生しました";
      setChatMsgs((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        { id: genId(), role: "ai", text: reply },
      ]);
    } catch {
      setChatMsgs((prev) => [
        ...prev.filter((m) => m.id !== loadingId),
        { id: genId(), role: "ai", text: "通信エラーが発生しました。" },
      ]);
    }
  }

  const maxTotal = patterns.reduce((max, _, cIdx) => {
    const { total, hasValue } = computeTotal(rows, cIdx);
    return hasValue && total > max ? total : max;
  }, -Infinity);

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {toast && (
          <div
            role="alert"
            aria-live="polite"
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-bold text-logos-text ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-2xl text-logos-text flex items-center gap-2">
            <svg aria-hidden="true" className="h-5 w-5 text-purple-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            総合評価表作成
            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-xs font-bold">PRO</span>
          </h1>
          <button
            onClick={saveMatrix}
            disabled={isSaving}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-5 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? "保存中..." : "保存する"}
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Theme + AI Generate */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-logos-surface border border-logos-border rounded-lg px-3 py-2 shadow-sm">
              <div className="text-xs font-bold text-logos-sub mb-0.5">
                テーマ（主題）
              </div>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例：AIの普及が社会に与える影響について"
                className="w-full bg-transparent font-bold text-base text-logos-text focus:outline-none placeholder-gray-400 dark:placeholder-gray-600"
              />
            </div>
            <button
              onClick={generateWithAI}
              disabled={isGenerating}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all disabled:opacity-50 shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isGenerating ? "生成中..." : "AIで自動生成"}
            </button>
          </div>

          {/* Description */}
          <div className="border-b border-logos-border pb-4">
            <p className="text-base text-logos-sub">
              行（評価項目）と列（パターン）を自由に追加・削除できます。◎=3点, 〇=2点, △=1点, ×=0点で下部に自動集計されます。
            </p>
          </div>

          {/* Matrix Table */}
          <div ref={tableRef} className="rounded-xl border border-logos-border overflow-hidden">
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    {/* Header: item label */}
                    <th className="p-3 border-b border-r border-logos-border w-48 bg-logos-hover align-bottom">
                      <div className="text-xs font-bold text-logos-sub mb-1">
                        評価項目 ＼ 比較パターン
                      </div>
                    </th>

                    {/* Pattern columns */}
                    {patterns.map((pattern, pIdx) => (
                      <th
                        key={pIdx}
                        className="p-3 border-b border-r border-logos-border w-64 bg-logos-hover align-top relative group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <textarea
                            value={pattern.title}
                            onChange={(e) => updatePattern(pIdx, { title: e.target.value })}
                            rows={1}
                            className="w-full bg-transparent font-bold text-blue-600 dark:text-blue-400 focus:outline-none text-base resize-none overflow-hidden"
                            onInput={(e) => {
                              const t = e.target as HTMLTextAreaElement;
                              t.style.height = "auto";
                              t.style.height = t.scrollHeight + "px";
                            }}
                          />
                          <button
                            onClick={() => removeColumn(pIdx)}
                            className="text-gray-400 hover:text-red-500 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-xs ml-1 shrink-0 cursor-pointer"
                          >
                            <span className="sr-only">削除</span>✕
                          </button>
                        </div>
                        <textarea
                          value={pattern.description ?? ""}
                          onChange={(e) => updatePattern(pIdx, { description: e.target.value })}
                          rows={1}
                          placeholder="概要や前提..."
                          className="w-full bg-transparent text-logos-sub text-sm focus:outline-none resize-none overflow-hidden mt-1 placeholder-gray-500 dark:placeholder-gray-600"
                          onInput={(e) => {
                            const t = e.target as HTMLTextAreaElement;
                            t.style.height = "auto";
                            t.style.height = t.scrollHeight + "px";
                          }}
                        />
                      </th>
                    ))}

                    {/* Add column button */}
                    <th className="p-3 border-b border-logos-border w-24 bg-logos-hover align-middle text-center">
                      <button
                        onClick={addColumn}
                        className="text-logos-sub hover:text-logos-text bg-logos-elevated hover:bg-logos-border rounded-lg px-2 py-4 text-xs font-bold transition-colors w-full flex flex-col items-center gap-1 cursor-pointer"
                      >
                        <span className="text-lg leading-none">＋</span>
                        <span>列を追加</span>
                      </button>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="group row-item">
                      {/* Item title */}
                      <td className="p-3 border-b border-r border-logos-border bg-logos-hover">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeRow(rIdx)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0 p-1 cursor-pointer"
                          >
                            ✕
                          </button>
                          <textarea
                            value={row.itemTitle}
                            onChange={(e) => updateRow(rIdx, { itemTitle: e.target.value })}
                            rows={1}
                            className="w-full bg-transparent font-bold text-logos-text focus:outline-none text-base resize-none overflow-hidden"
                            onInput={(e) => {
                              const t = e.target as HTMLTextAreaElement;
                              t.style.height = "auto";
                              t.style.height = t.scrollHeight + "px";
                            }}
                          />
                        </div>
                      </td>

                      {/* Score cells */}
                      {patterns.map((_, cIdx) => {
                        const cell = row.evaluations[cIdx] ?? { score: "-1", reason: "" };
                        return (
                          <td
                            key={cIdx}
                            className="p-3 border-b border-r border-logos-border bg-logos-surface hover:bg-logos-hover transition-colors"
                          >
                            <div className="flex flex-col gap-2">
                              <select
                                value={cell.score}
                                onChange={(e) => updateCell(rIdx, cIdx, { score: e.target.value })}
                                className={`w-full border border-logos-border rounded px-2 py-1 text-base focus:outline-none focus:border-blue-500 font-bold ${getScoreStyle(cell.score)}`}
                              >
                                <option value="3">◎ 最適</option>
                                <option value="2">〇 良い</option>
                                <option value="1">△ 懸念あり</option>
                                <option value="0">× 不可</option>
                                <option value="-1">-- 評価 --</option>
                              </select>
                              <textarea
                                value={cell.reason ?? ""}
                                onChange={(e) => updateCell(rIdx, cIdx, { reason: e.target.value })}
                                rows={2}
                                placeholder="根拠やリンク..."
                                className="w-full bg-transparent text-logos-sub text-sm focus:outline-none resize-none overflow-hidden mt-1 placeholder-gray-500 dark:placeholder-gray-600"
                                onInput={(e) => {
                                  const t = e.target as HTMLTextAreaElement;
                                  t.style.height = "auto";
                                  t.style.height = t.scrollHeight + "px";
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Empty cell for add-column column */}
                      <td className="border-b border-logos-border bg-logos-surface" />
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-logos-hover">
                  <tr>
                    {/* Add row button */}
                    <td className="p-3 border-r border-logos-border text-right">
                      <button
                        onClick={addRow}
                        className="text-xs font-bold text-logos-sub hover:text-logos-text transition-colors flex items-center bg-logos-elevated hover:bg-logos-border px-3 py-1.5 rounded-full mr-auto cursor-pointer"
                      >
                        <span className="text-base mr-1 leading-none">＋</span> 評価項目(行)を追加
                      </button>
                    </td>

                    {/* Total scores */}
                    {patterns.map((_, cIdx) => {
                      const { total, hasValue } = computeTotal(rows, cIdx);
                      const isMax = hasValue && total === maxTotal;
                      return (
                        <td
                          key={cIdx}
                          className={`p-3 border-r border-logos-border text-center${isMax ? " ring-2 ring-blue-500 rounded" : ""}`}
                        >
                          <div className="text-xs text-logos-sub mb-1 font-bold">総合評価</div>
                          {hasValue ? (
                            <div>
                              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {total}
                              </span>
                              <span className="text-xs text-logos-sub ml-1">pt</span>
                            </div>
                          ) : (
                            <span className="text-sm text-logos-sub">未評価</span>
                          )}
                        </td>
                      );
                    })}

                    <td />
                  </tr>
                </tfoot>
              </table>
          </div>
          </div>

          {/* AI Chat */}
          <div className="mt-4 border-t border-logos-border pt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-300 via-cyan-500 to-teal-600 flex items-center justify-center shadow-sm shadow-cyan-500/30">
                <AiIcon className="h-3 w-3 text-logos-text" />
              </div>
              <h2 className="text-base font-bold text-logos-text">AIアシスタント</h2>
              <span className="text-xs text-logos-sub">「評価項目に不足はないか」「パターンAのセルを埋める情報を調べて」など指示してみてください。</span>
            </div>

            <div className="bg-logos-bg border border-logos-border rounded-xl flex flex-col h-[350px] overflow-hidden">
              <div className="custom-scroll flex-1 overflow-y-auto p-4 space-y-4">
                {chatMsgs.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} />
                ))}
              </div>

              <div className="p-3 bg-logos-surface">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendAiMessage();
                      }
                    }}
                    rows={1}
                    placeholder="AIに項目出しや評価のサポートを依頼..."
                    className="flex-1 bg-logos-bg border border-logos-border rounded-lg text-logos-text text-base p-2.5 focus:outline-none focus:border-blue-500 max-h-32 resize-none overflow-hidden"
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "auto";
                      t.style.height = t.scrollHeight + "px";
                    }}
                  />
                  <button
                    onClick={sendAiMessage}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all shrink-0 cursor-pointer"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatrixPage() {
  return (
    <Suspense fallback={null}>
      <MatrixPageInner />
    </Suspense>
  );
}
