"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDateTime } from "../_helpers";
import { PostCard } from "./PostCard";
import { CommentCard } from "./CommentCard";
import { PostModal } from "./PostModal";
import { AnalysisCard } from "./AnalysisCard";
import { AnalysisModal } from "./AnalysisModal";
import { useTopicPage } from "../hooks/useTopicPage";
import { UserAvatar } from "./UserAvatar";
import type { TopicDetail } from "../_types";

type Props = {
  id: string;
  initialTopic: TopicDetail | null;
};

export function TopicPageClient({ id, initialTopic }: Props) {
  const {
    topic,
    loading,
    error,
    user,
    isOwner,
    timeline,
    filteredPosts,
    sortedComments,
    sortedAnalyses,
    activeTab,
    timelineExpanded,
    setTimelineExpanded,
    showPostModal,
    setShowPostModal,
    showAnalysisModal,
    setShowAnalysisModal,
    postFilter,
    setPostFilter,
    postSort,
    setPostSort,
    commentSort,
    setCommentSort,
    analysisSort,
    setAnalysisSort,
    commentBody,
    setCommentBody,
    postUrl,
    setPostUrl,
    postCategory,
    setPostCategory,
    postComment,
    setPostComment,
    submitting,
    timelineLoading,
    fetchTopic,
    handleTabChange,
    handlePostSubmit,
    handleCommentSubmit,
    handlePostLike,
    handleCommentLike,
    handlePostDelete,
    handlePostSupplement,
    handleAnalysisSupplement,
    handleAnalysisDelete,
    handleAnalysisLike,
    handleReplySubmit,
    handleDeleteComment,
    handleDeleteReply,
    handleReplyLike,
    handleTimelineGenerate,
    handleTimelineUpdate,
    handleBookmark,
  } = useTopicPage(id, initialTopic);

  const [contentExpanded, setContentExpanded] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 sm:py-6 animate-pulse">
        <div className="h-7 bg-logos-skeleton rounded-md w-2/3 mb-3" />
        <div className="h-4 bg-logos-skeleton-light rounded w-1/4 mb-8" />
        <div className="flex border-b border-logos-border gap-1 mb-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-logos-skeleton-light rounded-t w-24" />)}
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-logos-skeleton-light rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-400 text-base">トピックの取得に失敗しました</p>
      </main>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-4 sm:py-6 text-logos-text">

        {/* ===== Topic Header Card ===== */}
        <div className="bg-logos-surface rounded-2xl border border-logos-border shadow-sm px-5 py-5 sm:px-7 sm:py-6 mb-4">

        {/* ── モバイル専用 Row 1: カテゴリ + アイコンアクション ── */}
        <div className="flex md:hidden items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {topic.categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors duration-100"
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {isOwner && (
              <Link
                href={`/topics/${topic.id}/edit`}
                className="p-2 rounded-lg text-g-sub hover:text-blue-400 hover:bg-blue-500/10 transition-colors duration-100"
                aria-label="編集する"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </Link>
            )}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors duration-100 cursor-pointer ${
                !!topic.is_bookmarked
                  ? "text-indigo-400 bg-indigo-500/10"
                  : "text-g-sub hover:text-indigo-400 hover:bg-indigo-500/10"
              }`}
              aria-label={!!topic.is_bookmarked ? "保存済み（クリックで解除）" : "保存する"}
            >
              {!!topic.is_bookmarked ? (
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className={`flex flex-col md:flex-row justify-between items-start gap-4 ${contentExpanded ? "mb-2" : "mb-0"}`}>

          {/* Left: title / content / timeline */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold mb-3 pl-3 border-l-4 border-indigo-500">{topic.title}</h2>

            {/* ── モバイル専用 Row 2: 著者・日付 + 概要ボタン ── */}
            <div className="flex md:hidden items-center justify-between gap-2 pt-2.5 border-t border-logos-border mb-1">
              <div className="flex items-center gap-1.5 text-sm text-g-sub min-w-0">
                <UserAvatar user={topic.user} size="sm" />
                <span className="font-medium text-g-text truncate">{topic.user.name}</span>
                <span className="shrink-0 select-none opacity-40">·</span>
                <span className="shrink-0 text-xs">{formatDateTime(topic.created_at)}</span>
              </div>
              <button
                onClick={() => setContentExpanded(!contentExpanded)}
                className="text-xs text-g-sub hover:text-g-text transition-colors duration-100 cursor-pointer flex items-center gap-1 shrink-0 px-2.5 py-1.5 rounded-lg border border-logos-border hover:border-logos-border hover:bg-logos-hover"
              >
                <svg className={`h-3 w-3 transition-transform duration-200 ${contentExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
                概要
              </button>
            </div>

            {/* ── PC専用: 概要展開ボタン ── */}
            <button
              onClick={() => setContentExpanded(!contentExpanded)}
              className="hidden md:flex text-sm text-g-sub hover:text-g-text hover:bg-logos-hover pr-2 py-1 rounded transition-colors duration-100 cursor-pointer items-center gap-1"
            >
              <svg className={`h-3 w-3 transition-transform duration-200 ${contentExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {contentExpanded ? "閉じる" : "トピックの概要を見る"}
            </button>

            {contentExpanded && (
              <>
                <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700 dark:text-g-text mb-5">
                  {topic.content}
                </p>

                {/* Timeline */}
                <div className="mt-1 mb-1">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-g-sub flex items-center shrink-0">
                      <span className="mr-1" aria-hidden="true">⏳</span>{" "}
                      時系列
                    </h3>
                    {isOwner && (
                      timeline.length === 0 ? (
                        <button
                          onClick={handleTimelineGenerate}
                          disabled={timelineLoading}
                          className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold py-0.5 px-2 rounded transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          <span aria-hidden="true">✨</span>
                          {timelineLoading ? "生成中..." : "AIで自動生成する"}
                        </button>
                      ) : (
                        <button
                          onClick={handleTimelineUpdate}
                          disabled={timelineLoading}
                          className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 font-bold py-0.5 px-2 rounded transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          title="投稿されたエビデンスを元に時系列を最新化します"
                        >
                          <span aria-hidden="true">🔄</span>
                          {timelineLoading ? "更新中..." : "最新投稿からAI更新"}
                        </button>
                      )
                    )}
                  </div>

                  {timeline.length > 0 && (
                    <>
                      <div className="border-l-[1.5px] border-gray-300 dark:border-logos-border ml-1.5 pl-3">
                        {timeline.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="relative flex items-start py-0.5 sm:py-1 rounded hover:bg-gray-100 dark:hover:bg-logos-surface px-1 transition-colors"
                          >
                            <div className="absolute left-[-16.5px] top-2.5 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                            <div className="w-24 sm:w-28 text-sm text-gray-500 dark:text-g-sub shrink-0">
                              {item.date ?? ""}
                            </div>
                            <div className="flex-1 text-sm text-gray-700 dark:text-g-text">
                              {item.event ?? ""}
                            </div>
                            {(item.is_ai === undefined || !!item.is_ai) && (
                              <span className="ml-2 text-[9px] bg-gray-100 dark:bg-logos-surface text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-logos-border self-start mt-0.5">
                                AI生成
                              </span>
                            )}
                          </div>
                        ))}

                        {timelineExpanded &&
                          timeline.slice(3).map((item, i) => (
                            <div
                              key={i + 3}
                              className="relative flex items-start py-0.5 sm:py-1 rounded hover:bg-gray-100 dark:hover:bg-logos-surface px-1 transition-colors"
                            >
                              <div className="absolute left-[-16.5px] top-2.5 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                              <div className="w-24 sm:w-28 text-sm text-gray-500 dark:text-g-sub shrink-0">
                                {item.date ?? ""}
                              </div>
                              <div className="flex-1 text-sm text-gray-700 dark:text-g-text">
                                {item.event ?? ""}
                              </div>
                              {(item.is_ai === undefined || !!item.is_ai) && (
                                <span className="ml-2 text-[9px] bg-gray-100 dark:bg-logos-surface text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-logos-border self-start mt-0.5">
                                  AI生成
                                </span>
                              )}
                            </div>
                          ))}
                      </div>

                      {timeline.length > 3 && (
                        <button
                          onClick={() => setTimelineExpanded(!timelineExpanded)}
                          className="mt-1 ml-3 text-sm font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-logos-surface px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          {timelineExpanded ? "▲ 閉じる" : "▼ もっと見る"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: categories / meta / actions (PC only) */}
          <div className="hidden md:flex flex-col items-end flex-shrink-0 min-w-[120px] space-y-1">
            {topic.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end mb-2">
                {topic.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors duration-100"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-sm text-g-sub justify-end">
              <UserAvatar user={topic.user} size="sm" />
              <span>{topic.user.name}</span>
            </div>
            <span className="text-sm text-g-sub">{formatDateTime(topic.created_at)}</span>

            <div className="pt-1 flex items-center justify-end gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/topics/${topic.id}/edit`}
                    className="text-sm font-bold text-g-sub hover:text-blue-400 hover:bg-blue-500/10 transition-colors duration-100 flex items-center px-2 py-1.5 rounded-lg"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    編集する
                  </Link>
                  <span className="text-logos-border">|</span>
                </>
              )}

              <button
                onClick={handleBookmark}
                className={`text-sm transition-colors duration-100 flex items-center px-2 py-1.5 rounded-lg cursor-pointer ${
                  !!topic.is_bookmarked
                    ? "text-indigo-400 hover:bg-indigo-500/10"
                    : "text-g-sub hover:text-indigo-400 hover:bg-indigo-500/10"
                }`}
              >
                {topic.is_bookmarked ? (
                  <>
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    保存済み
                  </>
                ) : (
                  <>
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                    保存する
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        </div>{/* End Topic Header Card */}

        {/* ===== Tabs ===== */}
        <div className="mt-4">
          <div className="flex items-center gap-1 bg-logos-hover rounded-xl p-1 mb-5 w-fit overflow-x-auto">
            {(["info", "comments", "analysis"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-2 px-4 sm:px-5 rounded-lg text-sm font-bold transition-all duration-150 focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab
                    ? "bg-white dark:bg-logos-elevated shadow-sm text-indigo-600 dark:text-white"
                    : "text-logos-sub hover:text-logos-text"
                }`}
              >
                {tab === "info" && "情報"}
                {tab === "comments" && "コメント"}
                {tab === "analysis" && (
                  <>
                    分析・図解
                    <span className="text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-400 px-1.5 py-0.5 rounded font-bold tracking-wider">
                      PRO
                    </span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* ===== Info Tab ===== */}
          {activeTab === "info" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
                  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
                  {filteredPosts.length} 件の投稿
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <select
                      value={postFilter}
                      onChange={(e) => setPostFilter(e.target.value)}
                      className="text-sm rounded-full border border-logos-border bg-logos-surface text-logos-text px-3 py-1.5 cursor-pointer hover:bg-logos-hover transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-400/30 focus:border-indigo-400"
                    >
                      <option value="">すべてのメディア</option>
                      <option value="YouTube">YouTube</option>
                      <option value="X">X</option>
                      <option value="記事">記事</option>
                      <option value="知恵袋">知恵袋</option>
                      <option value="本">本</option>
                      <option value="その他">その他</option>
                    </select>
                    <select
                      value={postSort}
                      onChange={(e) =>
                        setPostSort(e.target.value as "popular" | "newest" | "oldest")
                      }
                      className="text-sm sm:text-base rounded border border-gray-200 dark:border-logos-border bg-white dark:bg-logos-bg dark:text-white px-2 sm:px-3 py-1.5 sm:py-1.5 hidden sm:block cursor-pointer hover:bg-gray-100 dark:hover:bg-logos-surface transition-colors focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                    >
                      <option value="popular">人気順</option>
                      <option value="newest">新着順</option>
                      <option value="oldest">古い順</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      if (!user) { alert("投稿するにはログインが必要です"); return; }
                      setShowPostModal(true);
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all flex items-center shrink-0 cursor-pointer"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="sr-only">エビデンスを投稿する</span>
                    <span className="hidden sm:inline" aria-hidden="true">
                      投稿する
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredPosts.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-base">
                    投稿はありません
                  </p>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      onLike={() => handlePostLike(post.id)}
                      onSupplement={handlePostSupplement}
                      onDelete={handlePostDelete}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== Comments Tab ===== */}
          {activeTab === "comments" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
                  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
                  {topic.comments.length} 件のコメント
                </h3>
                <select
                  value={commentSort}
                  onChange={(e) =>
                    setCommentSort(e.target.value as "popular" | "newest" | "oldest")
                  }
                  className="text-sm sm:text-base rounded border border-gray-200 dark:border-logos-border bg-white dark:bg-logos-bg dark:text-white px-2 sm:px-3 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-logos-surface transition-colors focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                >
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                </select>
              </div>

              {user && !topic.user_has_commented && (
                <div className="p-4 bg-logos-surface rounded-xl border border-logos-border mb-6">
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 dark:bg-logos-bg dark:border-logos-border dark:text-white mb-2 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      placeholder="このトピックに対するあなたの意見を教えてください（※1人1件まで）"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm shadow-sm transition-all disabled:opacity-50"
                      >
                        コメントする
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {sortedComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-base">
                    まだコメントはありません。最初のコメントを投稿しましょう！
                  </p>
                ) : (
                  sortedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      currentUserId={user?.id}
                      onLike={() => handleCommentLike(comment.id)}
                      onReplyLike={(replyId) => handleReplyLike(comment.id, replyId)}
                      onReply={handleReplySubmit}
                      onDeleteComment={handleDeleteComment}
                      onDeleteReply={handleDeleteReply}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== Analysis Tab ===== */}
          {activeTab === "analysis" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-logos-text text-base sm:text-lg flex items-center gap-2">
                  <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-yellow-400 to-orange-500 flex-shrink-0" aria-hidden="true" />
                  {topic.analyses?.length ?? 0} 件の分析・図解
                </h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={analysisSort}
                    onChange={(e) => setAnalysisSort(e.target.value as "popular" | "newest" | "oldest")}
                    className="text-sm sm:text-base rounded border border-gray-200 dark:border-logos-border bg-white dark:bg-logos-bg dark:text-white px-2 sm:px-3 py-1.5 hidden sm:block cursor-pointer hover:bg-gray-100 dark:hover:bg-logos-surface transition-colors focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
                  >
                    <option value="popular">人気順</option>
                    <option value="newest">新着順</option>
                    <option value="oldest">古い順</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!user) { alert("投稿するにはログインが必要です"); return; }
                      setShowAnalysisModal(true);
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-4 rounded-full text-sm shadow-sm hover:shadow-orange-500/25 hover:shadow-md transition-all flex items-center shrink-0 cursor-pointer"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:mr-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="sr-only">分析・図解を投稿する</span>
                    <span className="hidden sm:inline" aria-hidden="true">
                      分析・図解を投稿
                    </span>
                  </button>
                </div>
              </div>

              {(topic.analyses?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-logos-border rounded-lg bg-gray-50 dark:bg-logos-bg/50">
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-base text-gray-500 dark:text-g-sub font-bold mb-1">
                    まだ分析・図解は投稿されていません
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center max-w-sm">
                    プレミアムプランに登録すると、オリジナル図解をアップロードしたり、「ロジックツリー」や「総合評価表」を作成してここに公開することができます。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedAnalyses.map((analysis) => (
                    <AnalysisCard
                      key={analysis.id}
                      analysis={analysis}
                      currentUserId={user?.id}
                      isPro={user?.is_pro ?? false}
                      onSupplement={handleAnalysisSupplement}
                      onDelete={handleAnalysisDelete}
                      onLike={handleAnalysisLike}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Evidence Modal ===== */}
        {showPostModal && (
          <PostModal
            onClose={() => {
              setShowPostModal(false);
              setPostUrl("");
              setPostCategory("");
              setPostComment("");
            }}
            url={postUrl}
            onUrlChange={setPostUrl}
            category={postCategory}
            onCategoryChange={setPostCategory}
            comment={postComment}
            onCommentChange={setPostComment}
            onSubmit={handlePostSubmit}
            submitting={submitting}
          />
        )}

        {/* ===== Analysis Modal ===== */}
        {showAnalysisModal && (
          <AnalysisModal
            onClose={() => setShowAnalysisModal(false)}
            topicId={topic.id}
            alreadyPublishedIds={topic.analyses?.map((a) => a.id) ?? []}
            onPublish={fetchTopic}
          />
        )}

        {/* ===== Back Link ===== */}
        <div className="mt-8 border-t border-logos-border pt-6 pb-4">
          <Link
            href="/"
            className="inline-flex items-center text-logos-sub hover:text-logos-text font-bold text-sm transition-colors py-2 px-4 -ml-4 rounded-full hover:bg-logos-hover"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            一覧に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
