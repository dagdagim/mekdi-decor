'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, MoveHorizontal, MapPin, Users, Sparkles } from 'lucide-react';

export const BeforeAfterSlider: React.FC = () => {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleMove(e.clientX);
  };

  return (
    <section className="py-24 bg-cream-100/60 border-y border-cream-300/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              Featured Transformation
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
              From Empty Space to Unforgettable.
            </h2>
          </div>
          <p className="mt-4 md:mt-0 text-sm sm:text-base text-charcoal-600 max-w-md font-light">
            Slide horizontally to experience the sheer craft of how Mekdi Decor turns raw banquet halls into ethereal romantic kingdoms.
          </p>
        </div>

        {/* Interactive Comparison Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Draggable Slider (8 cols) */}
          <div className="lg:col-span-8">
            <div
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={handleMouseMove}
              onTouchMove={handleTouchMove}
              className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize shadow-elevated border-2 border-gold-500/30"
            >
              {/* "After" Image (Complete Transformation) */}
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85"
                alt="After: Mekdi Decor luxury stage"
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />

              {/* "Before" Image (Clipped) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
              >
                <img
                  src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1600&q=80"
                  alt="Before: Raw empty venue hall"
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              {/* Dividing Line & Grab Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-gold-400 shadow-elevated"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-burgundy-900 border-2 border-gold-300 text-gold-300 flex items-center justify-center shadow-lg transition-transform hover:scale-110">
                  <MoveHorizontal className="w-5 h-5" />
                </div>
              </div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 pointer-events-none">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                  Before: Raw Hall
                </span>
              </div>
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900/90 backdrop-blur-md text-gold-300 border border-gold-500/40">
                  After: Mekdi Decor
                </span>
              </div>
            </div>
          </div>

          {/* Project Context & Meta Details (4 cols) */}
          <div className="lg:col-span-4 bg-cream-50 p-6 sm:p-8 rounded-2xl border border-cream-200 shadow-card">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-burgundy-700 bg-burgundy-100 px-3 py-1 rounded-full inline-block mb-3">
              Case Study
            </span>
            <h3 className="font-editorial text-2xl text-charcoal-900 font-semibold mb-2">
              Skyline Royal Wedding
            </h3>
            <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
              Complete overhaul of an empty concrete event venue into a 350-guest botanical paradise with grand tiered stage and crystal pendants.
            </p>

            <div className="space-y-3 pb-6 border-b border-cream-200 text-xs">
              <div className="flex items-center justify-between text-charcoal-700">
                <span className="flex items-center gap-1.5 text-charcoal-500">
                  <MapPin className="w-3.5 h-3.5 text-gold-600" /> Venue
                </span>
                <span className="font-medium text-charcoal-900">Skyline Hall, Hawassa</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-700">
                <span className="flex items-center gap-1.5 text-charcoal-500">
                  <Users className="w-3.5 h-3.5 text-gold-600" /> Guest Count
                </span>
                <span className="font-medium text-charcoal-900">350 Guests</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-700">
                <span className="text-charcoal-500">Decoration Style</span>
                <span className="font-medium text-burgundy-800">Royal White & Rose Gold</span>
              </div>
              <div className="flex items-center justify-between text-charcoal-700">
                <span className="text-charcoal-500">Setup Duration</span>
                <span className="font-medium text-charcoal-900">14 Hours On-Site</span>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/gallery/luxury-wedding-hawassa"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-colors shadow-sm"
              >
                <span>View Full Project</span>
                <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
