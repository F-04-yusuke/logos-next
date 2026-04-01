// application-logo.blade.php の忠実移植
// 青の3D「L」SVG + LOGOS テキスト
export default function AppLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <svg
        viewBox="0 0 110 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-auto"
        aria-hidden="true"
      >
        <path d="M 15 30 L 30 15 H 55 L 40 30 Z" className="fill-blue-300" />
        <path d="M 40 65 L 55 50 H 95 L 80 65 Z" className="fill-blue-300" />
        <path d="M 15 30 H 40 V 65 H 80 V 90 H 15 Z" className="fill-blue-500" />
        <path d="M 40 30 L 55 15 V 50 L 40 65 Z" className="fill-blue-700" />
        <path d="M 80 65 L 95 50 V 75 L 80 90 Z" className="fill-blue-700" />
      </svg>
      <span className="text-lg font-black tracking-tight text-logos-text">LOGOS</span>
    </div>
  );
}
