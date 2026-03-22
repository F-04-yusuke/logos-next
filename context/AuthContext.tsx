"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";
import useSWR from "swr";
import { getToken, removeToken, getAuthHeaders } from "@/lib/auth";
import { transformUser } from "@/lib/transforms";

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
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  refetch: async () => {},
});

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";

async function fetchUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${baseUrl}/api/user/me`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) return transformUser(await res.json()) as AuthUser;
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

  const logout = useCallback(() => {
    removeToken();
    mutate(null, { revalidate: false }); // キャッシュを即クリア・再フェッチなし
  }, [mutate]);

  const refetch = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return (
    <AuthContext.Provider
      value={{ user: user ?? null, loading: isLoading, logout, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
