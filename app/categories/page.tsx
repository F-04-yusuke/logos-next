"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAuthHeaders } from "@/lib/auth";

type Category = {
  id: number;
  name: string;
  sort_order: number;
  parent_id: number | null;
  children: Category[];
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

export default function CategoriesPage() {
  const { user, loading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);

  // Admin add form state
  const [addName, setAddName] = useState("");
  const [addSortOrder, setAddSortOrder] = useState(0);
  const [addParentId, setAddParentId] = useState<string>("");
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  // Admin edit state: { [id]: { name, sort_order } | null }
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [editError, setEditError] = useState("");

  // Status message
  const [statusMsg, setStatusMsg] = useState("");

  // カテゴリ一覧キャッシュクリア
  const [revalidating, setRevalidating] = useState(false);

  async function handleRevalidate() {
    setRevalidating(true);
    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { ...getAuthHeaders(), Accept: "application/json" },
      });
      if (res.ok) {
        setStatusMsg("カテゴリ一覧ページのキャッシュを更新しました");
      } else {
        const data = await res.json().catch(() => ({}));
        setStatusMsg(`キャッシュ更新に失敗しました（${res.status}: ${data.error ?? "不明"}）`);
      }
    } catch (e) {
      setStatusMsg(`キャッシュ更新に失敗しました（ネットワークエラー）`);
    } finally {
      setRevalidating(false);
    }
  }

  async function fetchCategories() {
    setFetching(true);
    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setCategories(data);
      }
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─── Admin handlers ───

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: addName,
          sort_order: addSortOrder,
          parent_id: addParentId === "" ? null : Number(addParentId),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.message ?? "追加に失敗しました");
        return;
      }
      setAddName("");
      setAddSortOrder(0);
      setAddParentId("");
      setStatusMsg("カテゴリを追加しました");
      await fetchCategories();
    } catch {
      setAddError("サーバーに接続できませんでした");
    } finally {
      setAddLoading(false);
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSortOrder(cat.sort_order);
    setEditError("");
  }

  async function handleSaveEdit(catId: number) {
    setEditError("");
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${catId}`, {
        method: "PATCH",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: editName, sort_order: editSortOrder }),
      });
      if (!res.ok) {
        const data = await res.json();
        setEditError(data.message ?? "更新に失敗しました");
        return;
      }
      setEditingId(null);
      setStatusMsg("カテゴリを更新しました");
      await fetchCategories();
    } catch {
      setEditError("サーバーに接続できませんでした");
    }
  }

  async function handleDelete(catId: number, hasChildren: boolean) {
    const msg = hasChildren
      ? "本当に削除しますか？紐づく中分類もすべて消えます！"
      : "削除しますか？";
    if (!confirm(msg)) return;
    try {
      const res = await fetch(`${BASE_URL}/api/categories/${catId}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders(), Accept: "application/json" },
      });
      if (!res.ok) {
        alert("削除に失敗しました");
        return;
      }
      setStatusMsg("カテゴリを削除しました");
      await fetchCategories();
    } catch {
      alert("サーバーに接続できませんでした");
    }
  }

  // ─── Loading states ───
  if (loading || fetching) {
    return (
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-7 bg-logos-hover rounded-md w-1/3 mb-2" />
            <div className="h-48 bg-logos-hover rounded-xl" />
            <div className="h-64 bg-logos-hover rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 非admin はアクセス不可
  if (!user || !user.is_admin) {
    return (
      <div className="flex justify-center items-center py-24">
        <p className="text-logos-sub text-sm">このページは管理者専用です。</p>
      </div>
    );
  }

  // ─── ADMIN VIEW ───
  return (
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

          <h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
            <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
            カテゴリ管理（大分類・中分類）
          </h1>

          {/* ステータスメッセージ */}
          {statusMsg && (
            <div className="p-4 text-sm font-bold text-green-400 rounded-lg bg-green-900/30 border border-green-800">
              {statusMsg}
            </div>
          )}

          {/* カテゴリ一覧ページ 即時反映ボタン */}
          <div className="flex items-center justify-between p-4 bg-logos-surface rounded-xl border border-logos-border">
            <div>
              <p className="text-sm font-bold text-logos-text">カテゴリ一覧ページを今すぐ反映</p>
              <p className="text-xs text-logos-sub mt-0.5">追加・変更後にクリックすると即時反映されます（通常は最大1時間後に自動反映）</p>
            </div>
            <button
              onClick={handleRevalidate}
              disabled={revalidating}
              className="shrink-0 ml-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-sm shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {revalidating ? "更新中..." : "今すぐ反映"}
            </button>
          </div>

          {/* 1. 新しいカテゴリの追加カード */}
          <div className="p-6 sm:p-8 bg-logos-surface shadow-sm sm:rounded-xl border border-logos-border">
            <header>
              <h2 className="font-bold text-logos-text text-base flex items-center gap-2">
                <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
                新しいカテゴリの追加
              </h2>
            </header>
            <form onSubmit={handleAdd} className="mt-6 space-y-6 max-w-xl">
              {addError && (
                <p className="text-red-400 text-sm">{addError}</p>
              )}
              <div>
                <label htmlFor="add-name" className="block text-base font-bold text-logos-text mb-1">カテゴリ名</label>
                <input
                  id="add-name"
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                  className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
                />
              </div>
              <div>
                <label htmlFor="add-sort" className="block text-base font-bold text-logos-text mb-1">表示順（数字が小さいほど上に表示されます）</label>
                <input
                  id="add-sort"
                  type="number"
                  value={addSortOrder}
                  onChange={(e) => setAddSortOrder(Number(e.target.value))}
                  required
                  className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
                />
              </div>
              <div>
                <label htmlFor="add-parent" className="block text-base font-bold text-logos-text mb-1">親カテゴリ（中分類にする場合のみ選択）</label>
                <select
                  id="add-parent"
                  value={addParentId}
                  onChange={(e) => setAddParentId(e.target.value)}
                  className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
                >
                  <option value="">-- なし（新しい大分類を作成する） --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {addLoading ? "追加中..." : "追加する"}
                </button>
              </div>
            </form>
          </div>

          {/* 2. 現在のカテゴリ一覧カード */}
          <div className="p-6 sm:p-8 bg-logos-surface shadow-sm sm:rounded-xl border border-logos-border">
            <header className="mb-6">
              <h2 className="font-bold text-logos-text text-base flex items-center gap-2">
                <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
                現在のカテゴリ一覧（数字で並び替え）
              </h2>
            </header>
            <div className="bg-logos-bg rounded-xl p-4 sm:p-6 border border-logos-border">
              {categories.length === 0 ? (
                <p className="text-base text-logos-sub text-center py-4">まだカテゴリが登録されていません。</p>
              ) : (
                <ul className="space-y-4">
                  {categories.map((cat) => (
                    <li key={cat.id} className="p-4 sm:p-5 bg-logos-surface rounded-lg shadow-sm border border-logos-border transition-colors">

                      {/* 大分類の表示 */}
                      {editingId !== cat.id ? (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div className="font-bold text-base sm:text-lg text-blue-400 flex items-center">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {cat.name}
                            <span className="text-[11px] sm:text-xs ml-3 px-2 py-1 rounded-md bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 shrink-0">
                              順序: {cat.sort_order}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="text-sm bg-logos-hover hover:bg-logos-elevated border border-logos-border text-logos-text py-1 px-3 rounded transition-colors duration-100 cursor-pointer"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.children.length > 0)}
                              className="text-sm bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 py-1 px-3 rounded transition-colors duration-100 cursor-pointer"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 大分類の編集フォーム */
                        <div className="mt-0 p-4 bg-logos-bg rounded-lg border border-logos-border">
                          {editError && <p className="text-red-400 text-xs mb-2">{editError}</p>}
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="rounded border border-logos-border bg-logos-surface text-logos-text text-sm py-1.5 px-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                              required
                            />
                            <input
                              type="number"
                              value={editSortOrder}
                              onChange={(e) => setEditSortOrder(Number(e.target.value))}
                              className="w-20 rounded border border-logos-border bg-logos-surface text-logos-text text-sm py-1.5 px-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                              title="表示順"
                            />
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-bold py-1.5 px-4 rounded transition-all cursor-pointer"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-sm font-bold text-logos-sub hover:text-logos-text px-2 py-1.5"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 中分類のリスト */}
                      {cat.children.length > 0 && (
                        <ul className="mt-4 sm:ml-7 space-y-2 border-l-2 border-logos-border pl-3 sm:pl-4">
                          {cat.children.map((child) => (
                            <li key={child.id} className="flex flex-col py-1">
                              {editingId !== child.id ? (
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full">
                                  <div className="text-base font-bold text-logos-text flex items-center">
                                    <svg aria-hidden="true" className="h-4 w-4 text-logos-sub mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {child.name}
                                    <span className="text-[11px] ml-3 px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 shrink-0">
                                      順序: {child.sort_order}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => startEdit(child)}
                                      className="text-xs bg-logos-hover hover:bg-logos-elevated border border-logos-border text-logos-text py-1 px-2 rounded transition-colors duration-100 cursor-pointer"
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={() => handleDelete(child.id, false)}
                                      className="text-xs bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 py-1 px-2 rounded transition-colors duration-100 cursor-pointer"
                                    >
                                      削除
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* 中分類の編集フォーム */
                                <div className="mt-2 p-3 bg-logos-bg rounded border border-logos-border">
                                  {editError && <p className="text-red-400 text-xs mb-2">{editError}</p>}
                                  <div className="flex flex-wrap items-center gap-2 w-full">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="rounded border border-logos-border bg-logos-surface text-logos-text text-xs py-1.5 px-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                      required
                                    />
                                    <input
                                      type="number"
                                      value={editSortOrder}
                                      onChange={(e) => setEditSortOrder(Number(e.target.value))}
                                      className="w-16 rounded border border-logos-border bg-logos-surface text-logos-text text-xs py-1.5 px-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                                      title="表示順"
                                    />
                                    <button
                                      onClick={() => handleSaveEdit(child.id)}
                                      className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-[11px] font-bold py-1.5 px-3 rounded transition-all cursor-pointer"
                                    >
                                      保存
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="text-[11px] font-bold text-logos-sub hover:text-logos-text px-2 py-1.5"
                                    >
                                      キャンセル
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>
    );
}
