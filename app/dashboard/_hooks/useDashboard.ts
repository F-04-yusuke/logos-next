"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SharedPost } from "@/components/mypage/PostCard";
import { SharedComment } from "@/components/mypage/CommentCard";
import { SharedAnalysis } from "@/components/mypage/AnalysisCard";

// ===== Types =====

export type DashboardTopic = {
  id: number;
  title: string;
  created_at: string;
};

export type DashboardData = {
  posts: SharedPost[];
  drafts: SharedPost[];
  draft_count: number;
  comments: SharedComment[];
  analyses: SharedAnalysis[];
  topics: DashboardTopic[];
};

export type Tab = "posts" | "drafts" | "comments" | "analyses" | "topics";

const PROXY_BASE = "/api/proxy";

// ===== Hook =====

export function useDashboard() {
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
      const res = await fetch(`${PROXY_BASE}/posts/${editingDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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
        const updated = await res.json();
        if (data) {
          setData({
            ...data,
            drafts: data.drafts.map((p) =>
              p.id === editingDraft.id ? { ...p, ...updated } : p
            ),
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

  // URL ?tab=drafts の場合は下書きタブを初期選択
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
      fetch(`${PROXY_BASE}/dashboard`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((d: DashboardData) => setData(d))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [authLoading, user]);

  async function handlePostLike(postId: number) {
    const res = await fetch(`${PROXY_BASE}/posts/${postId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const result = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId
              ? { ...p, is_liked_by_me: result.liked, likes_count: result.likes_count }
              : p
          ),
        };
      });
    }
  }

  async function handlePostDelete(postId: number) {
    const res = await fetch(`${PROXY_BASE}/posts/${postId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, posts: prev.posts.filter((p) => p.id !== postId) };
      });
    }
  }

  async function handlePostSupplement(postId: number, supplement: string): Promise<void> {
    const res = await fetch(`${PROXY_BASE}/posts/${postId}/supplement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplement }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "補足の追加に失敗しました");
    }
    const result = await res.json();
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) =>
          p.id === postId ? { ...p, supplement: result.supplement } : p
        ),
      };
    });
  }

  async function handleCommentLike(commentId: number) {
    const res = await fetch(`${PROXY_BASE}/comments/${commentId}/like`, {
      method: "POST",
    });
    if (res.ok) {
      const result = await res.json();
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId
              ? { ...c, is_liked_by_me: result.liked, likes_count: result.likes_count }
              : c
          ),
        };
      });
    }
  }

  async function handleCommentDelete(commentId: number) {
    const res = await fetch(`${PROXY_BASE}/comments/${commentId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) };
      });
    }
  }

  async function handleCommentReply(commentId: number, body: string): Promise<void> {
    const res = await fetch(`${PROXY_BASE}/comments/${commentId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "返信の投稿に失敗しました");
    }
    const reply = await res.json();
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: prev.comments.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies ?? []), reply] }
            : c
        ),
      };
    });
  }

  async function handleReplyDelete(commentId: number, replyId: number) {
    const res = await fetch(`${PROXY_BASE}/comments/${replyId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === commentId
              ? { ...c, replies: (c.replies ?? []).filter((r) => r.id !== replyId) }
              : c
          ),
        };
      });
    }
  }

  async function deleteDraft(postId: number) {
    if (!window.confirm("下書きを削除しますか？")) return;
    const res = await fetch(`${PROXY_BASE}/posts/${postId}`, {
      method: "DELETE",
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
    const res = await fetch(`${PROXY_BASE}/analyses/${analysisId}`, {
      method: "DELETE",
    });
    if (res.ok && data) {
      setData({ ...data, analyses: data.analyses.filter((a) => a.id !== analysisId) });
    }
  }

  async function deleteTopic(topicId: number) {
    if (!window.confirm("本当に削除しますか？")) return;
    const res = await fetch(`${PROXY_BASE}/topics/${topicId}`, {
      method: "DELETE",
    });
    if (res.ok && data) {
      setData({ ...data, topics: data.topics.filter((t) => t.id !== topicId) });
    }
  }

  return {
    user,
    authLoading,
    data,
    activeTab,
    setActiveTab,
    fetching,
    // 下書き編集モーダル
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
    // ハンドラ
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
  };
}
