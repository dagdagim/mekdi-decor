import React from 'react';
import Link from 'next/link';
import { SERVICES_DATA } from '@/lib/data/mock-db';
import { ArrowRight, Crown, Sparkles, Utensils, DoorOpen, Camera, Lightbulb, Palette } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const ServicesSection: React.FC = () => {
  const iconMap: Record<string, React.ReactNode> = {
    Crown: <Crown className="w-5 h-5 text-gold-500" />,
    Flower2: <Sparkles className="w-5 h-5 text-gold-500" />,
    Sparkles: <Sparkles className="w-5 h-5 text-gold-500" />,
    Utensils: <Utensils className="w-5 h-5 text-gold-500" />,
    DoorOpen: <DoorOpen className="w-5 h-5 text-gold-500" />,
    Camera: <Camera className="w-5 h-5 text-gold-500" />,
    Lightbulb: <Lightbulb className="w-5 h-5 text-gold-500" />,
    Palette: <Palette className="w-5 h-5 text-gold-500" />,
  };

  return (
    <section className="py-24 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mb-2">
            Artistry & Execution
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Our Bespoke Services
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Every celebration requires specialized mastery. From structural stage carpentry to delicate fresh florals, we craft every layer with intention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-card border border-cream-200/90 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              {/* Image Frame */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.featuredImage}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
                <div className="absolute top-3 left-3 w-9 h-9 rounded-full bg-cream-50/90 backdrop-blur-md flex items-center justify-center shadow-sm">
                  {iconMap[service.iconName] || <Sparkles className="w-4 h-4 text-gold-500" />}
                </div>
              </div>

              {/* Text content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-semibold text-charcoal-900 group-hover:text-burgundy-800 transition-colors">
                    {service.title}
                  </h3>
                  <p className="mt-2 text-xs text-charcoal-600 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-cream-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-500 block">
                      Starting from
                    </span>
                    <span className="text-xs font-semibold text-burgundy-900">
                      {formatCurrency(service.startingPrice, service.currency)}
                    </span>
                  </div>

                  <Link
                    href={`/services#${service.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-burgundy-900 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md"
          >
            <span>View All Services in Detail</span>
            <ArrowRight className="w-4 h-4 text-gold-400" />
          </Link>
        </div>
      </div>
    </section>
  );
};
