'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const PACKAGE_CONFIGS = {
  "Business Website": {
    fieldLabel: "BUSINESS / CURRENT WEBSITE (OPTIONAL)",
    fieldPlaceholder: "e.g. MyBrand Store (https://mybrand.com)",
    template: "Business name:\nPages you need:\nReference website (if any):"
  },
  "Portfolio Website": {
    fieldLabel: "YOUR PROFESSION",
    fieldPlaceholder: "e.g. Graphic Designer, Photographer",
    template: "Your profession:\nSections you want:\nReference website (if any):"
  },
  "Landing Page": {
    fieldLabel: "PRODUCT / CAMPAIGN NAME",
    fieldPlaceholder: "e.g. Summer Sale — Skin Care Bundle",
    template: "Product / offer:\nMain goal (sale / lead / call):\nTraffic source:"
  },
  "AI Chatbot for Business": {
    fieldLabel: "YOUR WEBSITE (OPTIONAL)",
    fieldPlaceholder: "e.g. https://mybusiness.com",
    template: "Business type:\nTop customer questions:\nInfo the bot should collect:"
  },
  "Meta Pixel + Conversions API Setup": {
    fieldLabel: "YOUR WEBSITE",
    fieldPlaceholder: "e.g. https://myshop.com",
    template: "Website URL:\nAd platform:\nEvents to track:"
  },
  "Tracking Audit": {
    fieldLabel: "YOUR WEBSITE",
    fieldPlaceholder: "e.g. https://myshop.com",
    template: "Website URL:\nTools in use:\nMain concern:"
  },
  "n8n Workflow Automation": {
    fieldLabel: "WHAT SHOULD BE AUTOMATED?",
    fieldPlaceholder: "e.g. Orders from my page saved to Google Sheets",
    template: "Task to automate:\nTools involved:\nHow often it runs:"
  },
  "Design Services": {
    fieldLabel: "WHICH DESIGN DO YOU NEED?",
    fieldPlaceholder: "Email Template / YouTube Thumbnail / Social Media Post",
    template: "Design type:\nText / content:\nQuantity needed:"
  }
};

const DEFAULT_CONFIG = {
  fieldLabel: "WEBSITE / BUSINESS (OPTIONAL)",
  fieldPlaceholder: "",
  template: "Goal:\nDetails:\nDeadline (if any):"
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolvePackageConfig(pkg) {
  if (!pkg) return DEFAULT_CONFIG;
  const hardcoded = PACKAGE_CONFIGS[pkg.title] || DEFAULT_CONFIG;
  return {
    fieldLabel: (pkg.inquiry_field_label && pkg.inquiry_field_label.trim()) || hardcoded.fieldLabel || DEFAULT_CONFIG.fieldLabel,
    fieldPlaceholder: (pkg.inquiry_field_placeholder !== undefined && pkg.inquiry_field_placeholder !== null && pkg.inquiry_field_placeholder !== '')
      ? pkg.inquiry_field_placeholder
      : (hardcoded.fieldPlaceholder || DEFAULT_CONFIG.fieldPlaceholder),
    template: (pkg.inquiry_template && pkg.inquiry_template.trim()) || hardcoded.template || DEFAULT_CONFIG.template
  };
}

export default function PackageInquiryModal({ pkg, cardIndex = 0, isOpen, onClose }) {
  const config = resolvePackageConfig(pkg);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specificField: '',
    details: config.template
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showMobileDeliverables, setShowMobileDeliverables] = useState(false);

  useEffect(() => {
    if (pkg) {
      const cfg = resolvePackageConfig(pkg);
      setFormData({
        name: '',
        email: '',
        specificField: '',
        details: cfg.template
      });
      setSubmitting(false);
      setSubmitted(false);
      setError('');
      setShowMobileDeliverables(false);
    }
  }, [pkg]);

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !pkg) return null;

  const deliverables = (pkg.deliverables || '')
    .split('\n')
    .map((d) => d.trim())
    .filter(Boolean);
  const presetNumber = String(pkg.sort_order || cardIndex + 1).padStart(2, '0');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!formData.email.trim() || !EMAIL_REGEX.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.details.trim()) {
      setError('Please provide project details in the message box.');
      return;
    }

    setSubmitting(true);

    const messageBody = formData.specificField.trim()
      ? `${config.fieldLabel}: ${formData.specificField.trim()}\n\n${formData.details.trim()}`
      : formData.details.trim();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: `Package Inquiry: ${pkg.title}`,
          message: messageBody
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[820px] max-h-[92dvh] md:max-h-none bg-[#0A0B10] border border-[#23242B] shadow-2xl my-auto flex flex-col md:grid md:grid-cols-[290px_1fr] overflow-y-auto md:overflow-hidden">
        {/* Close button with ≥40px touch target */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-30 text-[#8E8B82] hover:text-[#F5F2EA] transition w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* MOBILE TOP SUMMARY (md:hidden) — compact header, title, collapsible WHAT YOU GET, note kept */}
        <div className="md:hidden bg-[#06070B] border-b border-[#23242B] p-4 sm:p-5 pr-12">
          <div className="flex items-center gap-2 font-mono text-xs mb-1">
            <span className="text-[#F59E0B] font-bold tracking-wider">
              PRESET — {presetNumber}
            </span>
            <span className="text-[#8E8B82]">•</span>
            <span className="text-[#8E8B82] uppercase tracking-wider font-medium text-[11px] truncate">
              {pkg.category || 'SERVICE'}
            </span>
          </div>

          <h3 className="text-lg font-black uppercase tracking-tight text-[#F5F2EA] leading-tight mb-2">
            {pkg.title}
          </h3>

          {/* Collapsible WHAT YOU GET on mobile */}
          <div className="mt-2 pt-2 border-t border-[#23242B]/70">
            <button
              type="button"
              onClick={() => setShowMobileDeliverables(!showMobileDeliverables)}
              className="flex items-center justify-between w-full font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] hover:text-[#F59E0B] py-1 cursor-pointer"
            >
              <span>WHAT YOU GET ({deliverables.length} items)</span>
              <span className="text-[#F59E0B]">{showMobileDeliverables ? '▲ HIDE' : '▼ VIEW'}</span>
            </button>
            {showMobileDeliverables && (
              <ul className="space-y-1.5 text-xs text-[#B9B5A9] leading-relaxed pt-2 pb-1">
                {deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-[#F59E0B] font-mono mr-2 shrink-0 font-bold">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-2.5 bg-[#0A0B10] border border-[#23242B] text-[11px] text-[#8E8B82] leading-relaxed mt-2.5">
            No fixed price on this page —{' '}
            <strong className="text-[#F5F2EA] font-semibold">
              we discuss and fix it together
            </strong>
            , based on your exact scope.
          </div>
        </div>

        {/* DESKTOP LEFT RAIL (hidden on mobile, visible on md+) */}
        <div className="hidden md:flex bg-[#06070B] md:border-r border-[#23242B] p-6 sm:p-7 flex-col justify-between">
          <div>
            <div className="font-mono text-xs text-[#F59E0B] font-bold tracking-wider mb-2">
              PRESET — {presetNumber}
            </div>

            <h3 className="text-xl sm:text-[22px] font-black uppercase tracking-tight text-[#F5F2EA] leading-tight mb-1">
              {pkg.title}
            </h3>

            <div className="font-mono text-[11px] text-[#8E8B82] uppercase tracking-wider font-medium mb-6">
              {pkg.category || 'SERVICE'}
            </div>

            <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] mb-3">
              WHAT YOU GET
            </div>

            <ul className="space-y-2 text-xs sm:text-[13px] text-[#B9B5A9] leading-relaxed mb-6">
              {deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-[#F59E0B] font-mono mr-2.5 shrink-0 font-bold">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 bg-[#0A0B10] border border-[#23242B] text-xs text-[#8E8B82] leading-relaxed mt-6">
            No fixed price on this page —{' '}
            <strong className="text-[#F5F2EA] font-semibold">
              we discuss and fix it together
            </strong>
            , based on your exact scope.
          </div>
        </div>

        {/* RIGHT (Form or Success state) */}
        <div className="p-5 sm:p-8 flex flex-col justify-between bg-[#0A0B10]">
          {submitted ? (
            <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center my-auto">
              <div className="w-12 h-12 stat-box bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-5">
                <Check size={24} />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-[#F5F2EA] mb-3">
                Got it — thank you.
              </h3>
              <p className="text-sm text-[#B9B5A9] max-w-md mx-auto mb-8 leading-relaxed">
                Your inquiry is in my inbox and email. I will reply personally — usually within 24 hours.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="stat-box py-2.5 px-6 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] transition cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-[#F5F2EA] mb-1 pr-6 sm:pr-0">
                  Let&apos;s discuss <span className="text-[#F59E0B]">{pkg.title}</span>
                </h2>
                <p className="text-xs sm:text-sm text-[#8E8B82] mb-4 sm:mb-6">
                  Two minutes to fill in — I reply personally, no auto-messages.
                </p>

                {/* Name + Email in ONE row (2 cols; stacked on mobile) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] mb-1.5">
                      YOUR NAME <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="stat-box w-full bg-[#06070B] border border-[#23242B] text-[#F5F2EA] placeholder-[#555] text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#F59E0B] focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] mb-1.5">
                      YOUR EMAIL <span className="text-[#F59E0B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="stat-box w-full bg-[#06070B] border border-[#23242B] text-[#F5F2EA] placeholder-[#555] text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#F59E0B] focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Package-specific field */}
                <div className="mb-3 sm:mb-4">
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] mb-1.5">
                    {config.fieldLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.specificField}
                    onChange={(e) => setFormData({ ...formData, specificField: e.target.value })}
                    placeholder={config.fieldPlaceholder}
                    className="stat-box w-full bg-[#06070B] border border-[#23242B] text-[#F5F2EA] placeholder-[#555] text-xs sm:text-sm px-3.5 py-2.5 focus:border-[#F59E0B] focus:outline-none transition"
                  />
                </div>

                {/* TELL ME ABOUT IT * textarea */}
                <div className="mb-3 sm:mb-4">
                  <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] mb-1.5">
                    TELL ME ABOUT IT <span className="text-[#F59E0B]">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="stat-box w-full bg-[#06070B] border border-[#23242B] text-[#F5F2EA] placeholder-[#555] text-xs sm:text-sm p-3 focus:border-[#F59E0B] focus:outline-none transition font-sans resize-none"
                  />
                </div>

                {/* Inline error */}
                {error && (
                  <div className="text-red-400 text-xs font-mono mb-3 sm:mb-4">
                    {error}
                  </div>
                )}
              </div>

              {/* Footer row: wraps on mobile with reply-note above buttons, Send/Cancel always reachable */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3.5 sm:pt-4 border-t border-[#23242B] mt-2">
                <span className="font-mono text-[10px] uppercase text-[#8E8B82] tracking-wider text-center sm:text-left order-1">
                  USUALLY REPLIES WITHIN 24 HOURS
                </span>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end order-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-xs font-mono text-[#8E8B82] hover:text-[#F5F2EA] px-3 py-2.5 min-h-[42px] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="stat-box flex-1 sm:flex-initial py-2.5 px-5 min-h-[42px] text-center text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] transition cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Sending...' : 'Send Inquiry \u2192'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

