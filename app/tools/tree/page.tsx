"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

// ===== Types =====

type TreeNode = {
  id: string;
  speaker: string;
  stance: string;
  text: string;
  children: TreeNode[];
};

type ChatMsg = {
  id: string;
  role: "user" | "ai" | "loading";
  text: string;
  target?: string;
};

// ===== Constants =====

const SPEAKERS = ["ユーザーA", "ユーザーB", "ユーザーC", "自分 (自)", "その他"];
const STANCES = ["主張", "反論", "賛成・補足", "疑問"];

// ===== Helpers =====

function genId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function createNode(): TreeNode {
  return { id: genId(), speaker: "ユーザーA", stance: "反論", text: "", children: [] };
}

function addIds(nodes: unknown[]): TreeNode[] {
  return (nodes as TreeNode[]).map((node) => ({
    ...node,
    id: node.id || genId(),
    children: node.children ? addIds(node.children) : [],
  }));
}

function computeLabels(nodes: TreeNode[]): Map<string, string> {
  const labels = new Map<string, string>();
  const counts: Record<string, number> = {};

  function traverse(list: TreeNode[]) {
    for (const node of list) {
      const s = node.speaker;
      let p = "他";
      if (s.includes("A")) p = "A";
      else if (s.includes("B")) p = "B";
      else if (s.includes("C")) p = "C";
      else if (s.includes("自分")) p = "自";
      counts[p] = (counts[p] || 0) + 1;
      labels.set(node.id, p + counts[p]);
      traverse(node.children);
    }
  }
  traverse(nodes);
  return labels;
}

function getSelfLabels(labels: Map<string, string>, nodes: TreeNode[]): string[] {
  const result: string[] = [];
  function traverse(list: TreeNode[]) {
    for (const node of list) {
      if (node.speaker.includes("自分")) {
        const label = labels.get(node.id);
        if (label) result.push(label);
      }
      traverse(node.children);
    }
  }
  traverse(nodes);
  return result;
}

function getSpeakerColor(speaker: string) {
  return speaker.includes("自分")
    ? "text-blue-600 dark:text-blue-400"
    : "text-gray-700 dark:text-gray-300";
}

function getStanceStyle(stance: string) {
  switch (stance) {
    case "主張":
      return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-400/10 dark:text-gray-400 dark:border-gray-400/30";
    case "反論":
      return "bg-red-100 text-red-600 border-red-200 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/30";
    case "賛成・補足":
      return "bg-green-100 text-green-600 border-green-200 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/30";
    case "疑問":
      return "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/30";
    default:
      return "";
  }
}

// ===== NodeEditor Component (recursive) =====

function NodeEditor({
  node,
  labels,
  onChange,
  onRemove,
}: {
  node: TreeNode;
  labels: Map<string, string>;
  onChange: (updated: TreeNode) => void;
  onRemove: () => void;
}) {
  const label = labels.get(node.id) || "";
  const isSelf = node.speaker.includes("自分");

  return (
    <div className="mt-3 relative tree-line ml-8">
      <div className="flex flex-col">
        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-2 mb-1.5 pr-2">
          <select
            value={node.speaker}
            onChange={(e) => onChange({ ...node, speaker: e.target.value })}
            className={`bg-transparent dark:bg-[#131314] text-sm font-bold focus:outline-none cursor-pointer py-1 ${getSpeakerColor(node.speaker)}`}
          >
            {SPEAKERS.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-[#1e1f20]">
                {s}
              </option>
            ))}
          </select>

          <span
            className={`text-xs font-black px-1.5 py-0.5 rounded shrink-0 ${
              isSelf
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
            }`}
          >
            {label}
          </span>

          <select
            value={node.stance}
            onChange={(e) => onChange({ ...node, stance: e.target.value })}
            className={`text-[11px] px-2 py-1 rounded focus:outline-none cursor-pointer border ${getStanceStyle(node.stance)}`}
          >
            {STANCES.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-[#1e1f20]">
                {s}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 sm:p-1.5 rounded -mr-2 flex items-center"
          >
            <span className="sr-only">削除</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Text input */}
        <textarea
          value={node.text}
          onChange={(e) => onChange({ ...node, text: e.target.value })}
          rows={1}
          placeholder="意見を入力..."
          className="w-full bg-transparent border-0 border-b border-gray-300 dark:border-gray-700 focus:ring-0 focus:border-blue-500 text-gray-900 dark:text-gray-200 text-[15px] sm:text-sm py-1.5 focus:outline-none transition-colors placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed resize-none overflow-hidden"
          onInput={(e) => {
            const t = e.target as HTMLTextAreaElement;
            t.style.height = "auto";
            t.style.height = t.scrollHeight + "px";
          }}
        />

        {/* Add reply button */}
        <button
          type="button"
          onClick={() => onChange({ ...node, children: [...node.children, createNode()] })}
          className="mt-1.5 text-[12px] font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center w-fit py-1.5 pr-3"
        >
          <span className="mr-1">＋</span> 返信を追加
        </button>

        {/* Children */}
        {node.children.length > 0 && (
          <div className="ml-2 pl-3 sm:ml-3 sm:pl-4 mt-1 space-y-2">
            {node.children.map((child, idx) => (
              <NodeEditor
                key={child.id}
                node={child}
                labels={labels}
                onChange={(updated) => {
                  const newChildren = [...node.children];
                  newChildren[idx] = updated;
                  onChange({ ...node, children: newChildren });
                }}
                onRemove={() => {
                  onChange({ ...node, children: node.children.filter((_, i) => i !== idx) });
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Chat message renderer =====

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-gray-500 dark:bg-gray-600 flex items-center justify-center shrink-0 shadow-md text-xs text-white font-bold">
          You
        </div>
        <div className="flex flex-col items-end">
          {msg.target && (
            <span className="text-[10px] text-gray-500 mb-1 font-bold">Target: {msg.target}</span>
          )}
          <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none text-sm text-white shadow-md max-w-[85%] whitespace-pre-wrap leading-relaxed">
            {msg.text}
          </div>
        </div>
      </div>
    );
  }
  if (msg.role === "loading") {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
          <svg className="h-4 w-4 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="bg-gray-100 dark:bg-[#131314] p-3 rounded-lg rounded-tl-none text-sm text-gray-500 border border-gray-200 dark:border-gray-800 font-bold">
          <span className="animate-pulse">AIが思考中...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-md">
        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <div className="bg-gray-100 dark:bg-[#131314] p-3 rounded-lg rounded-tl-none text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 max-w-[85%] whitespace-pre-wrap leading-relaxed">
        {msg.text}
      </div>
    </div>
  );
}

// ===== Main Page =====

function TreePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: isLoading } = useAuth();

  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [theme, setTheme] = useState("");
  const [infoUrl, setInfoUrl] = useState("");
  const [infoDesc, setInfoDesc] = useState("");
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    {
      id: "init",
      role: "ai",
      text: "「自1の返信案を作って」など、対象を選んで指示を試してみてください。",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiTarget, setAiTarget] = useState("指定なし");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const labels = computeLabels(nodes);
  const selfLabels = getSelfLabels(labels, nodes);

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
        if (data.type !== "tree") return;
        setEditId(id);
        const saved = data.data;
        if (saved.theme) setTheme(saved.theme);
        if (saved.meta) {
          setInfoUrl(saved.meta.url || "");
          setInfoDesc(saved.meta.description || "");
        }
        if (saved.nodes) setNodes(addIds(saved.nodes));
      })
      .catch(console.error);
  }, [searchParams, user]);

  if (isLoading || !user) return null;

  if (!user.is_pro) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-4">このページはPRO会員限定です。</p>
        <Link href="/" className="text-blue-500 hover:underline">
          トップへ戻る
        </Link>
      </div>
    );
  }

  async function saveTree() {
    if (isSaving) return;
    setIsSaving(true);
    const payloadData = { theme, meta: { url: infoUrl, description: infoDesc }, nodes };
    const title = theme
      ? `ツリー: ${theme}`
      : `ロジックツリー (${new Date().toLocaleDateString()})`;

    try {
      const url = editId ? `${API_BASE}/api/analyses/${editId}` : `${API_BASE}/api/analyses`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ title, type: "tree", data: payloadData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "保存に失敗しました");
      alert(data.message);
      if (!editId && data.id) setEditId(data.id);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  async function generateWithAI() {
    if (!theme.trim()) {
      alert("テーマを入力してください");
      return;
    }
    setIsGenerating(true);
    const prompt = `テーマ: 「${theme}」
このテーマについて、多角的な議論を展開するロジックツリー（主張とそれに対する賛成・反論・疑問の分岐）を自動生成してください。
深さは2〜3階層、合計5〜8ノード程度にしてください。
各ノードは以下のプロパティを持つJSONオブジェクトの配列として出力してください。他のテキストは一切含めないでください。
※ "speaker" の値は必ず「自分 (自)」「ユーザーA」「ユーザーB」「ユーザーC」のいずれかにしてください。
[{"speaker":"自分 (自)","stance":"主張","text":"テーマに対するメインの主張","children":[{"speaker":"ユーザーA","stance":"反論","text":"反論","children":[]}]}]`;

    try {
      const res = await fetch(`${API_BASE}/api/tools/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, context: "JSON配列のみ出力" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const match = data.reply.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("JSONの抽出に失敗しました");
      setNodes(addIds(JSON.parse(match[0])));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "AI自動生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  }

  async function sendAiMessage() {
    const text = aiInput.trim();
    if (!text) return;
    setAiInput("");

    const userMsg: ChatMsg = {
      id: genId(),
      role: "user",
      text,
      target: aiTarget !== "指定なし" ? aiTarget : undefined,
    };
    const loadingId = genId();
    const loadingMsg: ChatMsg = { id: loadingId, role: "loading", text: "" };
    setChatMsgs((prev) => [...prev, userMsg, loadingMsg]);

    let contextText = "";
    if (infoDesc || infoUrl) contextText += `【事前情報】\n概要: ${infoDesc}\nURL: ${infoUrl}\n\n`;
    contextText += "【現在のツリー構造】\n" + JSON.stringify(nodes, null, 2);
    const promptText = (aiTarget !== "指定なし" ? `対象: 【${aiTarget}】\n` : "") + text;

    try {
      const res = await fetch(`${API_BASE}/api/tools/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, context: contextText }),
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

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-semibold text-xl text-gray-800 dark:text-gray-200 flex items-center">
            <svg
              aria-hidden="true"
              className="h-5 w-5 mr-2 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
            ロジックツリー作成 (PRO)
          </h1>
          <button
            onClick={saveTree}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-2 px-4 sm:py-1.5 rounded text-sm transition-colors shadow-sm"
          >
            {isSaving ? "保存中..." : "ツリーを保存する"}
          </button>
        </div>

        <div className="flex flex-col gap-8">
          {/* Tree editor section */}
          <div>
            <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                各コメントに自動でID（自1, A2など）が付与され、下部のAIと連携します。完成したツリーはトピックの分析タブに投稿できます。
              </p>
            </div>

            {/* AI Generate section */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-3 items-end shadow-sm">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1.5">
                  AIでツリーの土台を自動生成
                </label>
                <input
                  type="text"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="議論したいテーマを入力（例：消費税増税の是非について）"
                  className="w-full bg-white dark:bg-[#131314] border border-blue-300 dark:border-blue-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold py-2.5 px-5 rounded-lg text-sm transition-colors shadow-sm shrink-0 flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {isGenerating ? "AIが生成中..." : "AIで生成"}
              </button>
            </div>

            {/* Info URL + Description */}
            <div className="space-y-3 mb-4">
              <input
                type="url"
                value={infoUrl}
                onChange={(e) => setInfoUrl(e.target.value)}
                placeholder="元情報のURL (例: https://youtu.be/...)"
                className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm py-2 px-1 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-600"
              />
              <textarea
                value={infoDesc}
                onChange={(e) => setInfoDesc(e.target.value)}
                rows={1}
                placeholder="トピックの主題や元情報の概要を入力..."
                className="w-full bg-transparent border-b-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-200 text-sm py-2 px-1 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed resize-none overflow-hidden"
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement;
                  t.style.height = "auto";
                  t.style.height = t.scrollHeight + "px";
                }}
              />
            </div>

            {/* Add root node button */}
            <button
              onClick={() => setNodes([...nodes, createNode()])}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors flex items-center bg-gray-100 hover:bg-gray-200 dark:bg-[#1e1f20] dark:hover:bg-gray-800 px-4 py-2 rounded-full w-fit border border-gray-200 dark:border-gray-700 shadow-sm mt-4"
            >
              <span className="text-base mr-1 leading-none">＋</span> 分岐を追加
            </button>

            {/* Node list */}
            <div className="space-y-3 mt-4 pl-4">
              {nodes.map((node, idx) => (
                <NodeEditor
                  key={node.id}
                  node={node}
                  labels={labels}
                  onChange={(updated) => {
                    const newNodes = [...nodes];
                    newNodes[idx] = updated;
                    setNodes(newNodes);
                  }}
                  onRemove={() => setNodes(nodes.filter((_, i) => i !== idx))}
                />
              ))}
            </div>
          </div>

          {/* AI Chat section */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-gray-100">
              <svg
                aria-hidden="true"
                className="h-6 w-6 mr-2 text-blue-500 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              AIアシスタント (Gemini)
            </h2>

            <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col h-[400px] shadow-sm overflow-hidden">
              {/* Messages */}
              <div className="chat-scroll flex-1 overflow-y-auto p-4 space-y-4">
                {chatMsgs.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} />
                ))}
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18191a]">
                <div className="flex gap-2 mb-2.5 items-center">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-bold shrink-0">
                    返信対象:
                  </label>
                  <select
                    value={aiTarget}
                    onChange={(e) => setAiTarget(e.target.value)}
                    className="bg-white dark:bg-[#131314] text-gray-900 dark:text-gray-200 text-xs px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm w-full sm:w-auto"
                  >
                    <option value="指定なし">指定なし (全体への質問・調査)</option>
                    {selfLabels.map((label) => (
                      <option key={label} value={label}>
                        {label} を対象にする
                      </option>
                    ))}
                  </select>
                </div>
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
                    placeholder="AIへの指示や修正案を入力..."
                    className="flex-1 bg-white dark:bg-[#131314] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-200 text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32 transition-shadow shadow-sm resize-none overflow-hidden"
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "auto";
                      t.style.height = t.scrollHeight + "px";
                    }}
                  />
                  <button
                    onClick={sendAiMessage}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md shrink-0"
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

export default function TreePage() {
  return (
    <Suspense fallback={null}>
      <TreePageInner />
    </Suspense>
  );
}
