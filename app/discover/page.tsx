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
    <div className="min-h-screen bg-gray-50 pt-22">
      {/* Header Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
              Discover Your Perfect Artist
            </h1>
            <p className="text-xl text-indigo-800">
              Browse our curated collection of verified tattoo artists and
              studios. Find the perfect match for your next piece.
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by style, location, or artist name..."
                className="w-full px-6 py-4 pr-12 rounded-lg shadow-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                disabled
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-gray-400"
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
            </div>
            <p className="text-sm text-indigo-200 mt-2">
              Search functionality coming soon
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section - Coming Soon */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filters:
            </span>
            {["All Styles", "Location", "Price Range", "Availability"].map(
              (filter) => (
                <button
                  key={filter}
                  disabled
                  className="px-4 py-2 rounded-full text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors whitespace-nowrap opacity-50 cursor-not-allowed"
                >
                  {filter}
                </button>
              )
            )}
            <span className="text-xs text-gray-500 whitespace-nowrap">
              (Coming Soon)
            </span>
          </div>
        </div>
      </section>

      {/* Studios Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Featured Studios
              </h2>
              <p className="text-gray-600 mt-1">
                Professional tattoo studios near you
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Featured Artists
              </h2>
              <p className="text-gray-600 mt-1">
                Talented artists ready to bring your vision to life
              </p>
            </div>
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

      {/* Coming Soon Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-6">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              More Features Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're working on advanced search filters, real-time availability,
              booking system, and much more to help you find your perfect artist.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Platform in Development
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
