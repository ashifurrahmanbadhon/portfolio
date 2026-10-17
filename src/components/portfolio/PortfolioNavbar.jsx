'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Download, Lock, Menu, X } from 'lucide-react';
import { triggerCvDownload } from '@/lib/downloadCv';
import SpotlightCard from '@/components/SpotlightCard';

const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Experience', href: '/experience' },
  { name: 'Projects', href: '/projects' },
  { name: 'Skills', href: '/skills' },
  { name: 'Education', href: '/education' },
  { name: 'Contact', href: '/contact' },
];

export default function PortfolioNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-[#0b0f17]/95 border-b border-[#1e2638] transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3.5 flex items-center justify-between">
        {/* Brand Logo with breathing space */}
        <Link href="/" className="flex items-center gap-2 group select-none shrink-0 mr-6 xl:mr-10">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-black transition duration-300 shadow-sm shadow-[#10B981]/10">
            <Zap size={18} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#10B981]">
            ASHIFUR<span className="text-white font-light text-sm sm:text-base ml-1">.EEE</span>
          </span>
        </Link>

        {/* Desktop Navigation Links: each page item individually wrapped in SpotlightCard */}
        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 ml-auto mr-3 text-xs font-semibold uppercase tracking-wider">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <SpotlightCard
                key={item.name}
                className={`p-0.5 rounded-xl transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 ${
                  active
                    ? "bg-[#10B981]/15 border border-[#10B981]/40 shadow-xs shadow-[#10B981]/15"
                    : "bg-[#111622] border border-[#1e2638]"
                }`}
              >
                <Link
                  href={item.href}
                  className={`px-3 py-1.5 block rounded-lg transition-all duration-200 ${
                    active
                      ? "text-[#10B981] font-bold"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              </SpotlightCard>
            );
          })}
        </div>

        {/* Action Buttons: Direct CV Download + Admin with SpotlightCard effect */}
        <div className="hidden md:flex items-center gap-2.5 shrink-0">
          <SpotlightCard className="p-0.5 rounded-xl bg-[#111622] border border-[#1e2638] hover:scale-105 hover:-translate-y-0.5 transition-all">
            <button
              type="button"
              onClick={triggerCvDownload}
              className="px-3.5 py-1.5 text-gray-200 text-xs font-semibold flex items-center gap-2 transition hover:text-[#10B981] cursor-pointer"
              title="Download CV Directly (No page leave)"
            >
              <Download size={14} className="text-[#10B981]" /> Download CV
            </button>
          </SpotlightCard>
          <SpotlightCard className="p-0.5 rounded-xl bg-[#111622] border border-[#1e2638] hover:scale-105 hover:-translate-y-0.5 transition-all">
            <Link
              href="/admin"
              className="px-3.5 py-1.5 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition hover:text-[#10B981]"
              title="Central Admin CMS"
            >
              <Lock size={13} className="text-[#10B981]" /> Admin
            </Link>
          </SpotlightCard>
        </div>

        {/* Mobile menu hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#111622] border border-transparent hover:border-[#1e2638] transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e1420] border-b border-[#1e2638] px-6 py-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition ${
                  active
                    ? 'text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-3 mt-3 border-t border-[#1e2638] flex flex-col gap-2.5">
            <button
              type="button"
              onClick={(e) => {
                setMobileMenuOpen(false);
                triggerCvDownload(e);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 flex items-center gap-2 hover:bg-[#10B981]/20 transition cursor-pointer"
            >
              <Download size={16} /> Download CV
            </button>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-3.5 py-2.5 rounded-lg text-xs font-semibold text-gray-200 bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/40 flex items-center justify-center gap-2 transition"
            >
              <Lock size={14} className="text-[#10B981]" /> Admin Console
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
