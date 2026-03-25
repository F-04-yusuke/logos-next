"use client";

import type { Post } from "@/app/topics/[id]/_types";

// dashboard / likes ページで使う型: Post に topic（必須）を追加
export type SharedPost = Post & {
  topic: { id: number; title: string };
};

export { PostCard } from "@/app/topics/[id]/_components/PostCard";
