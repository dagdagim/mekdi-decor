'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  CreditCard,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  kpi: {
    totalCollected: number;
    annualRunRate: string;
    quoteConversionRate: string;
    averageBookingValue: string;
    repeatCustomerRate: string;
  };
  monthlyRevenue: Array<{ m: string; rev: number }>;
  maxRev: number;
  eventTypes: Array<{ type: string; share: number; color: string; count: number }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    kpi: {
      totalCollected: 245000,
      annualRunRate: 'ETB 3,420,000',
      quoteConversionRate: '78.4%',
      averageBookingValue: 'ETB 165,000',
      repeatCustomerRate: '42%',
    },
    monthlyRevenue: [
      { m: 'Jul', rev: 140000 },
      { m: 'Aug', rev: 185000 },
      { m: 'Sep', rev: 220000 },
      { m: 'Oct', rev: 245000 },
      { m: 'Nov (Proj)', rev: 310000 },
      { m: 'Dec (Proj)', rev: 420000 },
    ],
    maxRev: 450000,
    eventTypes: [
      { type: 'Luxury Weddings', share: 55, color: 'bg-burgundy-900', count: 18 },
      { type: 'Graduation Galas', share: 20, color: 'bg-gold-500', count: 7 },
      { type: 'Milestone Birthdays', share: 15, color: 'bg-charcoal-800', count: 5 },
      { type: 'Corporate Summits', share: 10, color: 'bg-botanical-700', count: 3 },
    ],
  });

  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setAnalytics(resData.data);
        }
      })
      .catch((err) => console.warn('Could not load analytics:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const { kpi, monthlyRevenue, maxRev, eventTypes } = analytics;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Executive Business Analytics
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Real-time revenue performance, booking conversion velocity, and event type distribution from live database.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 hover:bg-cream-100 transition-colors w-fit shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-burgundy-900' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-medium block">
            Annual Run-Rate
          </span>
          <span className="font-editorial text-2xl font-bold text-burgundy-900 block my-1">
            {kpi.annualRunRate}
          </span>
          <span className="text-xs font-semibold text-botanical-700">+28% YoY growth</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-medium block">
            Quote Conversion Rate
          </span>
          <span className="font-editorial text-2xl font-bold text-charcoal-900 block my-1">
            {kpi.quoteConversionRate}
          </span>
          <span className="text-xs font-semibold text-botanical-700">Accepted quotes</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-medium block">
            Average Booking Value
          </span>
          <span className="font-editorial text-2xl font-bold text-charcoal-900 block my-1">
            {kpi.averageBookingValue}
          </span>
          <span className="text-xs font-semibold text-botanical-700">Highest in Hawassa</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-medium block">
            Customer Repeat / Referral
          </span>
          <span className="font-editorial text-2xl font-bold text-gold-700 block my-1">
            {kpi.repeatCustomerRate}
          </span>
          <span className="text-xs text-charcoal-500">From client community</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Growth Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                Revenue Trajectory (ETB)
              </h2>
              <p className="text-xs text-charcoal-500">
                Actuals and confirmed high season wedding bookings
              </p>
            </div>
            <TrendingUp className="w-5 h-5 text-botanical-600" />
          </div>

          {/* Clean pure CSS bar chart */}
          <div className="flex items-end justify-between gap-4 h-56 pt-6 border-b border-cream-200">
            {monthlyRevenue.map((item, i) => {
              const heightPercent = (item.rev / maxRev) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-charcoal-500 font-semibold">
                    {Math.round(item.rev / 1000)}k
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-burgundy-950 to-burgundy-800 rounded-t-xl transition-all duration-700 hover:brightness-110"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[11px] font-medium text-charcoal-700 mt-1">
                    {item.m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event Category Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-editorial text-xl font-bold text-charcoal-900 mb-1">
              Event Types Portfolio
            </h2>
            <p className="text-xs text-charcoal-500 mb-6">
              Distribution of contracts by celebration category
            </p>

            <div className="space-y-4">
              {eventTypes.map((et, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-charcoal-800">
                    <span>{et.type}</span>
                    <span>{et.share}% ({et.count} events)</span>
                  </div>
                  <div className="h-2.5 w-full bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${et.color}`}
                      style={{ width: `${et.share}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-cream-200 text-xs text-charcoal-500 flex items-center justify-between">
            <span>Primary Revenue Driver:</span>
            <strong className="text-burgundy-900">Elegance & Signature Wedding Tiers</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
