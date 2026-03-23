import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
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

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} h-full antialiased dark`}
    >
      <body className="bg-[#131314] text-g-text">
        <AuthProvider>
          <SidebarProvider>
            <LayoutShell>{children}</LayoutShell>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
