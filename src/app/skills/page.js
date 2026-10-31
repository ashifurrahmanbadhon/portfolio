'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  ArrowRight
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';
import { triggerCvDownload } from '@/lib/downloadCv';

export default function SkillsPage() {
  const { skillsData, softwareTools, skillBadges, pageHeaders } = usePortfolio();

  const header = pageHeaders?.skills || {
    title: "Technical Skills Matrix &",
    highlight_word: "Tool Competency",
    description: "Applied expertise across electrical design, power system analysis software, spatial GIS utilities, data modeling, and industrial programming."
  };

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Main Technical Domains: Groups as 2-col hairline grid cells (bg page color, gap 1px over hairline bg) */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#F5F2EA]">
            Domain Competency Ratings
          </h2>
          <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-2xl">
            Empirically evaluated proficiencies cultivated through academic labs, field internships, and professional operations.
          </p>
        </div>

        {/* 2-col hairline grid */}
        <div className="bg-[#23242B] p-[1px] rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-[1px] overflow-hidden shadow-xl mb-16">
          {skillsData.map((category, idx) => (
            <div
              key={idx}
              className="stat-box border-0 p-6 sm:p-10 flex flex-col justify-between"
            >
              <div>
                {/* Group title uppercase with mono amber index */}
                <div className="flex items-center gap-2 pb-4 border-b border-[#23242B] mb-4">
                  <span className="font-mono text-sm text-[#F59E0B] font-bold">
                    0{idx + 1} /
                  </span>
                  <h3 className="font-bold text-[#F5F2EA] text-base sm:text-lg uppercase tracking-wider">
                    {category.category}
                  </h3>
                </div>

                {/* Skills as rows with dashed separators */}
                <div className="divide-y divide-dashed divide-[#23242B]">
                  {category.items.map((skill, sIdx) => (
                    <div
                      key={sIdx}
                      className="py-3 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="text-[#F5F2EA] font-medium">{skill.name}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 sm:w-32 bg-[#181920] rounded-full h-1 overflow-hidden hidden sm:block">
                          <div
                            className="bg-[#F59E0B] h-1 rounded-full"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs text-[#F59E0B] font-bold min-w-[36px] text-right">
                          {skill.level}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Software Tools = chips row; chip hover: amber border + amber text */}
        {softwareTools && softwareTools.length > 0 && (
          <div className="border border-[#23242B] bg-[#0A0B10] rounded-2xl p-6 sm:p-10 space-y-6 shadow-xl mb-16">
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#F5F2EA]">
                Engineering Software &amp; Tool Stack
              </h3>
              <p className="text-xs text-[#B9B5A9] mt-1">
                Industry-standard engineering applications utilized for simulation, network layout, spatial mapping, and analytics.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {softwareTools.map((tool, idx) => {
                const name = typeof tool === 'object' ? tool.name : tool;
                const cat = typeof tool === 'object' ? tool.category : null;
                return (
                  <span
                    key={idx}
                    className="stat-box rounded-lg px-3.5 py-2 text-xs font-mono text-[#B9B5A9] flex items-center gap-2"
                  >
                    <span className="text-[#F59E0B]">✦</span>
                    <span>{name}</span>
                    {cat && <span className="text-[10px] text-[#8E8B82]">({cat})</span>}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Skill Badges if available */}
        {skillBadges && skillBadges.length > 0 && (
          <div className="border border-[#23242B] bg-[#0A0B10] rounded-2xl p-6 sm:p-10 space-y-4 shadow-xl mb-16">
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#F5F2EA]">
              Core Competencies
            </h3>
            <div className="flex flex-wrap gap-2">
              {skillBadges.map((badge, bIdx) => (
                <span
                  key={bIdx}
                  className="stat-box rounded-full font-mono text-xs px-3 py-1.5 text-[#B9B5A9] inline-flex items-center"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA Bar */}
        <div className="stat-box rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#F5F2EA]">
              Require Custom Technical Simulation or Mapping?
            </h3>
            <p className="text-xs text-[#B9B5A9]">
              Let's talk through your electrical single-line diagram, GIS network data, or automated data pipeline.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="btn-amber-solid px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
            >
              Discuss Requirement <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              onClick={triggerCvDownload}
              className="btn-amber-outline px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
            >
              <Download size={15} /> Download CV
            </button>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
