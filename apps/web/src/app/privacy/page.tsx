import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, Sparkles, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | Mekdi Decor',
  description: 'Learn how Mekdi Decor PLC collects, uses, protects, and handles your personal information and celebration memories.',
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 2026';

  return (
    <div className="min-h-screen bg-cream-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gold-700 hover:text-burgundy-900 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase tracking-widest text-gold-700 font-semibold flex items-center justify-center gap-1.5 mb-2">
            <ShieldCheck className="w-4 h-4 text-gold-600" />
            Trust & Transparency
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-charcoal-600 font-light">
            Effective Date & Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-card space-y-10 text-charcoal-800 font-light leading-relaxed">
          {/* Section 1: Introduction */}
          <div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">01.</span> Introduction
            </h2>
            <p className="text-sm">
              At <strong>MEKDI DECOR PLC</strong> (&ldquo;Mekdi Decor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), we respect your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we collect, use, store, and safeguard your data when you visit our website (<strong>mekdi-decor.vercel.app</strong>), use our digital quotation and moodboard planners, communicate via our Telegram channels/bots, or contract our decor and event transformation services across Ethiopia.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">02.</span> Information We Collect
            </h2>
            <p className="text-sm mb-4">
              We collect information you provide directly to us when planning your celebration or interacting with our team:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-charcoal-700">
              <li>
                <strong>Contact Details:</strong> Full name, email address, phone numbers (mobile/WhatsApp), and Telegram handles.
              </li>
              <li>
                <strong>Event Specifications:</strong> Celebration type (Wedding, Melse, Engagement, Birthday, Graduation, Corporate), planned event date, estimated guest count, venue name, and hall location.
              </li>
              <li>
                <strong>Design Preferences & Creative Media:</strong> Color palettes, theme selections, reference moodboard images, and custom staging requests.
              </li>
              <li>
                <strong>Billing & Transaction Records:</strong> Quotation approvals, bank transfer reference numbers, CBE/Telebirr/Chapa transaction IDs, and receipt records. (Note: We do not store banking passwords or payment card PINs).
              </li>
              <li>
                <strong>Communications:</strong> Notes from discovery consultations, feedback forms, and support inquiries.
              </li>
            </ul>
          </div>

          {/* Section 3: How We Use Your Information */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">03.</span> How We Use Your Information
            </h2>
            <p className="text-sm mb-4">
              Your details are used strictly to curate and execute your celebrations:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600" /> Event Craftsmanship
                </h3>
                <p className="text-xs text-charcoal-600">
                  Preparing tailored 3D stage sketches, custom floral orders, venue access logistics, and on-site production timelines.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gold-600" /> Quotes & Contracts
                </h3>
                <p className="text-xs text-charcoal-600">
                  Generating verified itemized quotes, payment confirmations, and booking reservations for reserved calendar dates.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-600" /> Client Support
                </h3>
                <p className="text-xs text-charcoal-600">
                  Real-time updates via phone, SMS, and Telegram leading up to and during setup on your celebration day.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200">
                <h3 className="font-semibold text-charcoal-900 text-sm mb-1 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gold-600" /> Service Improvement
                </h3>
                <p className="text-xs text-charcoal-600">
                  Refining our digital catalog, package recommendations, and customer experience.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Photography & Showcase Policy */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">04.</span> Photography & Media Rights
            </h2>
            <p className="text-sm">
              As an artistic decor atelier, we take professional photographs and video of our completed floral designs, arches, lighting installations, and stage craftsmanship. We hold the utmost respect for your privacy:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-charcoal-700 mt-3">
              <li>
                We prioritize staging photography taken prior to guest arrival.
              </li>
              <li>
                If you prefer your celebration decor not be featured on our social channels (TikTok, Instagram, Telegram) or website gallery, simply notify our team in writing or check the privacy option in your booking contract.
              </li>
            </ul>
          </div>

          {/* Section 5: Data Protection & Confidentiality */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">05.</span> Protection & Information Sharing
            </h2>
            <p className="text-sm">
              We never sell, rent, or trade your personal information to third-party advertisers. Information is only shared under strictly controlled circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-charcoal-700 mt-3">
              <li>
                <strong>Operational Production Crew:</strong> Our lead florists, carpenters, and logistics drivers receive venue access and schedule details necessary to complete on-site setup.
              </li>
              <li>
                <strong>Legal Requirements:</strong> Disclosures required under Ethiopian law or to comply with valid legal processes.
              </li>
            </ul>
          </div>

          {/* Section 6: Data Retention & Your Rights */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">06.</span> Your Rights & Data Retention
            </h2>
            <p className="text-sm">
              We retain event records for accounting and warranty verification purposes. You may request access to, correction of, or deletion of your personal records at any time by contacting us.
            </p>
          </div>

          {/* Section 7: Contact Information */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">07.</span> Contact Us
            </h2>
            <p className="text-sm mb-4">
              If you have any questions or concerns regarding our privacy practices, please contact us:
            </p>
            <div className="bg-cream-50 p-6 rounded-2xl border border-cream-200 space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold-600 shrink-0" />
                <span>MEKDI DECOR PLC — Trufat Werku Tower, Ground Floor, Room 217, Hawassa, Ethiopia</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold-600 shrink-0" />
                <span>+251 967 698 460 / +251 900 454 238</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold-600 shrink-0" />
                <span>contact@mekdidecor.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
