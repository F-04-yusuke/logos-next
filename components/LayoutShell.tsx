"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SidebarAwareLayout from "./SidebarAwareLayout";
import MobileBottomNav from "./MobileBottomNav";
import { ProModal } from "./ProModal";
import { TooltipProvider } from "@/components/ui/tooltip";

const AUTH_PATHS = ["/login", "/register"];

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (AUTH_PATHS.includes(pathname)) {
    return <TooltipProvider delay={500}>{children}</TooltipProvider>;
  }

  return (
    <TooltipProvider delay={500}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <SidebarAwareLayout>{children}</SidebarAwareLayout>
        </div>
        <ProModal />
        <MobileBottomNav />
      </div>
    </TooltipProvider>
  );
}
