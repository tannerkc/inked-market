"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBuilder = pathname.startsWith("/dashboard/builder");

  if (isBuilder) {
    return <main>{children}</main>;
  }

  return (
    <main className="relative z-10 min-h-screen mb-[620px] sm:mb-[500px] md:mb-[420px] bg-[var(--background)] [transform:translate3d(0,0,0)] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
      {children}
    </main>
  );
}
