'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Zap } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

export default function PortfolioFooter() {
  const { heroData } = usePortfolio();

  const fullName = heroData?.name || "ASHIFUR RAHMAN";
  const roleTitle = heroData?.title || "Electrical & Electronic Engineer";

  return (
    <footer className="border-t border-[#1e2638] bg-[#080c13] py-10 text-xs text-gray-500 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
        
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[#1e2638]/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
              <Zap size={14} />
            </div>
            <span className="text-base font-black tracking-widest text-[#10B981]">
              {fullName}
            </span>
            <span className="text-gray-400 text-xs ml-3 hidden sm:inline">• {roleTitle}</span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-gray-400">
            <Link href="/" className="hover:text-[#10B981] transition">Home</Link>
            <Link href="/about" className="hover:text-[#10B981] transition">About</Link>
            <Link href="/experience" className="hover:text-[#10B981] transition">Experience</Link>
            <Link href="/projects" className="hover:text-[#10B981] transition">Projects</Link>
            <Link href="/skills" className="hover:text-[#10B981] transition">Skills</Link>
            <Link href="/education" className="hover:text-[#10B981] transition">Education</Link>
            <Link href="/contact" className="hover:text-[#10B981] transition">Contact</Link>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {fullName}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <span className="font-mono text-gray-400 hidden sm:inline">
              Power Systems • GIS • AI
            </span>
            <Link
              href="/admin"
              className="text-gray-500 hover:text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 transition px-2.5 py-1 rounded bg-[#0e1420] border border-[#1e2638] hover:border-emerald-500/30"
            >
              <Lock size={12} /> Central CMS
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
