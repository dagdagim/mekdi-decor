'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PACKAGES_DATA } from '@/lib/data/mock-db';
import { PackageItem } from '@/lib/types';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const PackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES_DATA);

  useEffect(() => {
    fetch('/api/packages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
        }
      })
      .catch((err) => console.warn('Home packages fallback:', err));
  }, []);

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mb-2">
            Curated Experiences
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Tailored Decoration Packages
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Transparent starting tiers designed to match your celebration scale. Every package is fully customizable during your design consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => {
            const isFeatured = pkg.isFeatured;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'bg-burgundy-950 text-cream-50 shadow-elevated border-2 border-gold-400 scale-105 z-10'
                    : 'bg-white text-charcoal-900 shadow-card border border-cream-200 hover:-translate-y-1'
                }`}
              >
                {/* Floating Ribbon for Most Popular */}
                {isFeatured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase bg-gold-400 text-burgundy-950 shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Most Popular</span>
                  </div>
                )}

                <div>
                  <span
                    className={`text-[11px] uppercase tracking-wider font-semibold block mb-1 ${
                      isFeatured ? 'text-gold-300' : 'text-gold-700'
                    }`}
                  >
                    {pkg.tierLabel || 'Curated Tier'}
                  </span>
                  <h3
                    className={`font-editorial text-2xl font-bold ${
                      isFeatured ? 'text-cream-50' : 'text-charcoal-900'
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-xs mt-2 font-light leading-relaxed min-h-[36px] ${
                      isFeatured ? 'text-cream-200/80' : 'text-charcoal-600'
                    }`}
                  >
                    {pkg.tagline}
                  </p>

                  <div className="my-6 pt-4 border-t border-cream-200/30">
                    <span
                      className={`text-[10px] uppercase tracking-wider block ${
                        isFeatured ? 'text-cream-300/70' : 'text-charcoal-500'
                      }`}
                    >
                      Starting from
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span
                        className={`text-2xl font-bold tracking-tight ${
                          isFeatured ? 'text-gold-300' : 'text-burgundy-900'
                        }`}
                      >
                        {formatCurrency(pkg.startingPrice, pkg.currency || 'ETB')}
                      </span>
                    </div>
                  </div>

                  {/* Included Services List */}
                  {pkg.includedServices && pkg.includedServices.length > 0 && (
                    <ul className="space-y-3 mb-8">
                      {pkg.includedServices.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs">
                          <span
                            className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${
                              isFeatured
                                ? 'bg-gold-500/20 text-gold-300'
                                : 'bg-burgundy-100 text-burgundy-800'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span
                            className={
                              isFeatured ? 'text-cream-200/90' : 'text-charcoal-700'
                            }
                          >
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <Link
                    href={`/plan-event?package=${encodeURIComponent(pkg.slug || pkg.name)}`}
                    className={`w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                      isFeatured
                        ? 'bg-gold-500 text-burgundy-950 hover:bg-gold-400 shadow-gold'
                        : 'bg-burgundy-800 text-cream-50 hover:bg-burgundy-900'
                    }`}
                  >
                    <span>Select Package</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-charcoal-500 mt-10">
          * Final pricing includes complete setup, logistics, and on-site standby in Hawassa and Shashemene. Custom destination venue requirements are quoted transparently.
        </p>
      </div>
    </section>
  );
};
