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

  // トピックデータとカテゴリを並行取得
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

        // 作成者チェック（フロントでもガード）
        if (topicData.user?.id !== user.id) {
          setForbidden(true);
          return;
        }

        setTitle(topicData.title ?? "");
        setContent(topicData.content ?? "");
        setSelectedCategoryIds(
          (topicData.categories ?? []).map((c: { id: number }) => c.id)
        );
        // is_ai: 明示的に false 以外はすべて true として扱う（Blade仕様に合わせる）
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

  // テキストエリア自動拡張
  function autoExpand(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  // content textarea の初期高さ調整
  useEffect(() => {
    if (!dataLoading && contentRef.current) {
      autoExpand(contentRef.current);
    }
  }, [dataLoading, content]);

  // カテゴリチェックボックス（最大2つ）
  function handleCategoryChange(id: number, checked: boolean) {
    if (checked) {
      if (selectedCategoryIds.length >= 2) return;
      setSelectedCategoryIds((prev) => [...prev, id]);
    } else {
      setSelectedCategoryIds((prev) => prev.filter((c) => c !== id));
    }
  }

  // タイムライン操作
  function addTimelineItem() {
    setTimeline((prev) => [...prev, { date: "", event: "", is_ai: false }]);
  }
  function removeTimelineItem(index: number) {
    setTimeline((prev) => prev.filter((_, i) => i !== index));
  }
  function updateTimelineItem(
    index: number,
    field: "date" | "event",
    value: string
  ) {
    setTimeline((prev) =>
      prev.map((item, i) =>
        // 手動編集時は is_ai を false に切り替える
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

  // ─── Loading ───
  if (loading || dataLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  // ─── 未ログイン ───
  if (!user) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-[#1e1f20] shadow-sm sm:rounded-lg border border-gray-800 p-8 text-center">
            <p className="text-gray-300 mb-4">ログインが必要です。</p>
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold">
              ログインページへ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Not Found ───
  if (notFound) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-[#1e1f20] shadow-sm sm:rounded-lg border border-gray-800 p-8 text-center">
            <p className="text-gray-300">トピックが見つかりません。</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── 権限なし ───
  if (forbidden) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-[#1e1f20] shadow-sm sm:rounded-lg border border-gray-800 p-8 text-center">
            <p className="text-gray-300 mb-4">このトピックを編集する権限がありません。</p>
            <Link href={`/topics/${topicId}`} className="text-blue-400 hover:text-blue-300 font-bold text-sm">
              トピックに戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── 編集フォーム ───
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-[#1e1f20] overflow-hidden shadow-sm sm:rounded-lg border border-gray-800">
          <div className="p-6 text-gray-100">

            <h2 className="font-bold text-xl text-gray-200 leading-tight mb-6">
              トピックの編集
            </h2>

            {errors._ && (
              <p className="text-red-400 text-sm mb-4">{errors._[0]}</p>
            )}

            <form onSubmit={handleSubmit}>

              {/* タイトル */}
              <div className="mb-4">
                <label className="block text-sm text-gray-300">トピックのタイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>}
              </div>

              {/* カテゴリ選択（最大2つ） */}
              <div className="mb-6 p-4 bg-[#131314] rounded-md border border-gray-800">
                <label className="block text-sm font-bold text-gray-300 mb-2">カテゴリを選択してください（最大2つまで）</label>
                {errors.category_ids && (
                  <p className="text-red-400 text-xs mt-1 mb-2">{errors.category_ids[0]}</p>
                )}
                <div className="space-y-4">
                  {categories.map((parent) => (
                    <div key={parent.id} className="bg-[#1e1f20] p-3 rounded border border-gray-700">
                      {/* 大分類 */}
                      <div className="font-bold text-blue-400 border-b border-gray-700 pb-2 mb-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(parent.id)}
                            onChange={(e) => handleCategoryChange(parent.id, e.target.checked)}
                            disabled={!selectedCategoryIds.includes(parent.id) && selectedCategoryIds.length >= 2}
                            className="rounded border-gray-600 bg-[#131314] text-blue-600 focus:ring-blue-500"
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
                              className="rounded border-gray-600 bg-[#131314] text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-300">📄 {child.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 議論の内容・背景 */}
              <div className="mb-6">
                <label className="block text-sm text-gray-300">議論の内容・背景（概要）</label>
                <textarea
                  ref={contentRef}
                  value={content}
                  onChange={(e) => { setContent(e.target.value); autoExpand(e.target); }}
                  rows={6}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm overflow-hidden resize-none"
                />
                {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content[0]}</p>}
              </div>

              {/* 時系列 */}
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">前提となる時系列の編集</label>
                <p className="text-xs text-gray-500 mb-3">※行を追加・編集すると「AI生成」バッジは外れます。</p>

                <div className="space-y-2 border-l-2 border-gray-700 pl-3 ml-2">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-2 relative">
                      {/* タイムラインの点 */}
                      <div className="hidden sm:block absolute left-[-17.5px] top-3 w-1.5 h-1.5 bg-gray-500 rounded-full" />
                      <input
                        type="text"
                        value={item.date}
                        onChange={(e) => updateTimelineItem(index, "date", e.target.value)}
                        placeholder="202X年X月"
                        className="w-full sm:w-1/4 rounded-md border border-gray-700 bg-[#131314] text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-1.5"
                      />
                      <textarea
                        value={item.event}
                        onChange={(e) => {
                          updateTimelineItem(index, "event", e.target.value);
                          autoExpand(e.target);
                        }}
                        placeholder="出来事の要約"
                        rows={1}
                        className="w-full sm:flex-1 rounded-md border border-gray-700 bg-[#131314] text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-1.5 overflow-hidden resize-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeTimelineItem(index)}
                        className="text-red-500 hover:text-red-400 px-2 py-1.5 text-sm shrink-0"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addTimelineItem}
                  className="mt-3 text-xs font-bold text-blue-500 hover:text-blue-400 flex items-center"
                >
                  ＋ 新しい行を追加する
                </button>
              </div>

              {/* ボタン */}
              <div className="flex items-center justify-end mt-4 border-t border-gray-800 pt-4">
                <Link
                  href={`/topics/${topicId}`}
                  className="mr-4 text-sm text-gray-500 hover:text-gray-300"
                >
                  キャンセル
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors disabled:opacity-50"
                >
                  {submitting ? "保存中..." : "変更を保存する"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
