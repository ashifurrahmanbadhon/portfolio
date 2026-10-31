'use client';

import React from 'react';
import { X, FileText, Download, ExternalLink, Mail } from 'lucide-react';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function ResumeModal({ isOpen, onClose, resumeUrl = '/Ashifur_Rahman_CV.pdf' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="stat-box max-w-md w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer transition p-1.5 hover:bg-white/5"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto border border-[#F59E0B]/30">
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
            className="stat-box text-[#F5F2EA] w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={15} className="text-[#F59E0B]" /> Download Official PDF CV
          </button>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="stat-box text-[#F5F2EA] w-full py-3.5 text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <ExternalLink size={15} className="text-[#F59E0B]" /> View CV in Browser Tab
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
