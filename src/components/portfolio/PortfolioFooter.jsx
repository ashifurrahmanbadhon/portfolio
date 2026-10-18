'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';
import SpotlightCard from '@/components/SpotlightCard';

export default function PortfolioFooter() {
  const { heroData } = usePortfolio();
  const fullName = heroData?.name || "ASHIFUR RAHMAN";

  return (
    <footer className="border-t border-[#1e2638] bg-[#080c13] py-7 text-xs text-gray-500 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-gray-400">
          © {new Date().getFullYear()} {fullName}. All rights reserved.
        </p>

        {/* Admin button at the far right last corner */}
        <div className="sm:ml-auto shrink-0">
          <SpotlightCard className="p-0.5 rounded-xl bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/40 hover:scale-105 hover:-translate-y-0.5 transition-all">
            <Link
              href="/admin"
              className="px-3.5 py-1.5 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Central Admin CMS Console"
            >
              <Lock size={13} className="text-[#10B981]" /> Admin
            </Link>
          </SpotlightCard>
        </div>
      </div>
    </footer>
  );
}


