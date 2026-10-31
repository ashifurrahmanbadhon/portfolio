"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CentralLoginPanel from "./CentralLoginPanel";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AnimatedLogo from "./AnimatedLogo";

import { ToastProvider } from "./Toast";
import { PortfolioProvider } from "@/context/PortfolioContext";

function ShellContent({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Public portfolio routes that do not require admin CMS authentication
  const publicRoutes = ["/", "/about", "/experience", "/projects", "/skills", "/education", "/contact", "/work"];
  const isPublicRoute = publicRoutes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(route + "/")));

  if (isPublicRoute) {
    return <PortfolioProvider>{children}</PortfolioProvider>;
  }

  // 1. Loading state while checking token
  if (loading) {
    return (
      <div className="min-h-screen bg-[#06070B] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] font-bold font-mono">
          A
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#F59E0B]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
          <span>Verifying Admin Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Central Login Panel (Exactly as previous setup)
  if (!isAuthenticated) {
    return <CentralLoginPanel />;
  }

  // 3. Authenticated: Render Left Sidebar (248px) + Main Content with TopBar
  return (
    <div className="min-h-screen bg-[#06070B] text-[#F5F2EA] flex flex-col font-sans admin-shell selection:bg-[#F59E0B]/20 selection:text-[#FBBF24]">
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="lg:pl-[248px] flex-1 flex flex-col min-w-0 transition-all duration-200">
        <TopBar
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl 2xl:max-w-[1536px] w-full mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ShellContent>{children}</ShellContent>
      </ToastProvider>
    </AuthProvider>
  );
}
