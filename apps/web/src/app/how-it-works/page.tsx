import React from 'react';
import Link from 'next/link';
import { Sparkles, Compass, Palette, FileCheck2, GlassWater, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Discovery & Vision Session',
      desc: 'Whether through our interactive digital event planner or an in-person espresso at our Bole design studio, we listen intently to your romance, milestones, and spatial desires.',
      icon: <Compass className="w-8 h-8 text-gold-500" />,
      detail: 'We discuss guest flow, lighting conditions, stage visibility, and color psychology.',
    },
    {
      num: '02',
      title: '3D Spatial Design & Moodboard',
      desc: 'Our design architects translate your vision into photorealistic 3D renders, stage blueprints, and floral recipe books.',
      icon: <Palette className="w-8 h-8 text-gold-500" />,
      detail: 'You receive exact dimensions, fabric swatches, and botanical palettes before a single stem is cut.',
    },
    {
      num: '03',
      title: 'Transparent Itemized Quotation',
      desc: 'Receive a clear digital quote with zero hidden charges. Review every line item, request adjustments, and approve with a 50% deposit via Telebirr, CBE, or Chapa.',
      icon: <FileCheck2 className="w-8 h-8 text-gold-500" />,
      detail: 'Instant digital contract, receipt, and booking timeline tracking.',
    },
    {
      num: '04',
      title: 'Execution & Unforgettable Celebration',
      desc: 'Our master florists, carpenters, and lighting engineers arrive 12 hours ahead of schedule. When you step into the ballroom, every detail is breathlessly immaculate.',
      icon: <GlassWater className="w-8 h-8 text-gold-500" />,
      detail: 'Standby decor concierge throughout the night to ensure flawless flower freshness.',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Flawless Delivery
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            How It Works
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Behind every magical celebration is a disciplined, world-class production system.
          </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-card flex flex-col md:flex-row items-start gap-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-burgundy-950 text-gold-400 flex items-center justify-center shrink-0 border border-gold-500/30 shadow-md">
                {step.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-2.5 py-0.5 rounded-full">
                    Step {step.num}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3">
                  {step.title}
                </h3>

                <p className="text-sm text-charcoal-700 leading-relaxed font-light mb-4">
                  {step.desc}
                </p>

                <div className="p-3.5 rounded-xl bg-cream-100/70 border border-cream-200 text-xs text-charcoal-600 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-burgundy-800 shrink-0" />
                  <span>{step.detail}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/plan-event"
            className="inline-flex items-center gap-2 px-9 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md"
          >
            <span>Start Step 1: Plan Your Event</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>
      </div>
    </div>
  );
}
