'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Download,
  ArrowRight
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function ExperiencePage() {
  const { experiences, experienceMetrics, pageHeaders } = usePortfolio();

  const header = pageHeaders?.experience || {
    title: "Work Experience &",
    highlight_word: "Field Operations",
    description: "A dual-faceted career track combining high-voltage power distribution operations at DESCO with data analytics and workflow planning at Ventech Digital."
  };

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Metrics Row: Bordered grid */}
      {experienceMetrics && experienceMetrics.length > 0 && (
        <section className="relative z-10 border-b border-[#23242B] bg-[#0A0B10]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 sm:py-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#23242B]">
            {experienceMetrics.map((ch, idx) => (
              <div key={idx} className="stat-box border-0 p-3 sm:p-4 flex flex-col justify-center">
                <p className="text-xl sm:text-3xl font-black text-[#F59E0B] font-mono tracking-tight">{ch.metric}</p>
                <p className="text-xs sm:text-sm font-bold text-[#F5F2EA] mt-1.5 uppercase tracking-wide">{ch.label}</p>
                {ch.subtext && <p className="text-[11px] sm:text-xs text-[#8E8B82] font-mono mt-0.5">{ch.subtext}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main Experience: One bordered container, rows split by hairline */}
      <section className="relative z-10 px-4 sm:px-6 md:px-12 py-12 sm:py-20 max-w-5xl mx-auto">
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F2EA]">
            Engineering &amp; Management Roles
          </h2>
          <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-xl">
            Practical industry exposure demonstrating reliable execution, operational ownership, and technical adaptability.
          </p>
        </div>

        {/* Separate role boxes */}
        <div className="flex flex-col gap-6 sm:gap-8">
          {experiences.map((exp, idx) => (
            <div
              key={idx}
              className="stat-box group p-5 sm:p-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start"
            >
              {/* Left Col: Period (mono amber) + organization (faint) */}
              <div>
                <span className="font-mono text-xs sm:text-sm text-[#F59E0B] font-bold block uppercase tracking-wider">
                  {exp.period}
                </span>
                <p className="text-xs sm:text-sm text-[#8E8B82] font-mono mt-1 font-medium">
                  {exp.organization}
                </p>
                {exp.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8E8B82] font-mono mt-2">
                    <MapPin size={12} className="text-[#F59E0B]" />
                    <span>{exp.location}</span>
                  </div>
                )}
              </div>

              {/* Right Col: Role (bold) + description_points list, marker "—" amber */}
              <div>
                <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-[#F5F2EA]">
                  {exp.role}
                </h3>
                <ul className="text-xs sm:text-sm text-[#B9B5A9] space-y-2.5 mt-4 leading-relaxed">
                  {(exp.points || []).map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-start">
                      <span className="text-[#F59E0B] font-mono mr-2.5 shrink-0 font-bold">—</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                {exp.tools && exp.tools.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-[#23242B]">
                    {exp.tools.map((tool, tIdx) => (
                      <span
                        key={tIdx}
                        className="tag-plain border border-[#23242B] text-[#8E8B82] bg-[#0A0B10] group-hover:border-[#F59E0B]/70 group-hover:text-[#FBBF24] rounded-full text-[11px] font-mono px-2.5 py-1"
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
        <div className="mt-16 stat-box p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#F5F2EA]">
              Looking for Verified Verification Letters?
            </h3>
            <p className="text-xs text-[#B9B5A9]">
              Download Ashifur's official Curriculum Vitae or request specific training records.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={triggerCvDownload}
              className="stat-box text-[#F5F2EA] px-6 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} className="text-[#F59E0B]" /> Download Official CV
            </button>
            <Link
              href="/contact"
              className="stat-box text-[#F5F2EA] px-6 py-3.5 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              Get In Touch <ArrowRight size={15} className="text-[#F59E0B]" />
            </Link>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
