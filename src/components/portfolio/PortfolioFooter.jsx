'use client';

import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

export default function PortfolioFooter() {
  const { heroData, siteTexts } = usePortfolio();
  const fullName = heroData?.name || "ASHIFUR RAHMAN";
  const rightsText = siteTexts?.footer_rights_text || "ALL RIGHTS RESERVED.";

  return (
    <footer className="border-t border-[#23242B] bg-[#06070B] py-8 text-xs font-mono text-[#8E8B82] relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>
          © {new Date().getFullYear()} {fullName}. {rightsText}
        </p>

        {/* Admin Link at far right — plain mono text, no pill/box */}
        <div className="sm:ml-auto shrink-0">
          <Link
            href="/admin"
            className="text-[#8E8B82] hover:text-[#F59E0B] text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Admin Console"
          >
            <Lock size={12} className="text-[#F59E0B]" /> ADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}
