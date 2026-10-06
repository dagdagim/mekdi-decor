'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import {
  Home,
  Compass,
  Calendar,
  MessageCircle,
  User,
  Sparkles,
  Heart,
  ChevronRight,
  ChevronLeft,
  Check,
  Phone,
  MapPin,
  Clock,
  Send,
  X,
  CheckCircle2,
  FileText,
  Users,
  Lock,
  ArrowRight,
  Star,
  Quote as QuoteIcon,
  MoveHorizontal,
  Mail,
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
import {
  SERVICES_DATA,
  PACKAGES_DATA,
  GALLERY_PROJECTS,
  TESTIMONIALS_DATA,
} from '@/lib/data/mock-db';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}

type NavTab = 'home' | 'explore' | 'plan' | 'events' | 'messages' | 'profile';

export default function TelegramMiniAppPage() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [tgUser, setTgUser] = useState<any>(null);
  const [sessionCustomer, setSessionCustomer] = useState<CustomerCRM | null>(null);

  // Live Backend Data with graceful initial fallback
  const [packages, setPackages] = useState<PackageItem[]>(PACKAGES_DATA);
  const [gallery, setGallery] = useState<GalleryProject[]>(GALLERY_PROJECTS);
  const [services, setServices] = useState<ServiceItem[]>(SERVICES_DATA);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [savedInspirations, setSavedInspirations] = useState<string[]>([]);

  // Before/After Slider state
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // Modals & Sheets
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

  // Before / After Slider interaction handler
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percent = (clampedX / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && e.buttons !== 1) return;
    handleSliderMove(e.clientX);
  };

  // 1. Initialize Telegram WebApp SDK & Server-side Auth
  useEffect(() => {
    const initTelegram = async () => {
      if (typeof window === 'undefined') return;
      const tg = window.Telegram?.WebApp;

      if (tg) {
        try {
          tg.ready();
          tg.expand();
          tg.enableClosingConfirmation();
          if (tg.setHeaderColor) tg.setHeaderColor('#FDFBF7');
          if (tg.setBackgroundColor) tg.setBackgroundColor('#FDFBF7');
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

        handleDeepLink(startParam);
      } else {
        // Fallback for browser preview
        setTgUser({
          id: 'preview-client',
          first_name: 'Sara',
          last_name: 'Tekle',
          username: 'sara_tekle',
        });
      }

      // Check URL query parameters as well
      const urlParams = new URLSearchParams(window.location.search);
      const urlStart = urlParams.get('startapp') || urlParams.get('tab');
      if (urlStart) handleDeepLink(urlStart);
    };

    initTelegram();
  }, []);

  // Handle Telegram BackButton
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    const isAnyModalOpen =
      plannerOpen || selectedProject !== null || selectedQuote !== null || selectedBooking !== null;

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
    if (['wedding', 'graduation', 'birthday', 'engagement', 'corporate'].includes(p)) {
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
          fetch('/api/packages').then((r) => r.json()).catch(() => ({ data: PACKAGES_DATA })),
          fetch('/api/gallery').then((r) => r.json()).catch(() => ({ data: GALLERY_PROJECTS })),
          fetch('/api/services').then((r) => r.json()).catch(() => ({ data: SERVICES_DATA })),
        ]);

        if (pkgRes.data && pkgRes.data.length > 0) setPackages(pkgRes.data);
        if (galRes.data && galRes.data.length > 0) setGallery(galRes.data);
        if (srvRes.data && srvRes.data.length > 0) setServices(srvRes.data);
      } catch (err) {
        console.warn('Initial data load fallback:', err);
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
          guestEmail:
            planForm.guestEmail ||
            (tgUser?.id ? `tg_${tgUser.id}@telegram.mekdidecor.com` : 'client@mekdidecor.com'),
          guestPhone: planForm.guestPhone || '+251 911 000 000',
          telegramUserId: tgUser?.id ? String(tgUser.id) : undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlannerSuccess(data.data);
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
  const handleQuoteStatusChange = async (
    quoteId: string,
    status: 'ACCEPTED' | 'REVISION_REQUESTED' | 'DECLINED'
  ) => {
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

  const greetingName =
    tgUser?.first_name || sessionCustomer?.fullName?.split(' ')[0] || 'Valued Client';

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-cream-50 text-charcoal-900 selection:bg-gold-500 selection:text-burgundy-950 font-sans">
      {/* =========================================================================
          TOP LUXURY MICRO-BAR & BRAND HEADER (EXACT WEB AESTHETIC)
      ========================================================================== */}
      <div className="bg-burgundy-950 text-gold-200/90 text-[11px] py-1.5 px-4 border-b border-gold-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3 text-gold-400" />
          <span>Hotline: 0967698460 / 0900454238</span>
        </div>
        <div className="flex items-center gap-1.5 text-gold-300 font-medium">
          <a href="https://t.me/mekdidecor19" target="_blank" rel="noreferrer" className="hover:underline">t.me/mekdidecor19</a>
        </div>
      </div>

      <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur-md border-b border-charcoal-200/50 px-4 py-3 flex items-center justify-between shadow-soft">
        <Logo size="sm" />

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('heavy');
              setPlannerOpen(true);
              setPlannerStep(1);
            }}
            className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-sm border border-gold-500/30 flex items-center gap-1"
          >
            <Calendar className="w-3 h-3 text-gold-400" />
            <span>Plan Event</span>
          </button>

          <a
            href="tel:+251967698460"
            onClick={() => triggerHaptic('light')}
            className="w-8 h-8 rounded-full bg-cream-200 border border-gold-500/30 flex items-center justify-center text-burgundy-800 hover:bg-gold-500 hover:text-white transition-colors"
            title="Call 0967698460"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* =========================================================================
          MAIN EDITORIAL CONTENT AREA
      ========================================================================== */}
      <main className="flex-1">
        {/* -----------------------------------------------------------------------
            TAB 1: HOME (THE FULL EDITORIAL WEB EXPERIENCE)
        ------------------------------------------------------------------------ */}
        {activeTab === 'home' && (
          <div className="space-y-16 animate-fadeIn">
            {/* 1. CINEMATIC HERO (EXACT WEB DESIGN) */}
            <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden bg-burgundy-950 px-4 sm:px-6 py-16 text-center text-cream-50">
              <div className="absolute inset-0 z-0">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=85"
                  alt="Mekdi Decor luxury floral stage"
                  className="w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950 via-burgundy-950/80 to-burgundy-950/70" />
              </div>

              <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-burgundy-900/90 border border-gold-500/40 text-gold-300 text-[10px] tracking-widest uppercase font-semibold mb-5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>Premier Event &amp; Wedding Atelier</span>
                </div>

                {/* Editorial Headline */}
                <h1 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-cream-50 leading-[1.18] drop-shadow-md">
                  Your Vision.{' '}
                  <span className="italic font-normal text-gold-300 block sm:inline">
                    Our Decoration.
                  </span>{' '}
                  <br className="hidden sm:block" />
                  Your Perfect Moment.
                </h1>

                <p className="mt-4 text-xs sm:text-sm text-cream-200/90 max-w-md font-sans font-light leading-relaxed">
                  From intimate celebrations to unforgettable weddings, Mekdi Decor transforms spaces
                  into experiences across Ethiopia.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      triggerHaptic('heavy');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Plan My Event</span>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab('explore');
                    }}
                    className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-900/90 text-cream-50 hover:bg-burgundy-800 border border-gold-500/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Explore Our Work</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                  </button>
                </div>
              </div>
            </section>

            {/* 2. CURATED OCCASIONS (CATEGORY CARDS FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="text-center max-w-md mx-auto mb-8">
                <p className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold mb-1">
                  Curated Occasions
                </p>
                <h2 className="font-editorial text-2xl sm:text-3xl text-charcoal-900 font-semibold">
                  What are you celebrating?
                </h2>
                <p className="mt-2 text-xs text-charcoal-600 font-light leading-relaxed">
                  Tell us what you&apos;re planning and we&apos;ll help bring your unforgettable moment to life.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {[
                  {
                    type: 'Wedding' as EventType,
                    label: 'Wedding',
                    subtitle: 'Majestic stages & bridal florals',
                    image:
                      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    type: 'Graduation' as EventType,
                    label: 'Graduation',
                    subtitle: 'Honors banquets & gold galas',
                    image:
                      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    type: 'Birthday' as EventType,
                    label: 'Birthday',
                    subtitle: 'Milestone soirées & velvet decor',
                    image:
                      'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    type: 'Engagement' as EventType,
                    label: 'Engagement',
                    subtitle: 'Romantic lakeside canopies',
                    image:
                      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    type: 'Corporate' as EventType,
                    label: 'Corporate',
                    subtitle: 'Summit stages & gala setups',
                    image:
                      'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
                  },
                  {
                    type: 'Private Event' as EventType,
                    label: 'Private Event',
                    subtitle: 'Bespoke Melse, dinners & galas',
                    image:
                      'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80',
                  },
                ].map((cat) => (
                  <div
                    key={cat.type}
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlanForm((prev) => ({ ...prev, eventType: cat.type }));
                      setPlannerOpen(true);
                      setPlannerStep(2);
                    }}
                    className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden shadow-card border border-cream-200/80 cursor-pointer active:scale-95 transition-transform"
                  >
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-burgundy-950 via-burgundy-950/40 to-transparent opacity-85" />
                    <div className="absolute bottom-3 left-3 right-3 text-left">
                      <span className="text-[9px] uppercase tracking-wider text-gold-300 block mb-0.5 font-medium">
                        Occasion
                      </span>
                      <h3 className="font-editorial text-base text-cream-50 font-semibold">
                        {cat.label}
                      </h3>
                      <p className="text-[10px] text-cream-200/80 line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. BEFORE / AFTER INTERACTIVE COMPARISON (FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="bg-cream-100/70 rounded-3xl p-6 sm:p-8 border border-cream-200/90 shadow-card">
                <div className="mb-6">
                  <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                    Featured Transformation
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl text-charcoal-900 font-semibold tracking-tight">
                    From Empty Space to Unforgettable.
                  </h2>
                  <p className="mt-1.5 text-xs text-charcoal-600 font-light">
                    Drag the gold slider horizontally to witness how Mekdi Decor turns raw halls into ethereal kingdoms.
                  </p>
                </div>

                <div
                  ref={sliderContainerRef}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden select-none cursor-ew-resize shadow-elevated border-2 border-gold-500/30"
                >
                  {/* After Image */}
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                    alt="Mekdi Decor royal transformation after"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />

                  {/* Before Image with clip-path */}
                  <div
                    className="absolute inset-0 overflow-hidden pointer-events-none"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=1200&q=80"
                      alt="Raw empty venue before"
                      className="absolute inset-0 w-full h-full object-cover filter brightness-90 grayscale-[35%]"
                      draggable={false}
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-charcoal-900/80 backdrop-blur-sm text-[10px] font-semibold tracking-wider text-cream-100 border border-white/20">
                      RAW VENUE
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-burgundy-900/90 backdrop-blur-sm text-[10px] font-semibold tracking-wider text-gold-300 border border-gold-500/30">
                    MEKDI DECOR
                  </div>

                  {/* Divider Line */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gold-400 pointer-events-none shadow-gold"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-burgundy-900 border-2 border-gold-400 flex items-center justify-center text-gold-300 shadow-md">
                      <MoveHorizontal className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. BESPOKE SERVICES SECTION (FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold mb-1 block">
                  Bespoke Offerings
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl text-charcoal-900 font-semibold">
                  Our Craft &amp; Disciplines
                </h2>
                <p className="mt-2 text-xs text-charcoal-600 font-light">
                  Every celebration is customized by our senior master designers in Addis Ababa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.slice(0, 6).map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card hover:shadow-elevated transition-all space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-gold-500/30 flex items-center justify-center text-burgundy-800">
                      <Sparkles className="w-5 h-5 text-gold-600" />
                    </div>
                    <div>
                      <h3 className="font-editorial text-base font-bold text-charcoal-900">
                        {service.title}
                      </h3>
                      <p className="text-[11px] text-gold-700 font-medium font-sans mt-0.5">
                        {service.subtitle}
                      </p>
                      <p className="text-xs text-charcoal-600 font-light leading-relaxed mt-2">
                        {service.description}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-[11px]">
                      <span className="text-charcoal-500 font-sans">Starting at:</span>
                      <span className="font-bold text-burgundy-900 font-serif">
                        {Number(service.startingPrice).toLocaleString()} {service.currency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. EDITORIAL PROJECTS / FEATURED TRANSFORMATIONS (FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold block mb-0.5">
                    Selected Portfolio
                  </span>
                  <h2 className="font-editorial text-2xl text-charcoal-900 font-semibold">
                    Featured Transformations
                  </h2>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab('explore');
                  }}
                  className="text-xs font-semibold text-burgundy-900 hover:text-gold-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gallery.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedProject(item);
                    }}
                    className="bg-white rounded-2xl overflow-hidden shadow-card border border-cream-200 cursor-pointer active:scale-98 transition-transform group"
                  >
                    <div className="relative h-44 w-full bg-black/40">
                      <img
                        src={item.heroImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-burgundy-900/90 text-cream-50 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-gold-500/30">
                        {item.eventType}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveInspiration(item.id);
                        }}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-burgundy-900 shadow-sm"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            savedInspirations.includes(item.id)
                              ? 'fill-burgundy-800 text-burgundy-800'
                              : 'text-charcoal-600'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-editorial text-base font-bold text-charcoal-900">
                          {item.title}
                        </h3>
                        <span className="text-xs font-semibold text-gold-700 font-sans">
                          {item.estimatedPriceRange}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gold-600" />
                          {item.venueName}
                        </span>
                        <span>&bull;</span>
                        <span>{item.guestCount} Guests</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 6. SIGNATURE PACKAGES (FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold mb-1 block">
                  Curated Collections
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl text-charcoal-900 font-semibold">
                  Signature Packages
                </h2>
                <p className="mt-2 text-xs text-charcoal-600 font-light">
                  Tailored tiers offering complete peace of mind and breathtaking aesthetics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl p-6 border-2 border-cream-200/90 shadow-card flex flex-col justify-between relative hover:border-gold-500/50 transition-colors"
                  >
                    {pkg.tierLabel && (
                      <span className="absolute top-4 right-4 text-[9px] uppercase tracking-wider font-bold bg-gold-50 text-gold-800 border border-gold-300 px-2.5 py-0.5 rounded-full">
                        {pkg.tierLabel}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="font-editorial text-xl font-bold text-charcoal-900">
                          {pkg.name}
                        </h3>
                        <p className="text-xs text-charcoal-500 mt-1">{pkg.tagline}</p>
                      </div>

                      <div className="py-2 border-y border-cream-100">
                        <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block">
                          Starting Investment
                        </span>
                        <span className="text-xl font-bold font-serif text-burgundy-900">
                          {Number(pkg.startingPrice).toLocaleString()} {pkg.currency}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {pkg.includedServices.map((s, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-charcoal-700">
                            <Check className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('medium');
                        setPlanForm((prev) => ({
                          ...prev,
                          specialNotes: `Package Selected: ${pkg.name} (${Number(pkg.startingPrice).toLocaleString()} ${pkg.currency})`,
                        }));
                        setPlannerOpen(true);
                        setPlannerStep(1);
                      }}
                      className="mt-6 w-full py-3 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-sm border border-gold-500/30"
                    >
                      Select Package
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 7. VERIFIED CLIENT REVIEWS (TESTIMONIALS FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto">
              <div className="text-center max-w-md mx-auto mb-8">
                <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold mb-1 block">
                  Cherished Words
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl text-charcoal-900 font-semibold">
                  Memories We&apos;ve Co-Created
                </h2>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-gold-700 bg-gold-50 border border-gold-300/40 px-3 py-0.5 rounded-full font-medium">
                  Verified Client Reviews
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TESTIMONIALS_DATA.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card space-y-3 relative"
                  >
                    <QuoteIcon className="w-8 h-8 text-gold-200/80 absolute top-4 right-4 pointer-events-none" />
                    <div className="flex items-center gap-1 text-gold-500">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold-400" />
                      ))}
                    </div>
                    <p className="text-xs text-charcoal-700 italic font-serif leading-relaxed">
                      &ldquo;{t.reviewText}&rdquo;
                    </p>
                    <div className="pt-3 border-t border-cream-100 flex items-center justify-between text-[11px]">
                      <div>
                        <span className="font-bold text-charcoal-900 block">{t.customerName}</span>
                        <span className="text-charcoal-500">{t.eventType}</span>
                      </div>
                      <span className="text-gold-700 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" />
                        {t.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 8. LARGE CALL TO ACTION BANNER (FROM WEB) */}
            <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-6">
              <div className="rounded-3xl overflow-hidden bg-burgundy-950 p-8 sm:p-12 text-center text-cream-50 shadow-elevated border-2 border-gold-500/30 relative">
                <div className="relative z-10 max-w-md mx-auto space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-burgundy-900/80 border border-gold-500/40 text-gold-300 text-[10px] tracking-widest uppercase font-semibold">
                    <Sparkles className="w-3 h-3 text-gold-400" />
                    <span>Begin Your Consultation</span>
                  </div>

                  <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-cream-50 leading-snug">
                    Let&apos;s Create Something{' '}
                    <span className="italic text-gold-300 font-normal">Beautiful Together.</span>
                  </h2>

                  <p className="text-xs text-cream-200/90 font-light leading-relaxed">
                    Tell us about your event and let&apos;s turn your vision into an unforgettable experience.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
                    <button
                      onClick={() => {
                        triggerHaptic('heavy');
                        setPlannerOpen(true);
                        setPlannerStep(1);
                      }}
                      className="w-full sm:w-auto px-7 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Plan Your Event</span>
                    </button>

                    <a
                      href="tel:+251967698460"
                      className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold tracking-widest uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 border border-gold-500/30 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5 text-gold-400" />
                      <span>+251 967 698 460</span>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* -----------------------------------------------------------------------
            TAB 2: EXPLORE (GALLERY & INSPIRATIONS)
        ------------------------------------------------------------------------ */}
        {activeTab === 'explore' && (
          <div className="px-4 sm:px-6 max-w-5xl mx-auto py-6 space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold block mb-0.5">
                Atelier Portfolio
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
                Gallery &amp; Inspirations
              </h1>
              <p className="text-xs text-charcoal-600 font-light mt-1">
                Explore our signature atmospheres and color schemes across Ethiopia.
              </p>
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {['ALL', 'Wedding', 'Graduation', 'Birthday', 'Engagement', 'Corporate'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    triggerHaptic('selection');
                    setGalleryFilter(cat);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    galleryFilter === cat
                      ? 'bg-burgundy-900 text-cream-50 shadow-sm border border-gold-500/40'
                      : 'bg-white text-charcoal-700 border border-cream-200 hover:border-gold-500/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedProject(item);
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-card border border-cream-200 cursor-pointer active:scale-98 transition-transform group"
                >
                  <div className="relative h-48 w-full bg-black/40">
                    <img
                      src={item.heroImage}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-burgundy-900/90 text-cream-50 text-[10px] font-medium px-2.5 py-0.5 rounded-full border border-gold-500/30">
                      {item.eventType}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveInspiration(item.id);
                      }}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-burgundy-900 shadow-sm"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          savedInspirations.includes(item.id)
                            ? 'fill-burgundy-800 text-burgundy-800'
                            : 'text-charcoal-600'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-editorial text-base font-bold text-charcoal-900">
                        {item.title}
                      </h3>
                      <span className="text-xs font-semibold text-gold-700 font-sans">
                        {item.estimatedPriceRange}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal-600 font-light line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.colorPalette && item.colorPalette.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] text-charcoal-400 font-sans">Palette:</span>
                        {item.colorPalette.map((hex, i) => (
                          <div
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-charcoal-200 shadow-sm"
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
            TAB 3: MY CELEBRATIONS & QUOTES (MY EVENTS)
        ------------------------------------------------------------------------ */}
        {activeTab === 'events' && (
          <div className="px-4 sm:px-6 max-w-4xl mx-auto py-6 space-y-6 animate-fadeIn">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-gold-700 font-semibold block mb-0.5">
                Client Dashboard
              </span>
              <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
                My Celebrations
              </h1>
              <p className="text-xs text-charcoal-600 font-light mt-1">
                Track quotations, review itemized proposals, and secure bookings.
              </p>
            </div>

            {/* Confirmed Bookings */}
            <div className="space-y-3">
              <h2 className="font-editorial text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirmed Bookings</span>
              </h2>

              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-cream-200 p-6 text-center space-y-2 shadow-sm">
                  <p className="text-xs text-charcoal-600">No active bookings yet.</p>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="text-xs font-semibold text-burgundy-800 hover:underline"
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
                    className="bg-white rounded-2xl border border-cream-200 p-4 space-y-3 shadow-card active:scale-98 transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-burgundy-900 bg-cream-100 px-2.5 py-0.5 rounded font-semibold border border-cream-200">
                        {b.bookingNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          b.depositPaid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border border-amber-300'
                        }`}
                      >
                        {b.depositPaid ? 'DEPOSIT SECURED' : 'DEPOSIT PENDING'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-editorial text-base font-bold text-charcoal-900">
                          {b.eventTitle || 'Bespoke Event Reservation'}
                        </h3>
                        <p className="text-xs text-charcoal-600 flex items-center gap-1 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-gold-600" />
                          {b.eventDate || 'Dec 18, 2026'} &bull; {b.venueName || 'Addis Ababa'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gold-600" />
                    </div>

                    <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs">
                      <span className="text-charcoal-500">Remaining Balance:</span>
                      <span className="font-bold text-burgundy-900 font-serif">
                        {Number(b.balanceAmount).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quotations */}
            <div className="space-y-3">
              <h2 className="font-editorial text-base font-bold text-charcoal-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gold-600" />
                <span>Decorative Quotations</span>
              </h2>

              {quotes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-cream-200 p-6 text-center space-y-2 shadow-sm">
                  <p className="text-xs text-charcoal-600">No pending quotes.</p>
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerOpen(true);
                      setPlannerStep(1);
                    }}
                    className="text-xs font-semibold text-burgundy-800 hover:underline"
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
                    className="bg-white rounded-2xl border border-cream-200 p-4 space-y-3 shadow-card active:scale-98 transition-transform cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-burgundy-900 bg-cream-100 px-2.5 py-0.5 rounded font-semibold border border-cream-200">
                        {q.quoteNumber}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                            : q.status === 'REVISION_REQUESTED'
                            ? 'bg-amber-50 text-amber-700 border border-amber-300'
                            : q.status === 'DECLINED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-blue-50 text-blue-700 border border-blue-300'
                        }`}
                      >
                        {q.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-editorial text-base font-bold text-charcoal-900">
                          {q.title}
                        </h3>
                        <p className="text-xs text-charcoal-600 flex items-center gap-1 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          Valid until: {q.validityDate}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gold-600" />
                    </div>

                    <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-xs font-semibold">
                      <span className="text-charcoal-500 font-sans">Total Proposal:</span>
                      <span className="text-burgundy-900 font-bold font-serif text-sm">
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
            TAB 4: CONCIERGE CHAT (MESSAGES)
        ------------------------------------------------------------------------ */}
        {activeTab === 'messages' && (
          <div className="px-4 sm:px-6 max-w-3xl mx-auto py-6 flex flex-col h-[75vh] animate-fadeIn">
            <div className="pb-3 border-b border-cream-200 flex items-center justify-between">
              <div>
                <h1 className="font-editorial text-xl font-bold text-charcoal-900">
                  Atelier Concierge
                </h1>
                <p className="text-xs text-charcoal-600 font-light">
                  Direct communication with Mekdi Decor design directors
                </p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Online</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-charcoal-500">
                  <MessageCircle className="w-8 h-8 text-gold-500" />
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
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-charcoal-400">
                        <span className="font-semibold text-charcoal-700">{m.senderName}</span>
                        <span>&bull;</span>
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isCustomer
                            ? 'bg-burgundy-900 text-cream-50 rounded-br-none shadow-sm'
                            : 'bg-white text-charcoal-800 rounded-bl-none border border-cream-200 shadow-card'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSendMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message to the design team..."
                className="flex-1 bg-white border border-cream-300 rounded-xl px-4 py-3 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:border-gold-500 shadow-sm"
              />
              <button
                type="submit"
                disabled={messageSending || !messageInput.trim()}
                className="bg-burgundy-900 hover:bg-burgundy-800 text-gold-300 p-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform shrink-0 font-semibold shadow-sm"
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
          <div className="px-4 sm:px-6 max-w-2xl mx-auto py-6 space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-cream-200 p-6 space-y-4 shadow-card">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-burgundy-900 border-2 border-gold-400 flex items-center justify-center text-xl font-bold text-gold-300 shadow-md">
                  {greetingName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-editorial text-lg font-bold text-charcoal-900">
                      {greetingName}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-gold-100 text-gold-800 border border-gold-300">
                      VIP CLIENT
                    </span>
                  </div>
                  {tgUser?.username && <p className="text-xs text-burgundy-800">@{tgUser.username}</p>}
                  <p className="text-[11px] text-charcoal-500 mt-0.5">
                    Telegram Connected ID: {tgUser?.id || 'Active'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-cream-100 text-center">
                <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                  <span className="block text-[11px] text-charcoal-500">Booked Events</span>
                  <span className="text-lg font-bold text-burgundy-900 font-serif">
                    {bookings.length || 1}
                  </span>
                </div>
                <div className="bg-cream-50 p-3.5 rounded-2xl border border-cream-200">
                  <span className="block text-[11px] text-charcoal-500">Saved Inspirations</span>
                  <span className="text-lg font-bold text-burgundy-900 font-serif">
                    {savedInspirations.length || 2}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-editorial text-base font-bold text-charcoal-900">Atelier Studio</h3>
              <div className="bg-white rounded-2xl border border-cream-200 divide-y divide-cream-100 shadow-card">
                <a
                  href="tel:+251967698460"
                  className="p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gold-600" />
                    <div>
                      <span className="block text-xs font-semibold text-charcoal-900">Direct Hotline 1</span>
                      <span className="block text-[11px] text-charcoal-500">+251 967 698 460 (0967698460)</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                </a>

                <a
                  href="tel:+251900454238"
                  className="p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gold-600" />
                    <div>
                      <span className="block text-xs font-semibold text-charcoal-900">Direct Hotline 2</span>
                      <span className="block text-[11px] text-charcoal-500">+251 900 454 238 (0900454238)</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                </a>

                <a
                  href="https://t.me/mekdidecor19"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4 text-gold-600" />
                    <div>
                      <span className="block text-xs font-semibold text-charcoal-900">Official Telegram Channel</span>
                      <span className="block text-[11px] text-charcoal-500">t.me/mekdidecor19</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                </a>

                <a
                  href="https://www.tiktok.com/@mekdi.decor3"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center text-gold-600">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.86.12V9.42a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.68a6.34 6.34 0 0 0 6.34 6.34c3.5 0 6.34-2.84 6.34-6.34V9.08a8.16 8.16 0 0 0 4.91 1.63v-3.5a4.85 4.85 0 0 1-1-.52z" />
                      </svg>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-charcoal-900">TikTok Official</span>
                      <span className="block text-[11px] text-charcoal-500">@mekdi.decor3 (Mekdi decor)</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                </a>

                <div className="p-4 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-semibold text-charcoal-900">Design Studio</span>
                    <span className="block text-[11px] text-charcoal-500 leading-tight">
                      Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa
                    </span>
                  </div>
                </div>

                <a
                  href="https://t.me/MekdiDecor_bot"
                  target="_blank"
                  rel="noreferrer"
                  className="p-4 flex items-center justify-between hover:bg-cream-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] px-1 rounded bg-gold-500/20 text-gold-700 font-bold">BOT</span>
                    <div>
                      <span className="block text-xs font-semibold text-charcoal-900">Telegram Mini App Bot</span>
                      <span className="block text-[11px] text-charcoal-500">@MekdiDecor_bot</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gold-600" />
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          FLOATING LUXURY BOTTOM NAVIGATION BAR (WARM CREAM & GOLD)
      ========================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-lg border-t border-gold-500/30 pb-[env(safe-area-inset-bottom)] shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {[
            { id: 'home' as NavTab, label: 'Home', icon: Home },
            { id: 'explore' as NavTab, label: 'Gallery', icon: Compass },
            {
              id: 'plan' as NavTab,
              label: 'Plan Event',
              icon: Calendar,
              special: true,
            },
            {
              id: 'events' as NavTab,
              label: 'My Events',
              icon: FileText,
              badge: quotes.length || bookings.length,
            },
            { id: 'messages' as NavTab, label: 'Concierge', icon: MessageCircle },
            { id: 'profile' as NavTab, label: 'Profile', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            if (tab.special) {
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('heavy');
                    setPlannerOpen(true);
                    setPlannerStep(1);
                  }}
                  className="flex flex-col items-center justify-center -mt-5"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-burgundy-950 flex items-center justify-center shadow-gold border-2 border-cream-50 active:scale-95 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-burgundy-900 mt-1 uppercase tracking-wider">
                    Plan
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id);
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 transition-colors ${
                  isActive ? 'text-burgundy-900 font-bold' : 'text-charcoal-500 hover:text-burgundy-800'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {Boolean(tab.badge) && (
                    <span className="absolute -top-1 -right-2 bg-burgundy-800 text-cream-50 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wide mt-1 font-sans ${isActive ? 'font-bold' : 'font-normal'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-gold-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* =========================================================================
          12-STEP BESPOKE EVENT PLANNER MODAL WIZARD (LUXURY CREAM THEME)
      ========================================================================== */}
      {plannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-cream-50 border-t sm:border border-gold-500/40 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            {/* Header */}
            <div className="px-5 py-4 border-b border-cream-200 flex items-center justify-between bg-white">
              <div>
                <span className="text-[10px] text-gold-700 font-mono uppercase tracking-widest font-semibold">
                  Step {plannerStep} of 12
                </span>
                <h2 className="font-editorial text-base font-bold text-charcoal-900">
                  Bespoke Event Planner
                </h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setPlannerOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-cream-100 text-charcoal-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-cream-200 h-1">
              <div
                className="bg-gold-500 h-full transition-all duration-300"
                style={{ width: `${(plannerStep / 12) * 100}%` }}
              />
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {plannerSuccess ? (
                <div className="text-center py-6 space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-burgundy-900 border-2 border-gold-400 text-gold-300 flex items-center justify-center mx-auto shadow-gold">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-charcoal-900">
                      Your Event Vision Has Been Received
                    </h3>
                    <p className="text-xs text-charcoal-600 mt-1 max-w-sm mx-auto leading-relaxed">
                      Our creative directors will evaluate your requirements and curate a bespoke decorative proposal within 24 hours.
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gold-400 font-mono text-xs text-burgundy-900 font-bold">
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
                      className="bg-burgundy-900 text-gold-300 font-semibold text-xs py-3 rounded-full"
                    >
                      VIEW IN MY CELEBRATIONS
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setPlannerOpen(false);
                        setPlannerSuccess(null);
                        setActiveTab('home');
                      }}
                      className="text-xs text-charcoal-600 py-2 hover:underline"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Type */}
                  {plannerStep === 1 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        1. What celebration are we decorating?
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
                            className={`p-3 rounded-2xl text-xs font-semibold border text-left transition-all ${
                              planForm.eventType === type
                                ? 'bg-burgundy-900 text-cream-50 border-gold-400 shadow-sm'
                                : 'bg-white text-charcoal-800 border-cream-200'
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
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        2. When is your celebration scheduled?
                      </h3>
                      <input
                        type="date"
                        value={planForm.eventDate}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, eventDate: e.target.value }))}
                        className="w-full bg-white border border-cream-300 rounded-xl p-3 text-sm text-charcoal-900 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  )}

                  {/* Step 3: Guests */}
                  {plannerStep === 3 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        3. How many guests do you anticipate?
                      </h3>
                      <div className="text-center py-4 bg-white rounded-2xl border border-cream-200">
                        <span className="font-editorial text-3xl font-bold text-burgundy-900">
                          {planForm.guestCount}
                        </span>
                        <span className="text-xs text-charcoal-500 block mt-1">Guests</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="1500"
                        step="50"
                        value={planForm.guestCount}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, guestCount: Number(e.target.value) }))}
                        className="w-full accent-gold-500"
                      />
                    </div>
                  )}

                  {/* Step 4: Venue Type */}
                  {plannerStep === 4 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        4. What venue style will host the celebration?
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
                            className={`p-3 rounded-2xl text-xs font-semibold border text-left ${
                              planForm.venueType === v
                                ? 'bg-burgundy-900 text-cream-50 border-gold-400'
                                : 'bg-white text-charcoal-800 border-cream-200'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Venue Name & City */}
                  {plannerStep === 5 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        5. Venue Name &amp; Location
                      </h3>
                      <input
                        type="text"
                        placeholder="e.g. Sheraton Addis, Skylight Hotel, or Haile Resort Hawassa"
                        value={planForm.venueName}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, venueName: e.target.value }))}
                        className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  )}

                  {/* Step 6: Style */}
                  {plannerStep === 6 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
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
                            className={`p-3 rounded-2xl text-xs font-semibold border text-left ${
                              planForm.stylePreference === s
                                ? 'bg-burgundy-900 text-cream-50 border-gold-400'
                                : 'bg-white text-charcoal-800 border-cream-200'
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
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        7. Select signature color palette
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
                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer ${
                              JSON.stringify(planForm.colorPalette) === JSON.stringify(pal.colors)
                                ? 'bg-burgundy-50 border-gold-500'
                                : 'bg-white border-cream-200'
                            }`}
                          >
                            <span className="text-xs font-semibold text-charcoal-900">{pal.name}</span>
                            <div className="flex gap-1">
                              {pal.colors.map((c, i) => (
                                <div
                                  key={i}
                                  className="w-4 h-4 rounded-full border border-charcoal-200 shadow-sm"
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
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        8. Decorative Disciplines Required
                      </h3>
                      <div className="space-y-2">
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
                              className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer text-xs ${
                                isSelected
                                  ? 'bg-burgundy-50 text-burgundy-950 border-gold-500 font-semibold'
                                  : 'bg-white text-charcoal-700 border-cream-200'
                              }`}
                            >
                              <span>{srv}</span>
                              <div
                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                  isSelected ? 'bg-gold-500 border-gold-500 text-burgundy-950' : 'border-cream-300'
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
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        9. Target Investment / Budget Range
                      </h3>
                      <div className="space-y-2">
                        {[
                          '100,000 - 250,000 ETB',
                          '250,000 - 500,000 ETB',
                          '500,000 - 1,000,000 ETB',
                          '1,000,000+ ETB (Grand Imperial Bespoke)',
                        ].map((b) => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => {
                              triggerHaptic('selection');
                              setPlanForm((prev) => ({ ...prev, budgetRange: b }));
                            }}
                            className={`w-full p-3 rounded-2xl text-xs font-semibold border text-left ${
                              planForm.budgetRange === b
                                ? 'bg-burgundy-900 text-cream-50 border-gold-400'
                                : 'bg-white text-charcoal-800 border-cream-200'
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 10: Notes */}
                  {plannerStep === 10 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        10. Aesthetic Notes or Special Requests
                      </h3>
                      <textarea
                        rows={4}
                        placeholder="Tell us about specific flowers you love, themes, cultural traditions (Melse, etc.), or venue details..."
                        value={planForm.specialNotes}
                        onChange={(e) => setPlanForm((prev) => ({ ...prev, specialNotes: e.target.value }))}
                        className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  )}

                  {/* Step 11: Contact */}
                  {plannerStep === 11 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        11. Contact Information
                      </h3>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Your Full Name *"
                          value={planForm.guestName}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestName: e.target.value }))}
                          className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500"
                        />
                        <input
                          type="email"
                          placeholder="Email Address *"
                          value={planForm.guestEmail}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestEmail: e.target.value }))}
                          className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500"
                        />
                        <input
                          type="tel"
                          placeholder="Phone Number (e.g. 0911234567) *"
                          value={planForm.guestPhone}
                          onChange={(e) => setPlanForm((prev) => ({ ...prev, guestPhone: e.target.value }))}
                          className="w-full bg-white border border-cream-300 rounded-xl p-3 text-xs text-charcoal-900 focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 12: Review */}
                  {plannerStep === 12 && (
                    <div className="space-y-3">
                      <h3 className="font-editorial text-sm font-semibold text-charcoal-900">
                        12. Review Your Vision
                      </h3>
                      <div className="bg-white p-4 rounded-2xl border border-cream-200 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Celebration:</span>
                          <span className="font-bold text-charcoal-900">{planForm.eventType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Date:</span>
                          <span className="font-semibold text-charcoal-900">{planForm.eventDate || 'TBD'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Guests:</span>
                          <span className="font-semibold text-charcoal-900">{planForm.guestCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Venue:</span>
                          <span className="font-semibold text-charcoal-900">{planForm.venueName || planForm.venueType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-charcoal-500">Budget:</span>
                          <span className="font-bold text-burgundy-900 font-serif">{planForm.budgetRange}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer controls */}
            {!plannerSuccess && (
              <div className="px-5 py-3 border-t border-cream-200 bg-white flex items-center justify-between gap-3">
                {plannerStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setPlannerStep((prev) => prev - 1);
                    }}
                    className="px-4 py-2.5 rounded-full border border-cream-300 text-xs text-charcoal-700 flex items-center gap-1 font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {plannerStep < 12 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setPlannerStep((prev) => prev + 1);
                    }}
                    className="bg-burgundy-900 text-gold-300 font-semibold text-xs px-6 py-2.5 rounded-full flex items-center gap-1 shadow-sm"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={plannerSubmitting}
                    onClick={() => handlePlannerSubmit()}
                    className="bg-gold-500 hover:bg-gold-400 text-burgundy-950 font-bold text-xs px-7 py-2.5 rounded-full shadow-gold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {plannerSubmitting ? 'Sending...' : 'SUBMIT VISION'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          PROJECT DETAIL MODAL
      ========================================================================== */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-cream-50 border-t sm:border border-cream-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
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
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gold-700 uppercase tracking-widest font-semibold block">
                    {selectedProject.eventType} &bull; {selectedProject.decorationStyle}
                  </span>
                  <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                    {selectedProject.title}
                  </h2>
                </div>
                <button
                  onClick={() => toggleSaveInspiration(selectedProject.id)}
                  className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center shadow-sm"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      savedInspirations.includes(selectedProject.id)
                        ? 'fill-burgundy-800 text-burgundy-800'
                        : 'text-charcoal-600'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-charcoal-600 py-2 border-y border-cream-200">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gold-600" />
                  {selectedProject.venueName}
                </span>
                <span>&bull;</span>
                <span>{selectedProject.guestCount} Guests</span>
                <span className="ml-auto font-bold text-burgundy-900 font-serif">
                  {selectedProject.estimatedPriceRange}
                </span>
              </div>

              <p className="text-xs text-charcoal-700 leading-relaxed font-light">
                {selectedProject.description}
              </p>

              {selectedProject.testimonialQuote && (
                <div className="bg-white p-4 rounded-2xl border border-cream-200 italic text-xs text-charcoal-800 font-serif shadow-sm">
                  &ldquo;{selectedProject.testimonialQuote}&rdquo;
                  <span className="block not-italic text-[10px] text-gold-700 font-sans mt-1 font-semibold">
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
                className="w-full bg-burgundy-900 text-gold-300 font-semibold text-xs py-3.5 rounded-full shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>PLAN AN EVENT LIKE THIS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          QUOTE DETAIL MODAL
      ========================================================================== */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-cream-50 border-t sm:border border-cream-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            <div className="px-5 py-4 border-b border-cream-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gold-700 font-mono font-bold">
                  {selectedQuote.quoteNumber}
                </span>
                <h2 className="font-editorial text-base font-bold text-charcoal-900">
                  {selectedQuote.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedQuote(null);
                }}
                className="w-8 h-8 rounded-full bg-cream-100 text-charcoal-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="space-y-2">
                <h3 className="font-editorial font-bold text-charcoal-900 text-sm">Itemized Proposal</h3>
                <div className="divide-y divide-cream-100 bg-white rounded-2xl border border-cream-200 shadow-sm">
                  {selectedQuote.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-charcoal-900 block">{item.itemTitle}</span>
                        {item.itemDescription && (
                          <span className="text-[11px] text-charcoal-500 block">{item.itemDescription}</span>
                        )}
                      </div>
                      <span className="font-bold text-burgundy-900 shrink-0 font-serif ml-2">
                        {Number(item.subtotal).toLocaleString()} ETB
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-cream-200 space-y-2 shadow-sm">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal:</span>
                  <span>{Number(selectedQuote.subtotal).toLocaleString()} ETB</span>
                </div>
                {Number(selectedQuote.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-{Number(selectedQuote.discountAmount).toLocaleString()} ETB</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal-600">
                  <span>Tax (VAT 15%):</span>
                  <span>{Number(selectedQuote.taxAmount).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-cream-100 text-burgundy-900 font-serif">
                  <span>Total Amount:</span>
                  <span>{Number(selectedQuote.totalAmount).toLocaleString()} {selectedQuote.currency}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-emerald-700 pt-1">
                  <span>50% Required Deposit:</span>
                  <span>{Math.round(Number(selectedQuote.totalAmount) * 0.5).toLocaleString()} ETB</span>
                </div>
              </div>

              {selectedQuote.termsAndConditions && (
                <div className="text-[10px] text-charcoal-500 leading-relaxed bg-white p-3 rounded-xl border border-cream-200">
                  <span className="font-bold text-charcoal-700 block mb-0.5">Terms &amp; Conditions:</span>
                  {selectedQuote.termsAndConditions}
                </div>
              )}

              <div className="pt-2">
                {selectedQuote.status === 'SENT' ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={quoteActionLoading}
                      onClick={() => handleQuoteStatusChange(selectedQuote.id, 'ACCEPTED')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-full flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>ACCEPT QUOTE</span>
                    </button>
                    <button
                      disabled={quoteActionLoading}
                      onClick={() => handleQuoteStatusChange(selectedQuote.id, 'REVISION_REQUESTED')}
                      className="bg-white border border-cream-300 text-charcoal-700 font-medium py-3 rounded-full hover:bg-cream-100"
                    >
                      REQUEST CHANGES
                    </button>
                  </div>
                ) : selectedQuote.status === 'ACCEPTED' ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-2xl text-center font-semibold">
                      Quote Accepted! Ready for deposit payment.
                    </div>
                    <button
                      disabled={paymentLoading}
                      onClick={() => handleInitiatePayment(selectedQuote)}
                      className="w-full bg-gold-500 hover:bg-gold-400 text-burgundy-950 font-bold py-3.5 rounded-full shadow-gold flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{paymentLoading ? 'Connecting Chapa...' : 'PAY 50% DEPOSIT WITH CHAPA'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-xs text-charcoal-600 py-2">
                    Status: <span className="font-bold text-burgundy-900">{selectedQuote.status}</span>
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-cream-50 border-t sm:border border-cream-200 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden mx-auto shadow-elevated">
            <div className="px-5 py-4 border-b border-cream-200 bg-white flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gold-700 font-mono font-bold">
                  {selectedBooking.bookingNumber}
                </span>
                <h2 className="font-editorial text-base font-bold text-charcoal-900">
                  {selectedBooking.eventTitle || 'Confirmed Reservation'}
                </h2>
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedBooking(null);
                }}
                className="w-8 h-8 rounded-full bg-cream-100 text-charcoal-700 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto">
              <div className="bg-white p-4 rounded-2xl border border-cream-200 space-y-2 shadow-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Deposit Status:</span>
                  <span
                    className={`font-bold ${
                      selectedBooking.depositPaid ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {selectedBooking.depositPaid ? 'PAID & CONFIRMED' : 'PENDING'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Deposit Amount:</span>
                  <span className="font-semibold text-charcoal-900">
                    {Number(selectedBooking.depositAmount).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Remaining Balance:</span>
                  <span className="font-bold text-burgundy-900 font-serif">
                    {Number(selectedBooking.balanceAmount).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-charcoal-400 pt-2 border-t border-cream-100">
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
                  className="w-full bg-gold-500 hover:bg-gold-400 text-burgundy-950 font-bold py-3.5 rounded-full shadow-gold flex items-center justify-center gap-1.5"
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
