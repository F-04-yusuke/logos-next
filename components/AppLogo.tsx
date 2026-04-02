export default function AppLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Λ バッジ — λόγος（ロゴス）の語源 Greek lambda を円形バッジに */}
      <svg
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7 flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lgBadge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <filter id="lgBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#4338ca" floodOpacity="0.5" />
          </filter>
        </defs>
        {/* グラデーション円形バッジ */}
        <circle cx="14" cy="14" r="13" fill="url(#lgBadge)" filter="url(#lgBadgeShadow)" />
        {/* Λ (Lambda) — 内側は白、ストロークでクリーンに */}
        <polyline
          points="7.5,21.5 14,6.5 20.5,21.5"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        />
      </svg>

      {/* LOGOS ワードマーク — バッジと同軸グラデーション */}
      <span
        className="text-[17px] font-black tracking-[0.1em] select-none"
        style={{
          background: "linear-gradient(135deg, #60a5fa 0%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        LOGOS
      </span>
    </div>
  );
}
