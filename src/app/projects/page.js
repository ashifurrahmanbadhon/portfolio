'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  const { projectsData } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive unique categories
  const categories = ['All', 'Power & Substations', 'CAD & GIS', 'Simulation & Electronics', 'Operations & Analytics'];

  const filterProject = (proj) => {
    if (selectedCategory === 'All') return true;
    const cat = selectedCategory.toLowerCase();
    const tagsStr = (proj.tags || []).join(' ').toLowerCase();
    const titleStr = (proj.title || '').toLowerCase();
    const descStr = (proj.description || '').toLowerCase();
    const categoryStr = (proj.category || '').toLowerCase();

    if (cat.includes('substation') || cat.includes('power')) {
      return (
        categoryStr.includes('substation') ||
        categoryStr.includes('power') ||
        tagsStr.includes('substation') ||
        tagsStr.includes('power') ||
        tagsStr.includes('etap')
      );
    }
    if (cat.includes('cad') || cat.includes('gis')) {
      return (
        categoryStr.includes('gis') ||
        tagsStr.includes('gis') ||
        tagsStr.includes('autocad') ||
        tagsStr.includes('arcgis') ||
        tagsStr.includes('qgis')
      );
    }
    if (cat.includes('simulation') || cat.includes('electronics')) {
      return (
        categoryStr.includes('simulation') ||
        categoryStr.includes('electronics') ||
        tagsStr.includes('matlab') ||
        tagsStr.includes('simulink') ||
        tagsStr.includes('buck') ||
        tagsStr.includes('solar')
      );
    }
    if (cat.includes('operations') || cat.includes('analytics')) {
      return (
        categoryStr.includes('analytics') ||
        categoryStr.includes('management') ||
        tagsStr.includes('excel') ||
        tagsStr.includes('analytics') ||
        tagsStr.includes('boq')
      );
    }
    return true;
  };

  const filteredProjects = projectsData.filter(filterProject);

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Projects' }]}
        badgeText="ENGINEERING CASE STUDIES"
        title="Featured Engineering &"
        highlightWord="Technical Projects"
        description="Comprehensive engineering case studies spanning substation SLDs, GIS network mapping, solar converter hardware, and industrial power factor simulations."
      />

      {/* Filter Tabs Bar */}
      <section className="relative z-10 border-b border-[#1e2638] bg-[#0e131d]/60 sticky top-[73px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 shrink-0">
            <Filter size={14} className="text-[#10B981]" />
            <span>Filter by Domain:</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#10B981] text-black font-bold shadow-xs shadow-[#10B981]/20'
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
        <div className="flex justify-between items-center mb-8">
          <p className="text-xs font-mono uppercase tracking-wider text-gray-400">
            Showing <span className="text-[#10B981] font-bold">{filteredProjects.length}</span> Engineering Projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 sm:p-7 flex flex-col justify-between hover:border-[#10B981]/50 hover:bg-[#131b2a] hover:scale-[1.01] transition-all duration-300 group shadow-lg"
            >
              <div>
                {/* Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/25">
                    PROJECT #{proj.id}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#0b0f17] border border-[#1e2638] flex items-center justify-center text-gray-400 group-hover:text-[#10B981] group-hover:border-[#10B981]/30 transition">
                    <FolderGit2 size={18} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-white mb-3 group-hover:text-[#10B981] transition leading-snug">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
                  {proj.description}
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-4 pt-4 border-t border-[#1e2638]/70">
                <div className="flex flex-wrap gap-2">
                  {(proj.tags || []).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-mono text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638] group-hover:border-[#10B981]/20 transition"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-[#10B981] pt-1">
                  <span className="inline-flex items-center gap-1.5 text-gray-400 text-[11px]">
                    <FileCheck size={14} className="text-[#10B981]" /> Verified Implementation
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Methodology Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-t border-[#1e2638]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Technical Workflow</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineering Project Lifecycle</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#111622] p-5 rounded-2xl border border-[#1e2638] space-y-2">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">01. SCOPING</span>
              <h4 className="text-sm font-bold text-white">System Specification</h4>
              <p className="text-xs text-gray-400">Load flow requirements, voltage classes, environmental criteria, and equipment standards.</p>
            </div>
            <div className="bg-[#111622] p-5 rounded-2xl border border-[#1e2638] space-y-2">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">02. MODELING</span>
              <h4 className="text-sm font-bold text-white">CAD &amp; GIS Drafting</h4>
              <p className="text-xs text-gray-400">Single Line Diagrams, switchgear clearances, spatial feeder geodatabases in AutoCAD &amp; GIS.</p>
            </div>
            <div className="bg-[#111622] p-5 rounded-2xl border border-[#1e2638] space-y-2">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">03. SIMULATION</span>
              <h4 className="text-sm font-bold text-white">Computational Testing</h4>
              <p className="text-xs text-gray-400">MATLAB/Simulink and ETAP simulations for reactive power compensation and transient behaviors.</p>
            </div>
            <div className="bg-[#111622] p-5 rounded-2xl border border-[#1e2638] space-y-2">
              <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">04. DELIVERABLE</span>
              <h4 className="text-sm font-bold text-white">BOQ &amp; Documentation</h4>
              <p className="text-xs text-gray-400">Dynamic pricing calculation, Bill of Quantities, margin analysis, and compliance sign-off.</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-[#111622] border border-[#1e2638] p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h4 className="text-lg font-bold text-white">Have an engineering problem to solve?</h4>
              <p className="text-xs text-gray-400 mt-1">From electrical schematics to GIS utility mapping and data analytics.</p>
            </div>
            <Link
              href="/contact"
              className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition"
            >
              Discuss Your Project <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
