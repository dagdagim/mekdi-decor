import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface CategoryItem {
  type: string;
  label: string;
  image: string;
  subtitle: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    type: 'Wedding',
    label: 'Wedding',
    subtitle: 'Majestic stages & bridal florals',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Graduation',
    label: 'Graduation',
    subtitle: 'Honors banquets & gold galas',
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Birthday',
    label: 'Birthday',
    subtitle: 'Milestone soirées & velvet backdrops',
    image: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Engagement',
    label: 'Engagement',
    subtitle: 'Romantic lakeside & garden canopies',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Corporate',
    label: 'Corporate',
    subtitle: 'Summit stages & executive galas',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },
  {
    type: 'Other',
    label: 'Private Event',
    subtitle: 'Bespoke Melse, dinners & celebrations',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80',
  },
];

export const CategoryCards: React.FC = () => {
  return (
    <section className="py-20 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs uppercase tracking-widest text-gold-700 font-semibold mb-2">
            Curated Occasions
          </p>
          <h2 className="font-editorial text-3xl sm:text-4xl text-charcoal-900 font-semibold">
            What are you celebrating?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            Tell us what you&apos;re planning and we&apos;ll help bring your unforgettable moment to life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.type}
              href={`/plan-event?type=${encodeURIComponent(cat.type)}`}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-card border border-cream-200/80 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-elevated"
            >
              <img
                src={cat.image}
                alt={cat.label}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950/95 via-burgundy-950/40 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

              {/* Top arrow indicator */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-cream-50/20 backdrop-blur-md flex items-center justify-center text-cream-100 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowUpRight className="w-4 h-4 text-gold-300" />
              </div>

              {/* Bottom text */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <span className="text-[10px] uppercase tracking-wider text-gold-300 block mb-0.5 font-medium">
                  Occasion
                </span>
                <h3 className="font-editorial text-lg text-cream-50 font-semibold group-hover:text-gold-200 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-cream-200/75 line-clamp-1 mt-0.5">
                  {cat.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
