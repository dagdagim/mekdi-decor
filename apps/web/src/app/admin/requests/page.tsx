'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { INITIAL_REQUESTS } from '@/lib/data/mock-db';
import { EventRequestPayload } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Calendar,
  Users,
  Building2,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  FileText,
  Filter,
  Trash2,
  Search,
  Check,
  X,
  Plus,
  Copy,
  ExternalLink,
  Send,
  Share2,
} from 'lucide-react';

interface GeneratedQuoteNotice {
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  discountAmount?: number;
  depositPercentage: number;
  depositAmount: number;
  emailSent: boolean;
  paymentUrl: string;
}

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<EventRequestPayload[]>(INITIAL_REQUESTS);
  const [selectedReq, setSelectedReq] = useState<EventRequestPayload | null>(INITIAL_REQUESTS[0]);
  const [quotesList, setQuotesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Convert to Quote Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Quote Form State
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteCustomerEmail, setQuoteCustomerEmail] = useState('');
  const [quoteCustomerPhone, setQuoteCustomerPhone] = useState('');
  const [quoteDepositPct, setQuoteDepositPct] = useState(50);
  const [transportCost, setTransportCost] = useState(10000);
  const [quoteDiscountAmount, setQuoteDiscountAmount] = useState(0);
  const [quoteItems, setQuoteItems] = useState([
    { title: 'Decoration Package', desc: 'Luxury venue styling & drapery', qty: 1, unitPrice: 120000 },
    { title: 'Stage Decoration', desc: 'Custom botanical backdrop & illumination', qty: 1, unitPrice: 35000 },
    { title: 'Centerpieces & Florals', desc: 'Artisanal tablescape arrangements', qty: 1, unitPrice: 25000 },
  ]);

  // Success Notice & Copy states
  const [generatedQuoteNotice, setGeneratedQuoteNotice] = useState<GeneratedQuoteNotice | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendBanner, setResendBanner] = useState<string | null>(null);

  useEffect(() => {
    fetchRequestsAndQuotes();
  }, []);

  const fetchRequestsAndQuotes = async () => {
    try {
      setLoading(true);
      const [reqRes, quoteRes] = await Promise.all([
        fetch('/api/event-requests'),
        fetch('/api/quotes'),
      ]);
      const reqData = await reqRes.json();
      const quoteData = await quoteRes.json();

      if (reqData.success && Array.isArray(reqData.data) && reqData.data.length > 0) {
        setRequests(reqData.data);
        if (!selectedReq) setSelectedReq(reqData.data[0]);
      }
      if (quoteData.success && Array.isArray(quoteData.data)) {
        setQuotesList(quoteData.data);
      }
    } catch (e) {
      console.warn('Fallback to local requests & quotes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (req: EventRequestPayload, newStatus: any) => {
    try {
      const res = await fetch('/api/event-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: req.id, requestNumber: req.requestNumber, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests(
          requests.map((r) => (r.id === req.id || r.requestNumber === req.requestNumber ? { ...r, status: newStatus } : r))
        );
        if (selectedReq && (selectedReq.id === req.id || selectedReq.requestNumber === req.requestNumber)) {
          setSelectedReq({ ...selectedReq, status: newStatus });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/event-requests?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        const nextList = requests.filter((r) => r.id !== id && r.requestNumber !== id);
        setRequests(nextList);
        setDeleteConfirmId(null);
        if (selectedReq?.id === id) {
          setSelectedReq(nextList[0] || null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenConvertToQuote = () => {
    if (!selectedReq) return;
    setQuoteTitle(`${selectedReq.guestName}'s ${selectedReq.eventType} Decoration`);
    setQuoteCustomerEmail(selectedReq.guestEmail || '');
    setQuoteCustomerPhone(selectedReq.guestPhone || '');
    setQuoteDepositPct(50);
    setTransportCost(10000);
    setQuoteDiscountAmount(0);
    setIsQuoteModalOpen(true);
  };

  const handleSaveQuoteFromLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    try {
      setQuoteSubmitting(true);
      const subtotal = quoteItems.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
      const totalAmount = Math.max(0, subtotal + Number(transportCost) - Number(quoteDiscountAmount));

      const targetEmail = quoteCustomerEmail.trim() || selectedReq.guestEmail;
      const targetPhone = quoteCustomerPhone.trim() || selectedReq.guestPhone;

      const quotePayload = {
        customerName: selectedReq.guestName,
        customerEmail: targetEmail,
        customerPhone: targetPhone,
        eventTitle: quoteTitle,
        eventType: selectedReq.eventType,
        eventDate: selectedReq.eventDate,
        venueName: selectedReq.venueName || selectedReq.venueType,
        guestCount: Number(selectedReq.guestCount) || 150,
        decorationStyle: selectedReq.stylePreference || 'Luxury',
        title: `${quoteTitle} — Formal Proposal`,
        status: 'SENT',
        depositPercentage: quoteDepositPct,
        subtotal,
        transportCost: Number(transportCost),
        installationCost: 0,
        discountAmount: Number(quoteDiscountAmount),
        totalAmount,
        items: quoteItems.map((it, idx) => ({
          itemTitle: it.title,
          itemDescription: it.desc,
          quantity: it.qty,
          unitPrice: it.unitPrice,
          subtotal: it.qty * it.unitPrice,
          displayOrder: idx + 1,
        })),
      };

      const quoteRes = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload),
      });

      const quoteData = await quoteRes.json();
      if (quoteData.success) {
        // Update request status in database & local state to QUOTE_CREATED
        await handleUpdateStatus(selectedReq, 'QUOTE_CREATED');
        setIsQuoteModalOpen(false);
        setQuoteSubmitting(false);

        // Add to local quotes list
        if (quoteData.data) {
          setQuotesList((prev) => [quoteData.data, ...prev]);
        }

        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3002';
        const paymentUrl = `${origin}/quotes/${quoteData.data.id}`;

        // DO NOT REDIRECT ADMIN to /quotes/[id]!
        // Admin stays in the dashboard and receives an official dispatch confirmation modal.
        setGeneratedQuoteNotice({
          quoteId: quoteData.data.id,
          quoteNumber: quoteData.data.quoteNumber,
          customerName: quotePayload.customerName,
          customerEmail: targetEmail,
          totalAmount: quoteData.data.totalAmount,
          discountAmount: Number(quoteDiscountAmount),
          depositPercentage: quoteDepositPct,
          depositAmount: (quoteData.data.totalAmount * quoteDepositPct) / 100,
          emailSent: quoteData.emailSent ?? true,
          paymentUrl,
        });
      } else {
        alert(quoteData.error || 'Failed to create quote');
        setQuoteSubmitting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error converting lead to quote');
      setQuoteSubmitting(false);
    }
  };

  const handleResendPaymentEmail = async (quoteId?: string, email?: string) => {
    try {
      setResendingEmail(true);
      setResendBanner(null);
      const targetEmail = email || selectedReq?.guestEmail;
      const res = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, toEmail: targetEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setResendBanner(`Official proposal and payment invoice dispatched to ${targetEmail}`);
        setTimeout(() => setResendBanner(null), 6000);
      } else {
        alert(data.error || 'Failed to deliver quote email');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending email');
    } finally {
      setResendingEmail(false);
    }
  };

  // Find matching quote for selected lead
  const matchingQuote = quotesList.find(
    (q) =>
      (q.customerEmail && selectedReq?.guestEmail && q.customerEmail.toLowerCase() === selectedReq.guestEmail.toLowerCase()) ||
      (q.customerName && selectedReq?.guestName && q.customerName.toLowerCase() === selectedReq.guestName.toLowerCase())
  );
  const currentQuotePaymentUrl = matchingQuote && typeof window !== 'undefined'
    ? `${window.location.origin}/quotes/${matchingQuote.id}`
    : null;

  // Filtered
  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      r.guestName.toLowerCase().includes(query) ||
      r.guestEmail.toLowerCase().includes(query) ||
      (r.requestNumber && r.requestNumber.toLowerCase().includes(query)) ||
      (r.venueName && r.venueName.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Resend notification alert */}
      {resendBanner && (
        <div className="p-4 rounded-2xl bg-botanical-50 border border-botanical-300 text-botanical-900 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-medium">
            <CheckCircle2 className="w-5 h-5 text-botanical-700 shrink-0" />
            <span>{resendBanner}</span>
          </div>
          <button
            onClick={() => setResendBanner(null)}
            className="p-1 text-botanical-700 hover:text-botanical-900 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Event Requests & Client Intake Leads
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Review submissions from the interactive event planner, generate official quotations, and dispatch direct payment links to customers.
          </p>
        </div>

        <Link
          href="/plan-event"
          target="_blank"
          className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors inline-flex items-center gap-1.5 self-start shadow-sm"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Test Intake Planner</span>
        </Link>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-cream-200 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'NEW', 'REVIEWED', 'QUOTE_CREATED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-burgundy-900 text-cream-50 shadow-sm'
                  : 'bg-cream-100 text-charcoal-700 hover:bg-cream-200'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st === 'QUOTE_CREATED' ? 'Quote Generated (Sent to Pay)' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads, emails, venues..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-cream-50 border border-cream-200 focus:outline-none focus:border-gold-400"
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Requests List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((req) => {
            const isSelected = selectedReq?.id === req.id || selectedReq?.requestNumber === req.requestNumber;
            return (
              <div
                key={req.id || req.requestNumber}
                onClick={() => setSelectedReq(req)}
                className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-burgundy-900 shadow-md ring-2 ring-gold-400/30'
                    : 'bg-white border-cream-200 hover:border-gold-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-charcoal-400 font-bold">
                    {req.requestNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                      req.status === 'QUOTE_CREATED'
                        ? 'bg-botanical-100 text-botanical-800 border border-botanical-300'
                        : req.status === 'REVIEWED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {req.status === 'QUOTE_CREATED' ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Quote Sent to Pay</span>
                      </>
                    ) : req.status === 'REVIEWED' ? (
                      'Reviewed'
                    ) : (
                      'New Lead'
                    )}
                  </span>
                </div>

                <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                  {req.guestName}
                </h3>

                <p className="text-xs text-charcoal-600 mt-0.5">
                  {req.eventType} • {req.guestCount} Guests • {req.eventDate}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-cream-100">
                  <span className="truncate max-w-[150px]">{req.venueName || req.venueType}</span>
                  <span className="font-semibold text-burgundy-900">{req.budgetRange}</span>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-cream-200 text-xs text-charcoal-400">
              No matching requests found.
            </div>
          )}
        </div>

        {/* Request Details View (7 cols) */}
        <div className="lg:col-span-7">
          {selectedReq ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
              {/* Header inside details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-cream-200 gap-3">
                <div>
                  <span className="font-mono text-xs text-charcoal-400 font-semibold block">
                    {selectedReq.requestNumber}
                  </span>
                  <h2 className="font-editorial text-2xl font-bold text-charcoal-900">
                    {selectedReq.guestName}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedReq.status || 'NEW'}
                    onChange={(e) => handleUpdateStatus(selectedReq, e.target.value)}
                    className="text-xs font-semibold rounded-full px-3 py-1.5 border border-cream-300 bg-cream-50 focus:outline-none"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="QUOTE_CREATED">Quote Created</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>

                  <button
                    onClick={() => setDeleteConfirmId(selectedReq.id || selectedReq.requestNumber || '')}
                    className="p-2 rounded-xl text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quote Created & Dispatched Status Banner */}
              {selectedReq.status === 'QUOTE_CREATED' && (
                <div className="p-4 rounded-2xl bg-botanical-50/80 border border-botanical-300 text-botanical-950 space-y-3 shadow-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-botanical-700 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-bold text-xs uppercase tracking-wider text-botanical-900">
                          Official Quotation Dispatched to Client
                        </div>
                        <p className="text-[11px] text-botanical-800 mt-0.5 font-light">
                          Proposal with 50% deposit payment instructions (Telebirr / Chapa / CBE Birr) was dispatched to <strong className="font-semibold">{selectedReq.guestEmail}</strong>.
                        </p>
                        {matchingQuote && (
                          <div className="mt-2 text-xs font-mono text-botanical-900 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Quote Ref: <strong>{matchingQuote.quoteNumber}</strong></span>
                            <span>Total: <strong>{formatCurrency(matchingQuote.totalAmount, 'ETB')}</strong></span>
                            <span>50% Deposit: <strong>{formatCurrency((matchingQuote.totalAmount * (matchingQuote.depositPercentage || 50)) / 100, 'ETB')}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Tools for Admin */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-botanical-200">
                    <button
                      type="button"
                      onClick={() => handleResendPaymentEmail(matchingQuote?.id, selectedReq.guestEmail)}
                      disabled={resendingEmail}
                      className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-botanical-300 text-botanical-800 hover:bg-botanical-100 transition-colors shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-botanical-700" />
                      <span>{resendingEmail ? 'Sending...' : 'Resend Payment Link Email'}</span>
                    </button>

                    {currentQuotePaymentUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(currentQuotePaymentUrl);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 3000);
                          }}
                          className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-botanical-300 text-botanical-800 hover:bg-botanical-100 transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-botanical-700" /> : <Copy className="w-3 h-3 text-botanical-700" />}
                          <span>{copiedLink ? 'Copied!' : 'Copy Payment URL'}</span>
                        </button>

                        <a
                          href={currentQuotePaymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-full text-[11px] font-semibold bg-white border border-botanical-300 text-botanical-800 hover:bg-botanical-100 transition-colors shadow-2xs flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3 h-3 text-gold-600" />
                          <span>Preview Customer Portal ↗</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href={`tel:${selectedReq.guestPhone}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 text-charcoal-700 hover:bg-cream-200"
                >
                  <Phone className="w-3.5 h-3.5 text-burgundy-900" />
                  <span>{selectedReq.guestPhone}</span>
                </a>
                <a
                  href={`mailto:${selectedReq.guestEmail}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 text-charcoal-700 hover:bg-cream-200"
                >
                  <Mail className="w-3.5 h-3.5 text-burgundy-900" />
                  <span>{selectedReq.guestEmail}</span>
                </a>
              </div>

              {/* Event Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-cream-50 border border-cream-200 text-xs">
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Event Type</span>
                  <span className="font-semibold text-charcoal-900">{selectedReq.eventType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Date</span>
                  <span className="font-semibold text-charcoal-900">{selectedReq.eventDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Guest Count</span>
                  <span className="font-semibold text-charcoal-900">{selectedReq.guestCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Venue</span>
                  <span className="font-semibold text-charcoal-900">{selectedReq.venueName || selectedReq.venueType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Aesthetic Style</span>
                  <span className="font-semibold text-burgundy-900">{selectedReq.stylePreference}</span>
                </div>
                <div>
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold block">Budget Range</span>
                  <span className="font-semibold text-charcoal-900">{selectedReq.budgetRange}</span>
                </div>
              </div>

              {/* Selected Services */}
              <div>
                <h4 className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  Requested Services ({selectedReq.selectedServices?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedReq.selectedServices || []).map((srv, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs bg-cream-100 border border-cream-200 text-charcoal-800 font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Notes */}
              {selectedReq.specialNotes && (
                <div>
                  <h4 className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    Client Special Notes
                  </h4>
                  <p className="text-xs text-charcoal-700 italic bg-cream-50 p-4 rounded-2xl border border-cream-200 leading-relaxed font-light">
                    &ldquo;{selectedReq.specialNotes}&rdquo;
                  </p>
                </div>
              )}

              {/* CTAs */}
              <div className="pt-4 border-t border-cream-200 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleOpenConvertToQuote}
                  className="w-full sm:flex-1 py-3.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors text-center shadow-md flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4 text-gold-400" />
                  <span>
                    {selectedReq.status === 'QUOTE_CREATED'
                      ? 'Generate Revised / New Quote'
                      : 'Convert Lead to Official Quote'}
                  </span>
                </button>

                {selectedReq.status === 'QUOTE_CREATED' && (
                  <button
                    onClick={() => handleResendPaymentEmail(matchingQuote?.id, selectedReq.guestEmail)}
                    disabled={resendingEmail}
                    className="w-full sm:w-auto px-5 py-3.5 rounded-full text-xs font-semibold tracking-wider text-botanical-800 bg-botanical-100 hover:bg-botanical-200 transition-colors text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-botanical-700" />
                    <span>{resendingEmail ? 'Sending...' : 'Resend Payment Link'}</span>
                  </button>
                )}

                <a
                  href={`tel:${selectedReq.guestPhone}`}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs font-semibold tracking-wider text-charcoal-700 bg-cream-100 hover:bg-cream-200 transition-colors text-center"
                >
                  Call Client
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-charcoal-400 border border-cream-200">
              Select an event request from the list to view specifications.
            </div>
          )}
        </div>
      </div>

      {/* CONVERT TO QUOTE MODAL */}
      {isQuoteModalOpen && selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-gold-400 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  Generate Quotation & Dispatch Payment Invoice
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Pre-populated for {selectedReq.guestName} ({selectedReq.eventType} on {selectedReq.eventDate}).
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuoteFromLead} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Quote Title</label>
                <input
                  type="text"
                  required
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                />
              </div>

              {/* Recipient Details & Payment Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-cream-50 border border-cream-200">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Client Email (Payment Link Recipient) *
                  </label>
                  <input
                    type="email"
                    required
                    value={quoteCustomerEmail}
                    onChange={(e) => setQuoteCustomerEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    Customer will receive this quote with direct Telebirr / Chapa / CBE Birr deposit link.
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="text"
                    value={quoteCustomerPhone}
                    onChange={(e) => setQuoteCustomerPhone(e.target.value)}
                    placeholder="+251 9..."
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono text-xs focus:outline-none"
                  />
                  <span className="text-[10px] text-charcoal-400 mt-1 block">
                    Used for concierge follow-up & booking verification.
                  </span>
                </div>
              </div>

              {/* Line items list */}
              <div>
                <span className="font-semibold text-charcoal-700 uppercase tracking-wider text-[11px] block mb-2">
                  Line Items ({quoteItems.length})
                </span>
                <div className="space-y-2">
                  {quoteItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-charcoal-900 block">{item.title}</span>
                        <span className="text-[11px] text-charcoal-500">{item.desc}</span>
                      </div>
                      <span className="font-mono font-bold text-burgundy-900">
                        {formatCurrency(item.qty * item.unitPrice, 'ETB')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-cream-100 border border-cream-200">
                <div>
                  <label className="block text-charcoal-600 mb-1 text-[11px] font-semibold">Transport & Logistics (ETB)</label>
                  <input
                    type="number"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-cream-300 bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-600 mb-1 text-[11px] font-semibold">Special Discount (ETB)</label>
                  <input
                    type="number"
                    min="0"
                    value={quoteDiscountAmount}
                    onChange={(e) => setQuoteDiscountAmount(Math.max(0, Number(e.target.value)))}
                    placeholder="0"
                    className="w-full px-3 py-1.5 rounded-lg border border-cream-300 bg-white font-mono text-xs text-green-700 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-600 mb-1 text-[11px] font-semibold">Deposit Percentage (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={quoteDepositPct}
                    onChange={(e) => setQuoteDepositPct(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-cream-300 bg-white font-mono text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Calculation Breakdown */}
              {(() => {
                const sub = quoteItems.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
                const grand = Math.max(0, sub + Number(transportCost) - Number(quoteDiscountAmount));
                const deposit = (grand * quoteDepositPct) / 100;
                return (
                  <div className="p-3.5 rounded-2xl bg-white border border-cream-300 space-y-2 text-xs">
                    <div className="flex justify-between text-charcoal-600">
                      <span>Subtotal ({quoteItems.length} items):</span>
                      <span className="font-mono">{formatCurrency(sub, 'ETB')}</span>
                    </div>
                    <div className="flex justify-between text-charcoal-600">
                      <span>Transport & Logistics:</span>
                      <span className="font-mono">+{formatCurrency(transportCost, 'ETB')}</span>
                    </div>
                    {quoteDiscountAmount > 0 && (
                      <div className="flex justify-between text-green-700 font-semibold">
                        <span>VIP Discount Deducted:</span>
                        <span className="font-mono">-{formatCurrency(quoteDiscountAmount, 'ETB')}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-cream-200 flex justify-between items-center">
                      <span className="font-bold text-charcoal-900">Grand Total Amount:</span>
                      <span className="font-mono font-bold text-base text-burgundy-950">
                        {formatCurrency(grand, 'ETB')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gold-900 font-semibold bg-gold-50/70 p-2 rounded-xl border border-gold-200">
                      <span>{quoteDepositPct}% Required Deposit:</span>
                      <span className="font-mono font-bold">{formatCurrency(deposit, 'ETB')}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 text-gold-400" />
                  <span>
                    {quoteSubmitting ? 'Generating & Dispatching...' : 'Generate Quote & Send to Pay'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTE GENERATED & SENT SUCCESS MODAL */}
      {generatedQuoteNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-2 border-gold-400 shadow-2xl space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-botanical-100 border-2 border-botanical-500 text-botanical-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <span className="text-[11px] uppercase tracking-widest text-gold-700 font-bold block mb-1">
                Official Quote Dispatched
              </span>
              <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                Sent to Customer to Pay!
              </h3>
              <p className="text-xs text-charcoal-600 mt-1 font-light max-w-sm mx-auto">
                An itemized proposal with direct 50% deposit payment checkout has been emailed to the client. You remain in the admin dashboard to continue processing leads.
              </p>
            </div>

            {/* Quote details badge box */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-charcoal-500 font-medium">Quote Reference:</span>
                <span className="font-mono font-bold text-burgundy-900">{generatedQuoteNotice.quoteNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-charcoal-500 font-medium">Client Recipient:</span>
                <span className="font-semibold text-charcoal-900 truncate max-w-[200px]" title={generatedQuoteNotice.customerEmail}>
                  {generatedQuoteNotice.customerEmail}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-charcoal-500 font-medium">Total Investment:</span>
                <span className="font-bold text-charcoal-900">{formatCurrency(generatedQuoteNotice.totalAmount, 'ETB')}</span>
              </div>
              {generatedQuoteNotice.discountAmount ? (
                <div className="flex justify-between items-center pb-2 border-b border-cream-200 text-green-700">
                  <span className="font-medium">VIP Discount Deducted:</span>
                  <span className="font-bold font-mono">-{formatCurrency(generatedQuoteNotice.discountAmount, 'ETB')}</span>
                </div>
              ) : null}
              <div className="flex justify-between items-center pb-2 border-b border-cream-200">
                <span className="text-burgundy-900 font-bold">Required Deposit Due:</span>
                <span className="font-mono font-bold text-sm text-burgundy-900">
                  {formatCurrency(generatedQuoteNotice.depositAmount, 'ETB')}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px]">
                <span className="text-charcoal-500">Email Delivery:</span>
                <span className="font-semibold text-botanical-700 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Dispatched via Gmail SMTP</span>
                </span>
              </div>
            </div>

            {/* Admin Action Buttons */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedQuoteNotice.paymentUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 3000);
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-semibold bg-cream-100 text-charcoal-800 hover:bg-cream-200 transition-colors flex items-center justify-center gap-2 border border-cream-300"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-botanical-600" /> : <Copy className="w-4 h-4 text-charcoal-600" />}
                  <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Customer Payment Link'}</span>
                </button>

                <a
                  href={generatedQuoteNotice.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-3 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:bg-cream-50 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  title="Preview Customer Proposal in New Tab"
                >
                  <ExternalLink className="w-4 h-4 text-gold-600" />
                  <span>Preview Tab</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setGeneratedQuoteNotice(null)}
                className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors text-center shadow-md"
              >
                Continue Processing Customer Leads
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-red-300 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-700 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-editorial text-xl font-bold text-charcoal-900">Delete Request?</h3>
            <p className="text-xs text-charcoal-500 font-light">
              This will remove this client intake lead permanently.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 rounded-full text-xs font-medium text-charcoal-700 bg-cream-100 hover:bg-cream-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-full text-xs font-semibold bg-red-700 text-white hover:bg-red-800"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
