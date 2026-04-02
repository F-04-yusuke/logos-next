"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

type Category = {
  id: number;
  name: string;
  sort_order: number;
  children: Category[];
};

type TimelineItem = {
  date: string;
  event: string;
  is_ai: boolean;
};

const PROXY_BASE = "/api/proxy";

export default function TopicCreatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [content, setContent] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch(`/api/proxy/categories`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => { if (Array.isArray(data)) setCategories(data); })
      .catch(() => {});
  }, []);

  function autoExpand(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  function handleCategoryChange(id: number, checked: boolean) {
    if (checked) {
      if (selectedCategoryIds.length >= 2) return;
      setSelectedCategoryIds((prev) => [...prev, id]);
    } else {
      setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
    }
  }

  function addTimelineItem() {
    setTimeline((prev) => [...prev, { date: "", event: "", is_ai: false }]);
  }
  function removeTimelineItem(index: number) {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  }
  function updateTimelineItem(index: number, field: keyof TimelineItem, value: string | boolean) {
    setTimeline((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value, is_ai: false } : item
      )
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${PROXY_BASE}/topics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          category_ids: selectedCategoryIds,
          timeline: timeline.length > 0 ? timeline : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ _: [data.message ?? "作成に失敗しました"] });
        }
        return;
      }
      router.push(`/topics/${data.id}`);
    } catch {
      setErrors({ _: ["サーバーに接続できませんでした"] });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-7 bg-logos-skeleton rounded-md w-1/3 mb-6" />
            <div className="space-y-4">
              <div className="h-10 bg-logos-skeleton-light rounded-md" />
              <div className="h-40 bg-logos-skeleton-light rounded-md" />
              <div className="h-24 bg-logos-skeleton-light rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-logos-surface rounded-xl border border-logos-border p-8 text-center">
            <p className="text-logos-sub mb-4">トピックを作成するにはログインが必要です。</p>
            <Link href="/login" className="text-indigo-500 hover:text-indigo-600 font-bold">
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user.is_pro) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-logos-surface rounded-xl border border-logos-border p-8 text-center">
            <p className="text-logos-text mb-2 font-bold">PRO会員限定機能</p>
            <p className="text-logos-sub text-base mb-4">トピックの作成はPROプランに加入しているユーザーのみ利用できます。</p>
            <Link href="/" className="text-indigo-500 hover:text-indigo-600 font-bold text-base">
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <h2 className="font-bold text-2xl text-logos-text flex items-center gap-2.5 leading-tight mb-6">
          <span
            className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 flex-shrink-0"
            aria-hidden="true"
          />
          新規トピック作成
        </h2>

        {errors._ && (
          <p className="text-red-400 text-base mb-4">{errors._[0]}</p>
        )}

        <form onSubmit={handleSubmit}>

          {/* タイトル */}
          <div className="mb-5">
            <label className="block text-base font-bold text-logos-text mb-1">トピックのタイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title[0]}</p>}
          </div>

          {/* カテゴリ選択（最大2つ） */}
          <div className="mb-6 p-4 bg-logos-hover rounded-xl border border-logos-border">
            <label className="block text-base font-bold text-logos-text mb-3">カテゴリを選択してください（最大2つまで）</label>
            {errors.category_ids && (
              <p className="text-red-400 text-sm mb-2">{errors.category_ids[0]}</p>
            )}
            <div className="space-y-3">
              {categories.map((parent) => (
                <div key={parent.id} className="bg-logos-surface p-3 rounded-lg border border-logos-border">
                  {/* 大分類 */}
                  <div className="font-bold text-indigo-600 dark:text-indigo-400 border-b border-logos-border pb-2 mb-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategoryIds.includes(parent.id)}
                        onChange={(e) => handleCategoryChange(parent.id, e.target.checked)}
                        disabled={!selectedCategoryIds.includes(parent.id) && selectedCategoryIds.length >= 2}
                        className="rounded border-logos-border bg-logos-surface text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2">📁 {parent.name}</span>
                    </label>
                  </div>
                  {/* 中分類 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
                    {parent.children.map((child) => (
                      <label key={child.id} className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCategoryIds.includes(child.id)}
                          onChange={(e) => handleCategoryChange(child.id, e.target.checked)}
                          disabled={!selectedCategoryIds.includes(child.id) && selectedCategoryIds.length >= 2}
                          className="rounded border-logos-border bg-logos-surface text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-base text-logos-text">📄 {child.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 議論の内容・背景 */}
          <div className="mb-6">
            <label className="block text-base font-bold text-logos-text mb-1">議論の内容・背景（概要）</label>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => { setContent(e.target.value); autoExpand(e.target); }}
              rows={6}
              required
              className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base overflow-hidden resize-none"
            />
            {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content[0]}</p>}
          </div>

          {/* 時系列 */}
          <div className="mb-6">
            <label className="block text-base font-bold text-logos-text mb-1">前提となる時系列</label>
            <p className="text-sm text-logos-sub mb-3">※作成後にトピック詳細画面でAIに自動生成させることも可能です。</p>

            <div className="space-y-2 border-l-2 border-logos-border pl-3 ml-2">
              {timeline.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2 relative">
                  <div className="hidden sm:block absolute left-[-17.5px] top-3 w-1.5 h-1.5 bg-logos-border rounded-full" />
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => updateTimelineItem(index, "date", e.target.value)}
                    placeholder="202X年X月"
                    className="w-full sm:w-1/4 rounded-lg border border-logos-border bg-logos-surface text-logos-text text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-1.5"
                  />
                  <textarea
                    value={item.event}
                    onChange={(e) => {
                      updateTimelineItem(index, "event", e.target.value);
                      autoExpand(e.target);
                    }}
                    placeholder="出来事の要約"
                    rows={1}
                    className="w-full sm:flex-1 rounded-lg border border-logos-border bg-logos-surface text-logos-text text-base focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-1.5 overflow-hidden resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeTimelineItem(index)}
                    className="text-red-400 hover:text-red-600 font-bold px-2 py-1.5 text-base shrink-0 cursor-pointer transition-colors duration-100"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTimelineItem}
              className="mt-3 text-sm font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 flex items-center transition-colors duration-100"
            >
              ＋ 新しい行を追加する
            </button>
          </div>

          {/* ボタン */}
          <div className="flex items-center justify-end mt-4 border-t border-logos-border pt-4 gap-4">
            <Link
              href="/"
              className="text-base text-logos-sub hover:text-logos-text transition-colors duration-100 cursor-pointer"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "作成中..." : "トピックを作成する"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
