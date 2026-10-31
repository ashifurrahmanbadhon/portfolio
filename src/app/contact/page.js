'use client';

import React, { useState } from 'react';
import {
  Send,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function ContactPage() {
  const { contactData, contactChannels, pageHeaders, isPreview } = usePortfolio();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewNote, setPreviewNote] = useState(false);

  const isChannelActive = (key) => {
    if (!contactChannels || contactChannels.length === 0) return true;
    const ch = contactChannels.find((c) => c.channel_key === key);
    return ch ? ch.is_active !== 0 && ch.is_active !== false : true;
  };

  const header = pageHeaders?.contact || {
    title: "Let's Discuss Engineering &",
    highlight_word: "Technical Solutions",
    description: "Reach out directly for substation engineering consultations, AutoCAD schematics, GIS asset mapping, operational analytics, or technology collaborations."
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (isPreview) {
      setPreviewNote(true);
      return;
    }
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
      const mailtoUrl = `mailto:${contactData.email || 'ashifur.badhon@gmail.com'}?subject=${encodeURIComponent(
        formData.subject + ' - from ' + formData.name
      )}&body=${encodeURIComponent(
        'Sender Name: ' + formData.name + '\nSender Email: ' + formData.email + '\n\nMessage:\n' + formData.message
      )}`;
      setTimeout(() => {
        window.location.href = mailtoUrl;
      }, 700);
    }
  };

  const channelsList = [
    {
      key: 'email',
      label: 'Email',
      url: `mailto:${contactData.email || 'ashifur.badhon@gmail.com'}`
    },
    {
      key: 'phone',
      label: 'Phone',
      url: `tel:${(contactData.phone || '+8801521417284').replace(/\s+/g, '')}`
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      url: contactData.whatsapp_url || `https://wa.me/${(contactData.phone || '+8801521417284').replace(/[^0-9]/g, '')}`
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      url: contactData.linkedin_url || contactData.linkedin || 'https://www.linkedin.com/in/ashifurrahmanbadhon'
    },
    {
      key: 'github',
      label: 'GitHub',
      url: contactData.github_url || contactData.github || 'https://github.com/ashifurrahmanbadhon'
    },
    {
      key: 'location',
      label: 'Location',
      url: contactData.maps_url || 'https://maps.google.com/?q=Tangail,+Bangladesh'
    }
  ];

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Bordered channel rows — left mono faint label, right masked value; hover inset ring */}
          <div className="lg:col-span-5 max-w-xl space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F2EA]">
                Communication Channels
              </h2>
              <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 leading-relaxed">
                Reach out directly through any preferred channel. All inquiries are received directly.
              </p>
            </div>

            <div className="space-y-2">
              {channelsList.filter(c => isChannelActive(c.key)).map((ch) => (
                <a
                  key={ch.key}
                  href={ch.url}
                  target={ch.url.startsWith('http') ? '_blank' : undefined}
                  rel={ch.url.startsWith('http') ? 'noreferrer' : undefined}
                  className="block group cursor-pointer"
                >
                  <div className="stat-box px-4 py-3 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8E8B82] group-hover:text-[#F59E0B] uppercase tracking-wider font-medium transition-colors">
                      {ch.label}
                    </span>
                    <ExternalLink size={13} className="text-[#8E8B82] group-hover:text-[#F59E0B] transition-colors" />
                  </div>
                </a>
              ))}
            </div>

            {/* SLA Card */}
            <div className="stat-box p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B] font-semibold">
                <Clock size={13} />
                <span>RESPONSE TIME SLA</span>
              </div>
              <p className="text-xs text-[#B9B5A9] leading-relaxed">
                Messages dispatched via this form or direct email are answered within 24 hours. For urgent project inquiries, WhatsApp is prioritized.
              </p>
            </div>
          </div>

          {/* Right Column: Form (SAME fields, validation, submit, success behavior; restyled) */}
          <div className="lg:col-span-7 stat-box p-8 sm:p-10 shadow-2xl relative">
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F2EA] mb-2">
                Send a Direct Message
              </h3>
              <p className="text-xs sm:text-sm text-[#B9B5A9]">
                Submit this form to record your inquiry directly in Ashifur's database and dispatch it immediately.
              </p>
            </div>

            {formSubmitted && (
              <div className="mb-6 p-4 bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[#F59E0B] text-xs sm:text-sm font-semibold flex items-center gap-3 animate-in fade-in duration-300">
                <Check size={18} className="shrink-0" />
                <span>Inquiry recorded! Opening your default email client to finalize dispatch...</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#8E8B82] uppercase mb-2 font-medium">
                    Your Name <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full stat-box bg-[#06070B] px-4 py-3.5 text-sm text-[#F5F2EA] placeholder-[#8E8B82] focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#8E8B82] uppercase mb-2 font-medium">
                    Your Email <span className="text-[#F59E0B]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. tanvir@powercorp.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full stat-box bg-[#06070B] px-4 py-3.5 text-sm text-[#F5F2EA] placeholder-[#8E8B82] focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8E8B82] uppercase mb-2 font-medium">
                  Subject / Inquiry Type <span className="text-[#F59E0B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Substation SLD Consultation / GIS Project / Recruitment"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full stat-box bg-[#06070B] px-4 py-3.5 text-sm text-[#F5F2EA] placeholder-[#8E8B82] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#8E8B82] uppercase mb-2 font-medium">
                  Detailed Message <span className="text-[#F59E0B]">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Detail your engineering specifications, project timeline, location, or opportunity details..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full stat-box bg-[#06070B] px-4 py-3.5 text-sm text-[#F5F2EA] placeholder-[#8E8B82] focus:outline-none transition resize-none leading-relaxed"
                />
              </div>

              {previewNote && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
                  Preview mode — submissions are disabled in the admin preview.
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="stat-box text-[#F5F2EA] w-full py-4 text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <Send size={15} className="text-[#F59E0B]" /> {submitting ? "Recording & Dispatching..." : "Send Direct Message"}
              </button>
            </form>
          </div>

        </div>
      </section>
    </PortfolioLayout>
  );
}
