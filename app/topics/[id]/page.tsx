"use client";

import { useState, useEffect, use } from "react";

type Post = {
  id: number;
  url: string;
  comment: string;
  likes_count: number;
  created_at: string;
  user: { id: number; name: string };
};

type Comment = {
  id: number;
  content: string;
  created_at: string;
  user: { id: number; name: string };
  replies: Comment[];
};

type TopicDetail = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  user: { id: number; name: string };
  categories: { id: number; name: string }[];
  posts: Post[];
  comments: Comment[];
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function shortenUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const path = pathname.length > 30 ? pathname.slice(0, 30) + "…" : pathname;
    return hostname + path;
  } catch {
    return url;
  }
}

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/topics/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setTopic(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-zinc-400 text-sm">読み込み中...</p>
      </main>
    );
  }

  if (error || !topic) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-red-400 text-sm">トピックの取得に失敗しました</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-3">
          {topic.categories.map((cat) => (
            <span
              key={cat.id}
              className="bg-zinc-700 text-zinc-300 text-xs rounded-full px-3 py-0.5"
            >
              {cat.name}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{topic.title}</h1>
        <p className="text-xs text-zinc-400">
          {topic.user.name} · {formatDate(topic.created_at)}
        </p>
        {topic.content && (
          <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
            {topic.content}
          </p>
        )}
      </div>

      {/* エビデンス一覧 */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-zinc-300 mb-3">
          エビデンス ({topic.posts.length})
        </h2>
        {topic.posts.length === 0 ? (
          <p className="text-xs text-zinc-500">まだエビデンスはありません</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {topic.posts.map((post) => (
              <li
                key={post.id}
                className="bg-[#1e1f20] rounded-xl px-5 py-4"
              >
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:underline break-all"
                >
                  {shortenUrl(post.url)}
                </a>
                {post.comment && (
                  <p className="mt-2 text-sm text-zinc-200">{post.comment}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                  <span>{post.user.name}</span>
                  <span>♡ {post.likes_count}</span>
                  <span className="ml-auto">{formatDate(post.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* コメント一覧 */}
      <section>
        <h2 className="text-base font-semibold text-zinc-300 mb-3">
          コメント ({topic.comments.length})
        </h2>
        {topic.comments.length === 0 ? (
          <p className="text-xs text-zinc-500">まだコメントはありません</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {topic.comments.map((comment) => (
              <li key={comment.id}>
                <div className="bg-[#1e1f20] rounded-xl px-5 py-4">
                  <div className="flex items-center gap-2 mb-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">
                      {comment.user.name}
                    </span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                  <p className="text-sm text-zinc-200">{comment.content}</p>
                </div>
                {/* 返信 */}
                {comment.replies.length > 0 && (
                  <ul className="ml-6 mt-2 flex flex-col gap-2">
                    {comment.replies.map((reply) => (
                      <li
                        key={reply.id}
                        className="bg-[#1e1f20] rounded-xl px-5 py-3 border-l-2 border-zinc-600"
                      >
                        <div className="flex items-center gap-2 mb-1 text-xs text-zinc-400">
                          <span className="font-medium text-zinc-300">
                            {reply.user.name}
                          </span>
                          <span>{formatDate(reply.created_at)}</span>
                        </div>
                        <p className="text-sm text-zinc-200">{reply.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
