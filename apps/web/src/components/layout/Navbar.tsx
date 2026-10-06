'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../ui/Logo';
import { Menu, X, Phone, Calendar, Smartphone, ShieldCheck, User, LogOut, Sparkles, Mail, Send } from 'lucide-react';

interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified?: boolean;
}

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (pathname?.startsWith('/telegram')) {
    return null;
  }

  const fetchCurrentUser = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => setCurrentUser(null));
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setUserDropdownOpen(false);
      router.push('/');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Bookings', href: '/bookings' },
    { label: 'Inspirations', href: '/inspirations' },
    { label: 'Packages', href: '/packages' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* Top micro-bar for emergency consultation & hotline */}
      <div className="hidden lg:block bg-burgundy-950 text-gold-200/90 text-xs py-2 px-6 border-b border-gold-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gold-400" />
              <span>Concierge: +251 911 234 567</span>
            </span>
            <span className="text-gold-500/40">|</span>
            <span>Addis Ababa • Hawassa • Bishoftu • Adama</span>
          </div>

          <div className="flex items-center gap-4 text-gold-300">
            <a
              href="mailto:contact@mekdidecor.com"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-gold-400" />
              <span>contact@mekdidecor.com</span>
            </a>
            <span className="text-gold-500/40">•</span>
            <a
              href="https://t.me/MekdiDecor_bot"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors font-medium"
            >
              <Send className="w-3.5 h-3.5 text-gold-400" />
              <span>@MekdiDecor_bot</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main sticky navigation */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-gold-500/15 py-3'
            : 'bg-cream-50/80 backdrop-blur-sm py-4 border-b border-charcoal-200/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs tracking-wide font-medium transition-colors relative py-1 ${
                    isActive
                      ? 'text-burgundy-800 font-semibold'
                      : 'text-charcoal-700 hover:text-burgundy-800'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTAs & User Auth */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-100 border border-gold-400/40 text-charcoal-900 text-xs font-semibold hover:bg-cream-200 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-burgundy-900 text-gold-300 flex items-center justify-center text-[10px] font-bold">
                    {currentUser.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 text-xs animate-fadeIn">
                    <div className="px-4 py-2 border-b border-cream-100">
                      <span className="font-semibold text-charcoal-900 block truncate">
                        {currentUser.fullName}
                      </span>
                      <span className="text-[10px] text-charcoal-500 truncate block">
                        {currentUser.email}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-gold-100 text-gold-900">
                        {currentUser.role}
                      </span>
                    </div>

                    <Link
                      href="/bookings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-cream-50 text-charcoal-700 font-medium"
                    >
                      My Bookings & Plans
                    </Link>

                    <Link
                      href="/inspirations"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-cream-50 text-charcoal-700"
                    >
                      Saved Inspirations Board
                    </Link>

                    {currentUser.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-cream-50 text-burgundy-900 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-burgundy-50 text-burgundy-800 flex items-center gap-1.5 border-t border-cream-100 mt-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-charcoal-700 hover:text-burgundy-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-burgundy-900 border border-burgundy-900/30 hover:bg-burgundy-50 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            <Link
              href="/plan-event"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md hover:shadow-lg border border-gold-500/30"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-400" />
              Plan Event
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-charcoal-800 hover:text-burgundy-800 hover:bg-cream-100 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-cream-50 border-b border-gold-500/20 px-6 py-6 shadow-xl animate-fadeIn">
            {currentUser && (
              <div className="mb-4 pb-4 border-b border-cream-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-charcoal-900 block">
                    {currentUser.fullName}
                  </span>
                  <span className="text-[10px] text-charcoal-500 block">
                    {currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-burgundy-800 font-semibold underline"
                >
                  Sign Out
                </button>
              </div>
            )}

            <nav className="flex flex-col gap-3 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-charcoal-800 hover:text-burgundy-800 py-1 border-b border-cream-200/60"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-2">
              {!currentUser && (
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full border border-burgundy-900/30 text-burgundy-900 font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-full bg-burgundy-900 text-cream-50 font-semibold"
                  >
                    Register
                  </Link>
                </div>
              )}

              <Link
                href="/plan-event"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 shadow-md"
              >
                Plan Your Event
              </Link>

              <div className="pt-2 border-t border-cream-200 flex flex-col gap-2 text-center text-xs">
                {currentUser?.role === 'ADMIN' ? (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-burgundy-900 text-gold-300 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : (
                  <a
                    href="https://t.me/MekdiDecor_bot"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2.5 rounded-xl bg-burgundy-900 text-gold-300 font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>Open in Telegram Bot</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
