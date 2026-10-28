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
  FileCheck,
  Download
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import SpotlightCard from '@/components/SpotlightCard';
import { usePortfolio } from '@/context/PortfolioContext';
import { parsePhotoPosition } from '@/lib/photoPosition';

function GithubIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function ProjectCardSlider({ proj }) {
  const slides = useMemo(() => {
    return [proj.image_url, ...(proj.additional_images || [])].filter(Boolean);
  }, [proj.image_url, proj.additional_images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  if (slides.length === 0) return null;

  const photoStyle = parsePhotoPosition(proj.image_position || "center center").style;

  // Single image: exact same render and style as original (no arrows, no dots)
  if (slides.length === 1) {
    return (
      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-[#070a0f] border border-[#1e2638]">
        <Image
          src={slides[0]}
          alt={proj.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-500"
          style={photoStyle}
          unoptimized
        />
      </div>
    );
  }

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (idx, e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    } else if (diff < -40) {
      setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
    setTouchStartX(null);
  };

  return (
    <div
      className="relative w-full aspect-[16/9] rounded-xl overflow-hidden mb-5 bg-[#070a0f] border border-[#1e2638] select-none group/slider"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex w-full h-full transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((url, idx) => (
          <div key={idx} className="relative w-full h-full shrink-0">
            <Image
              src={url}
              alt={`${proj.title} - ${idx + 1}`}
              fill
              className="object-cover transition duration-500"
              style={photoStyle}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Arrows (‹ ›) + dots below-right of frame */}
      <div
        className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-[#070a0f]/85 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-lg text-white"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition text-xs font-bold leading-none cursor-pointer"
        >
          ‹
        </button>

        <div className="flex items-center gap-1 px-0.5">
          {slides.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={(e) => handleDotClick(dotIdx, e)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                currentIndex === dotIdx
                  ? 'w-3 h-1.5 bg-[#10B981]'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition text-xs font-bold leading-none cursor-pointer"
        >
          ›
        </button>
      </div>
    </div>
  );
}

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
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
            <Filter size={14} className="text-[#10B981]" />
            <span>Filter by Domain:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer font-semibold ${
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
        <div className="flex justify-between items-center mb-10 text-xs text-gray-400">
          <span>
            Showing <strong className="text-white">{filteredProjects.length}</strong> of{' '}
            <strong className="text-[#10B981]">{projectsData.length}</strong> Engineering Projects
          </span>
          <span className="hidden sm:inline">AutoCAD • GIS • MATLAB • Substation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <SpotlightCard
              key={proj.id}
              className="bg-[#111622] rounded-2xl border border-[#1e2638] p-6 sm:p-7 flex flex-col justify-between hover:scale-[1.01] transition-all duration-300 shadow-lg"
            >
              <div>
                {/* Visual Thumbnail / Slider */}
                <ProjectCardSlider proj={proj} />

                {/* Header Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded border border-[#10B981]/25">
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
                        <GithubIcon size={16} />
                      </a>
                    )}
                    {proj.live_url && (() => {
                      const isApk = proj.live_url.toLowerCase().endsWith('.apk');
                      return (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noreferrer"
                          {...(isApk ? { download: '' } : {})}
                          className="text-gray-400 hover:text-[#10B981] transition"
                          title={isApk ? "Download APK" : "Live Demo"}
                        >
                          {isApk ? <Download size={16} /> : <ExternalLink size={16} />}
                        </a>
                      );
                    })()}
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
                        className="text-[11px] text-gray-300 bg-[#0b0f17] px-2.5 py-1 rounded border border-[#1e2638] group-hover:border-[#10B981]/50 group-hover:text-[#10B981] group-hover:bg-[#10B981]/10 transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[#10B981] pt-1">
                  <span className="inline-flex items-center gap-1.5 text-gray-400 text-[11px] group-hover:text-gray-300 transition">
                    <FileCheck size={14} className="text-[#10B981]" /> Verified Implementation
                  </span>
                  {proj.category && (
                    <span className="text-[10px] uppercase text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition font-medium">
                      {proj.category}
                    </span>
                  )}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>

      {/* Engineering Methodology Section (100% Dynamic from CMS) */}
      {projectMethodologies && projectMethodologies.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 bg-[#0e131d] border-t border-[#1e2638]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineering Project Lifecycle</h3>
              <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                Systematic engineering lifecycle applied across all simulation, CAD drafting, and hardware installations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {projectMethodologies.map((step, idx) => (
                <SpotlightCard key={idx} className="bg-[#111622] p-6 rounded-2xl border border-[#1e2638] space-y-3">
                  <span className="text-2xl font-black text-[#10B981]">
                    {step.step_number || String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-bold text-white group-hover:text-[#10B981] transition">{step.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </SpotlightCard>
              ))}
            </div>
          </div>
        </section>
      )}

    </PortfolioLayout>
  );
}
