export default function AppLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Λ バッジ — λόγος の語源 Greek lambda、shadow なし */}
      <svg
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 flex-shrink-0"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lgBadge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <circle cx="14" cy="14" r="13" fill="url(#lgBadge)" />
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

      {/* LOGOS ワードマーク — 単色・tracking-tight */}
      <span className="text-[17px] font-black tracking-tight text-logos-text select-none">
        LOGOS
      </span>
    </div>
  );
}
