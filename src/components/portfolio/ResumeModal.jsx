'use client';

import React from 'react';
import { X, FileText, Download, ExternalLink, Mail } from 'lucide-react';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function ResumeModal({ isOpen, onClose, resumeUrl = '/resume.pdf' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111622] border border-[#1e2638] rounded-2xl max-w-md w-full p-6 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer transition p-1 rounded-lg hover:bg-[#1a2234]"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center mx-auto border border-[#10B981]/30">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Ashifur Rahman — Curriculum Vitae</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Electrical &amp; Electronic Engineer with Substation, CAD, GIS, and Analytics experience.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={triggerCvDownload}
            className="w-full py-3 rounded-lg bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition cursor-pointer"
          >
            <Download size={16} /> Download Official PDF CV
          </button>
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 rounded-lg bg-[#0b0f17] text-white border border-[#1e2638] hover:border-[#10B981]/50 font-semibold text-xs flex items-center justify-center gap-2 transition hover:bg-[#121927]"
          >
            <ExternalLink size={16} /> View CV in Browser Tab
          </a>
          <a
            href="mailto:ashifur.badhon@gmail.com?subject=Request%20for%20Ashifur%20Rahman%20Full%20Resume"
            className="w-full py-2 text-gray-400 hover:text-[#10B981] font-mono text-xs flex items-center justify-center gap-1.5 transition"
          >
            <Mail size={14} /> Request Custom CV via Email
          </a>
        </div>
      </div>
    </div>
  );
}
