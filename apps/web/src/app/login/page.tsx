'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles, ShieldCheck, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid email or password.');
        setIsLoading(false);
        return;
      }

      if (!data.isVerified) {
        // Need verification
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
        });
      } catch {}

      if (data.data?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border-2 border-gold-400/30 shadow-elevated">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
            Welcome Back
          </span>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 tracking-tight">
            Sign In to Your Account
          </h1>
          <p className="mt-2 text-xs text-charcoal-600 font-light">
            Access your event plans, quotations, and live moodboard designs.
          </p>
        </div>

        {/* Quick Fill Demo Accounts */}
        <div className="p-3 rounded-2xl bg-cream-100/70 border border-cream-200">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-charcoal-500 block mb-2 text-center">
            Demo Credentials
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@mekdidecor.com', 'admin123')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-burgundy-900 text-gold-300 text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-burgundy-800 transition-colors"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Portal</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sara.t@example.com', 'password')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-white border border-cream-300 text-charcoal-800 text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-cream-200 transition-colors"
            >
              <User className="w-3 h-3 text-gold-600" />
              <span>Client Demo</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-burgundy-50 border border-burgundy-200 text-burgundy-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-burgundy-700" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="sara@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700">
                Password
              </label>
              <span className="text-[11px] text-charcoal-400 hover:text-burgundy-900 cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-full text-xs font-bold tracking-widest uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-cream-200 text-center">
          <p className="text-xs text-charcoal-600">
            Don&apos;t have an account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-burgundy-900 hover:text-gold-700 transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
