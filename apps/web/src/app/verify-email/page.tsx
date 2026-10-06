'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Mail, Check, AlertCircle, ArrowRight, RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const codeParam = searchParams.get('code');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (codeParam) {
      setCode(codeParam);
      // Auto verify if both are provided
      if (emailParam) {
        verifyEmail(emailParam, codeParam);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (targetEmail: string, targetCode: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, code: targetCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid verification code.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('Email verified successfully! Welcome to Mekdi Decor.');

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
        });
      } catch {}

      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !code.trim()) {
      setErrorMessage('Please provide both email and 6-digit verification code.');
      return;
    }
    verifyEmail(email.trim(), code.trim());
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to resend code.');
      } else {
        setSuccessMessage('A fresh verification code has been dispatched to your email.');
        setResendCooldown(60);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resending code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border-2 border-gold-400/30 shadow-elevated">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <div className="w-14 h-14 rounded-full bg-cream-100 border border-gold-400/40 text-gold-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Mail className="w-7 h-7 text-burgundy-900" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
            Security Check
          </span>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 tracking-tight">
            Verify Your Email
          </h1>
          <p className="mt-2 text-xs text-charcoal-600 font-light leading-relaxed">
            We sent a 6-digit confirmation code to{' '}
            <strong className="text-charcoal-900 font-medium">{email || 'your email'}</strong>. Enter it below to activate your account.
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-burgundy-700" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-botanical-50 border border-botanical-300 text-botanical-900 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-botanical-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-5">
          {!searchParams.get('email') && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="sara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5 text-center">
              6-Digit Confirmation Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full py-4 text-center font-mono text-2xl tracking-[0.5em] font-bold bg-cream-50 border-2 border-gold-400/50 rounded-2xl focus:outline-none focus:border-burgundy-900 focus:bg-white text-burgundy-950"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full py-4 rounded-full text-xs font-bold tracking-widest uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Verifying Code...</span>
            ) : (
              <>
                <span>Confirm & Activate Account</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-cream-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isLoading}
            className="text-burgundy-900 hover:text-gold-700 font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </span>
          </button>

          <Link
            href="/login"
            className="text-charcoal-600 hover:text-burgundy-900 font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 py-24 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-gold-500 animate-spin" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
