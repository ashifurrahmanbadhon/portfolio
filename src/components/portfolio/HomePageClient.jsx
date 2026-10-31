'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
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
  MapPin,
  CheckCircle2,
  Layers,
  Compass,
  FileSpreadsheet,
  Sun,
  Cpu
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import CountUp from '@/components/CountUp';
import { usePortfolio } from '@/context/PortfolioContext';
import { triggerCvDownload } from '@/lib/downloadCv';
import { parsePhotoPosition } from '@/lib/photoPosition';

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

const HOW_I_WORK_STEPS = [
  {
    num: "01",
    title: "Consult",
    desc: "We discuss your requirement — substation, design, GIS or automation — and I confirm scope honestly."
  },
  {
    num: "02",
    title: "Plan",
    desc: "You get a clear plan: deliverables, tools (AutoCAD, ETAP, GIS, AI) and a timeline before work starts."
  },
  {
    num: "03",
    title: "Execute",
    desc: "Work is done to standard — IEEE & BNBC compliant for engineering, tested end-to-end for automation."
  },
  {
    num: "04",
    title: "Support",
    desc: "Clean handover with documentation, plus support after delivery so nothing is left unclear."
  }
];

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
    services,
    workPackages,
    contactData,
    homepageCta
  } = usePortfolio();

  const fullName = (heroData?.name || "ASHIFUR RAHMAN").trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || "ASHIFUR";
  const lastName = nameParts.slice(1).join(" ") || "RAHMAN";

  const ctaData = {
    title: homepageCta?.title || "Let's Collaborate on Engineering Solutions",
    description: homepageCta?.description || "Whether you need substation consultation, AutoCAD schematics, GIS utility analysis, or want to discuss technical roles, let's connect.",
    primary_btn_text: homepageCta?.primary_btn_text || "Open Contact Hub",
    primary_btn_link: homepageCta?.primary_btn_link || "/contact",
    secondary_btn_text: homepageCta?.secondary_btn_text || "Download Official CV",
  };

  const previewPillars = Array.isArray(aboutData?.pillars) && aboutData.pillars.length > 0
    ? aboutData.pillars.slice(0, 4)
    : [];

  const previewPackages = Array.isArray(workPackages) && workPackages.length > 0
    ? workPackages.slice(0, 4)
    : [];

  const featuredEngineeringProjects = React.useMemo(() => {
    if (!Array.isArray(projectsData) || projectsData.length === 0) return [];
    const p1 = projectsData.find((p) => p.title?.includes("Buck Converter")) || projectsData[0];
    const p2 = projectsData.find((p) => p.title?.includes("Grid Substation")) || projectsData[1];
    const motor = projectsData.find((p) => p.title?.includes("Industrial Motor Control"));
    if (p1 && p2 && motor) {
      return [p1, p2, motor];
    }
    return projectsData.slice(0, 3);
  }, [projectsData]);

  return (
    <PortfolioLayout>
      {/* 1. HERO SECTION: 2-col grid (1.1fr / 0.9fr), name INSIDE left column, top-aligned with photo */}
      <section className="relative z-10 px-6 md:px-12 pt-10 pb-16 md:pt-14 md:pb-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Name & Intro */}
          <div className="flex flex-col justify-start">
            <h1 className="text-5xl sm:text-7xl lg:text-[88px] font-black uppercase tracking-tight leading-[0.92]">
              <span className="block text-[#F5F2EA]">{firstName}</span>
              <span className="block text-stroke-hero">{lastName}</span>
            </h1>

            {heroData.title && (
              <p className="font-mono text-xs sm:text-sm uppercase tracking-widest text-[#F59E0B] font-semibold mt-4">
                {heroData.title}
              </p>
            )}

            {heroData.introduction && (
              <p className="text-[#B9B5A9] text-base sm:text-lg max-w-xl leading-relaxed mt-6">
                {heroData.introduction}
              </p>
            )}

            {/* Action Buttons */}
            <div className="pt-8 flex flex-wrap items-center gap-4">
              <Link
                href={heroData.primary_btn_link || "/contact"}
                className="stat-box text-[#F5F2EA] px-7 py-4 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Mail size={16} className="text-[#F59E0B]" /> {heroData.primary_btn_text || "Contact Me"}
              </Link>
              <button
                type="button"
                onClick={triggerCvDownload}
                className="stat-box text-[#F5F2EA] px-7 py-4 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Download size={16} className="text-[#F59E0B]" /> {heroData.secondary_btn_text || "Download CV"}
              </button>
            </div>
          </div>

          {/* Right Column: Photo in hairline frame + padding 8px, aspect 3/4, caption row */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-[380px] stat-box p-2 shadow-2xl group">
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-[#06070B]">
                <Image
                  src={heroData.profile_image || "/ashifur-home.jpg"}
                  alt={heroData.name || "Ashifur Rahman"}
                  fill
                  className="object-cover group-hover:scale-[1.055] transition duration-500"
                  style={parsePhotoPosition(heroData.profile_position || "center 15%").style}
                  priority
                  sizes="(max-width: 640px) 100vw, 380px"
                />
              </div>

              {/* Caption row under img inside frame */}
              <div className="flex items-center justify-between px-2 pt-3 pb-1 font-mono text-[11px] text-[#8E8B82] uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#F59E0B] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  THE ENGINEER
                </span>
                <span className="flex items-center gap-1 text-[#8E8B82]">
                  <MapPin size={11} className="text-[#8E8B82]" />
                  {contactData.location || "Bangladesh"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. HIGHLIGHTS: 4 separate stat-boxes with complete borders on all 4 sides */}
      {highlights && highlights.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {highlights.map((h, i) => {
              const rawVal = String(h.metric_value || '').trim();
              const numMatch = rawVal.match(/^(\d+)(.*)$/);
              return (
                <div key={i} className="stat-box px-[22px] py-[26px] text-left flex flex-col justify-center">
                  <p className="text-[38px] font-extrabold text-[#F5F2EA] tracking-tight leading-none">
                    {numMatch ? (
                      <CountUp to={parseInt(numMatch[1], 10)} suffix={numMatch[2]} />
                    ) : (
                      rawVal
                    )}
                  </p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#B9B5A9] mt-[8px]">
                    {h.metric_label}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </section>
      )}

      {/* 4. ABOUT PREVIEW SECTION */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
        >
          <div className="lg:col-span-5 space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
              {aboutData.title || "Engineering Reliability & Innovation"}
            </h2>
            {aboutData.description1 && (
              <p className="text-[#B9B5A9] leading-relaxed text-sm sm:text-base">
                {aboutData.description1}
              </p>
            )}
            {aboutData.description2 && (
              <p className="text-[#8E8B82] text-xs sm:text-sm leading-relaxed">
                {aboutData.description2}
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] transition group"
              >
                Read Full Biography <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {previewPillars.map((pillar, pIdx) => {
              const Icon = resolveIcon(pillar.icon, Zap);
              return (
                <Link key={pIdx} href="/about" className="block h-full">
                  <div className="stat-box p-6 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-4">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-bold text-[#F5F2EA] mb-1.5 uppercase tracking-wide">
                        {pillar.title}
                      </h3>
                      {pillar.subtitle && (
                        <p className="font-mono text-xs text-[#F59E0B] mb-2 font-medium">
                          {pillar.subtitle}
                        </p>
                      )}
                      <p className="text-xs text-[#B9B5A9] leading-relaxed">
                        {pillar.description || pillar.subtitle}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* 5. FEATURED PROJECTS PREVIEW (First 3) */}
      {projectsData && projectsData.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                  Featured Engineering Projects
                </h2>
              </div>
              <Link
                href="/projects"
                className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] font-bold flex items-center gap-1.5 group shrink-0"
              >
                Explore All Projects ({projectsData.length}) <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredEngineeringProjects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  className="stat-box group p-6 flex flex-col justify-between"
                >
                  <div>
                    {proj.image_url && (
                      <div className="relative w-full aspect-[16/9] overflow-hidden mb-4 bg-[#06070B] border border-[#23242B]">
                        <Image
                          src={proj.image_url}
                          alt={proj.title}
                          fill
                          className="object-cover transition duration-500"
                          style={parsePhotoPosition(proj.image_position || "center center").style}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-2 font-mono text-xs">
                      <span className="text-[#F59E0B] font-bold">
                        / {String(proj.project_number || idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[#8E8B82] group-hover:text-[#FBBF24] transition-colors uppercase text-[11px]">
                        {proj.category}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#F5F2EA] mb-2 leading-snug uppercase tracking-wide">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-[#B9B5A9] leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[#23242B]">
                    {(proj.tags || []).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="tag-plain border border-[#23242B] text-[#8E8B82] bg-[#0A0B10] group-hover:border-[#F59E0B]/70 group-hover:text-[#FBBF24] rounded-full text-[10px] font-mono px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* 6. EXPERIENCE PREVIEW */}
      {experiences && experiences.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                  Career Journey &amp; Field Work
                </h2>
              </div>
              <Link
                href="/experience"
                className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] font-bold flex items-center gap-1.5 group shrink-0"
              >
                View Full Timeline <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="flex flex-col gap-8">
              {experiences.slice(0, 2).map((exp, idx) => (
                <div
                  key={idx}
                  className="stat-box group p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 items-start"
                >
                  <div>
                    <span className="font-mono text-xs text-[#F59E0B] font-semibold block">
                      {exp.period}
                    </span>
                    <p className="text-xs text-[#8E8B82] mt-1 font-mono">
                      {exp.organization}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5F2EA] uppercase tracking-wide">
                      {exp.role}
                    </h3>
                    <ul className="text-xs text-[#B9B5A9] space-y-2 mt-3 leading-relaxed">
                      {(exp.points || []).slice(0, 3).map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start">
                          <span className="text-[#F59E0B] mr-2 font-mono shrink-0">—</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* 7. SKILLS PREVIEW */}
      {skillsData && skillsData.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
              <div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                  Technical Skills &amp; Tools
                </h2>
              </div>
              <Link
                href="/skills"
                className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] font-bold flex items-center gap-1.5 group shrink-0"
              >
                View Full Matrix <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {skillsData.map((cat, idx) => (
                <div key={idx} className="stat-box p-6 space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-[#23242B]">
                    <span className="font-mono text-xs text-[#F59E0B] font-bold">
                      0{idx + 1} /
                    </span>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[#F5F2EA]">
                      {cat.category}
                    </h3>
                  </div>
                  <div className="space-y-3 pt-1">
                    {cat.items.slice(0, 4).map((skill, sIdx) => (
                      <div key={sIdx} className="border-b border-dashed border-[#23242B]/70 pb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#F5F2EA] font-medium">{skill.name}</span>
                          <span className="text-[#F59E0B] font-mono text-[11px] font-bold">{skill.level}%</span>
                        </div>
                        <div className="w-full bg-[#181920] rounded-full h-1 overflow-hidden">
                          <div className="bg-[#F59E0B] h-1 rounded-full" style={{ width: `${skill.level}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* 8. EDUCATION PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                Education &amp; Credentials
              </h2>
            </div>
            <Link
              href="/education"
              className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] font-bold flex items-center gap-1.5 group shrink-0"
            >
              View All Credentials <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {educations && educations.length > 0 && (
              <div className="stat-box p-8 space-y-4">
                <span className="font-mono text-xs text-[#F59E0B] font-semibold uppercase tracking-wider">
                  {educations[0].period || "Degree Completed"}
                </span>
                <h3 className="text-lg font-bold text-[#F5F2EA] uppercase tracking-wide">
                  {educations[0].degree}
                </h3>
                <p className="text-xs text-[#8E8B82] font-mono">
                  {educations[0].institution}
                </p>
                {educations[0].description && (
                  <p className="text-xs text-[#B9B5A9] leading-relaxed pt-3 border-t border-[#23242B]">
                    {educations[0].description}
                  </p>
                )}
              </div>
            )}

            <div className="stat-box p-8 space-y-4">
              <span className="font-mono text-xs text-[#F59E0B] font-semibold uppercase tracking-wider">
                Certifications &amp; Training
              </span>
              <h3 className="text-lg font-bold text-[#F5F2EA] uppercase tracking-wide">
                Specialized Engineering Modules
              </h3>
              <p className="text-xs text-[#8E8B82] font-mono">
                Industry Standards &amp; Practical Training
              </p>
              <ul className="text-xs text-[#B9B5A9] space-y-2 pt-3 border-t border-[#23242B]">
                {(certifications || []).slice(0, 3).map((cert, cIdx) => (
                  <li key={cIdx} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-[#F59E0B] shrink-0" />
                    <span className="line-clamp-1">{cert.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 9. SERVICES PREVIEW (Dynamic from CMS) */}
      {services && services.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-10">
              <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                Engineering Services
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {services.map((srv, idx) => {
                const Icon = resolveIcon(srv.icon, Zap);
                return (
                  <div key={srv.id || idx} className="stat-box p-6 flex flex-col justify-between">
                    <div>
                      <div className="w-10 h-10 bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-4">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-base font-bold text-[#F5F2EA] mb-2 uppercase tracking-wide">
                        {srv.title}
                      </h3>
                      <p className="text-xs text-[#B9B5A9] leading-relaxed">
                        {srv.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </section>
      )}

      {/* 9B. SERVICE PACKAGES PREVIEW (Dynamic from CMS work_packages) */}
      {previewPackages.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="mb-10">
              <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
                Digital Services
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {previewPackages.map((pkg, idx) => {
                const presetNum = String(pkg.sort_order || idx + 1).padStart(2, '0');
                const rawDesc = (pkg.description || '').trim();
                const truncatedDesc = rawDesc.length > 110 ? rawDesc.slice(0, 110).trim() + '…' : rawDesc;

                return (
                  <Link
                    key={pkg.id || idx}
                    href="/work"
                    className="stat-box p-6 sm:p-7 flex flex-col justify-between group no-underline transition block"
                  >
                    <div>
                      <div className="flex items-center justify-between font-mono text-xs mb-3">
                        <span className="text-[#F59E0B] font-bold tracking-wider">
                          PRESET — {presetNum}
                        </span>
                        <span className="text-[#8E8B82] uppercase tracking-wider font-medium text-[11px]">
                          {pkg.category || 'SERVICE'}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#F5F2EA] mb-2 leading-tight group-hover:text-[#FBBF24] transition-colors">
                        {pkg.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#B9B5A9] leading-relaxed line-clamp-1">
                        {truncatedDesc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center">
              <Link
                href="/work"
                className="stat-box inline-block py-3 px-8 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] no-underline transition"
              >
                View All Packages &rarr;
              </Link>
            </div>
          </motion.div>
        </section>
      )}

      {/* 10. NEW STATIC SECTION "How I Work" AFTER SERVICES PREVIEW */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight">
              How I Work
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_I_WORK_STEPS.map((step) => (
              <div
                key={step.num}
                className="stat-box p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono text-4xl sm:text-5xl font-black text-stroke-numeral mb-4">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-[#F5F2EA] mb-2 uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#B9B5A9] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 11. HOMEPAGE CALL TO ACTION: existing DB CTA content, centered, hover inset amber ring */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="stat-box p-10 sm:p-14 text-center space-y-6"
        >
          <h2 className="text-2xl sm:text-4xl font-black text-[#F5F2EA] uppercase tracking-tight max-w-2xl mx-auto leading-tight">
            {ctaData.title}
          </h2>
          <p className="text-[#B9B5A9] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            {ctaData.description}
          </p>
          <div className="pt-3 flex flex-wrap justify-center gap-4">
            <Link
              href={ctaData.primary_btn_link}
              className="stat-box text-[#F5F2EA] px-8 py-4 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Mail size={16} className="text-[#F59E0B]" /> {ctaData.primary_btn_text}
            </Link>
            <button
              type="button"
              onClick={triggerCvDownload}
              className="stat-box text-[#F5F2EA] px-8 py-4 text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Download size={16} className="text-[#F59E0B]" /> {ctaData.secondary_btn_text || "Download CV"}
            </button>
          </div>
        </motion.div>
      </section>

    </PortfolioLayout>
  );
}
