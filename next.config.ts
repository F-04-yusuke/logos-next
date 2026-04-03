import type { NextConfig } from "next";

// バックエンド画像ドメインを環境変数から動的取得（AWS移行時はenv変更のみで対応可）
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost";
let apiHostname = "localhost";
let apiProtocol: "http" | "https" = "http";
try {
  const parsed = new URL(apiBaseUrl);
  apiHostname = parsed.hostname;
  apiProtocol = parsed.protocol === "https:" ? "https" : "http";
} catch {
  // fallback to localhost
}

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: apiProtocol, hostname: apiHostname },
    ],
    // デフォルト [16,32,48,64,96,128,256,384] に Avatar の実寸 28/36/40px を追加
    imageSizes: [16, 28, 32, 36, 40, 48, 64, 96, 128, 256, 384],
    // 開発環境では localhost → 127.0.0.1 がプライベートIPとしてブロックされるため無効化
    // 本番（Vercel）では公開ドメインを使うため最適化を有効のまま維持
    unoptimized: isDev,
  },
};

export default nextConfig;
