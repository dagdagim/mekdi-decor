'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Calendar, Sparkles, X } from 'lucide-react';

export const Hero: React.FC = () => {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-burgundy-950">
      {/* Cinematic Background Image with Editorial Vignette & Warm Tint */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
          alt="Mekdi Decor luxury floral stage and chandeliers"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Multilayered warm burgundy / charcoal overlays for optimal contrast and romantic depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/90 via-burgundy-900/75 to-burgundy-950/90" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/80" />
      </div>

      {/* Decorative Golden Ambient Accent Rings */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-burgundy-500/20 blur-3xl pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-cream-50 flex flex-col items-center">
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy-900/80 border border-gold-500/40 text-gold-300 text-xs tracking-widest uppercase font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Premier Event & Wedding Atelier</span>
        </div>

        {/* Editorial Headline */}
        <h1 className="font-editorial text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-cream-50 max-w-4xl leading-[1.15] drop-shadow-md">
          Your Vision.{' '}
          <span className="italic font-normal text-gold-300 block sm:inline">
            Our Decoration.
          </span>{' '}
          <br className="hidden sm:block" />
          Your Perfect Moment.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-cream-200/90 max-w-2xl font-sans font-light leading-relaxed">
          From intimate celebrations to unforgettable weddings, Mekdi Decor transforms spaces into experiences across Ethiopia.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/gallery"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all duration-300 shadow-gold flex items-center justify-center gap-2"
          >
            <span>Explore Our Work</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/plan-event"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-900/90 text-cream-50 hover:bg-burgundy-800 border border-gold-500/40 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-gold-400" />
            <span>Plan My Event</span>
          </Link>
        </div>

        {/* Secondary Consultation & Video Watch Trigger */}
        <div className="mt-8 flex items-center gap-6 text-xs text-cream-200/80">
          <Link
            href="/contact"
            className="hover:text-gold-300 transition-colors underline underline-offset-4 decoration-gold-500/50"
          >
            Book a Consultation
          </Link>
          <span className="text-gold-500/40">•</span>
          <button
            onClick={() => setShowVideoModal(true)}
            className="inline-flex items-center gap-2 hover:text-gold-300 transition-colors group cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-300 group-hover:scale-110 transition-transform">
              <Play className="w-2.5 h-2.5 fill-gold-300 ml-0.5" />
            </span>
            <span>Watch Our Story</span>
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-burgundy-950 border border-gold-500/40 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 flex items-center justify-between border-b border-gold-500/20 text-cream-100">
              <h3 className="font-editorial text-lg text-gold-300">
                Mekdi Decor — The Art of Celebration
              </h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="p-1 rounded-full text-cream-300 hover:text-white hover:bg-burgundy-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <video
                controls
                autoPlay
                className="w-full h-full object-cover"
                src="https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-bride-and-groom-41555-large.mp4"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
