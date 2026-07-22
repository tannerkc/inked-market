import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Production: Supabase Storage (user uploads)
      { protocol: "https", hostname: "*.supabase.co" },
      // Production: Google Business photos (seed pipeline)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "maps.googleapis.com" },
      // Mock data sources (remove once real data flows everywhere)
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "images.squarespace-cdn.com" },
      { protocol: "https", hostname: "choose901.com" },
      { protocol: "https", hostname: "www.format.com" },
      { protocol: "https", hostname: "www.glam.com" },
    ],
  },
};

export default nextConfig;
