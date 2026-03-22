"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAuthHeaders } from "@/lib/auth";
import { transformAnalysis } from "@/lib/transforms";
import type { TopicAnalysis } from "../_types";
import { API_BASE } from "../_helpers";
import { typeBadge } from "./AnalysisCard";

export function AnalysisModal({
  onClose,
  topicId,
  alreadyPublishedIds,
  onPublish,
}: {
  onClose: () => void;
  topicId: number;
  alreadyPublishedIds: number[];
  onPublish: () => void;
}) {
  const [uploadTab, setUploadTab] = useState<"select" | "upload">("select");
  const [userAnalyses, setUserAnalyses] = useState<Array<{ id: number; title: string; type: string; is_published: boolean; topic_id: number | null }>>([]);
  const [loadingAnalyses, setLoadingAnalyses] = useState(true);
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const [imageTitle, setImageTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/user/analyses`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUserAnalyses(Array.isArray(data) ? (data.map(transformAnalysis) as any) : []);
        setLoadingAnalyses(false);
      })
      .catch(() => setLoadingAnalyses(false));
  }, []);

  const handlePublish = async (analysisId: number) => {
    setPublishingId(analysisId);
    try {
      const res = await fetch(`${API_BASE}/api/analyses/${analysisId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ topic_id: topicId }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message ?? "公開に失敗しました");
        return;
      }
      onPublish();
      onClose();
    } finally {
      setPublishingId(null);
    }
  };

  const availableAnalyses = userAnalyses.filter((a) => !alreadyPublishedIds.includes(a.id));

  const handleImageUpload = async () => {
    if (!imageTitle.trim() || !imageFile) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("title", imageTitle.trim());
      formData.append("image", imageFile);
      const res = await fetch(`${API_BASE}/api/topics/${topicId}/analyses/image`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        setUploadError(err.message ?? "アップロードに失敗しました");
        return;
      }
      onPublish();
      onClose();
    } catch {
      setUploadError("通信エラーが発生しました");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="relative z-50"
      aria-labelledby="analysis-modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="relative transform overflow-hidden bg-white dark:bg-[#1e1f20] rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 text-left shadow-2xl w-full sm:my-8 sm:w-full sm:max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
                id="analysis-modal-title"
              >
                分析・図解の投稿
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 p-2 focus:outline-none"
              >
                <span className="sr-only">閉じる</span>
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
              <button
                onClick={() => setUploadTab("select")}
                className={`py-3 px-4 text-sm transition-colors whitespace-nowrap ${
                  uploadTab === "select"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                作成済みツールから選択
              </button>
              <button
                onClick={() => setUploadTab("upload")}
                className={`py-3 px-4 text-sm transition-colors flex items-center whitespace-nowrap ${
                  uploadTab === "upload"
                    ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                オリジナル画像のアップロード
              </button>
            </div>

            {uploadTab === "select" && (
              <div>
                {loadingAnalyses ? (
                  <p className="text-center text-sm text-gray-500 py-8">読み込み中...</p>
                ) : availableAnalyses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                      公開可能な分析データがありません。
                    </p>
                    <Link
                      href="/dashboard"
                      className="text-blue-500 hover:underline text-sm font-bold py-2 px-4 rounded-md bg-blue-50 dark:bg-blue-900/20 inline-block"
                    >
                      マイページで新しく作成する
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scroll">
                    {availableAnalyses.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#131314]"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          {typeBadge(a.type as TopicAnalysis["type"], {})}
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{a.title}</span>
                          {!!a.is_published && a.topic_id !== topicId && (
                            <span className="text-[10px] text-yellow-600 dark:text-yellow-500">※ 別のトピックに公開済み</span>
                          )}
                        </div>
                        <button
                          onClick={() => handlePublish(a.id)}
                          disabled={publishingId === a.id}
                          className="ml-3 shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors disabled:opacity-50"
                        >
                          {publishingId === a.id ? "公開中..." : "このトピックに公開"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {uploadTab === "upload" && (
              <div className="bg-gray-50 dark:bg-[#131314] p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    図解のタイトル
                  </label>
                  <input
                    type="text"
                    required
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="w-full text-base sm:text-sm rounded border-gray-300 dark:border-gray-700 dark:bg-[#1e1f20] dark:text-white py-3 sm:py-2"
                    placeholder="例：〇〇問題のステークホルダーマップ"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    画像ファイルを選択 (JPG, PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-[#1e1f20] dark:file:text-blue-400 dark:hover:file:bg-gray-800 cursor-pointer"
                  />
                  <p className="text-[11px] sm:text-xs text-gray-400 mt-2">
                    ※ファイルサイズは最大5MBまで。オリジナルで作成した図解やグラフのみアップロード可能です。
                  </p>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 mb-3">{uploadError}</p>
                )}
                <div className="flex justify-end pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploading || !imageTitle.trim() || !imageFile}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 sm:py-2 px-6 rounded transition-colors disabled:opacity-50"
                  >
                    {uploading ? "アップロード中..." : "アップロードして公開"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
