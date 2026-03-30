export default function SidebarAwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 pb-14 sm:pb-0">
      {children}
    </div>
  );
}
