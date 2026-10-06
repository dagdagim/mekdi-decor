import React from 'react';
import { Sparkles, Compass, Palette, FileCheck2, GlassWater } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Tell Us Your Vision',
      description:
        'Submit your date, guest count, venue, and preferred colors using our interactive event planner or private studio consultation.',
      icon: <Compass className="w-6 h-6 text-gold-500" />,
    },
    {
      step: '02',
      title: 'Create Your Design',
      description:
        'Our design atelier crafts a 3D moodboard, stage blueprints, and botanical recipes customized specifically to your venue architecture.',
      icon: <Palette className="w-6 h-6 text-gold-500" />,
    },
    {
      step: '03',
      title: 'Approve Your Quote',
      description:
        'Receive an itemized digital quotation. Lock your reservation with seamless Ethiopian payment (Telebirr, CBE Birr, or Chapa).',
      icon: <FileCheck2 className="w-6 h-6 text-gold-500" />,
    },
    {
      step: '04',
      title: 'Celebrate Your Moment',
      description:
        'On event day, our master florists and carpenters execute the transformation 12 hours prior so you walk into pure magic.',
      icon: <GlassWater className="w-6 h-6 text-gold-500" />,
    },
  ];

  return (
    <section className="py-24 bg-cream-100/60 border-t border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Seamless Journey
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            How It Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            We eliminate event planning stress with a refined four-step process that guarantees flawless execution on your special day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="relative bg-white rounded-3xl p-8 border border-cream-200 shadow-card hover:shadow-elevated transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-burgundy-950/5 border border-gold-500/30 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="font-editorial text-3xl font-bold text-gold-600/40">
                    {item.step}
                  </span>
                </div>

                <h3 className="font-editorial text-xl font-semibold text-charcoal-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-xs text-charcoal-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-1 text-[11px] font-semibold text-burgundy-800">
                <span>Step {idx + 1} of 4</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
