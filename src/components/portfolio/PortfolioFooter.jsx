'use client';

import React from 'react';
import { usePortfolio } from '@/context/PortfolioContext';

export default function PortfolioFooter() {
  const { heroData } = usePortfolio();
  const fullName = heroData?.name || "ASHIFUR RAHMAN";

  return (
    <footer className="border-t border-[#1e2638] bg-[#080c13] py-8 text-xs text-gray-500 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center sm:text-left">
        <p className="text-gray-400">
          © {new Date().getFullYear()} {fullName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

