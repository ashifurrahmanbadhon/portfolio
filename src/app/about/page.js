'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Zap,
  Monitor,
  Database,
  Briefcase,
  Cpu,
  ShieldCheck,
  ArrowRight,
  Download,
  GraduationCap,
  Sparkles,
  Compass,
  FileSpreadsheet,
  Sun,
  Layers,
  MapPin,
  Mail
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
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
  Layers
};

function resolveIcon(iconName, Fallback = Zap) {
  if (!iconName) return Fallback;
  if (typeof iconName === 'object' || typeof iconName === 'function') return iconName;
  return ICON_MAP[iconName] || Fallback;
}

export default function AboutPage() {
  const {
    heroData,
    aboutData,
    highlights,
    contactData,
    pageHeaders
  } = usePortfolio();

  const header = pageHeaders?.about || {
    title: "About Ashifur Rahman",
    highlight_word: "— Engineering & AI",
    description: "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence."
  };

  const pillars = Array.isArray(aboutData?.pillars) ? aboutData.pillars : [];

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Main Narrative & Profile Section: Bordered box, grid 1.32fr/.68fr, align start */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="border border-[#23242B] bg-[#0A0B10] rounded-2xl p-6 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-[1.32fr_0.68fr] gap-10 items-start shadow-xl">
          
          {/* Left Column: All existing about fields + focus chips (hairline chips, mono) */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F2EA] leading-snug">
              {aboutData.title}
            </h2>

            {aboutData.subtitle && (
              <p className="font-mono text-xs text-[#F59E0B] font-semibold uppercase tracking-wider">
                {aboutData.subtitle}
              </p>
            )}

            <div className="space-y-4 text-[#B9B5A9] text-sm sm:text-base leading-relaxed">
              {aboutData.description1 && (
                <p>{aboutData.description1}</p>
              )}
              {aboutData.description2 && (
                <p>{aboutData.description2}</p>
              )}
            </div>

            {/* Focus Chips (hairline chips, mono) */}
            <div className="pt-2">
              <p className="font-mono text-[11px] text-[#8E8B82] uppercase tracking-wider mb-3 font-semibold">
                Core Focus Domains
              </p>
              <div className="flex flex-wrap gap-2.5">
                {aboutData.focus1_title && (
                  <span className="border border-[#23242B] bg-[#06070B] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#F5F2EA] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    {aboutData.focus1_title}
                  </span>
                )}
                {aboutData.focus2_title && (
                  <span className="border border-[#23242B] bg-[#06070B] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#F5F2EA] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                    {aboutData.focus2_title}
                  </span>
                )}
                <span className="border border-[#23242B] bg-[#06070B] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#B9B5A9]">
                  IEEE &amp; BNBC Standards
                </span>
                <span className="border border-[#23242B] bg-[#06070B] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#B9B5A9]">
                  ArcGIS &amp; QGIS
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="btn-amber-solid px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
              >
                View Case Studies <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={triggerCvDownload}
                className="btn-amber-outline px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Download size={15} /> Download CV
              </button>
            </div>
          </div>

          {/* Right Column: profile_image at width 86%, aspect 3/4, centered with margin, top-aligned (≈ text-block height; no full-column stretch) */}
          <div className="flex justify-center w-full">
            <div className="w-[86%] max-w-[340px] border border-[#23242B] bg-[#06070B] p-2 rounded-2xl shadow-xl group">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#06070B]">
                <Image
                  src={aboutData.profile_image || "/ashifur-about.jpg"}
                  alt={heroData.name || "Ashifur Rahman"}
                  fill
                  className="object-cover group-hover:scale-[1.055] transition duration-500"
                  style={parsePhotoPosition(aboutData.profile_position || "center 12%").style}
                  priority
                  unoptimized
                />
              </div>

              {/* Minimal caption below photo */}
              <div className="px-2 pt-3 pb-1 flex items-center justify-between font-mono text-[11px] text-[#8E8B82]">
                <span className="text-[#F59E0B] font-semibold">ENGINEERING PROFILE</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {contactData.location || "Bangladesh"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pillars of Engineering Competency */}
      {pillars && pillars.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F2EA]">
              Engineering Domains &amp; Capabilities
            </h2>
            <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-2xl">
              A versatile spectrum combining traditional high-voltage engineering with modern data-driven and computational methods.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((pillar, idx) => {
              const Icon = resolveIcon(pillar.icon, Zap);
              return (
                <div
                  key={idx}
                  className="luxury-box p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] mb-5">
                      <Icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-[#F5F2EA] mb-1.5 uppercase tracking-wide">
                      {pillar.title}
                    </h3>
                    {pillar.subtitle && (
                      <p className="font-mono text-xs text-[#F59E0B] font-medium mb-3">
                        {pillar.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-[#B9B5A9] leading-relaxed">
                      {pillar.description || pillar.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA Bar */}
      <section className="relative z-10 px-6 md:px-12 py-16 max-w-5xl mx-auto">
        <div className="luxury-box p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1.5">
            <h3 className="text-xl font-bold uppercase tracking-tight text-[#F5F2EA]">
              Have a Project in Mind?
            </h3>
            <p className="text-xs text-[#B9B5A9]">
              Reach out directly to discuss substation design, drafting, or AI-powered workflow automations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="btn-amber-solid px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
            >
              Get In Touch <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
