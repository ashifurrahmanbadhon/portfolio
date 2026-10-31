'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePortfolio } from '@/context/PortfolioContext';
import BackgroundGlow from './BackgroundGlow';
import PortfolioNavbar from './PortfolioNavbar';
import PortfolioFooter from './PortfolioFooter';

const ResumeModal = dynamic(() => import('./ResumeModal'), { ssr: false });
const FloatingAdminPanel = dynamic(() => import('./FloatingAdminPanel'), { ssr: false });
const AiChat = dynamic(() => import('./AiChat'), { ssr: false });

function PortfolioInnerLayout({ children }) {
  const { resumeModalOpen, closeResumeModal, openResumeModal, resumeUrl, isLoaded } = usePortfolio();

  if (!isLoaded) {
    return (
      <div className="bg-[#06070B] text-[#F5F2EA] min-h-screen font-sans flex flex-col items-center justify-center relative overflow-hidden">
        <BackgroundGlow />
        <div className="relative z-10 flex flex-col items-center space-y-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center shadow-lg shadow-[#F59E0B]/10">
            <span className="w-3 h-3 rounded-full bg-[#F59E0B] animate-ping" />
          </div>
          <div className="text-center font-mono">
            <p className="text-xs text-[#8E8B82]">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#06070B] text-[#F5F2EA] min-h-screen font-sans selection:bg-[#F59E0B] selection:text-[#1A1202] flex flex-col relative overflow-x-clip animate-fade-in">
      <BackgroundGlow />
      <PortfolioNavbar onOpenResume={openResumeModal} />
      
      {/* Content wrapper: position:relative; z-index:1; background:transparent */}
      <main className="flex-1 relative z-10 pt-[68px] bg-transparent">
        {children}
      </main>

      <PortfolioFooter />

      {/* Additive AI Assistant Chat Widget on public pages */}
      <AiChat />

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
