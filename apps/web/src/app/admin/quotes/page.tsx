'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { INITIAL_QUOTES } from '@/lib/data/mock-db';
import { Quote, QuoteItem, QuoteStatus, EventType, DecorationStyle } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Calendar,
  Layers,
  Sparkles,
  Send,
  Copy,
  Check,
  Percent,
  Tag,
} from 'lucide-react';

const STANDARD_ITEMS = [
  { title: 'Decoration Package', desc: 'Comprehensive luxury venue transformation, chair covers, and linens', price: 120000 },
  { title: 'Stage Decoration', desc: 'Custom 10-meter white and champagne backdrop with crystal chandelier fixtures', price: 35000 },
  { title: 'Flowers & Centerpieces', desc: 'Fresh imported and local garden roses, hydrangeas, and tall floral urns (25 tables)', price: 25000 },
  { title: 'Architectural Lighting', desc: 'Amber perimeter uplighting, spotlighting for cake and stage, warm fairy tunnel', price: 15000 },
  { title: 'Transport & Installation', desc: 'Dedicated logistics, 8-person crew installation and breakdown', price: 10000 },
];

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>(INITIAL_QUOTES);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Quick Discount Edit Modal State
  const [discountEditQuote, setDiscountEditQuote] = useState<Quote | null>(null);
  const [editDiscountValue, setEditDiscountValue] = useState(0);
  const [discountUpdating, setDiscountUpdating] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('Wedding');
  const [eventDate, setEventDate] = useState('2026-12-18');
  const [venueName, setVenueName] = useState('');
  const [guestCount, setGuestCount] = useState(250);
  const [transportCost, setTransportCost] = useState(10000);
  const [installationCost, setInstallationCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositPercentage, setDepositPercentage] = useState(50);
  const [validityDate, setValidityDate] = useState('2026-11-30');

  const [items, setItems] = useState<Array<{ title: string; desc: string; qty: number; unitPrice: number }>>([
    { title: 'Decoration Package', desc: 'Comprehensive luxury venue transformation', qty: 1, unitPrice: 120000 },
    { title: 'Stage Decoration', desc: 'Custom backdrop with floral fixtures', qty: 1, unitPrice: 35000 },
    { title: 'Flowers & Centerpieces', desc: 'Fresh garden roses and high urns', qty: 1, unitPrice: 25000 },
  ]);

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quotes');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setQuotes(data.data);
      }
    } catch (e) {
      console.warn('Fallback to local quotes:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCustomerName('Sara Tekle');
    setCustomerEmail('sara.t@example.com');
    setCustomerPhone('+251 922 334 455');
    setEventTitle("Sara's Lakeside Wedding");
    setEventType('Wedding');
    setEventDate('2026-12-18');
    setVenueName('Skyline Event Hall, Hawassa');
    setGuestCount(300);
    setTransportCost(10000);
    setInstallationCost(0);
    setDiscountAmount(0);
    setDepositPercentage(50);
    setValidityDate('2026-11-30');
    setItems([
      { title: 'Decoration Package', desc: 'Comprehensive luxury venue transformation, chair covers, and linens', qty: 1, unitPrice: 120000 },
      { title: 'Stage Decoration', desc: 'Custom 10-meter white and champagne backdrop with fixtures', qty: 1, unitPrice: 35000 },
      { title: 'Flowers & Centerpieces', desc: 'Fresh garden roses, hydrangeas and high floral urns', qty: 1, unitPrice: 25000 },
      { title: 'Lighting', desc: 'Amber perimeter uplighting, spotlighting for cake and stage', qty: 1, unitPrice: 15000 },
    ]);
    setIsModalOpen(true);
  };

  const addItem = (title: string, desc: string, unitPrice: number) => {
    setItems([...items, { title, desc, qty: 1, unitPrice }]);
  };

  const updateItem = (index: number, field: string, val: any) => {
    const updated = [...items];
    (updated[index] as any)[field] = val;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (Number(it.qty) || 1) * (Number(it.unitPrice) || 0), 0);
  const totalAmount = Math.max(0, subtotal + Number(transportCost) + Number(installationCost) - Number(discountAmount));
  const depositAmount = (totalAmount * Number(depositPercentage)) / 100;

  const handleSaveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !eventTitle) {
      alert('Please fill out customer name and event title.');
      return;
    }

    try {
      setSaveStatus('Creating commercial quote...');
      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        eventTitle,
        eventType,
        eventDate,
        venueName,
        guestCount,
        title: `${eventTitle} — Formal Proposal`,
        validityDate,
        depositPercentage,
        subtotal,
        transportCost,
        installationCost,
        discountAmount,
        totalAmount,
        items: items.map((it, idx) => ({
          itemTitle: it.title,
          itemDescription: it.desc,
          quantity: it.qty,
          unitPrice: it.unitPrice,
          subtotal: it.qty * it.unitPrice,
          displayOrder: idx + 1,
        })),
      };

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setQuotes([result.data, ...quotes]);
        setIsModalOpen(false);
        setSaveStatus(null);
        setNotification(
          result.emailSent
            ? `Quote ${result.data.quoteNumber} created and official payment link dispatched to ${customerEmail}!`
            : `Quote ${result.data.quoteNumber} created successfully.`
        );
        setTimeout(() => setNotification(null), 7000);
      } else {
        alert(result.error || 'Failed to create quote');
        setSaveStatus(null);
      }
    } catch (err: any) {
      alert(err.message || 'Error creating quote');
      setSaveStatus(null);
    }
  };

  const handleResendQuoteEmail = async (q: Quote) => {
    try {
      setSendingId(q.id);
      setNotification(null);
      const res = await fetch('/api/quotes/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: q.id, toEmail: q.customerEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification(`Quotation and payment link dispatched to ${q.customerEmail}`);
        setTimeout(() => setNotification(null), 6000);
      } else {
        alert(data.error || 'Failed to send quote email');
      }
    } catch (e: any) {
      alert(e.message || 'Error sending quote email');
    } finally {
      setSendingId(null);
    }
  };

  const handleStatusChange = async (quote: Quote, newStatus: QuoteStatus) => {
    try {
      const res = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes(quotes.map((q) => (q.id === quote.id ? { ...q, status: newStatus } : q)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/quotes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setQuotes(quotes.filter((q) => q.id !== id && q.quoteNumber !== id));
        setDeleteConfirmId(null);
      } else {
        alert(result.error || 'Failed to delete quote');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting quote');
    }
  };

  const handleOpenDiscountModal = (q: Quote) => {
    setDiscountEditQuote(q);
    setEditDiscountValue(q.discountAmount || 0);
  };

  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountEditQuote) return;

    try {
      setDiscountUpdating(true);
      const prevDiscount = Number(discountEditQuote.discountAmount) || 0;
      const subtotal = discountEditQuote.subtotal || (Number(discountEditQuote.totalAmount) + prevDiscount - Number(discountEditQuote.transportCost || 0));
      const transport = Number(discountEditQuote.transportCost) || 0;
      const newDiscount = Math.max(0, Number(editDiscountValue) || 0);
      const newTotal = Math.max(0, subtotal + transport - newDiscount);

      const res = await fetch('/api/quotes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: discountEditQuote.id,
          quoteNumber: discountEditQuote.quoteNumber,
          discountAmount: newDiscount,
          totalAmount: newTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === discountEditQuote.id
              ? { ...q, discountAmount: newDiscount, totalAmount: newTotal }
              : q
          )
        );
        setDiscountEditQuote(null);
        setNotification(
          newDiscount > 0
            ? `Special discount of ${formatCurrency(newDiscount, 'ETB')} applied to ${discountEditQuote.quoteNumber}!`
            : `Discount removed for ${discountEditQuote.quoteNumber}.`
        );
        setTimeout(() => setNotification(null), 5000);
      } else {
        alert(data.error || 'Failed to update discount');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating discount');
    } finally {
      setDiscountUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dispatch notification */}
      {notification && (
        <div className="p-4 rounded-2xl bg-botanical-50 border border-botanical-300 text-botanical-900 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-botanical-700 shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
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
            Quotations & Commercial Proposals
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Build bespoke line-item breakdowns, set transport logistics, and track customer approvals.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors inline-flex items-center gap-1.5 self-start shadow-sm"
        >
          <Plus className="w-4 h-4 text-gold-400" />
          <span>Create New Quote</span>
        </button>
      </div>

      {/* Quotes Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-charcoal-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Quote #</th>
                <th className="pb-3">Client & Event</th>
                <th className="pb-3">Event Date</th>
                <th className="pb-3">Venue</th>
                <th className="pb-3">Total Amount</th>
                <th className="pb-3">50% Deposit</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {quotes.map((q) => (
                <tr key={q.id} className="hover:bg-cream-50 transition-colors">
                  <td className="py-4 font-mono font-bold text-burgundy-900">
                    {q.quoteNumber}
                  </td>
                  <td className="py-4">
                    <span className="font-bold text-charcoal-900 block">{q.customerName}</span>
                    <span className="text-[11px] text-charcoal-500">{q.eventTitle}</span>
                  </td>
                  <td className="py-4 text-charcoal-600 whitespace-nowrap">
                    {q.eventDate}
                  </td>
                  <td className="py-4 text-charcoal-600 max-w-[160px] truncate">
                    {q.venueName}
                  </td>
                  <td className="py-4 font-bold text-charcoal-900 font-mono">
                    <div>{formatCurrency(q.totalAmount, q.currency)}</div>
                    {q.discountAmount && q.discountAmount > 0 ? (
                      <span className="inline-block text-[10px] text-green-700 font-semibold bg-green-50 px-1.5 py-0.5 rounded border border-green-200 mt-0.5">
                        -{formatCurrency(q.discountAmount, q.currency)} discount
                      </span>
                    ) : null}
                  </td>
                  <td className="py-4 font-medium text-gold-800 font-mono">
                    {formatCurrency((q.totalAmount * q.depositPercentage) / 100, q.currency)}
                  </td>
                  <td className="py-4">
                    <select
                      value={q.status}
                      onChange={(e) => handleStatusChange(q, e.target.value as QuoteStatus)}
                      className={`text-[11px] font-semibold rounded-full px-2.5 py-1 border transition-colors cursor-pointer ${
                        q.status === 'ACCEPTED'
                          ? 'bg-botanical-100 text-botanical-800 border-botanical-300'
                          : q.status === 'SENT'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-cream-100 text-charcoal-700 border-cream-300'
                      }`}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="SENT">SENT</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="REVISION_REQUESTED">REVISION</option>
                      <option value="DECLINED">DECLINED</option>
                    </select>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Adjust Discount Button */}
                      <button
                        onClick={() => handleOpenDiscountModal(q)}
                        className="p-1.5 rounded-lg text-charcoal-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                        title="Apply / Adjust Special Discount"
                      >
                        <Tag className="w-4 h-4 text-green-700" />
                      </button>

                      {q.customerEmail && (
                        <button
                          onClick={() => handleResendQuoteEmail(q)}
                          disabled={sendingId === q.id}
                          className="p-1.5 rounded-lg text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors disabled:opacity-50"
                          title={`Resend Quote & Payment Link to ${q.customerEmail}`}
                        >
                          <Send className="w-4 h-4 text-botanical-700" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/quotes/${q.id}`;
                          navigator.clipboard.writeText(url);
                          setCopiedId(q.id);
                          setTimeout(() => setCopiedId(null), 3000);
                        }}
                        className="p-1.5 rounded-lg text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                        title="Copy Customer Payment Link"
                      >
                        {copiedId === q.id ? (
                          <Check className="w-4 h-4 text-botanical-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-charcoal-500" />
                        )}
                      </button>

                      <Link
                        href={`/quotes/${q.id}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                        title="View Customer Interactive Quote (New Tab)"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setDeleteConfirmId(q.id)}
                        className="p-1.5 rounded-lg text-charcoal-400 hover:text-red-700 hover:bg-red-50 transition-colors"
                        title="Delete Quote"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTE BUILDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 border border-gold-400 shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div>
                <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                  New Commercial Quote Builder
                </h3>
                <p className="text-xs text-charcoal-500 font-light mt-0.5">
                  Generate customer-facing interactive proposal with dynamic deposit calculation.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-charcoal-400 hover:text-charcoal-800 rounded-full hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuote} className="space-y-6 text-xs">
              {/* Customer Info */}
              <div>
                <h4 className="font-semibold text-charcoal-900 mb-2 uppercase tracking-wider text-[11px]">
                  1. Client Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-charcoal-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Sara Tekle"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="sara@example.com"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Phone</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+251 911 ..."
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Event Info */}
              <div>
                <h4 className="font-semibold text-charcoal-900 mb-2 uppercase tracking-wider text-[11px]">
                  2. Event Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-charcoal-600 mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Sara & Michael's Wedding"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Venue Name</label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="Skyline Hall, Hawassa"
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-cream-50 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-charcoal-900 uppercase tracking-wider text-[11px]">
                    3. Quotation Line Items ({items.length})
                  </h4>

                  <button
                    type="button"
                    onClick={() => addItem('Bespoke Element', 'Custom decorative craft', 15000)}
                    className="text-xs font-semibold text-burgundy-900 hover:underline"
                  >
                    + Add Custom Row
                  </button>
                </div>

                <div className="space-y-2 mb-3">
                  {items.map((it, i) => (
                    <div key={i} className="p-3 rounded-2xl bg-cream-50 border border-cream-200 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                      <div className="sm:col-span-5">
                        <input
                          type="text"
                          value={it.title}
                          onChange={(e) => updateItem(i, 'title', e.target.value)}
                          placeholder="Item Title"
                          className="w-full font-semibold text-charcoal-900 bg-transparent focus:outline-none"
                        />
                        <input
                          type="text"
                          value={it.desc}
                          onChange={(e) => updateItem(i, 'desc', e.target.value)}
                          placeholder="Description / scope"
                          className="w-full text-[11px] text-charcoal-500 bg-transparent focus:outline-none mt-0.5"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-charcoal-400 block sm:hidden">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => updateItem(i, 'qty', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-cream-300 bg-white text-center font-mono"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-charcoal-400 block sm:hidden">Unit Price</label>
                        <input
                          type="number"
                          step="1000"
                          value={it.unitPrice}
                          onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-cream-300 bg-white font-mono text-right"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-center justify-between pl-2">
                        <span className="font-mono font-bold text-burgundy-900 text-xs">
                          {formatCurrency(it.qty * it.unitPrice, 'ETB')}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(i)}
                          className="p-1 text-charcoal-400 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Add Suggestions */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-charcoal-400 uppercase font-semibold">Quick add:</span>
                  {STANDARD_ITEMS.map((std, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => addItem(std.title, std.desc, std.price)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-cream-200 text-charcoal-800 hover:bg-cream-300"
                    >
                      + {std.title} ({formatCurrency(std.price, 'ETB')})
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary & Logistics */}
              <div className="p-4 rounded-2xl bg-cream-100/80 border border-cream-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-charcoal-600 mb-1">Transport & Logistics (ETB)</label>
                    <input
                      type="number"
                      value={transportCost}
                      onChange={(e) => setTransportCost(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Special Discount (ETB)</label>
                    <input
                      type="number"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono text-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-600 mb-1">Deposit Percentage (%)</label>
                    <input
                      type="number"
                      value={depositPercentage}
                      onChange={(e) => setDepositPercentage(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-cream-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-cream-300/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-charcoal-500 block">Subtotal: {formatCurrency(subtotal, 'ETB')}</span>
                    <span className="font-mono text-xs font-semibold text-gold-900">
                      Required Deposit ({depositPercentage}%): {formatCurrency(depositAmount, 'ETB')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-charcoal-500 block">Grand Total:</span>
                    <span className="font-mono text-2xl font-bold text-burgundy-950">
                      {formatCurrency(totalAmount, 'ETB')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(saveStatus)}
                  className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-gold-400" />
                  <span>{saveStatus || 'Generate Quote & Dispatch to Pay'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK DISCOUNT EDIT MODAL */}
      {discountEditQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-cream-300 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                    Apply Special Discount
                  </h3>
                  <span className="font-mono text-[11px] text-burgundy-900 font-semibold block">
                    {discountEditQuote.quoteNumber} • {discountEditQuote.customerName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDiscountEditQuote(null)}
                className="p-1 rounded-full text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiscount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Discount Amount (ETB)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={editDiscountValue}
                    onChange={(e) => setEditDiscountValue(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-cream-300 bg-white font-mono text-sm text-green-700 font-bold focus:outline-none focus:border-green-600"
                    placeholder="Enter discount in ETB"
                  />
                </div>
                <div className="text-[10px] text-charcoal-400 mt-1 flex flex-wrap gap-1 items-center">
                  <span>Presets:</span>
                  {[5000, 10000, 15000, 20000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setEditDiscountValue(preset)}
                      className="underline text-burgundy-800 hover:text-gold-700 font-medium"
                    >
                      {formatCurrency(preset, 'ETB')}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEditDiscountValue(0)}
                    className="underline text-charcoal-500 hover:text-red-700 ml-1"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Dynamic Recalculation Preview */}
              {(() => {
                const prevDisc = Number(discountEditQuote.discountAmount) || 0;
                const sub = discountEditQuote.subtotal || (Number(discountEditQuote.totalAmount) + prevDisc - Number(discountEditQuote.transportCost || 0));
                const trans = Number(discountEditQuote.transportCost) || 0;
                const newD = Math.max(0, Number(editDiscountValue) || 0);
                const grand = Math.max(0, sub + trans - newD);
                const dep = (grand * (discountEditQuote.depositPercentage || 50)) / 100;
                return (
                  <div className="p-3.5 rounded-2xl bg-cream-50 border border-cream-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-charcoal-600">
                      <span>Subtotal & Logistics:</span>
                      <span className="font-mono">{formatCurrency(sub + trans, discountEditQuote.currency)}</span>
                    </div>
                    <div className="flex justify-between text-green-700 font-semibold">
                      <span>New Discount Applied:</span>
                      <span className="font-mono">-{formatCurrency(newD, discountEditQuote.currency)}</span>
                    </div>
                    <div className="pt-2 border-t border-cream-200 flex justify-between font-bold text-charcoal-900">
                      <span>Adjusted Grand Total:</span>
                      <span className="font-mono text-sm text-burgundy-950">{formatCurrency(grand, discountEditQuote.currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gold-900">
                      <span>50% Required Deposit:</span>
                      <span className="font-mono">{formatCurrency(dep, discountEditQuote.currency)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscountEditQuote(null)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal-700 bg-cream-100 hover:bg-cream-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={discountUpdating}
                  className="px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {discountUpdating ? 'Applying...' : 'Save & Update Quote'}
                </button>
              </div>
            </form>
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
            <h3 className="font-editorial text-xl font-bold text-charcoal-900">Delete Quote?</h3>
            <p className="text-xs text-charcoal-500 font-light">
              This will permanently delete this quote record and any associated payment agreements.
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
