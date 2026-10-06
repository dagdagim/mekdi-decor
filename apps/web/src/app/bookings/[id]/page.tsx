'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import {
  Calendar,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Send,
  Phone,
  FileText,
  Download,
  AlertCircle,
  X,
  ChevronLeft,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingDetailPageProps {
  params: { id: string };
}

export default function BookingDetailPage({ params }: BookingDetailPageProps) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'DEPOSIT' | 'BALANCE'>('DEPOSIT');
  const [selectedProvider, setSelectedProvider] = useState<'CHAPA' | 'TELEBIRR' | 'CBE_BIRR'>('CHAPA');
  const [customerPhone, setCustomerPhone] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [lastPaymentRef, setLastPaymentRef] = useState<string | null>(null);

  useEffect(() => {
    fetchBooking();
  }, [params.id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bookings/${encodeURIComponent(params.id)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setBooking(data.data);
        setCustomerPhone(data.data.customerPhone || '');
      } else {
        setError(data.error || 'Booking not found');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading booking');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPay = (type: 'DEPOSIT' | 'BALANCE') => {
    setPaymentType(type);
    setShowPaymentModal(true);
    setPaymentSuccess(false);
  };

  const handleExecutePayment = async () => {
    if (!booking) return;

    try {
      setProcessingPayment(true);
      const amountToPay =
        paymentType === 'DEPOSIT' ? booking.depositAmount : booking.balanceAmount;

      const res = await fetch(`/api/bookings/${booking.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType,
          provider: selectedProvider,
          amount: amountToPay,
          phone: customerPhone,
          origin: window.location.origin,
          returnUrl: `${window.location.origin}/payments/callback?bookingId=${encodeURIComponent(booking.id)}&type=${paymentType}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (selectedProvider === 'CHAPA' && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }

        setBooking(data.data);
        setLastPaymentRef(data.payment?.paymentReference || 'TX-CONFIRMED');
        setPaymentSuccess(true);

        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.5 },
            colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
          });
        } catch {}
      } else {
        alert(data.error || 'Payment failed. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment execution error');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50/50 flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-burgundy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-charcoal-700">Loading your celebration plan & booking...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-cream-50/50 py-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-cream-200 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-12 h-12 text-burgundy-900 mx-auto" />
          <h2 className="font-editorial text-2xl font-bold text-charcoal-900">Booking Not Found</h2>
          <p className="text-xs text-charcoal-500 font-light">{error || 'Could not locate the requested event booking.'}</p>
          <Link
            href="/bookings"
            className="inline-block px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors"
          >
            Return to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const depositDue = booking.depositAmount;
  const balanceDue = booking.balanceAmount;
  const isDepositPaid = booking.depositPaid;
  const isBalancePaid = booking.balancePaid;

  const milestoneSteps = [
    { title: 'Intake Consultation', desc: 'Requirements & venue specs reviewed', isDone: true },
    { title: 'Bespoke Proposal', desc: `Quotation approved for ${booking.eventTitle}`, isDone: true },
    {
      title: '50% Booking Deposit',
      desc: isDepositPaid ? 'Deposit confirmed; date secured in production calendar' : 'Pending 50% deposit authorization',
      isDone: isDepositPaid,
      isCurrent: !isDepositPaid,
    },
    {
      title: '3D Spatial Staging & Blueprints',
      desc: 'CAD floral architecture & lighting coordinate maps in atelier review',
      isDone: isDepositPaid,
      isCurrent: isDepositPaid && !isBalancePaid,
    },
    {
      title: 'Logistics & Flora Conditioning',
      desc: 'Fresh imported garden roses conditioned 48h prior to event',
      isDone: isBalancePaid,
    },
    {
      title: 'Event-Day Staging & Teardown',
      desc: 'Crew on-site 6:00 AM; post-celebration respectful teardown',
      isDone: false,
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-burgundy-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Bookings</span>
          </Link>

          <span className="font-mono text-xs font-bold text-burgundy-900 bg-burgundy-50 px-3 py-1 rounded-full border border-burgundy-200">
            {booking.bookingNumber}
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold-400/40 shadow-elevated relative overflow-hidden space-y-8">
          {/* Subtle Watermark Emblem in Background */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.03] pointer-events-none w-80 h-80">
            <Logo size="lg" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                  Reserved Production Plan
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isBalancePaid
                      ? 'bg-botanical-100 text-botanical-800 border-botanical-300'
                      : isDepositPaid
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-cream-100 text-charcoal-700 border-cream-300'
                  }`}
                >
                  {isBalancePaid ? '✓ Fully Confirmed' : isDepositPaid ? 'Deposit Secured' : 'Deposit Pending'}
                </span>
              </div>
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900">
                {booking.eventTitle}
              </h1>
              <p className="text-xs text-charcoal-500 font-light mt-1">
                Dedicated client: <strong className="font-semibold text-charcoal-800">{booking.customerName}</strong> ({booking.customerEmail})
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-charcoal-400 font-medium block">
                Total Celebration Plan
              </span>
              <span className="font-mono text-2xl font-bold text-burgundy-900">
                {formatCurrency(booking.totalAmount || 0, booking.currency || 'ETB')}
              </span>
            </div>
          </div>

          {/* Event Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs">
            <div>
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Date</span>
              <span className="font-bold text-charcoal-900 text-sm">{booking.eventDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Venue</span>
              <span className="font-semibold text-charcoal-900 truncate block text-sm" title={booking.venueName}>
                {booking.venueName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Guest Count</span>
              <span className="font-semibold text-charcoal-900 text-sm">{booking.guestCount} Guests</span>
            </div>
            <div>
              <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Aesthetic Theme</span>
              <span className="font-semibold text-burgundy-900 text-sm">{booking.decorationStyle}</span>
            </div>
          </div>

          {/* PAY THE PLAN / FINANCIAL MANAGEMENT CARD */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-cream-100/90 to-cream-50 border-2 border-gold-400 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-editorial text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gold-700" />
                  <span>Financial Plan & Payment Schedule</span>
                </h3>
                <p className="text-xs text-charcoal-600 font-light mt-0.5">
                  Authorize your 50% deposit to lock the production date or settle the final balance online.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-charcoal-500">Gateways:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-cream-300 text-blue-700">Telebirr</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-cream-300 text-emerald-700">Chapa</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-cream-300 text-purple-700">CBE Birr</span>
              </div>
            </div>

            {/* Split Deposit & Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 50% Deposit Box */}
              <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                    Stage 1: 50% Deposit
                  </span>
                  {isDepositPaid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-botanical-100 text-botanical-800 border border-botanical-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Confirmed & Paid
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      Payment Required
                    </span>
                  )}
                </div>

                <div className="font-mono text-2xl font-bold text-burgundy-900">
                  {formatCurrency(depositDue, booking.currency || 'ETB')}
                </div>

                <p className="text-[11px] text-charcoal-500 font-light leading-relaxed">
                  {isDepositPaid
                    ? '50% deposit received. Atelier design team is officially assigned to your celebration.'
                    : 'Required to hold date in production calendar and begin carpentry and floral sourcing.'}
                </p>

                {!isDepositPaid && (
                  <button
                    type="button"
                    onClick={() => handleOpenPay('DEPOSIT')}
                    className="w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gold-400" />
                    <span>Pay 50% Deposit Now</span>
                  </button>
                )}
              </div>

              {/* 50% Final Balance Box */}
              <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                    Stage 2: Final Balance
                  </span>
                  {isBalancePaid ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-botanical-100 text-botanical-800 border border-botanical-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Settled In Full
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cream-100 text-charcoal-600 border border-cream-200">
                      Due: {booking.balanceDueDate || '7 Days Prior'}
                    </span>
                  )}
                </div>

                <div className="font-mono text-2xl font-bold text-charcoal-900">
                  {formatCurrency(balanceDue, booking.currency || 'ETB')}
                </div>

                <p className="text-[11px] text-charcoal-500 font-light leading-relaxed">
                  {isBalancePaid
                    ? 'Final balance received in full. Logistics and staging team are cleared for on-site arrival.'
                    : 'Due 7 days prior to event date after reviewing final 3D blueprints and floral conditioning.'}
                </p>

                {isDepositPaid && !isBalancePaid && (
                  <button
                    type="button"
                    onClick={() => handleOpenPay('BALANCE')}
                    className="w-full py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-gold-400" />
                    <span>Pay Final Balance</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Milestone Status Timeline */}
          <div>
            <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-6">
              Production Journey & Staging Milestones
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-cream-300">
              {milestoneSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-6 w-4 h-4 rounded-full border-2 transition-all ${
                      step.isDone
                        ? 'bg-burgundy-900 border-gold-400'
                        : step.isCurrent
                        ? 'bg-gold-500 border-burgundy-900 animate-pulse'
                        : 'bg-white border-cream-300'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          step.isCurrent
                            ? 'text-burgundy-900'
                            : step.isDone
                            ? 'text-charcoal-900'
                            : 'text-charcoal-400'
                        }`}
                      >
                        {step.title}
                      </span>
                      {step.isCurrent && (
                        <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full">
                          Current Milestone
                        </span>
                      )}
                      {step.isDone && (
                        <span className="text-[10px] font-semibold text-botanical-700 flex items-center gap-0.5">
                          <Check className="w-3 h-3" />
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-0.5 font-light">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Line Items Scope */}
          {booking.items && booking.items.length > 0 && (
            <div className="pt-6 border-t border-cream-200">
              <h3 className="font-editorial text-lg font-bold text-charcoal-900 mb-4">
                Decoration Package Scope ({booking.items.length} Elements)
              </h3>

              <div className="divide-y divide-cream-100">
                {booking.items.map((it, idx) => (
                  <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div>
                      <span className="font-semibold text-charcoal-900 text-sm block">{it.itemTitle}</span>
                      {it.itemDescription && (
                        <span className="text-charcoal-500 text-[11px] font-light">{it.itemDescription}</span>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-charcoal-800 text-xs">
                      {formatCurrency(it.subtotal, booking.currency || 'ETB')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concierge & Support Footer */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-burgundy-900 text-gold-400 flex items-center justify-center font-editorial font-bold">
                M
              </div>
              <div>
                <span className="font-bold text-charcoal-900 block">Lead Designer: Mekdes Tadesse</span>
                <span className="text-charcoal-500 font-light text-[11px]">Direct Concierge Hotline: +251 967 698 460 / +251 900 454 238</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="tel:+251967698460"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:bg-cream-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-burgundy-900" />
                <span>Call Concierge</span>
              </a>

              <Link
                href={`/quotes/${booking.quoteId}`}
                target="_blank"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-700 hover:bg-cream-200 transition-colors inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-gold-600" />
                <span>View Full Contract</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT / PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 border-gold-400 shadow-2xl space-y-6">
            {!paymentSuccess ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-cream-200">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold-700 font-bold block">
                      Secure Checkout
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                      Pay {paymentType === 'DEPOSIT' ? '50% Deposit' : 'Remaining Balance'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-1.5 rounded-full text-charcoal-400 hover:text-charcoal-800 hover:bg-cream-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amount to pay highlight */}
                <div className="p-4 rounded-2xl bg-burgundy-950 text-cream-50 text-center space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold block">
                    Amount To Authorize
                  </span>
                  <div className="font-mono text-3xl font-bold text-white">
                    {formatCurrency(
                      paymentType === 'DEPOSIT' ? depositDue : balanceDue,
                      booking.currency || 'ETB'
                    )}
                  </div>
                  <span className="text-[10px] text-cream-200/70 block">
                    For {booking.eventTitle} ({booking.bookingNumber})
                  </span>
                </div>

                {/* Payment Gateway Selector */}
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-2 uppercase tracking-wider">
                    Select Ethiopian Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'CHAPA', name: 'Chapa', desc: 'Card / Banks' },
                      { id: 'TELEBIRR', name: 'Telebirr', desc: 'Instant USSD' },
                      { id: 'CBE_BIRR', name: 'CBE Birr', desc: 'Direct CBE' },
                    ].map((provider) => (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setSelectedProvider(provider.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          selectedProvider === provider.id
                            ? 'border-burgundy-900 bg-burgundy-50 ring-2 ring-gold-400/40'
                            : 'border-cream-200 hover:border-cream-300 bg-cream-50'
                        }`}
                      >
                        <span className="text-xs font-bold text-charcoal-900 block">{provider.name}</span>
                        <span className="text-[9px] text-charcoal-500 font-light block">{provider.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone verification */}
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Mobile Number (For Payment Prompt)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-cream-300 bg-cream-50 focus:outline-none focus:border-gold-400 font-mono"
                  />
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    An official payment receipt will be dispatched to {booking.customerEmail}.
                  </span>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={handleExecutePayment}
                    className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-gold-400" />
                    <span>
                      {processingPayment
                        ? 'Connecting Gateway...'
                        : `Authorize Payment (${selectedProvider})`}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              /* Success confirmation */
              <div className="text-center py-4 space-y-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-botanical-100 border-2 border-botanical-500 text-botanical-700 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
                    Payment Successful
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                    Plan Payment Confirmed!
                  </h3>
                  <p className="text-xs text-charcoal-600 font-light mt-1 max-w-xs mx-auto">
                    Your {paymentType === 'DEPOSIT' ? '50% deposit' : 'final balance'} has been verified. Official receipt was emailed to <strong>{booking.customerEmail}</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs font-mono text-charcoal-800">
                  Reference: <strong>{lastPaymentRef}</strong>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm"
                >
                  Return to Event Plan
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
