'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Booking, EventRequestPayload, Quote } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  CreditCard,
  ArrowRight,
  Search,
  Plus,
  ShieldCheck,
  Send,
  Eye,
  FileText,
  Lock,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

function CustomerBookingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'requests' ? 'REQUESTS' : 'BOOKINGS';
  const initialEmail = searchParams.get('email') || '';

  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'REQUESTS'>(initialTab);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [requests, setRequests] = useState<EventRequestPayload[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Private Email Lookup
  const [lookupEmail, setLookupEmail] = useState(initialEmail);
  const [verifiedEmail, setVerifiedEmail] = useState(initialEmail);

  useEffect(() => {
    // 1. Check session auth
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setVerifiedEmail(data.user.email);
          setLookupEmail(data.user.email);
          loadClientData(data.user.email);
        } else {
          // If not authenticated, check localStorage or URL email
          const storedEmail = initialEmail || localStorage.getItem('mekdi_client_email') || '';
          if (storedEmail) {
            setVerifiedEmail(storedEmail);
            setLookupEmail(storedEmail);
            loadClientData(storedEmail);
          } else {
            loadClientData();
          }
        }
      })
      .catch(() => {
        loadClientData();
      });
  }, [initialEmail]);

  const loadClientData = async (email?: string) => {
    try {
      setLoading(true);
      const emailQuery = email ? `?email=${encodeURIComponent(email)}` : '';

      const [bkRes, reqRes, qtRes] = await Promise.all([
        fetch(`/api/bookings${emailQuery}`),
        fetch(`/api/event-requests${emailQuery}`),
        fetch(`/api/quotes`),
      ]);

      const bkData = await bkRes.json();
      const reqData = await reqRes.json();
      const qtData = await qtRes.json();

      if (bkData.success && Array.isArray(bkData.data)) {
        setBookings(bkData.data);
      }
      if (reqData.success && Array.isArray(reqData.data)) {
        setRequests(reqData.data);
      }
      if (qtData.success && Array.isArray(qtData.data)) {
        setQuotes(qtData.data);
      }
    } catch (err) {
      console.warn('Could not load client portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail) return;
    const clean = lookupEmail.trim().toLowerCase();
    setVerifiedEmail(clean);
    localStorage.setItem('mekdi_client_email', clean);
    loadClientData(clean);
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      b.bookingNumber?.toLowerCase().includes(q) ||
      b.eventTitle?.toLowerCase().includes(q) ||
      b.venueName?.toLowerCase().includes(q) ||
      b.customerName?.toLowerCase().includes(q) ||
      b.customerEmail?.toLowerCase().includes(q)
    );
  });

  // Check if a request has been converted to an approved/paid booking
  const isRequestConvertedToPaidBooking = (r: EventRequestPayload) => {
    if (r.status === 'CONFIRMED_BOOKING' || r.status === 'CONVERTED' || r.status === 'ARCHIVED') {
      return true;
    }
    return bookings.some(
      (b) =>
        (b.eventId === r.id ||
          b.id === r.bookingId ||
          b.id === `b-${r.id}` ||
          b.quoteId === `q-${r.id}` ||
          b.bookingNumber === r.bookingId) &&
        b.depositPaid
    );
  };

  // Active pending requests (removes requests once approved and 50% deposit is paid)
  const activeRequests = requests.filter((r) => !isRequestConvertedToPaidBooking(r));

  // Filter Requests
  const filteredRequests = activeRequests.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.requestNumber?.toLowerCase().includes(q) ||
      r.guestName?.toLowerCase().includes(q) ||
      r.guestEmail?.toLowerCase().includes(q) ||
      r.eventType?.toLowerCase().includes(q) ||
      r.venueName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-cream-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header & Privacy Status Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                Private Client Experience
              </span>
              <span className="text-cream-300">•</span>
              <span className="text-[10px] font-semibold text-charcoal-500 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-cream-200 shadow-2xs">
                <Lock className="w-3 h-3 text-gold-600" />
                <span>Confidential Portal</span>
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal-900">
              Celebration Bookings & Event Requests
            </h1>

            <p className="text-xs sm:text-sm text-charcoal-600 font-light mt-1 max-w-xl">
              Monitor your bespoke intake requests, track confirmed decoration milestones, and securely authorize deposit or final balance payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/plan-event"
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-gold-400" />
              <span>Plan New Celebration</span>
            </Link>
          </div>
        </div>

        {/* Private Client Account Identification Banner */}
        <div className="p-4 rounded-3xl bg-white border border-cream-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 text-xs w-full">
              <div className="w-9 h-9 rounded-full bg-burgundy-900 text-gold-300 font-bold flex items-center justify-center shrink-0">
                {currentUser.fullName?.[0] || 'C'}
              </div>
              <div>
                <span className="font-bold text-charcoal-900 block">
                  {currentUser.fullName} ({currentUser.email})
                </span>
                <span className="text-[11px] text-charcoal-500 font-light">
                  Authenticated Client &bull; Displaying your confidential event proposals and staging plans.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLookupSubmit} className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <div className="flex items-center gap-2 text-xs text-charcoal-700 shrink-0">
                <Mail className="w-4 h-4 text-burgundy-900" />
                <span className="font-semibold">Client Verification:</span>
              </div>

              <input
                type="email"
                required
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="Enter email to view your private plans (e.g. sara.t@example.com)"
                className="flex-1 px-4 py-2 text-xs rounded-xl bg-cream-50 border border-cream-200 focus:outline-none focus:border-gold-400 w-full"
              />

              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shrink-0 shadow-sm"
              >
                Access My Plans
              </button>

              <div className="flex items-center gap-2 text-xs shrink-0 pl-2 sm:border-l border-cream-200">
                <Link href="/login" className="text-burgundy-900 font-bold hover:underline">
                  Sign In
                </Link>
                <span className="text-cream-300">/</span>
                <Link href="/register" className="text-charcoal-600 hover:text-burgundy-900">
                  Register
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Portal Tabs: Confirmed Bookings vs Submitted Requests */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1.5 rounded-full bg-cream-100 border border-cream-300 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('BOOKINGS')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'BOOKINGS'
                  ? 'bg-burgundy-900 text-cream-50 shadow-sm'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Confirmed Bookings & Staging Plans ({bookings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('REQUESTS')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'REQUESTS'
                  ? 'bg-burgundy-900 text-cream-50 shadow-sm'
                  : 'text-charcoal-700 hover:text-charcoal-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submitted Event Requests ({activeRequests.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, venue, style..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-cream-200 focus:outline-none focus:border-gold-400"
            />
          </div>
        </div>

        {/* TAB 1: CONFIRMED BOOKINGS */}
        {activeTab === 'BOOKINGS' && (
          <div>
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-burgundy-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-charcoal-500">Retrieving your private bookings from backend...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 shadow-sm space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-cream-100 text-gold-700 flex items-center justify-center mx-auto">
                  <Calendar className="w-7 h-7" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  No Active Bookings Yet
                </h3>
                <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                  You don&apos;t have any confirmed celebration bookings under this account. If you recently submitted an intake request, click the <strong>Submitted Event Requests</strong> tab above to view its live status!
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab('REQUESTS')}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-cream-100 text-burgundy-900 hover:bg-cream-200 transition-colors"
                  >
                    View Submitted Requests ({requests.length})
                  </button>
                  <Link
                    href="/plan-event"
                    className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm"
                  >
                    Plan Event
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBookings.map((bk) => {
                  const depositDue = bk.depositAmount || (bk.totalAmount ? bk.totalAmount * 0.5 : 50000);
                  const balanceDue = bk.balanceAmount || (bk.totalAmount ? bk.totalAmount - depositDue : 50000);
                  const isFullyPaid = bk.balancePaid;
                  const hasDeposit = bk.depositPaid;

                  return (
                    <div
                      key={bk.id || bk.bookingNumber}
                      className="bg-white rounded-3xl border border-cream-200 hover:border-gold-400/60 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col justify-between space-y-6 relative overflow-hidden"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="font-mono text-xs font-bold text-burgundy-900 bg-burgundy-50 px-2.5 py-1 rounded-lg border border-burgundy-100">
                            {bk.bookingNumber}
                          </span>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              isFullyPaid
                                ? 'bg-botanical-100 text-botanical-800 border-botanical-300'
                                : hasDeposit
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-cream-100 text-charcoal-700 border-cream-300'
                            }`}
                          >
                            {isFullyPaid
                              ? '✓ Fully Paid & Locked'
                              : hasDeposit
                              ? 'Deposit Paid • Design Phase'
                              : 'Deposit Pending'}
                          </span>
                        </div>

                        <h3 className="font-editorial text-xl sm:text-2xl font-bold text-charcoal-900 leading-snug">
                          {bk.eventTitle}
                        </h3>

                        {/* Specs grid */}
                        <div className="grid grid-cols-2 gap-3 mt-4 text-xs p-3 rounded-2xl bg-cream-50 border border-cream-200">
                          <div className="flex items-center gap-2 text-charcoal-700">
                            <Calendar className="w-3.5 h-3.5 text-burgundy-900 shrink-0" />
                            <span className="truncate">{bk.eventDate || 'Date Reserved'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-charcoal-700">
                            <MapPin className="w-3.5 h-3.5 text-burgundy-900 shrink-0" />
                            <span className="truncate">{bk.venueName || 'Venue Staging'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-charcoal-700">
                            <Users className="w-3.5 h-3.5 text-burgundy-900 shrink-0" />
                            <span>{bk.guestCount || 200} Guests</span>
                          </div>
                          <div className="flex items-center gap-2 text-charcoal-700">
                            <Sparkles className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                            <span className="truncate">{bk.decorationStyle || 'Luxury'}</span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="text-charcoal-500 font-medium">Production Progress</span>
                            <span className="font-bold text-burgundy-900">{bk.progress || (hasDeposit ? 75 : 30)}%</span>
                          </div>
                          <div className="h-2 w-full bg-cream-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-burgundy-800 to-gold-500 rounded-full transition-all duration-500"
                              style={{ width: `${bk.progress || (hasDeposit ? 75 : 30)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Financial & CTAs */}
                      <div className="pt-4 border-t border-cream-200">
                        <div className="flex items-baseline justify-between mb-3 text-xs">
                          <div>
                            <span className="text-[11px] text-charcoal-500 block">Total Plan Investment</span>
                            <span className="font-bold text-charcoal-900 font-mono text-base">
                              {formatCurrency(bk.totalAmount || depositDue + balanceDue, bk.currency || 'ETB')}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[11px] text-charcoal-500 block">
                              {isFullyPaid ? 'Balance Settled' : hasDeposit ? 'Remaining Balance' : '50% Deposit Due'}
                            </span>
                            <span className="font-bold text-sm font-mono text-burgundy-900">
                              {isFullyPaid
                                ? 'ETB 0.00'
                                : hasDeposit
                                ? formatCurrency(balanceDue, bk.currency || 'ETB')
                                : formatCurrency(depositDue, bk.currency || 'ETB')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/bookings/${bk.id}`}
                            className="flex-1 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-center bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span>View Event Plan & Pay</span>
                            <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                          </Link>

                          <Link
                            href={`/quotes/${bk.quoteId}`}
                            target="_blank"
                            className="p-3 rounded-full border border-cream-300 text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                            title="View Linked Quote"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SUBMITTED EVENT REQUESTS */}
        {activeTab === 'REQUESTS' && (
          <div>
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-2 border-burgundy-900 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-charcoal-500">Retrieving your submitted celebration requests...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 shadow-sm space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-cream-100 text-gold-700 flex items-center justify-center mx-auto">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  No Submitted Requests
                </h3>
                <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                  You haven&apos;t submitted any event intake requests yet. Use our interactive celebration planner to design your event and receive a tailored quotation.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <Link
                    href="/plan-event"
                    className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm"
                  >
                    Start Event Intake
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((req) => {
                  const matchingQuote = quotes.find(
                    (q) =>
                      (q.customerEmail && req.guestEmail && q.customerEmail.toLowerCase() === req.guestEmail.toLowerCase()) ||
                      (q.customerName && req.guestName && q.customerName.toLowerCase() === req.guestName.toLowerCase())
                  );

                  return (
                    <div
                      key={req.id || req.requestNumber}
                      className="bg-white rounded-3xl border border-cream-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-burgundy-900 bg-burgundy-50 px-3 py-1 rounded-lg border border-burgundy-200">
                            {req.requestNumber}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              req.status === 'QUOTE_CREATED'
                                ? 'bg-botanical-100 text-botanical-800 border border-botanical-300'
                                : req.status === 'REVIEWED'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}
                          >
                            {req.status === 'QUOTE_CREATED'
                              ? '✓ Official Quotation Prepared'
                              : req.status === 'REVIEWED'
                              ? 'Feasibility Reviewed'
                              : 'Under Atelier Review'}
                          </span>
                        </div>

                        <span className="text-[11px] text-charcoal-400 font-mono">
                          Submitted on {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                            {req.guestName}&apos;s {req.eventType} Celebration
                          </h3>
                          <p className="text-xs text-charcoal-500 font-light mt-0.5">
                            {req.guestCount} Guests &bull; {req.venueName || req.venueType} &bull; Preference: <strong className="text-burgundy-900 font-semibold">{req.stylePreference}</strong>
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-[10px] text-charcoal-400 uppercase tracking-wider block">Estimated Budget</span>
                          <span className="font-semibold text-charcoal-900 text-sm">{req.budgetRange}</span>
                        </div>
                      </div>

                      {/* Requested Services */}
                      {req.selectedServices && req.selectedServices.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {req.selectedServices.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-full text-[11px] bg-cream-100 text-charcoal-700 font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* If Quote Created: Action Card */}
                      {req.status === 'QUOTE_CREATED' ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-botanical-50 to-cream-50 border border-botanical-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                          <div>
                            <span className="text-xs font-bold text-botanical-900 uppercase tracking-wider block">
                              Your Quotation Is Ready!
                            </span>
                            <p className="text-[11px] text-botanical-800 font-light mt-0.5">
                              Our lead designer Mekdes has prepared your itemized decoration scope. You can review and authorize your 50% deposit online.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {matchingQuote && (
                              <Link
                                href={`/quotes/${matchingQuote.id}`}
                                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm inline-flex items-center gap-1.5"
                              >
                                <span>Review & Pay Deposit</span>
                                <ArrowRight className="w-3.5 h-3.5 text-gold-400" />
                              </Link>
                            )}

                            <a
                              href="tel:+251911234567"
                              className="px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:bg-cream-100 transition-colors"
                            >
                              Call Concierge
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs text-charcoal-600 flex items-center justify-between">
                          <span>
                            Status: Our team is evaluating venue dimensions and flower availability. We typically reply within 24 hours.
                          </span>
                          <a href="tel:+251911234567" className="font-semibold text-burgundy-900 hover:underline shrink-0 pl-2">
                            Need Urgent Booking?
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerBookingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-cream-50 py-24 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-burgundy-900 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CustomerBookingsContent />
    </React.Suspense>
  );
}

