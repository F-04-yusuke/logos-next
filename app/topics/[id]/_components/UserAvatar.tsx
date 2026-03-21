"use client";

export function UserAvatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes: Record<string, { outer: string; inner: string }> = {
    sm: { outer: "h-7 w-7", inner: "h-4 w-4" },
    md: { outer: "h-8 w-8", inner: "h-5 w-5" },
    lg: { outer: "h-10 w-10", inner: "h-6 w-6" },
  };
  const { outer, inner } = sizes[size];
  return (
    <div
      className={`${outer} rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700`}
    >
      <svg
        aria-hidden="true"
        className={`${inner} text-gray-400`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </div>
  );
}
