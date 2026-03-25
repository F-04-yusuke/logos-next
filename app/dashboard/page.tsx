"use client";

import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { UserAvatar } from "@/components/UserAvatar";
import { PostCard } from "@/components/mypage/PostCard";
import { CommentCard } from "@/components/mypage/CommentCard";
import { AnalysisCard } from "@/components/mypage/AnalysisCard";
import { useDashboard, Tab } from "./_hooks/useDashboard";
import { DraftEditModal } from "./_components/DraftEditModal";

export default function DashboardPage() {
  const {
    user,
    authLoading,
    data,
    activeTab,
    setActiveTab,
    fetching,
    editingDraft,
    editUrl,
    setEditUrl,
    editCategory,
    setEditCategory,
    editComment,
    setEditComment,
    editSubmitting,
    openDraftEdit,
    closeDraftEdit,
    handleDraftUpdate,
    handlePostLike,
    handlePostDelete,
    handlePostSupplement,
    handleCommentLike,
    handleCommentDelete,
    handleCommentReply,
    handleReplyDelete,
    deleteDraft,
    deleteAnalysis,
    deleteTopic,
  } = useDashboard();

  if (authLoading || fetching) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 px-4">
          <div className="animate-pulse">
            <div className="h-7 bg-white/[0.06] rounded-md w-1/4 mb-6" />
            <div className="h-10 bg-white/[0.04] rounded-md w-full mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white/[0.04] rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const posts = data?.posts ?? [];
  const drafts = data?.drafts ?? [];
  const draftCount = data?.draft_count ?? 0;
  const comments = data?.comments ?? [];
  const analyses = data?.analyses ?? [];
  const topics = data?.topics ?? [];

  const indigoTab = (tab: Tab) =>
    activeTab === tab
      ? "border-indigo-500 text-white font-bold"
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

          {/* ページヘッダー */}
          <div className="px-4 sm:px-6 pt-2 mb-5">
            <h1 className="text-2xl font-bold dark:text-g-text pl-3 border-l-4 border-indigo-500">
              ダッシュボード
            </h1>
          </div>

          {/* タブ */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto scrollbar-hide px-4 sm:px-6">
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-3 px-6 border-b-2 text-lg transition-colors duration-100 focus:outline-none whitespace-nowrap cursor-pointer ${indigoTab("posts")}`}
            >
              投稿した情報
            </button>

            <button
              onClick={() => setActiveTab("drafts")}
              className={`py-3 px-6 border-b-2 text-lg transition-colors duration-100 focus:outline-none whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${yellowTab("drafts")}`}
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
              className={`py-3 px-6 border-b-2 text-lg transition-colors duration-100 focus:outline-none whitespace-nowrap cursor-pointer ${indigoTab("comments")}`}
            >
              自分のコメント
            </button>

            <button
              onClick={() => setActiveTab("analyses")}
              className={`py-3 px-6 border-b-2 text-lg transition-colors duration-100 focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${yellowTab("analyses")}`}
            >
              作成した分析・図解
              <span className="ml-1 text-[9px] bg-yellow-500 text-white dark:bg-yellow-500/20 dark:text-yellow-500 px-1 py-0.5 rounded font-bold tracking-wider">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab("topics")}
              className={`py-3 px-6 border-b-2 text-lg transition-colors duration-100 focus:outline-none whitespace-nowrap flex items-center cursor-pointer ${indigoTab("topics")}`}
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
                {posts.length > 0 && (
                  <p className="text-base text-g-sub pl-2 border-l-2 border-gray-700">
                    {posts.length}件の投稿
                  </p>
                )}
                {posts.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-base">
                    まだ投稿した情報はありません。
                  </p>
                ) : (
                  posts.map((post) => (
                    <div key={post.id} className="flex flex-col gap-1.5">
                      <PostCard
                        post={post}
                        currentUserId={user?.id}
                        onLike={() => handlePostLike(post.id)}
                        onDelete={handlePostDelete}
                        onSupplement={handlePostSupplement}
                      />
                      <div className="text-right px-2">
                        <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-100"
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
                    <p className="text-gray-500 text-base mb-2">下書きはありません。</p>
                    <p className="text-base text-gray-400">
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
                            className="text-base font-bold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 border border-yellow-300 dark:border-yellow-700 hover:border-yellow-400 py-1 px-3 rounded-md transition-colors duration-100 flex items-center gap-1 cursor-pointer"
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
                            className="text-base text-red-400 hover:text-red-600 font-bold transition-colors duration-100 py-1 px-2 cursor-pointer"
                          >
                            削除
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-gray-500 dark:text-g-sub">
                            🔗 投稿先:{" "}
                            <Link
                              href={`/topics/${post.topic.id}`}
                              className="text-blue-500 hover:text-blue-600 dark:text-blue-400 transition-colors duration-100"
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
                {comments.length > 0 && (
                  <p className="text-base text-g-sub pl-2 border-l-2 border-gray-700">
                    {comments.length}件のコメント
                  </p>
                )}
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-base">
                    まだコメントしていません。
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col gap-1.5">
                      <CommentCard
                        comment={comment}
                        currentUserId={user?.id}
                        onLike={() => handleCommentLike(comment.id)}
                        onReply={handleCommentReply}
                        onDeleteComment={handleCommentDelete}
                        onDeleteReply={handleReplyDelete}
                      />
                      <div className="text-right px-2">
                        <span className="text-sm sm:text-base font-bold text-gray-500 dark:text-g-sub">
                          🔗 投稿先トピック:{" "}
                          <Link
                            href={`/topics/${comment.topic.id}`}
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-100"
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
                <div className="flex flex-wrap gap-2 mb-4">
                  <Link
                    href="/tools/tree"
                    className="inline-flex items-center text-base font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors duration-100 shadow-sm cursor-pointer"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    ロジックツリー作成
                  </Link>
                  <Link
                    href="/tools/matrix"
                    className="inline-flex items-center text-base font-bold text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-md transition-colors duration-100 shadow-sm cursor-pointer"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    総合評価表作成
                  </Link>
                  <Link
                    href="/tools/swot"
                    className="inline-flex items-center text-base font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors duration-100 shadow-sm cursor-pointer"
                  >
                    <svg aria-hidden="true" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    SWOT/PEST分析作成
                  </Link>
                </div>

                {analyses.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-base">
                    まだ作成した分析・図解はありません。上のボタンから作成できます。
                  </p>
                ) : (
                  <>
                    <p className="text-base text-g-sub pl-2 border-l-2 border-gray-700 mb-1">
                      {analyses.length}件の分析・図解
                    </p>
                    {analyses.map((analysis) => (
                      <AnalysisCard
                        key={analysis.id}
                        analysis={analysis}
                        onDelete={() => deleteAnalysis(analysis.id)}
                      />
                    ))}
                  </>
                )}
              </div>
            )}

            {/* 作成したトピック（PRO） */}
            {activeTab === "topics" && (
              <div className="space-y-3">
                {topics.length > 0 && (
                  <p className="text-base text-g-sub pl-2 border-l-2 border-gray-700">
                    {topics.length}件のトピック
                  </p>
                )}
                {topics.length === 0 ? (
                  <p className="text-gray-500 text-center py-10 text-base">
                    まだ作成したトピックはありません。
                  </p>
                ) : (
                  topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="-ml-3 pl-3 py-4 pr-4 bg-gray-50 dark:bg-[#131314] rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors duration-100"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {user && <UserAvatar user={user} size="sm" />}
                          <div className="flex items-baseline gap-2">
                            <span className="font-bold text-base text-gray-900 dark:text-g-text">
                              {user?.name}
                            </span>
                            <span className="text-base text-gray-500">
                              {timeAgo(topic.created_at)}
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/topics/${topic.id}`}
                          className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-100"
                        >
                          {topic.title}
                        </Link>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          href={`/topics/${topic.id}/edit`}
                          className="text-base text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-bold transition-colors duration-100 cursor-pointer"
                        >
                          編集
                        </Link>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <button
                          onClick={() => deleteTopic(topic.id)}
                          className="text-base text-red-400 hover:text-red-600 font-bold transition-colors duration-100 cursor-pointer"
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

    {/* 下書き編集モーダル */}
    {editingDraft && (
      <DraftEditModal
        editingDraft={editingDraft}
        editUrl={editUrl}
        setEditUrl={setEditUrl}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        editComment={editComment}
        setEditComment={setEditComment}
        editSubmitting={editSubmitting}
        onClose={closeDraftEdit}
        onSave={handleDraftUpdate}
      />
    )}
    </>
  );
}
