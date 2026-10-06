'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  CreditCard,
  FileText,
  Users,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface UpcomingEventItem {
  id: string;
  bookingNumber?: string;
  type: string;
  date: string;
  rawDate?: string;
  venue: string;
  status: string;
  client: string;
  statusColor: string;
  totalAmount?: number;
  depositPaid?: boolean;
}

interface ActivityFeedItem {
  title: string;
  desc: string;
  time: string;
  type: 'PAYMENT' | 'REQUEST' | 'BOOKING' | 'QUOTE' | 'MESSAGE';
}

interface CalendarData {
  monthLabel: string;
  daysInMonth: number;
  eventDays: number[];
  eventsCount: number;
}

export default function AdminDashboardPage() {
  const [statsData, setStatsData] = useState({
    totalEvents: '24',
    pendingRequests: '8',
    upcomingEvents: '14',
    pendingQuotes: '5',
    totalRevenue: 'ETB 245,000',
  });

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEventItem[]>([
    {
      id: 'e-1',
      type: 'Wedding',
      date: 'Dec 18, 2026',
      venue: 'Skyline Event Hall, Hawassa',
      status: 'Confirmed',
      client: 'Sarah & Michael',
      statusColor: 'bg-botanical-100 text-botanical-800 border-botanical-300',
    },
    {
      id: 'e-2',
      type: 'Graduation',
      date: 'Dec 21, 2026',
      venue: 'Imperial Hotel, Addis Ababa',
      status: 'Confirmed',
      client: 'Dr. Helen Girma',
      statusColor: 'bg-botanical-100 text-botanical-800 border-botanical-300',
    },
    {
      id: 'e-3',
      type: 'Birthday',
      date: 'Dec 24, 2026',
      venue: 'Home Venue / Villa Compound',
      status: 'Pending',
      client: 'Michael Kebede',
      statusColor: 'bg-gold-100 text-gold-900 border-gold-300',
    },
    {
      id: 'e-4',
      type: 'Corporate',
      date: 'Dec 28, 2026',
      venue: 'Radisson Blu Ballroom',
      status: 'Confirmed',
      client: 'Fintech Summit',
      statusColor: 'bg-botanical-100 text-botanical-800 border-botanical-300',
    },
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityFeedItem[]>([
    {
      title: 'New quote request from Sarah T.',
      time: '2 hours ago',
      desc: 'Skyline Hall Hawassa, 350 guests',
      type: 'REQUEST',
    },
    {
      title: 'Payment received (ETB 50,000)',
      time: '4 hours ago',
      desc: 'Telebirr TX-44812 from Michael K.',
      type: 'PAYMENT',
    },
    {
      title: 'New message from Michael K.',
      time: '5 hours ago',
      desc: 'Regarding velvet backdrop color choice',
      type: 'MESSAGE',
    },
    {
      title: 'Booking confirmed — Wedding',
      time: '6 hours ago',
      desc: 'Sarah’s Wedding locked in production calendar',
      type: 'BOOKING',
    },
    {
      title: 'Gallery image uploaded',
      time: '8 hours ago',
      desc: 'Lake View evening floral pergola',
      type: 'QUOTE',
    },
  ]);

  const [calendarData, setCalendarData] = useState<CalendarData>({
    monthLabel: 'December 2026',
    daysInMonth: 31,
    eventDays: [18, 21, 24, 28],
    eventsCount: 4,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          if (data.stats) {
            setStatsData({
              totalEvents: String(data.stats.totalEvents),
              pendingRequests: String(data.stats.pendingRequests),
              upcomingEvents: String(data.stats.upcomingEvents),
              pendingQuotes: String(data.stats.pendingQuotes),
              totalRevenue: data.stats.totalRevenue,
            });
          }
          if (Array.isArray(data.upcomingEvents) && data.upcomingEvents.length > 0) {
            setUpcomingEvents(data.upcomingEvents);
          }
          if (data.calendar) {
            setCalendarData(data.calendar);
          }
          if (Array.isArray(data.recentActivity) && data.recentActivity.length > 0) {
            setRecentActivity(data.recentActivity);
          }
        }
      })
      .catch((err) => console.warn('Failed to load stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Events', value: statsData.totalEvents, change: '+12%', isPositive: true },
    { label: 'Pending Requests', value: statsData.pendingRequests, change: '+3%', isPositive: true },
    { label: 'Upcoming Events', value: statsData.upcomingEvents, change: '-5%', isPositive: false },
    { label: 'Pending Quotes', value: statsData.pendingQuotes, change: '-2%', isPositive: false },
    { label: 'Revenue', value: statsData.totalRevenue, change: '+10%', isPositive: true },
  ];

  const getActivityIcon = (type: ActivityFeedItem['type']) => {
    switch (type) {
      case 'PAYMENT':
        return <CreditCard className="w-3.5 h-3.5 text-botanical-600" />;
      case 'REQUEST':
        return <FileText className="w-3.5 h-3.5 text-gold-600" />;
      case 'BOOKING':
        return <CheckCircle2 className="w-3.5 h-3.5 text-botanical-600" />;
      case 'MESSAGE':
        return <Users className="w-3.5 h-3.5 text-burgundy-600" />;
      case 'QUOTE':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-gold-600" />;
    }
  };

  const daysInMonth = Array.from({ length: calendarData.daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
          Good morning, Admin
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* 5 KPI Stat Cards (Matching UI Mockup) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((st, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-cream-200 shadow-card flex flex-col justify-between"
          >
            <span className="text-[11px] text-charcoal-500 font-medium truncate block">
              {st.label}
            </span>
            <div className="my-2">
              <span className="font-editorial text-xl sm:text-2xl font-bold text-charcoal-900">
                {st.value}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold">
              {st.isPositive ? (
                <span className="text-botanical-700 flex items-center">
                  <ArrowUpRight className="w-3 h-3" />
                  {st.change}
                </span>
              ) : (
                <span className="text-amber-700 flex items-center">
                  <ArrowDownRight className="w-3 h-3" />
                  {st.change}
                </span>
              )}
              <span className="text-charcoal-400 font-normal">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Upcoming Events & Calendar / Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upcoming Events Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal-900">
                Upcoming Events
              </h2>
              <p className="text-xs text-charcoal-500">
                Production dates locked for setup & delivery
              </p>
            </div>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-burgundy-900 hover:text-gold-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-cream-200 text-charcoal-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Venue</th>
                  <th className="pb-3">Client</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {upcomingEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-3.5 font-semibold text-charcoal-900">
                      {evt.type}
                    </td>
                    <td className="py-3.5 text-charcoal-600 whitespace-nowrap">
                      {evt.date}
                    </td>
                    <td className="py-3.5 text-charcoal-600 max-w-[180px] truncate">
                      {evt.venue}
                    </td>
                    <td className="py-3.5 text-charcoal-900 font-medium">
                      {evt.client}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${evt.statusColor}`}
                      >
                        {evt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Mini Calendar & Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mini Calendar Widget */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <span className="font-editorial text-sm font-bold text-charcoal-900">
                {calendarData.monthLabel}
              </span>
              <span className="text-[11px] text-burgundy-800 font-semibold bg-cream-100 px-2 py-0.5 rounded-full">
                {calendarData.eventsCount} Event{calendarData.eventsCount !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-charcoal-500 font-medium mb-2">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {daysInMonth.map((d) => {
                const hasEvent = calendarData.eventDays.includes(d);
                return (
                  <div
                    key={d}
                    className={`h-7 flex flex-col items-center justify-center rounded-lg text-[11px] relative transition-colors ${
                      hasEvent
                        ? 'bg-burgundy-900 text-gold-300 font-bold shadow-xs'
                        : 'text-charcoal-700 hover:bg-cream-100'
                    }`}
                  >
                    <span>{d}</span>
                    {hasEvent && (
                      <span className="w-1 h-1 rounded-full bg-gold-400 absolute bottom-0.5 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-card">
            <h3 className="font-editorial text-sm font-bold text-charcoal-900 mb-4">
              Recent Activity
            </h3>

            <div className="space-y-4">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-cream-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-semibold text-charcoal-900 truncate">
                      {act.title}
                    </p>
                    <span className="text-[10px] text-charcoal-400 block truncate">
                      {act.desc} • {act.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
