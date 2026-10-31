'use client';

import React from 'react';

export default function PageHeader({
  title,
  highlightWord,
  description,
  children
}) {
  return (
    <section className="relative z-10 pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-[#23242B] bg-[#06070B]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="border border-[#23242B] bg-[#0A0B10] p-8 sm:p-12 rounded-2xl shadow-xl space-y-4">
          {/* Big Uppercase Title - NO kicker or eyebrow above it */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#F5F2EA] leading-[1.08]">
            {title}{' '}
            {highlightWord && (
              <span className="text-[#F59E0B]">
                {highlightWord}
              </span>
            )}
          </h1>

          {/* Muted Description Below Title */}
          {description && (
            <p className="text-[#B9B5A9] text-sm sm:text-base md:text-lg max-w-3xl leading-relaxed">
              {description}
            </p>
          )}

          {children && <div className="mt-6 pt-4 border-t border-[#23242B]">{children}</div>}
        </div>
      </div>
    </section>
  );
}
