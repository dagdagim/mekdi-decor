'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, Bell, Globe, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-charcoal-900">
          Platform Settings & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-500 font-light mt-1">
          Configure business details, Ethiopian payment gateway keys, and notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h3 className="font-editorial text-lg font-bold text-charcoal-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-gold-600" />
            <span>Business Profile & Localization</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Company Name</label>
              <input
                type="text"
                defaultValue="MEKDI DECOR"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900"
              />
            </div>
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Tagline</label>
              <input
                type="text"
                defaultValue="Making Moments Unforgettable"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900"
              />
            </div>
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Default Currency</label>
              <select
                defaultValue="ETB"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900"
              >
                <option value="ETB">ETB — Ethiopian Birr</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Primary Support Phone</label>
              <input
                type="text"
                defaultValue="+251 967 698 460 / +251 900 454 238"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-card space-y-4">
          <h3 className="font-editorial text-lg font-bold text-charcoal-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-gold-600" />
            <span>Ethiopian Payment Gateway Keys</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Chapa Secret Key</label>
              <input
                type="password"
                defaultValue="CHASECK_TEST-938210928301928"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">Telebirr Merchant App ID</label>
              <input
                type="text"
                defaultValue="TB_APP_882910"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 font-mono"
              />
            </div>
            <div>
              <label className="block text-charcoal-700 font-semibold mb-1">CBE Birr Shortcode</label>
              <input
                type="text"
                defaultValue="1000188929312"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50 text-charcoal-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between">
          {saved && (
            <span className="text-xs font-semibold text-botanical-700">
              ✓ Settings successfully saved!
            </span>
          )}
          <button
            type="submit"
            className="ml-auto px-8 py-3 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50 hover:bg-burgundy-800 transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
