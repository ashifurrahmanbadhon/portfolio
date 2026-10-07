"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Wrench,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart2,
  Sparkles,
  Mail,
  History,
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const pathname = usePathname();

  const primaryNavItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, badge: null },
    { name: "Website Directory", href: "/websites", icon: Globe, badge: "3" },
    { name: "Central Analytics", href: "/analytics", icon: BarChart2, badge: null },
    { name: "Roles Access", href: "/roles", icon: ShieldCheck, badge: null },
    { name: "Change History", href: "/history", icon: History, badge: "Live" },
  ];

  const managedProperties = [
    { name: "Portfolio CMS", href: "/portfolio", icon: Sparkles, badge: "Active", badgeType: "emerald" },
    { name: "ToolGhor CMS", href: "/toolghor", icon: Wrench, badge: "27 Tools", badgeType: "teal" },
  ];

  return (
    <>
      {/* Mobile Backdrop with fade transition */}
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
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Primary Navigation */}
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative select-none interactive-btn ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold shadow-xs shadow-emerald-500/5"
                      : "text-slate-400 hover:text-white hover:bg-[#111622] border border-transparent"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-400 rounded-r-full"></span>
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
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors duration-200 ${
                            item.badge === "RBAC"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-[#161C2A] text-slate-400 border-[#1E2638]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#111622] border border-[#1E2638] text-white text-xs font-mono rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {item.name}
                      {item.badge && <span className="ml-1.5 text-emerald-400 text-[10px]">({item.badge})</span>}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Managed Properties Section */}
          <div className="pt-3 border-t border-[#1E2638] space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold flex items-center justify-between">
                <span>Managed Properties</span>
                <Link
                  href="/websites"
                  title="Add Website"
                  className="text-slate-500 hover:text-emerald-400 transition-colors interactive-btn p-0.5 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            {managedProperties.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group relative select-none interactive-btn ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold shadow-xs shadow-emerald-500/5"
                      : "text-slate-400 hover:text-white hover:bg-[#111622] border border-transparent"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      item.badgeType === "teal"
                        ? "text-teal-400"
                        : item.badgeType === "emerald"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  />

                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors duration-200 ${
                            item.badgeType === "teal"
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {collapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-[#111622] border border-[#1E2638] text-white text-xs font-mono rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50">
                      {item.name}
                      {item.badge && <span className="ml-1.5 text-teal-400 text-[10px]">({item.badge})</span>}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer info & collapse button */}
        <div className="p-3 border-t border-[#1E2638] space-y-2">
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-[#111622] border border-[#1E2638]/70 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] tracking-wider">SYSTEM STATUS</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span> Online
                </span>
              </div>
              <p className="text-[10px] text-slate-500">v2.5 Next.js SaaS</p>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2 rounded-xl bg-[#111622] hover:bg-[#161E30] text-slate-400 hover:text-white border border-[#1E2638] flex items-center justify-center transition-all duration-200 text-xs font-mono interactive-btn cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>
    </>
  );
}
