'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Home,
  Compass,
  Calendar,
  MessageCircle,
  User,
  Sparkles,
  Heart,
  Share2,
  ChevronRight,
  ChevronLeft,
  Check,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Palette,
  Users,
  DollarSign,
  ArrowRight,
  Lock,
} from 'lucide-react';
import {
  GalleryProject,
  PackageItem,
  ServiceItem,
  Quote,
  Booking,
  MessageItem,
  CustomerCRM,
  EventType,
  DecorationStyle,
  VenueType,
} from '@/lib/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

type NavTab = 'home' | 'explore' | 'events' | 'messages' | 'profile';

export default function TelegramMiniAppPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isTelegramEnv, setIsTelegramEnv] = useState<boolean>(false);
  const [tgUser, setTgUser] = useState<any>(null);
  const [sessionCustomer, setSessionCustomer] = useState<CustomerCRM | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Live Backend Data
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [gallery, setGallery] = useState<GalleryProject[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [savedInspirations, setSavedInspirations] = useState<string[]>([]);

  // UI Modals & State
  const [plannerOpen, setPlannerOpen] = useState<boolean>(false);
  const [plannerStep, setPlannerStep] = useState<number>(1);
  const [plannerSubmitting, setPlannerSubmitting] = useState<boolean>(false);
  const [plannerSuccess, setPlannerSuccess] = useState<any>(null);

  const [selectedProject, setSelectedProject] = useState<GalleryProject | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [quoteActionLoading, setQuoteActionLoading] = useState<boolean>(false);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);

  // Message composer
  const [messageInput, setMessageInput] = useState<string>('');
  const [messageSending, setMessageSending] = useState<boolean>(false);

  // Gallery filter
  const [galleryFilter, setGalleryFilter] = useState<string>('ALL');

  // Multi-step Planner Form State
  const [planForm, setPlanForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    eventType: 'Wedding' as EventType,
    eventDate: '',
    guestCount: 250,
    venueType: 'Hotel' as VenueType,
    venueName: '',
    stylePreference: 'Luxury' as DecorationStyle,
    colorPalette: ['#5B1424', '#D4AF37', '#FAF6F0'],
    selectedServices: ['Stage & Backdrop', 'Grand Floral Centerpieces', 'Mood Lighting'],
    budgetRange: '250,000 - 500,000 ETB',
    specialNotes: '',
  });

  // Haptic feedback trigger
  const triggerHaptic = (style: 'light' | 'medium' | 'heavy' | 'selection' = 'light') => {
    try {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
        if (style === 'selection') {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        } else {
          window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
        }
      }
    } catch {}
  };

  // 1. Initialize Telegram WebApp SDK & Server-side Auth
  useEffect(() => {
    const initTelegram = async () => {
      if (typeof window === 'undefined') return;
      const tg = window.Telegram?.WebApp;

      if (tg) {
        setIsTelegramEnv(true);
        try {
          tg.ready();
          tg.expand();
          tg.enableClosingConfirmation();
          // Apply Telegram header color
          if (tg.setHeaderColor) tg.setHeaderColor('#140F11');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#140F11');
        } catch {}

        const rawInitData = tg.initData;
        const unsafeUser = tg.initDataUnsafe?.user;
        const startParam = tg.initDataUnsafe?.start_param;

        if (unsafeUser) {
          setTgUser(unsafeUser);
          setPlanForm((prev) => ({
            ...prev,
            guestName: [unsafeUser.first_name, unsafeUser.last_name].filter(Boolean).join(' ') || prev.guestName,
          }));
        }

        // Authenticate cryptographically on backend
        if (rawInitData) {
          try {
            const authRes = await fetch('/api/telegram/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: rawInitData }),
            });
            const authData = await authRes.json();
            if (authData.success && authData.data) {
              setSessionCustomer(authData.data.customer);
              if (authData.data.customer) {
                setPlanForm((prev) => ({
                  ...prev,
                  guestName: authData.data.customer.fullName || prev.guestName,
                  guestEmail: authData.data.customer.email || prev.guestEmail,
                  guestPhone: authData.data.customer.phone || prev.guestPhone,
                }));
              }
            }
          } catch (e) {
            console.warn('[Telegram Mini App] Server auth error:', e);
          }
        }

        // Deep links handling (start_param)
        handleDeepLink(startParam);
      } else {
        // Fallback for desktop/mobile browser testing
        console.log('[Telegram Mini App] Preview Mode: Running outside Telegram');
        setTgUser({
          id: 'demo-777',
          first_name: 'Sara',
          last_name: 'Tekle',
          username: 'sara_tekle',
        });
      }

      // Check URL query parameters as well
      const urlParams = new URLSearchParams(window.location.search);
      const urlStart = urlParams.get('startapp') || urlParams.get('tab');
      if (urlStart) handleDeepLink(urlStart);

      setAuthLoading(false);
    };

    initTelegram();
  }, []);

  // Handle Telegram BackButton
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isAnyModalOpen = plannerOpen || selectedProject !== null || selectedQuote !== null || selectedBooking !== null;

    if (isAnyModalOpen) {
      tg.BackButton.show();
      const handleBack = () => {
        triggerHaptic('light');
        if (plannerOpen) setPlannerOpen(false);
        if (selectedProject) setSelectedProject(null);
        if (selectedQuote) setSelectedQuote(null);
        if (selectedBooking) setSelectedBooking(null);
      };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [plannerOpen, selectedProject, selectedQuote, selectedBooking]);

  // Deep Link helper
  const handleDeepLink = (param?: string | null) => {
    if (!param) return;
    const p = param.toLowerCase();
    if (p === 'wedding' || p === 'graduation' || p === 'birthday' || p === 'engagement' || p === 'corporate') {
      const typeMap: Record<string, EventType> = {
        wedding: 'Wedding',
        graduation: 'Graduation',
        birthday: 'Birthday',
        engagement: 'Engagement',
        corporate: 'Corporate',
      };
      setPlanForm((prev) => ({ ...prev, eventType: typeMap[p] || 'Wedding' }));
      setPlannerOpen(true);
      setPlannerStep(1);
    } else if (p === 'plan') {
      setPlannerOpen(true);
      setPlannerStep(1);
    } else if (p === 'events') {
      setActiveTab('events');
    } else if (p === 'quotes') {
      setActiveTab('events');
    } else if (p === 'gallery' || p === 'explore') {
      setActiveTab('explore');
    }
  };

  // 2. Fetch Live Backend Data (reusing existing APIs)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, galRes, srvRes] = await Promise.all([
          fetch('/api/packages').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/gallery').then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/services').then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        if (pkgRes.data) setPackages(pkgRes.data);
        if (galRes.data) setGallery(galRes.data);
        if (srvRes.data) setServices(srvRes.data);
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    fetchData();
  }, []);

  // Fetch user-specific quotes and bookings
  useEffect(() => {
    const fetchUserData = async () => {
      const email = sessionCustomer?.email || 'sara.t@example.com';
      try {
        const [quotesRes, bookingsRes, msgRes] = await Promise.all([
          fetch(`/api/quotes?email=${encodeURIComponent(email)}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch(`/api/bookings?email=${encodeURIComponent(email)}`).then((r) => r.json()).catch(() => ({ data: [] })),
          fetch('/api/messages').then((r) => r.json()).catch(() => ({ data: [] })),
        ]);

        if (quotesRes.data) setQuotes(quotesRes.data);
        if (bookingsRes.data) setBookings(bookingsRes.data);
        if (msgRes.data) setMessages(msgRes.data);
      } catch (err) {
        console.warn('Error fetching client events:', err);
      }
    };

    fetchUserData();
  }, [sessionCustomer]);

  // Filtered gallery
  const filteredGallery = useMemo(() => {
    if (galleryFilter === 'ALL') return gallery;
    return gallery.filter((p) => p.eventType.toUpperCase() === galleryFilter.toUpperCase());
  }, [gallery, galleryFilter]);

  // Toggle inspiration
  const toggleSaveInspiration = async (projectId: string) => {
    triggerHaptic('medium');
    setSavedInspirations((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
    try {
      await fetch('/api/inspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
    } catch {}
  };

  // Submit Event Request through existing /api/event-requests
  const handlePlannerSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPlannerSubmitting(true);
    triggerHaptic('heavy');

    try {
      const res = await fetch('/api/event-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planForm,
          guestName: planForm.guestName || tgUser?.first_name || 'Mekdi Client',
          guestEmail: planForm.guestEmail || (tgUser?.id ? `tg_${tgUser.id}@telegram.mekdidecor.com` : 'client@mekdidecor.com'),
          guestPhone: planForm.guestPhone || '+251 911 000 000',
          telegramUserId: tgUser?.id ? String(tgUser.id) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlannerSuccess(data.data);
        // Refresh quotes / requests
      } else {
        alert(data.error || 'Failed to submit event vision. Please check required fields.');
      }
    } catch (err: any) {
      alert('Network error. Please try again.');
    } finally {
      setPlannerSubmitting(false);
    }
  };

  // Handle Quote actions (ACCEPT, REVISION_REQUESTED, DECLINE)
  const handleQuoteStatusChange = async (quoteId: string, status: 'ACCEPTED' | 'REVISION_REQUESTED' | 'DECLINED') => {
    setQuoteActionLoading(true);
    triggerHaptic('heavy');
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) => prev.map((q) => (q.id === quoteId ? { ...q, status } : q)));
        if (selectedQuote && selectedQuote.id === quoteId) {
          setSelectedQuote({ ...selectedQuote, status });
        }
      }
    } catch {}
    setQuoteActionLoading(false);
  };

  // Initialize Chapa deposit payment
  const handleInitiatePayment = async (quote: Quote) => {
    setPaymentLoading(true);
    triggerHaptic('heavy');

    const depositAmount = Math.round(Number(quote.totalAmount) * 0.5);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: `BK-${quote.id}`,
          quoteId: quote.id,
          customerId: sessionCustomer?.id || 'c-tg',
          customerName: sessionCustomer?.fullName || tgUser?.first_name || 'Valued Client',
          customerEmail: sessionCustomer?.email || 'client@mekdidecor.com',
          customerPhone: sessionCustomer?.phone || '+251911234567',
          amount: depositAmount,
          currency: 'ETB',
          description: `50% Deposit for ${quote.title || 'Mekdi Decor Event'}`,
          origin: window.location.origin,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        if (window.Telegram?.WebApp?.openLink) {
          window.Telegram.WebApp.openLink(data.checkoutUrl);
        } else {
          window.open(data.checkoutUrl, '_blank');
        }
      } else {
        alert('Could not initialize payment session. Please contact concierge.');
      }
    } catch (e) {
      alert('Payment initialization failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    setMessageSending(true);
    triggerHaptic('medium');

    const newMsgPayload = {
      eventId: bookings[0]?.eventId || 'e-108',
      senderName: sessionCustomer?.fullName || tgUser?.first_name || 'Client',
      senderRole: 'CUSTOMER' as const,
      content: messageInput.trim(),
    };

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsgPayload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [...prev, data.data]);
        setMessageInput('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMessageSending(false);
    }
  };

  const greetingName = tgUser?.first_name || sessionCustomer?.fullName?.split(' ')[0] || 'Valued Guest';

  return (
    <div className="flex flex-col min-h-screen pb-20 select-none">
      {/* =========================================================================
          TOP LUXURY HEADER
      ========================================================================== */}
      <header className="sticky top-0 z-30 bg-[#140F11]/95 backdrop-blur-md border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mekdi Monogram */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B1424] to-[#2E070D] border border-[#D4AF37]/50 flex items-center justify-center shadow-gold">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif tracking-[0.2em] text-sm font-bold text-[#FAF6F0] uppercase">
                Mekdi Decor
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-sans font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-full">
                VIP
              </span>
            </div>
            <p className="text-[10px] text-[#D4AF37]/80 tracking-wider font-serif italic">
              Making Moments Unforgettable
            </p>
          </div>
        </div>

        {/* User Greeting & Hotline */}
        <div className="flex items-center gap-2">
          <a
            href="tel:+251911234567"
            onClick={() => triggerHaptic('light')}
            className="w-8 h-8 rounded-full bg-[#5B1424]/40 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] hover:bg-[#5B1424] transition-colors"
            title="Call Concierge"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
          <div
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('profile');
            }}
            className="flex items-center gap-2 cursor-pointer bg-[#1C1518] px-2.5 py-1 rounded-full border border-[#D4AF37]/25"
          >
            <div className="w-5 h-5 rounded-full bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-semibold flex items-center justify-center">
              {greetingName.charAt(0)}
            </div>
            <span className="text-xs font-medium text-[#FAF6F0] max-w-[80px] truncate">
              {greetingName}
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          TAB CONTENT AREA
      ========================================================================== */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        {/* -----------------------------------------------------------------------
            TAB 1: HOME
        ------------------------------------------------------------------------ */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Personalized Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#5B1424] via-[#4A0E17] to-[#2E070D] border border-[#D4AF37]/40 p-5 shadow-elevated">
              <div className="absolute top-0 right-0 w-44 h-44 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3">
                <span className="inline-block text-[10px] tracking-[0.25em] uppercase font-semibold text-[#D4AF37] bg-[#140F11]/50 px-2.5 py-1 rounded-full border border-[#D4AF37]/30">
                  Luxury Atelier Ethiopia
                </span>

                <h1 className="font-serif text-2xl font-bold text-[#FAF6F0] leading-snug">
                  Your Vision. <br />
                  <span className="text-[#D4AF37] italic font-normal">Our Decoration.</span> <br />
                  Your Perfect Moment.
                </h1>

                <p className="text-xs text-[#FAF6F0]/80 leading-relaxed font-sans max-w-xs">
                  Bespoke wedding stages, floral installations, and grand venues across Addis Ababa and Hawassa.
                </p>

                <div className="pt-2 flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C1917] font-semibold text-xs py-3 px-4 rounded-xl shadow-gold transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PLAN MY EVENT</span>
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab('explore');
                    }}
                    className="bg-[#140F11]/80 hover:bg-[#140F11] border border-[#D4AF37]/40 text-[#FAF6F0] text-xs font-medium py-3 px-3.5 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
                  >
                    <span>EXPLORE</span>
                    <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Event Categories Grid */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-sm font-semibold tracking-wide text-[#FAF6F0]">
                  Celebration Categories
                </h2>
                <span className="text-[11px] text-[#D4AF37] font-sans">Tap to Plan</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Wedding', icon: '💍', type: 'Wedding' as EventType },
                  { name: 'Graduation', icon: '🎓', type: 'Graduation' as EventType },
                  { name: 'Birthday', icon: '🎂', type: 'Birthday' as EventType },
                  { name: 'Engagement', icon: '✨', type: 'Engagement' as EventType },
                  { name: 'Corporate', icon: '🏛️', type: 'Corporate' as EventType },
                  { name: 'Private Event', icon: '🥂', type: 'Private Event' as EventType },
                ].map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlanForm((prev) => ({ ...prev, eventType: cat.type }));
                      setPlannerOpen(true);
                      setPlannerStep(2);
                    }}
                    className="bg-[#1C1518] hover:bg-[#251B1F] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 p-2.5 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all active:scale-95 group"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-[11px] font-medium text-[#FAF6F0] tracking-wide">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Portfolio Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-sm font-semibold text-[#FAF6F0]">Featured Portfolio</h2>
                  <p className="text-[10px] text-[#D4AF37]/75">Recent transformations across Ethiopia</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('explore');
                  }}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-3">
                {gallery.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedProject(item);
                    }}
                    className="bg-[#1C1518] rounded-2xl border border-[#D4AF37]/25 overflow-hidden active:scale-[0.98] transition-transform cursor-pointer shadow-soft group"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-black/40">
                      <img
                        src={item.heroImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#140F11] via-transparent to-black/30" />
                      <div className="absolute top-2.5 left-2.5 bg-[#5B1424]/90 backdrop-blur-sm border border-[#D4AF37]/40 px-2 py-0.5 rounded-md text-[10px] font-medium text-[#FAF6F0]">
                        {item.eventType}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveInspiration(item.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#140F11]/70 backdrop-blur-sm border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedInspirations.includes(item.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#FAF6F0]'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif text-sm font-bold text-[#FAF6F0] truncate">{item.title}</h3>
                        <span className="text-[11px] font-semibold text-[#D4AF37] shrink-0 font-sans">
                          {item.estimatedPriceRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-[#FAF6F0]/70">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D4AF37]" />
                          {item.venueName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#D4AF37]" />
                          {item.guestCount} Guests
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signature Packages Carousel */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-sm font-semibold text-[#FAF6F0]">Signature Packages</h2>
                  <p className="text-[10px] text-[#D4AF37]/75">Curated tier options with guaranteed luxury</p>
                </div>
              </div>

              <div className="space-y-3">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/25 p-4 space-y-3 relative overflow-hidden"
                  >
                    {pkg.tierLabel && (
                      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-wider font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full">
                        {pkg.tierLabel}
                      </span>
                    )}
                    <div>
                      <h3 className="font-serif text-base font-bold text-[#FAF6F0]">{pkg.name}</h3>
                      <p className="text-xs text-[#D4AF37] font-sans mt-0.5 font-semibold">
                        Starting at {Number(pkg.startingPrice).toLocaleString()} {pkg.currency}
                      </p>
                      <p className="text-[11px] text-[#FAF6F0]/70 mt-1">{pkg.tagline}</p>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-[#D4AF37]/15">
                      {pkg.includedServices.slice(0, 3).map((s, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] text-[#FAF6F0]/80">
                          <Check className="w-3 h-3 text-[#D4AF37]" />
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        setPlanForm((prev) => ({
                          ...prev,
                          specialNotes: `Selected Package: ${pkg.name} (${Number(pkg.startingPrice).toLocaleString()} ${pkg.currency})`,
                        }));
                        setPlannerOpen(true);
                        setPlannerStep(1);
                      }}
                      className="w-full bg-[#5B1424] hover:bg-[#6E1125] text-[#FAF6F0] text-xs font-semibold py-2 rounded-lg border border-[#D4AF37]/30 flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Choose {pkg.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Atelier Direct Concierge Callout */}
            <div className="bg-gradient-to-r from-[#1C1518] to-[#251A1E] rounded-xl border border-[#D4AF37]/30 p-4 flex items-center justify-between">
              <div className="space-y-0.5 max-w-[210px]">
                <h4 className="font-serif text-xs font-bold text-[#FAF6F0]">Private Atelier Consultation</h4>
                <p className="text-[10px] text-[#FAF6F0]/70">
                  Speak directly with creative director Mekdi for bespoke celebrations.
                </p>
              </div>
              <a
                href="tel:+251911234567"
                onClick={() => triggerHaptic('medium')}
                className="bg-[#D4AF37] text-[#1C1917] font-semibold text-xs px-3 py-2 rounded-lg shadow-gold flex items-center gap-1 shrink-0"
              >
                <Phone className="w-3 h-3" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: EXPLORE (GALLERY & INSPIRATIONS)
        ------------------------------------------------------------------------ */}
        {activeTab === 'explore' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h1 className="font-serif text-xl font-bold text-[#FAF6F0]">Gallery & Inspirations</h1>
              <p className="text-xs text-[#D4AF37]/80">Explore our signature atmospheres and color schemes</p>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'Wedding', 'Graduation', 'Birthday', 'Engagement', 'Corporate'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('selection');
                    setGalleryFilter(cat);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    galleryFilter === cat
                      ? 'bg-[#D4AF37] text-[#1C1917] font-semibold shadow-gold'
                      : 'bg-[#1C1518] text-[#FAF6F0]/80 border border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-3.5">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedProject(item);
                  }}
                  className="bg-[#1C1518] rounded-2xl border border-[#D4AF37]/25 overflow-hidden shadow-soft cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="relative h-48 w-full bg-black/40">
                    <img
                      src={item.heroImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#140F11] via-transparent to-black/30" />
                    <div className="absolute top-2.5 left-2.5 bg-[#5B1424]/90 backdrop-blur-sm border border-[#D4AF37]/40 px-2.5 py-0.5 rounded-md text-[10px] font-medium text-[#FAF6F0]">
                      {item.eventType}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveInspiration(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#140F11]/70 backdrop-blur-sm border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          savedInspirations.includes(item.id) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#FAF6F0]'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-sm font-bold text-[#FAF6F0]">{item.title}</h3>
                      <span className="text-xs font-semibold text-[#D4AF37] font-sans">
                        {item.estimatedPriceRange}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#FAF6F0]/70 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Color Swatches */}
                    {item.colorPalette && item.colorPalette.length > 0 && (
                      <div className="flex items-center gap-1 pt-1">
                        <span className="text-[10px] text-[#FAF6F0]/50 mr-1">Palette:</span>
                        {item.colorPalette.map((hex, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 3: MY EVENTS (QUOTES, BOOKINGS, TIMELINE)
        ------------------------------------------------------------------------ */}
        {activeTab === 'events' && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h1 className="font-serif text-xl font-bold text-[#FAF6F0]">My Celebrations</h1>
              <p className="text-xs text-[#D4AF37]/80">Track quotations, confirmed bookings, and event dates</p>
            </div>

            {/* Active Bookings Section */}
            <div className="space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#FAF6F0] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                <span>Confirmed Bookings</span>
              </h2>

              {bookings.length === 0 ? (
                <div className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/20 p-4 text-center space-y-2">
                  <p className="text-xs text-[#FAF6F0]/60">No confirmed bookings yet.</p>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline"
                  >
                    Plan your event to receive a booking &rarr;
                  </button>
                </div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedBooking(b);
                    }}
                    className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/30 p-3.5 space-y-2.5 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#D4AF37] bg-[#140F11] px-2 py-0.5 rounded border border-[#D4AF37]/20">
                        {b.bookingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          b.depositPaid
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {b.depositPaid ? 'DEPOSIT SECURED' : 'DEPOSIT PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-sm font-bold text-[#FAF6F0]">
                          {b.eventTitle || 'Bespoke Luxury Celebration'}
                        </h3>
                        <p className="text-[11px] text-[#FAF6F0]/70 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#D4AF37]" />
                          {b.eventDate || 'Dec 18, 2026'} &bull; {b.venueName || 'Addis Ababa'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </div>

                    <div className="pt-2 border-t border-[#D4AF37]/15 flex items-center justify-between text-[11px]">
                      <span className="text-[#FAF6F0]/70">Remaining Balance:</span>
                      <span className="font-bold text-[#D4AF37]">
                        {Number(b.balanceAmount).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quotations Section */}
            <div className="space-y-3">
              <h2 className="font-serif text-sm font-semibold text-[#FAF6F0] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D4AF37]" />
                <span>Decorative Quotations</span>
              </h2>

              {quotes.length === 0 ? (
                <div className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/20 p-4 text-center space-y-2">
                  <p className="text-xs text-[#FAF6F0]/60">No pending quotes.</p>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="text-xs font-semibold text-[#D4AF37] hover:underline"
                  >
                    Submit an event request to get a quote &rarr;
                  </button>
                </div>
              ) : (
                quotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedQuote(q);
                    }}
                    className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/30 p-3.5 space-y-2.5 active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#D4AF37] bg-[#140F11] px-2 py-0.5 rounded border border-[#D4AF37]/20">
                        {q.quoteNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                            : q.status === 'REVISION_REQUESTED'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                            : q.status === 'DECLINED'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-sm font-bold text-[#FAF6F0]">{q.title}</h3>
                        <p className="text-[11px] text-[#FAF6F0]/70 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#D4AF37]" />
                          Valid until: {q.validityDate}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                    </div>

                    <div className="pt-2 border-t border-[#D4AF37]/15 flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#FAF6F0]/70">Total Investment:</span>
                      <span className="text-[#D4AF37] font-bold">
                        {Number(q.totalAmount).toLocaleString()} {q.currency}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 4: MESSAGES (CLIENT CONCIERGE CHAT)
        ------------------------------------------------------------------------ */}
        {activeTab === 'messages' && (
          <div className="flex flex-col h-[75vh] animate-fadeIn">
            <div className="pb-3 border-b border-[#D4AF37]/20 flex items-center justify-between">
              <div>
                <h1 className="font-serif text-lg font-bold text-[#FAF6F0]">Atelier Concierge</h1>
                <p className="text-[11px] text-[#D4AF37]/80">Direct communication with Mekdi Decor design directors</p>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Online" />
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#FAF6F0]/60">
                  <MessageCircle className="w-8 h-8 text-[#D4AF37]/50" />
                  <p className="text-xs">No messages yet. Send a message to start conversing with our team.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const isCustomer = m.senderRole === 'CUSTOMER';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-[#FAF6F0]/60">
                        <span className="font-medium text-[#D4AF37]">{m.senderName}</span>
                        <span>&bull;</span>
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isCustomer
                            ? 'bg-[#5B1424] text-[#FAF6F0] rounded-br-none border border-[#D4AF37]/30'
                            : 'bg-[#1C1518] text-[#FAF6F0] rounded-bl-none border border-[#D4AF37]/20 shadow-soft'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message to the design team..."
                className="flex-1 bg-[#1C1518] border border-[#D4AF37]/30 rounded-xl px-3.5 py-2.5 text-xs text-[#FAF6F0] placeholder:text-[#FAF6F0]/40 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                type="submit"
                disabled={messageSending || !messageInput.trim()}
                className="bg-[#D4AF37] text-[#1C1917] p-2.5 rounded-xl disabled:opacity-50 active:scale-95 transition-transform shrink-0 font-semibold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 5: PROFILE
        ------------------------------------------------------------------------ */}
        {activeTab === 'profile' && (
          <div className="space-y-5 animate-fadeIn">
            {/* User Card */}
            <div className="bg-[#1C1518] rounded-2xl border border-[#D4AF37]/30 p-5 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#5B1424] to-[#2E070D] border-2 border-[#D4AF37] flex items-center justify-center text-xl font-bold text-[#D4AF37] shadow-gold">
                  {greetingName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-base font-bold text-[#FAF6F0]">{greetingName}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37] text-[#1C1917]">
                      VIP CLIENT
                    </span>
                  </div>
                  {tgUser?.username && (
                    <p className="text-xs text-[#D4AF37]">@{tgUser.username}</p>
                  )}
                  <p className="text-[11px] text-[#FAF6F0]/60 mt-0.5">
                    Telegram ID: {tgUser?.id || 'Connected'}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D4AF37]/15">
                <div className="bg-[#140F11] p-3 rounded-xl border border-[#D4AF37]/15 text-center">
                  <span className="block text-xs text-[#FAF6F0]/60">Booked Events</span>
                  <span className="text-base font-bold text-[#D4AF37] font-serif">
                    {bookings.length || 1}
                  </span>
                </div>
                <div className="bg-[#140F11] p-3 rounded-xl border border-[#D4AF37]/15 text-center">
                  <span className="block text-xs text-[#FAF6F0]/60">Inspirations</span>
                  <span className="text-base font-bold text-[#D4AF37] font-serif">
                    {savedInspirations.length || 2}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions & Contact */}
            <div className="space-y-2">
              <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">Mekdi Decor Atelier</h3>

              <div className="bg-[#1C1518] rounded-xl border border-[#D4AF37]/20 divide-y divide-[#D4AF37]/15">
                <a
                  href="tel:+251911234567"
                  className="p-3.5 flex items-center justify-between hover:bg-[#251B1F] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF6F0]">Direct Atelier Phone</span>
                      <span className="block text-[11px] text-[#FAF6F0]/60">+251 911 234 567</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </a>

                <div className="p-3.5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-[#FAF6F0]">Flagship Studio</span>
                    <span className="block text-[11px] text-[#FAF6F0]/60 leading-tight">
                      Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa
                    </span>
                  </div>
                </div>

                <a
                  href="https://t.me/MekdiDecor_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3.5 flex items-center justify-between hover:bg-[#251B1F] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-4 h-4 text-[#D4AF37]" />
                    <div>
                      <span className="block text-xs font-semibold text-[#FAF6F0]">Official Telegram Bot</span>
                      <span className="block text-[11px] text-[#FAF6F0]/60">@MekdiDecor_bot</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                </a>
              </div>
            </div>

            {/* Version & Security */}
            <div className="text-center pt-2 space-y-1">
              <p className="text-[10px] text-[#FAF6F0]/40 uppercase tracking-widest font-mono">
                Mekdi Decor Telegram Client v1.0 &bull; Secure HMAC-SHA256
              </p>
              <p className="text-[10px] text-[#D4AF37]/60 italic font-serif">
                Making Moments Unforgettable &mdash; Addis Ababa, Ethiopia
              </p>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM NAVIGATION BAR (5 TABS)
      ========================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#140F11]/95 backdrop-blur-lg border-t border-[#D4AF37]/25 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {[
            { id: 'home' as NavTab, label: 'HOME', icon: Home },
            { id: 'explore' as NavTab, label: 'EXPLORE', icon: Compass },
            { id: 'events' as NavTab, label: 'MY EVENTS', icon: Calendar, badge: quotes.length || bookings.length },
            { id: 'messages' as NavTab, label: 'MESSAGES', icon: MessageCircle },
            { id: 'profile' as NavTab, label: 'PROFILE', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-3 transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-[#FAF6F0]/60 hover:text-[#FAF6F0]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {Boolean(tab.badge) && (
                    <span className="absolute -top-1 -right-2 bg-[#5B1424] border border-[#D4AF37] text-[#FAF6F0] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wider mt-1 font-sans ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5 shadow-gold" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* =========================================================================
          12-STEP EVENT PLANNER MODAL WIZARD
      ========================================================================== */}
      {plannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C1518] border-t sm:border border-[#D4AF37]/40 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#140F11]">
              <div>
                <span className="text-[10px] text-[#D4AF37] font-mono uppercase tracking-widest">
                  Step {plannerStep} of 12
                </span>
                <h2 className="font-serif text-base font-bold text-[#FAF6F0]">Bespoke Event Planner</h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setPlannerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-[#1C1518] text-[#FAF6F0]/70 hover:text-[#FAF6F0] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full bg-[#140F11] h-1">
              <div
                className="bg-[#D4AF37] h-full transition-all duration-300"
                style={{ width: `${(plannerStep / 12) * 100}%` }}
              />
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* SUCCESS VIEW */}
              {plannerSuccess ? (
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-[#5B1424] border-2 border-[#D4AF37] text-[#D4AF37] flex items-center justify-center mx-auto shadow-gold">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-[#FAF6F0]">
                      Your Event Vision Has Been Received
                    </h3>
                    <p className="text-xs text-[#FAF6F0]/80 mt-1 max-w-sm mx-auto leading-relaxed">
                      Our creative directors will evaluate your requirements and curate a bespoke decorative quotation within 24 hours.
                    </p>
                  </div>
                  <div className="bg-[#140F11] p-3 rounded-xl border border-[#D4AF37]/30 font-mono text-xs text-[#D4AF37]">
                    Request #{plannerSuccess.requestNumber}
                  </div>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setPlannerOpen(false);
                        setPlannerSuccess(null);
                        setActiveTab('events');
                      }}
                      className="bg-[#D4AF37] text-[#1C1917] font-semibold text-xs py-3 rounded-xl"
                    >
                      VIEW IN MY EVENTS
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setPlannerOpen(false);
                        setPlannerSuccess(null);
                        setActiveTab('home');
                      }}
                      className="text-xs text-[#FAF6F0]/70 py-2 hover:underline"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Event Type */}
                  {plannerStep === 1 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        1. What type of celebration are we decorating?
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['Wedding', 'Graduation', 'Birthday', 'Engagement', 'Corporate', 'Private Event'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, eventType: type as EventType }));
                            }}
                            className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                              planForm.eventType === type
                                ? 'bg-[#5B1424] text-[#FAF6F0] border-[#D4AF37] shadow-gold'
                                : 'bg-[#140F11] text-[#FAF6F0]/70 border-[#D4AF37]/20 hover:border-[#D4AF37]/50'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Date */}
                  {plannerStep === 2 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        2. When is your celebration scheduled?
                      </h3>
                      <input
                        type="date"
                        value={planForm.eventDate}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                        className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-sm text-[#FAF6F0] focus:outline-none focus:border-[#D4AF37]"
                      />
                      <p className="text-[11px] text-[#FAF6F0]/50 italic">
                        Tip: Booking at least 4 weeks in advance ensures availability of custom floral orders.
                      </p>
                    </div>
                  )}

                  {/* Step 3: Guest count */}
                  {plannerStep === 3 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        3. How many guests do you anticipate?
                      </h3>
                      <div className="text-center py-4">
                        <span className="font-serif text-3xl font-bold text-[#D4AF37]">
                          {planForm.guestCount}
                        </span>
                        <span className="text-xs text-[#FAF6F0]/60 block mt-1">Estimated Guests</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1500"
                        step="50"
                        value={planForm.guestCount}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, guestCount: Number(e.target.value) }))}
                        className="w-full accent-[#D4AF37]"
                      />
                      <div className="flex justify-between text-[10px] text-[#FAF6F0]/50 font-mono">
                        <span>50</span>
                        <span>500</span>
                        <span>1000</span>
                        <span>1500+</span>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Venue Type */}
                  {plannerStep === 4 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        4. What type of venue will host this event?
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['Hotel', 'Hall', 'Outdoor', 'Indoor', 'Home', 'Other'].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, venueType: v as VenueType }));
                            }}
                            className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                              planForm.venueType === v
                                ? 'bg-[#5B1424] text-[#FAF6F0] border-[#D4AF37] shadow-gold'
                                : 'bg-[#140F11] text-[#FAF6F0]/70 border-[#D4AF37]/20'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Venue Name & Location */}
                  {plannerStep === 5 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        5. Venue Name & City
                      </h3>
                      <input
                        type="text"
                        placeholder="e.g. Sheraton Addis, Skylight Hotel, or Hawassa Haile Resort"
                        value={planForm.venueName}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, venueName: e.target.value }))}
                        className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {/* Step 6: Style Preference */}
                  {plannerStep === 6 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        6. What aesthetic style reflects your vision?
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {['Luxury', 'Romantic', 'Modern', 'Minimal', 'Traditional', 'Floral'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, stylePreference: s as DecorationStyle }));
                            }}
                            className={`p-3 rounded-xl text-xs font-semibold border text-left transition-all ${
                              planForm.stylePreference === s
                                ? 'bg-[#5B1424] text-[#FAF6F0] border-[#D4AF37] shadow-gold'
                                : 'bg-[#140F11] text-[#FAF6F0]/70 border-[#D4AF37]/20'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 7: Colors */}
                  {plannerStep === 7 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        7. Select your signature color palette
                      </h3>
                      <div className="space-y-2">
                        {[
                          { name: 'Royal Burgundy & Champagne Gold', colors: ['#5B1424', '#D4AF37', '#FAF6F0'] },
                          { name: 'Emerald Velvet & Warm Cream', colors: ['#1C3F2B', '#D4AF37', '#FAF6F0'] },
                          { name: 'Blush Floral & Rose Gold', colors: ['#E8B4B8', '#D4AF37', '#FFFFFF'] },
                          { name: 'Midnight Navy & Platinum Silver', colors: ['#0F1E36', '#C0C0C0', '#FAF6F0'] },
                        ].map((pal, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, colorPalette: pal.colors }));
                            }}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              JSON.stringify(planForm.colorPalette) === JSON.stringify(pal.colors)
                                ? 'bg-[#5B1424]/60 border-[#D4AF37]'
                                : 'bg-[#140F11] border-[#D4AF37]/20'
                            }`}
                          >
                            <span className="text-xs font-medium text-[#FAF6F0]">{pal.name}</span>
                            <div className="flex gap-1">
                              {pal.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full border border-white/20"
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 8: Services */}
                  {plannerStep === 8 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        8. What decorative services are needed?
                      </h3>
                      <div className="space-y-1.5">
                        {[
                          'Stage & Royal Backdrop',
                          'Ceiling Floral Sculptures & Drapery',
                          'VIP Lounge & Head Table Centerpieces',
                          'Ambient Architectural Mood Lighting',
                          'Grand Entrance Arch & Red Carpet',
                          'Cake Table & Photo-Booth Installations',
                        ].map((srv) => {
                          const isSelected = planForm.selectedServices.includes(srv);
                          return (
                            <div
                              key={srv}
                              onClick={() => {
                                triggerHaptic('selection');
                                setPlanForm((prev) => ({
                                  ...prev,
                                  selectedServices: isSelected
                                    ? prev.selectedServices.filter((s) => s !== srv)
                                    : [...prev.selectedServices, srv],
                                }));
                              }}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-[#5B1424]/80 text-[#FAF6F0] border-[#D4AF37]'
                                  : 'bg-[#140F11] text-[#FAF6F0]/70 border-[#D4AF37]/20'
                              }`}
                            >
                              <span>{srv}</span>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1C1917]' : 'border-white/30'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 9: Budget */}
                  {plannerStep === 9 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        9. Target Investment / Budget Range
                      </h3>
                      <div className="space-y-2">
                        {[
                          '100,000 - 250,000 ETB',
                          '250,000 - 500,000 ETB',
                          '500,000 - 1,000,000 ETB',
                          '1,000,000+ ETB (Grand Bespoke)',
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, budgetRange: b }));
                            }}
                            className={`w-full p-3 rounded-xl text-xs font-semibold border text-left ${
                              planForm.budgetRange === b
                                ? 'bg-[#5B1424] text-[#FAF6F0] border-[#D4AF37] shadow-gold'
                                : 'bg-[#140F11] text-[#FAF6F0]/70 border-[#D4AF37]/20'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 10: Special Notes */}
                  {plannerStep === 10 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        10. Aesthetic Notes or Special Requests
                      </h3>
                      <textarea
                        rows={4}
                        placeholder="Tell us about specific flowers you love, themes, family traditions (Melse, etc.), or venue restrictions..."
                        value={planForm.specialNotes}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, specialNotes: e.target.value }))}
                        className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#FAF6F0] placeholder:text-[#FAF6F0]/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}

                  {/* Step 11: Contact info */}
                  {plannerStep === 11 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        11. Contact Information
                      </h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={planForm.guestName}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestName: e.target.value }))}
                          className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D4AF37]"
                        />
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={planForm.guestEmail}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                          className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D4AF37]"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number (e.g. 0911234567) *"
                          value={planForm.guestPhone}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestPhone: e.target.value }))}
                          className="w-full bg-[#140F11] border border-[#D4AF37]/30 rounded-xl p-3 text-xs text-[#FAF6F0] focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 12: Review & Submit */}
                  {plannerStep === 12 && (
                    <div className="space-y-3">
                      <h3 className="font-serif text-sm font-semibold text-[#FAF6F0]">
                        12. Review Your Event Vision
                      </h3>
                      <div className="bg-[#140F11] p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Celebration:</span>
                          <span className="font-semibold text-[#FAF6F0]">{planForm.eventType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Date:</span>
                          <span className="font-semibold text-[#FAF6F0]">{planForm.eventDate || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Guests:</span>
                          <span className="font-semibold text-[#FAF6F0]">{planForm.guestCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Venue:</span>
                          <span className="font-semibold text-[#FAF6F0]">{planForm.venueName || planForm.venueType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Style:</span>
                          <span className="font-semibold text-[#D4AF37]">{planForm.stylePreference}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#FAF6F0]/60">Budget:</span>
                          <span className="font-semibold text-[#D4AF37]">{planForm.budgetRange}</span>
                        </div>
                        <div className="pt-2 border-t border-[#D4AF37]/15">
                          <span className="text-[11px] text-[#FAF6F0]/60 block mb-1">Services:</span>
                          <span className="text-[11px] text-[#FAF6F0]/80">
                            {planForm.selectedServices.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer Controls */}
            {!plannerSuccess && (
              <div className="px-5 py-3 border-t border-[#D4AF37]/20 bg-[#140F11] flex items-center justify-between gap-3">
                {plannerStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setPlannerStep((prev) => prev - 1);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/30 text-xs text-[#FAF6F0] flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : <div />}

                {plannerStep < 12 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerStep((prev) => prev + 1);
                    }}
                    className="bg-[#D4AF37] text-[#1C1917] font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={plannerSubmitting}
                    onClick={() => handlePlannerSubmit()}
                    className="bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C1917] font-bold text-xs px-6 py-2.5 rounded-xl shadow-gold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {plannerSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>SUBMIT VISION</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PROJECT DETAIL MODAL (EXPLORE)
      ========================================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C1518] border-t sm:border border-[#D4AF37]/40 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            <div className="relative h-56 bg-black">
              <img
                src={selectedProject.heroImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedProject(null);
                }}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-mono">
                    {selectedProject.eventType} &bull; {selectedProject.decorationStyle}
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#FAF6F0]">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => toggleSaveInspiration(selectedProject.id)}
                  className="w-9 h-9 rounded-full bg-[#140F11] border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      savedInspirations.includes(selectedProject.id)
                        ? 'fill-[#D4AF37] text-[#D4AF37]'
                        : 'text-[#FAF6F0]'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#FAF6F0]/70 py-2 border-y border-[#D4AF37]/15">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {selectedProject.venueName}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {selectedProject.guestCount} Guests
                </span>
                <span className="text-[#D4AF37] font-semibold ml-auto">
                  {selectedProject.estimatedPriceRange}
                </span>
              </div>

              <p className="text-xs text-[#FAF6F0]/80 leading-relaxed font-sans">
                {selectedProject.description}
              </p>

              {/* Testimonial if present */}
              {selectedProject.testimonialQuote && (
                <div className="bg-[#140F11] p-3.5 rounded-xl border border-[#D4AF37]/20 italic text-xs text-[#FAF6F0]/90 font-serif">
                  &ldquo;{selectedProject.testimonialQuote}&rdquo;
                  <span className="block not-italic text-[10px] text-[#D4AF37] font-sans mt-1">
                    &mdash; {selectedProject.testimonialAuthor || 'Bride & Groom'}
                  </span>
                </div>
              )}

              <button
                onClick={() => {
                  triggerHaptic('heavy');
                  setSelectedProject(null);
                  setPlanForm((prev) => ({
                    ...prev,
                    eventType: selectedProject.eventType,
                    stylePreference: selectedProject.decorationStyle,
                    colorPalette: selectedProject.colorPalette || prev.colorPalette,
                  }));
                  setPlannerOpen(true);
                  setPlannerStep(1);
                }}
                className="w-full bg-[#D4AF37] text-[#1C1917] font-semibold text-xs py-3 rounded-xl shadow-gold flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>PLAN AN EVENT LIKE THIS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUOTE DETAIL & ACTIONS MODAL
      ========================================================================== */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C1518] border-t sm:border border-[#D4AF37]/40 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            <div className="px-5 py-4 border-b border-[#D4AF37]/20 bg-[#140F11] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#D4AF37] font-mono">
                  {selectedQuote.quoteNumber}
                </span>
                <h2 className="font-serif text-base font-bold text-[#FAF6F0]">
                  {selectedQuote.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedQuote(null);
                }}
                className="w-8 h-8 rounded-full bg-[#1C1518] text-[#FAF6F0]/70 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Itemized Services */}
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-[#FAF6F0] text-sm">Itemized Proposal</h3>
                <div className="divide-y divide-[#D4AF37]/15 bg-[#140F11] rounded-xl border border-[#D4AF37]/20">
                  {selectedQuote.items?.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-start">
                      <div>
                        <span className="font-medium text-[#FAF6F0] block">{item.itemTitle}</span>
                        {item.itemDescription && (
                          <span className="text-[10px] text-[#FAF6F0]/60 block">{item.itemDescription}</span>
                        )}
                      </div>
                      <span className="font-semibold text-[#D4AF37] shrink-0 font-sans">
                        {Number(item.subtotal).toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown (Calculated Server-side) */}
              <div className="bg-[#140F11] p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-1.5">
                <div className="flex justify-between text-[#FAF6F0]/70">
                  <span>Subtotal:</span>
                  <span>{Number(selectedQuote.subtotal).toLocaleString()} ETB</span>
                </div>
                {Number(selectedQuote.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Loyalty Discount:</span>
                    <span>-{Number(selectedQuote.discountAmount).toLocaleString()} ETB</span>
                  </div>
                )}
                <div className="flex justify-between text-[#FAF6F0]/70">
                  <span>Tax (VAT 15%):</span>
                  <span>{Number(selectedQuote.taxAmount).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#D4AF37]/20 text-[#D4AF37]">
                  <span>Total Amount:</span>
                  <span>{Number(selectedQuote.totalAmount).toLocaleString()} {selectedQuote.currency}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-emerald-400 pt-1">
                  <span>50% Required Deposit:</span>
                  <span>{Math.round(Number(selectedQuote.totalAmount) * 0.5).toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Terms */}
              {selectedQuote.termsAndConditions && (
                <div className="text-[10px] text-[#FAF6F0]/50 leading-relaxed">
                  <span className="font-bold text-[#FAF6F0]/70 block mb-0.5">Terms:</span>
                  {selectedQuote.termsAndConditions}
                </div>
              )}

              {/* Quote Actions */}
              <div className="space-y-2 pt-2">
                {selectedQuote.status === 'SENT' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={quoteActionLoading}
                      onClick={() => handleQuoteStatusChange(selectedQuote.id, 'ACCEPTED')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 shadow-soft"
                    >
                      <Check className="w-4 h-4" />
                      <span>ACCEPT QUOTE</span>
                    </button>
                    <button
                      disabled={quoteActionLoading}
                      onClick={() => handleQuoteStatusChange(selectedQuote.id, 'REVISION_REQUESTED')}
                      className="bg-[#140F11] border border-amber-500/40 text-amber-300 font-medium py-2.5 rounded-xl hover:bg-[#1C1518]"
                    >
                      REQUEST CHANGES
                    </button>
                  </div>
                ) : selectedQuote.status === 'ACCEPTED' ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 p-2.5 rounded-xl text-center font-medium">
                      Quote Accepted! Ready for deposit payment.
                    </div>
                    <button
                      disabled={paymentLoading}
                      onClick={() => handleInitiatePayment(selectedQuote)}
                      className="w-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C1917] font-bold py-3 rounded-xl shadow-gold flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{paymentLoading ? 'Connecting Chapa...' : 'PAY 50% DEPOSIT WITH CHAPA'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-xs text-[#FAF6F0]/60 py-2">
                    Quote status: <span className="font-bold text-[#D4AF37]">{selectedQuote.status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          BOOKING DETAIL & CHAPA PAYMENT MODAL
      ========================================================================== */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#1C1518] border-t sm:border border-[#D4AF37]/40 rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            <div className="px-5 py-4 border-b border-[#D4AF37]/20 bg-[#140F11] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#D4AF37] font-mono">
                  {selectedBooking.bookingNumber}
                </span>
                <h2 className="font-serif text-base font-bold text-[#FAF6F0]">
                  {selectedBooking.eventTitle || 'Confirmed Reservation'}
                </h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedBooking(null);
                }}
                className="w-8 h-8 rounded-full bg-[#1C1518] text-[#FAF6F0]/70 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="bg-[#140F11] p-3.5 rounded-xl border border-[#D4AF37]/30 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#FAF6F0]/70">Deposit Status:</span>
                  <span
                    className={`font-bold ${
                      selectedBooking.depositPaid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {selectedBooking.depositPaid ? 'PAID & CONFIRMED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF6F0]/70">Deposit Amount:</span>
                  <span className="font-semibold text-[#FAF6F0]">
                    {Number(selectedBooking.depositAmount).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#FAF6F0]/70">Remaining Balance:</span>
                  <span className="font-bold text-[#D4AF37]">
                    {Number(selectedBooking.balanceAmount).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-[#FAF6F0]/50 pt-1 border-t border-[#D4AF37]/15">
                  <span>Balance Due Date:</span>
                  <span>{selectedBooking.balanceDueDate || '7 days prior to event'}</span>
                </div>
              </div>

              {!selectedBooking.depositPaid && (
                <button
                  disabled={paymentLoading}
                  onClick={() => {
                    const fakeQ: any = {
                      id: selectedBooking.quoteId,
                      totalAmount: selectedBooking.depositAmount * 2,
                      title: selectedBooking.eventTitle,
                    };
                    handleInitiatePayment(fakeQ);
                  }}
                  className="w-full bg-[#D4AF37] hover:bg-[#C59B27] text-[#1C1917] font-bold py-3 rounded-xl shadow-gold flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>PAY DEPOSIT VIA CHAPA</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
