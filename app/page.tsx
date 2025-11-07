"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Permanent_Marker } from "next/font/google";

const permanentMarker = Permanent_Marker({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen flex items-center justify-center overflow-hidden pt-22">
        {/* Scattered Tattoo Decorations with Parallax */}

        {/* Top Left - Bird */}
        <div
          className="absolute top-12 left-12 opacity-30"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <img src="/tattoos/bird-svgrepo-com.svg" alt="Bird" width="80" height="80" className="text-indigo-400" />
        </div>

        {/* Top Right - Bird of Paradise */}
        <div
          className="absolute top-24 right-24 opacity-25"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        >
          <img src="/tattoos/bird-of-paradise-svgrepo-com.svg" alt="Bird of Paradise" width="70" height="80" />
        </div>

        {/* Top Center - Paper Airplane */}
        <div
          className="absolute top-32 left-1/3 opacity-20"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <img src="/tattoos/paper-airplane-svgrepo-com.svg" alt="Paper Airplane" width="60" height="60" />
        </div>

        {/* Right Middle - Skull */}
        <div
          className="absolute right-16 top-1/3 opacity-30"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <img src="/tattoos/skull-emoji-smiley-svgrepo-com.svg" alt="Skull" width="60" height="70" />
        </div>

        {/* Bottom Left - Ghost */}
        <div
          className="absolute bottom-32 left-24 opacity-25"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        >
          <img src="/tattoos/ghost-svgrepo-com.svg" alt="Ghost" width="60" height="70" />
        </div>

        {/* Bottom Right - Balloon Dog */}
        <div
          className="absolute bottom-40 right-32 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        >
          <img src="/tattoos/balloon-dog-svgrepo-com.svg" alt="Balloon Dog" width="70" height="60" />
        </div>

        {/* Left Middle - Alien */}
        <div
          className="absolute left-20 top-1/2 opacity-25"
          style={{ transform: `translateY(${scrollY * 0.18}px)` }}
        >
          <img src="/tattoos/alien-svgrepo-com.svg" alt="Alien" width="60" height="70" />
        </div>

        {/* Top Right Corner - Butterfly */}
        <div
          className="absolute top-16 right-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * 0.22}px)` }}
        >
          <img src="/tattoos/butterfly-svgrepo-com.svg" alt="Butterfly" width="70" height="60" />
        </div>

        {/* Bottom Center - Matchstick Cross */}
        <div
          className="absolute bottom-20 left-1/2 opacity-25"
          style={{ transform: `translateY(${scrollY * -0.12}px)` }}
        >
          <img src="/tattoos/matchstick-cross-svgrepo-com.svg" alt="Matchstick Cross" width="60" height="60" />
        </div>

        {/* Right Bottom - Playing Cards */}
        <div
          className="absolute bottom-24 right-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.18}px)` }}
        >
          <img src="/tattoos/cards-svgrepo-com.svg" alt="Playing Cards" width="60" height="70" />
        </div>

        {/* Left Bottom - Mushroom */}
        <div
          className="absolute bottom-1/3 left-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        >
          <img src="/tattoos/mushroom-svgrepo-com.svg" alt="Mushroom" width="60" height="60" />
        </div>

        {/* Center Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Coming Soon
              </span>
            </div>
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight ${permanentMarker.className}`}>
              Discover Your Next
              <span className="text-indigo-600"> Tattoo Artist</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Connect with talented tattoo artists and professional studios.
              Browse portfolios, read reviews, and book your next piece of art.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild>
                <Link href="/discover">Explore Artists</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-gray-900">10K+</p>
                <p className="text-sm text-gray-600">Artists</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div>
                <p className="text-3xl font-bold text-gray-900">5K+</p>
                <p className="text-sm text-gray-600">Studios</p>
              </div>
              <div className="w-px h-12 bg-gray-300" />
              <div>
                <p className="text-3xl font-bold text-gray-900">50K+</p>
                <p className="text-sm font-bold text-gray-600">Designs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Find Your Perfect Artist
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform connects you with verified tattoo professionals and
              makes booking your next tattoo simple and secure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="relative p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Discover Artists
              </h3>
              <p className="text-gray-600">
                Browse thousands of verified tattoo artists and studios. Filter
                by style, location, and specialties.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Portfolio Reviews
              </h3>
              <p className="text-gray-600">
                View detailed portfolios with high-quality images and read
                authentic reviews from real customers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-8 bg-gradient-to-br from-pink-50 to-white rounded-2xl border border-pink-100">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Verified Professionals
              </h3>
              <p className="text-gray-600">
                All artists and studios are verified for your safety and peace
                of mind. Quality guaranteed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="relative p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Direct Messaging
              </h3>
              <p className="text-gray-600">
                Chat directly with artists to discuss your ideas, pricing, and
                availability. No middleman.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="relative p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Save Favorites
              </h3>
              <p className="text-gray-600">
                Bookmark your favorite artists, shops, and designs. Build your
                inspiration collection.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="relative p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100">
              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Artist Analytics
              </h3>
              <p className="text-gray-600">
                Artists get powerful tools to manage their portfolio, track
                bookings, and grow their business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of artists and clients who trust Inked Market for
              their tattoo journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/discover">Browse Artists</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-indigo-600"
              >
                List Your Studio
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
