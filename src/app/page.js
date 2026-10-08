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
  Calendar,
  Cpu,
  Compass,
  FileSpreadsheet,
  Sun
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import { usePortfolio } from '@/context/PortfolioContext';

// Helper for dynamic icons
const ICON_MAP = {
  Zap,
  Monitor,
  Database,
  Briefcase,
  Cpu,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Compass,
  FileSpreadsheet,
  Sun,
  Layers,
};

function resolveIcon(iconName, Fallback = Zap) {
  if (!iconName) return Fallback;
  if (typeof iconName === 'object' || typeof iconName === 'function') return iconName;
  return ICON_MAP[iconName] || Fallback;
}

export default function Home() {
  const {
    heroData,
    aboutData,
    highlights,
    skillsData,
    projectsData,
    experiences,
    educations,
    certifications,
    homepageCta,
    openResumeModal
  } = usePortfolio();

  const ctaData = {
    badge_text: homepageCta?.badge_text || "Open for Engineering & AI Opportunities",
    title: homepageCta?.title || "Let's Collaborate on Engineering Solutions",
    description: homepageCta?.description || "Whether you need substation consultation, AutoCAD schematics, GIS utility analysis, or want to discuss technical roles, let's connect.",
    primary_btn_text: homepageCta?.primary_btn_text || "Open Contact Hub",
    primary_btn_link: homepageCta?.primary_btn_link || "/contact",
    secondary_btn_text: homepageCta?.secondary_btn_text || "Download Official CV",
  };

  const previewPillars = Array.isArray(aboutData?.pillars) && aboutData.pillars.length > 0
    ? aboutData.pillars.slice(0, 4)
    : [];

  return (
    <PortfolioLayout>
      {/* 1. HERO SECTION */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            {heroData.badge_text && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold font-mono tracking-wide">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                {heroData.badge_text}
              </div>
            )}

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              {heroData.name || "ASHIFUR RAHMAN"}
              {heroData.title && (
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400 text-2xl sm:text-4xl mt-2 font-bold font-mono">
                  {heroData.title}
                </span>
              )}
            </h1>

            {heroData.introduction && (
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                {heroData.introduction}
              </p>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href={heroData.primary_btn_link || "/contact"}
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300"
              >
                <Zap size={16} /> {heroData.primary_btn_text || "Contact Me"}
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
                    alt={heroData.name || "Ashifur Rahman"}
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
      {highlights && highlights.length > 0 && (
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
      )}

      {/* 3. ABOUT OVERVIEW SECTION */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981]">
              {aboutData.subtitle || "About Ashifur"}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              {aboutData.title || "Engineering Reliability, Efficiency & Innovation"}
            </h2>
            {aboutData.description1 && (
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {aboutData.description1}
              </p>
            )}
            {aboutData.description2 && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {aboutData.description2}
              </p>
            )}
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
            {previewPillars.map((pillar, pIdx) => {
              const Icon = resolveIcon(pillar.icon, Zap);
              return (
                <Link
                  key={pIdx}
                  href="/about"
                  className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 group block"
                >
                  <Icon className="text-[#10B981] mb-3 group-hover:scale-110 transition" size={28} />
                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {pillar.subtitle || pillar.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCE PREVIEW */}
      {experiences && experiences.length > 0 && (
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
      )}

      {/* 5. FEATURED PROJECTS PREVIEW */}
      {projectsData && projectsData.length > 0 && (
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
                className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 flex flex-col justify-between hover:border-[#10B981]/40 hover:scale-[1.01] transition duration-300 group overflow-hidden"
              >
                <div>
                  {proj.image_url && (
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-4 bg-[#070a0f] border border-[#1e2638]">
                      <Image
                        src={proj.image_url}
                        alt={proj.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                        unoptimized
                      />
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded">
                      PROJECT #{proj.project_number || proj.id}
                    </span>
                    <FolderGit2 className="text-gray-500 group-hover:text-[#10B981] transition" size={20} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-[#10B981] transition leading-snug">
                    {proj.title}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">
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
      )}

      {/* 6. TECHNICAL SKILLS PREVIEW */}
      {skillsData && skillsData.length > 0 && (
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
      )}

      {/* 7. EDUCATION & CREDENTIALS PREVIEW (Fully Dynamic) */}
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
          {/* Main Degree Card */}
          {educations && educations.length > 0 && (
            <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <GraduationCap size={24} />
              </div>
              <div>
                <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">
                  {educations[0].period || "Degree Completed"}
                </span>
                <h4 className="text-lg font-bold text-white mt-1">{educations[0].degree}</h4>
                <p className="text-sm text-gray-400 mt-1">{educations[0].institution}</p>
              </div>
              {educations[0].description && (
                <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-[#1e2638]">
                  {educations[0].description}
                </p>
              )}
            </div>
          )}

          {/* Dynamic Certifications Box */}
          <div className="bg-[#111622] p-8 rounded-2xl border border-[#1e2638] space-y-4">
            <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-xs font-mono text-[#10B981] uppercase tracking-wider">Certifications &amp; Training</span>
              <h4 className="text-lg font-bold text-white mt-1">Specialized Engineering Modules</h4>
              <p className="text-sm text-gray-400 mt-1">Industry Standards &amp; Practical Training</p>
            </div>
            <ul className="text-xs text-gray-400 space-y-2 pt-2 border-t border-[#1e2638]">
              {(certifications || []).slice(0, 3).map((cert, cIdx) => (
                <li key={cIdx} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#10B981] shrink-0" />
                  <span>{cert.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION TO CONTACT (Dynamic) */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-[#0e131d] border-t border-[#1e2638]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-xs font-mono">
            <Sparkles size={13} />
            <span>{ctaData.badge_text}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            {ctaData.title}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {ctaData.description}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href={ctaData.primary_btn_link}
              className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition duration-300"
            >
              <Mail size={16} /> {ctaData.primary_btn_text}
            </Link>
            <button
              type="button"
              onClick={openResumeModal}
              className="bg-[#111622] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl flex items-center gap-2 hover:border-[#10B981]/50 hover:bg-[#161e30] transition duration-300 cursor-pointer"
            >
              <Download size={16} /> {ctaData.secondary_btn_text}
            </button>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
