import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Award, Users, MapPin, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Mekdi Decor — Making Moments Unforgettable',
  description: 'Learn about the philosophy, founder Mekdes Tadesse, and master floral craftsmanship behind Mekdi Decor.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Our Heritage & Story
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            Crafting Unforgettable Moments
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Founded with a conviction that celebrations should not just be decorated — they should be felt.
          </p>
        </div>

        {/* Narrative & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elevated border-2 border-gold-500/30">
              <img
                src="/images/founder.jpg"
                alt="Mekdes Tadesse — Founder & Lead Designer"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 rounded-2xl bg-burgundy-950 text-cream-50 border border-gold-500/40 shadow-xl max-w-xs hidden sm:block">
              <span className="font-editorial text-lg text-gold-300 block font-bold">
                Mekdes Tadesse
              </span>
              <span className="text-xs text-cream-200/80">
                Founder & Creative Director
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs uppercase tracking-wider font-semibold text-burgundy-800 bg-burgundy-100 px-3 py-1 rounded-full inline-block">
              The Vision
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900 leading-snug">
              &ldquo;We transform empty rooms into living memories.&rdquo;
            </h2>
            <p className="text-sm text-charcoal-700 leading-relaxed font-light">
              Mekdi Decor was born from a passion for botanical architecture, emotional light, and the sacred celebratory culture of Ethiopia. Based at Trufat Werku Tower in Hawassa, our team orchestrates monumental 500+ guest royal weddings, graduations, and state celebrations across Hawassa, Shashemene, and nationwide destination events.
            </p>
            <p className="text-sm text-charcoal-700 leading-relaxed font-light">
              We reject the generic plastic templates and repetitive setups common in standard banquet halls. Every wedding, graduation, and birthday we curate is treated as a bespoke couture commission.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cream-200 text-center">
              <div>
                <span className="font-editorial text-3xl font-bold text-burgundy-900 block">450+</span>
                <span className="text-[11px] text-charcoal-500 uppercase tracking-wider">Events Designed</span>
              </div>
              <div>
                <span className="font-editorial text-3xl font-bold text-burgundy-900 block">8+</span>
                <span className="text-[11px] text-charcoal-500 uppercase tracking-wider">Years Mastery</span>
              </div>
              <div>
                <span className="font-editorial text-3xl font-bold text-burgundy-900 block">100%</span>
                <span className="text-[11px] text-charcoal-500 uppercase tracking-wider">Bespoke Decor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-card mb-20">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
              Our Core Design Principles
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-gold-50 text-gold-700 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-charcoal-900 mb-2">
                Subtle Luxury
              </h4>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                Opulence that never screams. We believe in harmony, proportions, and natural materials over garish artificial excess.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-burgundy-50 text-burgundy-900 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-charcoal-900 mb-2">
                Honoring Ethiopian Heritage
              </h4>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                From regal Tilfi textiles to sacred Mesob presentations, we blend timeless cultural dignity with contemporary world-class aesthetics.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-2xl bg-botanical-50 text-botanical-800 flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-editorial text-lg font-bold text-charcoal-900 mb-2">
                Flawless Discipline
              </h4>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                Logistics and timing are as important as artistry. Our crew arrives early, builds safely, and leaves the hall spotless.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/plan-event"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md"
          >
            <span>Plan Your Event With Us</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
