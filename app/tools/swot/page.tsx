"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

// ===== Types =====

type Framework = "SWOT" | "PEST";

type ChatMsg = {
  id: string;
  role: "user" | "ai" | "loading";
  text: string;
};

// ===== Helpers =====

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

const FRAMEWORK_LABELS: Record<Framework, { box1: string; box2: string; box3: string; box4: string }> = {
  SWOT: {
    box1: "Strengths",
    box2: "Weaknesses",
    box3: "Opportunities",
    box4: "Threats",
  },
  PEST: {
    box1: "Politics",
    box2: "Economy",
    box3: "Society",
    box4: "Technology",
  },
};

const FRAMEWORK_SUBTITLES: Record<Framework, { box1: string; box2: string; box3: string; box4: string }> = {
  SWOT: { box1: "強み (内部要因)", box2: "弱み (内部要因)", box3: "機会 (外部要因)", box4: "脅威 (外部要因)" },
  PEST: { box1: "政治", box2: "経済", box3: "社会", box4: "技術" },
};

const BOX_COLORS = {
  box1: { border: "border-blue-500", title: "text-blue-600 dark:text-blue-400", bullet: "text-blue-500" },
  box2: { border: "border-red-500", title: "text-red-600 dark:text-red-400", bullet: "text-red-500" },
  box3: { border: "border-green-500", title: "text-green-600 dark:text-green-400", bullet: "text-green-500" },
  box4: { border: "border-yellow-500", title: "text-yellow-600 dark:text-yellow-400", bullet: "text-yellow-500" },
} as const;

// ===== BoxPanel Component =====

function BoxPanel({
  boxKey,
  framework,
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  boxKey: "box1" | "box2" | "box3" | "box4";
  framework: Framework;
  items: string[];
  onAdd: () => void;
  onUpdate: (idx: number, value: string) => void;
  onRemove: (idx: number) => void;
}) {
  const labels = FRAMEWORK_LABELS[framework];
  const subtitles = FRAMEWORK_SUBTITLES[framework];
  const colors = BOX_COLORS[boxKey];
  const label = labels[boxKey];
  const subtitle = subtitles[boxKey];

  return (
    <div
      className={`bg-white dark:bg-[#1e1f20] border-t-4 ${colors.border} rounded-lg p-4 shadow-sm dark:shadow-lg flex flex-col h-full border-x border-b dark:border-transparent border-gray-200`}
    >
      <div className="flex justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h2 className={`text-lg font-bold ${colors.title} flex items-center`}>
          <span className="text-2xl mr-2" aria-hidden="true">
            {label[0]}
          </span>
          {label.slice(1)}{" "}
          <span className="text-sm text-gray-500 dark:text-g-sub ml-2 font-normal">{subtitle}</span>
        </h2>
      </div>

      <div className="flex-1 space-y-2 mb-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative group flex items-start bg-gray-50 dark:bg-[#131314] p-2 rounded border border-gray-200 dark:border-gray-800 focus-within:border-gray-400 dark:focus-within:border-gray-500 transition-colors mt-2"
          >
            <span aria-hidden="true" className={`${colors.bullet} mr-2 mt-0.5`}>
              •
            </span>
            <textarea
              value={item}
              onChange={(e) => onUpdate(idx, e.target.value)}
              rows={1}
              placeholder="内容を入力..."
              className="w-full bg-transparent text-[15px] sm:text-sm text-gray-800 dark:text-g-text focus:outline-none border-none focus:ring-0 p-0 resize-none leading-relaxed overflow-hidden"
              onInput={(e) => {
                const t = e.target as HTMLTextAreaElement;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="ml-2 text-gray-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-[10px] font-bold shrink-0 mt-0.5 px-2 py-1 rounded flex items-center"
            >
              <span className="sr-only">削除</span>✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className={`text-xs font-bold text-gray-400 hover:${colors.title.split(" ")[0].replace("text-", "text-")} transition-colors flex items-center mt-auto pt-2 py-1 pr-2 w-fit`}
      >
        <span aria-hidden="true" className="mr-1">
          ＋
        </span>{" "}
        項目を追加
      </button>
    </div>
  );
}

// ===== ChatBubble =====

function ChatBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center shrink-0 shadow-md text-xs text-white font-bold">
          You
        </div>
        <div className="bg-blue-600 p-3 rounded-lg rounded-tr-none text-sm text-white shadow-md max-w-[85%] whitespace-pre-wrap leading-relaxed">
          {msg.text}
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
          <span className="animate-pulse">AIが多角的に分析中...</span>
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
      <div className="bg-gray-100 dark:bg-[#131314] p-3 rounded-lg rounded-tl-none text-sm text-gray-800 dark:text-g-text border border-gray-200 dark:border-gray-800 max-w-[85%] whitespace-pre-wrap leading-relaxed">
        {msg.text}
      </div>
    </div>
  );
}

// ===== Main Page =====

function SwotPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: isLoading } = useAuth();

  const [framework, setFramework] = useState<Framework>("SWOT");
  const [theme, setTheme] = useState("");
  const [box1, setBox1] = useState<string[]>([]);
  const [box2, setBox2] = useState<string[]>([]);
  const [box3, setBox3] = useState<string[]>([]);
  const [box4, setBox4] = useState<string[]>([]);
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    {
      id: "init",
      role: "ai",
      text: "「この強みを活かした戦略を提案して」「弱みを克服するアイデアは？」など、作成したSWOTをもとにAIと議論できます。",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

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
        if (data.type !== "swot") return;
        setEditId(id);
        const saved = data.data;
        if (saved.theme) setTheme(saved.theme);
        if (saved.framework) setFramework(saved.framework as Framework);
        if (saved.box1) setBox1(saved.box1);
        if (saved.box2) setBox2(saved.box2);
        if (saved.box3) setBox3(saved.box3);
        if (saved.box4) setBox4(saved.box4);
        // old format compatibility
        if (saved.strengths) setBox1(saved.strengths);
        if (saved.weaknesses) setBox2(saved.weaknesses);
        if (saved.opportunities) setBox3(saved.opportunities);
        if (saved.threats) setBox4(saved.threats);
      })
      .catch(console.error);
  }, [searchParams, user]);

  if (isLoading || !user) return null;

  if (!user.is_pro) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-600 dark:text-g-sub mb-4">このページはPRO会員限定です。</p>
        <Link href="/" className="text-blue-500 hover:underline">
          トップへ戻る
        </Link>
      </div>
    );
  }

  // ===== Box operations =====

  const setters = { box1: setBox1, box2: setBox2, box3: setBox3, box4: setBox4 };
  const values = { box1, box2, box3, box4 };

  function addItem(boxKey: "box1" | "box2" | "box3" | "box4", text = "") {
    setters[boxKey]((prev) => [...prev, text]);
  }

  function updateItem(boxKey: "box1" | "box2" | "box3" | "box4", idx: number, value: string) {
    setters[boxKey]((prev) => prev.map((v, i) => (i === idx ? value : v)));
  }

  function removeItem(boxKey: "box1" | "box2" | "box3" | "box4", idx: number) {
    setters[boxKey]((prev) => prev.filter((_, i) => i !== idx));
  }

  // ===== Save =====

  async function saveSwot() {
    if (isSaving) return;
    setIsSaving(true);
    const payloadData = {
      framework,
      theme,
      box1: box1.filter((v) => v.trim()),
      box2: box2.filter((v) => v.trim()),
      box3: box3.filter((v) => v.trim()),
      box4: box4.filter((v) => v.trim()),
    };
    const title = theme
      ? `${framework}: ${theme}`
      : `${framework}分析 (${new Date().toLocaleDateString()})`;

    try {
      const url = editId ? `${API_BASE}/api/analyses/${editId}` : `${API_BASE}/api/analyses`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ title, type: "swot", data: payloadData }),
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

  // ===== AI Generate =====

  async function generateWithAI() {
    if (!theme.trim()) {
      alert("AIに分析させるテーマ（主題）を入力してください。");
      return;
    }
    setIsGenerating(true);
    setBox1([]);
    setBox2([]);
    setBox3([]);
    setBox4([]);

    const promptText =
      framework === "PEST"
        ? `テーマ: 「${theme}」\nこのテーマについてPEST分析を行ってください。\n出力は必ず以下のJSON形式のみとし、他のテキストは一切含めないでください。\n{"box1":["政治的要因1","政治的要因2"],"box2":["経済的要因1","経済的要因2"],"box3":["社会的要因1","社会的要因2"],"box4":["技術的要因1","技術的要因2"]}`
        : `テーマ: 「${theme}」\nこのテーマについてSWOT分析を行ってください。\n出力は必ず以下のJSON形式のみとし、他のテキストは一切含めないでください。\n{"box1":["強み1","強み2"],"box2":["弱み1","弱み2"],"box3":["機会1","機会2"],"box4":["脅威1","脅威2"]}`;

    try {
      const res = await fetch(`${API_BASE}/api/tools/ai-assist`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, context: "JSONのみ出力" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const match = data.reply.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("JSON抽出失敗");
      const parsed = JSON.parse(match[0]);
      if (parsed.box1) setBox1(parsed.box1);
      if (parsed.box2) setBox2(parsed.box2);
      if (parsed.box3) setBox3(parsed.box3);
      if (parsed.box4) setBox4(parsed.box4);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "AIの分析に失敗しました。もう一度お試しください。");
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

    const swotData = {
      theme,
      framework,
      box1: box1.filter((v) => v.trim()),
      box2: box2.filter((v) => v.trim()),
      box3: box3.filter((v) => v.trim()),
      box4: box4.filter((v) => v.trim()),
    };
    const contextText = `【現在の${framework}分析データ】\n` + JSON.stringify(swotData, null, 2);

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

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-bold text-xl text-gray-800 dark:text-g-text flex items-center">
            <svg
              aria-hidden="true"
              className="h-5 w-5 mr-2 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
            {framework}分析作成 (PRO)
          </h1>
          <button
            onClick={saveSwot}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-1.5 px-4 rounded text-sm transition-colors shadow-sm"
          >
            {isSaving ? "保存中..." : "分析を保存する"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Framework select + AI generate */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4 flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600 dark:text-g-sub mb-2">
                内部要因・外部要因、またはマクロ環境を整理するフレームワークです。
              </p>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as Framework)}
                className="bg-white dark:bg-[#131314] border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-g-text text-sm px-2 py-1 focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="SWOT">SWOT分析 (強み・弱み・機会・脅威)</option>
                <option value="PEST">PEST分析 (政治・経済・社会・技術)</option>
              </select>
            </div>
            <button
              onClick={generateWithAI}
              disabled={isGenerating}
              className="text-xs font-bold text-white transition-colors flex items-center bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-3 py-1.5 rounded shadow-md h-fit shrink-0"
            >
              <svg
                aria-hidden="true"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isGenerating ? "AIが分析中..." : "AIで自動生成"}
            </button>
          </div>

          {/* Theme input */}
          <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
            <div className="text-xs font-bold text-gray-500 dark:text-g-sub mb-1">
              分析テーマ（主題）
            </div>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例：日本の原発再稼働について"
              className="w-full bg-transparent font-bold text-xl text-gray-900 dark:text-g-text focus:outline-none focus:border-b border-blue-500 placeholder-gray-400 dark:placeholder-gray-600 py-1"
            />
          </div>

          {/* 4 boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["box1", "box2", "box3", "box4"] as const).map((boxKey) => (
              <BoxPanel
                key={boxKey}
                boxKey={boxKey}
                framework={framework}
                items={values[boxKey]}
                onAdd={() => addItem(boxKey)}
                onUpdate={(idx, value) => updateItem(boxKey, idx, value)}
                onRemove={(idx) => removeItem(boxKey, idx)}
              />
            ))}
          </div>

          {/* AI Chat */}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-800 pt-8">
            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900 dark:text-g-text">
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
              AI {framework}・アシスタント
            </h2>

            <div className="bg-white dark:bg-[#1e1f20] border border-gray-200 dark:border-gray-700 rounded-xl flex flex-col h-[350px] shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
                {chatMsgs.map((msg) => (
                  <ChatBubble key={msg.id} msg={msg} />
                ))}
              </div>

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#18191a]">
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
                    placeholder="AIへの指示や質問を入力..."
                    className="flex-1 bg-white dark:bg-[#131314] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-g-text text-sm p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32 transition-shadow resize-none overflow-hidden"
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

export default function SwotPage() {
  return (
    <Suspense fallback={null}>
      <SwotPageInner />
    </Suspense>
  );
}
