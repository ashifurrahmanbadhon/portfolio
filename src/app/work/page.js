'use client';

import React from 'react';
import Link from 'next/link';
import PortfolioLayout from '@/components/portfolio/PortfolioLayout';
import PageHeader from '@/components/portfolio/PageHeader';
import { usePortfolio } from '@/context/PortfolioContext';

export default function WorkPage() {
  const { workPackages, pageHeaders } = usePortfolio();

  const packagesList = Array.isArray(workPackages) ? workPackages : [];

  const header = pageHeaders?.work || {
    title: "Work & Service",
    highlight_word: "Packages",
    description: "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start."
  };

  return (
    <PortfolioLayout>
      <PageHeader
        title={header.title}
        highlightWord={header.highlight_word}
        description={header.description}
      />

      <section className="relative z-10 px-6 md:px-12 py-16 sm:py-20 max-w-7xl mx-auto">
        {/* Count indicator */}
        <div className="flex justify-between items-center mb-8 text-xs font-mono text-[#8E8B82]">
          <span>
            SHOWING <strong className="text-[#F5F2EA]">{packagesList.length}</strong> OF{' '}
            <strong className="text-[#F59E0B]">{packagesList.length}</strong> PACKAGES
          </span>
          <span className="hidden sm:inline">FIXED SCOPE • FAST DELIVERY • CLEAR DELIVERABLES</span>
        </div>

        {/* 2-col Grid (1-col mobile), gap 20px */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {packagesList.map((pkg, idx) => {
            const presetNumber = String(pkg.sort_order || idx + 1).padStart(2, '0');
            const deliverables = (pkg.deliverables || '')
              .split('\n')
              .map((d) => d.trim())
              .filter(Boolean);
            const tags = (pkg.tags || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);

            return (
              <div
                key={pkg.id || idx}
                className="stat-box group p-6 sm:p-8 flex flex-col justify-between"
              >
                <div>
                  {/* Top row: left amber PRESET — 01, right faint category */}
                  <div className="flex items-center justify-between font-mono text-xs mb-3">
                    <span className="text-[#F59E0B] font-bold tracking-wider">
                      PRESET — {presetNumber}
                    </span>
                    <span className="text-[#8E8B82] uppercase tracking-wider font-medium">
                      {pkg.category || 'SERVICE'}
                    </span>
                  </div>

                  {/* Title (Inter Tight 26px font-black) */}
                  <h2 className="text-2xl sm:text-[26px] font-black uppercase tracking-tight text-[#F5F2EA] mb-2 leading-tight">
                    {pkg.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#B9B5A9] leading-relaxed mb-6">
                    {pkg.description}
                  </p>

                  {/* Mono label: WHAT YOU GET */}
                  <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F59E0B] mb-3">
                    WHAT YOU GET
                  </div>

                  {/* Deliverables list (marker "—" amber) */}
                  <ul className="space-y-2 text-xs sm:text-sm text-[#B9B5A9] mb-6 leading-relaxed">
                    {deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start">
                        <span className="text-[#F59E0B] font-mono mr-2.5 shrink-0 font-bold">—</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {/* Tags as passive pills (.tag-plain behavior) */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-[#23242B] mb-6">
                      {tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="tag-plain border border-[#23242B] text-[#8E8B82] bg-[#0A0B10] group-hover:border-[#F59E0B]/70 group-hover:text-[#FBBF24] rounded-full text-[11px] font-mono px-2.5 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom button: Discuss This Package → (stat-box button style, NO underline) */}
                  <Link
                    href={`/contact?package=${encodeURIComponent(pkg.title)}`}
                    className="stat-box w-full py-3 px-4 text-center text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] block no-underline transition"
                  >
                    Discuss This Package &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA stat-box */}
        <div className="stat-box p-8 sm:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#F5F2EA] mb-4">
            Need something different?
          </h2>
          <p className="text-sm sm:text-base text-[#B9B5A9] max-w-2xl mx-auto mb-8 leading-relaxed">
            If your requirement does not match a package, describe it in a few lines — I will tell you honestly if I can do it, how long it takes, and what it costs.
          </p>
          <Link
            href="/contact"
            className="stat-box inline-block py-3 px-8 text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B] hover:text-[#FBBF24] no-underline transition"
          >
            Contact Me
          </Link>
        </div>
      </section>
    </PortfolioLayout>
  );
}
