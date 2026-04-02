"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost"; // storage URL 用
const PROXY_BASE = "/api/proxy";

type ProfileData = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  is_pro: number | boolean;
  is_admin: number | boolean;
  name_updated_at: string | null;
};

function avatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `${API_BASE}/storage/${avatar}`;
}


// ===== Section 1: プロフィール情報 =====

function ProfileInfoSection({ profile, onSaved }: {
  profile: ProfileData;
  onSaved: (updated: Partial<ProfileData>) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [previewSrc, setPreviewSrc] = useState<string | null>(avatarUrl(profile.avatar));
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canChangeName = !profile.name_updated_at ||
    new Date(profile.name_updated_at).getTime() + 7 * 24 * 60 * 60 * 1000 < Date.now();

  const daysLeft = profile.name_updated_at
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(profile.name_updated_at).getTime()) / (24 * 60 * 60 * 1000)))
    : 0;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    const formData = new FormData();
    formData.append("email", email);
    if (canChangeName) formData.append("name", name);
    if (avatarFile) formData.append("avatar", avatarFile);

    try {
      const res = await fetch(`${PROXY_BASE}/profile`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        return;
      }
      setSuccess(true);
      setAvatarFile(null);
      onSaved(data.user);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setErrors({ _: ["通信エラーが発生しました"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <header>
        <h2 className="text-base sm:text-lg font-bold text-logos-text flex items-center gap-2">
          <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
          プロフィール情報
        </h2>
        <p className="mt-1 text-base text-logos-sub">
          プロフィール画像、アカウント名、メールアドレスを更新できます。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* アバター */}
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {previewSrc ? (
              <img
                src={previewSrc}
                alt="Avatar"
                className="h-16 w-16 object-cover rounded-full border border-logos-border"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-logos-hover flex items-center justify-center border border-logos-border">
                <svg aria-hidden="true" className="h-8 w-8 text-logos-sub" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <label htmlFor="avatar" className="block text-base font-bold text-logos-text mb-1">
              プロフィール画像
            </label>
            <input
              ref={fileInputRef}
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-logos-sub file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition-colors cursor-pointer"
            />
            {errors.avatar && <p className="mt-1 text-xs text-red-500">{errors.avatar[0]}</p>}
          </div>
        </div>

        {/* アカウント名 */}
        <div>
          <label htmlFor="name" className="block text-base font-bold text-logos-text mb-1">
            アカウント名
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!canChangeName}
            required
            autoComplete="name"
            className={`block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base ${
              !canChangeName ? "opacity-50 cursor-not-allowed bg-logos-hover" : ""
            }`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>}
          {!canChangeName ? (
            <p className="mt-2 text-xs font-bold text-red-500">
              ※アカウント名は前回の変更から7日間変更できません。（残り約{daysLeft}日）
            </p>
          ) : (
            <p className="mt-2 text-xs text-logos-sub">
              ※一度変更すると、その後7日間は再変更できなくなります。
            </p>
          )}
        </div>

        {/* メール */}
        <div>
          <label htmlFor="email" className="block text-base font-bold text-logos-text mb-1">
            Email（ログイン用）
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email[0]}</p>}
        </div>

        {errors._ && <p className="text-xs text-red-500">{errors._[0]}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
          {success && (
            <p className="text-sm text-logos-sub font-bold animate-fade-in">
              保存しました。
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

// ===== Section 2: パスワード更新 =====

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setSuccess(false);

    try {
      const res = await fetch(`${PROXY_BASE}/profile/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        return;
      }
      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setErrors({ _: ["通信エラーが発生しました"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <header>
        <h2 className="text-base sm:text-lg font-bold text-logos-text flex items-center gap-2">
          <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
          パスワードの更新
        </h2>
        <p className="mt-1 text-base text-logos-sub">
          アカウントのセキュリティを保つため、長くランダムなパスワードを使用してください。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="current_password" className="block text-base font-bold text-logos-text mb-1">
            現在のパスワード
          </label>
          <input
            id="current_password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
          />
          {errors.current_password && <p className="mt-1 text-xs text-red-500">{errors.current_password[0]}</p>}
        </div>

        <div>
          <label htmlFor="new_password" className="block text-base font-bold text-logos-text mb-1">
            新しいパスワード
          </label>
          <input
            id="new_password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="block text-base font-bold text-logos-text mb-1">
            新しいパスワード（確認用）
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            autoComplete="new-password"
            className="block w-full rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none px-3 py-2 text-base"
          />
          {errors.password_confirmation && <p className="mt-1 text-xs text-red-500">{errors.password_confirmation[0]}</p>}
        </div>

        {errors._ && <p className="text-xs text-red-500">{errors._[0]}</p>}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold py-2 px-6 rounded-full text-base shadow-sm hover:shadow-indigo-500/25 hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? "更新中..." : "保存する"}
          </button>
          {success && (
            <p className="text-sm text-logos-sub font-bold">保存しました。</p>
          )}
        </div>
      </form>
    </section>
  );
}

// ===== Section 3: アカウント削除 =====

function DeleteAccountSection() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleDelete(e: React.FormEvent) {
    e.preventDefault();
    setDeleting(true);
    setErrors({});

    try {
      const res = await fetch(`${PROXY_BASE}/profile`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        return;
      }
      // Cookie削除してログインへ
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch {
      setErrors({ _: ["通信エラーが発生しました"] });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-base sm:text-lg font-bold text-logos-text flex items-center gap-2">
          <span className="inline-block w-1 h-4 rounded-full bg-gradient-to-b from-red-400 to-red-600 flex-shrink-0" aria-hidden="true" />
          アカウントの削除
        </h2>
        <p className="mt-1 text-base text-logos-sub leading-relaxed">
          アカウントを削除すると、すべてのリソースとデータが完全に削除されます。<br />
          アカウントを削除する前に、保持しておきたいデータや情報をダウンロードしてください。
        </p>
      </header>

      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full text-base transition-colors shadow-sm cursor-pointer"
      >
        アカウントを削除
      </button>

      {/* モーダル */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-logos-surface rounded-xl shadow-xl w-full max-w-md mx-4">
            <form onSubmit={handleDelete} className="p-6">
              <h2 className="text-lg font-bold text-logos-text">
                本当にアカウントを削除しますか？
              </h2>
              <p className="mt-1 text-base text-logos-sub leading-relaxed">
                アカウントを削除すると、すべてのリソースとデータが完全に削除されます。<br />
                アカウントを完全に削除することを確認するため、パスワードを入力してください。
              </p>

              <div className="mt-6">
                <label htmlFor="delete_password" className="sr-only">パスワード</label>
                <input
                  id="delete_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワード"
                  required
                  className="block w-full sm:w-3/4 rounded-lg border border-logos-border bg-logos-surface text-logos-text focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none px-3 py-2 text-base"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password[0]}</p>}
                {errors._ && <p className="mt-1 text-xs text-red-500">{errors._[0]}</p>}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-logos-border pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setPassword(""); setErrors({}); }}
                  className="text-logos-sub hover:text-logos-text font-bold py-2 px-4 rounded-full text-sm transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-6 rounded-full text-sm transition-colors shadow-sm cursor-pointer"
                >
                  {deleting ? "削除中..." : "完全に削除する"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

// ===== Main =====

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refetch } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
      return;
    }
    if (!authLoading && user) {
      fetch(`${PROXY_BASE}/profile`)
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data: ProfileData) => setProfile(data))
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [authLoading, user]);

  function handleProfileSaved(updated: Partial<ProfileData>) {
    setProfile((prev) => prev ? { ...prev, ...updated } : prev);
    refetch(); // ヘッダーのアバターを即時更新
  }

  if (authLoading || fetching) {
    return (
      <div className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="animate-pulse">
            <div className="h-7 bg-logos-skeleton rounded-md w-1/4 mb-6" />
            <div className="h-48 bg-logos-skeleton-light rounded-xl mb-6" />
            <div className="h-48 bg-logos-skeleton-light rounded-xl mb-6" />
            <div className="h-32 bg-logos-skeleton-light rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        <h1 className="text-2xl font-bold text-logos-text flex items-center gap-2.5">
          <span className="inline-block w-1 h-6 rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 flex-shrink-0" aria-hidden="true" />
          プロフィール
        </h1>

        <div className="p-4 sm:p-8 bg-logos-surface shadow-sm sm:rounded-xl border border-logos-border">
          <div className="max-w-xl">
            <ProfileInfoSection profile={profile} onSaved={handleProfileSaved} />
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-logos-surface shadow-sm sm:rounded-xl border border-logos-border">
          <div className="max-w-xl">
            <PasswordSection />
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-logos-surface shadow-sm sm:rounded-xl border border-logos-border">
          <div className="max-w-xl">
            <DeleteAccountSection />
          </div>
        </div>

      </div>
    </div>
  );
}
