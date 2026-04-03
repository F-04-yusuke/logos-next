"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import useSWR from "swr";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  is_pro: boolean;
  is_admin: boolean;
  avatar?: string | null;
  unread_notifications_count?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  logout: () => void;
  refetch: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refetch: async () => {},
  updateUser: () => {},
});

/** httpOnly Cookie経由でユーザー情報を取得（トークンはサーバー側で処理） */
async function fetchUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (res.ok) return res.json();
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading, mutate } = useSWR("auth-user", fetchUser, {
    revalidateOnFocus: true,   // タブ復帰時に通知数を自動更新
    shouldRetryOnError: false, // 401/403 はリトライしない
  });

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    mutate(null, { revalidate: false }); // キャッシュを即クリア
  }, [mutate]);

  const refetch = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    mutate((prev) => prev ? { ...prev, ...partial } : prev, { revalidate: false });
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, loading: isLoading, logout, refetch, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
