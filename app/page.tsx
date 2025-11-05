import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#faf8f6] overflow-hidden">
        {/* Decorative botanical elements */}
        <div className="absolute top-10 right-10 opacity-10">
          <svg width="200" height="200" viewBox="0 0 200 200" fill="none" className="text-[#8b7355]">
            <path d="M100 20 Q120 60 140 100 Q120 140 100 180 M100 20 Q80 60 60 100 Q80 140 100 180" stroke="currentColor" strokeWidth="1" fill="none"/>
            <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M100 85 Q90 90 85 100 M100 85 Q110 90 115 100" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>
        <div className="absolute bottom-20 left-10 opacity-10">
          <svg width="150" height="150" viewBox="0 0 150 150" fill="none" className="text-[#8b7355]">
            <circle cx="75" cy="75" r="30" stroke="currentColor" strokeWidth="1" fill="none"/>
            <circle cx="75" cy="75" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
            <path d="M75 45 L75 35 M75 105 L75 115 M45 75 L35 75 M105 75 L115 75" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-light tracking-wider uppercase bg-[#f5e6d8] text-[#8b7355] border border-[#d4b5a0]">
                  Coming Soon
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-[#2d2a26] leading-tight tracking-tight">
                Your Next
                <span className="block mt-2 font-extralight italic text-[#8b7355]">Ink Story</span>
              </h1>
              <p className="text-lg text-[#6b6560] leading-relaxed font-light max-w-lg">
                Connect with artists who speak your aesthetic. Delicate line work,
                botanical illustrations, and timeless minimalist designs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-[#2d2a26] hover:bg-[#3d3a36] text-white rounded-full px-8 font-light tracking-wide"
                >
                  <Link href="/discover">Explore Artists</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-[#8b7355] text-[#8b7355] hover:bg-[#f5e6d8] rounded-full px-8 font-light tracking-wide"
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
              <div className="flex items-center gap-12 pt-8">
                <div>
                  <p className="text-3xl font-light text-[#2d2a26]">10K+</p>
                  <p className="text-sm text-[#8b7355] font-light tracking-wide">Artists</p>
                </div>
                <div className="w-px h-12 bg-[#d4b5a0]" />
                <div>
                  <p className="text-3xl font-light text-[#2d2a26]">5K+</p>
                  <p className="text-sm text-[#8b7355] font-light tracking-wide">Studios</p>
                </div>
                <div className="w-px h-12 bg-[#d4b5a0]" />
                <div>
                  <p className="text-3xl font-light text-[#2d2a26]">50K+</p>
                  <p className="text-sm text-[#8b7355] font-light tracking-wide">Designs</p>
                </div>
              </div>
            </div>

            {/* Hero illustration */}
            <div className="relative">
              <div className="aspect-square relative flex items-center justify-center">
                {/* Main botanical illustration */}
                <svg width="500" height="500" viewBox="0 0 500 500" fill="none" className="text-[#2d2a26]">
                  {/* Central flower */}
                  <circle cx="250" cy="250" r="40" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <circle cx="250" cy="250" r="25" stroke="currentColor" strokeWidth="1" fill="none"/>

                  {/* Petals */}
                  <path d="M250 210 Q230 220 220 250 Q230 280 250 290 M250 210 Q270 220 280 250 Q270 280 250 290" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M210 250 Q220 230 250 220 Q280 230 290 250 M210 250 Q220 270 250 280 Q280 270 290 250" stroke="currentColor" strokeWidth="1.5" fill="none"/>

                  {/* Stem and leaves */}
                  <path d="M250 290 L250 420" stroke="currentColor" strokeWidth="2" fill="none"/>
                  <path d="M250 320 Q200 330 180 350 M250 360 Q300 370 320 390" stroke="currentColor" strokeWidth="1.5" fill="none"/>

                  {/* Decorative leaves */}
                  <path d="M180 350 Q170 360 175 375 Q185 365 180 350" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M320 390 Q330 400 325 415 Q315 405 320 390" stroke="currentColor" strokeWidth="1" fill="none"/>

                  {/* Small flowers */}
                  <circle cx="380" cy="200" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <circle cx="380" cy="200" r="8" stroke="currentColor" strokeWidth="0.5" fill="none"/>

                  <circle cx="120" cy="300" r="12" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <circle cx="120" cy="300" r="6" stroke="currentColor" strokeWidth="0.5" fill="none"/>

                  {/* Celestial elements */}
                  <circle cx="150" cy="150" r="25" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M150 125 L150 115 M150 175 L150 185 M125 150 L115 150 M175 150 L185 150" stroke="currentColor" strokeWidth="1"/>

                  {/* Stars */}
                  <path d="M350 350 L352 355 L357 355 L353 358 L355 363 L350 360 L345 363 L347 358 L343 355 L348 355 Z" fill="currentColor"/>
                  <path d="M400 300 L401 303 L404 303 L401.5 305 L403 308 L400 306 L397 308 L398.5 305 L396 303 L399 303 Z" fill="currentColor"/>
                </svg>
              </div>

              {/* Floating accent card */}
              <div className="absolute -right-4 top-1/3 bg-white p-6 rounded-2xl shadow-sm border border-[#e8dfd6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f5e6d8] rounded-full flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#8b7355]">
                      <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 18 L6 22 L7 15 L2 10 L9 9 Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-light text-[#2d2a26]">Top Rated Artists</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-lg font-light text-[#8b7355]">★</span>
                      <span className="text-sm font-light text-[#6b6560]">4.9 average</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-block mb-6">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" className="mx-auto text-[#8b7355]">
                <circle cx="30" cy="30" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M30 20 L30 40 M20 30 L40 30" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>
            <h2 className="text-4xl sm:text-5xl font-light text-[#2d2a26] mb-6">
              Find Your Perfect Match
            </h2>
            <p className="text-lg text-[#6b6560] max-w-2xl mx-auto font-light leading-relaxed">
              Thoughtfully designed to connect you with artists who understand your vision
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M24 14 Q18 20 18 26 M24 14 Q30 20 30 26" stroke="currentColor" strokeWidth="1"/>
                  <circle cx="24" cy="28" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Curated Artists
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Browse carefully selected artists specializing in delicate line work,
                botanical designs, and minimalist aesthetics
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M16 24 L22 30 L32 18" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <circle cx="36" cy="12" r="4" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Inspiring Portfolios
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Explore detailed galleries showcasing each artist's unique style,
                technique, and aesthetic philosophy
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <circle cx="24" cy="24" r="15" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M24 15 L26 22 L33 22 L27 27 L29 34 L24 29 L19 34 L21 27 L15 22 L22 22 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Trusted Reviews
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Read authentic experiences from clients who've brought their
                ink visions to life with our artists
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <rect x="10" y="14" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M10 20 L24 28 L38 20" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Direct Connection
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Communicate your ideas directly with artists through our
                seamless messaging platform
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <path d="M16 12 L32 12 L32 40 L24 34 L16 40 Z" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <circle cx="24" cy="22" r="4" stroke="currentColor" strokeWidth="1" fill="none"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Save & Collect
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Curate your own collection of favorite artists, designs,
                and inspiration for your next piece
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group">
              <div className="mb-6">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#2d2a26]">
                  <rect x="8" y="16" width="32" height="20" rx="2" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M14 16 L14 12 L34 12 L34 16" stroke="currentColor" strokeWidth="1" fill="none"/>
                  <path d="M18 24 L18 28 M24 22 L24 28 M30 20 L30 28" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </div>
              <h3 className="text-xl font-light text-[#2d2a26] mb-3">
                Artist Tools
              </h3>
              <p className="text-[#6b6560] font-light leading-relaxed">
                Comprehensive dashboard for artists to showcase work,
                manage bookings, and connect with clients
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 lg:py-32 bg-[#f5e6d8] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 opacity-5">
          <svg width="300" height="300" viewBox="0 0 300 300" fill="none" className="text-[#8b7355]">
            <circle cx="150" cy="150" r="100" stroke="currentColor" strokeWidth="1"/>
            <circle cx="150" cy="150" r="70" stroke="currentColor" strokeWidth="1"/>
            <circle cx="150" cy="150" r="40" stroke="currentColor" strokeWidth="1"/>
            <path d="M150 50 L150 250 M50 150 L250 150" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* Decorative line art */}
            <div className="mb-8">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto text-[#8b7355]">
                <path d="M40 10 Q30 30 30 40 Q30 50 40 70 Q50 50 50 40 Q50 30 40 10" stroke="currentColor" strokeWidth="1" fill="none"/>
                <circle cx="40" cy="40" r="8" stroke="currentColor" strokeWidth="1" fill="none"/>
                <path d="M30 40 Q25 45 28 50 M50 40 Q55 45 52 50" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <h2 className="text-4xl sm:text-5xl font-light text-[#2d2a26] mb-6 tracking-tight">
              Begin Your
              <span className="block mt-2 italic text-[#8b7355]">Ink Journey</span>
            </h2>
            <p className="text-lg text-[#6b6560] mb-10 font-light leading-relaxed max-w-2xl mx-auto">
              Join a community of artists and collectors celebrating the art of
              delicate, meaningful tattoos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-[#2d2a26] hover:bg-[#3d3a36] text-white rounded-full px-10 font-light tracking-wide"
              >
                <Link href="/discover">Explore Artists</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#8b7355] text-[#8b7355] hover:bg-white rounded-full px-10 font-light tracking-wide"
              >
                Join as Artist
              </Button>
            </div>

            {/* Bottom decorative element */}
            <div className="mt-16 flex items-center justify-center gap-3">
              <svg width="40" height="2" viewBox="0 0 40 2" fill="none">
                <line x1="0" y1="1" x2="40" y2="1" stroke="#d4b5a0" strokeWidth="1"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#8b7355]">
                <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1" fill="none"/>
              </svg>
              <svg width="40" height="2" viewBox="0 0 40 2" fill="none">
                <line x1="0" y1="1" x2="40" y2="1" stroke="#d4b5a0" strokeWidth="1"/>
              </svg>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
