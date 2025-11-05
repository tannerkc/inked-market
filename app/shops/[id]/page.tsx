import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

// Mock data - in production this would come from an API
const mockShop = {
  id: "1",
  name: "Ink Paradise Studio",
  description: "Premium tattoo studio specializing in custom designs",
  bio: "At Ink Paradise Studio, we believe that every tattoo tells a story. Our team of award-winning artists brings over 50 years of combined experience to create stunning, personalized artwork that you'll cherish forever. We pride ourselves on maintaining the highest standards of safety, professionalism, and artistic excellence.",
  coverImage: "https://images.unsplash.com/photo-1598371611985-7e2d4e6f1a80?w=1200",
  profileImage: "https://images.unsplash.com/photo-1606822965174-a217e3a8933d?w=400",
  location: {
    address: "123 Art Street",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90001",
    country: "USA",
  },
  phone: "(555) 123-4567",
  email: "info@inkparadise.com",
  rating: 4.8,
  reviewCount: 124,
  verified: true,
  specialties: ["Traditional", "Realism", "Color", "Custom Design"],
  images: [
    "https://images.unsplash.com/photo-1598371611985-7e2d4e6f1a80?w=600",
    "https://images.unsplash.com/photo-1606822965174-a217e3a8933d?w=600",
    "https://images.unsplash.com/photo-1611002447077-193317f0e5fc?w=600",
  ],
  openHours: {
    monday: { open: "10:00 AM", close: "8:00 PM" },
    tuesday: { open: "10:00 AM", close: "8:00 PM" },
    wednesday: { open: "10:00 AM", close: "8:00 PM" },
    thursday: { open: "10:00 AM", close: "8:00 PM" },
    friday: { open: "10:00 AM", close: "10:00 PM" },
    saturday: { open: "12:00 PM", close: "10:00 PM" },
    sunday: { closed: true },
  },
  socialLinks: {
    instagram: "https://instagram.com/inkparadise",
    facebook: "https://facebook.com/inkparadise",
  },
};

export const metadata: Metadata = {
  title: `${mockShop.name} | Inked Market`,
  description: mockShop.description,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div className="relative h-72 bg-gray-900">
        <Image
          src={mockShop.coverImage}
          alt={mockShop.name}
          fill
          className="object-cover opacity-80"
          priority
        />
      </div>

      {/* Profile Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 pb-6">
            <div className="relative w-32 h-32 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
              <Image
                src={mockShop.profileImage}
                alt={mockShop.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {mockShop.name}
                </h1>
                {mockShop.verified && (
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
                    {mockShop.rating.toFixed(1)}
                  </span>
                  <span>({mockShop.reviewCount} reviews)</span>
                </div>
                <span>•</span>
                <span>
                  {mockShop.location.city}, {mockShop.location.state}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {mockShop.specialties.map((specialty) => (
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
                  About Us
                </h2>
                <p className="text-gray-600 leading-relaxed">{mockShop.bio}</p>
              </CardContent>
            </Card>

            {/* Portfolio */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {mockShop.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4 text-center">
                  More portfolio images coming soon
                </p>
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
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div className="text-sm">
                      <p className="text-gray-600">{mockShop.location.address}</p>
                      <p className="text-gray-600">
                        {mockShop.location.city}, {mockShop.location.state}{" "}
                        {mockShop.location.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {mockShop.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-gray-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      {mockShop.email}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={mockShop.socialLinks.instagram}
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                  <a
                    href={mockShop.socialLinks.facebook}
                    className="text-gray-600 hover:text-indigo-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Hours</h3>
                <div className="space-y-2">
                  {Object.entries(mockShop.openHours).map(([day, hours]) => {
                    const isClosed = "closed" in hours && hours.closed;
                    return (
                      <div
                        key={day}
                        className="flex justify-between text-sm capitalize"
                      >
                        <span className="text-gray-900 font-medium">{day}</span>
                        <span className="text-gray-600">
                          {isClosed
                            ? "Closed"
                            : `${"open" in hours ? hours.open : ""} - ${"close" in hours ? hours.close : ""}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
                  Booking System
                </h4>
                <p className="text-sm text-indigo-700">
                  Online booking coming soon
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
