"use client";

import { SharedPost } from "@/components/mypage/PostCard";

type Props = {
  editingDraft: SharedPost;
  editUrl: string;
  setEditUrl: (v: string) => void;
  editCategory: string;
  setEditCategory: (v: string) => void;
  editComment: string;
  setEditComment: (v: string) => void;
  editSubmitting: boolean;
  onClose: () => void;
  onSave: (isPublishing: boolean) => void;
};

export function DraftEditModal({
  editingDraft: _editingDraft,
  editUrl,
  setEditUrl,
  editCategory,
  setEditCategory,
  editComment,
  setEditComment,
  editSubmitting,
  onClose,
  onSave,
}: Props) {
  return (
    <div className="relative z-50" role="dialog" aria-modal="true" aria-labelledby="draft-edit-title">
      <div className="fixed inset-0 bg-black/60 dark:bg-black/80" onClick={onClose} />
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="relative bg-white dark:bg-logos-surface rounded-t-2xl sm:rounded-xl border-t sm:border border-gray-200 dark:border-gray-800 w-full sm:max-w-xl overflow-hidden shadow-2xl">
            {/* ヘッダー */}
            <div className="px-4 py-4 sm:px-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-logos-surface">
              <div>
                <h3 id="draft-edit-title" className="text-xl font-bold text-gray-900 dark:text-g-text">
                  下書きを編集
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">下書き保存中は他のユーザーには見えません。</p>
              </div>
              <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                下書き
              </span>
            </div>
            {/* フォーム */}
            <div className="p-4 sm:p-6 bg-white dark:bg-logos-bg space-y-5">
              <div>
                <label className="block text-base font-bold text-gray-700 dark:text-g-text mb-1.5">
                  参考URL (エビデンス)
                </label>
                <input
                  type="url"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-logos-surface dark:border-gray-700 dark:text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 dark:text-g-text mb-1.5">
                  メディア分類
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                  className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-logos-surface dark:border-gray-700 dark:text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2 cursor-pointer"
                >
                  <option value="">選択してください</option>
                  <option value="YouTube">YouTube</option>
                  <option value="X">X</option>
                  <option value="記事">記事</option>
                  <option value="知恵袋">知恵袋</option>
                  <option value="本">本</option>
                  <option value="その他">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-bold text-gray-700 dark:text-g-text mb-1.5">
                  コメント・引用部分の抜粋
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  className="w-full rounded-md bg-gray-50 border border-gray-300 dark:bg-logos-surface dark:border-gray-700 dark:text-white text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none px-3 py-2"
                />
              </div>
            </div>
            {/* フッター */}
            <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center gap-3 bg-gray-50 dark:bg-logos-surface">
              <button
                type="button"
                onClick={onClose}
                className="text-gray-600 dark:text-g-sub hover:text-gray-900 dark:hover:text-gray-200 font-bold py-2 px-3 rounded-md text-base transition-colors duration-100 cursor-pointer"
              >
                キャンセル
              </button>
              <div className="flex items-center gap-2">
                {/* 下書き保存のまま */}
                <button
                  type="button"
                  onClick={() => onSave(false)}
                  disabled={editSubmitting || !editUrl || !editCategory}
                  className="text-gray-600 dark:text-g-sub hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 font-bold py-2 px-4 rounded-md text-base transition-colors duration-100 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  下書き保存
                </button>
                {/* 本投稿する */}
                <button
                  type="button"
                  onClick={() => onSave(true)}
                  disabled={editSubmitting || !editUrl || !editCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-logos-text font-bold py-2 px-6 rounded-md text-base transition-colors duration-100 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  本投稿する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
