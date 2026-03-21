"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "../_helpers";

export function PostModal({
  onClose,
  url,
  onUrlChange,
  category,
  onCategoryChange,
  comment,
  onCommentChange,
  onSubmit,
  submitting,
}: {
  onClose: () => void;
  url: string;
  onUrlChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  comment: string;
  onCommentChange: (v: string) => void;
  onSubmit: (isDraft: boolean) => void;
  submitting: boolean;
}) {
  const [ogPreview, setOgPreview] = useState<{ title: string | null; thumbnail: string | null } | null>(null);
  const [ogLoading, setOgLoading] = useState(false);

  useEffect(() => {
    setOgPreview(null);
    setOgLoading(false);
    if (!url || !url.startsWith("http")) return;
    const timer = setTimeout(async () => {
      setOgLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/og?url=${encodeURIComponent(url)}`);
        if (res.ok) {
          const data = await res.json();
          setOgPreview({ title: data.title, thumbnail: data.thumbnail_url });
        }
      } catch {
        // ignore
      } finally {
        setOgLoading(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div
      className="relative z-50"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="relative transform overflow-hidden bg-white dark:bg-[#18191a] rounded-t-2xl sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 text-left shadow-2xl w-full h-[85vh] sm:h-auto sm:max-w-xl flex flex-col">
            <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1e1f20]">
              <h3
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
                id="modal-title"
              >
                エビデンスを投稿
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 focus:outline-none transition-colors"
              >
                <span className="sr-only">閉じる</span>
                <span className="text-2xl leading-none" aria-hidden="true">
                  &times;
                </span>
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-white dark:bg-[#131314]">
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  参考URL (必須)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => onUrlChange(e.target.value)}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  required
                  placeholder="https://..."
                />
                {/* OGP プレビュー */}
                {ogLoading && (
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">URLを取得中...</p>
                )}
                {!ogLoading && ogPreview && (ogPreview.title || ogPreview.thumbnail) && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-[#1e1f20] rounded-md border border-gray-200 dark:border-gray-700 flex gap-2 items-start">
                    {ogPreview.thumbnail && (
                      <img src={ogPreview.thumbnail} alt="" className="w-20 h-14 object-cover rounded flex-shrink-0" />
                    )}
                    {ogPreview.title && (
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200 line-clamp-3 leading-snug">{ogPreview.title}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  メディア分類 (必須)
                </label>
                <select
                  value={category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X">X</option>
                  <option value="記事">記事</option>
                  <option value="知恵袋">知恵袋</option>
                  <option value="本">本</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  補足・コメント (任意)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  rows={4}
                  className="w-full rounded-md bg-gray-50 border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-base sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 py-3 sm:py-2"
                  placeholder="URLに対する補足や、どの部分が参考になるかなどを記入"
                />
              </div>
            </div>

            <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-3 bg-gray-50 dark:bg-[#1e1f20]">
              <button
                onClick={onClose}
                type="button"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-bold py-3 px-4 sm:py-2 rounded-md text-sm transition-colors"
              >
                キャンセル
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSubmit(true)}
                  disabled={submitting || !url || !category}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-3 px-4 sm:py-2 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  下書き保存
                </button>
                <button
                  type="button"
                  onClick={() => onSubmit(false)}
                  disabled={submitting || !url || !category}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3 px-6 sm:py-2 rounded-md text-sm transition-colors disabled:opacity-50"
                >
                  投稿する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
