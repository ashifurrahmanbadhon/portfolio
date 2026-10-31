'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Experience', href: '/experience' },
  { name: 'Projects', href: '/projects' },
  { name: 'Skills', href: '/skills' },
  { name: 'Education', href: '/education' },
  { name: 'Contact', href: '/contact' },
];

function TypewriterBadge() {
  const [displayText, setDisplayText] = useState('');
  const targetText = 'OPEN FOR WORK';

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(targetText);
      return;
    }

    let timer;
    let charIndex = 0;

    const startTyping = () => {
      charIndex = 0;
      setDisplayText('');

      const typeNext = () => {
        if (charIndex < targetText.length) {
          charIndex++;
          setDisplayText(targetText.slice(0, charIndex));
          timer = setTimeout(typeNext, 115);
        } else {
          // Hold for 1.9s, then clear at once and repeat
          timer = setTimeout(() => {
            setDisplayText('');
            timer = setTimeout(startTyping, 250);
          }, 1900);
        }
      };

      timer = setTimeout(typeNext, 115);
    };

    startTyping();

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center justify-end min-w-[160px] text-right font-mono text-xs tracking-wider text-[#F59E0B]">
      <span className="w-2 h-2 rounded-full bg-[#F59E0B] mr-2 shrink-0 animate-pulse" />
      <span>{displayText}</span>
      <span className="ml-1 inline-block w-1.5 h-3 bg-[#F59E0B] animate-pulse" />
    </div>
  );
}

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
    <nav className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-[#06070B]/85 border-b border-[#23242B] transition-colors">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-[68px] flex items-center justify-between">
        
        {/* Left: Name — first word #F5F2EA, last word amber #F59E0B, Inter Tight 800 uppercase */}
        <Link href="/" className="flex items-center shrink-0 mr-6">
          <span className="text-base sm:text-lg font-extrabold tracking-wider uppercase font-sans">
            <span className="text-[#F5F2EA]">ASHIFUR</span>{' '}
            <span className="text-[#F59E0B]">RAHMAN</span>
          </span>
        </Link>

        {/* Center: Existing nav links, JetBrains Mono uppercase 12px letterspaced, muted -> hover amber */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 text-[12px] font-mono uppercase tracking-wider">
          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                  active
                    ? 'text-[#F59E0B] font-bold bg-[#F59E0B]/10 border border-[#F59E0B]/30'
                    : 'text-[#B9B5A9] hover:text-[#F59E0B] hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Typewriter ONLY — ● + "OPEN FOR WORK" in amber #F59E0B */}
        <div className="hidden md:flex items-center justify-end shrink-0">
          <TypewriterBadge />
        </div>

        {/* Mobile menu hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#B9B5A9] hover:text-white rounded-lg hover:bg-[#0A0B10] border border-transparent hover:border-[#23242B] transition cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0A0B10] border-b border-[#23242B] px-6 py-5 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <div className="pb-3 border-b border-[#23242B] flex justify-between items-center">
            <span className="font-mono text-xs text-[#8E8B82]">STATUS:</span>
            <TypewriterBadge />
          </div>

          {NAV_ITEMS.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3.5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition ${
                  active
                    ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 font-bold'
                    : 'text-[#B9B5A9] hover:text-[#F59E0B] hover:bg-white/5'
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
