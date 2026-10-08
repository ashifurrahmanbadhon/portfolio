'use client';

import React from 'react';
import { PortfolioProvider, usePortfolio } from '@/context/PortfolioContext';
import BackgroundGlow from './BackgroundGlow';
import PortfolioNavbar from './PortfolioNavbar';
import PortfolioFooter from './PortfolioFooter';
import ResumeModal from './ResumeModal';

function PortfolioInnerLayout({ children }) {
  const { resumeModalOpen, closeResumeModal, openResumeModal, resumeUrl, isLoaded } = usePortfolio();

  return (
    <div className="bg-[#0b0f17] text-white min-h-screen font-sans selection:bg-[#10B981] selection:text-black flex flex-col relative overflow-x-hidden">
      <BackgroundGlow />
      <PortfolioNavbar onOpenResume={openResumeModal} />
      
      <main className={`flex-1 relative z-10 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-95'}`}>
        {children}
      </main>

      <PortfolioFooter />

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
