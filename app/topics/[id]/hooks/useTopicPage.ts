import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { getAuthHeaders } from "@/lib/auth";
import type { TopicDetail } from "../_types";
import { API_BASE } from "../_helpers";

/**
 * @param id         トピックID
 * @param initialTopic  SSR で取得済みの初期データ（省略時は CSR フェッチ）
 */
export function useTopicPage(id: string, initialTopic?: TopicDetail | null) {
  const { user } = useAuth();
  const { triggerBookmarkRefresh } = useSidebar();
  const router = useRouter();

  // ── 基本データ ──
  // SSR データがある場合は即表示（loading=false）、ない場合は CSR フェッチ待ち
  const [topic, setTopic] = useState<TopicDetail | null>(initialTopic ?? null);
  const [loading, setLoading] = useState(initialTopic == null);
  const [error, setError] = useState(false);

  // ── UI 状態 ──
  const [activeTab, setActiveTab] = useState<"info" | "comments" | "analysis">("info");
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // ── フィルター・ソート ──
  const [postFilter, setPostFilter] = useState("");
  const [postSort, setPostSort] = useState<"popular" | "newest" | "oldest">("popular");
  const [commentSort, setCommentSort] = useState<"popular" | "newest" | "oldest">("popular");

  // ── フォーム入力 ──
  const [commentBody, setCommentBody] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [postCategory, setPostCategory] = useState("");
  const [postComment, setPostComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // ── フェッチ ──
  // silent=true: SSR データがある場合の再フェッチ（ローディング表示なし・auth付きで user 固有フィールドを補完）
  const fetchTopic = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch(`${API_BASE}/api/topics/${id}`, { headers: getAuthHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setTopic(data);
        setLoading(false);
      })
      .catch(() => {
        if (!silent) setError(true);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    // SSR データがある場合: サイレント再フェッチで is_liked_by_me / is_bookmarked 等を補完
    // SSR データがない場合: 通常のローディングフェッチ
    fetchTopic(initialTopic != null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTopic]);

  // タブ永続化（sessionStorage）
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(`activeTab_${id}`);
    if (saved === "info" || saved === "comments" || saved === "analysis") {
      setActiveTab(saved);
    }
  }, [id]);

  // ── ハンドラ ──
  const handleTabChange = (tab: "info" | "comments" | "analysis") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(`activeTab_${id}`, tab);
    }
  };

  const handlePostSubmit = async (isDraft: boolean) => {
    if (!postUrl || !postCategory) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          url: postUrl,
          category: postCategory,
          comment: postComment || undefined,
          is_published: !isDraft,
        }),
      });
      if (!res.ok) throw new Error();
      if (isDraft) {
        setShowPostModal(false);
        setPostUrl("");
        setPostCategory("");
        setPostComment("");
        router.push("/dashboard?tab=drafts");
        return;
      }
      const newPost = await res.json();
      setTopic((prev) =>
        prev ? { ...prev, posts: [newPost, ...prev.posts] } : prev
      );
      setShowPostModal(false);
      setPostUrl("");
      setPostCategory("");
      setPostComment("");
    } catch {
      alert("投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ body: commentBody }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "コメント投稿に失敗しました");
        return;
      }
      const newComment = await res.json();
      setTopic((prev) =>
        prev
          ? { ...prev, comments: [...prev.comments, newComment], user_has_commented: true }
          : prev
      );
      setCommentBody("");
    } catch {
      alert("コメント投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePostLike = async (postId: number) => {
    if (!user) { alert("いいねするにはログインが必要です"); return; }
    const res = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              posts: prev.posts.map((p) =>
                p.id === postId
                  ? { ...p, likes_count: data.likes_count, is_liked_by_me: data.liked }
                  : p
              ),
            }
          : prev
      );
    }
  };

  const handleCommentLike = async (commentId: number) => {
    if (!user) { alert("いいねするにはログインが必要です"); return; }
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? { ...c, likes_count: data.likes_count, is_liked_by_me: data.liked }
                  : c
              ),
            }
          : prev
      );
    }
  };

  const handlePostDelete = async (postId: number) => {
    await fetch(`${API_BASE}/api/posts/${postId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setTopic((prev) =>
      prev ? { ...prev, posts: prev.posts.filter((p) => p.id !== postId) } : prev
    );
  };

  const handlePostSupplement = async (postId: number, supplement: string) => {
    const res = await fetch(`${API_BASE}/api/posts/${postId}/supplement`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ supplement }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "補足の投稿に失敗しました");
      return;
    }
    const data = await res.json();
    setTopic((prev) =>
      prev
        ? { ...prev, posts: prev.posts.map((p) => p.id === postId ? { ...p, supplement: data.supplement } : p) }
        : prev
    );
  };

  const handleAnalysisSupplement = async (analysisId: number, supplement: string) => {
    const res = await fetch(`${API_BASE}/api/analyses/${analysisId}/supplement`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ supplement }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "補足の投稿に失敗しました");
      return;
    }
    const data = await res.json();
    setTopic((prev) =>
      prev
        ? { ...prev, analyses: prev.analyses?.map((a) => a.id === analysisId ? { ...a, supplement: data.supplement } : a) }
        : prev
    );
  };

  const handleAnalysisDelete = async (analysisId: number) => {
    if (!confirm("この分析・図解を本当に削除しますか？")) return;
    await fetch(`${API_BASE}/api/analyses/${analysisId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    fetchTopic();
  };

  const handleAnalysisLike = async (analysisId: number) => {
    if (!user) { alert("いいねするにはログインが必要です"); return; }
    const res = await fetch(`${API_BASE}/api/analyses/${analysisId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              analyses: prev.analyses?.map((a) =>
                a.id === analysisId
                  ? { ...a, likes_count: data.likes_count, is_liked_by_me: data.liked }
                  : a
              ),
            }
          : prev
      );
    }
  };

  const handleReplySubmit = async (commentId: number, body: string) => {
    const res = await fetch(`${API_BASE}/api/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.message ?? "返信の投稿に失敗しました");
      return;
    }
    const newReply = await res.json();
    setTopic((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: [...c.replies, newReply] }
                : c
            ),
          }
        : prev
    );
  };

  const handleDeleteComment = async (commentId: number) => {
    await fetch(`${API_BASE}/api/comments/${commentId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setTopic((prev) =>
      prev
        ? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId), user_has_commented: false }
        : prev
    );
  };

  const handleDeleteReply = async (commentId: number, replyId: number) => {
    await fetch(`${API_BASE}/api/comments/${replyId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    setTopic((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
                : c
            ),
          }
        : prev
    );
  };

  const handleReplyLike = async (commentId: number, replyId: number) => {
    if (!user) { alert("いいねするにはログインが必要です"); return; }
    const res = await fetch(`${API_BASE}/api/comments/${replyId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev
          ? {
              ...prev,
              comments: prev.comments.map((c) =>
                c.id === commentId
                  ? {
                      ...c,
                      replies: c.replies.map((r) =>
                        r.id === replyId
                          ? { ...r, likes_count: data.likes_count, is_liked_by_me: data.liked }
                          : r
                      ),
                    }
                  : c
              ),
            }
          : prev
      );
    }
  };

  const handleTimelineGenerate = async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/timeline/generate`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "時系列の生成に失敗しました"); return; }
      setTopic((prev) => prev ? { ...prev, timeline: data.timeline } : prev);
    } catch {
      alert("時系列の生成に失敗しました");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleTimelineUpdate = async () => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/topics/${id}/timeline/update`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "AI更新に失敗しました"); return; }
      setTopic((prev) => prev ? { ...prev, timeline: data.timeline } : prev);
    } catch {
      alert("AI更新に失敗しました");
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) { alert("ブックマークするにはログインが必要です"); return; }
    const res = await fetch(`${API_BASE}/api/topics/${id}/bookmark`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      setTopic((prev) =>
        prev ? { ...prev, is_bookmarked: data.bookmarked } : prev
      );
      triggerBookmarkRefresh();
    }
  };

  // ── computed values ──
  const filteredPosts = (topic?.posts ?? [])
    .filter((p) => !postFilter || p.category === postFilter)
    .slice()
    .sort((a, b) => {
      if (postSort === "popular") return b.likes_count - a.likes_count;
      if (postSort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  const sortedComments = (topic?.comments ?? []).slice().sort((a, b) => {
    if (commentSort === "popular") return b.likes_count - a.likes_count;
    if (commentSort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const isOwner = !!user && !!topic && user.id === topic.user.id;
  const timeline = topic?.timeline ?? [];

  return {
    // data
    topic,
    loading,
    error,
    user,
    isOwner,
    timeline,
    filteredPosts,
    sortedComments,

    // UI state
    activeTab,
    timelineExpanded,
    setTimelineExpanded,
    showPostModal,
    setShowPostModal,
    showAnalysisModal,
    setShowAnalysisModal,

    // filter / sort state
    postFilter,
    setPostFilter,
    postSort,
    setPostSort,
    commentSort,
    setCommentSort,

    // form input state
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

    // handlers
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
  };
}
