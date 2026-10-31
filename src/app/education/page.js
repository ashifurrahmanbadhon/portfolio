'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Check,
  Building,
  BookOpen,
  Download,
  ArrowRight
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function EducationPage() {
  const { educations, courseworkPillars, certifications, pageHeaders } = usePortfolio();

  const header = pageHeaders?.education || {
    title: "Academic Credentials &",
    highlight_word: "Certifications",
    description: "Formal degree in Electrical & Electronic Engineering complemented by on-site utility training at DESCO and CAD and GIS training."
  };

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Degree & Institutional History: 3 bordered cells (years mono amber, degree, institution faint) */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F2EA]">
            Academic Qualifications
          </h2>
          <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-2xl">
            A solid academic foundation covering electrical theories, mathematical modeling, and engineering principles.
          </p>
        </div>

        {/* 3 bordered cells */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {educations.map((edu, idx) => (
            <div
              key={idx}
              className="stat-box rounded-2xl p-7 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-5">
                  <GraduationCap size={22} />
                </div>

                {/* Years mono amber */}
                {edu.period && (
                  <span className="font-mono text-xs text-[#F59E0B] font-bold block mb-2 uppercase tracking-wider">
                    {edu.period}
                  </span>
                )}

                {/* Degree */}
                <h3 className="text-lg font-bold text-[#F5F2EA] uppercase tracking-wide leading-snug">
                  {edu.degree}
                </h3>

                {/* Institution faint */}
                <div className="flex items-center gap-1.5 text-xs text-[#8E8B82] font-mono mt-2">
                  <Building size={13} className="text-[#8E8B82]" />
                  <span>{edu.institution}</span>
                </div>

                {edu.result && (
                  <div className="mt-3">
                    <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25 font-bold">
                      {edu.result}
                    </span>
                  </div>
                )}

                {edu.description && (
                  <p className="text-xs text-[#B9B5A9] leading-relaxed mt-4 pt-4 border-t border-[#23242B]">
                    {edu.description}
                  </p>
                )}
              </div>

              {edu.highlights && edu.highlights.length > 0 && (
                <div className="mt-4 pt-3 flex flex-wrap gap-1.5">
                  {edu.highlights.map((h, hIdx) => (
                    <span
                      key={hIdx}
                      className="stat-box rounded text-[10px] font-mono text-[#8E8B82] px-2 py-0.5"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Core Engineering Coursework Breakdown */}
      {courseworkPillars && courseworkPillars.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 bg-[#06070B] border-y border-[#23242B]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F2EA]">
                Undergraduate Engineering Coursework
              </h3>
              <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2">
                Theoretical rigor paired with laboratory experimentation at university.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {courseworkPillars.map((pillar, idx) => (
                <div key={idx} className="stat-box rounded-2xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-4">
                      <BookOpen size={20} />
                    </div>
                    <h4 className="font-bold text-[#F5F2EA] text-base uppercase tracking-wide mb-3 pb-3 border-b border-[#23242B]">
                      {pillar.title}
                    </h4>

                    <ul className="space-y-2.5 text-xs text-[#B9B5A9]">
                      {(pillar.courses || []).map((course, cIdx) => (
                        <li key={cIdx} className="flex items-start gap-2">
                          <Check size={14} className="text-[#F59E0B] shrink-0 mt-0.5" />
                          <span>{course}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Certifications: img aspect 29/20, object-CONTAIN, bg #0C0D13, hover zoom over contain */}
      {certifications && certifications.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F2EA]">
              Training &amp; Certifications
            </h2>
            <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-2xl">
              Hands-on technical training in power software, substation protocol, and geospatial modeling, plus certified learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {certifications.map((cert, idx) => (
              <div
                key={idx}
                className="stat-box rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
              >
                <div>
                  {/* Certificate frame: aspect-[29/20], object-contain, bg-[#0C0D13], no lightbox */}
                  <div className="relative w-full aspect-[29/20] rounded-xl overflow-hidden mb-5 bg-[#0C0D13] border border-[#23242B] group/certimg">
                    <img
                      src={cert.image_url && cert.image_url.trim() ? cert.image_url : '/certs/no-image.svg'}
                      alt={cert.title || "Certificate"}
                      className="w-full h-full object-contain transition-transform duration-500 group-hover/certimg:scale-105 pointer-events-none"
                      draggable={false}
                      loading="lazy"
                      onError={(e) => {
                        if (e.currentTarget.src !== '/certs/no-image.svg') {
                          e.currentTarget.src = '/certs/no-image.svg';
                        }
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between mb-3 font-mono text-xs">
                    <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                      <ShieldCheck size={16} />
                    </div>
                    {cert.year && (
                      <span className="text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2.5 py-0.5 rounded border border-[#F59E0B]/25">
                        {cert.year}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-[#F5F2EA] mb-1 leading-snug uppercase tracking-wide">
                    {cert.title}
                  </h3>
                  {cert.issuer && (
                    <p className="font-mono text-xs text-[#8E8B82] mb-3">
                      {cert.issuer}
                    </p>
                  )}
                  {cert.description && (
                    <p className="text-xs text-[#B9B5A9] leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#23242B] flex items-center gap-1.5 text-xs font-mono text-[#F59E0B]">
                  <Check size={13} /> VERIFIED CREDENTIAL
                </div>
              </div>
            ))}
          </div>

          {/* CTA Bar */}
          <div className="mt-16 stat-box rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-bold uppercase tracking-tight text-[#F5F2EA]">
                Interested in Reviewing Verified Academic Transcripts?
              </h3>
              <p className="text-xs text-[#B9B5A9]">
                Download Ashifur's official Curriculum Vitae or request specific coursework verification.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={triggerCvDownload}
                className="btn-amber-solid px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Download size={15} /> Download Official CV
              </button>
              <Link
                href="/contact"
                className="btn-amber-outline px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
              >
                Get In Touch <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

    </PortfolioLayout>
  );
}
