'use client';

import React from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Zap,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  Download,
  ArrowRight,
  TrendingUp,
  Shield,
  Layers
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function ExperiencePage() {
  const { experiences, experienceMetrics, pageHeaders, resumeUrl } = usePortfolio();

  const header = pageHeaders?.experience || {
    badge_text: "PROFESSIONAL JOURNEY",
    title: "Work Experience &",
    highlight_word: "Field Operations",
    description: "A dual-faceted career track combining high-voltage power distribution operations at DESCO with data analytics and workflow planning at Ventech Digital."
  };

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Experience' }]}
        badgeText={header.badge_text}
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Metrics Row (100% Dynamic from CMS) */}
      {experienceMetrics && experienceMetrics.length > 0 && (
        <section className="relative z-10 border-b border-[#1e2638] bg-[#0e131d]/70">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {experienceMetrics.map((ch, idx) => (
              <div key={idx}>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#10B981] font-mono">{ch.metric}</p>
                <p className="text-sm font-semibold text-white mt-1">{ch.label}</p>
                {ch.subtext && <p className="text-xs text-gray-400 mt-0.5">{ch.subtext}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Experience Timeline */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Career Timeline</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Engineering &amp; Management Roles</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto">
            Practical industry exposure demonstrating reliable execution, operational ownership, and technical adaptability.
          </p>
        </div>

        <div className="border-l-2 border-[#1e2638] ml-4 md:ml-8 space-y-12">
          {experiences.map((exp, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12">
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-[#10B981] ring-4 ring-[#0b0f17] shadow-[0_0_12px_rgba(16,185,129,0.5)]" />

              {/* Card Container */}
              <div className="bg-[#111622] p-6 sm:p-8 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 transition duration-300 space-y-5 group">
                
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2638]/70 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-[#10B981] transition">
                        {exp.role}
                      </h3>
                      {exp.period && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {exp.period}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-300 mt-1">{exp.organization}</p>
                  </div>

                  {exp.location && (
                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 shrink-0">
                      <MapPin size={13} className="text-[#10B981]" />
                      <span>{exp.location}</span>
                    </div>
                  )}
                </div>

                {/* Accomplishment points */}
                <ul className="space-y-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
                  {(exp.points || exp.description_points || []).map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-2.5">
                      <CheckCircle2 size={15} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {/* Tools / Core Competency Tags */}
                {exp.tools && exp.tools.length > 0 && (
                  <div className="pt-4 border-t border-[#1e2638]/60 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono text-gray-400 mr-1">Applied Competencies:</span>
                    {exp.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/25"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="mt-16 bg-[#111622] border border-[#1e2638] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Need a detailed operational breakdown?</h4>
            <p className="text-xs text-gray-400">Download Ashifur's official Curriculum Vitae with complete project timelines.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href={resumeUrl || "/resume.pdf"}
              download="Ashifur_Rahman_CV.pdf"
              className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition cursor-pointer"
            >
              <Download size={15} /> Download Official CV
            </a>
            <Link
              href="/contact"
              className="bg-[#0b0f17] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 transition"
            >
              Direct Message <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </section>

    </PortfolioLayout>
  );
}
