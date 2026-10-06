'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Phone, Mail, MapPin, Instagram, Send, Heart, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/telegram')) {
    return null;
  }

  return (
    <footer className="bg-burgundy-950 text-cream-100 border-t border-gold-500/30 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-burgundy-800/80">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="light" size="lg" />
            <p className="text-cream-200/80 text-sm leading-relaxed max-w-sm font-sans pt-2">
              Transforming spaces into breathtaking celebrations across Ethiopia. We curate bespoke stages, grand floral installations, romantic lighting, and seamless full-venue transformations.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/MekdiDecor_bot"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Telegram Bot"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="tel:+251911234567"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Direct Call"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h4 className="font-editorial text-gold-300 text-sm tracking-wider uppercase font-semibold mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-200/80">
              <li>
                <Link href="/services#stage" className="hover:text-gold-200 transition-colors">
                  Stage Decoration
                </Link>
              </li>
              <li>
                <Link href="/services#floral" className="hover:text-gold-200 transition-colors">
                  Floral Design & Urns
                </Link>
              </li>
              <li>
                <Link href="/services#venue" className="hover:text-gold-200 transition-colors">
                  Venue Draping & Carpeting
                </Link>
              </li>
              <li>
                <Link href="/services#tables" className="hover:text-gold-200 transition-colors">
                  Table & Chair Styling
                </Link>
              </li>
              <li>
                <Link href="/services#entrance" className="hover:text-gold-200 transition-colors">
                  Grand Entrance Arches
                </Link>
              </li>
              <li>
                <Link href="/services#photo" className="hover:text-gold-200 transition-colors">
                  3D Photo Backdrops
                </Link>
              </li>
              <li>
                <Link href="/services#lighting" className="hover:text-gold-200 transition-colors">
                  Architectural Lighting
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-editorial text-gold-300 text-sm tracking-wider uppercase font-semibold mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs text-cream-200/80">
              <li>
                <Link href="/gallery" className="hover:text-gold-200 transition-colors">
                  Portfolio & Stories
                </Link>
              </li>
              <li>
                <Link href="/inspirations" className="hover:text-gold-200 transition-colors">
                  Saved Inspirations Board
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-gold-200 transition-colors">
                  Decoration Packages
                </Link>
              </li>
              <li>
                <Link href="/plan-event" className="hover:text-gold-200 transition-colors font-medium text-gold-300 flex items-center gap-1">
                  Design Your Event <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-gold-200 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold-200 transition-colors">
                  About Mekdes & Team
                </Link>
              </li>
              <li>
                <Link href="/quotes/q-108" className="hover:text-gold-200 transition-colors">
                  Sample Quotation View
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-gold-200 transition-colors">
                  Staff & Admin CRM
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Studio */}
          <div>
            <h4 className="font-editorial text-gold-300 text-sm tracking-wider uppercase font-semibold mb-4">
              Studio & Contact
            </h4>
            <ul className="space-y-3 text-xs text-cream-200/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="tel:+251911234567" className="hover:text-gold-200">
                  +251 911 234 567
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <a href="mailto:contact@mekdidecor.com" className="hover:text-gold-200">
                  contact@mekdidecor.com
                </a>
              </li>
              <li className="pt-2">
                <span className="inline-block text-[11px] bg-burgundy-900 border border-gold-500/25 px-2.5 py-1 rounded text-gold-300">
                  Available for Hawassa & Bishoftu destination events
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-cream-300/60 gap-4">
          <p>© {new Date().getFullYear()} MEKDI DECOR PLC. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gold-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-gold-300 transition-colors">
              Terms of Service
            </Link>
            <span className="flex items-center gap-1 text-gold-400/80">
              Crafted with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for unforgettable moments
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
