"use client";

import { useSidebar } from "@/context/SidebarContext";

export default function SidebarAwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen } = useSidebar();

  return (
    <div
      className={[
        "flex-1 overflow-y-auto min-h-0",
        "transition-all duration-300 ease-in-out",
        // PC: サイドバー幅に合わせて左余白を付ける（スマホはサイドバーがfixedオーバーレイなので余白不要）
        sidebarOpen ? "md:ml-64" : "md:ml-16",
      ].join(" ")}
    >
      {children}
    </div>
  );
}
