'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';
import { GalleryProject } from '@/lib/types';
import {
  Sparkles,
  MapPin,
  Users,
  ArrowRight,
  Filter,
  Search,
  Heart,
  Calendar,
  Layers,
} from 'lucide-react';

const FILTERS = [
  'All',
  'Weddings',
  'Graduations',
  'Birthdays',
  'Engagements',
  'Corporate',
  'Luxury',
  'Romantic',
  'Modern',
];

export default function GalleryPage() {
  const [projects, setProjects] = useState<GalleryProject[]>(GALLERY_PROJECTS);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load projects from API
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch((e) => console.warn('Using local gallery fallback:', e));

    // Load saved inspirations from localStorage
    try {
      const saved = localStorage.getItem('mekdi_saved_inspirations');
      if (saved) {
        setSavedIds(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const toggleSaveInspiration = async (e: React.MouseEvent, projectId: string, projectTitle: string) => {
    e.preventDefault();
    e.stopPropagation();

    let updated: string[];
    const isCurrentlySaved = savedIds.includes(projectId);

    if (isCurrentlySaved) {
      updated = savedIds.filter((id) => id !== projectId);
      setToastMessage(`Removed "${projectTitle}" from inspiration board`);
    } else {
      updated = [...savedIds, projectId];
      setToastMessage(`Saved "${projectTitle}" to inspiration board! ✨`);
    }

    setSavedIds(updated);
    try {
      localStorage.setItem('mekdi_saved_inspirations', JSON.stringify(updated));
      await fetch('/api/inspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
    } catch {}

    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const filteredProjects = projects.filter((p) => {
    // Category Filter
    let matchesCategory = true;
    if (activeFilter === 'Weddings') matchesCategory = p.eventType === 'Wedding';
    else if (activeFilter === 'Graduations') matchesCategory = p.eventType === 'Graduation';
    else if (activeFilter === 'Birthdays') matchesCategory = p.eventType === 'Birthday';
    else if (activeFilter === 'Engagements') matchesCategory = p.eventType === 'Engagement';
    else if (activeFilter === 'Corporate') matchesCategory = p.eventType === 'Corporate';
    else if (activeFilter === 'Luxury') matchesCategory = p.decorationStyle.toLowerCase().includes('luxury');
    else if (activeFilter === 'Romantic') matchesCategory = p.decorationStyle.toLowerCase().includes('romantic');
    else if (activeFilter === 'Modern') matchesCategory = p.decorationStyle.toLowerCase().includes('modern');

    // Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(query) ||
      p.venueName.toLowerCase().includes(query) ||
      p.locationCity.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-burgundy-950 text-gold-300 border border-gold-500/40 px-5 py-3 rounded-full shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Our Portfolio
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            Our Gallery
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Explore bespoke decorations and get inspired for your celebration. Every stage, floral arch, and chandelier is crafted with devotion.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-4 mb-12">
          {/* Search Box */}
          <div className="max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by venue (e.g. Sheraton, Lake View), city, or style..."
              className="w-full pl-11 pr-4 py-3 text-xs bg-white border border-cream-200 rounded-full shadow-sm focus:outline-none focus:border-burgundy-900 focus:ring-1 focus:ring-burgundy-900"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <Filter className="w-4 h-4 text-charcoal-400 mr-1 shrink-0 hidden sm:block" />
            {FILTERS.map((f) => {
              const isActive = activeFilter === f;
              return (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-burgundy-900 text-cream-50 shadow-md'
                      : 'bg-white text-charcoal-700 hover:bg-cream-200/70 border border-cream-200'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => {
            const isSaved = savedIds.includes(project.id) || savedIds.includes(project.slug);
            return (
              <Link
                key={project.id}
                href={`/gallery/${project.slug}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-card border border-cream-200 flex flex-col hover:-translate-y-1.5 hover:shadow-elevated transition-all duration-300"
              >
                {/* Media Preview */}
                <div className="relative aspect-[4/3] overflow-hidden bg-charcoal-900">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent opacity-80" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-burgundy-900/90 text-gold-300 border border-gold-500/30">
                      {project.eventType}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/40 backdrop-blur-md text-white">
                      {project.decorationStyle}
                    </span>
                  </div>

                  {/* Save to Inspiration Heart Button */}
                  <button
                    onClick={(e) => toggleSaveInspiration(e, project.id, project.title)}
                    title={isSaved ? 'Saved to your inspiration board' : 'Save to inspiration board'}
                    className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all ${
                      isSaved
                        ? 'bg-burgundy-900 text-gold-300 scale-110 shadow-md ring-2 ring-gold-400'
                        : 'bg-black/40 text-cream-100 hover:bg-black/70 hover:scale-105'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-gold-300' : ''}`} />
                  </button>

                  {/* Venue and City on Hero Bottom */}
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

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-charcoal-900 group-hover:text-burgundy-900 transition-colors line-clamp-1 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs text-charcoal-600 line-clamp-2 font-light leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Color Swatches */}
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

                  {/* Price & Link CTA */}
                  <div className="pt-4 border-t border-cream-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block">
                        Estimated Budget
                      </span>
                      <span className="text-xs font-semibold text-burgundy-950 font-mono">
                        {project.estimatedPriceRange}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy-900 group-hover:text-gold-700 transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-cream-200 max-w-lg mx-auto">
            <Layers className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
            <h3 className="font-editorial text-xl font-bold text-charcoal-800">
              No Projects Match Your Search
            </h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1 mb-6 font-light">
              Try searching for a different city or aesthetic style, or reset the filters.
            </p>
            <button
              onClick={() => {
                setActiveFilter('All');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 rounded-full text-xs font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
