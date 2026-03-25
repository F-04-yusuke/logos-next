"use client";

import type { Comment } from "@/app/topics/[id]/_types";

// dashboard / likes ページで使う型: Comment に topic（必須）を追加
export type SharedComment = Comment & {
  topic: { id: number; title: string };
};

export { CommentCard } from "@/app/topics/[id]/_components/CommentCard";
