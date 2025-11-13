import { ProfileCard } from "@/components/ui/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover Artists & Studios | Inked Market",
  description:
    "Browse talented tattoo artists and professional studios. Find the perfect match for your next tattoo.",
};

// Mock data for demonstration
const mockShops = [
  {
    id: "1",
    name: "Ink Paradise Studio",
    image: "https://images.unsplash.com/photo-1598371611985-7e2d4e6f1a80?w=800",
    location: "Los Angeles, CA",
    rating: 4.8,
    reviewCount: 124,
    specialties: ["Traditional", "Realism", "Color"],
    verified: true,
  },
  {
    id: "2",
    name: "Sacred Art Tattoo",
    image: "https://images.unsplash.com/photo-1606822965174-a217e3a8933d?w=800",
    location: "New York, NY",
    rating: 4.9,
    reviewCount: 203,
    specialties: ["Japanese", "Blackwork", "Tribal"],
    verified: true,
  },
  {
    id: "3",
    name: "Eternal Canvas",
    image: "https://images.unsplash.com/photo-1611002447077-193317f0e5fc?w=800",
    location: "Miami, FL",
    rating: 4.7,
    reviewCount: 89,
    specialties: ["Watercolor", "Fine Line", "Portrait"],
    verified: false,
  },
];

const mockArtists = [
  {
    id: "1",
    name: "Sarah Chen",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 156,
    specialties: ["Fine Line", "Minimalist", "Floral"],
    verified: true,
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 198,
    specialties: ["Realism", "Portrait", "Black & Grey"],
    verified: true,
  },
  {
    id: "3",
    name: "Yuki Tanaka",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
    location: "Seattle, WA",
    rating: 5.0,
    reviewCount: 87,
    specialties: ["Japanese", "Traditional", "Color"],
    verified: true,
  },
  {
    id: "4",
    name: "Alex Johnson",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
    location: "Portland, OR",
    rating: 4.7,
    reviewCount: 142,
    specialties: ["Geometric", "Dotwork", "Abstract"],
    verified: false,
  },
];

export default function DiscoverPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden pt-24 pb-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-purple-200/30 rounded-full blur-3xl" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-indigo-600 mb-6 shadow-sm">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Discover Verified Artists
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Tattoo Artist
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Browse our curated collection of verified tattoo artists and studios.
              Discover talent that matches your style.
            </p>

            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity" />
                <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
                  <div className="pl-6 text-gray-400">
                    <svg
                      className="w-6 h-6"
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
                  <input
                    type="text"
                    placeholder="Search by style, location, or artist name..."
                    className="flex-1 px-6 py-5 text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
                    disabled
                  />
                  <button
                    disabled
                    className="m-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Search
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 flex items-center justify-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Search coming soon
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-16 z-10 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap mr-2">
              Filter by:
            </span>
            {["All Styles", "Location", "Price Range", "Availability"].map(
              (filter) => (
                <button
                  key={filter}
                  disabled
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border-2 border-gray-200 text-gray-600 bg-white hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Studios Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Featured Studios
                </h2>
              </div>
              <p className="text-gray-600 text-lg ml-4">
                Professional tattoo studios with verified portfolios
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 text-indigo-600 hover:text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all group">
              View all
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockShops.map((shop) => (
              <ProfileCard
                key={shop.id}
                id={shop.id}
                type="shop"
                name={shop.name}
                image={shop.image}
                location={shop.location}
                rating={shop.rating}
                reviewCount={shop.reviewCount}
                specialties={shop.specialties}
                verified={shop.verified}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Artists Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full" />
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Featured Artists
                </h2>
              </div>
              <p className="text-gray-600 text-lg ml-4">
                Talented artists ready to bring your vision to life
              </p>
            </div>
            <button className="hidden sm:flex items-center gap-2 px-6 py-3 text-purple-600 hover:text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition-all group">
              View all
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockArtists.map((artist) => (
              <ProfileCard
                key={artist.id}
                id={artist.id}
                type="artist"
                name={artist.name}
                image={artist.image}
                location={artist.location}
                rating={artist.rating}
                reviewCount={artist.reviewCount}
                specialties={artist.specialties}
                verified={artist.verified}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-2xl mb-8">
              <svg
                className="w-10 h-10 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              More Amazing Features Coming Soon
            </h3>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Advanced search filters, real-time availability, instant booking,
              portfolio galleries, and much more to revolutionize how you find your perfect artist.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium border border-indigo-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Platform in Active Development
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
