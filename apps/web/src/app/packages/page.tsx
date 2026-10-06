'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PACKAGES_DATA } from '@/lib/data/mock-db';
import { PackageItem } from '@/lib/types';
import { Sparkles, Check, ArrowRight, ShieldCheck, HeartHandshake, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const FAQS = [
  {
    q: 'Can packages be customized for our specific venue layout?',
    a: 'Absolutely. Every package is a foundation. Our design team customizes the dimensional geometry, floral palette, and stage footprint to fit your chosen venue perfectly.',
  },
  {
    q: 'What is the payment schedule for booking an event package?',
    a: 'We require a 50% deposit upon accepting the official quote to lock your date into our production calendar. The final balance is due 7 calendar days before the event.',
  },
  {
    q: 'Are transport, delivery, and setup included in the package rates?',
    a: 'Yes, our on-site team handles complete setup beginning 12 hours prior to guest arrival, as well as post-event dismantling and transport across Hawassa, Shashemene, and regional venues.',
  },
  {
    q: 'Do you provide 3D spatial renders before event day?',
    a: 'Yes! For all Elegance, Signature Royale, and Bespoke packages, our 3D architectural renderers provide walkthrough visuals so you can preview every angle in advance.',
  },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES_DATA);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    fetch('/api/packages')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPackages(data.data);
        }
      })
      .catch((e) => console.warn('Using local packages fallback:', e));
  }, []);

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Curated Experiences
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            Decoration Packages
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Designed to provide clear milestones for your celebration budget. Pricing is transparent, backed by our team of master florists and lighting directors.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
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
                    {pkg.tierLabel}
                  </span>
                  <h3
                    className={`font-editorial text-2xl font-bold ${
                      isFeatured ? 'text-cream-50' : 'text-charcoal-900'
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-xs mt-2 font-light leading-relaxed min-h-[40px] ${
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
                    <span
                      className={`text-2xl font-bold tracking-tight font-mono ${
                        isFeatured ? 'text-gold-300' : 'text-burgundy-900'
                      }`}
                    >
                      {formatCurrency(pkg.startingPrice, pkg.currency)}
                    </span>
                  </div>

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
                        <span className={isFeatured ? 'text-cream-200/90' : 'text-charcoal-700'}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={`/plan-event?package=${encodeURIComponent(pkg.slug)}&name=${encodeURIComponent(pkg.name)}`}
                  className={`w-full py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                    isFeatured
                      ? 'bg-gold-500 text-burgundy-950 hover:bg-gold-400 shadow-md font-bold'
                      : 'bg-burgundy-900 text-cream-50 hover:bg-burgundy-800'
                  }`}
                >
                  <span>Select This Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Quality Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-cream-200 mb-20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-burgundy-100/70 text-burgundy-900 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-1">
                Guaranteed Execution
              </h3>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                Backed by formal commercial agreements, milestone timelines, and on-time completion commitments.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold-100 text-gold-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-1">
                Fresh Botanical Imports
              </h3>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                We partner directly with leading Ethiopian rose farms and international botanical auctions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-botanical-100 text-botanical-900 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-1">
                Dedicated Concierge
              </h3>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                Direct WhatsApp and phone access to your assigned lead designer from draft proposal to tear-down.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-10">
            <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Frequently Asked Questions
            </span>
            <h2 className="font-editorial text-3xl font-bold text-charcoal-900">
              Package & Booking Guidance
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-charcoal-900 text-xs sm:text-sm hover:text-burgundy-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-burgundy-900 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-charcoal-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-charcoal-600 leading-relaxed font-light border-t border-cream-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Consultation CTA Banner */}
        <div className="rounded-3xl bg-burgundy-950 text-cream-50 p-8 sm:p-12 border border-gold-500/30 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-xs uppercase tracking-widest text-gold-400 font-semibold block">
              Bespoke Atelier Consultation
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-bold">
              Need Something Uniquely Yours?
            </h2>
            <p className="text-xs sm:text-sm text-cream-200/80 font-light leading-relaxed">
              If your event requires multi-hall architectural coordination, custom stage carpentry, or specialized lighting design, our founder and lead designer is available for private consultation.
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/plan-event?package=bespoke-custom"
                className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gold-400 text-burgundy-950 hover:bg-gold-300 transition-colors shadow-md"
              >
                Start Bespoke Request
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cream-50/10 text-cream-100 hover:bg-cream-50/20 border border-white/20 transition-colors"
              >
                Schedule Call
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
