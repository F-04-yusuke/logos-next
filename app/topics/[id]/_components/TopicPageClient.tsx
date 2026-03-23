"use client";

import Link from "next/link";
import { formatDateTime } from "../_helpers";
import { PostCard } from "./PostCard";
import { CommentCard } from "./CommentCard";
import { PostModal } from "./PostModal";
import { AnalysisCard } from "./AnalysisCard";
import { AnalysisModal } from "./AnalysisModal";
import { useTopicPage } from "../hooks/useTopicPage";
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

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </main>
    );
  }

  if (error || !topic) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-red-400 text-sm">トピックの取得に失敗しました</p>
      </main>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-gray-900 dark:text-gray-100">

        {/* ===== Topic Header ===== */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-2">

          {/* Left: title / content / timeline */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold tracking-tight mb-2">{topic.title}</h2>
            <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 mb-3">
              {topic.content}
            </p>

            {/* Timeline */}
            <div className="mt-1 mb-1">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center shrink-0">
                  <span className="mr-1" aria-hidden="true">⏳</span>{" "}
                  前提となる時系列
                </h3>
                {isOwner && (
                  timeline.length === 0 ? (
                    <button
                      onClick={handleTimelineGenerate}
                      disabled={timelineLoading}
                      className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-bold py-0.5 px-2 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <span aria-hidden="true">✨</span>
                      {timelineLoading ? "生成中..." : "AIで自動生成する"}
                    </button>
                  ) : (
                    <button
                      onClick={handleTimelineUpdate}
                      disabled={timelineLoading}
                      className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50 font-bold py-0.5 px-2 rounded transition-colors flex items-center gap-1 disabled:opacity-50"
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
                  <div className="border-l-[1.5px] border-gray-300 dark:border-gray-700 ml-1.5 pl-3">
                    {timeline.slice(0, 3).map((item, i) => (
                      <div
                        key={i}
                        className="relative flex items-start sm:items-center py-0.5 sm:py-1"
                      >
                        <div className="absolute left-[-16.5px] top-2.5 sm:top-1/2 sm:-translate-y-1/2 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                        <div className="w-20 sm:w-24 text-sm text-gray-700 dark:text-gray-300 shrink-0">
                          {item.date ?? ""}
                        </div>
                        <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 sm:truncate">
                          {item.event ?? ""}
                        </div>
                        {(item.is_ai === undefined || !!item.is_ai) && (
                          <span className="ml-2 text-[9px] bg-gray-100 dark:bg-[#1e1f20] text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-gray-800">
                            AI生成
                          </span>
                        )}
                      </div>
                    ))}

                    {timelineExpanded &&
                      timeline.slice(3).map((item, i) => (
                        <div
                          key={i + 3}
                          className="relative flex items-start sm:items-center py-0.5 sm:py-1"
                        >
                          <div className="absolute left-[-16.5px] top-2.5 sm:top-1/2 sm:-translate-y-1/2 w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
                          <div className="w-20 sm:w-24 text-sm text-gray-700 dark:text-gray-300 shrink-0">
                            {item.date ?? ""}
                          </div>
                          <div className="flex-1 text-sm text-gray-700 dark:text-gray-300 sm:truncate">
                            {item.event ?? ""}
                          </div>
                          {(item.is_ai === undefined || !!item.is_ai) && (
                            <span className="ml-2 text-[9px] bg-gray-100 dark:bg-[#1e1f20] text-gray-400 px-1 py-0.5 rounded whitespace-nowrap shrink-0 border border-gray-200 dark:border-gray-800">
                              AI生成
                            </span>
                          )}
                        </div>
                      ))}
                  </div>

                  {timeline.length > 3 && (
                    <button
                      onClick={() => setTimelineExpanded(!timelineExpanded)}
                      className="mt-1 ml-3 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {timelineExpanded ? "▲ 閉じる" : "▼ もっと見る"}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right: categories / meta / actions */}
          <div className="flex flex-col items-end flex-shrink-0 space-y-1">
            {topic.categories.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end mb-1">
                {topic.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.id}`}
                    className="px-2 py-0.5 text-xs rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-500 dark:text-gray-400 text-right space-y-0.5">
              <p>作成者: {topic.user.name}</p>
              <p>{formatDateTime(topic.created_at)}</p>
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              {isOwner && (
                <>
                  <Link
                    href={`/topics/${topic.id}/edit`}
                    className="text-xs font-bold text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center px-2 py-1.5 rounded-full"
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
                  <span className="text-gray-300 dark:text-gray-700">|</span>
                </>
              )}

              <button
                onClick={handleBookmark}
                className="text-xs text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors flex items-center px-2 py-1.5 rounded-full"
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

        {/* ===== Tabs ===== */}
        <div className="mt-4">
          <div className="flex border-b border-gray-300 dark:border-gray-800 mb-4 overflow-x-auto">
            {(["info", "comments", "analysis"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`py-3 px-6 border-b-2 text-sm transition-colors focus:outline-none whitespace-nowrap flex items-center ${
                  activeTab === tab
                    ? tab === "analysis"
                      ? "border-yellow-500 text-gray-900 dark:text-white font-bold"
                      : "border-gray-900 text-gray-900 dark:border-gray-200 dark:text-white font-bold"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200 hover:bg-white/[0.05]"
                }`}
              >
                {tab === "info" && "情報"}
                {tab === "comments" && "コメント"}
                {tab === "analysis" && (
                  <>
                    分析・図解
                    <span className="ml-1.5 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1.5 py-0.5 rounded font-black tracking-wider">
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
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {filteredPosts.length}件の投稿
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-2">
                    <select
                      value={postFilter}
                      onChange={(e) => setPostFilter(e.target.value)}
                      className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1"
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
                      className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1 hidden sm:block"
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
                    className="bg-white border border-gray-300 hover:bg-gray-50 dark:bg-[#1e1f20] dark:border-gray-700 dark:text-white dark:hover:bg-gray-800 font-bold py-1.5 px-3 sm:py-1.5 sm:px-4 rounded text-xs sm:text-sm transition-colors flex items-center shrink-0"
                  >
                    <svg
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 sm:mr-1"
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

              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">
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
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {topic.comments.length}件のコメント
                </h3>
                <select
                  value={commentSort}
                  onChange={(e) =>
                    setCommentSort(e.target.value as "popular" | "newest" | "oldest")
                  }
                  className="text-xs sm:text-sm rounded border-gray-300 dark:border-gray-700 shadow-sm focus:border-gray-500 focus:ring-gray-500 dark:bg-[#1e1f20] dark:text-white py-1.5 sm:py-1"
                >
                  <option value="popular">人気順</option>
                  <option value="newest">新着順</option>
                  <option value="oldest">古い順</option>
                </select>
              </div>

              {user && !topic.user_has_commented && (
                <div className="p-4 bg-gray-50 dark:bg-[#1e1f20] rounded-lg border border-gray-200 dark:border-transparent mb-6">
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border-gray-300 dark:bg-[#131314] dark:border-gray-700 dark:text-white mb-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                      placeholder="このトピックに対するコメント（※1人1件まで）"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-gray-800 hover:bg-gray-900 dark:bg-[#131314] dark:text-gray-200 border border-transparent dark:border-gray-700 dark:hover:bg-gray-800 text-white font-bold py-2 px-4 sm:py-1.5 rounded text-sm transition-colors shadow-sm disabled:opacity-50"
                      >
                        コメントする
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-2 mt-4">
                {sortedComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 text-sm">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                  {topic.analyses?.length ?? 0}件の分析・図解
                </h3>
                <button
                  onClick={() => {
                    if (!user) { alert("投稿するにはログインが必要です"); return; }
                    setShowAnalysisModal(true);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1.5 px-3 sm:py-1.5 sm:px-4 rounded text-xs sm:text-sm transition-colors flex items-center shrink-0"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:mr-1"
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

              {(topic.analyses?.length ?? 0) === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-[#131314]/50">
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold mb-1">
                    まだ分析・図解は投稿されていません
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-sm">
                    プレミアムプランに登録すると、オリジナル図解をアップロードしたり、「ロジックツリー」や「総合評価表」を作成してここに公開することができます。
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topic.analyses!.map((analysis) => (
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
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6 pb-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold text-sm transition-colors py-2 px-4 -ml-4 rounded-md hover:bg-gray-100 dark:hover:bg-[#1e1f20]"
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
