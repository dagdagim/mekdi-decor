'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_QUOTES } from '@/lib/data/mock-db';
import { Logo } from '@/components/ui/Logo';
import { formatCurrency } from '@/lib/utils';
import {
  Check,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  Download,
  CreditCard,
  Phone,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuotePageProps {
  params: { id: string };
}

export default function QuoteDetailPage({ params }: QuotePageProps) {
  const [quote, setQuote] = useState<any>(
    INITIAL_QUOTES.find((q) => q.id === params.id || q.quoteNumber === params.id) ||
    INITIAL_QUOTES[0]
  );
  const [quoteStatus, setQuoteStatus] = useState<string>(quote.status);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<'CHAPA' | 'TELEBIRR' | 'CBE_BIRR'>('CHAPA');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch(`/api/quotes/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setQuote(data.data);
          setQuoteStatus(data.data.status);
        }
      })
      .catch((e) => console.warn('Could not fetch quote by id:', e));
  }, [params.id]);

  const depositAmount = (quote.totalAmount * (quote.depositPercentage || 50)) / 100;

  const handleAcceptQuote = () => {
    setShowPaymentModal(true);
  };

  const handleProcessDeposit = async () => {
    setIsProcessingPayment(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: quote.id,
          bookingId: quote.quoteNumber || quote.id,
          customerId: quote.customerId || quote.customerEmail || 'c-001',
          customerName: quote.customerName || 'Sara Tekle',
          customerEmail: quote.customerEmail || 'mydeveloper444@gmail.com',
          customerPhone: quote.customerPhone || '0911234567',
          amount: depositAmount,
          currency: quote.currency || 'ETB',
          provider: selectedProvider,
          description: `50% Deposit for ${quote.eventTitle || 'Bespoke Celebration'}`,
          origin: window.location.origin,
          returnUrl: `${window.location.origin}/payments/callback?quoteId=${encodeURIComponent(quote.id)}`,
        }),
      });

      const data = await res.json();

      if (data.success && selectedProvider === 'CHAPA' && data.checkoutUrl) {
        // Direct redirect to hosted Chapa checkout
        window.location.href = data.checkoutUrl;
        return;
      }

      await fetch(`/api/quotes/${quote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      setPaymentSuccess(true);
      setQuoteStatus('ACCEPTED');

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
        });
      } catch {
        // Fallback
      }
    } catch (err) {
      console.error('Payment API call error:', err);
      alert('Could not initiate payment. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Official Quotation
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Your Quote
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-charcoal-600 font-light">
            Here&apos;s your personalized quotation based on your event details and venue consultation.
          </p>
        </div>

        {/* The Quotation Document Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-gold-400/40 shadow-elevated relative overflow-hidden mb-12">
          {/* Subtle Watermark Emblem in Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none w-96 h-96">
            <Logo size="lg" />
          </div>

          {/* Quotation Header with Brand & Document ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-8 border-b border-cream-300 gap-4">
            <Logo size="md" />

            <div className="text-left sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-charcoal-500 font-medium block">
                Quotation Number
              </span>
              <span className="font-mono text-sm font-bold text-burgundy-900 tracking-wide">
                {quote.quoteNumber}
              </span>
              <span className="text-[11px] text-charcoal-500 block mt-0.5">
                Valid until: {quote.validityDate}
              </span>
            </div>
          </div>

          {/* Event Context Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-cream-200 text-xs">
            <div>
              <span className="text-charcoal-500 block text-[11px]">Event Type</span>
              <span className="font-semibold text-charcoal-900 text-sm">{quote.eventType}</span>
            </div>
            <div>
              <span className="text-charcoal-500 block text-[11px]">Date</span>
              <span className="font-semibold text-charcoal-900 text-sm">{quote.eventDate}</span>
            </div>
            <div>
              <span className="text-charcoal-500 block text-[11px]">Guest Count</span>
              <span className="font-semibold text-charcoal-900 text-sm">{quote.guestCount} Guests</span>
            </div>
            <div>
              <span className="text-charcoal-500 block text-[11px]">Venue</span>
              <span className="font-semibold text-charcoal-900 text-sm truncate block" title={quote.venueName}>
                {quote.venueName}
              </span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-6">
            <h3 className="text-xs uppercase tracking-wider font-bold text-charcoal-700 mb-4">
              Itemized Decoration Breakdown
            </h3>

            <div className="divide-y divide-cream-200">
              {quote.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs"
                >
                  <div className="max-w-md">
                    <span className="font-semibold text-charcoal-900 text-sm">
                      {item.itemTitle}
                    </span>
                    {item.itemDescription && (
                      <p className="text-charcoal-500 text-[11px] mt-0.5">
                        {item.itemDescription}
                      </p>
                    )}
                  </div>
                  <div className="text-left sm:text-right font-medium text-charcoal-900 text-xs shrink-0">
                    {formatCurrency(item.subtotal, quote.currency)}
                  </div>
                </div>
              ))}

              {quote.transportCost > 0 && (
                <div className="py-3 flex items-center justify-between text-xs text-charcoal-700">
                  <span>Transport & Logistics (to {quote.venueName})</span>
                  <span>{formatCurrency(quote.transportCost, quote.currency)}</span>
                </div>
              )}
            </div>

            {/* Total Calculation */}
            <div className="mt-6 pt-4 border-t-2 border-charcoal-900 flex flex-col items-end">
              <div className="w-full sm:w-72 space-y-2 text-xs">
                <div className="flex justify-between text-charcoal-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
                </div>
                <div className="flex justify-between text-charcoal-600">
                  <span>Logistics & Crew:</span>
                  <span>{formatCurrency(quote.transportCost, quote.currency)}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold text-burgundy-900 pt-2 border-t border-cream-300">
                  <span>Total Investment:</span>
                  <span className="font-mono text-xl text-burgundy-900">
                    {formatCurrency(quote.totalAmount, quote.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gold-800 font-semibold bg-gold-50 p-2 rounded-lg">
                  <span>50% Required Deposit:</span>
                  <span>{formatCurrency(depositAmount, quote.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-cream-300 flex flex-col sm:flex-row items-center gap-3">
            {quoteStatus === 'ACCEPTED' ? (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-botanical-50 border border-botanical-400 text-botanical-900 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-5 h-5 text-botanical-600 shrink-0" />
                  <span>Quotation Accepted & Celebration Date Secured!</span>
                </div>
                <Link
                  href={`/bookings/${quote.id}`}
                  className="px-5 py-2.5 rounded-full bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 font-bold uppercase tracking-wider text-[11px] transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <span>View Event Plan & Booking Portal →</span>
                </Link>
              </div>
            ) : (
              <>
                <button
                  onClick={handleAcceptQuote}
                  className="w-full sm:flex-1 py-4 rounded-full text-xs font-bold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-gold-400" />
                  <span>Accept Quote & Pay Deposit</span>
                </button>

                <button
                  onClick={() => alert('Change request submitted to Mekdi Decor concierge.')}
                  className="w-full sm:w-auto px-6 py-4 rounded-full text-xs font-semibold tracking-wider text-charcoal-700 bg-cream-100 hover:bg-cream-200 transition-colors"
                >
                  Request Changes
                </button>

                <Link
                  href="/contact"
                  className="w-full sm:w-auto px-6 py-4 rounded-full text-xs font-semibold tracking-wider text-burgundy-900 border border-burgundy-900/30 hover:bg-burgundy-50 transition-colors text-center"
                >
                  Contact Us
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Booking Lifecycle Progress Bar (from Part 10 & screenshot) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
          <h3 className="text-xs uppercase tracking-wider font-bold text-charcoal-700 mb-6 text-center">
            Booking Progress
          </h3>

          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            {/* Connecting Line */}
            <div className="absolute top-4 left-6 right-6 h-0.5 bg-cream-300 -z-0" />

            {/* Step 1: Consultation */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-botanical-600 text-white flex items-center justify-center text-xs shadow-sm">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-charcoal-800 mt-2">
                Consultation
              </span>
            </div>

            {/* Step 2: Quote */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-burgundy-800 text-gold-300 flex items-center justify-center text-xs font-bold ring-4 ring-gold-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-burgundy-900 mt-2">
                Quote
              </span>
            </div>

            {/* Step 3: Deposit */}
            <div className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  quoteStatus === 'ACCEPTED'
                    ? 'bg-botanical-600 text-white'
                    : 'bg-cream-200 text-charcoal-500'
                }`}
              >
                {quoteStatus === 'ACCEPTED' ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-[11px] font-medium text-charcoal-600 mt-2">
                Deposit
              </span>
            </div>

            {/* Step 4: Preparation */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center text-xs font-bold">
                4
              </div>
              <span className="text-[11px] font-medium text-charcoal-500 mt-2">
                Preparation
              </span>
            </div>

            {/* Step 5: Event Day */}
            <div className="flex flex-col items-center relative z-10">
              <div className="w-8 h-8 rounded-full bg-cream-200 text-charcoal-500 flex items-center justify-center text-xs font-bold">
                5
              </div>
              <span className="text-[11px] font-medium text-charcoal-500 mt-2">
                Event Day
              </span>
            </div>
          </div>
        </div>

        {/* Ethiopian Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-gold-400 shadow-2xl relative">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="absolute top-5 right-5 p-1 rounded-full text-charcoal-400 hover:text-charcoal-700"
              >
                <X className="w-5 h-5" />
              </button>

              {paymentSuccess ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-botanical-100 text-botanical-700 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                    Deposit Successfully Paid!
                  </h3>
                  <p className="text-xs text-charcoal-600 mb-6">
                    Reference: CHAPA-TX-782109 • Amount: ETB 102,500
                    <br />
                    Your event date ({quote.eventDate}) is officially locked in our production schedule.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href={`/bookings/${quote.id}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm inline-flex items-center justify-center gap-2"
                    >
                      <span>Track Booking & Event Plan →</span>
                    </Link>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold uppercase bg-cream-100 text-charcoal-700 hover:bg-cream-200 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold block mb-1">
                    Secure Ethiopian Gateway
                  </span>
                  <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                    Pay 50% Deposit
                  </h3>
                  <p className="text-xs text-charcoal-600 mb-6">
                    Total Deposit Due: <strong className="text-burgundy-900 font-mono text-sm">{formatCurrency(depositAmount, quote.currency)}</strong>
                  </p>

                  {/* Provider selection tabs */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('CHAPA')}
                      className={`p-3 rounded-2xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        selectedProvider === 'CHAPA'
                          ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                          : 'border-cream-300 text-charcoal-600'
                      }`}
                    >
                      Chapa / Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('TELEBIRR')}
                      className={`p-3 rounded-2xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        selectedProvider === 'TELEBIRR'
                          ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                          : 'border-cream-300 text-charcoal-600'
                      }`}
                    >
                      Telebirr
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('CBE_BIRR')}
                      className={`p-3 rounded-2xl border text-center text-xs font-semibold cursor-pointer transition-all ${
                        selectedProvider === 'CBE_BIRR'
                          ? 'border-burgundy-800 bg-burgundy-50 text-burgundy-900'
                          : 'border-cream-300 text-charcoal-600'
                      }`}
                    >
                      CBE Birr
                    </button>
                  </div>

                  {/* Provider details */}
                  <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-300 mb-6 text-xs text-charcoal-700 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-charcoal-900">
                      <ShieldCheck className="w-4 h-4 text-botanical-600" />
                      <span>Direct Merchant Integration</span>
                    </div>
                    {selectedProvider === 'CHAPA' && (
                      <p className="text-[11px] text-charcoal-600">
                        Process securely with local Ethiopian debit cards or international cards via Chapa.
                      </p>
                    )}
                    {selectedProvider === 'TELEBIRR' && (
                      <p className="text-[11px] text-charcoal-600">
                        Enter your Telebirr mobile number. You will receive an instant USSD push prompt on your phone.
                      </p>
                    )}
                    {selectedProvider === 'CBE_BIRR' && (
                      <p className="text-[11px] text-charcoal-600">
                        Direct transfer to Commercial Bank of Ethiopia (CBE) Account 1000188929312.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleProcessDeposit}
                    disabled={isProcessingPayment}
                    className="w-full py-4 rounded-full text-xs font-bold tracking-wider uppercase bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <span>Connecting to Payment Gateway...</span>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span>Confirm & Authorize {formatCurrency(depositAmount, quote.currency)}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
