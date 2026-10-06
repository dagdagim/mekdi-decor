'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';
import { GalleryProject } from '@/lib/types';
import { ArrowRight, MapPin, Sparkles } from 'lucide-react';

export const EditorialProjects: React.FC = () => {
  const [projects, setProjects] = useState<GalleryProject[]>(GALLERY_PROJECTS);

  useEffect(() => {
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setProjects(data.data);
        }
      })
      .catch((err) => console.warn('Home gallery fallback:', err));
  }, []);

  const featured = projects.find((p) => p.isFeatured) || projects[0] || GALLERY_PROJECTS[0];
  const secondary = projects.filter((p) => p.id !== featured.id).slice(0, 3);

  return (
    <section className="py-24 bg-cream-100/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
          <div>
            <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              Selected Portfolio
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
              Featured Transformations
            </h2>
          </div>
          <Link
            href="/gallery"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-burgundy-900 hover:text-gold-700 transition-colors"
          >
            <span>View All Projects</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Asymmetrical Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Large Feature (7 cols) */}
          <div className="lg:col-span-7">
            <Link
              href={`/gallery/${featured.slug || featured.id}`}
              className="group block relative h-[480px] sm:h-[540px] rounded-3xl overflow-hidden shadow-elevated border border-gold-500/20"
            >
              <img
                src={featured.heroImage}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/95 via-burgundy-950/30 to-transparent" />

              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900/90 text-gold-300 border border-gold-500/30">
                  {featured.eventType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white">
                  {featured.guestCount} Guests
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-cream-50">
                <div className="flex items-center gap-1.5 text-gold-300 text-xs mb-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>
                    {featured.venueName} • {featured.locationCity}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl font-semibold mb-2 group-hover:text-gold-200 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-xs sm:text-sm text-cream-200/80 line-clamp-2 max-w-xl font-light">
                  {featured.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-gold-300 group-hover:translate-x-1 transition-transform">
                  <span>Explore Project Story & Gallery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          </div>

          {/* Secondary Stack (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
            {secondary.map((project) => (
              <Link
                key={project.id}
                href={`/gallery/${project.slug || project.id}`}
                className="group relative h-[160px] sm:h-[164px] rounded-2xl overflow-hidden shadow-card border border-cream-200 flex transition-all duration-300 hover:shadow-elevated"
              >
                <div className="w-1/3 sm:w-2/5 shrink-0 overflow-hidden relative">
                  <img
                    src={project.heroImage}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-burgundy-950/80 text-gold-300">
                      {project.eventType}
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-[10px] text-charcoal-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gold-600" />
                      {project.locationCity}
                    </span>
                    <h4 className="font-editorial text-base sm:text-lg font-semibold text-charcoal-900 group-hover:text-burgundy-800 transition-colors line-clamp-1 mt-1">
                      {project.title}
                    </h4>
                    <p className="text-[11px] text-charcoal-600 line-clamp-2 mt-1 font-light">
                      {project.description}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold text-gold-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
