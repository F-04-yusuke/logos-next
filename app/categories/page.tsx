"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
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
      <div className="flex justify-center items-center py-24">
        <p className="text-gray-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  // ─── ADMIN VIEW ───
  if (!!user?.is_admin) {
    return (
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

          <h2 className="font-bold text-xl text-gray-200 leading-tight">
            カテゴリ管理（大分類・中分類）
          </h2>

          {/* ステータスメッセージ */}
          {statusMsg && (
            <div className="p-4 text-sm font-bold text-green-400 rounded-lg bg-green-900/30 border border-green-800">
              {statusMsg}
            </div>
          )}

          {/* 1. 新しいカテゴリの追加カード */}
          <div className="p-6 sm:p-8 bg-[#1e1f20] shadow-sm sm:rounded-xl border border-gray-800">
            <header>
              <h2 className="text-lg font-bold text-gray-100 border-b border-gray-800 pb-3">新しいカテゴリの追加</h2>
            </header>
            <form onSubmit={handleAdd} className="mt-6 space-y-6 max-w-xl">
              {addError && (
                <p className="text-red-400 text-sm">{addError}</p>
              )}
              <div>
                <label htmlFor="add-name" className="block text-sm font-bold text-gray-300 mb-1.5">カテゴリ名</label>
                <input
                  id="add-name"
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  required
                  className="block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="add-sort" className="block text-sm font-bold text-gray-300 mb-1.5">表示順（数字が小さいほど上に表示されます）</label>
                <input
                  id="add-sort"
                  type="number"
                  value={addSortOrder}
                  onChange={(e) => setAddSortOrder(Number(e.target.value))}
                  required
                  className="block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="add-parent" className="block text-sm font-bold text-gray-300 mb-1.5">親カテゴリ（中分類にする場合のみ選択）</label>
                <select
                  id="add-parent"
                  value={addParentId}
                  onChange={(e) => setAddParentId(e.target.value)}
                  className="block w-full rounded-md border border-gray-700 bg-[#131314] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 text-sm shadow-sm"
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-md transition-colors shadow-sm disabled:opacity-50"
                >
                  {addLoading ? "追加中..." : "追加する"}
                </button>
              </div>
            </form>
          </div>

          {/* 2. 現在のカテゴリ一覧カード */}
          <div className="p-6 sm:p-8 bg-[#1e1f20] shadow-sm sm:rounded-xl border border-gray-800">
            <header className="mb-6">
              <h2 className="text-lg font-bold text-gray-100 border-b border-gray-800 pb-3">現在のカテゴリ一覧（数字で並び替え）</h2>
            </header>
            <div className="bg-[#131314] rounded-xl p-4 sm:p-6 border border-gray-800">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">まだカテゴリが登録されていません。</p>
              ) : (
                <ul className="space-y-4">
                  {categories.map((cat) => (
                    <li key={cat.id} className="p-4 sm:p-5 bg-[#1e1f20] rounded-lg shadow-sm border border-gray-700 transition-colors">

                      {/* 大分類の表示 */}
                      {editingId !== cat.id ? (
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div className="font-bold text-base sm:text-lg text-blue-400 flex items-center">
                            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {cat.name}
                            <span className="text-[11px] sm:text-xs font-medium ml-3 px-2 py-1 rounded-md bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 shrink-0">
                              順序: {cat.sort_order}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(cat)}
                              className="text-sm bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 py-1 px-3 rounded transition-colors"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id, cat.children.length > 0)}
                              className="text-sm bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 py-1 px-3 rounded transition-colors"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* 大分類の編集フォーム */
                        <div className="mt-0 p-4 bg-[#131314] rounded-lg border border-gray-800">
                          {editError && <p className="text-red-400 text-xs mb-2">{editError}</p>}
                          <div className="flex flex-wrap items-center gap-3">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="rounded border border-gray-700 bg-[#1e1f20] text-white text-sm py-1.5 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              required
                            />
                            <input
                              type="number"
                              value={editSortOrder}
                              onChange={(e) => setEditSortOrder(Number(e.target.value))}
                              className="w-20 rounded border border-gray-700 bg-[#1e1f20] text-white text-sm py-1.5 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                              title="表示順"
                            />
                            <button
                              onClick={() => handleSaveEdit(cat.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded transition-colors"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-sm font-bold text-gray-500 hover:text-gray-300 px-2 py-1.5"
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 中分類のリスト */}
                      {cat.children.length > 0 && (
                        <ul className="mt-4 sm:ml-7 space-y-2 border-l-2 border-gray-800 pl-3 sm:pl-4">
                          {cat.children.map((child) => (
                            <li key={child.id} className="flex flex-col py-1">
                              {editingId !== child.id ? (
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 w-full">
                                  <div className="text-sm font-bold text-gray-300 flex items-center">
                                    <svg aria-hidden="true" className="h-4 w-4 text-gray-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {child.name}
                                    <span className="text-[11px] font-medium ml-3 px-1.5 py-0.5 rounded bg-emerald-900/30 text-emerald-400 border border-emerald-800/50 shrink-0">
                                      順序: {child.sort_order}
                                    </span>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => startEdit(child)}
                                      className="text-xs bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 py-1 px-2 rounded transition-colors"
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={() => handleDelete(child.id, false)}
                                      className="text-xs bg-red-900/40 hover:bg-red-900/60 border border-red-800 text-red-400 py-1 px-2 rounded transition-colors"
                                    >
                                      削除
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* 中分類の編集フォーム */
                                <div className="mt-2 p-3 bg-[#131314] rounded border border-gray-800">
                                  {editError && <p className="text-red-400 text-xs mb-2">{editError}</p>}
                                  <div className="flex flex-wrap items-center gap-2 w-full">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="rounded border border-gray-700 bg-[#1e1f20] text-white text-xs py-1.5 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                      required
                                    />
                                    <input
                                      type="number"
                                      value={editSortOrder}
                                      onChange={(e) => setEditSortOrder(Number(e.target.value))}
                                      className="w-16 rounded border border-gray-700 bg-[#1e1f20] text-white text-xs py-1.5 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                                      title="表示順"
                                    />
                                    <button
                                      onClick={() => handleSaveEdit(child.id)}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold py-1.5 px-3 rounded transition-colors"
                                    >
                                      保存
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="text-[11px] font-bold text-gray-500 hover:text-gray-300 px-2 py-1.5"
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

  // ─── PUBLIC LIST VIEW ───
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 sm:mb-8">
          <p className="text-sm text-gray-400">
            興味のあるカテゴリを選択すると、関連するトピックを絞り込んで表示します。
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-800 rounded-xl bg-[#131314]/50 text-center">
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-gray-400 font-bold mb-1">カテゴリがありません</p>
            <p className="text-xs text-gray-500">現在、登録されているカテゴリはまだありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {categories.map((parent) => (
              <div
                key={parent.id}
                className="bg-[#1e1f20] shadow-sm rounded-xl border border-gray-800 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* 大分類ヘッダー */}
                <div className="bg-[#131314] border-b border-gray-800 px-4 sm:px-5 py-4">
                  <Link
                    href={`/?category=${parent.id}`}
                    className="flex items-center group"
                  >
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-500 mr-3 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <h3 className="font-bold text-base sm:text-lg text-gray-100 group-hover:text-blue-500 transition-colors line-clamp-1">
                      {parent.name}
                    </h3>
                  </Link>
                </div>

                {/* 中分類リスト */}
                <div className="p-2 sm:p-3">
                  {parent.children.length > 0 ? (
                    <ul className="space-y-1">
                      {parent.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/?category=${child.id}`}
                            className="flex items-center px-3 py-2.5 sm:py-2 rounded-lg text-sm text-gray-300 hover:bg-[#222222] hover:text-blue-400 transition-colors group"
                          >
                            <svg aria-hidden="true" className="h-4 w-4 text-gray-600 group-hover:text-blue-400 mr-2 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            <span className="truncate">{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-gray-500 italic px-3 py-2">中分類はありません</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
