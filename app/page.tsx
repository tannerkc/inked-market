"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Scattered Tattoo Decorations with Parallax */}

        {/* Top Left - Bird */}
        <div
          className="absolute top-12 left-12 opacity-30"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <svg width="80" height="60" viewBox="0 0 80 60" fill="none" stroke="currentColor" className="text-indigo-400">
            <path d="M 10 35 Q 20 20, 40 30 Q 60 20, 70 35" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 40 30 L 40 45" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="35" cy="28" r="1.5" fill="currentColor" />
            <path d="M 30 20 Q 35 15, 40 18" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top Right - Bird of Paradise */}
        <div
          className="absolute top-24 right-24 opacity-25"
          style={{ transform: `translateY(${scrollY * 0.25}px)` }}
        >
          <svg viewBox="0 0 72 72" id="emoji" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g id="color"> <path fill="#D22F27" d="M59.5568,52.3009c0.0023-0.0038,0.0034-0.008,0.0058-0.0118c0.0024-0.004,0.0038-0.0086,0.0063-0.0126 c0.3557-0.5929,0.3272-1.306-0.0084-1.8614c-2.3758-5.3476-2.4708-10.5429-2.5386-14.7272 c-0.0692-4.2642-0.1243-7.6324-2.4436-9.7216c-1.5084-1.3593-3.6639-1.866-6.7806-1.5912 c-2.0898,0.1883-2.3516,0.4517-3.3919-0.1941s-0.9204-0.9973-1.6799-2.9566c-1.1463-2.9441-2.5625-4.6637-4.4577-5.4131 c-2.8893-1.1421-5.9077,0.3033-9.7293,2.1327c-3.7707,1.8059-8.4563,4.0366-14.325,4.2904 c-0.6841-0.0849-1.3929,0.1982-1.7732,0.8108c-0.5718,0.921-0.1461,2.0778,0.599,2.5454c0.4679,0.6741,0.9501,3.2438,1.3393,5.3361 c1.2839,6.8908,3.2244,17.3045,11.7939,22.6244s18.7632,2.4391,25.5084,0.5326c2.0479-0.5794,4.5646-1.2873,5.3764-1.167 C57.9286,53.4516,59.0552,53.1087,59.5568,52.3009z"></path> <path fill="#FFFFFF" d="M38.3683,33.7525c0,0-1.0207-2.2751-2.3856-3.1224c-1.522-0.9448-2.7501-0.6102-4.5924,0.0536 c-1.2572,0.4516-2.6185,0.9414-4.2992,0.7309c-0.5597-0.0701-0.8772,0.6307-0.4723,1.0234 c3.4626,3.3568,5.1926,7.5546,5.8325,9.4125c0.0932,0.2708,0.2895,0.502,0.4996,0.6284c0.2065,0.1323,0.5008,0.2056,0.7848,0.169 c1.949-0.2507,6.4785-0.5625,11.023,1.0515c0.5316,0.1887,1.0188-0.4068,0.7077-0.8773c-0.9343-1.4129-1.0992-2.8502-1.2522-4.1772 c-0.2224-1.9456-0.4673-3.1946-1.9893-4.1395C40.86,33.658,38.3683,33.7525,38.3683,33.7525z"></path> </g> <g id="hair"></g> <g id="skin"></g> <g id="skin-shadow"></g> <g id="line"> <path fill="none" stroke="#000000" stroke-miterlimit="10" stroke-width="2" d="M59.5568,52.3009 c0.0023-0.0038,0.0034-0.008,0.0058-0.0118c0.0024-0.004,0.0038-0.0086,0.0063-0.0126c0.3557-0.5929,0.3272-1.306-0.0084-1.8614 c-2.3758-5.3476-2.4708-10.5429-2.5386-14.7272c-0.0692-4.2642-0.1243-7.6324-2.4436-9.7216 c-1.5084-1.3593-3.6639-1.866-6.7806-1.5912c-2.0898,0.1883-2.3516,0.4517-3.3919-0.1941s-0.9204-0.9973-1.6799-2.9566 c-1.1463-2.9441-2.5625-4.6637-4.4577-5.4131c-2.8893-1.1421-5.9077,0.3033-9.7293,2.1327 c-3.7707,1.8059-8.4563,4.0366-14.325,4.2904c-0.6841-0.0849-1.3929,0.1982-1.7732,0.8108 c-0.5718,0.921-0.1461,2.0778,0.599,2.5454c0.4679,0.6741,0.9501,3.2438,1.3393,5.3361 c1.2839,6.8908,3.2244,17.3045,11.7939,22.6244s18.7632,2.4391,25.5084,0.5326c2.0479-0.5794,4.5646-1.2873,5.3764-1.167 C57.9286,53.4516,59.0552,53.1087,59.5568,52.3009z"></path> <path fill="none" stroke="#000000" stroke-miterlimit="10" stroke-width="2" d="M38.3683,33.7525c0,0-1.0207-2.2751-2.3856-3.1224 c-1.522-0.9448-2.7501-0.6102-4.5924,0.0536c-1.2572,0.4516-2.6185,0.9414-4.2992,0.7309 c-0.5597-0.0701-0.8772,0.6307-0.4723,1.0234c3.4626,3.3568,5.1926,7.5546,5.8325,9.4125c0.0932,0.2708,0.2895,0.502,0.4996,0.6284 c0.2065,0.1323,0.5008,0.2056,0.7848,0.169c1.949-0.2507,6.4785-0.5625,11.023,1.0515c0.5316,0.1887,1.0188-0.4068,0.7077-0.8773 c-0.9343-1.4129-1.0992-2.8502-1.2522-4.1772c-0.2224-1.9456-0.4673-3.1946-1.9893-4.1395 C40.86,33.658,38.3683,33.7525,38.3683,33.7525z"></path> </g> </g></svg>
        </div>

        {/* Top Center - Paper Airplane */}
        <div
          className="absolute top-32 left-1/3 opacity-20"
          style={{ transform: `translateY(${scrollY * 0.2}px)` }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" className="text-pink-400">
            <path d="M 10 50 L 50 10 L 30 28 L 10 50 Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 50 10 L 30 28 L 32 48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="30" y1="28" x2="20" y2="38" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Right Middle - Skull */}
        <div
          className="absolute right-16 top-1/3 opacity-30"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        >
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" stroke="currentColor" className="text-gray-400">
            <ellipse cx="30" cy="28" rx="18" ry="20" strokeWidth="1.5" />
            <circle cx="22" cy="25" r="4" strokeWidth="1.5" />
            <circle cx="38" cy="25" r="4" strokeWidth="1.5" />
            <path d="M 26 35 L 26 38 M 30 35 L 30 38 M 34 35 L 34 38" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 20 48 L 20 58 L 26 58 L 26 48" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 34 48 L 34 58 L 40 58 L 40 48" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 22 42 Q 30 45, 38 42" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Left - Ghost */}
        <div
          className="absolute bottom-32 left-24 opacity-25"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        >
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" stroke="currentColor" className="text-indigo-400">
            <path d="M 15 25 Q 15 10, 30 10 Q 45 10, 45 25 L 45 60 L 40 55 L 35 60 L 30 55 L 25 60 L 20 55 L 15 60 Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="23" cy="25" r="2" fill="currentColor" />
            <circle cx="37" cy="25" r="2" fill="currentColor" />
            <path d="M 25 32 Q 30 35, 35 32" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Right - Balloon Dog */}
        <div
          className="absolute bottom-40 right-32 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.15}px)` }}
        >
          <svg width="70" height="60" viewBox="0 0 70 60" fill="none" stroke="currentColor" className="text-purple-400">
            <circle cx="15" cy="20" r="8" strokeWidth="1.5" />
            <circle cx="35" cy="15" r="7" strokeWidth="1.5" />
            <ellipse cx="28" cy="35" rx="12" ry="10" strokeWidth="1.5" />
            <circle cx="50" cy="25" r="6" strokeWidth="1.5" />
            <line x1="20" y1="45" x2="20" y2="55" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="36" y1="45" x2="36" y2="55" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 40 35 Q 48 35, 50 30" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Left Middle - Alien */}
        <div
          className="absolute left-20 top-1/2 opacity-25"
          style={{ transform: `translateY(${scrollY * 0.18}px)` }}
        >
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" stroke="currentColor" className="text-green-400">
            <ellipse cx="30" cy="30" rx="20" ry="25" strokeWidth="1.5" />
            <ellipse cx="22" cy="28" rx="6" ry="9" strokeWidth="1.5" />
            <ellipse cx="38" cy="28" rx="6" ry="9" strokeWidth="1.5" />
            <circle cx="22" cy="28" r="3" fill="currentColor" />
            <circle cx="38" cy="28" r="3" fill="currentColor" />
            <line x1="30" y1="35" x2="30" y2="40" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 25 45 L 35 45" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 12 50 Q 15 58, 20 62" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 48 50 Q 45 58, 40 62" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Top Right Corner - Butterfly */}
        <div
          className="absolute top-16 right-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * 0.22}px)` }}
        >
          <svg width="70" height="60" viewBox="0 0 70 60" fill="none" stroke="currentColor" className="text-pink-500">
            <path d="M 35 15 Q 25 10, 18 18 Q 15 25, 20 32 Q 25 35, 35 30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 35 15 Q 45 10, 52 18 Q 55 25, 50 32 Q 45 35, 35 30" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 35 30 Q 30 35, 28 42 Q 28 48, 35 50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 35 30 Q 40 35, 42 42 Q 42 48, 35 50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="35" y1="10" x2="35" y2="50" strokeWidth="1.5" />
            <line x1="35" y1="8" x2="32" y2="3" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="35" y1="8" x2="38" y2="3" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Bottom Center - Matchstick Cross */}
        <div
          className="absolute bottom-20 left-1/2 opacity-25"
          style={{ transform: `translateY(${scrollY * -0.12}px)` }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" className="text-orange-400">
            <line x1="15" y1="15" x2="45" y2="45" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="45" y1="15" x2="15" y2="45" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="15" cy="15" r="3" strokeWidth="1.5" fill="currentColor" className="text-red-400" />
            <circle cx="45" cy="15" r="3" strokeWidth="1.5" fill="currentColor" className="text-red-400" />
            <circle cx="15" cy="45" r="3" strokeWidth="1.5" fill="currentColor" className="text-red-400" />
            <circle cx="45" cy="45" r="3" strokeWidth="1.5" fill="currentColor" className="text-red-400" />
          </svg>
        </div>

        {/* Right Bottom - Playing Cards */}
        <div
          className="absolute bottom-24 right-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.18}px)` }}
        >
          <svg width="60" height="70" viewBox="0 0 60 70" fill="none" stroke="currentColor" className="text-red-500">
            <rect x="10" y="15" width="30" height="45" rx="3" strokeWidth="1.5" />
            <path d="M 25 28 L 20 35 L 30 35 Z" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 25 48 L 30 41 L 20 41 Z" strokeWidth="1.5" strokeLinejoin="round" />
            <rect x="20" y="10" width="30" height="45" rx="3" strokeWidth="1.5" className="text-gray-700" />
            <circle cx="35" cy="25" r="3" strokeWidth="1.5" />
            <circle cx="35" cy="45" r="3" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Left Bottom - Dice */}
        <div
          className="absolute bottom-1/3 left-1/4 opacity-20"
          style={{ transform: `translateY(${scrollY * -0.08}px)` }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="currentColor" className="text-indigo-500">
            <rect x="15" y="15" width="25" height="25" rx="3" strokeWidth="1.5" transform="rotate(-15 27.5 27.5)" />
            <circle cx="23" cy="23" r="1.5" fill="currentColor" transform="rotate(-15 27.5 27.5)" />
            <circle cx="27" cy="27" r="1.5" fill="currentColor" transform="rotate(-15 27.5 27.5)" />
            <circle cx="31" cy="31" r="1.5" fill="currentColor" transform="rotate(-15 27.5 27.5)" />
            <circle cx="23" cy="31" r="1.5" fill="currentColor" transform="rotate(-15 27.5 27.5)" />
            <circle cx="31" cy="23" r="1.5" fill="currentColor" transform="rotate(-15 27.5 27.5)" />
          </svg>
        </div>

        {/* Center Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Coming Soon
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
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
