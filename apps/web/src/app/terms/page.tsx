import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, AlertCircle, Sparkles, MapPin, Phone, Mail, ArrowLeft, Calendar, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | Mekdi Decor',
  description: 'Review the booking policies, payment terms, cancellation rules, and service agreements of Mekdi Decor PLC.',
};

export default function TermsOfServicePage() {
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
            <FileText className="w-4 h-4 text-gold-600" />
            Client Agreement & Policies
          </span>
          <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal-900 font-semibold tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-charcoal-600 font-light">
            Effective Date & Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Main Terms Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-card space-y-10 text-charcoal-800 font-light leading-relaxed">
          {/* Section 1: Overview */}
          <div>
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">01.</span> Agreement to Terms
            </h2>
            <p className="text-sm">
              These Terms of Service constitute a legally binding agreement between you (the &ldquo;Client&rdquo;) and <strong>MEKDI DECOR PLC</strong> (&ldquo;Mekdi Decor&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By confirming a quotation, submitting a deposit, or engaging our floral and event design services, you acknowledge that you have read, understood, and agreed to all terms detailed herein.
            </p>
          </div>

          {/* Section 2: Reservation & Deposit */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">02.</span> Booking & Date Reservation
            </h2>
            <div className="space-y-3 text-sm">
              <p>
                To maintain our uncompromised level of artistry, Mekdi Decor accepts a limited number of commissions per date.
              </p>
              <div className="p-4 rounded-2xl bg-gold-50/60 border border-gold-200/60 text-charcoal-800">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gold-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-charcoal-900 font-semibold mb-1">
                      50% Retainer Deposit Rule
                    </strong>
                    <span>
                      An event date is officially locked in our production calendar only upon receipt of a <strong>50% non-refundable deposit</strong> alongside a signed or digitally confirmed quotation agreement. Inquiries or unconfirmed quotes do not hold or reserve a date.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Schedule */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">03.</span> Payment Schedule & Methods
            </h2>
            <ul className="list-disc pl-6 space-y-2.5 text-sm text-charcoal-700">
              <li>
                <strong>Final Balance:</strong> The remaining 50% balance must be settled in full at least <strong>seven (7) calendar days</strong> before the scheduled event date.
              </li>
              <li>
                <strong>Accepted Methods:</strong> Bank transfer (Commercial Bank of Ethiopia, Awash Bank, etc.), Telebirr, Chapa digital checkout, or cash payment at our Trufat Werku Tower studio.
              </li>
              <li>
                <strong>Late Payments:</strong> Failure to settle the final balance 7 days prior may result in suspension of fresh flower sourcing or delays in custom carpentry fabrication.
              </li>
            </ul>
          </div>

          {/* Section 4: Venue Access & Setup Execution */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">04.</span> Venue Access & Setup Schedule
            </h2>
            <p className="text-sm mb-3">
              To guarantee immaculate execution, the Client is responsible for ensuring venue compliance:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-charcoal-700">
              <li>
                <strong>Access Window:</strong> Setup crew requires unhindered venue access at least <strong>12 hours prior</strong> to guest arrival (or as agreed in the project proposal for mega-scale productions).
              </li>
              <li>
                <strong>Utilities:</strong> The venue management must provide continuous electrical power, lighting circuits, clean water access for florals, and safe access ladders/staging areas.
              </li>
              <li>
                <strong>Teardown & Retrieval:</strong> Our crew will dismantle and retrieve all decorative structures, arches, urns, and lighting fixtures promptly upon event conclusion according to venue curfew policies.
              </li>
            </ul>
          </div>

          {/* Section 5: Cancellations & Rescheduling */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">05.</span> Cancellations, Postponement & Rescheduling
            </h2>
            <p className="text-sm mb-3">
              Because reserved dates prevent us from accepting other clients and custom botanical orders are placed weeks in advance:
            </p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
                <strong className="block text-charcoal-900 font-semibold mb-1">Cancellation by Client:</strong>
                <span>The initial 50% deposit is non-refundable. Cancellations made less than 14 days before the event forfeit all payments made due to committed raw materials and fresh floral consignments.</span>
              </div>
              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200">
                <strong className="block text-charcoal-900 font-semibold mb-1">Date Rescheduling:</strong>
                <span>Requests to reschedule must be submitted in writing at least 21 days prior to the original date and are subject to atelier availability on the newly requested date.</span>
              </div>
            </div>
          </div>

          {/* Section 6: Ownership of Rental Equipment */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">06.</span> Rental Items & Damage Responsibility
            </h2>
            <p className="text-sm">
              All physical structures, backdrop frames, custom pedestals, botanical urns, crystal centerpieces, chandeliers, linen drapery, and architectural lighting equipment remain the sole property of Mekdi Decor PLC. The Client assumes financial responsibility for any severe breakage, loss, or theft of equipment caused by guests or external venue contractors during the event duration.
            </p>
          </div>

          {/* Section 7: Force Majeure & Weather */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">07.</span> Outdoor Weather & Force Majeure
            </h2>
            <p className="text-sm">
              Mekdi Decor is not liable for weather disruptions (such as torrential rain, heavy winds, or regional power outages) impacting open-air outdoor gardens. For outdoor bookings, the Client is strongly advised to maintain a designated weather tent or indoor backup option. Neither party shall be held liable for failure to perform obligations caused by acts of God, governmental restrictions, or unforeseen civil emergencies.
            </p>
          </div>

          {/* Section 8: Governing Law & Studio Address */}
          <div className="border-t border-cream-100 pt-8">
            <h2 className="font-editorial text-2xl font-bold text-charcoal-900 mb-3 flex items-center gap-2">
              <span className="text-gold-600 text-lg font-sans">08.</span> Governing Law & Inquiries
            </h2>
            <p className="text-sm mb-4">
              These terms are governed by the laws and commercial regulations of the Federal Democratic Republic of Ethiopia. For questions or official notices, please reach our atelier:
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
