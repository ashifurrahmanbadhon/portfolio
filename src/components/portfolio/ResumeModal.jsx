'use client';

import React from 'react';
import { X, FileText, Download, ExternalLink, Mail } from 'lucide-react';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function ResumeModal({ isOpen, onClose, resumeUrl = '/Ashifur_Rahman_CV.pdf' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0A0B10] border border-[#23242B] rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer transition p-1.5 rounded-lg hover:bg-white/5"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto border border-[#F59E0B]/30">
            <FileText size={22} />
          </div>
          <h3 className="text-lg font-bold text-[#F5F2EA] uppercase tracking-wide">Ashifur Rahman — Curriculum Vitae</h3>
          <p className="text-xs text-[#B9B5A9] leading-relaxed">
            Electrical &amp; Electronic Engineer with Substation, CAD, GIS, and Analytics experience.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={triggerCvDownload}
            className="w-full py-3.5 rounded-lg bg-[#F59E0B] text-[#1A1202] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#FBBF24] hover:shadow-[0_8px_24px_rgba(245,158,11,0.35)] transition cursor-pointer"
          >
            <Download size={15} /> Download Official PDF CV
          </button>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-lg bg-[#06070B] text-[#F5F2EA] border border-[#23242B] hover:border-[#F59E0B]/60 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition hover:bg-white/5"
          >
            <ExternalLink size={15} /> View CV in Browser Tab
          </a>
          <a
            href="mailto:ashifur.badhon@gmail.com?subject=Request%20for%20Ashifur%20Rahman%20Full%20Resume"
            className="w-full py-2 text-[#8E8B82] hover:text-[#F59E0B] font-mono text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Mail size={13} /> Request Custom CV via Email
          </a>
        </div>
      </div>
    </div>
  );
}
