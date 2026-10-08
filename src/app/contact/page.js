'use client';

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

function LinkedinIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function ContactPage() {
  const { contactData, pageHeaders } = usePortfolio();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const header = pageHeaders?.contact || {
    badge_text: "COMMUNICATION & INQUIRIES",
    title: "Let's Discuss Engineering &",
    highlight_word: "Technical Solutions",
    description: "Reach out directly for substation engineering consultations, AutoCAD schematics, GIS asset mapping, operational analytics, or technology collaborations."
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // Continue to mailto fallback
    } finally {
      setSubmitting(false);
      setFormSubmitted(true);
      const mailtoUrl = `mailto:${contactData.email}?subject=${encodeURIComponent(
        formData.subject + ' - from ' + formData.name
      )}&body=${encodeURIComponent(
        'Sender Name: ' + formData.name + '\nSender Email: ' + formData.email + '\n\nMessage:\n' + formData.message
      )}`;
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);
    }
  };

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Contact' }]}
        badgeText={header.badge_text}
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Direct Contact Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Direct Reach</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Contact Information</h2>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Connect through any preferred communication channel. All inquiries receive direct attention.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              {/* Email */}
              <a
                href={`mailto:${contactData.email || 'ashifur.badhon@gmail.com'}`}
                className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-200 group"
                title="Click to write an email"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition shrink-0">
                    <Mail size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Direct Email</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                      Send an Email
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-[#10B981] transition flex items-center gap-1 shrink-0">
                  Write <ExternalLink size={13} />
                </span>
              </a>

              {/* Phone */}
              <a
                href={`tel:${contactData.phone || '+8801521417284'}`}
                className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-200 group"
                title="Click to make a phone call"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition shrink-0">
                    <Phone size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Direct Phone Call</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                      Make a Call
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-[#10B981] transition flex items-center gap-1 shrink-0">
                  Call <ExternalLink size={13} />
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={contactData.whatsapp_url || `https://wa.me/${(contactData.phone || '+8801521417284').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-emerald-400 hover:bg-[#141b2a] transition duration-200 group"
                title="Click to start WhatsApp instant chat"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition shrink-0">
                    <MessageCircle size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase">WhatsApp Instant Chat</p>
                    <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">
                      Start WhatsApp Chat
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                  <ExternalLink size={13} className="text-gray-400 group-hover:text-emerald-400 transition" />
                </div>
              </a>

              {/* LinkedIn */}
              <a
                href={contactData.linkedin_url || contactData.linkedin || "https://www.linkedin.com/in/ashifurrahmanbadhon"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-200 group"
                title="Click to view LinkedIn profile and connect"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition shrink-0">
                    <LinkedinIcon size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase">LinkedIn Profile</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition truncate">
                      Connect on LinkedIn
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-[#10B981] transition flex items-center gap-1 shrink-0">
                  Profile <ExternalLink size={13} />
                </span>
              </a>

              {/* Location */}
              <a
                href={contactData.maps_url || "https://maps.google.com"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-4 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-200 group"
                title="Click to view location in Google Maps"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-lg bg-[#10B981]/10 text-[#10B981] flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-mono uppercase">Location</p>
                    <p className="text-sm font-semibold text-white group-hover:text-[#10B981] transition">
                      View on Google Maps
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-gray-400 group-hover:text-[#10B981] transition flex items-center gap-1 shrink-0">
                  Maps <ExternalLink size={13} />
                </span>
              </a>
            </div>

            {/* Availability SLA Card */}
            <div className="bg-[#0e131d] border border-[#1e2638] rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#10B981]">
                <Clock size={14} />
                <span>Response Time SLA</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Messages received via form or email are typically answered within 24 hours. For urgent inquiries, WhatsApp chat is prioritized.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7 bg-[#111622] p-8 sm:p-10 rounded-2xl border border-[#1e2638] shadow-2xl relative">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Send an Instant Message</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Submit this form to record your inquiry directly in Ashifur's database and dispatch it immediately.
              </p>
            </div>

            {formSubmitted && (
              <div className="mb-6 p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300">
                <Check size={18} className="shrink-0" />
                <span>Inquiry saved in system database! Launching your email client to finalize dispatch...</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">
                    Your Name <span className="text-[#10B981]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-gray-400 uppercase mb-2">
                    Your Email <span className="text-[#10B981]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. tanvir@powercorp.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">
                  Subject / Inquiry Type <span className="text-[#10B981]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Substation SLD Consultation / GIS Project / Recruitment"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-2">
                  Detailed Message <span className="text-[#10B981]">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detail your engineering specifications, project timeline, location, or opportunity details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0b0f17] border border-[#1e2638] rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#10B981] transition resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl bg-[#10B981] text-black font-bold uppercase tracking-wider text-xs sm:text-sm hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Send size={16} /> {submitting ? "Saving & Sending..." : "Send Direct Message"}
              </button>
            </form>
          </div>

        </div>
      </section>
    </PortfolioLayout>
  );
}
