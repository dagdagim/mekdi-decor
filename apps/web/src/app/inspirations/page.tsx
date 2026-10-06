'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';
import { GalleryProject } from '@/lib/types';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Trash2,
  Share2,
  Calendar,
  Layers,
  MapPin,
  Users,
} from 'lucide-react';

export default function InspirationsPage() {
  const [allProjects, setAllProjects] = useState<GalleryProject[]>(GALLERY_PROJECTS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Load gallery
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAllProjects(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // 2. Read saved inspirations
    try {
      const saved = localStorage.getItem('mekdi_saved_inspirations');
      if (saved) {
        setSavedIds(JSON.parse(saved));
      } else {
        // Default seed to show initial beauty
        setSavedIds(['proj-1', 'proj-3']);
      }
    } catch {}
  }, []);

  const savedProjects = allProjects.filter(
    (p) => savedIds.includes(p.id) || savedIds.includes(p.slug)
  );

  const removeInspiration = (id: string, title: string) => {
    const updated = savedIds.filter((item) => item !== id);
    setSavedIds(updated);
    try {
      localStorage.setItem('mekdi_saved_inspirations', JSON.stringify(updated));
    } catch {}
    setToastMessage(`Removed "${title}" from board`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shareBoard = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Mekdi Decor Inspiration Board',
        text: `Check out my curated celebration design board on Mekdi Decor!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Board link copied to clipboard! 📋');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-burgundy-950 text-gold-300 border border-gold-500/40 px-5 py-3 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-gold-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-8 border-b border-cream-200">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center gap-1.5 mb-2">
              <Heart className="w-3.5 h-3.5 fill-gold-600 text-gold-600" />
              Your Personal Moodboard
            </span>
            <h1 className="font-editorial text-4xl sm:text-5xl font-semibold tracking-tight text-charcoal-900">
              Saved Inspirations
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-charcoal-600 font-light">
              You have curated {savedProjects.length} design {savedProjects.length === 1 ? 'concept' : 'concepts'} for your upcoming celebration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={shareBoard}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 transition-colors shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Moodboard</span>
            </button>

            {savedProjects.length > 0 && (
              <Link
                href={`/plan-event?project=${encodeURIComponent(
                  savedProjects.map((p) => p.title).join(', ')
                )}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>Request Quote For My Board</span>
              </Link>
            )}
          </div>
        </div>

        {/* Saved Grid */}
        {savedProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-card border border-cream-200 flex flex-col hover:-translate-y-1 hover:shadow-elevated transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-900">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent opacity-80" />

                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy-900/90 text-gold-300 border border-gold-500/30">
                      {project.eventType}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md text-white">
                      {project.decorationStyle}
                    </span>
                  </div>

                  <button
                    onClick={() => removeInspiration(project.id, project.title)}
                    title="Remove from board"
                    className="absolute top-4 right-4 p-2.5 rounded-full bg-burgundy-950/80 text-gold-300 hover:bg-burgundy-900 hover:scale-105 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-4 right-4 text-cream-50 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-medium truncate drop-shadow">
                      <MapPin className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                      {project.venueName}, {project.locationCity}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 text-gold-300 drop-shadow">
                      <Users className="w-3.5 h-3.5" />
                      {project.guestCount}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-charcoal-900 group-hover:text-burgundy-900 transition-colors line-clamp-1 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-charcoal-600 line-clamp-2 font-light leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {project.colorPalette && project.colorPalette.length > 0 && (
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-wider mr-1">
                          Colors:
                        </span>
                        {project.colorPalette.slice(0, 4).map((hex, i) => (
                          <span
                            key={i}
                            className="w-4 h-4 rounded-full border border-white shadow-xs inline-block"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block">
                        Estimated Budget
                      </span>
                      <span className="text-xs font-semibold text-burgundy-950 font-mono">
                        {project.estimatedPriceRange}
                      </span>
                    </div>

                    <Link
                      href={`/gallery/${project.slug || project.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy-900 hover:text-gold-700 transition-colors"
                    >
                      <span>View Story</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-3xl border border-cream-200 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-cream-100 text-gold-600 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
              Your Moodboard is Empty
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto leading-relaxed mb-8 font-light">
              Explore our transformation portfolio and click the heart icon on any stage, floral arch, or backdrop you love.
            </p>
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md"
            >
              <span>Explore Gallery Portfolio</span>
              <ArrowRight className="w-4 h-4 text-gold-400" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
