"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type SidebarContextType = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  bookmarkRefreshKey: number;
  triggerBookmarkRefresh: () => void;
  proModalOpen: boolean;
  proModalFeature: string;
  openProModal: (feature?: string) => void;
  closeProModal: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  sidebarOpen: false,
  setSidebarOpen: () => {},
  bookmarkRefreshKey: 0,
  triggerBookmarkRefresh: () => {},
  proModalOpen: false,
  proModalFeature: "分析ツール",
  openProModal: () => {},
  closeProModal: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookmarkRefreshKey, setBookmarkRefreshKey] = useState(0);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalFeature, setProModalFeature] = useState("分析ツール");

  const triggerBookmarkRefresh = useCallback(() => {
    setBookmarkRefreshKey((k) => k + 1);
  }, []);

  const openProModal = useCallback((feature = "分析ツール") => {
    setProModalFeature(feature);
    setProModalOpen(true);
  }, []);

  const closeProModal = useCallback(() => {
    setProModalOpen(false);
  }, []);

  return (
    <SidebarContext.Provider value={{
      sidebarOpen, setSidebarOpen,
      bookmarkRefreshKey, triggerBookmarkRefresh,
      proModalOpen, proModalFeature, openProModal, closeProModal,
    }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
