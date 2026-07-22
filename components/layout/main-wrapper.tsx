"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Standalone, chrome-free routes: the builder and public studio sites render
  // their own nav/footer, so the app shell is suppressed.
  const isStandalone =
    pathname.startsWith("/dashboard/builder") ||
    pathname.startsWith("/studios/");

  if (isStandalone) {
    return <main>{children}</main>;
  }

  return (
    <main className="relative z-10 min-h-screen mb-[620px] sm:mb-[500px] md:mb-[420px] bg-[var(--background)] [transform:translate3d(0,0,0)] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      {children}
    </main>
  );
}
