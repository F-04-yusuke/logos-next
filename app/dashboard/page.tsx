"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { PostCard, SharedPost } from "@/components/mypage/PostCard";
import { CommentCard, SharedComment } from "@/components/mypage/CommentCard";
import { AnalysisCard, SharedAnalysis } from "@/components/mypage/AnalysisCard";

// ===== Types =====

type DashboardTopic = {
  id: number;
  title: string;
  created_at: string;
};

type DashboardData = {
  posts: SharedPost[];
  drafts: SharedPost[];
  draft_count: number;
  comments: SharedComment[];
  analyses: SharedAnalysis[];
  topics: DashboardTopic[];
};

type Tab = "posts" | "drafts" | "comments" | "analyses" | "topics";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

// ===== Main Component =====

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("posts");
  const [fetching, setFetching] = useState(true);

  // 下書き編集モーダル
  const [editingDraft, setEditingDraft] = useState<SharedPost | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  function openDraftEdit(post: SharedPost) {
    setEditingDraft(post);
    setEditUrl(post.url);
    setEditCategory(post.category);
    setEditComment(post.comment ?? "");
  }

  function closeDraftEdit() {
    setEditingDraft(null);
    setEditUrl("");
    setEditCategory("");
    setEditComment("");
  }

  async function handleDraftUpdate(isPublishing: boolean) {
    if (!editingDraft) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts/${editingDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          url: editUrl,
          category: editCategory,
          comment: editComment || null,
          is_published: isPublishing,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message ?? "更新に失敗しました");
        return;
      }
      if (isPublishing) {
        // 本投稿: 下書きリストから削除してトピック詳細へ移動
        if (data) {
          setData({
            ...data,
            drafts: data.drafts.filter((p) => p.id !== editingDraft.id),
            draft_count: data.draft_count - 1,
          });
        }
        closeDraftEdit();
        router.push(`/topics/${editingDraft.topic.id}`);
      } else {
        // 下書き保存のまま: リストを更新
        const updated = await res.json();
        if (data) {
          setData({
            ...data,
            drafts: data.drafts.map((p) => (p.id === editingDraft.id ? { ...p, ...updated } : p)),
          });
        }
        closeDraftEdit();
      }
    } catch {
      alert("サーバーに接続できませんでした");
    } finally {
      setEditSubmitting(false);
    }
  }

  // URL ?tab=drafts の場合は下書きタブを初期選択（下書き保存リダイレクト時）
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (tab) setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      setFetching(true);
      fetch(`${API_BASE}/api/dashboard`, { headers: getAuthHeaders() })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d: DashboardData) => setData(d))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [authLoading, user]);

  async function deleteDraft(postId: number) {
    if (!window.confirm("下書きを削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({
        ...data,
        drafts: data.drafts.filter((p) => p.id !== postId),
        draft_count: data.draft_count - 1,
      });
    }
  }

  async function deleteAnalysis(analysisId: number) {
    if (!window.confirm("この分析・図解を削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/analyses/${analysisId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({ ...data, analyses: data.analyses.filter((a) => a.id !== analysisId) });
    }
  }

  async function deleteTopic(topicId: number) {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`${API_BASE}/api/topics/${topicId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.ok && data) {
      setData({ ...data, topics: data.topics.filter((t) => t.id !== topicId) });
    }
  }

  if (authLoading || fetching) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  const posts = data?.posts ?? [];
  const drafts = data?.drafts ?? [];
  const draftCount = data?.draft_count ?? 0;
  const comments = data?.comments ?? [];
  const analyses = data?.analyses ?? [];
  const topics = data?.topics ?? [];

  const blueTab = (tab: Tab) =>
    activeTab === tab
      ? "border-blue-500 text-blue-600 dark:text-blue-400 font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  const yellowTab = (tab: Tab) =>
    activeTab === tab
      ? "border-yellow-500 text-yellow-600 dark:text-yellow-400 font-bold"
      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300";

  return (
    <>
    <div className="py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="sm:rounded-lg overflow-hidden">

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide px-4 sm:px-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${blueTab("posts")}`}
            >
              投稿した情報
            </button>

            <button
              onClick={() => setActiveTab("drafts")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${yellowTab("drafts")}`}
            >
              下書き
              {draftCount > 0 && (
                <span className="text-[10px] font-bold bg-yellow-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                  {draftCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("comments")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap cursor-pointer ${blueTab("comments")}`}
            >
              自分のコメント
            </button>

            <button
              onClick={() => setActiveTab("analyses")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${yellowTab("analyses")}`}
            >
              作成した分析・図解
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("topics")}
              className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${blueTab("topics")}`}
            >
              作成したトピック
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
                PRO
              </span>
            </button>
          </div>

          <div className="p-4 sm:p-6">

            {/* 投稿した情報 */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ投稿した情報はありません。
                  </p>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard post={post} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            {post.topic.title}
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 下書き */}
            {activeTab === "drafts" && (
              <div className="space-y-4">
                {drafts.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500 text-sm mb-2">下書きはありません。</p>
                    <p className="text-xs text-gray-400">
                      エビデンス投稿時に「下書き保存」を選ぶと、ここに一覧表示されます。
                    </p>
                  </div>
                ) : (
                  drafts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard post={post} isDraft />
                      <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                            下書き
                          </span>
                          <button
                            type="button"
                            onClick={() => openDraftEdit(post)}
                            className="text-xs font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 border border-yellow-300 dark:border-yellow-700 hover:border-yellow-400 py-1 px-3 rounded-md transition-colors flex items-center gap-1"
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
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                            編集・本投稿
                          </button>
                          <button
                            onClick={() => deleteDraft(post.id)}
                            className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors py-1 px-2"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-gray-500 dark:text-g-sub">
                            🔗 投稿先:{" "}
                            <Link
                              href={`/topics/${post.topic.id}`}
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors"
                            >
                              {post.topic.title}
                            </Link>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 自分のコメント */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだコメントしていません。
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1.5">
                      <CommentCard comment={comment} />
                      <div className="text-right px-2">
                        <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${comment.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            {comment.topic.title}
                          </Link>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 作成した分析・図解（PRO） */}
            {activeTab === "analyses" && (
              <div className="space-y-3">
                {/* Create buttons */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link
                    href="/tools/tree"
                    className="inline-flex items-center text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    ロジックツリー作成
                  </Link>
                  <Link
                    href="/tools/matrix"
                    className="inline-flex items-center text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    総合評価表作成
                  </Link>
                  <Link
                    href="/tools/swot"
                    className="inline-flex items-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    SWOT/PEST分析作成
                  </Link>
                </div>

                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ作成した分析・図解はありません。上のボタンから作成できます。
                  </p>
                ) : (
                  analyses.map((analysis) => (
                    <AnalysisCard
                      key={analysis.id}
                      analysis={analysis}
                      onDelete={() => deleteAnalysis(analysis.id)}
                    />
                  ))
                )}
              </div>
            )}

            {/* 作成したトピック（PRO） */}
            {activeTab === "topics" && (
              <div className="space-y-3">
                {topics.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-sm">
                    まだ作成したトピックはありません。
                  </p>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {user && <UserAvatar user={user} size="sm" />}
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-[13px] text-gray-900 dark:text-g-text">
                              {user?.name}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {timeAgo(topic.created_at)}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/topics/${topic.id}`}
                          className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={`/topics/${topic.id}/edit`}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold transition-colors"
                        >
                          編集
                        </Link>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="text-xs text-red-400 hover:text-red-600 font-bold transition-colors"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>

    {/* 下書き編集モーダル（posts/edit.blade.php 相当） */}
    {editingDraft && (
      <div className="relative z-50" role="dialog" aria-modal="true" aria-labelledby="draft-edit-title">
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80" onClick={closeDraftEdit} />
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
            <div className="relative bg-white dark:bg-[#18191a] rounded-t-2xl sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 w-full sm:max-w-xl overflow-hidden shadow-2xl">
              {/* ヘッダー */}
              <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-[#1e1f20]">
                <div>
                  <h3 id="draft-edit-title" className="text-lg font-bold text-gray-900 dark:text-g-text">
                    下書きを編集
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">下書き保存中は他のユーザーには見えません。</p>
                </div>
                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                  下書き
                </span>
              </div>
              {/* フォーム */}
              <div className="p-4 sm:p-6 bg-white dark:bg-[#131314] space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    参考URL (エビデンス)
                  </label>
                  <input
                    type="url"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                    required
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    メディア分類
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    required
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 cursor-pointer"
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
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-g-text mb-1.5">
                    コメント・引用部分の抜粋
                  </label>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={4}
                    className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                  />
                </div>
              </div>
              {/* フッター */}
              <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-3 bg-gray-50 dark:bg-[#1e1f20]">
                <button
                  type="button"
                  onClick={closeDraftEdit}
                  className="text-gray-600 dark:text-g-sub hover:text-gray-900 dark:hover:text-gray-200 font-bold py-2 px-3 rounded-md text-sm transition-colors"
                >
                  キャンセル
                </button>
                <div className="flex items-center gap-2">
                  {/* 下書き保存のまま */}
                  <button
                    type="button"
                    onClick={() => handleDraftUpdate(false)}
                    disabled={editSubmitting || !editUrl || !editCategory}
                    className="text-gray-600 dark:text-g-sub hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    下書き保存
                  </button>
                  {/* 本投稿する */}
                  <button
                    type="button"
                    onClick={() => handleDraftUpdate(true)}
                    disabled={editSubmitting || !editUrl || !editCategory}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md text-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    本投稿する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
