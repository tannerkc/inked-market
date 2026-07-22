import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata("Sign In", "Sign in to Inked Market. Discover tattoo artists, browse portfolios, and book your next piece.");

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
