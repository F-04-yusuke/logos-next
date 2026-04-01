"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useRef, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

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

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

export default function TopicEditPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;
  const { user, loading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [content, setContent] = useState("");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    Promise.all([
      fetch(`${BASE_URL}/api/topics/${topicId}`, {
        headers: { ...getAuthHeaders(), Accept: "application/json" },
      }),
      fetch(`${BASE_URL}/api/categories`, {
        headers: { Accept: "application/json" },
      }),
    ])
      .then(async ([topicRes, catRes]) => {
        if (topicRes.status === 404) { setNotFound(true); return; }
        if (!topicRes.ok) { setNotFound(true); return; }

        const topicData = await topicRes.json();
        const catData = catRes.ok ? await catRes.json() : [];

        if (topicData.user?.id !== user.id) {
          setForbidden(true);
          return;
        }

        setTitle(topicData.title ?? "");
        setContent(topicData.content ?? "");
        setSelectedCategoryIds(
          (topicData.categories ?? []).map((c: { id: number }) => c.id)
        );
        setTimeline(
          (topicData.timeline ?? []).map((item: Partial<TimelineItem>) => ({
            date: item.date ?? "",
            event: item.event ?? "",
            is_ai: item.is_ai === false ? false : true,
          }))
        );

        if (Array.isArray(catData)) setCategories(catData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setDataLoading(false));
  }, [loading, user, topicId]);

  function autoExpand(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  useEffect(() => {
    if (!dataLoading && contentRef.current) {
      autoExpand(contentRef.current);
    }
  }, [dataLoading, content]);

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
  function updateTimelineItem(index: number, field: "date" | "event", value: string) {
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
      const res = await fetch(`${BASE_URL}/api/topics/${topicId}`, {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          category_ids: selectedCategoryIds,
          timeline: timeline.length > 0 ? timeline : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ _: [data.message ?? "更新に失敗しました"] });
        }
        return;
      }
      router.push(`/topics/${topicId}`);
    } catch {
      setErrors({ _: ["サーバーに接続できませんでした"] });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || dataLoading) {
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
            <p className="text-logos-sub mb-4">ログインが必要です。</p>
            <Link href="/login" className="text-indigo-500 hover:text-indigo-600 font-bold">
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-logos-surface rounded-xl border border-logos-border p-8 text-center">
            <p className="text-logos-sub">トピックが見つかりません。</p>
          </div>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-logos-surface rounded-xl border border-logos-border p-8 text-center">
            <p className="text-logos-sub mb-4">このトピックを編集する権限がありません。</p>
            <Link href={`/topics/${topicId}`} className="text-indigo-500 hover:text-indigo-600 font-bold text-base">
              トピックに戻る
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
          トピックの編集
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
            <label className="block text-base font-bold text-logos-text mb-1">前提となる時系列の編集</label>
            <p className="text-sm text-logos-sub mb-3">※行を追加・編集すると「AI生成」バッジは外れます。</p>

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
              href={`/topics/${topicId}`}
              className="text-base text-logos-sub hover:text-logos-text transition-colors duration-100 cursor-pointer"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "保存中..." : "変更を保存する"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
