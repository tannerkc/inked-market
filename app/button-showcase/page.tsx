'use client';

import React from 'react';
import {
  HandDrawnButton,
  FlashSheetButton,
  StampButton,
  RibbonButton,
  FineLineButton,
  TattooIcon,
  StencilButton,
  BoldTraditionalButton,
  SketchFillButton,
} from '@/components/tattoo-buttons';

export default function ButtonShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Tattoo-Style Button Showcase
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore different tattoo-inspired button designs for Inked Market.
            Each style brings a unique aesthetic to match the tattoo culture.
          </p>
        </div>

        {/* Button Grid */}
        <div className="space-y-16">
          {/* 1. Hand-Drawn Outline Style */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                1. Hand-Drawn Outline Style
              </h2>
              <p className="text-gray-600">
                Irregular, wobbly borders that mimic hand-drawn tattoo stencils with subtle ink texture.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Professional</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Versatile</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Unique</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <HandDrawnButton variant="primary">Explore Artists</HandDrawnButton>
              <HandDrawnButton variant="secondary">Learn More</HandDrawnButton>
              <HandDrawnButton variant="outline">Get Started</HandDrawnButton>
            </div>
          </section>

          {/* 2. Flash Sheet Cards */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                2. Flash Sheet Card Style
              </h2>
              <p className="text-gray-600">
                Vintage tattoo flash art aesthetic with thick black borders and corner star decorations.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full">On-Brand</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Nostalgic</span>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Bold</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <FlashSheetButton variant="primary">Browse Artists</FlashSheetButton>
              <FlashSheetButton variant="secondary">View Portfolio</FlashSheetButton>
            </div>
          </section>

          {/* 3. Inked Stamp Effect */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                3. Inked Stamp Effect
              </h2>
              <p className="text-gray-600">
                Distressed edges with a slight rotation, mimicking rubber stamps or tattoo stencil transfers.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">Clean</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Minimalist</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">Trendy</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <StampButton variant="primary">Book Now</StampButton>
              <StampButton variant="secondary">Contact Artist</StampButton>
            </div>
          </section>

          {/* 4. Traditional Banner Ribbon */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                4. Traditional Banner Ribbon
              </h2>
              <p className="text-gray-600">
                Classic tattoo banner ribbons with curved edges, gradient fills, and dimensional shadows.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Iconic</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Playful</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Eye-Catching</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <RibbonButton variant="primary">Get Started</RibbonButton>
              <RibbonButton variant="secondary">Join Now</RibbonButton>
            </div>
          </section>

          {/* 5. Fine Line Minimalist */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                5. Fine Line Minimalist
              </h2>
              <p className="text-gray-600">
                Delicate single-line borders with micro tattoo icons that animate on hover.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Modern</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">Elegant</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Clean</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <FineLineButton variant="primary" icon={<TattooIcon type="star" />}>
                Explore
              </FineLineButton>
              <FineLineButton variant="primary" icon={<TattooIcon type="heart" />}>
                Save Artists
              </FineLineButton>
              <FineLineButton variant="primary" icon={<TattooIcon type="rose" />}>
                View Gallery
              </FineLineButton>
              <FineLineButton variant="secondary">No Icon</FineLineButton>
            </div>
          </section>

          {/* 6. Stencil Cutout Style */}
          <section className="bg-gray-900 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                6. Stencil Cutout Style
              </h2>
              <p className="text-gray-300">
                Purple carbon transfer paper aesthetic with halftone texture and semi-transparency.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Authentic</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">Artistic</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Unique</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <StencilButton variant="purple">Apply Stencil</StencilButton>
              <StencilButton variant="blue">Book Session</StencilButton>
            </div>
          </section>

          {/* 7. Bold Traditional Frame */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                7. Bold Traditional Frame
              </h2>
              <p className="text-gray-600">
                Thick black outlines with vibrant solid color fills and corner decorations.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">Bold</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full">Accessible</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">Classic</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <BoldTraditionalButton variant="red">Book Now</BoldTraditionalButton>
              <BoldTraditionalButton variant="green">Confirm</BoldTraditionalButton>
              <BoldTraditionalButton variant="blue">Explore</BoldTraditionalButton>
              <BoldTraditionalButton variant="yellow">Premium</BoldTraditionalButton>
            </div>
          </section>

          {/* 8. Sketch + Fill Animation */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                8. Sketch + Fill Animation
              </h2>
              <p className="text-gray-600">
                Outline draws on hover, then fills with color - mimicking a tattoo being drawn.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">Engaging</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">Interactive</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full">Satisfying</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <SketchFillButton variant="primary">Hover Me!</SketchFillButton>
              <SketchFillButton variant="secondary">Draw Effect</SketchFillButton>
            </div>
          </section>

          {/* Comparison Grid */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 shadow-lg text-white">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">
                All Styles Side-by-Side
              </h2>
              <p className="text-indigo-100">
                Compare all button styles to see which fits best for different use cases.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <HandDrawnButton variant="primary">Hand-Drawn</HandDrawnButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <FlashSheetButton>Flash Sheet</FlashSheetButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <StampButton>Stamp</StampButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <RibbonButton>Ribbon</RibbonButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <FineLineButton icon={<TattooIcon type="star" />}>Fine Line</FineLineButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <StencilButton>Stencil</StencilButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <BoldTraditionalButton variant="red">Traditional</BoldTraditionalButton>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-col items-center gap-3">
                <SketchFillButton>Sketch Fill</SketchFillButton>
              </div>
            </div>
          </section>

          {/* Design Recommendations */}
          <section className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Design Recommendations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">✅ Best for Primary CTAs</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Hand-Drawn Outline (versatile)</li>
                  <li>• Flash Sheet Cards (on-brand)</li>
                  <li>• Bold Traditional Frame (accessible)</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">🎨 Best for Brand Identity</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Flash Sheet Cards (nostalgic)</li>
                  <li>• Traditional Banner Ribbon (iconic)</li>
                  <li>• Fine Line Minimalist (modern)</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">⚡ Best for Engagement</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Sketch + Fill Animation (interactive)</li>
                  <li>• Fine Line with Icons (playful)</li>
                  <li>• Ribbon Banner (eye-catching)</li>
                </ul>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="font-bold text-gray-900 mb-2">🔧 Easiest to Implement</h3>
                <ul className="space-y-1 text-gray-600">
                  <li>• Bold Traditional Frame (simple)</li>
                  <li>• Fine Line Minimalist (clean)</li>
                  <li>• Stamp Effect (minimal CSS)</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p>
            These buttons maintain your existing color scheme (indigo primary) while adding tattoo-inspired personality.
          </p>
          <p className="mt-2 text-sm">
            Navigate to{' '}
            <code className="px-2 py-1 bg-gray-100 rounded text-indigo-600">/button-showcase</code>
            {' '}to view this page
          </p>
        </div>
      </div>
    </div>
  );
}
