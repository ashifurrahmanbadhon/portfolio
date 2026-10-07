'use client';

import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  Check,
  Calendar,
  Building,
  Award,
  BookOpen,
  Download,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function EducationPage() {
  const { educations, certifications, openResumeModal } = usePortfolio();

  const courseworkPillars = [
    {
      title: "Power & High Voltage Systems",
      courses: [
        "Power System Analysis & Grid Stability",
        "High Voltage Engineering (HV Generation & Testing)",
        "Switchgear & Substation Protection",
        "Transmission & Distribution Systems"
      ]
    },
    {
      title: "Electronics & Energy Conversion",
      courses: [
        "Power Electronics & Inverter Topologies",
        "Electrical Machines (Transformers, Induction & DC)",
        "Renewable Energy Systems & Solar PV Modeling",
        "Industrial Automation & Motor Controls"
      ]
    },
    {
      title: "Control, Signals & Computing",
      courses: [
        "Control Systems Engineering",
        "Digital Signal Processing (DSP)",
        "Telecommunications Engineering",
        "Numerical Methods & MATLAB Simulation"
      ]
    }
  ];

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Education' }]}
        badgeText="ACADEMIC BACKGROUND"
        title="Academic Credentials &"
        highlightWord="Certifications"
        description="Formal degree in Electrical & Electronic Engineering complemented by on-site utility training at DESCO and accredited CAD and GIS certifications."
      />

      {/* Degree & Institutional History */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Formal Degrees</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Academic Qualifications</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            A solid academic foundation covering electrical theories, mathematical modeling, and engineering principles.
          </p>
        </div>

        <div className="space-y-6">
          {educations.map((edu, idx) => (
            <div
              key={idx}
              className={`bg-[#111622] rounded-2xl border p-6 sm:p-8 transition duration-300 ${
                idx === 0
                  ? 'border-[#10B981]/40 shadow-[0_0_30px_rgba(16,185,129,0.06)]'
                  : 'border-[#1e2638] hover:border-[#10B981]/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1e2638]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0 mt-1">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {edu.degree}
                      </h3>
                      {idx === 0 && (
                        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                          Major Degree
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300 mt-1">
                      <Building size={14} className="text-[#10B981]" />
                      <span>{edu.institution}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-gray-400 shrink-0">
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0f17] border border-[#1e2638]">
                    <Calendar size={13} className="text-[#10B981]" />
                    {edu.period}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25 font-bold">
                    {edu.result}
                  </span>
                </div>
              </div>

              <div className="pt-4 text-xs sm:text-sm text-gray-300 leading-relaxed">
                <p>{edu.description}</p>
                {edu.highlights && edu.highlights.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {edu.highlights.map((h, hIdx) => (
                      <span
                        key={hIdx}
                        className="text-[11px] font-mono text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638]"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Engineering Coursework Breakdown */}
      <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-y border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Curriculum Breadth</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Undergraduate Engineering Coursework</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-3">
              Theoretical rigor paired with laboratory experimentation at IUBAT.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courseworkPillars.map((pillar, idx) => (
              <div key={idx} className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#1e2638]">
                  <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                    <BookOpen size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm sm:text-base">{pillar.title}</h4>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-300">
                  {pillar.courses.map((course, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-2">
                      <Check size={14} className="text-[#10B981] shrink-0 mt-0.5" />
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Industry Modules */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Field &amp; Software Training</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Professional Certifications</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            Hands-on technical certifications proving proficiency in power software, substation protocol, and geospatial modeling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {certifications.map((cert, idx) => (
            <div
              key={idx}
              className="bg-[#111622] p-7 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-xs font-mono text-gray-400">{cert.year}</span>
                </div>

                <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">
                  {cert.title}
                </h4>
                <p className="text-xs font-mono text-[#10B981] mb-3">{cert.issuer}</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {cert.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1e2638]/70 flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <Check size={14} /> Verified Credential
              </div>
            </div>
          ))}
        </div>

        {/* CTA Bar */}
        <div className="mt-16 bg-[#111622] border border-[#1e2638] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Interested in reviewing verified academic transcripts?</h4>
            <p className="text-xs text-gray-400">Download Ashifur's official Curriculum Vitae or request specific coursework verification.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openResumeModal}
              className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition cursor-pointer"
            >
              <Download size={15} /> Download Official CV
            </button>
            <Link
              href="/contact"
              className="bg-[#0b0f17] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 transition"
            >
              Get In Touch <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
