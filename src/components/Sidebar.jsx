"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import {
  LayoutDashboard,
  Home,
  User,
  FolderGit2,
  Layers,
  Briefcase,
  Cpu,
  GraduationCap,
  Mail,
  Sliders,
  FileText,
  Globe,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function SidebarNavigation({ setMobileOpen, collapsed = false }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";
  const [unreadCount, setUnreadCount] = useState(0);
  const [counts, setCounts] = useState({ projects: 9, workPackages: 8 });

  useEffect(() => {
    let isMounted = true;

    // Fetch unread messages
    const fetchUnread = async () => {
      try {
        const res = await api.getUnreadContactCount();
        if (isMounted && res && res.success && typeof res.unread === "number") {
          setUnreadCount(res.unread);
        }
      } catch (_) {}
    };

    // Fetch entity counts
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          const d = await res.json();
          if (isMounted && d) {
            setCounts({
              projects: Array.isArray(d.projects) ? d.projects.length : 9,
              workPackages: Array.isArray(d.work_packages) ? d.work_packages.length : 8,
            });
          }
        }
      } catch (_) {}
    };

    fetchUnread();
    fetchCounts();

    const handleUpdate = (e) => {
      if (typeof e?.detail === "number") {
        setUnreadCount(e.detail);
      }
    };
    window.addEventListener("unread-inbox-count", handleUpdate);
    const timer = setInterval(() => {
      fetchUnread();
    }, 60000);

    return () => {
      isMounted = false;
      window.removeEventListener("unread-inbox-count", handleUpdate);
      clearInterval(timer);
    };
  }, []);

  const NAV_GROUPS = [
    {
      group: "OVERVIEW",
      items: [
        { name: "Dashboard", tab: "dashboard", href: "/admin?tab=dashboard", icon: LayoutDashboard },
      ],
    },
    {
      group: "PAGES",
      items: [
        { name: "Home & Hero", tab: "home", href: "/admin?tab=home", icon: Home },
        { name: "About", tab: "about", href: "/admin?tab=about", icon: User },
        { name: "Projects", tab: "projects", href: "/admin?tab=projects", icon: FolderGit2, count: counts.projects },
        { name: "Work Packages", tab: "work", href: "/admin?tab=work", icon: Layers, count: counts.workPackages },
        { name: "Experience", tab: "experience", href: "/admin?tab=experience", icon: Briefcase },
        { name: "Skills", tab: "skills", href: "/admin?tab=skills", icon: Cpu },
        { name: "Education", tab: "education", href: "/admin?tab=education", icon: GraduationCap },
        { name: "Contact", tab: "contact", href: "/admin?tab=contact", icon: Mail },
      ],
    },
    {
      group: "SITE CONTENT",
      items: [
        { name: "Page Headers & Settings", tab: "settings", href: "/admin?tab=settings", icon: Sliders },
        { name: "Headings & Texts", tab: "headings", href: "/admin?tab=headings", icon: FileText, badge: "Step 2" },
        { name: "SEO Titles", tab: "seo", href: "/admin?tab=seo", icon: Globe, badge: "Step 2" },
        { name: "Inbox", tab: "inbox", href: "/admin?tab=inbox", icon: MessageSquare, isInbox: true },
      ],
    },
    {
      group: "SYSTEM",
      items: [
        { name: "AI Chat", tab: "ai_chat", href: "/admin?tab=ai_chat", icon: Sparkles, badge: "Step 2" },
        { name: "Security & System", tab: "security", href: "/admin?tab=security", icon: ShieldCheck },
      ],
    },
  ];

  return (
    <div className={`space-y-4 ${collapsed ? "py-1 px-0.5" : "py-2 px-1"}`}>
      {NAV_GROUPS.map((grp) => (
        <div key={grp.group} className="space-y-1">
          {/* Group header: hidden when collapsed */}
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8E8B82] font-semibold">
              {grp.group}
            </div>
          )}

          <nav className="space-y-0.5">
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === "/admin" && activeTab === item.tab;

              if (collapsed) {
                // Collapsed narrow rail: icon-only centered with tooltip
                return (
                  <Link
                    key={item.tab}
                    href={item.href}
                    onClick={() => setMobileOpen?.(false)}
                    title={item.name}
                    className={`stat-box group flex items-center justify-center p-2 text-xs transition-all select-none border relative rounded-none ${
                      isActive
                        ? "border-[#F59E0B] text-[#F59E0B] font-semibold bg-transparent shadow-[inset_0_0_0_1.5px_#F59E0B]"
                        : "border-transparent text-[#B9B5A9] hover:text-[#F5F2EA] hover:border-[#F59E0B] hover:shadow-[inset_0_0_0_1.5px_#F59E0B] bg-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? "text-[#F59E0B]" : "text-[#8E8B82] group-hover:text-[#F59E0B]"
                      }`}
                    />

                    {/* Unread inbox notification indicator dot in collapsed mode */}
                    {item.isInbox && unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </Link>
                );
              }

              // Expanded full width
              return (
                <Link
                  key={item.tab}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={`stat-box group flex items-center gap-2.5 px-3 py-2 text-xs transition-all select-none border rounded-none ${
                    isActive
                      ? "border-l-2 border-l-[#F59E0B] border-t border-b border-r border-[#23242B] text-[#F59E0B] font-semibold bg-transparent shadow-[inset_0_0_0_1px_#F59E0B]"
                      : "border-transparent text-[#B9B5A9] hover:text-[#F5F2EA] hover:border-[#F59E0B] hover:shadow-[inset_0_0_0_1.5px_#F59E0B] bg-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-[#F59E0B]" : "text-[#8E8B82] group-hover:text-[#F59E0B]"
                    }`}
                  />

                  <span className="flex-1 truncate">{item.name}</span>

                  {item.isInbox && unreadCount > 0 ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-[#EF4444] min-w-[18px] text-center shrink-0 leading-tight">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  ) : item.count !== undefined ? (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? "bg-[#F59E0B]/20 text-[#FBBF24]"
                          : "bg-[#1A1B22] text-[#8E8B82]"
                      }`}
                    >
                      {item.count}
                    </span>
                  ) : item.badge ? (
                    <span className="stat-box text-[9px] font-mono px-1.5 py-0.5 bg-[#0A0B10] text-[#8E8B82] border border-[#23242B]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );
}

export default function Sidebar({ mobileOpen, setMobileOpen, collapsed = false, setCollapsed }) {
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Left Sidebar (Narrow icon rail ~64px or Expanded 248px) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 ${
          collapsed ? "lg:w-[64px]" : "lg:w-[248px]"
        } w-[248px] bg-[#0A0B10] border-r border-[#23242B] flex flex-col justify-between transition-all duration-200 ease-out ${
          mobileOpen ? "translate-x-0 shadow-2xl shadow-black/90" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Top row: Minimize/Expand toggle on desktop; Close (X) on mobile */}
        {/* 1. Mobile-only top bar */}
        <div className="lg:hidden p-3 border-b border-[#23242B] flex items-center justify-end shrink-0 bg-[#0A0B10]">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1 text-[#8E8B82] hover:text-[#F5F2EA] transition cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Desktop-only Minimize/Expand toggle button */}
        <div
          className={`hidden lg:flex items-center ${
            collapsed ? "justify-center p-2" : "justify-between px-3 py-2.5"
          } border-b border-[#23242B] shrink-0 bg-[#0A0B10]`}
        >
          {!collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed?.(!collapsed)}
              className="stat-box w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-mono text-[#8E8B82] hover:text-[#F5F2EA] border border-transparent hover:border-[#F59E0B] transition cursor-pointer rounded-none"
              title="Collapse menu"
              aria-label="Collapse menu"
            >
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#B9B5A9]">
                Menu
              </span>
              <ChevronsLeft className="w-4 h-4 text-[#F59E0B]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed?.(!collapsed)}
              className="stat-box p-2 text-[#8E8B82] hover:text-[#F5F2EA] border border-transparent hover:border-[#F59E0B] transition cursor-pointer flex items-center justify-center rounded-none"
              title="Expand menu"
              aria-label="Expand menu"
            >
              <ChevronsRight className="w-4 h-4 text-[#F59E0B]" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-2.5 custom-scrollbar">
          <Suspense fallback={<div className="p-4 text-xs font-mono text-[#8E8B82]">Loading navigation...</div>}>
            <SidebarNavigation setMobileOpen={setMobileOpen} collapsed={collapsed} />
          </Suspense>
        </div>

        {/* Bottom of sidebar: Sign Out button */}
        <div className={`${collapsed ? "p-2 flex justify-center" : "p-3"} border-t border-[#23242B] shrink-0 bg-[#0A0B10]`}>
          {!collapsed ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen?.(false);
                logout();
              }}
              className="stat-box w-full py-2.5 px-3 border border-[#23242B] hover:border-rose-500/50 text-xs font-mono text-rose-400 hover:text-rose-300 flex items-center justify-center gap-2 transition cursor-pointer bg-[#0A0B10] rounded-none"
            >
              <LogOut size={14} className="text-rose-400" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setMobileOpen?.(false);
                logout();
              }}
              className="stat-box p-2 border border-[#23242B] hover:border-rose-500/50 text-rose-400 hover:text-rose-300 flex items-center justify-center transition cursor-pointer bg-[#0A0B10] rounded-none"
              title="Sign Out"
            >
              <LogOut size={16} className="text-rose-400" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
