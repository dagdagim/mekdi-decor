'use client';

import React, { useState } from 'react';
import { Sparkles, MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: formData.name,
          content: `Inquiry for ${formData.eventType}: ${formData.message} (Email: ${formData.email} • Phone: ${formData.phone})`,
        }),
      });
    } catch (e) {
      console.warn('Contact message error:', e);
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            Connect With Our Atelier
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal-900 font-semibold tracking-tight">
            Contact Mekdi Decor
          </h1>
          <p className="mt-3 text-sm sm:text-base text-charcoal-600 font-light">
            We would love to welcome you to our Addis studio or schedule a private virtual consultation for your destination celebration.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Contact Information (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card space-y-6">
              <h3 className="font-editorial text-2xl font-bold text-charcoal-900">
                Design Studio
              </h3>

              <div className="space-y-4 text-xs text-charcoal-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal-900 mb-0.5">Location</strong>
                    <span>Bole Medhanialem, Luxury Design Center 4th Floor, Addis Ababa, Ethiopia</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal-900 mb-0.5">Direct Line & Telegram</strong>
                    <a href="tel:+251911234567" className="hover:text-burgundy-900">
                      +251 911 234 567
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal-900 mb-0.5">Email Concierge</strong>
                    <a href="mailto:contact@mekdidecor.com" className="hover:text-burgundy-900">
                      contact@mekdidecor.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal-900 mb-0.5">Studio Hours</strong>
                    <span>Monday – Saturday: 9:00 AM – 7:00 PM (By Appointment)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 text-xs text-charcoal-600">
                <span className="font-semibold text-burgundy-900 block mb-1">
                  Destination Event Inquiries
                </span>
                We regularly produce luxury weddings in Hawassa, Bishoftu resorts, Adama, and Bahir Dar. Early booking is advised.
              </div>
            </div>
          </div>

          {/* Right Inquiry Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 sm:p-10 border border-cream-200 shadow-card">
              {submitted ? (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-botanical-100 text-botanical-700 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-2">
                    Message Received
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto mb-6">
                    Thank you {formData.name}! Our event coordinator will get in touch with you within a few business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-full text-xs font-semibold uppercase bg-burgundy-900 text-cream-50"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-charcoal-900 mb-1">
                      Send a Message
                    </h3>
                    <p className="text-xs text-charcoal-500">
                      Have a quick question or want to book an in-person studio visit?
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sara Tekle"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="sara@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+251 9XX XXX XXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      Event Type
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                    >
                      <option value="Wedding">Wedding</option>
                      <option value="Graduation">Graduation</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Engagement">Engagement</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="Other">Other Private Celebration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      Message / Inquiry *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Tell us what you have in mind, tentative dates, or any special requests..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50 text-xs text-charcoal-900 focus:outline-none focus:border-burgundy-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-full text-xs font-semibold tracking-wider uppercase bg-burgundy-800 text-cream-50 hover:bg-burgundy-900 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-gold-400" />
                    <span>Send Inquiry to Mekdi Decor</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
