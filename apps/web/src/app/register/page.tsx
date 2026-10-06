'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { Sparkles, ArrowRight, User, Mail, Lock, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to create account.');
        setIsLoading(false);
        return;
      }

      // Success Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5B1424', '#D4AF37', '#FAF6F0'],
        });
      } catch {}

      // Redirect to verification screen with email prefilled
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&justRegistered=true`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border-2 border-gold-400/30 shadow-elevated">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
            Private Client Membership
          </span>
          <h1 className="font-editorial text-3xl font-bold text-charcoal-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="mt-2 text-xs text-charcoal-600 font-light">
            Join the Mekdi Decor atelier to save inspiration boards, track 3D event blueprints, and receive digital quotations.
          </p>
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
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Sara Tekle"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="sara@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+251 9XX XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3 text-xs bg-cream-50 border border-cream-300 rounded-2xl focus:outline-none focus:border-burgundy-800 focus:bg-white text-charcoal-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                <span>Dispatching Verification Email...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 text-gold-400" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-cream-200 text-center">
          <p className="text-xs text-charcoal-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-burgundy-900 hover:text-gold-700 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
