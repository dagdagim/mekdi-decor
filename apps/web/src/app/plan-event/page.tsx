'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Users,
  Building2,
  Sparkles,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Phone,
  Mail,
  Send,
  CreditCard,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const EVENT_TYPES = ['Wedding', 'Birthday', 'Graduation', 'Engagement', 'Corporate', 'Other'];
const GUEST_COUNTS = ['50', '100', '200', '350', '500+'];
const VENUE_TYPES = ['Hotel', 'Hall', 'Indoor', 'Outdoor', 'Home', 'Other'];
const STYLE_OPTIONS = [
  'Luxury',
  'Romantic',
  'Modern',
  'Minimal',
  'Traditional',
  'Floral',
  'Custom',
];

const COLOR_THEMES = [
  { name: 'Royal Burgundy & Champagne Gold', colors: ['#5B1424', '#D4AF37', '#FAF6F0'] },
  { name: 'Emerald Forest & Polished Brass', colors: ['#1F3A2B', '#D4AF37', '#FFFFFF'] },
  { name: 'Blush Rose & Warm Ivory', colors: ['#F5D0C5', '#FAF6F0', '#D4AF37'] },
  { name: 'Imperial Crimson & Black Tie', colors: ['#8E1730', '#1C1917', '#E5C365'] },
  { name: 'Lakeside Botanical & Cream', colors: ['#3D5A45', '#FDFBF7', '#C49A6C'] },
];

const AVAILABLE_SERVICES = [
  { id: 'stage', label: 'Stage Decoration', desc: 'Podium, backdrop & floral arches' },
  { id: 'entrance', label: 'Grand Entrance', desc: 'Tunnel arches & mirrored welcome' },
  { id: 'tables', label: 'Tables & Styling', desc: 'Linens, chargers & cutlery' },
  { id: 'chairs', label: 'Chairs & Ribbons', desc: 'Chiavari, Dior & velvet covers' },
  { id: 'centerpieces', label: 'Floral Centerpieces', desc: 'Tall urns & low lush arrangements' },
  { id: 'backdrop', label: 'Photo Backdrops', desc: '3D floral & custom neon monograms' },
  { id: 'flowers', label: 'Fresh Flower Installations', desc: 'Imported roses & local blooms' },
  { id: 'lighting', label: 'Ambient & Mood Lighting', desc: 'Uplights, chandeliers & spotlights' },
  { id: 'photo-area', label: 'Selfie / Media Wall', desc: 'Studio ring lights & props' },
  { id: 'ceiling', label: 'Ceiling Draping', desc: 'Silk clouds & fairy light canopies' },
];

const BUDGET_RANGES = [
  'Under ETB 100,000',
  'ETB 100,000 – 200,000',
  'ETB 200,000 – 350,000',
  'ETB 350,000+',
  'I prefer discussing budget during consultation',
];

function PlanEventWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState<number>(1);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [requestId, setRequestId] = useState<string>('');
  const [createdBookingId, setCreatedBookingId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isProcessingChapa, setIsProcessingChapa] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    eventType: 'Wedding',
    eventDate: '2026-12-18',
    guestCount: '200',
    venueType: 'Hotel',
    venueName: '',
    stylePreference: 'Luxury',
    selectedTheme: COLOR_THEMES[0].name,
    customColor: '#5B1424',
    selectedServices: ['stage', 'entrance', 'tables', 'flowers', 'lighting'],
    budgetRange: 'ETB 200,000 – 350,000',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialNotes: '',
  });

  // Pre-fill from query params if passed
  useEffect(() => {
    const pkg = searchParams.get('package');
    const project = searchParams.get('project');
    const type = searchParams.get('type');
    const service = searchParams.get('service');

    let initialNotes: string[] = [];

    if (type && EVENT_TYPES.includes(type)) {
      setFormData((prev) => ({ ...prev, eventType: type }));
    }

    if (pkg) {
      initialNotes.push(`Selected Package Tier: ${decodeURIComponent(pkg)}`);
    }

    if (project) {
      initialNotes.push(`Inspiration Style Reference: ${decodeURIComponent(project)}`);
    }

    if (service) {
      setFormData((prev) => ({
        ...prev,
        selectedServices: prev.selectedServices.includes(service)
          ? prev.selectedServices
          : [...prev.selectedServices, service],
      }));
    }

    if (initialNotes.length > 0) {
      setFormData((prev) => ({
        ...prev,
        specialNotes: prev.specialNotes
          ? `${prev.specialNotes} | ${initialNotes.join(' | ')}`
          : initialNotes.join(' | '),
      }));
    }

    // Pre-fill from authenticated session
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setFormData((prev) => ({
            ...prev,
            guestName: prev.guestName || data.user.fullName || '',
            guestEmail: prev.guestEmail || data.user.email || '',
          }));
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const toggleService = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(id);
      return {
        ...prev,
        selectedServices: exists
          ? prev.selectedServices.filter((s) => s !== id)
          : [...prev.selectedServices, id],
      };
    });
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/event-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRequestId(data.data.requestNumber);
        if (data.data.bookingId) {
          setCreatedBookingId(data.data.bookingId);
        }
        // Persist to client browser storage for instant lookup in customer portal
        try {
          const prev = JSON.parse(localStorage.getItem('mekdi_client_requests') || '[]');
          prev.unshift(data.data);
          localStorage.setItem('mekdi_client_requests', JSON.stringify(prev));
          localStorage.setItem('mekdi_client_email', formData.guestEmail);
        } catch {}
      } else {
        setRequestId(`MD-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
      }
    } catch {
      setRequestId(`MD-REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5B1424', '#D4AF37', '#F5EFEB'],
      });
    } catch {}
  };

  const handlePayDepositNow = async () => {
    setIsProcessingChapa(true);
    try {
      const bId = createdBookingId || `b-${requestId}`;
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: bId,
          customerId: formData.guestEmail,
          customerName: formData.guestName,
          customerEmail: formData.guestEmail,
          customerPhone: formData.guestPhone,
          amount: 50000,
          currency: 'ETB',
          provider: 'CHAPA',
          paymentType: 'DEPOSIT',
          description: `50% Initial Deposit for ${formData.eventType} on ${formData.eventDate}`,
          origin: window.location.origin,
          returnUrl: `${window.location.origin}/payments/callback?bookingId=${encodeURIComponent(bId)}&type=DEPOSIT`,
        }),
      });

      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      alert(data.error || 'Could not initiate Chapa checkout. Please try again.');
    } catch (err: any) {
      alert(err.message || 'Error contacting payment gateway.');
    } finally {
      setIsProcessingChapa(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Bespoke Event Experience
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Design Your Event
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-charcoal-600 font-light">
            Tell us about your dream celebration and we&apos;ll curate a personalized proposal and 3D design concept.
          </p>
        </div>

        {/* Step Progression Bar */}
        {!submitted && (
          <div className="mb-10">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-600 mb-2">
              <span className={step >= 1 ? 'text-burgundy-900 font-bold' : ''}>1. Event</span>
              <span className={step >= 2 ? 'text-burgundy-900 font-bold' : ''}>2. Style</span>
              <span className={step >= 3 ? 'text-burgundy-900 font-bold' : ''}>3. Services</span>
              <span className={step >= 4 ? 'text-burgundy-900 font-bold' : ''}>4. Budget</span>
              <span className={step >= 5 ? 'text-burgundy-900 font-bold' : ''}>5. Contact</span>
              <span className={step >= 6 ? 'text-burgundy-900 font-bold' : ''}>6. Review</span>
            </div>
            <div className="h-2 w-full bg-cream-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-burgundy-800 to-gold-500 transition-all duration-500"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Submission Confirmation Screen */}
        {submitted ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-gold-400 shadow-elevated text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-botanical-100 border-2 border-botanical-500 text-botanical-700 flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block mb-1">
              Event Request Received
            </span>
            <h2 className="font-editorial text-3xl font-bold text-charcoal-900 mb-3">
              We&apos;re Excited to Create Magic For You!
            </h2>

            <div className="p-4 rounded-2xl bg-cream-100 max-w-sm mx-auto mb-6 border border-cream-300">
              <span className="text-[11px] uppercase tracking-wider text-charcoal-500 block">
                Your Reference Number
              </span>
              <span className="font-mono text-xl font-bold text-burgundy-900 tracking-wider">
                {requestId}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto leading-relaxed mb-6 font-light">
              Our lead designer Mekdes and the production concierge will review your selections ({formData.eventType} on {formData.eventDate}) and generate an itemized quote within 24 hours.
            </p>

            {/* Chapa Date Lock Payment Card */}
            <div className="bg-cream-100/70 border-2 border-gold-400 rounded-3xl p-6 sm:p-8 max-w-lg mx-auto mb-8 shadow-sm text-center">
              <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
                Priority Date Lock • Instant Chapa Settlement
              </span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                Lock In Your Event Date Now
              </h3>
              <p className="text-xs text-charcoal-600 mb-5 font-light leading-relaxed">
                Want guaranteed priority? Pay the initial 50,000 ETB reservation deposit now to officially lock your event date ({formData.eventDate}) in our production schedule.
              </p>

              <button
                type="button"
                disabled={isProcessingChapa}
                onClick={handlePayDepositNow}
                className="w-full py-4 rounded-full text-xs font-bold tracking-wider uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center justify-center gap-2 cursor-pointer mb-2.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {isProcessingChapa
                    ? 'Connecting to Chapa National Gateway...'
                    : 'Pay 50,000 ETB Deposit via Chapa →'}
                </span>
              </button>

              <span className="text-[10px] text-charcoal-400 block">
                Instant settlement with Telebirr, CBE Birr, or Debit Card
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={`/bookings?tab=requests&email=${encodeURIComponent(formData.guestEmail)}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Track Request On Client Portal</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setStep(1);
                }}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-cream-200 text-charcoal-800 hover:bg-cream-300 transition-colors"
              >
                Plan Another Celebration
              </button>
            </div>
          </div>
        ) : (
          /* Multi-step Form Card */
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-card transition-all"
          >
            {/* STEP 1: EVENT DETAILS */}
            {step === 1 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    Event Basics
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    What type of event are you hosting and where will it be held?
                  </p>
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-3">
                    Event Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EVENT_TYPES.map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormData({ ...formData, eventType: type })}
                        className={`p-3.5 rounded-2xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          formData.eventType === type
                            ? 'bg-burgundy-900 text-cream-50 border-gold-400 shadow-md'
                            : 'bg-cream-50 text-charcoal-800 border-cream-300 hover:border-gold-400'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Event Date & Guest Count */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                      Event Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.eventDate}
                        onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs font-medium text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                      Estimated Guest Count
                    </label>
                    <div className="flex gap-2">
                      {GUEST_COUNTS.map((count) => (
                        <button
                          type="button"
                          key={count}
                          onClick={() => setFormData({ ...formData, guestCount: count })}
                          className={`flex-1 py-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                            formData.guestCount === count
                              ? 'bg-burgundy-900 text-cream-50 border-gold-400'
                              : 'bg-cream-50 text-charcoal-800 border-cream-300'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Venue Type & Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-3">
                    Venue Setting
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                    {VENUE_TYPES.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => setFormData({ ...formData, venueType: v })}
                        className={`py-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                          formData.venueType === v
                            ? 'bg-burgundy-900 text-cream-50 border-gold-400'
                            : 'bg-cream-50 text-charcoal-800 border-cream-300'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[11px] text-charcoal-500 font-medium">Quick Location:</span>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, venueName: prev.venueName ? `${prev.venueName}, Hawassa` : 'Hawassa' }))}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-cream-100 border border-gold-400/40 text-burgundy-900 font-semibold hover:bg-gold-50"
                    >
                      📍 Hawassa
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, venueName: prev.venueName ? `${prev.venueName}, Shashemene` : 'Shashemene' }))}
                      className="px-2.5 py-1 rounded-full text-[11px] bg-cream-100 border border-gold-400/40 text-burgundy-900 font-semibold hover:bg-gold-50"
                    >
                      📍 Shashemene
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Venue name, resort, or hall (e.g. Haile Resort Hawassa, Shashemene Palace Hall, or Private Residence)"
                    value={formData.venueName}
                    onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs font-medium text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: STYLE & PALETTE */}
            {step === 2 && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    Style & Atmosphere
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Choose the design personality and color harmonies you envision.
                  </p>
                </div>

                {/* Style */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-3">
                    Aesthetic Direction
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        type="button"
                        key={style}
                        onClick={() => setFormData({ ...formData, stylePreference: style })}
                        className={`p-3 rounded-2xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          formData.stylePreference === style
                            ? 'bg-burgundy-900 text-cream-50 border-gold-400 shadow-md'
                            : 'bg-cream-50 text-charcoal-800 border-cream-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Palette Choices */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-3">
                    Signature Color Harmonies
                  </label>
                  <div className="space-y-3">
                    {COLOR_THEMES.map((theme) => {
                      const isSelected = formData.selectedTheme === theme.name;
                      return (
                        <div
                          key={theme.name}
                          onClick={() => setFormData({ ...formData, selectedTheme: theme.name })}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-cream-100 border-burgundy-800 shadow-sm'
                              : 'bg-cream-50 border-cream-300 hover:border-gold-400'
                          }`}
                        >
                          <span className="text-xs font-semibold text-charcoal-900">
                            {theme.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {theme.colors.map((c, i) => (
                              <span
                                key={i}
                                className="w-6 h-6 rounded-full border border-white shadow-sm"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SERVICES */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    What elements do you need?
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Select all areas of the venue you would like Mekdi Decor to curate.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const isChecked = formData.selectedServices.includes(srv.id);
                    return (
                      <div
                        key={srv.id}
                        onClick={() => toggleService(srv.id)}
                        className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-burgundy-900 text-cream-50 border-gold-400 shadow-sm'
                            : 'bg-cream-50 text-charcoal-800 border-cream-300 hover:border-gold-400'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-semibold tracking-wide">
                            {srv.label}
                          </h4>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isChecked ? 'text-cream-200/80' : 'text-charcoal-500'
                            }`}
                          >
                            {srv.desc}
                          </p>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                            isChecked
                              ? 'bg-gold-500 text-burgundy-950 border-gold-400'
                              : 'bg-white text-transparent border-cream-300'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: BUDGET */}
            {step === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    Investment Range
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Sharing an approximate budget helps us recommend the highest-impact elements for your celebration.
                  </p>
                </div>

                <div className="space-y-3">
                  {BUDGET_RANGES.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setFormData({ ...formData, budgetRange: b })}
                      className={`w-full p-4 rounded-2xl text-xs font-semibold text-left border flex items-center justify-between transition-all cursor-pointer ${
                        formData.budgetRange === b
                          ? 'bg-burgundy-900 text-cream-50 border-gold-400 shadow-sm'
                          : 'bg-cream-50 text-charcoal-800 border-cream-300 hover:border-gold-400'
                      }`}
                    >
                      <span>{b}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          formData.budgetRange === b
                            ? 'border-gold-400 bg-gold-400'
                            : 'border-cream-400'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: CONTACT INFORMATION */}
            {step === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    Contact Details
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Where should we send your itemized proposal and 3D preview?
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sara Tekle"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                        Phone Number (or Telegram) *
                      </label>
                      <input
                        type="tel"
                        placeholder="+251 9XX XXX XXX"
                        value={formData.guestPhone}
                        onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="sara@example.com"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-2">
                      Special Requests or Inspiration Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about specific flower varieties, wedding colors, or special surprises..."
                      value={formData.specialNotes}
                      onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: SUMMARY & REVIEW */}
            {step === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-charcoal-900 mb-1">
                    Review Your Event Request
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Confirm your details before our atelier begins drafting your quotation.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-cream-100/70 border border-cream-300 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Occasion</span>
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {formData.eventType}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 block">Date</span>
                      <span className="font-semibold text-charcoal-900 text-sm">
                        {formData.eventDate}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-cream-200">
                    <div>
                      <span className="text-charcoal-500 block">Guests & Venue</span>
                      <span className="font-medium text-charcoal-900">
                        {formData.guestCount} Guests • {formData.venueType} ({formData.venueName || 'To Be Finalized'})
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 block">Style & Palette</span>
                      <span className="font-medium text-burgundy-900">
                        {formData.stylePreference} ({formData.selectedTheme})
                      </span>
                    </div>
                  </div>

                  <div className="pb-4 border-b border-cream-200">
                    <span className="text-charcoal-500 block mb-1">
                      Requested Elements ({formData.selectedServices.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.selectedServices.map((id) => (
                        <span
                          key={id}
                          className="px-2.5 py-0.5 rounded-md bg-white border border-cream-300 text-charcoal-800 text-[11px] font-medium"
                        >
                          {AVAILABLE_SERVICES.find((s) => s.id === id)?.label || id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {formData.specialNotes && (
                    <div className="pb-4 border-b border-cream-200">
                      <span className="text-charcoal-500 block mb-1">Notes & Package Reference</span>
                      <p className="text-charcoal-800 font-medium text-[11px] bg-white p-2.5 rounded-lg border border-cream-200">
                        {formData.specialNotes}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-charcoal-500 block">Contact</span>
                      <span className="font-medium text-charcoal-900">
                        {formData.guestName || 'Sara Tekle'} • {formData.guestPhone || '+251 922 334 455'}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal-500 block">Budget Preference</span>
                      <span className="font-semibold text-burgundy-900">
                        {formData.budgetRange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-cream-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 rounded-full text-xs font-semibold tracking-wider text-charcoal-700 hover:text-burgundy-900 bg-cream-100 hover:bg-cream-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {step < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 text-gold-400" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-9 py-4 rounded-full text-xs font-semibold tracking-widest uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center gap-2 cursor-pointer font-bold disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Submit Event Request'}</span>
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function PlanEventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 py-24 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-charcoal-700">Loading Event Planner...</p>
          </div>
        </div>
      }
    >
      <PlanEventWizard />
    </Suspense>
  );
}
