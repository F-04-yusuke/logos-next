"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Category = {
  id: number;
  name: string;
};

type Topic = {
  id: number;
  title: string;
  posts_count: number;
  comments_count: number;
  created_at: string;
  user: { id: number; name: string };
  categories: Category[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setTopics(data.data ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-8">トピック一覧</h1>

      {loading && (
        <p className="text-zinc-400 text-sm">読み込み中...</p>
      )}

      {error && (
        <p className="text-red-400 text-sm">トピックの取得に失敗しました</p>
      )}

      {!loading && !error && (
        <ul className="flex flex-col gap-3">
          {topics.map((topic) => (
            <Link key={topic.id} href={`/topics/${topic.id}`}>
              <li className="bg-[#1e1f20] rounded-xl px-5 py-4 hover:shadow-md hover:scale-[1.01] transition-transform cursor-pointer">
                <p className="text-white font-semibold text-[15px] mb-2">
                  {topic.title}
                </p>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  {topic.categories[0] && (
                    <span className="bg-zinc-700 text-zinc-300 rounded-full px-2 py-0.5">
                      {topic.categories[0].name}
                    </span>
                  )}
                  <span>{topic.user.name}</span>
                  <span>投稿 {topic.posts_count}</span>
                  <span>コメント {topic.comments_count}</span>
                  <span className="ml-auto">{formatDate(topic.created_at)}</span>
                </div>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </main>
  );
}
