'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap,
  Download,
  Mail,
  ArrowRight,
  FolderGit2,
  Monitor,
  Database,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Layers,
  Calendar
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import { usePortfolio } from '@/context/PortfolioContext';

export default function Home() {
  const {
    heroData,
    aboutData,
    highlights,
    skillsData,
    projectsData,
    experiences,
    educations,
    openResumeModal
  } = usePortfolio();

  return (
    <PortfolioLayout>
      {/* 1. HERO SECTION */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              {heroData.badge_text || "Available for Engineering, Technology & AI Opportunities"}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {heroData.name || "ASHIFUR RAHMAN"}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400 text-2xl sm:text-4xl mt-2 font-bold font-mono">
                {heroData.title || "Electrical & Electronic Engineer"}
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
              {heroData.introduction}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/contact"
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300"
              >
                <Zap size={16} /> Contact Me
              </Link>
              <button
                type="button"
                onClick={openResumeModal}
                className="bg-[#111622] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 hover:bg-[#161e30] transition duration-300 cursor-pointer"
              >
                <Download size={16} /> {heroData.secondary_btn_text || "Download CV"}
              </button>
              <Link
                href="/projects"
                className="bg-[#0b0f17] text-gray-300 border border-[#1e2638] font-semibold text-xs uppercase tracking-wider px-5 py-3.5 rounded-lg flex items-center gap-2 hover:text-[#10B981] hover:border-[#10B981]/40 transition duration-300"
              >
                View Projects <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Profile Photo Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#10B981] to-teal-600 opacity-30 blur-xl group-hover:opacity-60 transition duration-500" />
              
              <div className="relative bg-[#111622] border-2 border-[#1e2638] rounded-3xl p-4 shadow-2xl">
                <div className="relative w-64 h-80 sm:w-72 sm:h-96 rounded-2xl overflow-hidden bg-[#0b0f17]">
                  <Image
                    src={heroData.profile_image || "/ashifur.jpeg"}
                    alt="Ashifur Rahman"
                    fill
                    className="object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition duration-500"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#10B981]">
                      {heroData.spec_badge_label || "Specialization"}
                    </p>
                    <p className="text-xs font-bold text-white">
                      {heroData.spec_badge_title || "Engineering, Management & AI"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. METRICS / HIGHLIGHTS BAR */}
      <section className="relative z-10 border-y border-[#1e2638] bg-[#0e131d]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {highlights.map((h, i) => (
            <div key={i}>
              <p className="text-3xl font-extrabold text-[#10B981] font-mono">{h.metric_value}</p>
              <p className="text-sm font-semibold text-white mt-1">{h.metric_label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{h.metric_subtext}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT OVERVIEW SECTION */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981]">About Ashifur</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Engineering Reliability, Efficiency &amp; Innovation
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Electrical &amp; Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#10B981] hover:text-emerald-300 group transition"
              >
                Read Full Biography <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/about" className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 group block">
              <Zap className="text-[#10B981] mb-3 group-hover:scale-110 transition" size={28} />
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">Substation Engineering</h4>
              <p className="text-xs text-gray-400">Transformers, switchgear, protective relays, and load flow maintenance at DESCO.</p>
            </Link>
            <Link href="/about" className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 group block">
              <Monitor className="text-[#10B981] mb-3 group-hover:scale-110 transition" size={28} />
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">AutoCAD Electrical</h4>
              <p className="text-xs text-gray-400">Single Line Diagrams (SLD), wiring schematics, and substation layout drafting.</p>
            </Link>
            <Link href="/about" className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 group block">
              <Database className="text-[#10B981] mb-3 group-hover:scale-110 transition" size={28} />
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">GIS Utility Mapping</h4>
              <p className="text-xs text-gray-400">Spatial data analysis, distribution network routing, and asset geodatabases.</p>
            </Link>
            <Link href="/about" className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 group block">
              <Briefcase className="text-[#10B981] mb-3 group-hover:scale-110 transition" size={28} />
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">Sales &amp; Project Analytics</h4>
              <p className="text-xs text-gray-400">BOQ preparation, equipment sizing, proposal formulation, and Excel analytics.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-[#0e131d] border-y border-[#1e2638]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Professional Experience</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">Career Journey &amp; Field Work</h3>
            </div>
            <Link
              href="/experience"
              className="text-xs font-mono uppercase tracking-wider text-[#10B981] hover:text-emerald-300 flex items-center gap-1 group shrink-0"
            >
              View Full Timeline <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="space-y-6">
            {experiences.slice(0, 2).map((exp, idx) => (
              <div
                key={idx}
                className="bg-[#111622] p-6 sm:p-7 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-bold text-white group-hover:text-[#10B981] transition">{exp.role}</h4>
                    <p className="text-xs font-semibold text-gray-300 mt-0.5">{exp.organization}</p>
                  </div>
                  <span className="text-xs font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full w-fit">
                    {exp.period}
                  </span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside">
                  {(exp.points || []).slice(0, 3).map((pt, pIdx) => (
                    <li key={pIdx}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED PROJECTS PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Engineering Portfolio</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Featured Engineering Projects</h3>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono uppercase tracking-wider text-[#10B981] hover:text-emerald-300 flex items-center gap-1 group shrink-0"
          >
            Explore All Projects ({projectsData.length}) <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.slice(0, 3).map((proj) => (
            <div
              key={proj.id}
              className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 flex flex-col justify-between hover:border-[#10B981]/40 hover:scale-[1.01] transition duration-300 group"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded">
                    PROJECT #{proj.id}
                  </span>
                  <FolderGit2 className="text-gray-500 group-hover:text-[#10B981] transition" size={20} />
                </div>
                <h4 className="text-base font-bold text-white mb-2.5 group-hover:text-[#10B981] transition">
                  {proj.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-6">
                  {proj.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-[#1e2638]/70">
                {(proj.tags || []).map((tag, tIdx) => (
                  <span key={tIdx} className="text-[11px] font-mono text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. TECHNICAL SKILLS PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-[#111622] border-y border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Technical Matrix</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white">Technical Skills &amp; Tools</h3>
            </div>
            <Link
              href="/skills"
              className="text-xs font-mono uppercase tracking-wider text-[#10B981] hover:text-emerald-300 flex items-center gap-1 group shrink-0"
            >
              View Full Competency Matrix <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {skillsData.map((cat, idx) => (
              <div key={idx} className="bg-[#0b0f17] p-6 rounded-2xl border border-[#1e2638] space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#1e2638]">
                  <div className="p-2 rounded-lg bg-[#10B981]/10 text-[#10B981]">
                    <Monitor size={20} />
                  </div>
                  <h4 className="font-bold text-white">{cat.category}</h4>
                </div>
                <div className="space-y-3 pt-2">
                  {cat.items.map((skill, sIdx) => (
                    <div key={sIdx}>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-gray-200">{skill.name}</span>
                        <span className="text-[#10B981] font-mono">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-[#1e2638] rounded-full h-1.5">
                        <div className="bg-[#10B981] h-1.5 rounded-full" style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. EDUCATION & CREDENTIALS PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Academic Credentials</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white">Education &amp; Qualifications</h3>
          </div>
          <Link
            href="/education"
            className="text-xs font-mono uppercase tracking-wider text-[#10B981] hover:text-emerald-300 flex items-center gap-1 group shrink-0"
          >
            View All Credentials <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">Bachelor of Science</span>
              <h4 className="text-lg font-bold text-white mt-1">Electrical &amp; Electronic Engineering</h4>
              <p className="text-sm text-gray-400 mt-1">IUBAT — International University of Business Agriculture and Technology</p>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-[#1e2638]">
              Comprehensive core coursework in Power Systems Analysis, High Voltage Engineering, Electrical Machines, Telecommunications, and Control Systems.
            </p>
          </div>

          <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">Certifications &amp; Training</span>
              <h4 className="text-lg font-bold text-white mt-1">Specialized Engineering Modules</h4>
              <p className="text-sm text-gray-400 mt-1">Industry Standards &amp; Practical Software</p>
            </div>
            <ul className="text-xs text-gray-400 space-y-2 pt-2 border-t border-[#1e2638]">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" /> AutoCAD Electrical 2D &amp; SLD Master Certification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" /> Substation Operations &amp; High Voltage Safety Protocols
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" /> GIS Spatial Data Analysis &amp; Utility Network Management
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION TO CONTACT */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-[#0e131d] border-t border-[#1e2638]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-mono">
            <Sparkles size={13} />
            <span>Open for Engineering &amp; AI Opportunities</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Let's Collaborate on Engineering Solutions
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Whether you need substation consultation, AutoCAD schematics, GIS utility analysis, or want to discuss technical roles, let's connect.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300"
            >
              <Mail size={16} /> Open Contact Hub
            </Link>
            <button
              type="button"
              onClick={openResumeModal}
              className="bg-[#111622] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:border-[#10B981]/50 hover:bg-[#161e30] transition duration-300 cursor-pointer"
            >
              <Download size={16} /> Download Official CV
            </button>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
