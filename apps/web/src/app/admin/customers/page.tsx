'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_CUSTOMERS } from '@/lib/data/mock-db';
import { CustomerCRM } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Calendar,
  CreditCard,
  FileText,
  Star,
  RefreshCw,
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerCRM[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState('');
  const [selectedCust, setSelectedCust] = useState<CustomerCRM>(INITIAL_CUSTOMERS[0]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = () => {
    setLoading(true);
    fetch('/api/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCustomers(data.data);
          setSelectedCust((prev) => {
            const stillExists = data.data.find((c: any) => c.id === prev?.id);
            return stillExists || data.data[0];
          });
        }
      })
      .catch((err) => console.warn('Could not load customers:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city && c.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
            Customer CRM & Profiles
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
            Real-time client database: {customers.length} registered accounts & event clients from live database.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-cream-300 bg-white text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
            />
          </div>

          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl bg-white border border-cream-300 text-charcoal-700 hover:text-burgundy-900 hover:bg-cream-100 transition-colors shrink-0"
            title="Refresh Customers Database"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Customer List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filtered.map((cust) => {
            const isSelected = selectedCust.id === cust.id;
            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCust(cust)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-burgundy-800 shadow-md ring-2 ring-gold-400/20'
                    : 'bg-white border-cream-200 hover:border-gold-400/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-editorial text-lg font-bold text-charcoal-900">
                      {cust.fullName}
                    </h3>
                    {cust.vipStatus && (
                      <span className="p-0.5 rounded-full bg-gold-100 text-gold-700" title="VIP Client">
                        <Star className="w-3.5 h-3.5 fill-gold-500" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-burgundy-900">
                    {formatCurrency(cust.lifetimeValue)}
                  </span>
                </div>

                <p className="text-xs text-charcoal-600 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gold-600" /> {cust.phone}
                </p>

                <div className="mt-3 flex items-center justify-between text-[11px] text-charcoal-500 pt-2 border-t border-cream-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-charcoal-400" /> {cust.city}
                  </span>
                  <span>{cust.eventsCount} Event Booked</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Customer Profile Dossier (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-burgundy-900 text-gold-300 font-editorial text-xl font-bold flex items-center justify-center">
                  {selectedCust.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-editorial text-2xl font-bold text-charcoal-900 flex items-center gap-2">
                    {selectedCust.fullName}
                    {selectedCust.vipStatus && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 bg-gold-100 px-2.5 py-0.5 rounded-full">
                        VIP Tier
                      </span>
                    )}
                  </h2>
                  <span className="text-xs text-charcoal-500">
                    Client since {selectedCust.createdAt}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-charcoal-400 block font-semibold">
                  Lifetime Value
                </span>
                <span className="font-editorial text-xl font-bold text-burgundy-900">
                  {formatCurrency(selectedCust.lifetimeValue)}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-charcoal-500 block text-[11px]">Direct Phone</span>
                <span className="font-semibold text-charcoal-900">{selectedCust.phone}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Email Address</span>
                <span className="font-semibold text-charcoal-900">{selectedCust.email}</span>
              </div>
              <div>
                <span className="text-charcoal-500 block text-[11px]">Primary City</span>
                <span className="font-semibold text-charcoal-900">{selectedCust.city}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
              <h4 className="text-xs uppercase tracking-wider font-bold text-charcoal-700 mb-1">
                Atelier Concierge Notes
              </h4>
              <p className="text-xs text-charcoal-600 font-light leading-relaxed">
                {selectedCust.notes || 'No specialized notes added for this client.'}
              </p>
            </div>

            {/* Client Events & Activity Association */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-charcoal-700">
                Associated Events & Activity
              </h4>
              <div className="p-4 rounded-2xl bg-cream-100/60 border border-cream-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-burgundy-800" />
                  <div>
                    <span className="font-bold text-charcoal-900 block">
                      {selectedCust.eventsCount > 0
                        ? `${selectedCust.eventsCount} Event${selectedCust.eventsCount > 1 ? 's' : ''} on Record`
                        : 'Prospective Client / Lead'}
                    </span>
                    <span className="text-[11px] text-charcoal-500">
                      {selectedCust.recentActivity || `Member profile from ${selectedCust.city}`}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-burgundy-900 font-mono">
                  {formatCurrency(selectedCust.lifetimeValue)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-cream-200 flex items-center gap-3">
              <a
                href={`tel:${selectedCust.phone}`}
                className="flex-1 py-3 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors text-center"
              >
                Call Client
              </a>
              <button
                onClick={() => alert('New note saved to CRM profile.')}
                className="px-6 py-3 rounded-full text-xs font-semibold uppercase bg-cream-200 text-charcoal-800 hover:bg-cream-300 transition-colors"
              >
                + Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
