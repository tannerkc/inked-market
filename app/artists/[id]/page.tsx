import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// Mock data - in production this would come from an API
const mockArtist = {
  id: "1",
  name: "Sarah Chen",
  bio: "Award-winning tattoo artist specializing in fine line and minimalist designs. With over 10 years of experience, I transform ideas into timeless art. My passion is creating delicate, meaningful pieces that resonate with each client's unique story. I believe in the power of simplicity and precision to create lasting beauty.",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800",
  coverImage: "https://images.unsplash.com/photo-1598371611985-7e2d4e6f1a80?w=1200",
  location: {
    city: "Los Angeles",
    state: "CA",
  },
  shopId: "1",
  shopName: "Ink Paradise Studio",
  rating: 4.9,
  reviewCount: 156,
  verified: true,
  yearsOfExperience: 10,
  specialties: ["Fine Line", "Minimalist", "Floral", "Geometric"],
  styles: ["minimalist", "fine-line", "geometric"],
  certifications: [
    "Bloodborne Pathogens Certified",
    "First Aid & CPR Certified",
    "Advanced Safety Training",
  ],
  portfolioImages: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600",
      title: "Floral Sleeve",
      tags: ["floral", "fine-line"],
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600",
      title: "Minimalist Design",
      tags: ["minimalist", "geometric"],
    },
    {
      id: "3",
      url: "https://images.unsplash.com/photo-1598371611985-7e2d4e6f1a80?w=600",
      title: "Custom Work",
      tags: ["custom"],
    },
    {
      id: "4",
      url: "https://images.unsplash.com/photo-1606822965174-a217e3a8933d?w=600",
      title: "Line Work",
      tags: ["fine-line"],
    },
    {
      id: "5",
      url: "https://images.unsplash.com/photo-1611002447077-193317f0e5fc?w=600",
      title: "Botanical Art",
      tags: ["floral", "minimalist"],
    },
    {
      id: "6",
      url: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600",
      title: "Abstract Piece",
      tags: ["abstract", "geometric"],
    },
  ],
  socialLinks: {
    instagram: "https://instagram.com/sarahchen.ink",
  },
};

export const metadata: Metadata = {
  title: `${mockArtist.name} - Tattoo Artist | Inked Market`,
  description: mockArtist.bio.slice(0, 160),
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ArtistPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-72 bg-gradient-to-br from-indigo-500 to-purple-600">
        <Image
          src={mockArtist.coverImage}
          alt={mockArtist.name}
          fill
          className="object-cover opacity-50"
          priority
        />
      </div>

      {/* Profile Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 pb-6">
            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
              <Image
                src={mockArtist.profileImage}
                alt={mockArtist.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {mockArtist.name}
                </h1>
                {mockArtist.verified && (
                  <svg
                    className="w-7 h-7 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <svg
                    className="w-4 h-4 text-yellow-400 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="font-medium text-gray-900">
                    {mockArtist.rating.toFixed(1)}
                  </span>
                  <span>({mockArtist.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>
                  {mockArtist.location.city}, {mockArtist.location.state}
                </span>
                <span>•</span>
                <span>{mockArtist.yearsOfExperience} years experience</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {mockArtist.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <Button className="flex-1 sm:flex-none" disabled>
                Book Appointment
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none" disabled>
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  About Me
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {mockArtist.bio}
                </p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mockArtist.portfolioImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                    >
                      <Image
                        src={image.url}
                        alt={image.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end p-3">
                        <p className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {image.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Reviews
                </h2>
                <div className="text-center py-8 text-gray-500">
                  <svg
                    className="w-12 h-12 mx-auto mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p>Review system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Studio Affiliation */}
            {mockArtist.shopId && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Works At
                  </h3>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {mockArtist.shopName}
                      </p>
                      <p className="text-sm text-gray-600">View Studio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Certifications
                </h3>
                <div className="space-y-2">
                  {mockArtist.certifications.map((cert) => (
                    <div key={cert} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Follow Me
                </h3>
                <a
                  href={mockArtist.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Instagram</p>
                    <p className="text-sm opacity-90">@sarahchen.ink</p>
                  </div>
                </a>
              </CardContent>
            </Card>

            {/* Coming Soon */}
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="p-6 text-center">
                <svg
                  className="w-10 h-10 mx-auto mb-3 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h4 className="font-semibold text-indigo-900 mb-1">
                  Availability Calendar
                </h4>
                <p className="text-sm text-indigo-700">
                  Check availability & book appointments
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
