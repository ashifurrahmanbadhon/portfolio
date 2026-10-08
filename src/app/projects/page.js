'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FolderGit2,
  ExternalLink,
  Zap,
  Tag,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function ProjectsPage() {
  const { projectsData, projectMethodologies, pageHeaders } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const header = pageHeaders?.projects || {
    badge_text: "ENGINEERING CASE STUDIES",
    title: "Featured Engineering &",
    highlight_word: "Technical Projects",
    description: "Comprehensive engineering case studies spanning substation SLDs, GIS network mapping, solar converter hardware, and industrial power factor simulations."
  };

  // Derive dynamic categories from active projects data
  const categories = useMemo(() => {
    const cats = new Set();
    cats.add('All');
    projectsData.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projectsData]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projectsData;
    return projectsData.filter((p) => p.category === selectedCategory);
  }, [projectsData, selectedCategory]);

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Projects' }]}
        badgeText={header.badge_text}
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Filter Tabs Bar (100% Dynamic) */}
      <section className="relative z-10 border-b border-[#1e2638] bg-[#0e131d]/60 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 shrink-0">
            <Filter size={14} className="text-[#10B981]" />
            <span>Filter by Domain:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#10B981] text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-[#111622] text-gray-300 hover:text-white border border-[#1e2638] hover:border-[#10B981]/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 text-xs font-mono text-gray-400">
          <span>
            Showing <strong className="text-white">{filteredProjects.length}</strong> of{' '}
            <strong className="text-[#10B981]">{projectsData.length}</strong> Engineering Projects
          </span>
          <span className="hidden sm:inline">AutoCAD • GIS • MATLAB • Substation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 sm:p-7 flex flex-col justify-between hover:border-[#10B981]/50 hover:bg-[#131b2a] hover:scale-[1.01] transition-all duration-300 group shadow-lg overflow-hidden"
            >
              <div>
                {/* Visual Thumbnail (renders if image uploaded) */}
                {proj.image_url && (
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-5 bg-[#070a0f] border border-[#1e2638]">
                    <Image
                      src={proj.image_url}
                      alt={proj.title}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      unoptimized
                    />
                  </div>
                )}

                {/* Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/25">
                    PROJECT #{proj.project_number || proj.id}
                  </span>
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-white transition"
                        title="GitHub Repository"
                      >
                        <Github size={16} />
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-[#10B981] transition"
                        title="Live Demo"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-[#0b0f17] border border-[#1e2638] flex items-center justify-center text-gray-400 group-hover:text-[#10B981] group-hover:border-[#10B981]/30 transition">
                      <FolderGit2 size={18} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 group-hover:text-[#10B981] transition leading-snug">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                  {proj.description || proj.full_description}
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-4 pt-4 border-t border-[#1e2638]/70">
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[11px] font-mono text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638] group-hover:border-[#10B981]/20 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs font-mono text-[#10B981] pt-1">
                  <span className="inline-flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <FileCheck size={14} className="text-[#10B981]" /> Verified Implementation
                  </span>
                  {proj.category && (
                    <span className="text-[10px] uppercase text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded">
                      {proj.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Methodology Section (100% Dynamic from CMS) */}
      {projectMethodologies && projectMethodologies.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-t border-[#1e2638]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center">
              <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Technical Workflow</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineering Project Lifecycle</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                Systematic engineering lifecycle applied across all simulation, CAD drafting, and hardware installations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {projectMethodologies.map((step, idx) => (
                <div key={idx} className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] space-y-3">
                  <span className="text-2xl font-black font-mono text-[#10B981]">
                    {step.step_number || String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-bold text-white">{step.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

    </PortfolioLayout>
  );
}
