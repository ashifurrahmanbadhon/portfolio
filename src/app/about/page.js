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
  CheckCircle2,
  ArrowRight,
  FileText,
  MapPin,
  Mail,
  Download
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function AboutPage() {
  const { heroData, aboutData, highlights, openResumeModal } = usePortfolio();

  const corePillars = [
    {
      icon: Zap,
      title: "Substation Engineering",
      subtitle: "Power Distribution & Safety",
      description: "Hands-on experience at DESCO 33/11 kV substations, observing power transformers, switchgear mechanisms, protective relays, and load flow continuity."
    },
    {
      icon: Monitor,
      title: "AutoCAD Electrical",
      subtitle: "Single Line Diagrams & Schematics",
      description: "Drafting industrial Single Line Diagrams (SLDs), substation layout designs, motor starter schematics, and accurate technical drawings."
    },
    {
      icon: Database,
      title: "GIS Utility Mapping",
      subtitle: "Spatial Data & Network Analysis",
      description: "Spatial mapping of 11kV/0.4kV distribution feeders, electrical assets, transformers, and consumer load nodes using ArcGIS & QGIS geodatabases."
    },
    {
      icon: Briefcase,
      title: "Sales & Project Analytics",
      subtitle: "Operations, BOQ & Management",
      description: "Preparing Bill of Quantities (BOQ), dynamic quotation engines, production capacity forecasting, and operational dashboards in advanced MS Excel."
    },
    {
      icon: Cpu,
      title: "AI & Emerging Technologies",
      subtitle: "Intelligent Engineering Systems",
      description: "Bridging core electrical engineering with artificial intelligence, automated reasoning, predictive analysis, and intelligent workflow systems."
    },
    {
      icon: ShieldCheck,
      title: "Safety & Standards Compliance",
      subtitle: "IEEE, IEC & Standard Protocols",
      description: "Adhering strictly to standard operating procedures, high-voltage safety regulations, electrical clearance protocols, and operational safety."
    }
  ];

  return (
    <PortfolioLayout>
      <PageHeader
        breadcrumbs={[{ name: 'About' }]}
        badgeText="ENGINEER & INNOVATOR"
        title="About Ashifur Rahman —"
        highlightWord="Engineering & AI"
        description="Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence."
      />

      {/* Main Narrative & Profile Section */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Biography Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#10B981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              Professional Background
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              {aboutData.title || "Bridging Technical Rigor with Modern Technological Innovation"}
            </h2>

            <div className="space-y-4 text-gray-300 text-sm sm:text-base leading-relaxed">
              <p>
                {aboutData.description1 || "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis."}
              </p>
              {aboutData.description2 && (
                <p>
                  {aboutData.description2}
                </p>
              )}
            </div>

            {/* Quick Action CTAs */}
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition duration-300"
              >
                View Case Studies <ArrowRight size={15} />
              </Link>
              <button
                type="button"
                onClick={openResumeModal}
                className="bg-[#111622] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-lg flex items-center gap-2 hover:border-[#10B981]/50 hover:bg-[#161e30] transition duration-300 cursor-pointer"
              >
                <Download size={15} /> Download CV
              </button>
            </div>
          </div>

          {/* Right Column: Profile Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#10B981] to-teal-600 opacity-25 blur-xl group-hover:opacity-50 transition duration-500" />
                
                <div className="relative bg-[#111622] border border-[#1e2638] rounded-3xl p-5 shadow-2xl space-y-5">
                  <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-[#0b0f17]">
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
                        Specialization
                      </p>
                      <p className="text-sm font-bold text-white">
                        Engineering, Management &amp; AI
                      </p>
                    </div>
                  </div>

                  {/* Info points */}
                  <div className="space-y-3 pt-2 text-xs border-t border-[#1e2638]/70">
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin size={16} className="text-[#10B981] shrink-0" />
                      <span>Tangail, Dhaka, Bangladesh</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail size={16} className="text-[#10B981] shrink-0" />
                      <a href="mailto:ashifur.badhon@gmail.com" className="hover:text-[#10B981] transition">
                        ashifur.badhon@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-gray-300">
                      <FileText size={16} className="text-[#10B981] shrink-0" />
                      <span>B.Sc. in Electrical &amp; Electronic Engineering</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Highlights Bar */}
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

      {/* Pillars of Engineering Competency */}
      <section className="relative z-10 px-6 md:px-12 py-20 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Core Competencies</p>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">Engineering Domains &amp; Capabilities</h3>
          <p className="text-gray-400 text-xs sm:text-sm mt-3">
            A versatile spectrum combining traditional high-voltage engineering with modern data-driven and computational methods.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-[#111622] p-7 rounded-2xl border border-[#1e2638] hover:border-[#10B981]/50 hover:bg-[#141b2a] transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-black transition duration-300 mb-5">
                    <Icon size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white mb-1 group-hover:text-[#10B981] transition">
                    {pillar.title}
                  </h4>
                  <p className="text-xs font-mono text-[#10B981]/80 mb-3">{pillar.subtitle}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Engineering Philosophy & Work Ethics */}
      <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-t border-[#1e2638]">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center">
            <p className="text-xs font-mono uppercase tracking-widest text-[#10B981] mb-2">Professional Mindset</p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Guiding Principles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638]">
              <div className="text-[#10B981] font-mono text-2xl font-bold mb-2">01.</div>
              <h4 className="text-sm font-bold text-white mb-2">Precision &amp; Accuracy</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Whether drafting an electrical schematic or configuring relay protection ratings, precision prevents failure.
              </p>
            </div>
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638]">
              <div className="text-[#10B981] font-mono text-2xl font-bold mb-2">02.</div>
              <h4 className="text-sm font-bold text-white mb-2">Safety &amp; Compliance</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Standard operating protocols and safety standards are paramount in both physical substations and digital systems.
              </p>
            </div>
            <div className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638]">
              <div className="text-[#10B981] font-mono text-2xl font-bold mb-2">03.</div>
              <h4 className="text-sm font-bold text-white mb-2">Continuous Learning</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Staying at the frontier of engineering through self-driven AI exploration, modern tools, and system optimization.
              </p>
            </div>
          </div>

          {/* Bottom CTA Box */}
          <div className="bg-gradient-to-r from-[#111622] to-[#151e30] border border-[#1e2638] p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h4 className="text-lg font-bold text-white">Looking to collaborate or recruit?</h4>
              <p className="text-xs text-gray-400 mt-1">Explore my career journey or reach out for engineering consultation.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/experience"
                className="bg-[#10B981] text-black font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg hover:bg-[#059669] transition"
              >
                View Experience
              </Link>
              <Link
                href="/contact"
                className="bg-[#0b0f17] text-white border border-[#1e2638] font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-lg hover:border-[#10B981]/50 transition"
              >
                Contact Ashifur
              </Link>
            </div>
          </div>
        </div>
      </section>

    </PortfolioLayout>
  );
}
