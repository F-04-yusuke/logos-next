"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { setToken } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import AppLogo from "@/components/AppLogo";

export default function LoginPage() {
  const router = useRouter();
  const { refetch } = useAuth();
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";
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
    <main className="min-h-screen flex flex-col items-center justify-center pt-6 sm:pt-0 bg-[#131314] px-4">
      {/* ロゴ */}
      <div className="mb-4">
        <Link href="/" className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 inline-block">
          <span className="sr-only">LOGOSトップページへ戻る</span>
          <AppLogo />
        </Link>
      </div>

      {/* カード */}
      <div className="w-full sm:max-w-md mt-6 px-6 py-6 bg-[#1e1f20] shadow-md overflow-hidden sm:rounded-2xl border border-gray-800">

        {/* ─── メインビュー ─── */}
        {!showDevLogin && (
          <div>
            <h2 className="text-lg font-bold text-gray-100 mb-6">LOGOSを始める</h2>

            {/* eKYC ボタン群 */}
            <div className="space-y-3">
              {/* マイナンバーカード（coming soon） */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-[#1967D2] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="準備中"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                マイナンバーカードで続行
              </button>
              {/* 運転免許証（coming soon） */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-[#8C939D] hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="準備中"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                運転免許証で続行
              </button>
            </div>

            {/* 区切り線 */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-gray-700" />
              <span className="px-3 text-xs text-gray-400">または</span>
              <div className="flex-grow border-t border-gray-700" />
            </div>

            {/* SNS ボタン群 */}
            <div className="space-y-3">
              {/* Google（coming soon） */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-bold py-3 px-4 rounded-md transition-colors shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="準備中"
              >
                <svg aria-hidden="true" className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Googleで続行
              </button>
              {/* Apple（coming soon） */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="準備中"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.42 10.61A4.27 4.27 0 0017.5 7.1a4.34 4.34 0 00-3.37-1.8c-1.42-.14-2.82.83-3.56.83-.73 0-1.89-.8-3.05-.78-1.5.02-2.9.88-3.68 2.23-1.56 2.7-.4 6.7 1.13 8.91.75 1.08 1.63 2.29 2.8 2.24 1.13-.05 1.58-.73 2.94-.73 1.35 0 1.83.73 3.01.7 1.21-.02 1.98-1.12 2.7-2.2a9.07 9.07 0 001.23-2.5 4.14 4.14 0 01-2.23-3.4zM14.6 4.92c.62-.75 1.04-1.8.92-2.83-1.01.04-2.13.68-2.77 1.42-.57.65-1.06 1.73-.92 2.75 1.13.09 2.14-.59 2.77-1.34z"/>
                </svg>
                Appleで続行
              </button>
              {/* 電話番号（coming soon） */}
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-[#8C939D] hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-sm opacity-60 cursor-not-allowed"
                disabled
                title="準備中"
              >
                <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                電話番号で続行
              </button>
            </div>

            {/* 利用規約テキスト */}
            <p className="mt-5 text-[10px] text-gray-500 leading-relaxed text-left">
              ログインすることで、あなたはLOGOSの利用規約に同意し、当社のプライバシーポリシーを読み、それに同意したものとみなされます。
            </p>

            <div className="mt-4 flex justify-center gap-4 text-xs font-bold text-gray-400">
              <a href="#" className="hover:underline">利用規約</a>
              <a href="#" className="hover:underline">プライバシーポリシー</a>
            </div>

            {/* 開発用ログイン切り替えボタン */}
            <button
              onClick={() => setShowDevLogin(true)}
              className="mt-5 text-[10px] text-gray-400 hover:text-blue-500 transition-colors border-b border-gray-400 hover:border-blue-500 pb-0.5"
            >
              [開発用] メールアドレスでログイン（テスト環境）
            </button>
          </div>
        )}

        {/* ─── 開発用ログインビュー ─── */}
        {showDevLogin && (
          <div className="relative text-left">
            {/* 戻るボタン */}
            <button
              onClick={() => { setShowDevLogin(false); setError(""); }}
              className="absolute -top-2 right-0 text-gray-400 hover:text-gray-200 font-bold text-sm flex items-center gap-1"
            >
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              戻る
            </button>

            <h2 className="text-xl font-bold text-gray-100 mb-6 text-center mt-2">
              テスト環境ログイン
            </h2>

            {error && (
              <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block font-bold text-sm text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="username"
                  className="block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-5">
                <label htmlFor="password" className="block font-bold text-sm text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? "ログイン中..." : "ログイン"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
