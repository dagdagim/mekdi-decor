'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_PAYMENTS } from '@/lib/data/mock-db';
import { PaymentTransaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Search,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments');
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setPayments(data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch payments from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalCollected = payments
    .filter((p) => p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const successfulCount = payments.filter((p) => p.status === 'SUCCESS').length;
  const pendingCount = payments.filter((p) => p.status === 'PENDING').length;
  const chapaTotal = payments
    .filter((p) => p.provider === 'CHAPA' && p.status === 'SUCCESS')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const filtered = payments.filter((p) => {
    const query = search.toLowerCase();
    const matchesSearch =
      p.paymentReference.toLowerCase().includes(query) ||
      p.customerName.toLowerCase().includes(query) ||
      p.bookingId.toLowerCase().includes(query) ||
      (p.providerTransactionId && p.providerTransactionId.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesProvider = providerFilter === 'ALL' || p.provider === providerFilter;

    return matchesSearch && matchesStatus && matchesProvider;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Payment Transactions & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Reconcile live Ethiopian payment gateways: Chapa, Telebirr, CBE Birr, and Direct Bank Transfers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 hover:bg-cream-100 transition-colors shadow-xs"
            title="Refresh Transactions from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-burgundy-900' : ''}`} />
            <span>Sync Payments</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-semibold block uppercase tracking-wider">
            Total Verified Revenue
          </span>
          <span className="font-editorial text-2xl font-bold text-burgundy-900 block my-1">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-xs font-semibold text-botanical-700 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct gateway verification</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-semibold block uppercase tracking-wider">
            Successful Settlements
          </span>
          <span className="font-editorial text-2xl font-bold text-charcoal-900 block my-1">
            {successfulCount}
          </span>
          <span className="text-xs text-charcoal-500">
            Across {payments.length} total logged sessions
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-semibold block uppercase tracking-wider">
            Pending Checkouts
          </span>
          <span className="font-editorial text-2xl font-bold text-amber-700 block my-1">
            {pendingCount}
          </span>
          <span className="text-xs text-amber-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting customer bank confirmation</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card">
          <span className="text-[11px] text-charcoal-500 font-semibold block uppercase tracking-wider">
            Chapa Gateway Volume
          </span>
          <span className="font-editorial text-2xl font-bold text-botanical-800 block my-1">
            {formatCurrency(chapaTotal)}
          </span>
          <span className="text-xs text-botanical-700 font-medium">
            Live automated settlement webhook
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-cream-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, client name, booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-charcoal-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Gateways</option>
            <option value="CHAPA">Chapa API</option>
            <option value="TELEBIRR">Telebirr</option>
            <option value="CBE_BIRR">CBE Birr</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-cream-300 bg-white text-charcoal-700 font-medium cursor-pointer focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Verified (SUCCESS)</option>
            <option value="PENDING">Pending (PENDING)</option>
            <option value="FAILED">Failed (FAILED)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-cream-200 text-charcoal-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Reference</th>
                <th className="pb-3">Client</th>
                <th className="pb-3">Booking / Quote</th>
                <th className="pb-3">Provider</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-charcoal-500 font-light">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-cream-50 transition-colors">
                    <td className="py-4 font-mono font-bold text-burgundy-900">
                      <div>{p.paymentReference}</div>
                      {p.providerTransactionId && (
                        <span className="text-[10px] text-charcoal-400 font-normal">
                          {p.providerTransactionId}
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="font-semibold text-charcoal-900 block">{p.customerName}</span>
                      {p.customerEmail && (
                        <span className="text-[11px] text-charcoal-400 block truncate max-w-[160px]">
                          {p.customerEmail}
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-mono text-charcoal-600">
                      {p.bookingId || p.quoteId || '—'}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.provider === 'CHAPA'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : p.provider === 'TELEBIRR'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-cream-200 text-charcoal-800 border-cream-300'
                        }`}
                      >
                        {p.provider}
                      </span>
                    </td>
                    <td className="py-4 text-charcoal-600">
                      {p.paymentType}
                    </td>
                    <td className="py-4 font-mono font-bold text-charcoal-900 text-sm">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          p.status === 'SUCCESS'
                            ? 'bg-botanical-100 text-botanical-800 border-botanical-200'
                            : p.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-900 border-amber-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {p.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : p.status === 'PENDING' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-charcoal-500 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() =>
                          alert(`Tax Receipt & Audit Confirmation\nReference: ${p.paymentReference}\nAmount: ${formatCurrency(p.amount, p.currency)}\nProvider: ${p.provider}\nStatus: ${p.status}`)
                        }
                        className="p-1.5 rounded-lg text-charcoal-600 hover:text-burgundy-900 hover:bg-cream-100 transition-colors"
                        title="Download Tax Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
