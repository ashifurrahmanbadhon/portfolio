'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  FolderGit2,
  ExternalLink,
  Download,
  Filter,
  FileCheck
} from 'lucide-react';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
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

  if (slides.length === 1) {
    return (
      <div className="relative w-full aspect-[16/9] overflow-hidden mb-5 bg-[#06070B] border border-[#23242B]">
        <Image
          src={slides[0]}
          alt={proj.title}
          fill
          className="object-cover group-hover:scale-[1.055] transition duration-500"
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
      className="relative w-full aspect-[16/9] overflow-hidden mb-5 bg-[#06070B] border border-[#23242B] select-none group/slider"
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
              className="object-cover group-hover:scale-[1.055] transition duration-500"
              style={photoStyle}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <div
        className="absolute bottom-2.5 right-2.5 z-20 flex items-center gap-1.5 bg-[#06070B]/90 backdrop-blur-md px-2 py-1 rounded-full border border-[#23242B] shadow-lg text-white"
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
                  ? 'w-3 h-1.5 bg-[#F59E0B]'
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
    title: "Engineering Projects &",
    highlight_word: "Case Studies",
    description: "Comprehensive engineering case studies spanning substation SLDs, GIS network mapping, solar converter hardware, and industrial power factor simulations."
  };

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
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      {/* Filter Tabs Bar */}
      <section className="relative z-10 border-b border-[#23242B] bg-[#06070B]/90 sticky top-[69px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#8E8B82] shrink-0">
            <Filter size={13} className="text-[#F59E0B]" />
            <span>FILTER BY DOMAIN:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`stat-box text-xs font-mono uppercase tracking-wider px-3.5 py-1.5 whitespace-nowrap font-semibold transition cursor-pointer ${
                    active
                      ? 'text-[#F59E0B] border-[#F59E0B] shadow-[inset_0_0_0_1.5px_#F59E0B]'
                      : 'text-[#B9B5A9] hover:text-[#F59E0B]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Projects Grid: 16-20px gap, EACH card its own border #23242B + bg panel */}
      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 text-xs font-mono text-[#8E8B82]">
          <span>
            SHOWING <strong className="text-[#F5F2EA]">{filteredProjects.length}</strong> OF{' '}
            <strong className="text-[#F59E0B]">{projectsData.length}</strong> PROJECTS
          </span>
          <span className="hidden sm:inline">AUTOCAD • GIS • MATLAB • SUBSTATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj, idx) => (
            <div
              key={proj.id || idx}
              className="stat-box group p-6 sm:p-7 flex flex-col justify-between"
            >
              <div>
                {/* Visual Thumbnail / Slider */}
                <ProjectCardSlider proj={proj} />

                {/* Number label / 01 mono amber above title */}
                <div className="flex justify-between items-center mb-2 font-mono text-xs">
                  <span className="text-[#F59E0B] font-bold tracking-wider">
                    / {String(proj.project_number || idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8E8B82] hover:text-[#F5F2EA] transition"
                        title="GitHub Repository"
                      >
                        <GithubIcon size={15} />
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
                          className="text-[#8E8B82] hover:text-[#F59E0B] transition"
                          title={isApk ? "Download APK" : "Live Demo"}
                        >
                          {isApk ? <Download size={15} /> : <ExternalLink size={15} />}
                        </a>
                      );
                    })()}
                    <div className="w-7 h-7 bg-[#06070B] border border-[#23242B] flex items-center justify-center text-[#8E8B82] group-hover:text-[#F59E0B] transition">
                      <FolderGit2 size={15} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#F5F2EA] mb-2.5 uppercase tracking-wide leading-snug">
                  {proj.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#B9B5A9] leading-relaxed mb-6">
                  {proj.description || proj.full_description}
                </p>
              </div>

              {/* Tags Section */}
              <div className="space-y-4 pt-4 border-t border-[#23242B]">
                {proj.tags && proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {proj.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="tag-plain border border-[#23242B] text-[#8E8B82] bg-[#0A0B10] group-hover:border-[#F59E0B]/70 group-hover:text-[#FBBF24] rounded-full text-[10px] font-mono px-2.5 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1 font-mono">
                  <span className="inline-flex items-center gap-1.5 text-[#8E8B82] text-[11px]">
                    <FileCheck size={13} className="text-[#F59E0B]" /> VERIFIED
                  </span>
                  {proj.category && (
                    <span className="tag-plain text-[10px] uppercase text-[#F59E0B] group-hover:text-[#FBBF24] bg-[#F59E0B]/10 border border-[#F59E0B]/25 group-hover:border-[#F59E0B]/70 px-2 py-0.5 rounded-full font-semibold">
                      {proj.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineering Methodology Section */}
      {projectMethodologies && projectMethodologies.length > 0 && (
        <section className="relative z-10 px-6 md:px-12 py-16 bg-[#06070B] border-t border-[#23242B]">
          <div className="max-w-5xl mx-auto space-y-10">
            <div className="text-center">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F2EA]">
                Engineering Project Lifecycle
              </h3>
              <p className="text-[#B9B5A9] text-xs sm:text-sm mt-2 max-w-xl mx-auto">
                Systematic engineering lifecycle applied across all simulation, CAD drafting, and hardware installations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              {projectMethodologies.map((step, idx) => (
                <div key={idx} className="stat-box p-6 space-y-3">
                  <span className="text-2xl font-black text-[#F59E0B] font-mono">
                    {step.step_number || String(idx + 1).padStart(2, "0")}
                  </span>
                  <h4 className="text-sm font-bold text-[#F5F2EA] uppercase tracking-wide">
                    {step.title}
                  </h4>
                  <p className="text-xs text-[#B9B5A9] leading-relaxed">
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
