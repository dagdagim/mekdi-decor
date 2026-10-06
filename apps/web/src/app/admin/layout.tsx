'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpenCheck,
  FileText,
  CreditCard,
  Image as ImageIcon,
  Package,
  CalendarDays,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  Search,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Requests', href: '/admin/requests', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'Customers', href: '/admin/customers', icon: <Users className="w-4 h-4" /> },
    { label: 'Quotes', href: '/admin/quotes', icon: <FileText className="w-4 h-4" /> },
    { label: 'Bookings', href: '/admin/bookings', icon: <BookOpenCheck className="w-4 h-4" /> },
    { label: 'Payments', href: '/admin/payments', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Calendar', href: '/admin/calendar', icon: <CalendarDays className="w-4 h-4" /> },
    { label: 'Gallery', href: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { label: 'Packages', href: '/admin/packages', icon: <Package className="w-4 h-4" /> },
    { label: 'Messages', href: '/admin/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col lg:flex-row text-charcoal-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="lg:hidden bg-burgundy-950 text-cream-50 p-4 flex items-center justify-between border-b border-gold-500/20">
        <Logo variant="light" size="sm" />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-gold-300 hover:bg-burgundy-900"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar (Deep Burgundy Matching Mockup) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-burgundy-950 text-cream-100 flex flex-col justify-between border-r border-gold-500/20 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Brand Header */}
          <div className="p-6 border-b border-burgundy-900/80 flex items-center justify-between">
            <Logo variant="light" size="sm" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-cream-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-burgundy-800 text-gold-300 font-semibold shadow-sm border border-gold-500/30'
                      : 'text-cream-200/80 hover:bg-burgundy-900 hover:text-cream-50'
                  }`}
                >
                  <span className={isActive ? 'text-gold-300' : 'text-cream-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile / Quick Link */}
        <div className="p-4 border-t border-burgundy-900/80">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-cream-300/80 hover:bg-burgundy-900 hover:text-white transition-colors mb-3"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
              <span>Public Website</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-burgundy-900/70 border border-gold-500/20">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Mekdes Tadesse"
              className="w-8 h-8 rounded-full object-cover border border-gold-400/50"
            />
            <div className="overflow-hidden">
              <span className="font-editorial text-xs font-bold text-cream-50 block truncate">
                Mekdes Tadesse
              </span>
              <span className="text-[10px] text-gold-300 font-medium block">
                Lead Designer (Admin)
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Admin Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-cream-200 px-6 py-4 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests, quotes, customers..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-cream-50 border border-cream-200 text-xs text-charcoal-800 placeholder:text-charcoal-400 focus:outline-none focus:border-burgundy-800"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-charcoal-600 hover:bg-cream-100 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-burgundy-700" />
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-cream-200">
              <span className="text-xs font-semibold text-charcoal-800 hidden sm:block">
                Admin
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
