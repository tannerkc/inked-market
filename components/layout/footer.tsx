"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { FilmGrainOverlay } from "@/components/ui/film-grain";
import { Divider } from "@/components/ui/divider";

const footerSections = [
  {
    label: "Platform",
    links: [
      { label: "Discover", href: "/discover" },
      { label: "How It Works", href: "#" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    label: "For Artists",
    links: [
      { label: "List Your Studio", href: "#" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Resources", href: "#" },
    ],
  },
  // {
  //   label: "Company",
  //   links: [
  //     { label: "About", href: "#" },
  //     { label: "Blog", href: "#" },
  //     { label: "Careers", href: "#" },
  //   ],
  // },
  {
    label: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/help/contact" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Terms of Service", href: "/legal/terms" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/builder")) return null;

  return (
    <footer className="fixed inset-0 -z-10 bg-ink-black overflow-hidden flex flex-col justify-end">
      <FilmGrainOverlay />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Faded tattoo watermark — hidden on mobile */}
        <div className="hidden md:block absolute right-12 top-8 text-[120px] opacity-[0.02] text-ink-cream rotate-12 pointer-events-none select-none">
          &#9760;
        </div>
        <Divider variant="dark" />

        {/* Link grid */}
        <div className="py-8 lg:py-16">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
            {footerSections.map((section) => (
              <div
                key={section.label}
                className="group relative p-3 md:p-4 rounded-xl transition-all duration-300 hover:bg-ink-cream/[0.03] hover:border hover:border-ink-cream/[0.06] border border-transparent"
              >
                <h3 className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-cream/25 mb-3 md:mb-4 transition-colors duration-300 group-hover:text-ink-cream/40">
                  {section.label}
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="relative text-sm text-ink-cream/35 transition-colors duration-300 group-hover:text-ink-cream/55 hover:text-ink-cream/80 after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-full after:bg-ink-red after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Divider variant="dark" />

        {/* Bottom bar */}
        <div className="py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink-cream/15">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {[
              { label: "Instagram", icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />, size: "w-4 h-4" },
              { label: "X", icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />, size: "w-3.5 h-3.5" },
              { label: "TikTok", icon: <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.48a8.27 8.27 0 004.76 1.5v-3.4a4.85 4.85 0 01-1-.89z" />, size: "w-3.5 h-3.5" },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                className="w-8 h-8 rounded-lg border border-ink-cream/[0.06] flex items-center justify-center text-ink-cream/25 hover:text-ink-cream/60 hover:border-ink-cream/15 hover:bg-ink-cream/[0.03] transition-all duration-300"
                aria-label={social.label}
              >
                <svg className={social.size} fill="currentColor" viewBox="0 0 24 24">
                  {social.icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
