"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import CentralLoginPanel from "./CentralLoginPanel";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AnimatedLogo from "./AnimatedLogo";

import { ToastProvider } from "./Toast";

function ShellContent({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // If public homepage, render content directly
  if (pathname === "/") {
    return <>{children}</>;
  }

  // 1. Loading state while checking token
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C14] bg-dot-pattern flex flex-col items-center justify-center space-y-4">
        <AnimatedLogo size={42} showText={false} />
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span>
          <span>Verifying Central CMS Session...</span>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Central Login Panel (Exactly as previous setup)
  if (!isAuthenticated) {
    return <CentralLoginPanel />;
  }

  // 3. Authenticated: Render TopBar across top, Sidebar and Content below
  return (
    <div className="min-h-screen bg-[#080C14] bg-dot-pattern text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <TopBar
        setMobileOpen={setMobileOpen}
        setCollapsed={setCollapsed}
        collapsed={collapsed}
      />

      <div className="flex-1 flex relative">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            collapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
        >
          <main className="flex-1 p-3 sm:p-5 md:p-8 max-w-7xl 2xl:max-w-[1536px] w-full mx-auto animate-fade-in overflow-x-hidden">
            {children}
          </main>
        </div>
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
