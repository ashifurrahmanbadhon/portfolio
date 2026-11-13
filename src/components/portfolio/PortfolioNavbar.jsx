'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Work', href: '/work' },
  { name: 'Experience', href: '/experience' },
  { name: 'Skills', href: '/skills' },
  { name: 'Education', href: '/education' },
  { name: 'Contact', href: '/contact' },
];

function StatusBadge({ targetText = 'OPEN FOR WORK' }) {
  return (
    <div className="flex items-center justify-end text-right font-mono text-xs tracking-wider text-[#F59E0B]">
      <span className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2 shrink-0 animate-pulse" />
      <span>{targetText}</span>
    </div>
  );
}
const TypewriterBadge = StatusBadge;

export default function PortfolioNavbar() {
  const { siteTexts } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  let navItems = NAV_ITEMS;
  if (siteTexts?.nav_items_json) {
    try {
      const parsed = JSON.parse(siteTexts.nav_items_json);
      if (Array.isArray(parsed) && parsed.length > 0) navItems = parsed;
    } catch (_) { }
  }

  const badgeText = siteTexts?.nav_status_badge || 'OPEN FOR WORK';

  const isLinkActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-[#06070B]/85 border-b border-[#23242B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 h-[68px] flex items-center justify-between">

        {/* Left: Name — first word #F5F2EA, last word amber #F59E0B, Inter Tight 800 uppercase */}
        <Link href="/" className="flex items-center shrink-0 mr-4">
          <span className="text-base sm:text-lg font-extrabold tracking-wider uppercase font-sans whitespace-nowrap">
            <span className="text-[#F5F2EA]">ASHIFUR</span>{' '}
            <span className="text-[#F59E0B]">RAHMAN</span>
          </span>
        </Link>

        {/* Center: Strip pills -> plain text, gap-[34px], tracking-[0.18em], muted -> hover amber, active amber only */}
        <div className="hidden lg:flex items-center gap-[34px] text-[12px] font-mono uppercase tracking-[0.18em]">
          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 ${active
                  ? 'text-[#F59E0B]'
                  : 'text-[#B9B5A9] hover:text-[#F59E0B]'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Typewriter ONLY — ● + "OPEN FOR WORK" in amber #F59E0B */}
        <div className="hidden md:flex items-center justify-end shrink-0">
          <TypewriterBadge targetText={badgeText} />
        </div>

        {/* Mobile menu hamburger button with accessible tap target */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center text-[#B9B5A9] hover:text-white hover:bg-[#0A0B10] border border-transparent hover:border-[#23242B] transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu — plain full-width text links with easy touch targets */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0B10] border-b border-[#23242B] px-4 sm:px-6 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <div className="pb-3 mb-1 border-b border-[#23242B] flex justify-between items-center">
            <span className="font-mono text-xs text-[#8E8B82]">STATUS:</span>
            <TypewriterBadge targetText={badgeText} />
          </div>

          {navItems.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 px-1 text-xs font-mono uppercase tracking-[0.18em] transition-colors ${active
                  ? 'text-[#F59E0B]'
                  : 'text-[#B9B5A9] hover:text-[#F59E0B]'
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
