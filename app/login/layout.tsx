import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Inked Market",
  description:
    "Sign in to Inked Market. Discover tattoo artists, browse portfolios, and book your next piece.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
