"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";
      const res = await fetch(`${baseUrl}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "ログインに失敗しました");
        return;
      }

      setToken(data.token);
      await refetch();
      router.push("/");
    } catch {
      setError("サーバーに接続できませんでした");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2L2 20h20L12 2z" />
          </svg>
          <span className="text-white font-bold text-2xl tracking-tight">
            LOGOS
          </span>
        </div>

        {/* カード */}
        <div className="bg-[#1e1f20] rounded-2xl px-8 py-8">
          <h1 className="text-white font-semibold text-lg mb-6 text-center">
            ログイン
          </h1>

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="bg-transparent border-b border-gray-600 focus:border-white outline-none text-sm text-white py-1.5 transition-colors placeholder-gray-600"
                placeholder="example@email.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-zinc-400">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="bg-transparent border-b border-gray-600 focus:border-white outline-none text-sm text-white py-1.5 transition-colors placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-white text-black font-medium rounded-full py-2.5 text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          アカウントをお持ちでない方は{" "}
          <Link href="/register" className="text-zinc-300 hover:text-white underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
