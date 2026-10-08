'use client';

import React from 'react';
import Link from 'next/link';
import {
  Monitor,
  Database,
  ShieldCheck,
  Check,
  Cpu,
  Layers,
  ArrowRight,
  Download,
  Terminal,
  Compass,
  FileSpreadsheet,
  Sun,
  Zap,
  Sparkles
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

const ICON_MAP = {
  Monitor,
  Database,
  ShieldCheck,
  Cpu,
  Terminal,
  Compass,
  FileSpreadsheet,
  Sun,
  Zap,
  Sparkles,
  Layers
};

function resolveIcon(iconName, Fallback = Monitor) {
  if (!iconName) return Fallback;
  if (typeof iconName === 'object' || typeof iconName === 'function') return iconName;
  return ICON_MAP[iconName] || Fallback;
}

export default function SkillsPage() {
  const { skillsData, softwareTools, skillBadges, pageHeaders, openResumeModal } = usePortfolio();

  const header = pageHeaders?.skills || {
    badge_text: "TECHNICAL PROFICIENCY",
    title: "Technical Skills Matrix &",
    highlight_word: "Tool Competency",
    description: "Applied expertise across electrical design, power system analysis software, spatial GIS utilities, data modeling, and industrial programming."
  };

  const getCategoryIcon = (category = '') => {
    const c = category.toLowerCase();
    if (c.includes('design') || c.includes('simulation') || c.includes('cad')) return Monitor;
    if (c.includes('gis') || c.includes('data')) return Database;
    return ShieldCheck;
  };

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Skills' }]}
        badgeText={header.badge_text}
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Main Technical Domains Grid */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Applied Competency</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Domain Competency Ratings</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            Empirically evaluated proficiencies cultivated through academic labs, field internships, and professional operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillsData.map((category, idx) => {
            const CatIcon = getCategoryIcon(category.category);
            return (
              <div
                key={idx}
                className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 sm:p-7 flex flex-col justify-between hover:border-[#10B981]/40 transition duration-300"
              >
                <div>
                  <div className="flex items-center gap-3 pb-4 border-b border-[#1e2638]/70 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center border border-[#10B981]/30">
                      <CatIcon size={20} />
                    </div>
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      {category.category}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {category.items.map((skill, sIdx) => (
                      <div key={sIdx} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-gray-200">{skill.name}</span>
                          <span className="font-mono text-[#10B981] font-bold">{skill.level}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#0b0f17] border border-[#1e2638] overflow-hidden p-0.5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-teal-400 transition-all duration-700"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Software & Technical Tools in Detail (100% Dynamic from CMS) */}
      {softwareTools && softwareTools.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-y border-[#1e2638]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Software Stack</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineering Software &amp; Frameworks</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-3">
                Industrial applications and computational platforms utilized in daily engineering, drafting, and data modeling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {softwareTools.map((tool, idx) => {
                const ToolIcon = resolveIcon(tool.icon, Monitor);
                return (
                  <div
                    key={idx}
                    className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition space-y-4 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 group-hover:scale-105 transition">
                        <ToolIcon size={20} />
                      </div>
                      {tool.level && (
                        <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20">
                          {tool.level}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-[#10B981] transition">{tool.name}</h4>
                      {tool.tool_type && (
                        <p className="text-xs font-mono text-gray-400 mt-0.5">{tool.tool_type}</p>
                      )}
                    </div>

                    {tool.summary && (
                      <p className="text-xs text-gray-300 leading-relaxed pt-1 border-t border-[#1e2638]">
                        {tool.summary}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Applied Standards, Methodologies & Protocols (100% Dynamic from CMS) */}
      {skillBadges && skillBadges.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Technical Standards</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineering Protocols &amp; Regulatory Standards</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">
                Knowledge frameworks governing electrical installations, distribution grids, and computational reliability.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {(Array.isArray(skillBadges) ? skillBadges : []).map((badge, idx) => {
                const text = typeof badge === "object" && badge !== null ? (badge.name || "") : String(badge || "");
                if (!text) return null;
                return (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 text-xs text-gray-200 transition"
                  >
                    <Check size={14} className="text-[#10B981] shrink-0" />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>

            {/* Bottom CV download banner */}
            <div className="pt-8">
              <button
                type="button"
                onClick={openResumeModal}
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-xl inline-flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition duration-300 cursor-pointer"
              >
                <Download size={16} /> Download Full Skills Dossier &amp; CV
              </button>
            </div>
          </div>
        </section>
      )}

    </PortfolioLayout>
  );
}
