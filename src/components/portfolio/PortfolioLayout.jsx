'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PortfolioProvider, usePortfolio } from '@/context/PortfolioContext';
import BackgroundGlow from './BackgroundGlow';
import PortfolioNavbar from './PortfolioNavbar';
import PortfolioFooter from './PortfolioFooter';

const ScrollToTopButton = dynamic(() => import('./ScrollToTopButton'), { ssr: false });
const ResumeModal = dynamic(() => import('./ResumeModal'), { ssr: false });
const FloatingAdminPanel = dynamic(() => import('./FloatingAdminPanel'), { ssr: false });

function PortfolioInnerLayout({ children }) {
  const { resumeModalOpen, closeResumeModal, openResumeModal, resumeUrl, isLoaded } = usePortfolio();

  if (!isLoaded) {
    return (
      <div className="bg-[#0b0f17] text-white min-h-screen font-sans flex flex-col items-center justify-center relative overflow-hidden">
        <BackgroundGlow />
        <div className="relative z-10 flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Loading verified portfolio content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0f17] text-white min-h-screen font-sans selection:bg-[#10B981] selection:text-black flex flex-col relative overflow-x-hidden animate-fade-in">
      <BackgroundGlow />
      <PortfolioNavbar onOpenResume={openResumeModal} />
      
      {/* pt-20 ensures page content starts smoothly below the fixed top navbar */}
      <main className="flex-1 relative z-10 pt-20">
        {children}
      </main>

      <PortfolioFooter />

      {/* Persistent floating scroll to top button at bottom right corner */}
      <ScrollToTopButton />

      {/* Floating admin panel for authenticated sessions at bottom left */}
      <FloatingAdminPanel />

      <ResumeModal
        isOpen={resumeModalOpen}
        onClose={closeResumeModal}
        resumeUrl={resumeUrl}
      />
    </div>
  );
}

export default function PortfolioLayout({ children }) {
  return <PortfolioInnerLayout>{children}</PortfolioInnerLayout>;
}
