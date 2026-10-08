"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  Home,
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  FolderGit2,
  Mail,
  Sliders,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutDashboard
} from "lucide-react";

function SidebarNavigation({ collapsed, setMobileOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "home";

  const portfolioTabs = [
    { name: "Home & Hero", tab: "home", href: "/admin?tab=home", icon: Home, badge: "Page 1" },
    { name: "About Ashifur", tab: "about", href: "/admin?tab=about", icon: User, badge: "Page 2" },
    { name: "Experience", tab: "experience", href: "/admin?tab=experience", icon: Briefcase, badge: "Page 3" },
    { name: "Education", tab: "education", href: "/admin?tab=education", icon: GraduationCap, badge: "Page 4" },
    { name: "Skills Matrix", tab: "skills", href: "/admin?tab=skills", icon: Cpu, badge: "Page 5" },
    { name: "Projects", tab: "projects", href: "/admin?tab=projects", icon: FolderGit2, badge: "Page 6" },
    { name: "Contact & Inbox", tab: "contact", href: "/admin?tab=contact", icon: Mail, badge: "Page 7" },
  ];

  const utilityNav = [
    { name: "Settings & Resume", tab: "settings", href: "/admin?tab=settings", icon: Sliders },
  ];

  return (
    <div className="space-y-4">
      {/* 7 Webpages Navigation */}
      <div>
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 font-bold flex items-center justify-between">
            <span>7 Website Pages</span>
            <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 text-emerald-400">
              CMS Tabs
            </span>
          </div>
        )}

        <nav className="space-y-1">
          {portfolioTabs.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === "/admin" && activeTab === item.tab;

            return (
              <Link
                key={item.tab}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative select-none ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold shadow-xs shadow-emerald-500/10"
                    : "text-slate-400 hover:text-white hover:bg-[#111622] border border-transparent"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full shadow-[0_0_8px_#10B981]"></span>
                )}

                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"
                  }`}
                />

                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.name}</span>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#161C2A] text-slate-400 border border-[#1E2638]">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}

                {/* Floating tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#111622] border border-[#1E2638] text-white text-xs font-mono rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings & Extras */}
      <div className="pt-3 border-t border-[#1E2638] space-y-1">
        {!collapsed && (
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Preferences
          </div>
        )}

        {utilityNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === "/admin" && activeTab === item.tab;

          return (
            <Link
              key={item.tab}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-400 hover:text-white hover:bg-[#111622] border border-transparent"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-emerald-400" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 bg-[#0B0F17] border-r border-[#1E2638] flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          collapsed ? "w-20" : "w-64 max-w-[85vw]"
        } ${mobileOpen ? "translate-x-0 z-50 shadow-2xl shadow-black/80" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex-1 overflow-y-auto py-3 px-2">
          <Suspense fallback={<div className="p-4 text-xs font-mono text-slate-500">Loading Navigation...</div>}>
            <SidebarNavigation collapsed={collapsed} setMobileOpen={setMobileOpen} />
          </Suspense>
        </div>

        {/* Footer info & collapse toggle */}
        <div className="p-3 border-t border-[#1E2638] space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-[#111622] border border-[#1E2638]/70 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] tracking-wider">DATABASE</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span> Neon Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate" title="ashifur.badhon@gmail.com">ashifur.badhon@gmail.com</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-400 hover:text-white border border-[#1E2638] flex items-center justify-center transition-all duration-200 text-xs font-mono cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
