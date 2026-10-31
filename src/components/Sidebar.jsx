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
  Settings,
  ExternalLink,
  X
} from "lucide-react";
import { api } from "@/lib/api";

function SidebarNavigation({ setMobileOpen }) {
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
        { name: "Security", tab: "security", href: "/admin?tab=security", icon: ShieldCheck },
        { name: "Settings", tab: "system_settings", href: "/admin?tab=system_settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="space-y-5 py-2">
      {NAV_GROUPS.map((grp) => (
        <div key={grp.group} className="space-y-1">
          <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8E8B82] font-semibold">
            {grp.group}
          </div>

          <nav className="space-y-0.5">
            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === "/admin" && activeTab === item.tab;

              return (
                <Link
                  key={item.tab}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors duration-150 select-none ${
                    isActive
                      ? "bg-[rgba(245,158,11,0.13)] text-[#FBBF24] font-semibold"
                      : "text-[#B9B5A9] hover:bg-[#12131A] hover:text-[#F5F2EA]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-[#F59E0B]" : "text-[#8E8B82] group-hover:text-[#F5F2EA]"
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
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#161B26] text-[#8E8B82] border border-[#23242B]">
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

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      {/* Left Sidebar (248px, panel bg #0A0B10, hairline #23242B, sticky) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[248px] bg-[#0A0B10] border-r border-[#23242B] flex flex-col justify-between transition-transform duration-200 ease-out ${
          mobileOpen ? "translate-x-0 shadow-2xl shadow-black/90" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand row: amber avatar "A" + "Ashifur Rahman / Portfolio Admin" */}
        <div className="p-4 border-b border-[#23242B] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F59E0B] text-[#06070B] font-black text-sm flex items-center justify-center shrink-0 font-mono shadow-sm">
              A
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#F5F2EA] truncate leading-tight">
                Ashifur Rahman
              </div>
              <div className="text-[10px] font-mono text-[#8E8B82] uppercase tracking-wider leading-tight">
                Portfolio Admin
              </div>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-[#8E8B82] hover:text-[#F5F2EA] transition cursor-pointer"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 custom-scrollbar">
          <Suspense fallback={<div className="p-4 text-xs font-mono text-[#8E8B82]">Loading navigation...</div>}>
            <SidebarNavigation setMobileOpen={setMobileOpen} />
          </Suspense>
        </div>

        {/* Bottom of sidebar: View Website ↗ outline button */}
        <div className="p-3 border-t border-[#23242B] shrink-0 bg-[#0A0B10]">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 border border-[#23242B] hover:border-[#F59E0B] rounded-lg text-xs font-mono text-[#B9B5A9] hover:text-[#FBBF24] flex items-center justify-center gap-2 transition cursor-pointer bg-[#06070B]"
          >
            <span>View Website</span>
            <ExternalLink size={12} className="text-[#F59E0B]" />
          </Link>
        </div>
      </aside>
    </>
  );
}
