'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({
  badgeText,
  title,
  highlightWord,
  description,
  breadcrumbs = [],
  children
}) {
  return (
    <section className="relative z-10 pt-10 pb-12 sm:pt-14 sm:pb-16 border-b border-[#1e2638] bg-gradient-to-b from-[#0e1422]/60 to-transparent">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#10B981] transition flex items-center gap-1">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className="text-gray-600" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#10B981] transition">
                  {crumb.name}
                </Link>
              ) : (
                <span className="text-[#10B981] font-semibold">{crumb.name}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Badge Pill */}
        {badgeText && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-semibold font-mono tracking-wide mb-4">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            {badgeText}
          </div>
        )}

        {/* Main Title & Subtitle */}
        <div className="max-w-3xl space-y-4">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.15]">
            {title}{' '}
            {highlightWord && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-teal-400 font-mono">
                {highlightWord}
              </span>
            )}
          </h1>
          {description && (
            <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {children && <div className="mt-6 pt-4 border-t border-[#1e2638]/60">{children}</div>}

      </div>
    </section>
  );
}
