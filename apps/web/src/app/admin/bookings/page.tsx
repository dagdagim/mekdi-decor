'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { EventStatus } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

interface AdminBooking {
  id: string;
  code: string;
  client: string;
  type: string;
  date: string;
  venue: string;
  guests: number;
  status: EventStatus;
  progress: number;
  depositPaid: boolean;
  balancePaid?: boolean;
  total: number;
  quoteId?: string;
}

const DEFAULT_BOOKINGS: AdminBooking[] = [
  {
    id: 'b-001',
    code: 'MD-BK-2026-056',
    client: 'Sara Tekle',
    type: 'Wedding',
    date: 'Dec 18, 2026',
    venue: 'Skyline Event Hall, Hawassa',
    guests: 350,
    status: 'DESIGN_PHASE',
    progress: 80,
    depositPaid: true,
    total: 205000,
    quoteId: 'q-108',
  },
  {
    id: 'b-002',
    code: 'MD-BK-2026-057',
    client: 'Dr. Helen Girma',
    type: 'Graduation',
    date: 'Dec 21, 2026',
    venue: 'Sheraton Addis Ballroom',
    guests: 180,
    status: 'CONFIRMED',
    progress: 60,
    depositPaid: true,
    total: 145000,
  },
  {
    id: 'b-003',
    code: 'MD-BK-2026-058',
    client: 'Michael Kebede',
    type: 'Birthday',
    date: 'Dec 24, 2026',
    venue: 'Private Villa Compound',
    guests: 90,
    status: 'QUOTE_SENT',
    progress: 30,
    depositPaid: false,
    total: 85000,
  },
  {
    id: 'b-004',
    code: 'MD-BK-2026-059',
    client: 'Blen & Dawit',
    type: 'Engagement',
    date: 'Jan 09, 2027',
    venue: 'Kuriftu Resort, Bishoftu',
    guests: 120,
    status: 'CONSULTATION',
    progress: 20,
    depositPaid: false,
    total: 110000,
  },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>(DEFAULT_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking>(DEFAULT_BOOKINGS[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    fetchLiveBookings();
  }, []);

  const fetchLiveBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const mapped: AdminBooking[] = data.data.map((b: any) => ({
          id: b.id,
          code: b.bookingNumber,
          client: b.customerName || 'Valued Client',
          type: b.eventType || 'Event',
          date: b.eventDate || 'Dec 18, 2026',
          venue: b.venueName || 'Grand Hall',
          guests: b.guestCount || 200,
          status: b.status || (b.depositPaid ? 'DESIGN_PHASE' : 'DEPOSIT_PENDING'),
          progress: b.progress || (b.depositPaid ? 75 : 25),
          depositPaid: Boolean(b.depositPaid),
          balancePaid: Boolean(b.balancePaid),
          total: b.totalAmount || (b.depositAmount + b.balanceAmount),
          quoteId: b.quoteId,
        }));
        setBookings(mapped);
        setSelectedBooking(mapped[0]);
      }
    } catch (e) {
      console.warn('Fallback to local bookings:', e);
    }
  };

  const timelineSteps: { label: string; key: EventStatus; pct: number }[] = [
    { label: 'Consultation', key: 'CONSULTATION', pct: 15 },
    { label: 'Quote Sent', key: 'QUOTE_SENT', pct: 30 },
    { label: 'Deposit Secured', key: 'DEPOSIT_PENDING', pct: 50 },
    { label: 'Design & 3D Blueprints', key: 'DESIGN_PHASE', pct: 75 },
    { label: 'Production Preparation', key: 'PREPARATION', pct: 90 },
    { label: 'Event Day Staging', key: 'EVENT_DAY', pct: 98 },
    { label: 'Completed', key: 'COMPLETED', pct: 100 },
  ];

  const handleAdvanceMilestone = async () => {
    try {
      setAdvancing(true);
      const currentIdx = timelineSteps.findIndex(
        (s) => s.key === selectedBooking.status || selectedBooking.progress <= s.pct
      );
      const nextStep = timelineSteps[Math.min(timelineSteps.length - 1, (currentIdx >= 0 ? currentIdx + 1 : 3))];

      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStep.key,
          progress: nextStep.pct,
        }),
      });

      const updated = {
        ...selectedBooking,
        status: nextStep.key,
        progress: nextStep.pct,
      };

      setSelectedBooking(updated);
      setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
    } catch (e) {
      console.error(e);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Bookings & Production Lifecycle
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Monitor client celebration milestones from initial design sketches to final on-site teardown.
          </p>
        </div>

        <Link
          href="/bookings"
          target="_blank"
          className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors inline-flex items-center gap-1.5 self-start shadow-sm"
        >
          <ExternalLink className="w-4 h-4 text-gold-400" />
          <span>View Customer Bookings Portal</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bookings List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {bookings.map((bk) => {
            const isSelected = selectedBooking.id === bk.id;
            return (
              <div
                key={bk.id}
                onClick={() => setSelectedBooking(bk)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-burgundy-800 shadow-md ring-2 ring-gold-400/20'
                    : 'bg-white border-cream-200 hover:border-gold-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-charcoal-400 font-bold">
                    {bk.code}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      bk.depositPaid
                        ? 'text-botanical-800 bg-botanical-50 border border-botanical-200'
                        : 'text-amber-800 bg-amber-50 border border-amber-200'
                    }`}
                  >
                    {bk.depositPaid ? 'Deposit Verified' : 'Deposit Pending'}
                  </span>
                </div>

                <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                  {bk.client} — {bk.type}
                </h3>

                <p className="text-xs text-charcoal-600 mt-1">
                  {bk.date} • {bk.venue}
                </p>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[11px] font-semibold text-charcoal-500 mb-1">
                    <span>Milestone Progress</span>
                    <span className="text-burgundy-900 font-bold">{bk.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-burgundy-800 to-gold-500 rounded-full"
                      style={{ width: `${bk.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Booking Details & Milestone Timeline (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-3">
              <div>
                <span className="text-[10px] font-mono text-charcoal-400 font-bold block">
                  {selectedBooking.code}
                </span>
                <h2 className="font-editorial text-2xl font-bold text-charcoal-900">
                  {selectedBooking.client}&apos;s {selectedBooking.type}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1 ${
                    selectedBooking.depositPaid
                      ? 'text-botanical-800 bg-botanical-50 border-botanical-200'
                      : 'text-amber-800 bg-amber-50 border-amber-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedBooking.depositPaid ? 'Deposit Verified' : 'Awaiting Deposit'}</span>
                </span>
              </div>
            </div>

            {/* Event Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs">
              <div>
                <span className="text-charcoal-500 block text-[11px]">Event Date</span>
                <span className="font-semibold text-charcoal-900">{selectedBooking.date}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Venue</span>
                <span className="font-semibold text-charcoal-900 truncate block" title={selectedBooking.venue}>
                  {selectedBooking.venue}
                </span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Guests</span>
                <span className="font-semibold text-charcoal-900">{selectedBooking.guests} Attendees</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Total Plan</span>
                <span className="font-bold text-burgundy-900 font-mono">
                  {formatCurrency(selectedBooking.total, 'ETB')}
                </span>
              </div>
            </div>

            {/* Visual Lifecycle Milestone Timeline */}
            <div>
              <h3 className="font-editorial text-base font-bold text-charcoal-900 mb-6">
                Milestone Status Timeline
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
                {timelineSteps.map((step, idx) => {
                  const isDone = selectedBooking.progress >= step.pct;
                  const isCurrent = !isDone && (idx === 0 || selectedBooking.progress >= timelineSteps[idx - 1].pct);
                  return (
                    <div key={step.key} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 w-4 h-4 rounded-full border-2 transition-all ${
                          isDone
                            ? 'bg-burgundy-900 border-gold-400'
                            : isCurrent
                            ? 'bg-gold-500 border-burgundy-900 animate-pulse'
                            : 'bg-white border-cream-300'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isCurrent
                                ? 'text-burgundy-900'
                                : isDone
                                ? 'text-charcoal-900'
                                : 'text-charcoal-400'
                            }`}
                          >
                            {step.label}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full">
                              Active Phase ({selectedBooking.progress}%)
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[10px] text-botanical-700 font-semibold">✓ Completed</span>
                          )}
                        </div>
                        <p className="text-[11px] text-charcoal-500 mt-0.5 font-light">
                          {idx === 0 && 'Initial client consultation completed at Bole Studio.'}
                          {idx === 1 && 'Quote approved and scope finalized.'}
                          {idx === 2 && '50% deposit received via Telebirr / Chapa / CBE Birr.'}
                          {idx === 3 && 'Final floral blueprint and stage carpentry render in review.'}
                          {idx === 4 && 'Flower conditioning and fabric steaming starts 48h prior.'}
                          {idx === 5 && 'On-site installation team arrives at 6:00 AM.'}
                          {idx === 6 && 'Post-event teardown and client feedback review.'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-cream-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link
                  href={`/bookings/${selectedBooking.id}`}
                  target="_blank"
                  className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-gold-600" />
                  <span>Preview Customer Portal</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/bookings/${selectedBooking.id}`;
                    navigator.clipboard.writeText(url);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal-700 bg-white border border-cream-300 hover:bg-cream-50 transition-colors inline-flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-botanical-600" /> : <Copy className="w-3.5 h-3.5 text-charcoal-500" />}
                  <span>{copiedLink ? 'Copied URL!' : 'Copy Client Link'}</span>
                </button>
              </div>

              <button
                onClick={handleAdvanceMilestone}
                disabled={advancing}
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm disabled:opacity-50"
              >
                {advancing ? 'Updating...' : 'Advance to Next Milestone'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
