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
  Sun
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function SkillsPage() {
  const { skillsData, openResumeModal } = usePortfolio();

  const getCategoryIcon = (category) => {
    if (category.toLowerCase().includes('design') || category.toLowerCase().includes('simulation')) {
      return Monitor;
    }
    if (category.toLowerCase().includes('gis') || category.toLowerCase().includes('data')) {
      return Database;
    }
    return ShieldCheck;
  };

  const softwareTools = [
    {
      name: "AutoCAD Electrical",
      type: "CAD & Drafting",
      icon: Monitor,
      level: "Advanced",
      summary: "Single Line Diagrams (SLD), industrial motor control schematics, substation civil & electrical layouts, and panel wiring."
    },
    {
      name: "MATLAB & Simulink",
      type: "Mathematical Simulation",
      icon: Terminal,
      level: "Proficient",
      summary: "Power system dynamic modeling, Automatic Power Factor Correction (APFC) simulation, DC-DC converter algorithms."
    },
    {
      name: "ETAP",
      type: "Power System Analysis",
      icon: Cpu,
      level: "Specialist",
      summary: "Load flow analysis, short circuit calculations, protective device coordination, and busbar rating verification."
    },
    {
      name: "ArcGIS & QGIS",
      type: "Spatial Geographic Systems",
      icon: Compass,
      level: "Advanced",
      summary: "Feeder routing, georeferenced electrical asset inventories, outage prediction mapping, and spatial network databases."
    },
    {
      name: "MS Excel (Advanced)",
      type: "Analytics & Automation",
      icon: FileSpreadsheet,
      level: "Mastery",
      summary: "Dynamic pricing models, automated Bill of Quantities (BOQ) generators, operational capacity forecasts, and pivot analytics."
    },
    {
      name: "PVSyst & Solar Tools",
      type: "Renewable Feasibility",
      icon: Sun,
      level: "Proficient",
      summary: "Solar irradiance modeling, string inverter sizing, tilt/pitch optimization, shading losses, and financial yield estimates."
    }
  ];

  const standards = [
    'AutoCAD Electrical 2D',
    'ETAP Power Flow',
    'MATLAB / Simulink',
    'ArcGIS Utility Network',
    'QGIS Spatial Analysis',
    'PVSyst Solar Sizing',
    'MS Excel Advanced Data',
    'Substation Switchgear Operations',
    'Single Line Diagram (SLD) Drafting',
    'Protective Relay Coordination',
    'Bill of Quantities (BOQ) Modeling',
    'IEEE & IEC Safety Standards'
  ];

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'Skills' }]}
        badgeText="TECHNICAL PROFICIENCY"
        title="Engineering Skills &"
        highlightWord="Software Matrix"
        description="A specialized multidisciplinary matrix of computer-aided engineering drafting, power simulation software, GIS spatial systems, and automated data operations."
      />

      {/* Main Technical Skill Categories */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Competency Matrix</p>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Technical Proficiency Breakdown</h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl">
            Calculated proficiency levels reflecting practical project execution, academic coursework, and field application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {skillsData.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.category);
            return (
              <div
                key={idx}
                className="bg-[#111622] p-6 sm:p-7 rounded-2xl border border-[#1e2638] space-y-6 hover:border-[#10B981]/50 transition duration-300 shadow-lg"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-[#1e2638]">
                  <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{cat.category}</h3>
                    <p className="text-[11px] font-mono text-gray-400">Core Engineering Domain</p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {cat.items.map((skill, sIdx) => (
                    <div key={sIdx} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-200">{skill.name}</span>
                        <span className="text-[#10B981] font-mono font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full bg-[#0b0f17] rounded-full h-2 border border-[#1e2638]/70 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-600 to-[#10B981] h-2 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Software & Industrial Tools Grid */}
      <section className="relative z-10 px-6 md:px-12 py-20 bg-[#0e131d] border-t border-[#1e2638]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Tooling Architecture</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Software &amp; Analytical Suites</h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-3">
              Standard engineering tools utilized daily for drafting, simulation, spatial mapping, and decision analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {softwareTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/40 transition duration-300 space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#0b0f17] border border-[#1e2638] flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-black transition">
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                      {tool.level}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-[#10B981] transition">{tool.name}</h4>
                    <p className="text-[11px] font-mono text-gray-400 mt-0.5">{tool.type}</p>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed pt-2 border-t border-[#1e2638]/70">
                    {tool.summary}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Badges Cloud */}
          <div className="mt-14 pt-10 border-t border-[#1e2638]">
            <p className="text-center text-xs font-mono uppercase tracking-wider text-gray-400 mb-6">
              Verified Industry Protocols &amp; Technologies
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {standards.map((s) => (
                <span
                  key={s}
                  className="bg-[#111622] px-4 py-2 rounded-lg border border-[#1e2638] hover:border-[#10B981]/40 text-xs font-semibold flex items-center gap-2 text-gray-200 transition"
                >
                  <Check size={14} className="text-[#10B981]" /> {s}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Box */}
          <div className="mt-16 bg-[#111622] border border-[#1e2638] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h4 className="text-lg font-bold text-white">Want to see these skills applied in projects?</h4>
              <p className="text-xs text-gray-400 mt-1">Explore my engineering case studies to see CAD drawings and simulation results.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] transition"
              >
                View Case Studies <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={openResumeModal}
                className="bg-[#0b0f17] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 transition cursor-pointer"
              >
                <Download size={15} /> Download CV
              </button>
            </div>
          </div>

        </div>
      </section>
    </PortfolioLayout>
  );
}
