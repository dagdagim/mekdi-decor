'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Calendar,
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  MessageSquare,
  Users,
  Compass,
  ArrowLeft,
  Share2,
  CreditCard,
  Send,
  Heart,
  Plus,
  X,
  MapPin,
  Clock,
  Phone,
  FileText,
  ShieldCheck,
  ChevronRight,
  Palette,
  Image as ImageIcon,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Home,
  LogOut,
  Star,
  Sliders,
  Download,
  Layers,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency } from '@/lib/utils';
import { GALLERY_PROJECTS } from '@/lib/data/mock-db';

const EVENT_TYPES_LIST = ['Wedding', 'Birthday', 'Graduation', 'Engagement', 'Corporate', 'Other'];
const GUEST_COUNTS_LIST = ['50', '100', '200', '350', '500+'];
const VENUE_TYPES_LIST = ['Hotel', 'Hall', 'Indoor', 'Outdoor', 'Home', 'Other'];
const STYLE_OPTIONS_LIST = [
  'Luxury',
  'Romantic',
  'Modern',
  'Minimal',
  'Traditional',
  'Floral',
  'Custom',
];

const COLOR_THEMES_LIST = [
  { name: 'Royal Burgundy & Champagne Gold', colors: ['#5B1424', '#D4AF37', '#FAF6F0'] },
  { name: 'Emerald Forest & Polished Brass', colors: ['#1F3A2B', '#D4AF37', '#FFFFFF'] },
  { name: 'Blush Rose & Warm Ivory', colors: ['#F5D0C5', '#FAF6F0', '#D4AF37'] },
  { name: 'Imperial Crimson & Black Tie', colors: ['#8E1730', '#1C1917', '#E5C365'] },
  { name: 'Lakeside Botanical & Cream', colors: ['#3D5A45', '#FDFBF7', '#C49A6C'] },
];

const AVAILABLE_SERVICES_LIST = [
  { id: 'stage', label: 'Stage Decoration', desc: 'Podium, backdrop & floral arches', price: 35000 },
  { id: 'entrance', label: 'Grand Entrance', desc: 'Tunnel arches & mirrored welcome', price: 20000 },
  { id: 'tables', label: 'Tables & Styling', desc: 'Linens, chargers & cutlery', price: 25000 },
  { id: 'chairs', label: 'Chairs & Ribbons', desc: 'Chiavari, Dior & velvet covers', price: 15000 },
  { id: 'centerpieces', label: 'Floral Centerpieces', desc: 'Tall urns & low lush arrangements', price: 20000 },
  { id: 'backdrop', label: 'Photo Backdrops', desc: '3D floral & custom neon monograms', price: 18000 },
  { id: 'flowers', label: 'Fresh Flower Installations', desc: 'Imported roses & local blooms', price: 30000 },
  { id: 'lighting', label: 'Ambient & Mood Lighting', desc: 'Uplights, chandeliers & spotlights', price: 15000 },
  { id: 'photo-area', label: 'Selfie / Media Wall', desc: 'Studio ring lights & props', price: 12000 },
  { id: 'ceiling', label: 'Ceiling Draping', desc: 'Silk clouds & fairy light canopies', price: 25000 },
];

const BUDGET_RANGES_LIST = [
  'Under ETB 100,000',
  'ETB 100,000 – 200,000',
  'ETB 200,000 – 350,000',
  'ETB 350,000+',
  'Discuss during consultation',
];

interface MobileMessage {
  id: string;
  sender: string;
  isMe: boolean;
  text: string;
  time: string;
  quoteRef?: string;
}

type MobileScreen =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'events'
  | 'plan-event'
  | 'event-processing'
  | 'inspiration'
  | 'messages'
  | 'profile';

export default function MobilePreviewPage() {
  // Mobile Active Screen State
  const [activeScreen, setActiveScreen] = useState<MobileScreen>('home');
  const [detailTab, setDetailTab] = useState<'progress' | 'quote' | 'photos' | 'payments'>('progress');

  // Onboarding Carousel State
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  // Auth Screen State
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [authName, setAuthName] = useState('Sara Tekle');
  const [authEmail, setAuthEmail] = useState('sara.t@example.com');
  const [authPhone, setAuthPhone] = useState('+251 922 334 455');
  const [authOccasion, setAuthOccasion] = useState('Wedding');
  const [authPassword, setAuthPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);

  // Full-Screen Event Planner Wizard State
  const [plannerStep, setPlannerStep] = useState(1);
  const [plannerData, setPlannerData] = useState({
    type: 'Wedding',
    date: '2026-12-18',
    city: 'Addis Ababa',
    venue: 'Sheraton Addis Grand Ballroom',
    venueType: 'Hotel',
    guests: '200',
    style: 'Luxury',
    selectedTheme: 'Royal Burgundy & Champagne Gold',
    selectedServices: ['stage', 'entrance', 'tables', 'flowers', 'lighting'],
    budget: 'ETB 200,000 – 350,000',
    name: 'Sara Tekle',
    phone: '+251 922 334 455',
    email: 'sara.t@example.com',
    notes: 'We want fresh Ecuadorian garden roses, velvet backdrop, and warm amber pinspots.',
  });
  const [plannerSubmitting, setPlannerSubmitting] = useState(false);

  // Live Database Services, Packages & Transformation toggle
  const [dbServices, setDbServices] = useState<any[]>([]);
  const [dbPackages, setDbPackages] = useState<any[]>([]);
  const [transformationMode, setTransformationMode] = useState<'after' | 'before'>('after');

  // Bookings & Requests from database
  const [bookings, setBookings] = useState<any[]>([]);
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [eventsSubTab, setEventsSubTab] = useState<'bookings' | 'requests'>('bookings');
  const [quoteDetails, setQuoteDetails] = useState<any>(null);

  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'CHAPA' | 'TELEBIRR' | 'CBE_BIRR'>('CHAPA');
  const [isPaying, setIsPaying] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  // Inspirations / Gallery
  const [galleryItems, setGalleryItems] = useState(GALLERY_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<typeof GALLERY_PROJECTS[0] | null>(null);
  const [savedFavorites, setSavedFavorites] = useState<string[]>(['proj-1', 'proj-3']);
  const [inspirationFilter, setInspirationFilter] = useState('All');
  const [customerProfile, setCustomerProfile] = useState<any>(null);

  // Concierge Chat
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<MobileMessage[]>([
    {
      id: 'm1',
      sender: 'Sara Tekle',
      isMe: true,
      text: 'Good morning Mekdes! We reviewed the initial concept pictures for our Hawassa wedding. We love the blush and deep burgundy tones!',
      time: '09:15 AM',
    },
    {
      id: 'm2',
      sender: 'Mekdes Tadesse (Lead Designer)',
      isMe: false,
      text: 'Good morning Sara! We have finalized your official quotation MD-QT-2026-108 with the 10m stage and fresh garden rose arrangements.',
      time: '10:00 AM',
      quoteRef: 'MD-QT-2026-108',
    },
    {
      id: 'm3',
      sender: 'Sara Tekle',
      isMe: true,
      text: 'Thank you so much! Just checked the line items. The breakdown is clear and the pricing is very reasonable. We are ready to proceed with deposit.',
      time: '11:45 AM',
    },
  ]);

  // Fetch real database records on mount
  useEffect(() => {
    // 1. Fetch gallery items from DB
    fetch('/api/gallery')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setGalleryItems(resData.data);
        }
      })
      .catch(() => {});

    // 2. Fetch quotation status & discount details from DB
    fetch('/api/quotes/MD-QT-2026-108')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data) {
          setQuoteDetails(resData.data);
          if (resData.data.status === 'APPROVED' || resData.data.depositPaid) {
            setDepositPaid(true);
          }
        }
      })
      .catch(() => {});

    // 3. Fetch messages from DB
    fetch('/api/messages?customerId=cust-01')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setMessages(
            resData.data.map((m: any) => ({
              id: m.id,
              sender: m.senderName,
              isMe: m.senderRole === 'CUSTOMER',
              text: m.messageText,
              time: m.createdAt || '10:00 AM',
            }))
          );
        }
      })
      .catch(() => {});

    // 4. Fetch customer profile from DB
    fetch('/api/customers')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data)) {
          const sara = resData.data.find((c: any) => c.fullName.includes('Sara'));
          if (sara) setCustomerProfile(sara);
        }
      })
      .catch(() => {});

    // 5. Fetch Confirmed Bookings from DB
    fetch('/api/bookings?email=sara.t@example.com')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setBookings(resData.data);
        } else {
          setBookings([
            {
              id: 'b-001',
              bookingNumber: 'MD-BK-2026-108',
              eventTitle: "Sara & Michael's Luxury Wedding",
              eventDate: 'Dec 18, 2026',
              venueName: 'Skyline Event Hall, Hawassa',
              guestCount: 350,
              progress: 80,
              depositPaid: true,
              totalAmount: 205000,
              depositAmount: 102500,
              balanceAmount: 102500,
            },
          ]);
        }
      })
      .catch(() => {});

    // 6. Fetch Pending Event Requests from DB
    fetch('/api/event-requests?email=sara.t@example.com')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setEventRequests(resData.data);
        } else {
          setEventRequests([
            {
              id: 'req-001',
              referenceNumber: 'REQ-2026-001',
              guestName: 'Sara Tekle',
              eventType: 'Wedding',
              eventDate: 'Dec 18, 2026',
              venueName: 'Skyline Event Hall, Hawassa',
              guestCount: 350,
              status: 'CONSULTATION_PHASE',
              budgetRange: 'ETB 200,000 – 300,000',
            },
          ]);
        }
      })
      .catch(() => {});

    // 7. Fetch Live Bespoke Services from DB
    fetch('/api/services')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setDbServices(resData.data);
        }
      })
      .catch(() => {});

    // 8. Fetch Live Packages from DB
    fetch('/api/packages')
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data && Array.isArray(resData.data) && resData.data.length > 0) {
          setDbPackages(resData.data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
      fetch('/api/inspirations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: 'cust-01', galleryItemId: id }),
      }).catch(() => {});
      return updated;
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: MobileMessage = {
      id: `msg-${Date.now()}`,
      sender: 'Sara Tekle',
      isMe: true,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'cust-01',
        senderName: 'Sara Tekle',
        senderRole: 'CUSTOMER',
        messageText: newMsg.text,
      }),
    }).catch(() => {});

    setTimeout(() => {
      const replyMsg: MobileMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'Mekdes Tadesse (Lead Designer)',
        isMe: false,
        text: 'Thank you Sara! I have noted this in your production file. Our floral conditioning crew is ready for your setup.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, replyMsg]);

      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: 'cust-01',
          senderName: 'Mekdes Tadesse (Lead Designer)',
          senderRole: 'CONCIERGE',
          messageText: replyMsg.text,
        }),
      }).catch(() => {});
    }, 1200);
  };

  const handlePayDeposit = async () => {
    setIsPaying(true);

    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: 'MD-QT-2026-108',
          amount: 102500,
          currency: 'ETB',
          provider: selectedProvider,
          customerEmail: 'sara.t@example.com',
        }),
      });

      await fetch('/api/quotes/MD-QT-2026-108', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED', depositPaid: true }),
      });

      const bookRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: 'MD-QT-2026-108',
          customerEmail: 'sara.t@example.com',
          depositPaid: true,
          depositAmount: 102500,
        }),
      });
      const bookJson = await bookRes.json();
      if (bookJson.success && bookJson.data) {
        setBookings((prev) => [bookJson.data, ...prev]);
        setEventRequests((prev) =>
          prev.filter((r) => r.id !== 'req-001' && r.referenceNumber !== 'REQ-2026-001')
        );
      }
    } catch (e) {
      console.error(e);
    }

    setIsPaying(false);
    setDepositPaid(true);
    setShowPaymentModal(false);

    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
      });
    } catch {}
  };

  const calculateEstimatedCost = () => {
    const baseBudget = 75000;
    const guestCountNum = parseInt(plannerData.guests) || 200;
    const guestMultiplier = guestCountNum >= 350 ? 1.5 : guestCountNum >= 200 ? 1.25 : 1.0;
    const servicesCost = plannerData.selectedServices.reduce((acc, sId) => {
      const s = AVAILABLE_SERVICES_LIST.find((srv) => srv.id === sId);
      return acc + (s ? s.price : 15000);
    }, 0);
    return Math.round((baseBudget + servicesCost) * guestMultiplier);
  };

  const handlePlannerSubmit = async () => {
    setPlannerSubmitting(true);
    try {
      const res = await fetch('/api/event-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: plannerData.name,
          guestPhone: plannerData.phone,
          guestEmail: plannerData.email || 'sara.t@example.com',
          eventType: plannerData.type,
          eventDate: plannerData.date,
          guestCount: parseInt(plannerData.guests) || 200,
          venueName: `${plannerData.venue}, ${plannerData.city}`,
          venueType: plannerData.venueType,
          stylePreference: plannerData.style,
          colorTheme: plannerData.selectedTheme,
          selectedServices: plannerData.selectedServices,
          budgetRange: plannerData.budget,
          estimatedCost: calculateEstimatedCost(),
          specialNotes: plannerData.notes,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEventRequests((prev) => [json.data, ...prev]);
        setEventsSubTab('requests');
      }
    } catch (e) {
      console.error(e);
    }

    setPlannerSubmitting(false);
    setPlannerStep(1);
    setActiveScreen('event-processing');

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
      });
    } catch {}
  };

  const filteredInspirations = (galleryItems as any[]).filter((p) => {
    if (inspirationFilter === 'All') return true;
    if (inspirationFilter === 'Saved') return savedFavorites.includes(p.id);
    return (p.eventType || p.category || '').toLowerCase() === inspirationFilter.toLowerCase();
  });

  // Onboarding Slides Data
  const onboardingSlides = [
    {
      title: 'Bespoke Visual Symphonies',
      subtitle: 'የተዋበ የሰርግ እና ድግስ ዲዛይን',
      desc: 'Architectural velvet stages, imported Ecuadorian garden roses, and synchronized ambient lighting curated for Ethiopia’s finest celebrations.',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
      badge: 'MASTER FLORISTRY & STAGECRAFT',
    },
    {
      title: 'Royal Heritage & Modern Glamour',
      subtitle: 'ባህላዊ መልስ እና ዘመናዊ ዝግጅቶች',
      desc: 'Authentic Ethiopian traditions (Melse, Tilfi textiles & Mesob canopies) blended with contemporary five-star European styling.',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
      badge: 'ETHIOPIAN TRADITIONS',
    },
    {
      title: 'Seamless Digital Concierge',
      subtitle: 'ቀጥታ ክፍያ እና የዝግጅት ሂደት ክትትል',
      desc: 'Itemized blueprints, instant 50% deposit authorization via Chapa or Telebirr, and live milestone tracking with lead stylist Mekdes.',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
      badge: 'CHAPA & TELEBIRR INTEGRATED',
    },
  ];

  return (
    <div className="min-h-screen bg-cream-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Title & Breadcrumb */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Smartphone className="w-3.5 h-3.5 text-gold-600" />
            Complete Native Customer Mobile Experience
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-charcoal-900">
            Mekdi Decor Customer Mobile App
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-charcoal-600 font-light">
            Interactive native mobile simulator. Experience the splash screen, 3-step onboarding, VIP authentication, multi-stage event planner, live production processing timeline, Ethiopian gateway payments, and concierge chat.
          </p>
        </div>

        {/* Quick Screen Jump Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10 max-w-5xl mx-auto p-2 bg-white rounded-2xl border border-cream-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-400 px-2">
            Jump to Screen:
          </span>
          {[
            { id: 'splash', label: '🌟 Splash' },
            { id: 'onboarding', label: '📖 Onboarding' },
            { id: 'auth', label: '🔐 Sign In / Up' },
            { id: 'home', label: '🏠 Home' },
            { id: 'plan-event', label: '📋 Event Planner' },
            { id: 'event-processing', label: '⏳ Processing / Timeline' },
            { id: 'events', label: '📅 Celebrations' },
            { id: 'inspiration', label: '🎨 Inspirations' },
            { id: 'messages', label: '💬 Concierge' },
            { id: 'profile', label: '👤 Profile' },
          ].map((screen) => (
            <button
              key={screen.id}
              onClick={() => setActiveScreen(screen.id as MobileScreen)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeScreen === screen.id
                  ? 'bg-burgundy-900 text-gold-300 shadow-xs scale-105'
                  : 'text-charcoal-600 hover:bg-cream-100 hover:text-burgundy-900'
              }`}
            >
              {screen.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Feature Breakdown */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-burgundy-800 bg-burgundy-100 px-3 py-1 rounded-full inline-block mb-2">
                Luxury Mobile Architecture
              </span>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 leading-snug">
                Every Customer Feature at Your Fingertips
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-600 font-light leading-relaxed mt-2">
                Crafted with bespoke typography, Ethiopian hospitality elements, and flawless integration with backend bookings, quotes, and payment gateways.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div
                onClick={() => setActiveScreen('splash')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeScreen === 'splash'
                    ? 'bg-burgundy-50 border-burgundy-300 shadow-xs'
                    : 'bg-white border-cream-200 hover:border-gold-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-burgundy-900 text-gold-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">Splash & Animated Brand Reveal</h4>
                  <p className="text-[11px] text-charcoal-500">Mekdi Decor gold emblem reveal with Ethiopian typography.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveScreen('onboarding')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeScreen === 'onboarding'
                    ? 'bg-burgundy-50 border-burgundy-300 shadow-xs'
                    : 'bg-white border-cream-200 hover:border-gold-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">3-Step Editorial Onboarding</h4>
                  <p className="text-[11px] text-charcoal-500">Immersive photography carousel showcasing master floristry & traditions.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveScreen('auth')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeScreen === 'auth'
                    ? 'bg-burgundy-50 border-burgundy-300 shadow-xs'
                    : 'bg-white border-cream-200 hover:border-gold-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-gold-300 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">VIP Client Registration & Sign In</h4>
                  <p className="text-[11px] text-charcoal-500">Ethiopian phone format, celebration selector, and instant guest mode.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveScreen('plan-event')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeScreen === 'plan-event'
                    ? 'bg-burgundy-50 border-burgundy-300 shadow-xs'
                    : 'bg-white border-cream-200 hover:border-gold-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-burgundy-950 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">Multi-Step Event Planning Wizard</h4>
                  <p className="text-[11px] text-charcoal-500">Occasion, destination, aesthetic, and live quote generation saved to database.</p>
                </div>
              </div>

              <div
                onClick={() => setActiveScreen('event-processing')}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  activeScreen === 'event-processing'
                    ? 'bg-burgundy-50 border-burgundy-300 shadow-xs'
                    : 'bg-white border-cream-200 hover:border-gold-400'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-charcoal-900">Event Processing & Milestone Timeline</h4>
                  <p className="text-[11px] text-charcoal-500">Track 8 production milestones, approve quotes, and authorize Chapa deposits.</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/admin"
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm"
              >
                Go to Admin Dashboard →
              </Link>
              <Link
                href="/bookings"
                className="px-5 py-2.5 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:bg-cream-100 transition-colors"
              >
                Web Bookings Portal
              </Link>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive iPhone 16 Frame */}
          <div className="lg:col-span-7 flex justify-center sticky top-6">
            <div className="w-[360px] sm:w-[390px] h-[790px] bg-charcoal-950 rounded-[52px] p-3.5 shadow-2xl border-4 border-charcoal-800 relative select-none">
              {/* Dynamic Island Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-32 h-6 bg-charcoal-900 rounded-full z-40 flex items-center justify-between px-3">
                <div className="w-2.5 h-2.5 rounded-full bg-charcoal-800" />
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-botanical-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-cream-200 font-semibold">Mekdi</span>
                </div>
              </div>

              {/* Mobile Screen Shell Inside Frame */}
              <div className="w-full h-full bg-cream-50 rounded-[42px] overflow-hidden flex flex-col justify-between relative pt-9 font-sans text-charcoal-900">
                {/* Scrollable View Container */}
                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                  {/* SCREEN 1: SPLASH */}
                  {activeScreen === 'splash' && (
                    <div className="flex-1 bg-burgundy-950 text-cream-50 flex flex-col justify-between p-8 relative animate-fadeIn min-h-full">
                      {/* Ambient background glow */}
                      <div className="absolute top-0 right-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-10 left-0 w-40 h-40 bg-burgundy-800/20 rounded-full blur-2xl" />

                      <div className="pt-8 text-center">
                        <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold">
                          Private Atelier
                        </span>
                      </div>

                      <div className="text-center space-y-4 my-auto">
                        {/* Authentic Handcrafted Botanical Lotus / Arch Emblem from Logo.tsx */}
                        <div className="w-24 h-24 mx-auto rounded-full bg-burgundy-900/90 border-2 border-gold-400 shadow-gold flex items-center justify-center p-3 animate-pulse">
                          <svg
                            viewBox="0 0 100 100"
                            className="w-16 h-16 drop-shadow-md"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Outer elegant decorative petals */}
                            <path
                              d="M50 15C50 15 32 36 32 58C32 68 40 76 50 76C60 76 68 68 68 58C68 36 50 15 50 15Z"
                              fill="#F5EFEB"
                            />
                            {/* Side left leaf */}
                            <path
                              d="M32 46C20 48 12 59 15 70C17 76 23 80 30 80C39 80 43 72 41 62C40 57 36 50 32 46Z"
                              fill="#D4AF37"
                              opacity="0.95"
                            />
                            {/* Side right leaf */}
                            <path
                              d="M68 46C80 48 88 59 85 70C83 76 77 80 70 80C61 80 57 72 59 62C60 57 64 50 68 46Z"
                              fill="#D4AF37"
                              opacity="0.95"
                            />
                            {/* Core royal bud */}
                            <path
                              d="M50 32C46 44 45 56 50 68C55 56 54 44 50 32Z"
                              fill="#5B1424"
                            />
                            {/* Foundation pedestal */}
                            <path
                              d="M26 84C38 88 62 88 74 84C70 81 30 81 26 84Z"
                              fill="#D4AF37"
                            />
                          </svg>
                        </div>
                        <div>
                          <h2 className="font-editorial text-3xl font-bold tracking-widest text-cream-50 uppercase">
                            MEKDI DECOR
                          </h2>
                          <p className="text-gold-300 font-medium text-sm tracking-wider mt-0.5">
                            መክዲ ዴኮር
                          </p>
                        </div>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent mx-auto" />
                        <p className="font-editorial italic text-xs text-cream-200/80">
                          Making Moments Unforgettable
                        </p>
                      </div>

                      <div className="space-y-3 pb-6">
                        <button
                          onClick={() => setActiveScreen('onboarding')}
                          className="w-full py-3.5 rounded-2xl bg-gold-500 text-burgundy-950 font-bold text-xs uppercase tracking-wider shadow-gold hover:bg-gold-400 transition-all flex items-center justify-center gap-2"
                        >
                          <span>Explore Collection</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setActiveScreen('home')}
                          className="w-full py-2.5 text-center text-[11px] text-cream-300/60 font-semibold hover:text-cream-100"
                        >
                          Skip to Dashboard →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 2: ONBOARDING */}
                  {activeScreen === 'onboarding' && (
                    <div className="flex-1 flex flex-col justify-between bg-charcoal-950 text-white relative animate-fadeIn min-h-full">
                      {/* Image header with gradient */}
                      <div className="relative h-72 w-full overflow-hidden">
                        <img
                          src={onboardingSlides[onboardingIndex].image}
                          alt="Onboarding"
                          className="w-full h-full object-cover transition-all duration-500 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-charcoal-950" />
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={() => setActiveScreen('auth')}
                            className="px-3 py-1 rounded-full bg-black/40 text-cream-200 text-[10px] font-bold backdrop-blur-sm"
                          >
                            SKIP
                          </button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/30 inline-block">
                            {onboardingSlides[onboardingIndex].badge}
                          </span>
                          <h3 className="font-editorial text-2xl font-bold text-cream-50 leading-tight">
                            {onboardingSlides[onboardingIndex].title}
                          </h3>
                          <p className="text-xs text-gold-300 font-medium">
                            {onboardingSlides[onboardingIndex].subtitle}
                          </p>
                          <p className="text-xs text-cream-300/70 font-light leading-relaxed">
                            {onboardingSlides[onboardingIndex].desc}
                          </p>
                        </div>

                        {/* Slide Indicator & Buttons */}
                        <div className="space-y-4 pt-4">
                          <div className="flex justify-center gap-1.5">
                            {onboardingSlides.map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setOnboardingIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${
                                  onboardingIndex === i ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/20'
                                }`}
                              />
                            ))}
                          </div>

                          <div className="flex gap-2">
                            {onboardingIndex > 0 && (
                              <button
                                onClick={() => setOnboardingIndex((prev) => prev - 1)}
                                className="px-4 py-3 rounded-xl border border-white/20 text-cream-200 text-xs font-semibold"
                              >
                                Back
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (onboardingIndex < onboardingSlides.length - 1) {
                                  setOnboardingIndex((prev) => prev + 1);
                                } else {
                                  setActiveScreen('auth');
                                }
                              }}
                              className="flex-1 py-3.5 rounded-xl bg-gold-500 text-burgundy-950 font-bold text-xs uppercase tracking-wider shadow-gold hover:bg-gold-400 flex items-center justify-center gap-1.5"
                            >
                              <span>
                                {onboardingIndex === onboardingSlides.length - 1
                                  ? 'Get Started'
                                  : 'Continue'}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 3: AUTH (SIGN UP / SIGN IN) */}
                  {activeScreen === 'auth' && (
                    <div className="flex-1 p-5 space-y-4 animate-fadeIn min-h-full flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="text-center pt-2 pb-4">
                          <div className="w-16 h-16 rounded-full bg-burgundy-900 border border-gold-400/60 shadow-xs flex items-center justify-center mx-auto mb-2.5 p-2.5">
                            <svg viewBox="0 0 100 100" className="w-10 h-10 shrink-0" fill="none">
                              <path d="M50 15C50 15 32 36 32 58C32 68 40 76 50 76C60 76 68 68 68 58C68 36 50 15 50 15Z" fill="#F5EFEB" />
                              <path d="M32 46C20 48 12 59 15 70C17 76 23 80 30 80C39 80 43 72 41 62C40 57 36 50 32 46Z" fill="#D4AF37" opacity="0.95" />
                              <path d="M68 46C80 48 88 59 85 70C83 76 77 80 70 80C61 80 57 72 59 62C60 57 64 50 68 46Z" fill="#D4AF37" opacity="0.95" />
                              <path d="M50 32C46 44 45 56 50 68C55 56 54 44 50 32Z" fill="#5B1424" />
                              <path d="M26 84C38 88 62 88 74 84C70 81 30 81 26 84Z" fill="#D4AF37" />
                            </svg>
                          </div>
                          <h3 className="font-editorial text-2xl font-bold tracking-wider text-burgundy-950 uppercase">
                            Mekdi Decor
                          </h3>
                          <p className="font-serif italic text-xs text-gold-700">
                            Making Moments Unforgettable
                          </p>
                          <p className="text-[10px] text-charcoal-400 mt-0.5">
                            Private VIP Atelier & Client Portal
                          </p>
                        </div>

                        {/* Mode Switcher */}
                        <div className="grid grid-cols-2 gap-1 bg-cream-200/80 p-1 rounded-xl text-xs font-bold mb-4">
                          <button
                            onClick={() => setAuthMode('signup')}
                            className={`py-2 rounded-lg transition-colors ${
                              authMode === 'signup'
                                ? 'bg-burgundy-900 text-cream-50 shadow-xs'
                                : 'text-charcoal-600 hover:text-charcoal-900'
                            }`}
                          >
                            Create VIP Account
                          </button>
                          <button
                            onClick={() => setAuthMode('signin')}
                            className={`py-2 rounded-lg transition-colors ${
                              authMode === 'signin'
                                ? 'bg-burgundy-900 text-cream-50 shadow-xs'
                                : 'text-charcoal-600 hover:text-charcoal-900'
                            }`}
                          >
                            Sign In
                          </button>
                        </div>

                        {/* Fields */}
                        <div className="space-y-3 text-xs">
                          {authMode === 'signup' && (
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Full Name
                              </label>
                              <div className="relative">
                                <User className="w-4 h-4 text-gold-700 absolute left-3 top-2.5" />
                                <input
                                  type="text"
                                  value={authName}
                                  onChange={(e) => setAuthName(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                              Ethiopian Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="w-4 h-4 text-gold-700 absolute left-3 top-2.5" />
                              <input
                                type="tel"
                                value={authPhone}
                                onChange={(e) => setAuthPhone(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 text-gold-700 absolute left-3 top-2.5" />
                              <input
                                type="email"
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>
                          </div>

                          {authMode === 'signup' && (
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Celebration Type
                              </label>
                              <select
                                value={authOccasion}
                                onChange={(e) => setAuthOccasion(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              >
                                <option>Wedding</option>
                                <option>Melse (መልስ)</option>
                                <option>Graduation Dinner</option>
                                <option>Milestone Birthday</option>
                                <option>Corporate Gala</option>
                                <option>Engagement</option>
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                              Password
                            </label>
                            <div className="relative">
                              <Lock className="w-4 h-4 text-gold-700 absolute left-3 top-2.5" />
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-charcoal-400"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-5 space-y-2.5">
                          <button
                            onClick={() => {
                              setActiveScreen('home');
                              try {
                                confetti({ particleCount: 50, spread: 60 });
                              } catch {}
                            }}
                            className="w-full py-3 rounded-xl bg-burgundy-900 text-cream-50 font-bold text-xs uppercase tracking-wider hover:bg-burgundy-800 transition-colors shadow-sm"
                          >
                            {authMode === 'signup' ? 'Create VIP Membership' : 'Sign In to Portal'}
                          </button>

                          <button
                            onClick={() => setActiveScreen('home')}
                            className="w-full py-2.5 rounded-xl border border-cream-300 bg-white text-charcoal-700 font-semibold text-xs hover:bg-cream-100 transition-colors"
                          >
                            Explore Collection as Guest →
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-cream-200 text-center">
                        <p className="text-[10px] text-charcoal-400 flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-botanical-600" />
                          <span>Direct Chapa & Telebirr Verified Encryption</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 4: HOME */}
                  {activeScreen === 'home' && (
                    <div className="space-y-4 animate-fadeIn p-4">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2.5">
                          <svg viewBox="0 0 100 100" className="w-8 h-8 shrink-0 drop-shadow-xs" fill="none">
                            <path d="M50 15C50 15 32 36 32 58C32 68 40 76 50 76C60 76 68 68 68 58C68 36 50 15 50 15Z" fill="#5B1424" />
                            <path d="M32 46C20 48 12 59 15 70C17 76 23 80 30 80C39 80 43 72 41 62C40 57 36 50 32 46Z" fill="#D4AF37" opacity="0.9" />
                            <path d="M68 46C80 48 88 59 85 70C83 76 77 80 70 80C61 80 57 72 59 62C60 57 64 50 68 46Z" fill="#D4AF37" opacity="0.9" />
                            <path d="M50 32C46 44 45 56 50 68C55 56 54 44 50 32Z" fill="#FDFBF7" />
                            <path d="M26 84C38 88 62 88 74 84C70 81 30 81 26 84Z" fill="#D4AF37" />
                          </svg>
                          <div>
                            <span className="font-editorial text-xs font-bold tracking-widest text-burgundy-900 uppercase block leading-tight">
                              Mekdi Decor
                            </span>
                            <span className="text-[9.5px] text-gold-700 italic block leading-none font-serif">
                              Making Moments Unforgettable
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveScreen('profile')}
                          className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-800 flex items-center justify-center text-xs font-bold"
                          title="VIP Profile"
                        >
                          ST
                        </button>
                      </div>

                      {/* Editorial VIP Header - "Welcome" removed */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700 block">
                            Atelier Celebrations
                          </span>
                          <h3 className="font-editorial text-xl font-bold text-charcoal-900">
                            Bespoke Celebrations
                          </h3>
                          <span className="text-[11px] text-charcoal-500 block">
                            Curating your bespoke celebration milestones.
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="px-2.5 py-1 rounded-full bg-gold-500/15 border border-gold-400 text-burgundy-900 text-[10px] font-bold block mb-1">
                            VIP Diamond
                          </span>
                          <span className="text-[10px] text-charcoal-400 font-medium">
                            74 Days to Event
                          </span>
                        </div>
                      </div>

                      {/* Active Wedding Progress Card */}
                      <div className="p-4 rounded-2xl bg-burgundy-950 text-cream-50 shadow-md border border-gold-500/20 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-editorial text-sm font-bold">Your Wedding</span>
                          <span className="text-[10px] text-gold-300 bg-burgundy-900 px-2 py-0.5 rounded-full font-medium">
                            Dec 18, 2026
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="text-cream-200/70">Event Progress</span>
                            <span className="text-gold-300 font-bold">80%</span>
                          </div>
                          <div className="h-1.5 w-full bg-burgundy-900 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-400 rounded-full w-[80%]" />
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/10 text-xs flex items-center justify-between">
                          <div>
                            <span className="text-[9px] text-cream-300/70 block">Next Milestone</span>
                            <strong className="text-cream-100 text-[11px]">Final Stage & Floral Blueprint</strong>
                          </div>
                          <span className="text-[9px] font-bold text-gold-300 bg-burgundy-900/80 px-2 py-1 rounded-lg">
                            Due in 5 days
                          </span>
                        </div>

                        <button
                          onClick={() => setActiveScreen('event-processing')}
                          className="w-full py-2.5 rounded-full text-xs font-semibold uppercase bg-cream-50 text-burgundy-950 hover:bg-gold-300 transition-colors shadow-xs cursor-pointer font-bold"
                        >
                          View Live Production Timeline →
                        </button>
                      </div>

                      {/* Quick Action Shortcuts */}
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-medium text-charcoal-700">
                        <button
                          onClick={() => setActiveScreen('plan-event')}
                          className="p-2 rounded-xl bg-white border border-cream-200 flex flex-col items-center gap-1 hover:border-gold-400"
                        >
                          <Plus className="w-4 h-4 text-burgundy-900" />
                          <span>Plan Event</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveScreen('event-processing');
                            setDetailTab('quote');
                          }}
                          className="p-2 rounded-xl bg-white border border-cream-200 flex flex-col items-center gap-1 hover:border-gold-400"
                        >
                          <FileText className="w-4 h-4 text-gold-700" />
                          <span>My Quote</span>
                        </button>
                        <button
                          onClick={() => setActiveScreen('inspiration')}
                          className="p-2 rounded-xl bg-white border border-cream-200 flex flex-col items-center gap-1 hover:border-gold-400"
                        >
                          <Compass className="w-4 h-4 text-botanical-700" />
                          <span>Explore</span>
                        </button>
                        <button
                          onClick={() => setActiveScreen('messages')}
                          className="p-2 rounded-xl bg-white border border-cream-200 flex flex-col items-center gap-1 hover:border-gold-400"
                        >
                          <MessageSquare className="w-4 h-4 text-burgundy-800" />
                          <span>Chat</span>
                        </button>
                      </div>

                      {/* 1. FEATURED TRANSFORMATION (WEB SECTION ON MOBILE) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-700 block">
                              Transformation
                            </span>
                            <h4 className="font-editorial text-sm font-bold text-charcoal-900">
                              Featured Transformation
                            </h4>
                          </div>
                          {/* Toggle Pills */}
                          <div className="flex bg-cream-200 p-0.5 rounded-full text-[9px] font-bold">
                            <button
                              onClick={() => setTransformationMode('after')}
                              className={`px-2.5 py-1 rounded-full transition-all ${
                                transformationMode === 'after'
                                  ? 'bg-burgundy-900 text-gold-300 shadow-xs'
                                  : 'text-charcoal-600'
                              }`}
                            >
                              After: Mekdi
                            </button>
                            <button
                              onClick={() => setTransformationMode('before')}
                              className={`px-2.5 py-1 rounded-full transition-all ${
                                transformationMode === 'before'
                                  ? 'bg-charcoal-800 text-cream-100 shadow-xs'
                                  : 'text-charcoal-600'
                              }`}
                            >
                              Before: Raw
                            </button>
                          </div>
                        </div>

                        {/* Interactive Transformation Card */}
                        <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-gold-500/30 shadow-card">
                          <img
                            src={
                              transformationMode === 'after'
                                ? 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
                                : 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80'
                            }
                            alt="Venue transformation"
                            className="w-full h-full object-cover transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/85 via-transparent to-black/30" />
                          <div className="absolute top-2.5 left-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md ${
                                transformationMode === 'after'
                                  ? 'bg-burgundy-900/90 text-gold-300 border border-gold-500/40'
                                  : 'bg-charcoal-900/90 text-cream-200 border border-white/20'
                              }`}
                            >
                              {transformationMode === 'after' ? 'Transformed Ballroom' : 'Empty Raw Venue'}
                            </span>
                          </div>
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                            <h5 className="font-editorial text-xs font-bold leading-tight">
                              Skyline Royal Wedding • Hawassa
                            </h5>
                            <p className="text-[10px] text-cream-200/80 mt-0.5">
                              Metamorphosis of raw hall into a 350-guest botanical palace.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 2. OUR BESPOKE SERVICES (WEB SECTION ON MOBILE) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-700 block">
                              Artistry & Execution
                            </span>
                            <h4 className="font-editorial text-sm font-bold text-charcoal-900">
                              Our Bespoke Services
                            </h4>
                          </div>
                          <button
                            onClick={() => {
                              setActiveScreen('plan-event');
                              setPlannerStep(3);
                            }}
                            className="text-[10px] text-gold-700 font-semibold"
                          >
                            All Services →
                          </button>
                        </div>

                        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                          {(dbServices.length > 0
                            ? dbServices
                            : [
                                {
                                  id: 'srv-1',
                                  title: 'Stage Decoration',
                                  startingPrice: 35000,
                                  featuredImage:
                                    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=80',
                                },
                                {
                                  id: 'srv-2',
                                  title: 'Floral Design',
                                  startingPrice: 25000,
                                  featuredImage:
                                    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=500&q=80',
                                },
                                {
                                  id: 'srv-3',
                                  title: 'Venue Draping',
                                  startingPrice: 45000,
                                  featuredImage:
                                    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=500&q=80',
                                },
                                {
                                  id: 'srv-4',
                                  title: 'Table Styling',
                                  startingPrice: 20000,
                                  featuredImage:
                                    'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=500&q=80',
                                },
                                {
                                  id: 'srv-5',
                                  title: 'Grand Entrance',
                                  startingPrice: 30000,
                                  featuredImage:
                                    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&q=80',
                                },
                              ]
                          ).map((srv) => (
                            <div
                              key={srv.id}
                              onClick={() => {
                                setActiveScreen('plan-event');
                                setPlannerStep(3);
                              }}
                              className="w-32 shrink-0 bg-white rounded-xl overflow-hidden shadow-xs border border-cream-200 cursor-pointer flex flex-col justify-between hover:border-gold-400 transition-all"
                            >
                              <div className="h-20 w-full relative">
                                <img
                                  src={srv.featuredImage}
                                  alt={srv.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="p-2">
                                <span className="font-bold text-[11px] block truncate text-charcoal-900">
                                  {srv.title}
                                </span>
                                <span className="text-[9px] text-burgundy-900 font-bold block mt-0.5">
                                  From ETB {Number(srv.startingPrice).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. TAILORED DECORATION PACKAGES (WEB SECTION ON MOBILE) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-700 block">
                              Curated Experiences
                            </span>
                            <h4 className="font-editorial text-sm font-bold text-charcoal-900">
                              Tailored Packages
                            </h4>
                          </div>
                          <span className="text-[10px] text-charcoal-400 font-medium">Transparent Tiers</span>
                        </div>

                        <div className="space-y-2">
                          {(dbPackages.length > 0
                            ? dbPackages.slice(0, 3)
                            : [
                                {
                                  id: 'pkg-1',
                                  name: 'Silver Blossom',
                                  startingPrice: 65000,
                                  isFeatured: false,
                                  includedServices: [
                                    '5m Elegant Floral Stage',
                                    'Ambient Pinspots',
                                    'Head Table Styling',
                                  ],
                                },
                                {
                                  id: 'pkg-2',
                                  name: 'Gold Elegance',
                                  startingPrice: 145000,
                                  isFeatured: true,
                                  includedServices: [
                                    '10m Floral Arch Stage',
                                    'Full Room Draping',
                                    '25 Rose Centerpieces',
                                    'Mood Lighting',
                                  ],
                                },
                                {
                                  id: 'pkg-3',
                                  name: 'Imperial Royalty',
                                  startingPrice: 285000,
                                  isFeatured: false,
                                  includedServices: [
                                    '15m Multi-Tier Stage',
                                    'Grand Tunnel Entrance',
                                    'Full Chiavari Suite',
                                    'Imported Blooms',
                                  ],
                                },
                              ]
                          ).map((pkg) => (
                            <div
                              key={pkg.id}
                              className={`p-3 rounded-2xl border transition-all ${
                                pkg.isFeatured
                                  ? 'bg-burgundy-950 text-cream-50 border-gold-400 shadow-md'
                                  : 'bg-white text-charcoal-900 border-cream-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1.5">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="font-editorial text-sm font-bold">{pkg.name}</h5>
                                    {pkg.isFeatured && (
                                      <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-gold-400 text-burgundy-950 uppercase tracking-wider">
                                        Most Popular
                                      </span>
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold ${
                                      pkg.isFeatured ? 'text-gold-300' : 'text-burgundy-900'
                                    }`}
                                  >
                                    ETB {Number(pkg.startingPrice).toLocaleString()}
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveScreen('plan-event');
                                    setPlannerData((prev) => ({
                                      ...prev,
                                      budget: `ETB ${Number(pkg.startingPrice).toLocaleString()}+`,
                                    }));
                                  }}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                    pkg.isFeatured
                                      ? 'bg-gold-400 text-burgundy-950 hover:bg-gold-300'
                                      : 'bg-burgundy-900 text-cream-50 hover:bg-burgundy-800'
                                  }`}
                                >
                                  Select
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] opacity-80 pt-1 border-t border-white/10">
                                {(pkg.includedServices || []).slice(0, 3).map((item: string, i: number) => (
                                  <span key={i} className="flex items-center gap-1">
                                    <Check className="w-3 h-3 text-gold-400 shrink-0" />
                                    <span>{item}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4. HOW IT WORKS (WEB SECTION ON MOBILE) */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold tracking-widest text-gold-700 block">
                              Seamless Journey
                            </span>
                            <h4 className="font-editorial text-sm font-bold text-charcoal-900">
                              How It Works
                            </h4>
                          </div>
                          <span className="text-[10px] text-charcoal-400 font-medium">4 Steps</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {[
                            {
                              step: '01',
                              title: 'Tell Us Your Vision',
                              desc: 'Submit date, venue, guests & colors',
                            },
                            {
                              step: '02',
                              title: 'Create Your Design',
                              desc: '3D moodboard & botanical recipe',
                            },
                            {
                              step: '03',
                              title: 'Approve Your Quote',
                              desc: 'Itemized proposal & 50% deposit',
                            },
                            {
                              step: '04',
                              title: 'Celebrate Your Moment',
                              desc: '12h prior flawless setup',
                            },
                          ].map((s) => (
                            <div
                              key={s.step}
                              className="bg-white p-2.5 rounded-xl border border-cream-200 space-y-1 shadow-2xs"
                            >
                              <span className="text-[10px] font-mono font-bold text-gold-700 block">
                                {s.step}
                              </span>
                              <strong className="text-[11px] font-bold text-charcoal-900 block leading-tight">
                                {s.title}
                              </strong>
                              <p className="text-[9px] text-charcoal-500 leading-tight">{s.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended For You */}
                      <div className="pt-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-charcoal-900">
                            Recommended Inspirations
                          </span>
                          <button
                            onClick={() => setActiveScreen('inspiration')}
                            className="text-[10px] text-gold-700 font-semibold"
                          >
                            See all
                          </button>
                        </div>

                        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                          {galleryItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedProject(item)}
                              className="w-36 shrink-0 bg-white rounded-xl overflow-hidden shadow-xs border border-cream-200 cursor-pointer"
                            >
                              <div className="h-20 w-full relative">
                                <img
                                  src={item.heroImage}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={(e) => toggleFavorite(item.id, e)}
                                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white"
                                >
                                  <Heart
                                    className={`w-3 h-3 ${
                                      savedFavorites.includes(item.id)
                                        ? 'fill-red-500 text-red-500'
                                        : ''
                                    }`}
                                  />
                                </button>
                              </div>
                              <div className="p-2">
                                <span className="font-bold text-[11px] block truncate">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-charcoal-400 block truncate">
                                  {item.locationCity || item.venueName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 5: EVENT PLANNING WIZARD */}
                  {activeScreen === 'plan-event' && (
                    <div className="flex-1 p-4 space-y-4 animate-fadeIn min-h-full flex flex-col justify-between">
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                          <button
                            onClick={() => {
                              if (plannerStep > 1) setPlannerStep((prev) => prev - 1);
                              else setActiveScreen('home');
                            }}
                            className="p-1 rounded-lg hover:bg-cream-200 text-charcoal-600"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <span className="font-editorial text-sm font-bold text-charcoal-900">
                            Milestone Event Intake
                          </span>
                          <span className="text-[10px] font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full">
                            Step {plannerStep} of 5
                          </span>
                        </div>

                        {/* STEP 1: Occasion, Date, Guests & Venue */}
                        {plannerStep === 1 && (
                          <div className="space-y-3 pt-2 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block">
                                Step 1 • Celebration Essentials
                              </span>
                              <h4 className="font-editorial text-base font-bold text-charcoal-900">
                                What is your milestone celebration?
                              </h4>
                            </div>

                            {/* Occasion Type Pills */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Occasion Type
                              </label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {EVENT_TYPES_LIST.map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setPlannerData({ ...plannerData, type: t })}
                                    className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center border transition-all ${
                                      plannerData.type === t
                                        ? 'bg-burgundy-900 text-cream-50 border-burgundy-900 shadow-xs'
                                        : 'bg-white border-cream-200 text-charcoal-700 hover:border-gold-400'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Event Date */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Event Date
                              </label>
                              <input
                                type="date"
                                value={plannerData.date}
                                onChange={(e) => setPlannerData({ ...plannerData, date: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>

                            {/* Guest Count Pills */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Estimated Guests
                              </label>
                              <div className="grid grid-cols-5 gap-1">
                                {GUEST_COUNTS_LIST.map((g) => (
                                  <button
                                    key={g}
                                    type="button"
                                    onClick={() => setPlannerData({ ...plannerData, guests: g.replace('+', '') })}
                                    className={`py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                      plannerData.guests === g.replace('+', '')
                                        ? 'bg-burgundy-900 text-cream-50 border-burgundy-900'
                                        : 'bg-white border-cream-200 text-charcoal-700'
                                    }`}
                                  >
                                    {g}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Venue Type Pills */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Venue Type
                              </label>
                              <div className="grid grid-cols-3 gap-1.5">
                                {VENUE_TYPES_LIST.map((vt) => (
                                  <button
                                    key={vt}
                                    type="button"
                                    onClick={() => setPlannerData({ ...plannerData, venueType: vt })}
                                    className={`py-1.5 rounded-xl text-[10px] font-semibold border transition-all ${
                                      plannerData.venueType === vt
                                        ? 'bg-gold-500 text-burgundy-950 border-gold-500 font-bold'
                                        : 'bg-white border-cream-200 text-charcoal-600'
                                    }`}
                                  >
                                    {vt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Destination City & Venue Name */}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-charcoal-700 mb-1">
                                  City
                                </label>
                                <select
                                  value={plannerData.city}
                                  onChange={(e) => setPlannerData({ ...plannerData, city: e.target.value })}
                                  className="w-full px-2 py-2 rounded-xl bg-white border border-cream-300 text-xs outline-none"
                                >
                                  <option>Addis Ababa</option>
                                  <option>Hawassa</option>
                                  <option>Bishoftu</option>
                                  <option>Adama</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-charcoal-700 mb-1">
                                  Venue Name
                                </label>
                                <input
                                  type="text"
                                  value={plannerData.venue}
                                  onChange={(e) => setPlannerData({ ...plannerData, venue: e.target.value })}
                                  placeholder="e.g. Sheraton Addis"
                                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-cream-300 text-xs outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* STEP 2: Style & Color Palette */}
                        {plannerStep === 2 && (
                          <div className="space-y-3 pt-2 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block">
                                Step 2 • Visual Aesthetic
                              </span>
                              <h4 className="font-editorial text-base font-bold text-charcoal-900">
                                Style & Curated Palette
                              </h4>
                            </div>

                            {/* Aesthetic Style Pills */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Aesthetic Style
                              </label>
                              <div className="flex flex-wrap gap-1.5">
                                {STYLE_OPTIONS_LIST.map((style) => (
                                  <button
                                    key={style}
                                    type="button"
                                    onClick={() => setPlannerData({ ...plannerData, style })}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                                      plannerData.style === style
                                        ? 'bg-burgundy-900 text-cream-50 border-burgundy-900 shadow-xs'
                                        : 'bg-white border-cream-200 text-charcoal-700'
                                    }`}
                                  >
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Color Themes with Circular Palette Swatches */}
                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Harmonious Color Palette
                              </label>
                              <div className="space-y-2">
                                {COLOR_THEMES_LIST.map((theme) => {
                                  const isSelected = plannerData.selectedTheme === theme.name;
                                  return (
                                    <div
                                      key={theme.name}
                                      onClick={() =>
                                        setPlannerData({ ...plannerData, selectedTheme: theme.name })
                                      }
                                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                        isSelected
                                          ? 'bg-burgundy-50 border-burgundy-900 shadow-xs'
                                          : 'bg-white border-cream-200 hover:border-gold-300'
                                      }`}
                                    >
                                      <div>
                                        <span className="font-bold text-[11px] text-charcoal-900 block">
                                          {theme.name}
                                        </span>
                                      </div>
                                      {/* 3 Circular Palette Swatches */}
                                      <div className="flex items-center gap-1.5">
                                        {theme.colors.map((c, i) => (
                                          <span
                                            key={i}
                                            className="w-4 h-4 rounded-full border border-black/15 shadow-xs inline-block"
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

                        {/* STEP 3: Decor Services Checklist */}
                        {plannerStep === 3 && (
                          <div className="space-y-3 pt-2 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block">
                                Step 3 • Custom Production
                              </span>
                              <h4 className="font-editorial text-base font-bold text-charcoal-900">
                                Select Decor Services Needed
                              </h4>
                            </div>

                            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                              {AVAILABLE_SERVICES_LIST.map((srv) => {
                                const isChecked = plannerData.selectedServices.includes(srv.id);
                                return (
                                  <div
                                    key={srv.id}
                                    onClick={() => {
                                      const updated = isChecked
                                        ? plannerData.selectedServices.filter((s) => s !== srv.id)
                                        : [...plannerData.selectedServices, srv.id];
                                      setPlannerData({ ...plannerData, selectedServices: updated });
                                    }}
                                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-burgundy-50 border-burgundy-800'
                                        : 'bg-white border-cream-200'
                                    }`}
                                  >
                                    <div
                                      className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                                        isChecked
                                          ? 'bg-burgundy-900 border-burgundy-900 text-white'
                                          : 'border-cream-300 bg-white'
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className="font-bold text-[11px] text-charcoal-900 block truncate">
                                        {srv.label}
                                      </span>
                                      <span className="text-[9px] text-charcoal-500 block truncate">
                                        {srv.desc}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-bold text-gold-800 bg-gold-50 px-1.5 py-0.5 rounded shrink-0">
                                      +ETB {srv.price.toLocaleString()}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* STEP 4: Budget & Instant Estimate */}
                        {plannerStep === 4 && (
                          <div className="space-y-3 pt-2 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block">
                                Step 4 • Investment Scope
                              </span>
                              <h4 className="font-editorial text-base font-bold text-charcoal-900">
                                Budget Range & Live Estimate
                              </h4>
                            </div>

                            {/* Budget Range Selector */}
                            <div className="space-y-1.5">
                              {BUDGET_RANGES_LIST.map((b) => (
                                <button
                                  key={b}
                                  type="button"
                                  onClick={() => setPlannerData({ ...plannerData, budget: b })}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                                    plannerData.budget === b
                                      ? 'bg-burgundy-900 text-cream-50 border-burgundy-900 shadow-xs'
                                      : 'bg-white border-cream-200 text-charcoal-700 hover:border-gold-300'
                                  }`}
                                >
                                  {b}
                                </button>
                              ))}
                            </div>

                            {/* Instant Live Estimate Card */}
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cream-100 to-cream-200/90 border border-gold-400/50 space-y-2 shadow-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-600">
                                  Estimated Live Investment:
                                </span>
                                <span className="text-[9px] font-bold text-botanical-800 bg-botanical-100 px-2 py-0.5 rounded-full">
                                  {plannerData.selectedServices.length} Services Selected
                                </span>
                              </div>
                              <div className="font-mono font-bold text-lg text-burgundy-900">
                                ETB {calculateEstimatedCost().toLocaleString()}
                              </div>
                              <p className="text-[10px] text-charcoal-600 leading-tight">
                                Includes complete venue styling, carpentry, fresh botanical imports, logistics & on-site styling crew.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* STEP 5: Client Information & Special Notes */}
                        {plannerStep === 5 && (
                          <div className="space-y-3 pt-2 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-700 block">
                                Step 5 • Confirmation & Direct Save
                              </span>
                              <h4 className="font-editorial text-base font-bold text-charcoal-900">
                                Client Details & Special Wishes
                              </h4>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Full Name
                              </label>
                              <input
                                type="text"
                                value={plannerData.name}
                                onChange={(e) => setPlannerData({ ...plannerData, name: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Ethiopian Phone Number
                              </label>
                              <input
                                type="tel"
                                value={plannerData.phone}
                                onChange={(e) => setPlannerData({ ...plannerData, phone: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={plannerData.email}
                                onChange={(e) => setPlannerData({ ...plannerData, email: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-charcoal-700 mb-1">
                                Special Design Wishes / Vision Notes
                              </label>
                              <textarea
                                rows={2}
                                value={plannerData.notes}
                                onChange={(e) => setPlannerData({ ...plannerData, notes: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl bg-white border border-cream-300 text-xs focus:ring-1 focus:ring-gold-500 outline-none resize-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Navigation buttons */}
                      <div className="pt-3 border-t border-cream-200 flex gap-2">
                        {plannerStep > 1 && (
                          <button
                            onClick={() => setPlannerStep((prev) => prev - 1)}
                            className="px-4 py-2.5 rounded-xl border border-cream-300 text-charcoal-700 text-xs font-semibold hover:bg-cream-100"
                          >
                            Back
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (plannerStep < 5) setPlannerStep((prev) => prev + 1);
                            else handlePlannerSubmit();
                          }}
                          disabled={plannerSubmitting}
                          className="flex-1 py-2.5 rounded-xl bg-burgundy-900 text-cream-50 font-bold text-xs uppercase tracking-wider hover:bg-burgundy-800 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          {plannerSubmitting ? (
                            <span>Saving Request to Database...</span>
                          ) : plannerStep === 5 ? (
                            <span>Submit Request & Save to Database</span>
                          ) : (
                            <>
                              <span>Continue</span>
                              <ChevronRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 6: EVENT PROCESSING & TIMELINE */}
                  {activeScreen === 'event-processing' && (
                    <div className="space-y-4 animate-fadeIn p-4">
                      {/* Top navigation */}
                      <div className="flex items-center justify-between py-1 border-b border-cream-200">
                        <button
                          onClick={() => setActiveScreen('home')}
                          className="p-1 rounded-full hover:bg-cream-200 text-charcoal-800"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <span className="font-editorial text-sm font-bold text-charcoal-900">
                          Production Timeline & Processing
                        </span>
                        <button
                          onClick={() => alert('Sharing event blueprint link...')}
                          className="p-1 text-charcoal-600"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Photo Header */}
                      <div className="rounded-2xl overflow-hidden aspect-[16/9] relative shadow-sm">
                        <img
                          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80"
                          alt="Wedding"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gold-300">
                            Confirmed Booking
                          </span>
                          <h4 className="font-editorial text-sm font-bold">
                            Skyline Event Hall, Hawassa
                          </h4>
                          <span className="text-[10px] text-cream-200">
                            Dec 18, 2026 • 350 Guests
                          </span>
                        </div>
                      </div>

                      {/* Subtabs */}
                      <div className="flex border-b border-cream-200 text-[11px] font-semibold text-charcoal-500">
                        <button
                          onClick={() => setDetailTab('progress')}
                          className={`flex-1 pb-2 border-b-2 ${
                            detailTab === 'progress'
                              ? 'border-burgundy-900 text-burgundy-900 font-bold'
                              : 'border-transparent'
                          }`}
                        >
                          Timeline
                        </button>
                        <button
                          onClick={() => setDetailTab('quote')}
                          className={`flex-1 pb-2 border-b-2 ${
                            detailTab === 'quote'
                              ? 'border-burgundy-900 text-burgundy-900 font-bold'
                              : 'border-transparent'
                          }`}
                        >
                          Quotation
                        </button>
                        <button
                          onClick={() => setDetailTab('payments')}
                          className={`flex-1 pb-2 border-b-2 ${
                            detailTab === 'payments'
                              ? 'border-burgundy-900 text-burgundy-900 font-bold'
                              : 'border-transparent'
                          }`}
                        >
                          Payments
                        </button>
                      </div>

                      {/* SUBTAB 1: PROGRESS TIMELINE */}
                      {detailTab === 'progress' && (
                        <div className="bg-white rounded-2xl p-4 border border-cream-200 space-y-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-charcoal-900">
                              Production Timeline
                            </span>
                            <span className="text-[10px] font-bold text-burgundy-900 bg-burgundy-50 px-2 py-0.5 rounded-full">
                              80% Complete
                            </span>
                          </div>

                          {[
                            { name: 'Consultation & Venue Walkthrough', done: true, date: 'Oct 01' },
                            { name: 'Initial Design & 3D Moodboard', done: true, date: 'Oct 04' },
                            { name: 'Quotation Approved', done: true, date: 'Oct 05' },
                            { name: '50% Deposit Received', done: depositPaid || true, date: 'Oct 05' },
                            { name: 'Final Stage & Floral Blueprint', current: true, date: 'Nov 15' },
                            { name: 'Flower Conditioning & Carpentry', done: false, date: 'Dec 16' },
                            { name: 'On-Site Setup (12h prior)', done: false, date: 'Dec 17' },
                            { name: 'Celebration Day (Flawless Execution)', done: false, date: 'Dec 18' },
                          ].map((step, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-cream-100 last:border-none">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                                    step.done
                                      ? 'bg-botanical-600 text-white'
                                      : step.current
                                      ? 'bg-burgundy-900 text-gold-300 font-bold ring-2 ring-gold-400'
                                      : 'bg-cream-200 text-charcoal-400'
                                  }`}
                                >
                                  {step.done ? '✓' : idx + 1}
                                </div>
                                <span
                                  className={
                                    step.current
                                      ? 'font-bold text-burgundy-900 text-[11px]'
                                      : step.done
                                      ? 'text-charcoal-800 text-[11px]'
                                      : 'text-charcoal-400 text-[11px]'
                                  }
                                >
                                  {step.name}
                                </span>
                              </div>
                              <span className="text-[10px] text-charcoal-400">{step.date}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SUBTAB 2: QUOTE & PAYMENT */}
                      {detailTab === 'quote' && (
                        <div className="bg-white rounded-2xl p-4 border border-cream-200 space-y-3 text-xs">
                          <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                            <div>
                              <span className="font-mono text-[10px] text-charcoal-400 block font-bold">
                                MD-QT-2026-108
                              </span>
                              <span className="font-bold text-charcoal-900">Official Proposal</span>
                            </div>
                            <span className="text-[10px] font-bold text-botanical-800 bg-botanical-50 px-2 py-0.5 rounded-full">
                              Accepted
                            </span>
                          </div>

                          <div className="space-y-1.5 divide-y divide-cream-100 text-[11px]">
                            <div className="flex justify-between pt-1">
                              <span>Decoration Package</span>
                              <span className="font-semibold">ETB 120,000</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span>10m Floral Arch Stage</span>
                              <span className="font-semibold">ETB 35,000</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span>Fresh Rose Centerpieces (25 tables)</span>
                              <span className="font-semibold">ETB 25,000</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span>Ambient & Mood Lighting</span>
                              <span className="font-semibold">ETB 15,000</span>
                            </div>
                            <div className="flex justify-between pt-1">
                              <span>Logistics & Setup to Hawassa</span>
                              <span className="font-semibold">ETB 10,000</span>
                            </div>
                          </div>

                          {quoteDetails?.discountAmount ? (
                            <div className="flex justify-between pt-1 text-[11px] text-botanical-700 font-semibold border-t border-cream-100">
                              <span>Special Discount ({quoteDetails.discountType === 'PERCENT' ? `${quoteDetails.discountValue}%` : 'Applied'})</span>
                              <span>- ETB {Number(quoteDetails.discountAmount).toLocaleString()}</span>
                            </div>
                          ) : null}

                          <div className="pt-2 border-t-2 border-charcoal-900 flex justify-between font-bold text-xs text-burgundy-900">
                            <span>Total Investment:</span>
                            <span className="font-mono text-sm">
                              ETB {(quoteDetails?.totalAmount || 205000).toLocaleString()}
                            </span>
                          </div>

                          {!depositPaid && (
                            <button
                              onClick={() => setShowPaymentModal(true)}
                              className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-xs"
                            >
                              Authorize 50% Deposit (ETB 102,500)
                            </button>
                          )}
                        </div>
                      )}

                      {/* SUBTAB 3: PAYMENTS LEDGER */}
                      {detailTab === 'payments' && (
                        <div className="bg-white rounded-2xl p-4 border border-cream-200 space-y-3 text-xs">
                          <span className="font-bold text-charcoal-900 block">Payment Ledger</span>
                          <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                            <div className="flex justify-between font-bold">
                              <span>50% Required Deposit</span>
                              <span className="text-botanical-700">PAID ✓</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-charcoal-500">
                              <span>Reference: CHAPA-TX-782109</span>
                              <span className="font-mono font-bold">ETB 102,500</span>
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-cream-50 border border-cream-200 space-y-1">
                            <div className="flex justify-between font-bold">
                              <span>Final Balance Due</span>
                              <span className="text-amber-700">Due Dec 11, 2026</span>
                            </div>
                            <div className="flex justify-between text-[11px] text-charcoal-500">
                              <span>Payable via Telebirr or CBE</span>
                              <span className="font-mono font-bold">ETB 102,500</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCREEN 7: INSPIRATIONS */}
                  {activeScreen === 'inspiration' && (
                    <div className="space-y-3 animate-fadeIn p-4">
                      <div className="flex items-center justify-between py-1">
                        <span className="font-editorial text-base font-bold text-charcoal-900">
                          Inspiration Board
                        </span>
                        <span className="text-[10px] text-charcoal-500 font-medium">
                          {savedFavorites.length} Saved
                        </span>
                      </div>

                      {/* Filter pills */}
                      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                        {['All', 'Saved', 'Wedding', 'Melse', 'Graduation', 'Birthday', 'Engagement'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setInspirationFilter(f)}
                            className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold ${
                              inspirationFilter === f
                                ? 'bg-burgundy-900 text-cream-50'
                                : 'bg-white text-charcoal-700 border border-cream-200'
                            }`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-2 gap-2.5">
                        {filteredInspirations.map((proj) => (
                          <div
                            key={proj.id}
                            onClick={() => setSelectedProject(proj)}
                            className="bg-white rounded-xl overflow-hidden shadow-xs border border-cream-200 cursor-pointer flex flex-col justify-between"
                          >
                            <div className="relative aspect-square">
                              <img
                                src={proj.heroImage}
                                alt={proj.title}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={(e) => toggleFavorite(proj.id, e)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 text-white"
                              >
                                <Heart
                                  className={`w-3.5 h-3.5 ${
                                    savedFavorites.includes(proj.id)
                                      ? 'fill-red-500 text-red-500'
                                      : ''
                                  }`}
                                />
                              </button>
                              <span className="absolute bottom-1.5 left-1.5 text-[8px] font-bold uppercase bg-burgundy-950/80 text-gold-300 px-1.5 py-0.5 rounded">
                                {proj.eventType}
                              </span>
                            </div>
                            <div className="p-2">
                              <h4 className="font-bold text-[11px] truncate">{proj.title}</h4>
                              <p className="text-[9px] text-charcoal-400 truncate">{proj.locationCity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SCREEN 8: CELEBRATIONS (BOOKINGS & REQUESTS) */}
                  {activeScreen === 'events' && (
                    <div className="space-y-3 animate-fadeIn p-4">
                      <div className="flex items-center justify-between py-1">
                        <span className="font-editorial text-base font-bold text-charcoal-900">
                          My Celebrations
                        </span>
                        <button
                          onClick={() => setActiveScreen('plan-event')}
                          className="text-[10px] font-bold text-burgundy-900 bg-burgundy-50 px-2.5 py-1 rounded-full hover:bg-burgundy-100"
                        >
                          + New
                        </button>
                      </div>

                      {/* Segmented Control */}
                      <div className="grid grid-cols-2 gap-1 bg-cream-100 p-1 rounded-xl border border-cream-200 text-[10px] font-bold">
                        <button
                          onClick={() => setEventsSubTab('bookings')}
                          className={`py-1.5 rounded-lg transition-colors ${
                            eventsSubTab === 'bookings'
                              ? 'bg-burgundy-900 text-cream-50 shadow-xs'
                              : 'text-charcoal-600 hover:text-charcoal-900'
                          }`}
                        >
                          Bookings ({bookings.length})
                        </button>
                        <button
                          onClick={() => setEventsSubTab('requests')}
                          className={`py-1.5 rounded-lg transition-colors ${
                            eventsSubTab === 'requests'
                              ? 'bg-burgundy-900 text-cream-50 shadow-xs'
                              : 'text-charcoal-600 hover:text-charcoal-900'
                          }`}
                        >
                          Requests ({eventRequests.length})
                        </button>
                      </div>

                      {/* SUBTAB 1: CONFIRMED BOOKINGS */}
                      {eventsSubTab === 'bookings' && (
                        <div className="space-y-2.5">
                          {bookings.map((b) => (
                            <div
                              key={b.id || b.bookingNumber}
                              onClick={() => setActiveScreen('event-processing')}
                              className="bg-white rounded-2xl p-3 border border-cream-200 shadow-xs cursor-pointer flex flex-col gap-2 hover:border-gold-400 transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=200&q=80"
                                  alt="Wedding"
                                  className="w-14 h-14 rounded-xl object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-xs text-charcoal-900 truncate">
                                      {b.eventTitle || b.customerName + '’s Wedding' || "Sara's Wedding"}
                                    </span>
                                    <span className="text-[9px] font-bold text-botanical-800 bg-botanical-50 px-2 py-0.5 rounded-full shrink-0">
                                      CONFIRMED
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-charcoal-500 block truncate mt-0.5">
                                    {b.eventDate || 'Dec 18, 2026'} • {b.venueName || 'Skyline Hall Hawassa'}
                                  </span>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex-1 h-1.5 bg-cream-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-gold-500 rounded-full"
                                        style={{ width: `${b.progress || 80}%` }}
                                      />
                                    </div>
                                    <span className="text-[9px] font-bold text-burgundy-900">
                                      {b.progress || 80}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-cream-100 flex items-center justify-between text-[10px]">
                                <span className="text-botanical-700 font-bold flex items-center gap-1">
                                  ✓ 50% Deposit Paid (ETB {(b.depositAmount || 102500).toLocaleString()})
                                </span>
                                <span className="text-burgundy-900 font-bold flex items-center">
                                  Timeline <ChevronRight className="w-3 h-3" />
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SUBTAB 2: PENDING EVENT REQUESTS */}
                      {eventsSubTab === 'requests' && (
                        <div className="space-y-2.5">
                          {eventRequests.map((r) => (
                            <div
                              key={r.id || r.referenceNumber}
                              className="bg-white rounded-2xl p-3 border border-cream-200 shadow-xs flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono text-[9px] font-bold text-charcoal-400">
                                  {r.referenceNumber || r.id}
                                </span>
                                <span className="text-[9px] font-bold text-gold-800 bg-gold-50 border border-gold-200 px-2 py-0.5 rounded-full">
                                  {r.status || 'CONSULTATION'}
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-xs text-charcoal-900">
                                  {r.guestName}&apos;s {r.eventType || 'Event'}
                                </h4>
                                <p className="text-[10px] text-charcoal-500 mt-0.5">
                                  {r.eventDate} • {r.venueName || 'Premier Venue'} ({r.guestCount} guests)
                                </p>
                              </div>

                              <div className="pt-2 border-t border-cream-100 flex items-center gap-2">
                                <button
                                  onClick={() => setActiveScreen('messages')}
                                  className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold bg-cream-100 text-charcoal-700 hover:bg-cream-200 transition-colors"
                                >
                                  Chat with Stylist
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveScreen('event-processing');
                                    setDetailTab('quote');
                                  }}
                                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors"
                                >
                                  Review & Pay 50%
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SCREEN 9: CONCIERGE CHAT */}
                  {activeScreen === 'messages' && (
                    <div className="flex-1 flex flex-col justify-between p-4 animate-fadeIn min-h-full">
                      {/* Chat Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                        <div>
                          <span className="font-editorial text-sm font-bold text-charcoal-900 block">
                            Mekdi Concierge
                          </span>
                          <span className="text-[10px] text-botanical-700 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-botanical-500" />
                            Mekdes Tadesse is active
                          </span>
                        </div>
                        <button
                          onClick={() => alert('Calling Mekdi Decor Concierge: +251 911 234 567')}
                          className="p-1.5 rounded-full bg-cream-100 text-charcoal-700 hover:bg-cream-200"
                        >
                          <Phone className="w-3.5 h-3.5 text-gold-700" />
                        </button>
                      </div>

                      {/* Chat Messages */}
                      <div className="space-y-2.5 my-3 flex-1 overflow-y-auto no-scrollbar">
                        {messages.map((m) => (
                          <div
                            key={m.id}
                            className={`flex flex-col max-w-[85%] ${
                              m.isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                            }`}
                          >
                            <span className="text-[9px] text-charcoal-400 mb-0.5">{m.sender}</span>
                            <div
                              className={`p-2.5 rounded-2xl text-xs ${
                                m.isMe
                                  ? 'bg-burgundy-900 text-cream-50 rounded-br-none'
                                  : 'bg-white border border-cream-200 text-charcoal-900 rounded-bl-none shadow-xs'
                              }`}
                            >
                              <p className="leading-relaxed">{m.text}</p>
                              {m.quoteRef && (
                                <button
                                  onClick={() => {
                                    setActiveScreen('event-processing');
                                    setDetailTab('quote');
                                  }}
                                  className="mt-2 text-[10px] font-bold text-gold-700 underline block"
                                >
                                  View Proposal {m.quoteRef} →
                                </button>
                              )}
                            </div>
                            <span className="text-[8px] text-charcoal-400 mt-0.5">{m.time}</span>
                          </div>
                        ))}
                      </div>

                      {/* Chat Input */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-cream-200">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Message Mekdes..."
                          className="flex-1 px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl bg-burgundy-900 text-gold-400 hover:bg-burgundy-800 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  )}

                  {/* SCREEN 10: VIP PROFILE */}
                  {activeScreen === 'profile' && (
                    <div className="space-y-4 animate-fadeIn p-4">
                      <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                        <span className="font-editorial text-base font-bold text-charcoal-900">
                          Client Profile & VIP Status
                        </span>
                        <button
                          onClick={() => setActiveScreen('home')}
                          className="text-xs font-semibold text-charcoal-500 hover:text-charcoal-900"
                        >
                          Done
                        </button>
                      </div>

                      {/* VIP Card */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-charcoal-950 via-burgundy-950 to-charcoal-900 text-white shadow-md border border-gold-400/40 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] uppercase tracking-widest text-gold-400 font-bold">
                            VIP Diamond Member
                          </span>
                          <Sparkles className="w-4 h-4 text-gold-400" />
                        </div>
                        <div>
                          <h4 className="font-editorial text-lg font-bold text-cream-50">
                            {customerProfile?.fullName || 'Sara Tekle'}
                          </h4>
                          <p className="text-[10px] text-cream-300/70">
                            {customerProfile?.email || 'sara.t@example.com'} • {customerProfile?.phone || '+251 922 334 455'}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between text-[10px]">
                          <div>
                            <span className="text-cream-400 block">Total Investment</span>
                            <span className="font-mono font-bold text-gold-300">ETB 205,000</span>
                          </div>
                          <div className="text-right">
                            <span className="text-cream-400 block">Celebrations</span>
                            <span className="font-bold text-cream-100">1 Confirmed</span>
                          </div>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="bg-white rounded-2xl border border-cream-200 divide-y divide-cream-100 text-xs">
                        <button
                          onClick={() => setActiveScreen('events')}
                          className="w-full p-3 flex justify-between items-center hover:bg-cream-50"
                        >
                          <span>My Bookings & Invoices</span>
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        </button>
                        <button
                          onClick={() => setActiveScreen('inspiration')}
                          className="w-full p-3 flex justify-between items-center hover:bg-cream-50"
                        >
                          <span>Saved Moodboards ({savedFavorites.length})</span>
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        </button>
                        <button
                          onClick={() => alert('Call Mekdi Concierge: +251 911 234 567')}
                          className="w-full p-3 flex justify-between items-center hover:bg-cream-50"
                        >
                          <span>Direct Atelier Concierge Line</span>
                          <ChevronRight className="w-4 h-4 text-charcoal-400" />
                        </button>
                        <button
                          onClick={() => setActiveScreen('auth')}
                          className="w-full p-3 flex justify-between items-center text-red-600 hover:bg-red-50 font-semibold"
                        >
                          <span>Sign Out</span>
                          <LogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Bar (Hidden on Splash, Onboarding & Auth) */}
                {activeScreen !== 'splash' &&
                  activeScreen !== 'onboarding' &&
                  activeScreen !== 'auth' && (
                    <div className="bg-white border-t border-cream-200 px-4 py-2.5 flex justify-between items-center text-charcoal-600">
                      <button
                        onClick={() => setActiveScreen('home')}
                        className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold ${
                          activeScreen === 'home' ? 'text-burgundy-900 font-bold' : 'text-charcoal-400'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        <span>Home</span>
                      </button>

                      <button
                        onClick={() => setActiveScreen('inspiration')}
                        className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold ${
                          activeScreen === 'inspiration' ? 'text-burgundy-900 font-bold' : 'text-charcoal-400'
                        }`}
                      >
                        <Compass className="w-4 h-4" />
                        <span>Explore</span>
                      </button>

                      {/* Central Plan Event Button */}
                      <button
                        onClick={() => setActiveScreen('plan-event')}
                        className="w-10 h-10 rounded-full bg-burgundy-900 text-gold-400 flex items-center justify-center -mt-4 shadow-lg hover:bg-burgundy-800 transition-transform active:scale-95"
                        title="Plan New Event"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setActiveScreen('events')}
                        className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold ${
                          activeScreen === 'events' ? 'text-burgundy-900 font-bold' : 'text-charcoal-400'
                        }`}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Events</span>
                      </button>

                      <button
                        onClick={() => setActiveScreen('messages')}
                        className={`flex flex-col items-center gap-0.5 text-[9px] font-semibold ${
                          activeScreen === 'messages' ? 'text-burgundy-900 font-bold' : 'text-charcoal-400'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Chat</span>
                      </button>
                    </div>
                  )}

                {/* iPhone Home Indicator Bar */}
                <div className="w-full flex justify-center pb-2 pt-1 bg-white">
                  <div className="w-28 h-1 bg-charcoal-300 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-cream-200 shadow-2xl relative">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] uppercase font-bold text-gold-700 block">
              Ethiopian Payment Gateway
            </span>
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-1">
              Pay 50% Deposit
            </h3>
            <p className="text-xs text-charcoal-600 mb-4">
              Amount Due: <strong className="text-burgundy-900 font-mono text-sm">ETB 102,500</strong>
            </p>

            <div className="grid grid-cols-3 gap-1.5 mb-4">
              <button
                onClick={() => setSelectedProvider('CHAPA')}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border ${
                  selectedProvider === 'CHAPA'
                    ? 'bg-burgundy-50 border-burgundy-800 text-burgundy-900'
                    : 'bg-white border-cream-300'
                }`}
              >
                Chapa / Card
              </button>
              <button
                onClick={() => setSelectedProvider('TELEBIRR')}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border ${
                  selectedProvider === 'TELEBIRR'
                    ? 'bg-burgundy-50 border-burgundy-800 text-burgundy-900'
                    : 'bg-white border-cream-300'
                }`}
              >
                Telebirr
              </button>
              <button
                onClick={() => setSelectedProvider('CBE_BIRR')}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold border ${
                  selectedProvider === 'CBE_BIRR'
                    ? 'bg-burgundy-50 border-burgundy-800 text-burgundy-900'
                    : 'bg-white border-cream-300'
                }`}
              >
                CBE Birr
              </button>
            </div>

            <button
              onClick={handlePayDeposit}
              disabled={isPaying}
              className="w-full py-3 rounded-full text-xs font-bold uppercase bg-gold-500 text-burgundy-950 shadow-gold hover:bg-gold-400"
            >
              {isPaying ? 'Authorizing Gateway...' : 'Pay ETB 102,500 Now'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Inspiration Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gold-400 shadow-2xl relative space-y-3">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-2xl overflow-hidden aspect-video">
              <img
                src={selectedProject.heroImage}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-gold-700">
                {selectedProject.eventType} • {selectedProject.locationCity}
              </span>
              <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                {selectedProject.title}
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 font-light leading-relaxed">
                {selectedProject.description}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toggleFavorite(selectedProject.id);
                  alert(savedFavorites.includes(selectedProject.id) ? 'Removed from saved' : 'Saved to Inspiration Board!');
                }}
                className="flex-1 py-2.5 rounded-full text-xs font-semibold bg-cream-200 text-charcoal-800"
              >
                {savedFavorites.includes(selectedProject.id) ? '♥ Saved' : '♡ Save to Board'}
              </button>

              <button
                onClick={() => {
                  setSelectedProject(null);
                  setActiveScreen('plan-event');
                  setPlannerData((prev) => ({
                    ...prev,
                    type: selectedProject.eventType,
                    style: selectedProject.decorationStyle || selectedProject.title,
                  }));
                }}
                className="flex-1 py-2.5 rounded-full text-xs font-bold uppercase bg-burgundy-900 text-cream-50"
              >
                I Want This Style →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
