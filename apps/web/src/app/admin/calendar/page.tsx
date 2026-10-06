'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  RefreshCw,
  X,
  User,
  DollarSign,
  Layers,
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export interface CalendarEventItem {
  id: string;
  bookingId?: string;
  bookingNumber?: string;
  title: string;
  type: 'EVENT' | 'SETUP' | 'CONSULTATION';
  date: string;
  time: string;
  venue: string;
  client: string;
  status: string;
  totalAmount?: number;
  depositPaid?: boolean;
  notes?: string;
  hasConflict?: boolean;
}

interface CalendarStats {
  totalEvents: number;
  setupDates: number;
  consultationsCount: number;
  conflictsCount: number;
}

export default function AdminCalendarPage() {
  // Default to December 2026 where seeded production bookings are set, allowing full navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 11, 1));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    totalEvents: 0,
    setupDates: 0,
    consultationsCount: 0,
    conflictsCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  
  // Modals
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'EVENT' | 'SETUP' | 'CONSULTATION'>('ALL');

  // New Event Form State
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    type: 'EVENT' as 'EVENT' | 'SETUP' | 'CONSULTATION',
    date: '2026-12-18',
    time: '10:00 AM – 10:00 PM',
    venue: '',
    client: '',
    notes: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Fetch Calendar Data from Database
  const fetchCalendarData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/admin/calendar');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setEvents(json.data);
        if (json.stats) {
          setStats(json.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch calendar schedules:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    setCurrentDate(new Date(2026, 11, 1)); // Reset to production season (Dec 2026)
  };

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // First day of active month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Filtered Events
  const displayedEvents = events.filter((e) => {
    if (filterType === 'ALL') return true;
    return e.type === filterType;
  });

  // Save new schedule block
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchedule.title || !newSchedule.date) {
      alert('Please provide at least a title and date.');
      return;
    }

    setSavingSchedule(true);
    try {
      const res = await fetch('/api/admin/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEvents((prev) => [data.data, ...prev]);
        setIsAddModalOpen(false);
        setNewSchedule({
          title: '',
          type: 'EVENT',
          date: '2026-12-18',
          time: '10:00 AM – 10:00 PM',
          venue: '',
          client: '',
          notes: '',
        });
      }
    } catch (err) {
      alert('Error creating schedule item.');
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
              Master Production Calendar
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold-100 text-burgundy-900 border border-gold-300">
              Live Database
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Track crew setup dates, live events, consultations, and manage venue allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            onClick={() => fetchCalendarData(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-cream-300 bg-white hover:bg-cream-100 text-charcoal-700 transition-all flex items-center gap-1.5 text-xs font-medium shadow-xs"
            title="Sync calendar with database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-burgundy-800 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white border border-cream-200 rounded-xl p-1 text-xs shadow-xs">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-burgundy-900 text-cream-50'
                  : 'text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-burgundy-900 text-cream-50'
                  : 'text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'day'
                  ? 'bg-burgundy-900 text-cream-50'
                  : 'text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              Day
            </button>
          </div>

          {/* Add Schedule Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">Total Events</p>
            <p className="text-xl sm:text-2xl font-bold font-editorial text-charcoal-900 mt-0.5">
              {stats.totalEvents}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-burgundy-50 border border-burgundy-100 flex items-center justify-center text-burgundy-900">
            <Sparkles className="w-5 h-5 text-gold-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">Setup & Rigging</p>
            <p className="text-xl sm:text-2xl font-bold font-editorial text-gold-800 mt-0.5">
              {stats.setupDates}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-800">
            <Layers className="w-5 h-5 text-gold-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">Design Consultations</p>
            <p className="text-xl sm:text-2xl font-bold font-editorial text-botanical-800 mt-0.5">
              {stats.consultationsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-botanical-50 border border-botanical-200 flex items-center justify-center text-botanical-800">
            <Clock className="w-5 h-5 text-botanical-700" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-charcoal-400 font-semibold">Conflicts / Collisions</p>
            <p className={`text-xl sm:text-2xl font-bold font-editorial mt-0.5 ${stats.conflictsCount > 0 ? 'text-amber-600' : 'text-botanical-700'}`}>
              {stats.conflictsCount}
            </p>
          </div>
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
            stats.conflictsCount > 0
              ? 'bg-amber-50 border-amber-200 text-amber-600'
              : 'bg-cream-100 border-cream-200 text-charcoal-400'
          }`}>
            {stats.conflictsCount > 0 ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-botanical-600" />
            )}
          </div>
        </div>
      </div>

      {/* Main Calendar Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-cream-200 shadow-card">
        {/* Month Navigation & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 tracking-tight">
              {monthName}
            </h2>

            {stats.conflictsCount > 0 ? (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{stats.conflictsCount} Scheduling Collision Detected</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-botanical-800 bg-botanical-50 px-3 py-1 rounded-full border border-botanical-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-botanical-600" />
                <span>Zero Scheduling Conflicts</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Pills */}
            <div className="hidden md:flex items-center gap-1 text-[11px] font-medium bg-cream-50 p-1 rounded-xl border border-cream-200">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'ALL' ? 'bg-burgundy-900 text-white font-semibold' : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('EVENT')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'EVENT' ? 'bg-burgundy-900 text-gold-300 font-semibold' : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setFilterType('SETUP')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'SETUP' ? 'bg-gold-500 text-white font-semibold' : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                Setup
              </button>
              <button
                onClick={() => setFilterType('CONSULTATION')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filterType === 'CONSULTATION' ? 'bg-botanical-700 text-white font-semibold' : 'text-charcoal-600 hover:text-burgundy-900'
                }`}
              >
                Intake
              </button>
            </div>

            <button
              onClick={handleJumpToToday}
              className="text-xs px-2.5 py-1.5 rounded-xl border border-cream-200 hover:bg-cream-100 text-charcoal-700 font-medium transition-colors"
            >
              Current Season
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="p-2 rounded-xl border border-cream-200 hover:bg-cream-100 text-charcoal-700 active:scale-95 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="p-2 rounded-xl border border-cream-200 hover:bg-cream-100 text-charcoal-700 active:scale-95 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-24 text-center">
            <RefreshCw className="w-8 h-8 text-gold-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-charcoal-600">
              Loading production calendar schedules from database...
            </p>
          </div>
        ) : viewMode === 'month' ? (
          <>
            {/* Days Header */}
            <div className="grid grid-cols-7 gap-px border-b border-cream-200 text-center py-3 text-[11px] sm:text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              <span>Sunday</span>
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
              <span>Saturday</span>
            </div>

            {/* Interactive Month Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 pt-4">
              {/* Previous Month Padding Slots */}
              {Array.from({ length: firstDayIndex }, (_, i) => {
                const prevDayNum = daysInPrevMonth - firstDayIndex + 1 + i;
                return (
                  <div
                    key={`prev-${prevDayNum}`}
                    className="min-h-[105px] sm:min-h-[120px] p-2 rounded-2xl border border-cream-100 bg-cream-50/40 opacity-40 select-none"
                  >
                    <span className="font-semibold text-xs text-charcoal-400">{prevDayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Active Days */}
              {Array.from({ length: daysInCurrentMonth }, (_, i) => {
                const dayNum = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                
                const eventsOnDay = displayedEvents.filter((s) => s.date === dateKey);
                const hasEvent = eventsOnDay.some((e) => e.type === 'EVENT');
                const hasSetup = eventsOnDay.some((e) => e.type === 'SETUP');
                const hasCollision = eventsOnDay.some((e) => e.hasConflict);

                return (
                  <div
                    key={`curr-${dayNum}`}
                    className={`min-h-[105px] sm:min-h-[125px] p-2 rounded-2xl border flex flex-col justify-between transition-all group ${
                      hasCollision
                        ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                        : eventsOnDay.length > 0
                        ? 'bg-cream-50/80 border-gold-400/60 shadow-xs hover:border-gold-500'
                        : 'bg-white border-cream-200/80 hover:bg-cream-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-xs ${
                        eventsOnDay.length > 0 ? 'text-charcoal-900' : 'text-charcoal-600'
                      }`}>
                        {dayNum}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        {hasCollision && (
                          <span title="Multiple major productions scheduled">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          </span>
                        )}
                        {eventsOnDay.length > 0 && (
                          <span className={`w-2 h-2 rounded-full ${
                            hasEvent ? 'bg-burgundy-700' : hasSetup ? 'bg-gold-500' : 'bg-botanical-600'
                          }`} />
                        )}
                      </div>
                    </div>

                    {/* Day's Event Pills */}
                    <div className="space-y-1 my-1.5 flex-1 overflow-y-auto max-h-[85px] no-scrollbar">
                      {eventsOnDay.map((evt) => (
                        <button
                          key={evt.id}
                          onClick={() => setSelectedEvent(evt)}
                          className={`w-full text-left p-1.5 rounded-lg text-[10px] font-semibold truncate transition-transform hover:scale-[1.02] active:scale-95 block ${
                            evt.type === 'EVENT'
                              ? 'bg-burgundy-900 text-gold-200 hover:bg-burgundy-800'
                              : evt.type === 'SETUP'
                              ? 'bg-gold-100 text-gold-900 border border-gold-300 hover:bg-gold-200'
                              : 'bg-botanical-100 text-botanical-800 border border-botanical-200 hover:bg-botanical-200'
                          }`}
                          title={`${evt.title} (${evt.time}) - Click for details`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            {evt.hasConflict && (
                              <span className="text-amber-300 font-bold shrink-0">⚠️</span>
                            )}
                            <span className="truncate">{evt.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="text-[9px] text-charcoal-400 font-medium text-right">
                      {eventsOnDay.length > 2 && `+${eventsOnDay.length - 2} more`}
                    </div>
                  </div>
                );
              })}

              {/* Next Month Trailing Padding Slots to complete the grid */}
              {Array.from(
                { length: (7 - ((firstDayIndex + daysInCurrentMonth) % 7)) % 7 },
                (_, i) => {
                  const nextDayNum = i + 1;
                  return (
                    <div
                      key={`next-${nextDayNum}`}
                      className="min-h-[105px] sm:min-h-[120px] p-2 rounded-2xl border border-cream-100 bg-cream-50/40 opacity-40 select-none"
                    >
                      <span className="font-semibold text-xs text-charcoal-400">{nextDayNum}</span>
                    </div>
                  );
                }
              )}
            </div>
          </>
        ) : viewMode === 'week' ? (
          /* Week View */
          <div className="space-y-4 pt-4">
            <p className="text-xs text-charcoal-500 italic">
              Showing active schedule distribution for current week of {monthName}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {Array.from({ length: 7 }, (_, i) => {
                const dayNum = Math.min(i + 14, daysInCurrentMonth); // Showcase middle production week
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const eventsOnDay = displayedEvents.filter((s) => s.date === dateKey);

                return (
                  <div key={i} className="bg-cream-50/60 rounded-2xl p-3 border border-cream-200">
                    <div className="border-b border-cream-200 pb-2 mb-2">
                      <p className="text-[10px] uppercase font-bold text-charcoal-400">Day {dayNum}</p>
                      <p className="text-xs font-semibold text-burgundy-900">{eventsOnDay.length} Scheduled</p>
                    </div>
                    <div className="space-y-2">
                      {eventsOnDay.length === 0 ? (
                        <p className="text-[10px] text-charcoal-400 py-3 text-center">Open Date</p>
                      ) : (
                        eventsOnDay.map((e) => (
                          <div
                            key={e.id}
                            onClick={() => setSelectedEvent(e)}
                            className="p-2 rounded-xl bg-white border border-cream-300 text-[11px] cursor-pointer hover:border-gold-400 shadow-xs transition-all"
                          >
                            <p className="font-bold text-charcoal-900 truncate">{e.title}</p>
                            <p className="text-[10px] text-charcoal-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gold-500" />
                              <span className="truncate">{e.time}</span>
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Day Agenda View */
          <div className="pt-4 space-y-4">
            <h3 className="text-sm font-semibold text-charcoal-800">
              Active Events & Production Schedule (Chronological Order):
            </h3>
            <div className="divide-y divide-cream-200 border border-cream-200 rounded-2xl overflow-hidden bg-white">
              {displayedEvents.length === 0 ? (
                <div className="p-8 text-center text-sm text-charcoal-500">
                  No events found matching current criteria.
                </div>
              ) : (
                displayedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="p-4 hover:bg-cream-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            evt.type === 'EVENT'
                              ? 'bg-burgundy-900 text-gold-300'
                              : evt.type === 'SETUP'
                              ? 'bg-gold-100 text-gold-900 border border-gold-300'
                              : 'bg-botanical-100 text-botanical-800'
                          }`}
                        >
                          {evt.type}
                        </span>
                        <h4 className="text-sm font-bold text-charcoal-900">{evt.title}</h4>
                      </div>
                      <p className="text-xs text-charcoal-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-gold-600" />
                          {evt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                          {evt.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-charcoal-400" />
                          {evt.venue}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-charcoal-800">{evt.client}</p>
                        <p className="text-[11px] text-botanical-700 font-medium">{evt.status}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-charcoal-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Event Details Drawer/Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-cream-200 shadow-2xl relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                  selectedEvent.type === 'EVENT'
                    ? 'bg-burgundy-900 text-gold-300'
                    : selectedEvent.type === 'SETUP'
                    ? 'bg-gold-100 text-gold-900 border border-gold-300'
                    : 'bg-botanical-100 text-botanical-800'
                }`}
              >
                {selectedEvent.type}
              </span>
              <span className="text-xs font-medium text-charcoal-500">
                Status: <strong className="text-charcoal-800">{selectedEvent.status}</strong>
              </span>
            </div>

            <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
              {selectedEvent.title}
            </h3>

            {selectedEvent.hasConflict && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Scheduling Alert:</strong> Another major production is scheduled on this same date. Ensure logistics crew are segregated.
                </span>
              </div>
            )}

            <div className="space-y-3.5 my-6 py-4 border-y border-cream-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gold-600" /> Client
                </span>
                <span className="font-bold text-charcoal-900">{selectedEvent.client}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-gold-600" /> Scheduled Date
                </span>
                <span className="font-semibold text-charcoal-800">{selectedEvent.date}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gold-600" /> Operational Window
                </span>
                <span className="font-semibold text-charcoal-800">{selectedEvent.time}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-500 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gold-600" /> Venue / Location
                </span>
                <span className="font-semibold text-charcoal-800">{selectedEvent.venue}</span>
              </div>

              {selectedEvent.totalAmount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-charcoal-500 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gold-600" /> Event Budget / Value
                  </span>
                  <span className="font-bold text-burgundy-900">
                    ETB {selectedEvent.totalAmount.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedEvent.notes && (
                <div className="pt-2 text-charcoal-600 border-t border-cream-100">
                  <p className="font-semibold text-charcoal-700 mb-0.5">Production Notes:</p>
                  <p className="italic bg-cream-50 p-2.5 rounded-xl border border-cream-200 font-light">
                    &ldquo;{selectedEvent.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              {selectedEvent.bookingId && (
                <Link
                  href="/admin/bookings"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gold-400 text-burgundy-950 hover:bg-gold-300 transition-colors flex items-center gap-1.5"
                >
                  <span>Go to Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-cream-300 hover:bg-cream-100 text-charcoal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Schedule Block Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-cream-200 shadow-2xl relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-cream-100 hover:bg-cream-200 text-charcoal-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-1">
              Add Schedule Item
            </h3>
            <p className="text-xs text-charcoal-500 mb-5">
              Lock in crew setup, VIP consultations, or blackout production blocks.
            </p>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Floral Refrigeration & Staging"
                  value={newSchedule.title}
                  onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Item Type
                  </label>
                  <select
                    value={newSchedule.type}
                    onChange={(e) =>
                      setNewSchedule({
                        ...newSchedule,
                        type: e.target.value as 'EVENT' | 'SETUP' | 'CONSULTATION',
                      })
                    }
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                  >
                    <option value="EVENT">Main Event</option>
                    <option value="SETUP">Setup & Rigging</option>
                    <option value="CONSULTATION">In-Studio Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newSchedule.date}
                    onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500 bg-white"
                  >
                  </input>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sara & Dawit"
                    value={newSchedule.client}
                    onChange={(e) => setNewSchedule({ ...newSchedule, client: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                    Time Window
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM – 06:00 PM"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Skyline Event Hall, Hawassa"
                  value={newSchedule.venue}
                  onChange={(e) => setNewSchedule({ ...newSchedule, venue: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Special rigging instructions, team lead notes..."
                  value={newSchedule.notes}
                  onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-cream-300 focus:outline-none focus:ring-1 focus:ring-gold-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-cream-300 hover:bg-cream-100 text-charcoal-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors flex items-center gap-1.5"
                >
                  {savingSchedule && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
