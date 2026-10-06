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
                href="https://t.me/mekdidecor19"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Telegram Channel"
                title="Telegram Channel @mekdidecor19"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@mekdi.decor3"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="TikTok"
                title="TikTok @mekdi.decor3"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.08a8.16 8.16 0 0 0 4.91 1.63v-3.5a4.85 4.85 0 0 1-1-.52z" />
                </svg>
              </a>
              <a
                href="https://t.me/MekdiDecor_bot"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Telegram Bot"
                title="Telegram Bot @MekdiDecor_bot"
              >
                <span className="text-[10px] font-bold">BOT</span>
              </a>
              <a
                href="tel:+251967698460"
                className="w-9 h-9 rounded-full bg-burgundy-900 border border-gold-500/30 flex items-center justify-center text-gold-300 hover:text-white hover:bg-burgundy-800 transition-colors"
                aria-label="Call 0967698460"
                title="Call 0967698460"
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
                <div className="flex flex-col gap-0.5">
                  <a href="tel:+251967698460" className="hover:text-gold-200">
                    +251 967 698 460
                  </a>
                  <a href="tel:+251900454238" className="hover:text-gold-200 text-cream-300/70">
                    +251 900 454 238
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-gold-400 shrink-0" />
                <a
                  href="https://t.me/mekdidecor19"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold-200"
                >
                  t.me/mekdidecor19
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 fill-current text-gold-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.08a8.16 8.16 0 0 0 4.91 1.63v-3.5a4.85 4.85 0 0 1-1-.52z" />
                </svg>
                <a
                  href="https://www.tiktok.com/@mekdi.decor3"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-gold-200"
                >
                  @mekdi.decor3 (TikTok)
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
