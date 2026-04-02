"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
const PROXY_BASE = "/api/proxy";

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
  box1: { border: "border-blue-500", title: "text-blue-600 dark:text-blue-400", bullet: "text-blue-500", bg: "dark:bg-blue-900/5" },
  box2: { border: "border-red-500", title: "text-red-600 dark:text-red-400", bullet: "text-red-500", bg: "dark:bg-red-900/5" },
  box3: { border: "border-green-500", title: "text-green-600 dark:text-green-400", bullet: "text-green-500", bg: "dark:bg-green-900/5" },
  box4: { border: "border-yellow-500", title: "text-yellow-600 dark:text-yellow-400", bullet: "text-yellow-500", bg: "dark:bg-yellow-900/5" },
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
      className={`bg-logos-surface ${colors.bg} border-t-4 ${colors.border} rounded-lg p-4 shadow-sm dark:shadow-lg flex flex-col h-full border-x border-b border-logos-border dark:border-transparent`}
    >
      <div className="flex justify-between items-center mb-3 border-b border-logos-border pb-2">
        <h2 className={`text-lg font-bold ${colors.title} flex items-center`}>
          <span className="text-2xl mr-2" aria-hidden="true">
            {label[0]}
          </span>
          {label.slice(1)}{" "}
          <span className="text-base text-logos-sub ml-2 font-normal">{subtitle}</span>
        </h2>
      </div>

      <div className="flex-1 space-y-2 mb-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative group flex items-start bg-logos-hover p-2 rounded border border-logos-border focus-within:border-logos-sub transition-colors mt-2"
          >
            <span aria-hidden="true" className={`${colors.bullet} mr-2 mt-0.5`}>
              •
            </span>
            <textarea
              value={item}
              onChange={(e) => onUpdate(idx, e.target.value)}
              rows={1}
              placeholder="内容を入力..."
              className="w-full bg-transparent text-base text-logos-text focus:outline-none border-none focus:ring-0 p-0 resize-none leading-relaxed overflow-hidden"
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
        className={`text-sm font-bold text-logos-sub hover:${colors.title.split(" ")[0].replace("text-", "text-")} transition-colors flex items-center mt-auto pt-2 py-1 pr-2 w-fit`}
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
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
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

    fetch(`${PROXY_BASE}/analyses/${id}`, )
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
      const url = editId ? `${PROXY_BASE}/analyses/${editId}` : `${PROXY_BASE}/analyses`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, type: "swot", data: payloadData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "保存に失敗しました");
      toast.success(data.message);
      if (!editId && data.id) setEditId(data.id);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  // ===== AI Generate =====

  async function generateWithAI() {
    if (!theme.trim()) {
      toast.error("AIに分析させるテーマ（主題）を入力してください。");
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
      const res = await fetch(`${PROXY_BASE}/tools/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      toast.error(e instanceof Error ? e.message : "AIの分析に失敗しました。もう一度お試しください。");
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
      const res = await fetch(`${PROXY_BASE}/tools/ai-assist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          <h1 className="font-bold text-2xl text-logos-text flex items-center gap-2">
            <svg aria-hidden="true" className="h-5 w-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            {framework}分析作成
            <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full text-xs font-bold">PRO</span>
          </h1>
          <button
            onClick={saveSwot}
            disabled={isSaving}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-5 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? "保存中..." : "保存する"}
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Framework select */}
          <div className="border-b border-logos-border pb-4">
            <p className="text-base text-logos-sub mb-2">
              内部要因・外部要因、またはマクロ環境を整理するフレームワークです。
            </p>
            <div className="relative w-fit">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as Framework)}
                className="text-base rounded-full bg-logos-hover text-logos-text pl-3 pr-8 py-1.5 cursor-pointer hover:bg-logos-elevated transition-colors focus:outline-none appearance-none font-bold"
              >
                <option value="SWOT">SWOT分析 (強み・弱み・機会・脅威)</option>
                <option value="PEST">PEST分析 (政治・経済・社会・技術)</option>
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-logos-sub pointer-events-none" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

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
              <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {isGenerating ? "生成中..." : "AIで自動生成"}
            </button>
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
          <div className="mt-4 border-t border-logos-border pt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-300 via-cyan-500 to-teal-600 flex items-center justify-center shadow-sm shadow-cyan-500/30">
                <AiIcon className="h-3 w-3 text-logos-text" />
              </div>
              <h2 className="text-base font-bold text-logos-text">AIアシスタント</h2>
              <span className="text-xs text-logos-sub">「この強みを活かした戦略を提案して」など、SWOTをもとにAIと議論できます。</span>
            </div>

            <div className="bg-logos-bg border border-logos-border rounded-xl flex flex-col h-[350px] overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
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
                    placeholder="AIへの指示や質問を入力..."
                    className="flex-1 bg-logos-bg border border-logos-border rounded-lg text-logos-text text-base p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 max-h-32 transition-shadow resize-none overflow-hidden"
                    onInput={(e) => {
                      const t = e.target as HTMLTextAreaElement;
                      t.style.height = "auto";
                      t.style.height = t.scrollHeight + "px";
                    }}
                  />
                  <button
                    onClick={sendAiMessage}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2.5 px-5 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all shrink-0"
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
