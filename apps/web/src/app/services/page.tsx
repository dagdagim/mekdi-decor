import React from 'react';
import Link from 'next/link';
import { SERVICES_DATA } from '@/lib/data/mock-db';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Our Expertise
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            Decoration Services
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Every layer of your celebration is planned with architectural precision and artistic passion.
          </p>
        </div>

        {/* Detailed Service Cards */}
        <div className="space-y-16">
          {SERVICES_DATA.map((service, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={service.id}
                id={service.slug}
                className="bg-white rounded-3xl overflow-hidden shadow-card border border-cream-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-6 sm:p-10"
              >
                {/* Media Column (5 cols) */}
                <div
                  className={`lg:col-span-5 h-72 sm:h-96 rounded-2xl overflow-hidden relative ${
                    isEven ? 'lg:order-1' : 'lg:order-2'
                  }`}
                >
                  <img
                    src={service.featuredImage}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs text-cream-100 font-medium bg-burgundy-950/80 px-3 py-1 rounded-full border border-gold-400/30">
                      Starting from {formatCurrency(service.startingPrice, service.currency)}
                    </span>
                  </div>
                </div>

                {/* Text Content Column (7 cols) */}
                <div className={`lg:col-span-7 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-3 py-1 rounded-full inline-block mb-3">
                    0{index + 1} • {service.subtitle}
                  </span>

                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 mb-4">
                    {service.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed font-light mb-6">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <div className="flex items-center gap-2 text-xs text-charcoal-700">
                      <span className="w-4 h-4 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>Custom colorway tailored to your palette</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-700">
                      <span className="w-4 h-4 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>On-site installation and breakdown included</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-700">
                      <span className="w-4 h-4 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>3D spatial preview prior to fabrication</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal-700">
                      <span className="w-4 h-4 rounded-full bg-burgundy-100 text-burgundy-800 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                      <span>Highland and imported fresh flower sourcing</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <Link
                      href={`/plan-event?service=${service.slug}`}
                      className="px-7 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                      <span>Include in Event Plan</span>
                      <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                    </Link>

                    <Link
                      href="/gallery"
                      className="px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider text-charcoal-700 hover:text-burgundy-900 bg-cream-100 hover:bg-cream-200 transition-colors"
                    >
                      View Real Photos
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
