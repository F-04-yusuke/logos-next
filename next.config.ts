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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: apiProtocol, hostname: apiHostname },
    ],
  },
};

export default nextConfig;
