import React from 'react';
import { TESTIMONIALS_DATA } from '@/lib/data/mock-db';
import { Star, Quote, MapPin, CheckCircle2 } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-24 bg-cream-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mb-2">
            Cherished Words
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Memories We&apos;ve Co-Created
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Real stories from our clients who trusted Mekdi Decor with life&apos;s most meaningful milestones.
          </p>
          <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-gold-700 bg-gold-50 border border-gold-300/40 px-3 py-0.5 rounded-full font-medium">
            Verified Client Reviews
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card flex flex-col justify-between relative hover:shadow-elevated transition-all duration-300"
            >
              <Quote className="w-10 h-10 text-gold-200/70 absolute top-6 right-6 pointer-events-none" />

              <div>
                {/* Rating stars */}
                <div className="flex items-center gap-1 mb-4 text-gold-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gold-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic font-serif">
                  &ldquo;{t.reviewText}&rdquo;
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-cream-100 flex items-center gap-3">
                {t.photoUrl && (
                  <img
                    src={t.photoUrl}
                    alt={t.customerName}
                    className="w-11 h-11 rounded-full object-cover border-2 border-gold-400/50"
                  />
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-editorial text-sm font-semibold text-charcoal-900">
                      {t.customerName}
                    </h4>
                    {t.isVerified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-botanical-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-burgundy-800 font-medium">
                    {t.eventType}
                  </p>
                  <p className="text-[10px] text-charcoal-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-gold-600" /> {t.venue}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
