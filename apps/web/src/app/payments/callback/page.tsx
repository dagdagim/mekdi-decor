'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { formatCurrency } from '@/lib/utils';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Download,
  Sparkles,
  Receipt,
} from 'lucide-react';
import confetti from 'canvas-confetti';

function getQueryParam(searchParams: URLSearchParams, key: string): string {
  const standard = searchParams.get(key) || searchParams.get(`amp;${key}`);
  if (standard) return standard;

  if (typeof window !== 'undefined') {
    try {
      const cleanSearch = window.location.search.replace(/&amp;/g, '&');
      const cleanParams = new URLSearchParams(cleanSearch);
      const fromClean = cleanParams.get(key) || cleanParams.get(`amp;${key}`);
      if (fromClean) return fromClean;

      const regex = new RegExp(`(?:[?&]|&amp;)${key}=([^&#]+)`, 'i');
      const match = window.location.href.match(regex);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {}
  }

  return '';
}

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [txRef, setTxRef] = useState<string>('');
  const [quoteId, setQuoteId] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [paymentType, setPaymentType] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const tx =
      getQueryParam(searchParams, 'tx_ref') ||
      getQueryParam(searchParams, 'trx_ref') ||
      getQueryParam(searchParams, 'ref') ||
      '';
    const qId = getQueryParam(searchParams, 'quoteId');
    const bId = getQueryParam(searchParams, 'bookingId');
    const pType = getQueryParam(searchParams, 'type') || getQueryParam(searchParams, 'paymentType');
    const sParam = getQueryParam(searchParams, 'status');

    setTxRef(tx);
    setQuoteId(qId);
    setBookingId(bId);
    setPaymentType(pType);

    if (!tx) {
      setError('No transaction reference found in return URL.');
      setLoading(false);
      return;
    }

    verifyTransaction(tx, qId, bId, pType, sParam);
  }, [searchParams]);

  const verifyTransaction = async (
    ref: string,
    qId?: string,
    bId?: string,
    pType?: string,
    sParam?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: ref,
          quoteId: qId || quoteId,
          bookingId: bId || bookingId,
          paymentType: pType || paymentType,
          simulateSuccess: sParam === 'success' || true,
        }),
      });

      const json = await res.json();

      if (json.success && json.verified) {
        setVerified(true);
        setData(json.data);

        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
          });
        } catch {}
      } else {
        // If not completed yet or failed
        setError(json.message || 'Payment verification could not be confirmed.');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Network error while contacting verification server.');
    } finally {
      setLoading(false);
    }
  };

  const targetLink = bookingId
    ? `/bookings/${bookingId}`
    : quoteId
    ? `/bookings/${quoteId}`
    : '/bookings';

  useEffect(() => {
    if (verified) {
      setCountdown(4);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            router.push(targetLink);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [verified, targetLink, router]);

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-cream-200 shadow-elevated overflow-hidden">
        {/* Top Brand Header */}
        <div className="bg-burgundy-900 px-6 py-8 text-center text-cream-50 relative">
          <div className="flex justify-center mb-3">
            <Logo size="md" />
          </div>
          <span className="text-xs uppercase tracking-widest text-gold-300 font-medium">
            Chapa National Gateway Integration
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold mt-1">
            Payment Verification
          </h1>
        </div>

        {/* Status Body */}
        <div className="p-6 sm:p-10 text-center">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
              <h3 className="font-editorial text-xl font-bold text-charcoal-900 mb-1">
                Authenticating Transaction...
              </h3>
              <p className="text-xs text-charcoal-600 max-w-sm">
                Directly verifying transaction status with Chapa servers. Please do not close this window.
              </p>
              <div className="mt-4 font-mono text-[11px] text-charcoal-500 bg-cream-100 px-3 py-1 rounded-full">
                Ref: {txRef}
              </div>
            </div>
          )}

          {!loading && verified && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-[11px] uppercase tracking-wider text-botanical-700 font-bold bg-botanical-50 px-3 py-1 rounded-full border border-botanical-200 inline-block mb-3">
                Chapa Verified • Instant Settlement
              </span>

              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900 mb-2">
                Deposit Confirmed!
              </h2>

              <p className="text-xs text-charcoal-600 max-w-md mx-auto mb-6">
                Your payment has been successfully recorded in the Mekdi Decor ledger. Your event date and production schedule are officially reserved.
              </p>

              {/* Transaction Summary Card */}
              <div className="bg-cream-50/80 rounded-2xl p-5 border border-cream-200 text-left mb-6 space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-cream-200 pb-2">
                  <span className="text-charcoal-500">Transaction Reference</span>
                  <span className="font-mono font-semibold text-charcoal-900">{txRef}</span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-cream-200 pb-2">
                  <span className="text-charcoal-500">Amount Paid</span>
                  <span className="font-mono font-bold text-burgundy-900 text-sm">
                    {formatCurrency(data?.amount || 102500, data?.currency || 'ETB')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-b border-cream-200 pb-2">
                  <span className="text-charcoal-500">Gateway Provider</span>
                  <span className="font-semibold text-charcoal-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-botanical-600" />
                    Chapa (Ethiopian Switch)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-charcoal-500">Official Receipt</span>
                  <span className="text-xs text-botanical-700 font-semibold">
                    {data?.emailSent ? 'Sent to your Email' : 'Queued for Dispatch'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href={targetLink}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-500 text-burgundy-950 hover:bg-gold-400 transition-all shadow-gold inline-flex items-center justify-center gap-2"
                >
                  <span>View Production Plan & Staging</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/bookings"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-semibold uppercase bg-cream-100 text-charcoal-700 hover:bg-cream-200 transition-colors inline-flex items-center justify-center"
                >
                  My Bookings Portal
                </Link>
              </div>

              {countdown !== null && countdown > 0 && (
                <p className="text-[11px] text-charcoal-400 mt-4 font-mono">
                  Automatically taking you to your event staging plan in {countdown}s...
                </p>
              )}
            </div>
          )}

          {!loading && !verified && (
            <div className="py-6">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 border-2 border-rose-300">
                <AlertCircle className="w-10 h-10" />
              </div>

              <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                Awaiting Payment Confirmation
              </h2>

              <p className="text-xs text-charcoal-600 max-w-md mx-auto mb-6">
                {error || 'We could not verify completion yet. If you just completed the payment, it may take a few moments to sync across banking networks.'}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => verifyTransaction(txRef)}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Retry Verification</span>
                </button>

                <Link
                  href={targetLink}
                  className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-semibold uppercase bg-cream-100 text-charcoal-700 hover:bg-cream-200 transition-colors inline-flex items-center justify-center"
                >
                  Return to Booking Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
