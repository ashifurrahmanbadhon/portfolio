'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, FileText, Mail, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Experience', href: '/experience' },
  { name: 'Projects', href: '/projects' },
  { name: 'Skills', href: '/skills' },
  { name: 'Education', href: '/education' },
  { name: 'Contact', href: '/contact' },
];

export default function PortfolioNavbar({ onOpenResume }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLinkActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f17]/90 border-b border-[#1e2638] transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-4.5 flex justify-between items-center">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group select-none">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-black transition duration-300 shadow-sm shadow-[#10B981]/10">
            <Zap size={18} />
          </div>
          <span className="text-xl sm:text-2xl font-black tracking-widest text-[#10B981]">
            ASHIFUR<span className="text-white font-light text-sm sm:text-base ml-1">.EEE</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 font-bold shadow-xs shadow-[#10B981]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenResume}
            className="px-4 py-2 rounded-lg bg-[#111622] border border-[#1e2638] hover:border-[#10B981]/50 text-gray-200 text-xs font-semibold flex items-center gap-2 transition hover:bg-[#161e30] cursor-pointer"
          >
            <FileText size={15} className="text-[#10B981]" /> Resume
          </button>
          <Link
            href="/contact"
            className="bg-[#10B981] text-black text-xs font-bold uppercase tracking-wider px-4.5 py-2 rounded-lg flex items-center gap-2 hover:bg-[#059669] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition duration-300"
          >
            <Mail size={15} /> Get In Touch
          </Link>
        </div>

        {/* Mobile menu hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-[#111622] border border-transparent hover:border-[#1e2638] transition"
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
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenResume();
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 flex items-center gap-2 hover:bg-[#10B981]/20 transition"
            >
              <FileText size={16} /> View &amp; Download CV
            </button>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-3.5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-black bg-[#10B981] hover:bg-[#059669] flex items-center justify-center gap-2 transition"
            >
              <Mail size={16} /> Get In Touch
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
