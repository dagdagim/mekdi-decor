import React from 'react';
import Link from 'next/link';
import { Calendar, Phone, Sparkles } from 'lucide-react';

export const CtaBanner: React.FC = () => {
  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-burgundy-950 p-10 sm:p-16 lg:p-20 text-center text-cream-50 shadow-elevated border-2 border-gold-500/30">
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-burgundy-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy-900/80 border border-gold-500/40 text-gold-300 text-xs tracking-widest uppercase font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Begin Your Consultation</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-cream-50 leading-[1.2]">
              Let&apos;s Create Something{' '}
              <span className="italic text-gold-300 font-normal">
                Beautiful Together.
              </span>
            </h2>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-cream-200/90 font-light max-w-xl leading-relaxed">
              Tell us about your event and let&apos;s turn your ideas into an unforgettable experience that your guests will talk about for years.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link
                href="/plan-event"
                className="w-full sm:w-auto px-9 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Plan Your Event</span>
              </Link>

              <a
                href="tel:+251911234567"
                className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 border border-gold-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4 text-gold-400" />
                <span>+251 911 234 567</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
