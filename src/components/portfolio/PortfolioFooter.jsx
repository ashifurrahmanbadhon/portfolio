'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

export default function PortfolioFooter() {
  const { heroData } = usePortfolio();
  const fullName = heroData?.name || "ASHIFUR RAHMAN";

  return (
    <footer className="border-t border-[#23242B] bg-[#06070B] py-8 text-xs font-mono text-[#8E8B82] relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>
          © {new Date().getFullYear()} {fullName}. ALL RIGHTS RESERVED.
        </p>

        {/* Admin Link at far right */}
        <div className="sm:ml-auto shrink-0">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg border border-[#23242B] bg-[#0A0B10] hover:border-[#F59E0B]/60 text-[#8E8B82] hover:text-[#F59E0B] text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
            title="Admin Console"
          >
            <Lock size={12} className="text-[#F59E0B]" /> ADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}
