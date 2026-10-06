'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';
import { GalleryProject } from '@/lib/types';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  CheckCircle2,
  Quote as QuoteIcon,
  ArrowRight,
  Share2,
  Heart,
  Layers,
} from 'lucide-react';

interface ProjectDetailPageProps {
  params: { id: string };
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const initialProject =
    GALLERY_PROJECTS.find((p) => p.slug === params.id || p.id === params.id) ||
    GALLERY_PROJECTS[0];

  const [project, setProject] = useState<GalleryProject>(initialProject);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Fetch live project from API
    fetch(`/api/gallery/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProject(data.data);
        }
      })
      .catch((e) => console.warn('Using local fallback for project:', e))
      .finally(() => setLoading(false));

    // 2. Check saved state
    try {
      const saved = localStorage.getItem('mekdi_saved_inspirations');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        if (parsed.includes(params.id) || (project && parsed.includes(project.id))) {
          setIsSaved(true);
        }
      }
    } catch {}
  }, [params.id]);

  const toggleSave = () => {
    try {
      const saved = localStorage.getItem('mekdi_saved_inspirations');
      let parsed: string[] = saved ? JSON.parse(saved) : [];
      const projId = project.id || params.id;

      if (parsed.includes(projId)) {
        parsed = parsed.filter((id) => id !== projId);
        setIsSaved(false);
        setToastMessage(`Removed "${project.title}" from inspiration board`);
      } else {
        parsed.push(projId);
        setIsSaved(true);
        setToastMessage(`Saved "${project.title}" to inspiration board! ✨`);
        fetch('/api/inspirations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId: projId }),
        }).catch(() => {});
      }

      localStorage.setItem('mekdi_saved_inspirations', JSON.stringify(parsed));
      setTimeout(() => setToastMessage(null), 3000);
    } catch {}
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project.title,
        text: project.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Link copied to clipboard! 📋');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-burgundy-950 text-gold-300 border border-gold-500/40 px-5 py-3 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-700 hover:text-burgundy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSave}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSaved
                  ? 'bg-burgundy-900 text-gold-300 ring-2 ring-gold-400'
                  : 'bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-gold-300' : ''}`} />
              <span>{isSaved ? 'Saved to Board' : 'Save Inspiration'}</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-elevated border border-gold-500/30 aspect-[16/9] sm:aspect-[21/9] mb-12">
          <img
            src={project.heroImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/95 via-burgundy-950/40 to-transparent" />

          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 text-cream-50">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-burgundy-950">
                {project.eventType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/20">
                {project.decorationStyle} Style
              </span>
              {project.isFeatured && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-burgundy-900 text-gold-300 border border-gold-400/40">
                  Featured Masterpiece
                </span>
              )}
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold mb-3">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-gold-200">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold-400" />
                {project.venueName}, {project.locationCity}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-400" />
                {project.guestCount} Guests
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Estimated: {project.estimatedPriceRange}
              </span>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main narrative (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Story */}
            <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card">
              <h2 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-4">
                About this Project
              </h2>
              <p className="text-sm text-charcoal-700 leading-relaxed font-light mb-6">
                {project.description}
              </p>

              {/* Color Palette */}
              {project.colorPalette && project.colorPalette.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-charcoal-500 font-semibold mb-3">
                    Curated Color Palette
                  </h4>
                  <div className="flex flex-wrap items-center gap-3">
                    {project.colorPalette.map((hex, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-[11px] font-mono text-charcoal-600 uppercase">
                          {hex}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Before & After comparison if available */}
            {(project.beforeImage || project.afterImage) && (
              <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card">
                <h2 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-4">
                  The Transformation Story
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.beforeImage && (
                    <div className="rounded-2xl overflow-hidden border border-cream-200">
                      <div className="bg-charcoal-900 text-white text-[11px] font-semibold py-1.5 px-3 uppercase tracking-wider">
                        Before Decoration (Raw Hall)
                      </div>
                      <img
                        src={project.beforeImage}
                        alt="Before decoration"
                        className="w-full h-56 object-cover"
                      />
                    </div>
                  )}
                  <div className="rounded-2xl overflow-hidden border border-gold-500/40">
                    <div className="bg-burgundy-900 text-gold-300 text-[11px] font-semibold py-1.5 px-3 uppercase tracking-wider">
                      After: Mekdi Decor Royal Finish
                    </div>
                    <img
                      src={project.afterImage || project.heroImage}
                      alt="After decoration"
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Services Used */}
            {project.servicesUsed && project.servicesUsed.length > 0 && (
              <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card">
                <h2 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-4">
                  Services Provided
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.servicesUsed.map((srv, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 p-3 rounded-xl bg-cream-100/70 border border-cream-200/80 text-xs font-medium text-charcoal-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-burgundy-700 shrink-0" />
                      <span>{srv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonial if available */}
            {project.testimonialQuote && (
              <div className="p-8 rounded-3xl bg-burgundy-950 text-cream-50 border border-gold-500/30 relative">
                <QuoteIcon className="w-10 h-10 text-gold-400/40 absolute top-6 right-6" />
                <p className="font-serif italic text-base sm:text-lg text-cream-100 max-w-xl leading-relaxed mb-4">
                  &ldquo;{project.testimonialQuote}&rdquo;
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-gold-300">
                  <span>— {project.testimonialAuthor || 'Happy Couple'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Booking Box (4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-white rounded-3xl p-8 border-2 border-gold-500/30 shadow-elevated">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-700 bg-gold-100/80 px-3 py-1 rounded-full inline-block mb-3">
                Book This Aesthetic
              </span>

              <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                I Want Something Like This
              </h3>

              <p className="text-xs text-charcoal-600 mb-6 font-light leading-relaxed">
                Loved this design? Our creative team can adapt the floral composition, colors, and stage architecture to your venue and budget.
              </p>

              <div className="space-y-3 py-4 border-y border-cream-200 text-xs mb-6">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Event Type:</span>
                  <span className="font-medium text-charcoal-900">{project.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Styling Category:</span>
                  <span className="font-medium text-burgundy-800">{project.decorationStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Estimated Range:</span>
                  <span className="font-semibold text-charcoal-900">{project.estimatedPriceRange}</span>
                </div>
              </div>

              <Link
                href={`/plan-event?project=${encodeURIComponent(project.title)}&type=${encodeURIComponent(
                  project.eventType
                )}`}
                className="w-full py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md flex items-center justify-center gap-2 mb-3"
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                <span>Request a Quote For This Style</span>
              </Link>

              <button
                onClick={toggleSave}
                className="w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-cream-100 text-burgundy-900 hover:bg-cream-200 transition-colors flex items-center justify-center gap-1.5 mb-2"
              >
                <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-burgundy-900 text-burgundy-900' : ''}`} />
                <span>{isSaved ? 'Saved in Inspiration Board' : 'Save to Inspiration Board'}</span>
              </button>

              <Link
                href="/contact"
                className="w-full py-2.5 text-center text-xs font-semibold text-charcoal-500 hover:text-burgundy-900 transition-colors block"
              >
                Ask a Question
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
