import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import SidebarAwareLayout from "@/components/SidebarAwareLayout";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOGOS",
  description: "エビデンスに基づいた俯瞰的・建設的な議論プラットフォーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full flex flex-col bg-[#131314] text-white">
        <AuthProvider>
          <SidebarProvider>
            <Header />
            <Sidebar />
            <SidebarAwareLayout>
              {children}
            </SidebarAwareLayout>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
