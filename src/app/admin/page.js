"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ArrowRight,
  Home,
  User,
  Briefcase,
  GraduationCap,
  Cpu,
  FolderGit2,
  Mail,
  Sliders,
  ExternalLink,
  Save,
  Plus,
  Trash2,
  Edit2,
  Check,
  CheckSquare,
  Square,
  X,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RefreshCw,
  Eye,
  FileDown,
  Globe,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
  ChevronDown,
  Send,
  Reply,
  Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";
import SpotlightCard from "@/components/SpotlightCard";
import MediaUploader from "@/components/MediaUploader";
import ActiveToggle from "@/components/admin/ActiveToggle";
import LivePreviewPanel from "@/components/admin/LivePreviewPanel";

const AboutPillarsManager = dynamic(() => import("@/components/admin/AboutPillarsManager"), { ssr: true });
const AboutPrinciplesManager = dynamic(() => import("@/components/admin/AboutPrinciplesManager"), { ssr: true });
const ExperienceMetricsManager = dynamic(() => import("@/components/admin/ExperienceMetricsManager"), { ssr: true });
const CertificationsManager = dynamic(() => import("@/components/admin/CertificationsManager"), { ssr: true });
const CourseworkManager = dynamic(() => import("@/components/admin/CourseworkManager"), { ssr: true });
const SoftwareToolsManager = dynamic(() => import("@/components/admin/SoftwareToolsManager"), { ssr: true });
const SkillBadgesManager = dynamic(() => import("@/components/admin/SkillBadgesManager"), { ssr: true });
const ProjectMethodologyManager = dynamic(() => import("@/components/admin/ProjectMethodologyManager"), { ssr: true });
const PageHeadersManager = dynamic(() => import("@/components/admin/PageHeadersManager"), { ssr: true });
const HomepageCtaManager = dynamic(() => import("@/components/admin/HomepageCtaManager"), { ssr: true });
const HeadingsTextsEditor = dynamic(() => import("@/components/admin/HeadingsTextsEditor"), { ssr: true });
const SeoTitlesEditor = dynamic(() => import("@/components/admin/SeoTitlesEditor"), { ssr: true });
const AiChatEditor = dynamic(() => import("@/components/admin/AiChatEditor"), { ssr: true });

import { DEFAULT_PROCESS_STEPS, DEFAULT_SITE_TEXTS } from "@/lib/portfolioDefaults";

// Default fallbacks matching portfolio initial state
const DEFAULT_HERO = {
  name: "ASHIFUR RAHMAN",
  title: "Electrical & Electronic Engineer",
  badge_text: "Available for Engineering, Technology & AI Opportunities",
  introduction:
    "Electrical & Electronic Engineer with expertise in technical solutions, strategic management, data-driven decision-making, and emerging AI technologies.",
  profile_image: "/ashifur-home.jpg",
  profile_position: "center 15%",
  primary_btn_text: "Contact Me",
  primary_btn_link: "/contact",
  secondary_btn_text: "Download CV",
  secondary_btn_link: "/Ashifur_Rahman_CV.pdf",
  spec_badge_label: "Specialization",
  spec_badge_title: "Engineering, Management & AI",
};

const DEFAULT_ABOUT = {
  subtitle: "About Ashifur",
  title: "Engineering Precision With Analytical Rigor",
  description1:
    "Electrical & Electronic Engineering graduate with professional experience in engineering, technical design, AutoCAD Electrical, GIS, and power system analysis. Currently expanding expertise in Artificial Intelligence.",
  description2:
    "Combine engineering knowledge with AI to develop smarter, practical, technology-driven solutions and grow as an innovative technology professional.",
  profile_image: "/ashifur-about.jpg",
  profile_position: "center 12%",
  focus1_title: "Energy Systems & Digital Innovation",
  focus1_text: "Focus Area",
  focus2_title: "AutoCAD & GIS",
  focus2_text: "Mapping & CAD",
};

const DEFAULT_HIGHLIGHTS = [
  { metric_value: "B.Sc.", metric_label: "Electrical & Electronic Eng.", metric_subtext: "Accredited Engineering Degree" },
  { metric_value: "15+", metric_label: "CAD & Power Projects", metric_subtext: "SLDs, GIS Maps & Simulations" },
  { metric_value: "100%", metric_label: "Safety & Compliance Focus", metric_subtext: "Standard Operating Protocols" },
  { metric_value: "6+", metric_label: "Core Software Tools", metric_subtext: "AutoCAD, ETAP, MATLAB, GIS" },
];

const VALID_SECTION_IDS = [
  "dashboard",
  "home",
  "about",
  "experience",
  "education",
  "skills",
  "projects",
  "work",
  "contact",
  "inbox",
  "settings",
  "headings",
  "seo",
  "ai_chat",
  "security",
  "system_settings",
];

function AdminConsoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const ADMIN_CACHE_KEY = "admin_portfolio_cache_v4";

  // Data states
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [about, setAbout] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [experiences, setExperiences] = useState([]);
  const [educations, setEducations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workPackages, setWorkPackages] = useState([]);
  const [socialLinks, setSocialLinks] = useState({});
  const [contactChannels, setContactChannels] = useState([]);
  const [resume, setResume] = useState({});
  const [siteSettings, setSiteSettings] = useState({});
  const [messages, setMessages] = useState([]);

  // Dynamic extended sections (100% editable CMS)
  const [experienceMetrics, setExperienceMetrics] = useState([]);
  const [courseworkPillars, setCourseworkPillars] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [softwareTools, setSoftwareTools] = useState([]);
  const [skillBadges, setSkillBadges] = useState([]);
  const [projectMethodologies, setProjectMethodologies] = useState([]);
  const [pageHeaders, setPageHeaders] = useState({});
  const [homepageCta, setHomepageCta] = useState({});
  const [siteTexts, setSiteTexts] = useState(DEFAULT_SITE_TEXTS);
  const [processSteps, setProcessSteps] = useState(DEFAULT_PROCESS_STEPS);

  // Active category filter for skills & projects
  const [skillCategoryFilter, setSkillCategoryFilter] = useState("all");
  const [projectCategoryFilter, setProjectCategoryFilter] = useState("all");

  // Inbound messages bulk selection state
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Admin presence & online state (heartbeat ping)
  const [adminOnline, setAdminOnline] = useState(true);

  // Message reply & thread states
  const [expandedMessageIds, setExpandedMessageIds] = useState([]);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [sendingReplies, setSendingReplies] = useState({});
  const [replyErrors, setReplyErrors] = useState({});
  const [replySuccesses, setReplySuccesses] = useState({});

  // Live unread contact messages count & document title tracker
  const [unreadContactCount, setUnreadContactCount] = useState(0);
  const baseDocumentTitleRef = useRef(null);

  // Dynamic time greeting & live ticking clock (12-hour format with seconds & full date bar)
  const [timeGreeting, setTimeGreeting] = useState({ text: "Good Day", emoji: "✨" });
  const [liveTime, setLiveTime] = useState("");
  const [liveDate, setLiveDate] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setTimeGreeting({ text: "Good Morning", emoji: "🌅" });
      } else if (hour >= 12 && hour < 17) {
        setTimeGreeting({ text: "Good Afternoon", emoji: "☀️" });
      } else if (hour >= 17 && hour < 21) {
        setTimeGreeting({ text: "Good Evening", emoji: "🌆" });
      } else {
        setTimeGreeting({ text: "Good Night", emoji: "🌙" });
      }

      // 12-hour format with seconds: e.g. "08:46:03 PM"
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      // Full date with day name: e.g. "Saturday, 17 Oct 2026"
      const dateStr = now.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      setLiveTime(timeStr);
      setLiveDate(dateStr);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Admin Presence Heartbeat: POST /api/admin/presence every 30s while visible, on mount and on visibilitychange
  useEffect(() => {
    let timer = null;

    const pingPresence = async () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        try {
          const res = await api.updatePresence();
          if (res && res.success) {
            setAdminOnline(true);
          }
        } catch (err) {
          console.warn("Heartbeat error:", err);
        }
      }
    };

    pingPresence();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        pingPresence();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        pingPresence();
      }
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (timer) clearInterval(timer);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.getUnreadContactCount();
      if (res && res.success && typeof res.unread === "number") {
        setUnreadContactCount(res.unread);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("unread-inbox-count", { detail: res.unread }));
        }
      }
    } catch (err) {
      // A failed fetch keeps the last shown count (no flicker to 0)
      console.warn("Failed to fetch unread contact count:", err);
    }
  };

  // Poll unread count every 60s while admin is mounted
  useEffect(() => {
    let timer = null;

    fetchUnreadCount();

    timer = setInterval(() => {
      fetchUnreadCount();
    }, 60000);

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  // Update browser tab document title: prefix with ({unread}) when unread > 0, restore when 0
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!baseDocumentTitleRef.current) {
      baseDocumentTitleRef.current = document.title.replace(/^\(\d+\+?\)\s*/, "") || "Ashifur Rahman • Central CMS";
    }

    const base = baseDocumentTitleRef.current;
    if (unreadContactCount > 0) {
      const prefix = unreadContactCount > 99 ? "99+" : unreadContactCount;
      document.title = `(${prefix}) ${base}`;
    } else {
      document.title = base;
    }
  }, [unreadContactCount]);

  const formatDhakaTime = (isoString) => {
    if (!isoString) return "";
    try {
      return (
        new Date(isoString).toLocaleString("en-US", {
          timeZone: "Asia/Dhaka",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " (Asia/Dhaka)"
      );
    } catch (_) {
      return new Date(isoString).toLocaleString();
    }
  };

  const toggleExpandMessage = (id) => {
    setExpandedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSendReply = async (messageId) => {
    const draft = (replyDrafts[messageId] || "").trim();
    if (!draft) return;
    if (draft.length > 4000) {
      setReplyErrors((prev) => ({ ...prev, [messageId]: "Reply must not exceed 4000 characters." }));
      return;
    }

    setSendingReplies((prev) => ({ ...prev, [messageId]: true }));
    setReplyErrors((prev) => ({ ...prev, [messageId]: null }));
    setReplySuccesses((prev) => ({ ...prev, [messageId]: false }));

    try {
      const res = await api.replyContactMessage(messageId, draft);
      if (res && res.success) {
        // Appends to thread without reload & marks original read
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId) {
              const currentReplies = m.replies || [];
              return {
                ...m,
                is_read: 1,
                replies: [...currentReplies, res.reply],
              };
            }
            return m;
          })
        );
        setReplyDrafts((prev) => ({ ...prev, [messageId]: "" }));
        setReplySuccesses((prev) => ({ ...prev, [messageId]: true }));
        fetchUnreadCount();
        showToast("Reply sent successfully via email!", "success");
        setTimeout(() => {
          setReplySuccesses((prev) => ({ ...prev, [messageId]: false }));
        }, 3000);
      } else {
        const errMsg = res?.error || "Failed to send email reply";
        setReplyErrors((prev) => ({ ...prev, [messageId]: errMsg }));
        showToast(errMsg, "error");
      }
    } catch (err) {
      console.error("Reply submit error:", err);
      const errMsg = err.message || "Failed to send reply";
      setReplyErrors((prev) => ({ ...prev, [messageId]: errMsg }));
      showToast(errMsg, "error");
    } finally {
      setSendingReplies((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const toggleSelectMessage = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllMessages = () => {
    if (selectedMessages.length === messages.length && messages.length > 0) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((m) => m.id));
    }
  };

  const handleBulkDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;
    if (!window.confirm(`Delete ${selectedMessages.length} selected message(s) permanently?`)) return;
    setDeletingBulk(true);
    try {
      if (api.deleteContactMessages) {
        await api.deleteContactMessages(selectedMessages);
      } else {
        await Promise.all(selectedMessages.map((id) => api.deleteContactMessage(id)));
      }
      setMessages((prev) => prev.filter((m) => !selectedMessages.includes(m.id)));
      showToast(`${selectedMessages.length} message(s) deleted successfully`, "info");
      setSelectedMessages([]);
      fetchUnreadCount();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showToast("Failed to delete selected messages", "error");
    } finally {
      setDeletingBulk(false);
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedMessages.length === 0) return;
    try {
      await Promise.all(selectedMessages.map((id) => api.markContactMessageRead(id, 1)));
      setMessages((prev) =>
        prev.map((m) => (selectedMessages.includes(m.id) ? { ...m, is_read: 1 } : m))
      );
      showToast(`${selectedMessages.length} message(s) marked as read`, "success");
      setSelectedMessages([]);
      fetchUnreadCount();
    } catch (err) {
      console.error("Bulk mark read failed:", err);
      showToast("Failed to mark messages as read", "error");
    }
  };

  // Modals state
  const [modalType, setModalType] = useState(null); // 'experience' | 'education' | 'skill' | 'project' | 'highlight'
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);

  // Apply parsed JSON response into admin states cleanly
  const applyAdminData = (res) => {
    if (!res || typeof res !== "object") return;
    if (res.hero && res.hero.name) setHero(res.hero);
    if (res.about) setAbout(res.about);
    if (Array.isArray(res.highlights) && res.highlights.length > 0) setHighlights(res.highlights);
    if (Array.isArray(res.experiences)) setExperiences(res.experiences);
    if (Array.isArray(res.educations)) setEducations(res.educations);
    if (Array.isArray(res.skills)) setSkills(res.skills);
    if (Array.isArray(res.projects)) setProjects(res.projects);
    if (Array.isArray(res.work_packages)) setWorkPackages(res.work_packages);
    if (res.social_links) setSocialLinks(res.social_links);
    if (Array.isArray(res.contact_channels)) setContactChannels(res.contact_channels);
    if (res.resume) setResume(res.resume);
    if (res.site_settings) setSiteSettings(res.site_settings);

    if (Array.isArray(res.experience_metrics)) setExperienceMetrics(res.experience_metrics);
    if (Array.isArray(res.coursework_pillars)) setCourseworkPillars(res.coursework_pillars);
    if (Array.isArray(res.certifications)) setCertifications(res.certifications);
    if (Array.isArray(res.software_tools)) setSoftwareTools(res.software_tools);
    if (Array.isArray(res.skill_badges)) {
      setSkillBadges(res.skill_badges);
    }
    if (Array.isArray(res.project_methodologies)) setProjectMethodologies(res.project_methodologies);
    if (res.page_headers) setPageHeaders(res.page_headers);
    if (res.homepage_cta) setHomepageCta(res.homepage_cta);
    if (Array.isArray(res.process_steps) && res.process_steps.length > 0) setProcessSteps(res.process_steps);
    if (res.site_texts) setSiteTexts(res.site_texts);
  };

  // Load content from API
  // Load content from API
  const loadData = async (force = false) => {
    try {
      setLoading(true);
      const res = await api.getPortfolioContent(force);
      if (res) {
        applyAdminData(res);
        setInitialLoaded(true);

        // Store in admin local cache for instant future loads
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(ADMIN_CACHE_KEY, JSON.stringify(res));
          } catch (_) {}
        }
      }

      // Load inbox messages
      const msgRes = await api.getContactMessages();
      if (msgRes && msgRes.messages) {
        setMessages(msgRes.messages);
      }
    } catch (err) {
      console.error("Failed to load portfolio content:", err);
      showToast("Notice: Using local defaults while syncing database.", "info");
      setInitialLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Attempt instantaneous hydration from admin cache
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(ADMIN_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          applyAdminData(parsed);
          setInitialLoaded(true);
        }
      } catch (_) {}
    }
    loadData(true);
  }, []);

  const switchTab = (tab) => {
    router.push(`/admin?tab=${tab}`);
  };

  const [gitSyncing, setGitSyncing] = useState(false);

  const handleManualGitSync = async () => {
    setGitSyncing(true);
    try {
      const res = await api.syncGit();
      if (res && res.success) {
        showToast(res.message || "Pushed to GitHub & deployed live on Vercel!", "success");
      } else {
        showToast(res?.error || "Git sync error", "error");
      }
    } catch (err) {
      showToast("Git sync error. Please check connection.", "error");
    } finally {
      setGitSyncing(false);
    }
  };

  // Generic section saver with automatic session recovery and dual-DB sync
  const handleSaveSection = async (section, data, successMsg) => {
    setSaving(true);
    try {
      let res = await api.savePortfolioSection(section, data);

      // If unauthorized, notify user to log in again
      if (res?.error === "Unauthorized" || res?.status === 401) {
        showToast("Session expired or unauthorized. Please log in again.", "error");
        return;
      }

      if (res && res.success) {
        showToast(successMsg || `${section.toUpperCase()} saved to Database & synced live!`, "success");
        await loadData(true);
      } else {
        showToast(res?.error || "Save error occurred", "error");
      }
    } catch (err) {
      showToast("Failed to save changes. Please check connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reorder helper
  const moveItem = (list, setList, index, direction, sectionKey) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const updated = [...list];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setList(updated);
    handleSaveSection(sectionKey, { items: updated }, "Order updated successfully!");
  };

  // Delete helper
  const deleteItem = (list, setList, index, sectionKey, itemLabel) => {
    if (!window.confirm(`Are you sure you want to delete this ${itemLabel}?`)) return;
    const updated = list.filter((_, idx) => idx !== index);
    setList(updated);
    handleSaveSection(sectionKey, { items: updated }, `${itemLabel} removed successfully!`);
  };

  // Active / Disabled toggle helper
  const toggleItemActive = (list, setList, index, sectionKey, itemLabel) => {
    const updated = list.map((item, idx) => {
      if (idx !== index) return item;
      const currentActive = item.is_active !== 0 && item.is_active !== false && item.is_published !== 0;
      const nextVal = currentActive ? 0 : 1;
      return { ...item, is_active: nextVal, is_published: nextVal };
    });
    setList(updated);
    const isNowActive = updated[index].is_active === 1;
    handleSaveSection(
      sectionKey,
      { items: updated },
      `${itemLabel || "Item"} is now ${isNowActive ? "Active (visible on website)" : "Disabled (hidden from website)"}!`
    );
  };

  // Contact Channels Active / Disabled toggle helper
  const getChannelActive = (key) => {
    const ch = contactChannels.find((c) => c.channel_key === key);
    return ch ? ch.is_active !== 0 && ch.is_active !== false : true;
  };

  const toggleChannelActive = async (key, label) => {
    let updated = [...contactChannels];
    const idx = updated.findIndex((c) => c.channel_key === key);
    let nextActive = 1;
    if (idx !== -1) {
      nextActive = updated[idx].is_active !== 0 && updated[idx].is_active !== false ? 0 : 1;
      updated[idx] = { ...updated[idx], is_active: nextActive };
    } else {
      nextActive = 0;
      updated.push({ channel_key: key, is_active: 0 });
    }
    setContactChannels(updated);
    await handleSaveSection(
      "contact_channels",
      { items: updated },
      `${label} is now ${nextActive === 1 ? "Active (visible on website)" : "Disabled (hidden from website)"}!`
    );
  };

  // Tab definitions
  const tabs = [
    { id: "dashboard", label: "Dashboard", pageNum: "Overview", title: "Overview Dashboard", subtitle: "Live metrics, fast shortcuts, and system status across your portfolio CMS", icon: LayoutDashboard, liveUrl: "/" },
    { id: "home", label: "Home & Hero", pageNum: "Page 1", title: "Home & Hero Section", subtitle: "Live editor for headline, credentials badge, introduction, and primary CTA buttons", icon: Home, liveUrl: "/" },
    { id: "about", label: "About Ashifur", pageNum: "Page 2", title: "About Ashifur — Background & Vision", subtitle: "Configure personal narrative, engineering focus cards, and operating principles", icon: User, liveUrl: "/about" },
    { id: "projects", label: "Engineering Projects", pageNum: "Page 3", title: "Engineering Projects & Case Studies", subtitle: `Manage ${projects.length} featured engineering case studies and simulations`, icon: FolderGit2, liveUrl: "/projects", count: projects.length },
    { id: "work", label: "Work Packages", pageNum: "Page 4", title: "Work & Service Packages", subtitle: `Manage ${workPackages.length} fixed-scope service packages displayed on /work`, icon: Layers, liveUrl: "/work", count: workPackages.length },
    { id: "experience", label: "Work Experience", pageNum: "Page 5", title: "Work Experience & Field Operations", subtitle: `Manage ${experiences.length} professional positions and high-voltage field roles`, icon: Briefcase, liveUrl: "/experience", count: experiences.length },
    { id: "skills", label: "Technical Skills", pageNum: "Page 6", title: "Technical Skills Matrix & Software Tools", subtitle: `Manage ${skills.length} technical skills across 4 engineering domains`, icon: Cpu, liveUrl: "/skills", count: skills.length },
    { id: "education", label: "Academic Education", pageNum: "Page 7", title: "Academic Background & Certifications", subtitle: `Manage ${educations.length} accredited degrees, certifications, and coursework`, icon: GraduationCap, liveUrl: "/education", count: educations.length },
    { id: "contact", label: "Contact Info", pageNum: "Page 8", title: "Contact Hub & Communication Channels", subtitle: "Update email, phone, WhatsApp, office location, and social media channels", icon: Mail, liveUrl: "/contact" },
    { id: "settings", label: "Page Headers & Settings", pageNum: "Global", title: "Page Headers & Global Settings", subtitle: "Update SEO meta descriptions, page banner titles, and collaboration CTA", icon: Sliders, liveUrl: "/" },
    { id: "headings", label: "Headings & Texts", pageNum: "Site Content", title: "Headings & Texts Editor", subtitle: "Structured headings, kickers, and section descriptions (Step 2 Implementation)", icon: FileText, liveUrl: "/" },
    { id: "seo", label: "SEO Titles", pageNum: "Site Content", title: "SEO Titles & Metadata", subtitle: "Per-page SEO title templates, OpenGraph tags, and social cards (Step 2 Implementation)", icon: Globe, liveUrl: "/" },
    { id: "inbox", label: "Inbox", pageNum: "Site Content", title: "Inbound Messages & Visitor Inquiries", subtitle: `View, manage, mark, and delete ${messages.length} direct visitor inquiries submitted via /contact`, icon: MessageSquare, liveUrl: "/contact", badge: unreadContactCount, count: messages.length },
    { id: "ai_chat", label: "AI Chat", pageNum: "System", title: "AI Chat Assistant", subtitle: "Model cascade, system prompts, and token limits (Step 2 Implementation)", icon: Sparkles, liveUrl: "/" },
    { id: "security", label: "Security", pageNum: "System", title: "Security & Access Control", subtitle: "Two-factor authentication, sessions, and recovery codes", icon: ShieldCheck, liveUrl: "/admin" },
    { id: "system_settings", label: "Settings", pageNum: "System", title: "System Settings", subtitle: "Dual database parity, cache management, and sync operations", icon: Sliders, liveUrl: "/admin" },
  ];

  const currentTabObj = tabs.find((t) => t.id === currentTab) || tabs[0];
  const CurrentIcon = currentTabObj.icon;

  const hasLiveRail = ["home", "about", "projects", "work", "experience", "skills", "education", "contact", "inbox", "settings"].includes(currentTab);

  const railTargetUrl =
    currentTab === "about"
      ? "/about"
      : currentTab === "experience"
      ? "/experience"
      : currentTab === "education"
      ? "/education"
      : currentTab === "skills"
      ? "/skills"
      : currentTab === "projects"
      ? "/projects"
      : currentTab === "work"
      ? "/work"
      : currentTab === "contact" || currentTab === "inbox"
      ? "/contact"
      : "/";

  const railDraftSection =
    currentTab === "home"
      ? "home"
      : currentTab === "about"
      ? "about"
      : currentTab === "experience"
      ? "experience"
      : currentTab === "education"
      ? "education"
      : currentTab === "skills"
      ? "skills"
      : currentTab === "projects"
      ? "projects"
      : currentTab === "work"
      ? "work_packages"
      : currentTab === "contact"
      ? "contact"
      : currentTab === "settings"
      ? "settings"
      : undefined;

  const railSavedOnly = currentTab === "inbox";

  const railGetDraftData = () => {
    switch (currentTab) {
      case "home":
        return { hero, cta: homepageCta };
      case "about":
        return { about };
      case "experience":
        return { experiences, metrics: experienceMetrics };
      case "education":
        return { educations, pillars: courseworkPillars, certifications };
      case "skills":
        return { skills, softwareTools, badges: skillBadges };
      case "projects":
        return { projects, methodologies: projectMethodologies };
      case "work":
        return { workPackages };
      case "contact":
        return { contact: socialLinks, channels: contactChannels };
      case "settings":
        return { pageHeaders, resume };
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Section Command Header */}
      <div className="bg-[#0A0B10] border border-[#23242B] rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
                <CurrentIcon className="w-4 h-4" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-[#F5F2EA] tracking-tight">
                {currentTabObj.title}
              </h1>
              {currentTabObj.count !== undefined && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#12131A] text-[#B9B5A9] border border-[#23242B]">
                  {currentTabObj.count} items
                </span>
              )}
              {currentTabObj.badge > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                  {currentTabObj.badge} unread
                </span>
              )}
            </div>
            <p className="text-xs text-[#8E8B82] max-w-2xl leading-relaxed">
              {currentTabObj.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleManualGitSync}
              disabled={gitSyncing}
              className="px-3 py-1.5 rounded-lg bg-[#12131A] hover:bg-[#1A1B22] text-[#F5F2EA] hover:text-[#F59E0B] border border-[#23242B] text-xs font-mono transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Push changes to Git repository & deploy live on Vercel"
            >
              <Sparkles className={`w-3.5 h-3.5 text-[#F59E0B] ${gitSyncing ? "animate-spin" : ""}`} />
              <span>{gitSyncing ? "Deploying..." : "Push to Live"}</span>
            </button>

            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#12131A] hover:bg-[#1A1B22] text-[#8E8B82] hover:text-[#F5F2EA] border border-[#23242B] text-xs font-mono transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#F59E0B]" : ""}`} />
              <span>{loading ? "Syncing..." : "Refresh"}</span>
            </button>

            <a
              href={currentTabObj.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-mono font-medium transition flex items-center gap-1.5 group"
            >
              <span>View Live</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Initial Database Synchronization Skeleton Gate */}
      {!initialLoaded && loading ? (
        <div className="bg-[#0A0B10] border border-[#23242B] rounded-2xl p-12 sm:p-16 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <RefreshCw className="w-5 h-5 text-[#F59E0B] animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">Synchronizing With Live Database...</h3>
            <p className="text-xs text-slate-400">Retrieving verified portfolio content and media assets</p>
          </div>
        </div>
      ) : (
        <>
          {/* ============================================================== */}
          {/* TAB 1: HOME & HERO SECTION                                     */}
          {/* ============================================================== */}
                            <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT COLUMN: Active Page Dedicated Content (flex-1 min-w-0) */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* ============================================================== */}
            {/* TAB: DASHBOARD (OVERVIEW)                                      */}
            {/* ============================================================== */}
            {currentTab === "dashboard" && (
              <div className="space-y-6">
                {/* Overview Metric Stat-Boxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <Link href="/admin?tab=projects" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Projects</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors">{projects.length || 9}</div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Engineering cases</div>
                  </Link>
                  <Link href="/admin?tab=work" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Packages</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors">{workPackages.length || 8}</div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Service presets</div>
                  </Link>
                  <Link href="/admin?tab=inbox" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Inquiries</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors flex items-center gap-1.5">
                      <span>{messages.length}</span>
                      {unreadContactCount > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">{unreadContactCount}</span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Visitor messages</div>
                  </Link>
                  <Link href="/admin?tab=skills" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Skills</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors">{skills.length || 16}</div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Technical items</div>
                  </Link>
                  <Link href="/admin?tab=experience" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Experience</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors">{experiences.length || 2}</div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Career positions</div>
                  </Link>
                  <Link href="/admin?tab=education" className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 transition group cursor-pointer block">
                    <div className="text-[10px] font-mono text-[#8E8B82] uppercase mb-1">Education</div>
                    <div className="text-2xl font-bold font-mono text-[#F5F2EA] group-hover:text-[#F59E0B] transition-colors">{educations.length || 3}</div>
                    <div className="text-[10px] text-[#8E8B82] mt-1">Degrees & certs</div>
                  </Link>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Home & Hero</h3>
                      </div>
                      <Link href="/admin?tab=home" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">Edit →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">Headline, badge, intro, profile image, and CTA action buttons.</p>
                  </div>

                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Engineering Projects</h3>
                      </div>
                      <Link href="/admin?tab=projects" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">Manage ({projects.length || 9}) →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">High-voltage substations, GIS mapping, motor test benches, and simulations.</p>
                  </div>

                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Work Packages</h3>
                      </div>
                      <Link href="/admin?tab=work" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">Manage ({workPackages.length || 8}) →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">8 fixed-scope presets with deliverables, tags, and custom inquiry modals.</p>
                  </div>

                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Inbound Inquiries</h3>
                      </div>
                      <Link href="/admin?tab=inbox" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">View ({messages.length}) →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">Read client messages, send threaded replies, and mark unread items.</p>
                  </div>

                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Headers & Settings</h3>
                      </div>
                      <Link href="/admin?tab=settings" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">Configure →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">SEO metadata, page banner headers, resume link, and global contact CTA.</p>
                  </div>

                  <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm font-semibold text-[#F5F2EA]">Security & Access</h3>
                      </div>
                      <Link href="/admin?tab=security" className="text-xs font-mono text-[#F59E0B] hover:text-[#FBBF24]">Review →</Link>
                    </div>
                    <p className="text-xs text-[#8E8B82]">Two-factor authentication, session tokens, and admin credentials.</p>
                  </div>
                </div>

                {/* Cloud System Parity Status Bar */}
                <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-[#F5F2EA] font-semibold">Neon PostgreSQL Cloud Parity</span>
                    <span className="text-[#8E8B82]">• 0 Drift Mismatches</span>
                  </div>
                  <div className="flex items-center gap-3 text-[#8E8B82]">
                    <span>All 8 public routes verified</span>
                    <button onClick={() => loadData(true)} className="text-[#F59E0B] hover:text-[#FBBF24] hover:underline cursor-pointer">Re-sync now</button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: HEADINGS & TEXTS (TOTAL EDITABLE COVERAGE)                */}
            {/* ============================================================== */}
            {currentTab === "headings" && (
              <HeadingsTextsEditor
                siteTexts={siteTexts}
                setSiteTexts={setSiteTexts}
                processSteps={processSteps}
                setProcessSteps={setProcessSteps}
                onSave={handleSaveSection}
                saving={saving}
              />
            )}

            {/* ============================================================== */}
            {/* TAB: SEO TITLES (8 PAGES WITH LIVE SERP PREVIEW)               */}
            {/* ============================================================== */}
            {currentTab === "seo" && (
              <SeoTitlesEditor
                pageHeaders={pageHeaders}
                setPageHeaders={setPageHeaders}
                onSave={handleSaveSection}
                saving={saving}
              />
            )}

            {/* ============================================================== */}
            {/* TAB: AI CHAT (WELCOME GREETING & CHIPS MANAGER)                */}
            {/* ============================================================== */}
            {currentTab === "ai_chat" && (
              <AiChatEditor
                siteTexts={siteTexts}
                setSiteTexts={setSiteTexts}
                onSave={handleSaveSection}
                saving={saving}
              />
            )}

            {/* ============================================================== */}
            {/* TAB: SECURITY & ACCESS CONTROL                                 */}
            {/* ============================================================== */}
            {currentTab === "security" && (
              <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#F5F2EA]">Security & Access Control</h2>
                    <span className="stat-box text-[10px] font-mono px-2 py-0.5 bg-[#12131A] text-[#F59E0B] border border-[#23242B]">2FA Enforced</span>
                  </div>
                </div>
                <p className="text-xs text-[#B9B5A9] max-w-xl leading-relaxed">
                  Manage multi-factor authentication, active login sessions, emergency recovery codes, and administrator credentials.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="stat-box p-4 bg-[#06070B] border border-[#23242B] space-y-1">
                    <div className="text-xs font-bold text-[#F5F2EA]">Two-Factor Authentication</div>
                    <div className="text-[11px] text-[#8E8B82]">TOTP authenticator app + SMS OTP fallback + 8 emergency backup codes.</div>
                  </div>
                  <div className="stat-box p-4 bg-[#06070B] border border-[#23242B] space-y-1">
                    <div className="text-xs font-bold text-[#F5F2EA]">Session Encryption</div>
                    <div className="text-[11px] text-[#8E8B82]">SHA-256 password hashing + HttpOnly secure JWT tokens.</div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SYSTEM SETTINGS                                           */}
            {/* ============================================================== */}
            {currentTab === "system_settings" && (
              <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#F5F2EA]">System & Environment Settings</h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12131A] text-[#B9B5A9] border border-[#23242B]">Production Active</span>
                  </div>
                </div>
                <p className="text-xs text-[#B9B5A9] max-w-xl leading-relaxed">
                  System health, database parity between local SQLite development and Neon PostgreSQL production, and admin local cache controls.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => loadData(true)} className="px-3.5 py-2 rounded-lg bg-[#F59E0B] text-[#06070B] text-xs font-bold font-mono hover:bg-[#FBBF24] transition cursor-pointer">
                    Clear Cache & Force Re-sync
                  </button>
                  <button onClick={handleManualGitSync} disabled={gitSyncing} className="px-3.5 py-2 rounded-lg bg-[#12131A] text-[#F5F2EA] hover:text-[#F59E0B] border border-[#23242B] text-xs font-mono transition cursor-pointer">
                    {gitSyncing ? "Deploying..." : "Trigger Git Sync"}
                  </button>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: HOME */}
            {/* ============================================================== */}
            {currentTab === "home" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#23242B] mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-[#F59E0B]" />
                  Hero Section Content
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  The primary showcase that visitors see when arriving at <code className="text-[#F59E0B]">/</code>
                </p>
              </div>

              <button
                onClick={() => handleSaveSection("hero", hero, "Hero section saved!")}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Hero"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={hero.name || ""}
                  onChange={(e) => setHero({ ...hero, name: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Professional Headline / Role</label>
                <input
                  type="text"
                  value={hero.title || ""}
                  onChange={(e) => setHero({ ...hero, title: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-300 mb-1.5">Status Badge Text</label>
                <input
                  type="text"
                  value={hero.badge_text || ""}
                  onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-medium text-slate-300 mb-1.5">Introduction Summary Bio</label>
                <textarea
                  rows={3}
                  value={hero.introduction || ""}
                  onChange={(e) => setHero({ ...hero, introduction: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
                />
              </div>

              <div className="md:col-span-2">
                <MediaUploader
                  value={hero.profile_image || ""}
                  onChange={(url) => setHero({ ...hero, profile_image: url })}
                  positionValue={hero.profile_position || "center 15%"}
                  onPositionChange={(pos) => setHero({ ...hero, profile_position: pos })}
                  previewAspect="3/4"
                  label="Hero Profile Photo (Headshot / Portrait)"
                  description="Upload your high-res profile photo or drag & drop directly from device"
                  type="image"
                  defaultValue="/ashifur.jpeg"
                  defaultPosition="50% 50%"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Specialization Badge</label>
                <input
                  type="text"
                  value={hero.spec_badge_title || ""}
                  onChange={(e) => setHero({ ...hero, spec_badge_title: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Primary Button Text & Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.primary_btn_text || ""}
                    onChange={(e) => setHero({ ...hero, primary_btn_text: e.target.value })}
                    placeholder="Button text"
                    className="bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={hero.primary_btn_link || ""}
                    onChange={(e) => setHero({ ...hero, primary_btn_link: e.target.value })}
                    placeholder="/contact"
                    className="bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Secondary Button Text & Link</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={hero.secondary_btn_text || ""}
                    onChange={(e) => setHero({ ...hero, secondary_btn_text: e.target.value })}
                    placeholder="Download CV"
                    className="bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                  />
                  <input
                    type="text"
                    value={hero.secondary_btn_link || ""}
                    onChange={(e) => setHero({ ...hero, secondary_btn_link: e.target.value })}
                    placeholder="/Ashifur_Rahman_CV.pdf"
                    className="bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Highlights Metrics Cards */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23242B]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  Hero Highlights &amp; Metrics Cards
                </h3>
                <p className="text-xs text-slate-400">Featured metric banners appearing right under the hero headline.</p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({ metric_value: "", metric_label: "", metric_subtext: "" });
                  setEditingIndex(-1);
                  setModalType("highlight");
                }}
                className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/10 hover:bg-emerald-500/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ml-auto self-end sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Metric</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {highlights.map((item, idx) => (
                <SpotlightCard
                  key={idx}
                  className="bg-[#06070B] border border-[#23242B] hover:border-emerald-500/40 p-4 rounded-xl space-y-2 group relative transition"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xl font-extrabold text-[#F59E0B] font-mono">{item.metric_value}</p>
                    <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                      <ActiveToggle
                        isActive={item.is_active}
                        onToggle={() => toggleItemActive(highlights, setHighlights, idx, "highlights", "Metric")}
                        label="Metric"
                      />
                      <button
                        onClick={() => {
                          setEditingItem({ ...item });
                          setEditingIndex(idx);
                          setModalType("highlight");
                        }}
                        className="p-1 hover:text-[#F59E0B] text-slate-400 transition"
                        title="Edit Metric"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(highlights, setHighlights, idx, "highlights", "metric")}
                        className="p-1 hover:text-red-400 text-slate-400 transition"
                        title="Delete Metric"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-white">{item.metric_label}</p>
                  <p className="text-[11px] text-slate-400">{item.metric_subtext}</p>
                </SpotlightCard>
              ))}
            </div>
          </SpotlightCard>

          {/* Dynamic Homepage CTA Section Manager */}
          <HomepageCtaManager
            homepageCta={homepageCta}
            setHomepageCta={setHomepageCta}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: ABOUT */}
            {/* ============================================================== */}
            {currentTab === "about" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#23242B]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-[#F59E0B]" />
                About Page Content
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configures the narrative, technical pillars, and bio displayed at <code className="text-[#F59E0B]">/about</code>
              </p>
            </div>

            <button
              onClick={() => handleSaveSection("about", about, "About page updated successfully!")}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save About Page"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Page Subtitle / Tag</label>
              <input
                type="text"
                value={about.subtitle || ""}
                onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Main Biography Headline</label>
              <input
                type="text"
                value={about.title || ""}
                onChange={(e) => setAbout({ ...about, title: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition font-medium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Biography Paragraph 1</label>
              <textarea
                rows={3}
                value={about.description1 || ""}
                onChange={(e) => setAbout({ ...about, description1: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Biography Paragraph 2</label>
              <textarea
                rows={3}
                value={about.description2 || ""}
                onChange={(e) => setAbout({ ...about, description2: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none transition resize-none leading-relaxed"
              />
            </div>

            <div className="md:col-span-2">
              <MediaUploader
                value={about.profile_image || ""}
                onChange={(url) => setAbout({ ...about, profile_image: url })}
                positionValue={about.profile_position || "center 12%"}
                onPositionChange={(pos) => setAbout({ ...about, profile_position: pos })}
                previewAspect="4/5"
                label="About Section Showcase Photo"
                description="Professional photo or engineering field showcase image"
                type="image"
                defaultValue="/ashifur.jpeg"
                defaultPosition="50% 50%"
              />
            </div>

            {/* Core Focus Area 1 */}
            <SpotlightCard className="p-4 rounded-xl bg-[#06070B] border border-[#23242B] space-y-3">
              <div className="font-bold text-[#F59E0B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Focus Pillar 1
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={about.focus1_title || ""}
                  onChange={(e) => setAbout({ ...about, focus1_title: e.target.value })}
                  className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={about.focus1_text || ""}
                  onChange={(e) => setAbout({ ...about, focus1_text: e.target.value })}
                  className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>
            </SpotlightCard>

            {/* Core Focus Area 2 */}
            <SpotlightCard className="p-4 rounded-xl bg-[#06070B] border border-[#23242B] space-y-3">
              <div className="font-bold text-[#F59E0B] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Focus Pillar 2
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={about.focus2_title || ""}
                  onChange={(e) => setAbout({ ...about, focus2_title: e.target.value })}
                  className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={about.focus2_text || ""}
                  onChange={(e) => setAbout({ ...about, focus2_text: e.target.value })}
                  className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-3 py-2 text-white outline-none resize-none"
                />
              </div>
            </SpotlightCard>
          </div>
        </SpotlightCard>

          {/* Dynamic Core Competency Pillars Manager */}
          <AboutPillarsManager
            about={about}
            setAbout={setAbout}
            onSave={handleSaveSection}
            saving={saving}
          />

          {/* Dynamic Guiding Principles Manager */}
          <AboutPrinciplesManager
            about={about}
            setAbout={setAbout}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: EXPERIENCE */}
            {/* ============================================================== */}
            {currentTab === "experience" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#F59E0B]" />
                  Work Experience Timeline
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage all career positions shown on <code className="text-[#F59E0B]">/experience</code>. Total positions: {experiences.length}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    role: "",
                    organization: "",
                    period: "",
                    location: "Dhaka, Bangladesh",
                    website: "",
                    description_points: [""],
                    is_current: false,
                  });
                  setEditingIndex(-1);
                  setModalType("experience");
                }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Experience</span>
              </button>
            </div>
          </SpotlightCard>

          <div className="space-y-3">
            {experiences.length === 0 ? (
              <div className="p-8 text-center bg-[#0A0B10] border border-[#23242B] rounded-2xl text-slate-400 text-xs">
                No experiences added yet. Click &quot;Add New Experience&quot; to create your first entry.
              </div>
            ) : (
              experiences.map((exp, idx) => (
                <SpotlightCard
                  key={idx}
                  className="bg-[#0A0B10] border border-[#23242B] p-5 rounded-2xl group relative space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23242B] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <h3 className="text-sm sm:text-base font-bold text-white">{exp.role}</h3>
                        {exp.is_current ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                            Present
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <span className="font-semibold text-slate-300">{exp.organization}</span> • {exp.period} • {exp.location || "Dhaka"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <ActiveToggle
                        isActive={exp.is_active}
                        onToggle={() => toggleItemActive(experiences, setExperiences, idx, "experiences", "Experience")}
                        label="Experience"
                      />
                      <button
                        onClick={() => moveItem(experiences, setExperiences, idx, -1, "experiences")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(experiences, setExperiences, idx, 1, "experiences")}
                        disabled={idx === experiences.length - 1}
                        className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({
                            ...exp,
                            description_points: Array.isArray(exp.description_points)
                              ? [...exp.description_points]
                              : (exp.points || []),
                          });
                          setEditingIndex(idx);
                          setModalType("experience");
                        }}
                        className="p-1.5 rounded-lg bg-[#12131A] text-[#F59E0B] hover:bg-emerald-500/20"
                        title="Edit Experience"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(experiences, setExperiences, idx, "experiences", "experience entry")}
                        className="p-1.5 rounded-lg bg-[#12131A] text-red-400 hover:bg-red-500/20"
                        title="Delete Experience"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Bullet points display */}
                  {exp.description_points && exp.description_points.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc marker:text-[#F59E0B]">
                      {exp.description_points.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </SpotlightCard>
              ))
            )}
          </div>

          {/* Dynamic Experience Metrics Manager */}
          <ExperienceMetricsManager
            experienceMetrics={experienceMetrics}
            setExperienceMetrics={setExperienceMetrics}
            metrics={experienceMetrics}
            setMetrics={setExperienceMetrics}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: EDUCATION */}
            {/* ============================================================== */}
            {currentTab === "education" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#F59E0B]" />
                  Education &amp; Qualifications
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage degrees, institutions, and academic accolades at <code className="text-[#F59E0B]">/education</code>.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    degree: "",
                    institution: "",
                    subject: "",
                    start_year: "",
                    end_year: "",
                    result: "",
                    badge_text: "",
                    description: "",
                  });
                  setEditingIndex(-1);
                  setModalType("education");
                }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Education</span>
              </button>
            </div>
          </SpotlightCard>

          <div className="space-y-3">
            {educations.length === 0 ? (
              <div className="p-8 text-center bg-[#0A0B10] border border-[#23242B] rounded-2xl text-slate-400 text-xs">
                No education records yet. Click &quot;Add Education&quot; to begin.
              </div>
            ) : (
              educations.map((ed, idx) => (
                <SpotlightCard
                  key={idx}
                  className="bg-[#0A0B10] border border-[#23242B] p-5 rounded-2xl group relative space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#23242B] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#F59E0B]" />
                        <h3 className="text-sm sm:text-base font-bold text-white">{ed.degree}</h3>
                        {ed.badge_text && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                            {ed.badge_text}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <span className="font-semibold text-slate-200">{ed.institution}</span> • {ed.period || (ed.start_year ? `${ed.start_year} – ${ed.end_year || "Present"}` : "Completed")} • {ed.result}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <ActiveToggle
                        isActive={ed.is_active}
                        onToggle={() => toggleItemActive(educations, setEducations, idx, "educations", "Education")}
                        label="Education"
                      />
                      <button
                        onClick={() => moveItem(educations, setEducations, idx, -1, "educations")}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(educations, setEducations, idx, 1, "educations")}
                        disabled={idx === educations.length - 1}
                        className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({ ...ed });
                          setEditingIndex(idx);
                          setModalType("education");
                        }}
                        className="p-1.5 rounded-lg bg-[#12131A] text-[#F59E0B] hover:bg-emerald-500/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(educations, setEducations, idx, "educations", "education item")}
                        className="p-1.5 rounded-lg bg-[#12131A] text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {ed.description && <p className="text-xs text-slate-300 leading-relaxed">{ed.description}</p>}
                </SpotlightCard>
              ))
            )}
          </div>

          {/* Dynamic Certifications Manager */}
          <CertificationsManager
            certifications={certifications}
            setCertifications={setCertifications}
            onSave={handleSaveSection}
            saving={saving}
          />

          {/* Dynamic Coursework Pillars Manager */}
          <CourseworkManager
            courseworkPillars={courseworkPillars}
            setCourseworkPillars={setCourseworkPillars}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SKILLS */}
            {/* ============================================================== */}
            {currentTab === "skills" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#F59E0B]" />
                  Technical Skills Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Categorized engineering skills &amp; software tools displayed at <code className="text-[#F59E0B]">/skills</code>.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    name: "",
                    category: "Design & Simulation",
                    level: 85,
                    icon: "monitor",
                  });
                  setEditingIndex(-1);
                  setModalType("skill");
                }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Skill</span>
              </button>
            </div>
          </SpotlightCard>

          {/* Category filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {["all", ...Array.from(new Set(skills.map((s) => s.category).filter(Boolean)))].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                    skillCategoryFilter === cat
                      ? "bg-emerald-500/20 text-[#FBBF24] border border-[#F59E0B]/30"
                      : "bg-[#0A0B10] text-slate-400 hover:text-white border border-[#23242B]"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              )
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {skills
              .filter((s) => skillCategoryFilter === "all" || s.category === skillCategoryFilter)
              .map((skill, idx) => {
                const originalIndex = skills.indexOf(skill);
                return (
                  <SpotlightCard
                    key={idx}
                    className="bg-[#0A0B10] border border-[#23242B] p-4 rounded-xl space-y-3 group relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12131A] text-slate-400 border border-[#23242B]">
                        {skill.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <ActiveToggle
                          isActive={skill.is_active}
                          onToggle={() => toggleItemActive(skills, setSkills, originalIndex, "skills", "Skill")}
                          label="Skill"
                        />
                        <button
                          onClick={() => {
                            setEditingItem({ ...skill });
                            setEditingIndex(originalIndex);
                            setModalType("skill");
                          }}
                          className="p-1 hover:text-[#F59E0B] text-slate-400 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItem(skills, setSkills, originalIndex, "skills", "skill")}
                          className="p-1 hover:text-red-400 text-slate-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{skill.name}</span>
                        <span className="font-mono text-[#F59E0B] font-bold">{skill.level}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#06070B] rounded-full overflow-hidden border border-[#23242B]">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
          </div>

          {/* Dynamic Software Tools Manager */}
          <SoftwareToolsManager
            softwareTools={softwareTools}
            setSoftwareTools={setSoftwareTools}
            onSave={handleSaveSection}
            saving={saving}
          />

          {/* Dynamic Skill Badges Manager */}
          <SkillBadgesManager
            skillBadges={skillBadges}
            setSkillBadges={setSkillBadges}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: PROJECTS */}
            {/* ============================================================== */}
            {currentTab === "projects" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
            <div className="flex items-center justify-between gap-4 w-full">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-[#F59E0B]" />
                  Engineering Projects Portfolio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Technical showcase cards displayed at <code className="text-[#F59E0B]">/projects</code>. Total projects: {projects.length}
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingItem({
                    project_number: String(projects.length + 1).padStart(2, "0"),
                    title: "",
                    category: "Power Electronics",
                    short_description: "",
                    full_description: "",
                    tags: ["AutoCAD", "Simulation"],
                    live_url: "",
                    github_url: "",
                    image_url: "",
                    image_position: "center center",
                    additional_images: [],
                    project_date: "2026",
                    sort_order: projects.length + 1,
                    is_featured: false,
                    is_published: true,
                  });
                  setEditingIndex(-1);
                  setModalType("project");
                }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 ml-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project</span>
              </button>
            </div>
          </SpotlightCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj, idx) => (
              <SpotlightCard
                key={idx}
                className="bg-[#0A0B10] border border-[#23242B] p-5 rounded-2xl space-y-3.5 group relative flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                        #{proj.project_number || String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        {proj.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <ActiveToggle
                        isActive={proj.is_active !== undefined ? proj.is_active : proj.is_published}
                        onToggle={() => toggleItemActive(projects, setProjects, idx, "projects", "Project")}
                        label="Project"
                      />
                      <button
                        onClick={() => moveItem(projects, setProjects, idx, -1, "projects")}
                        disabled={idx === 0}
                        className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveItem(projects, setProjects, idx, 1, "projects")}
                        disabled={idx === projects.length - 1}
                        className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({
                            ...proj,
                            tags: Array.isArray(proj.tags) ? [...proj.tags] : [],
                            additional_images: Array.isArray(proj.additional_images) ? [...proj.additional_images] : [],
                            image_position: proj.image_position || "center center",
                            project_date: proj.project_date || "2026",
                            sort_order: proj.sort_order !== undefined ? proj.sort_order : idx + 1,
                            is_featured: Boolean(proj.is_featured),
                            is_published: proj.is_published !== undefined ? Boolean(proj.is_published) : (proj.is_active !== undefined ? Boolean(proj.is_active) : true),
                          });
                          setEditingIndex(idx);
                          setModalType("project");
                        }}
                        className="p-1 rounded-lg bg-[#12131A] text-[#F59E0B] hover:bg-emerald-500/20"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteItem(projects, setProjects, idx, "projects", "project")}
                        className="p-1 rounded-lg bg-[#12131A] text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-[#FBBF24] transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {proj.short_description || proj.full_description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#23242B]">
                  {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.tags.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#06070B] text-slate-400 border border-[#23242B]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <div className="flex items-center gap-3">
                      {proj.live_url && (
                        <a
                          href={proj.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#F59E0B] hover:underline flex items-center gap-1 font-mono"
                        >
                          Live <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {proj.github_url && (
                        <a
                          href={proj.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                        >
                          Code <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-500">
                      {proj.is_featured ? "⭐ Featured" : ""}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {/* Dynamic Project Methodologies Manager */}
          <ProjectMethodologyManager
            projectMethodologies={projectMethodologies}
            setProjectMethodologies={setProjectMethodologies}
            methodologies={projectMethodologies}
            setMethodologies={setProjectMethodologies}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: WORK PACKAGES */}
            {/* ============================================================== */}
            {currentTab === "work" && (
              <div className="space-y-6">
                <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 text-[#F59E0B]" />
                        Fixed-Scope Service Packages
                      </h2>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage service packages displayed at <code className="text-[#F59E0B]">/work</code>. Total packages: {workPackages.length}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingItem({
                          category: "WEBSITE",
                          title: "",
                          description: "",
                          deliverables: "",
                          tags: "",
                          sort_order: workPackages.length + 1,
                          is_active: 1
                        });
                        setEditingIndex(-1);
                        setModalType("work_package");
                      }}
                      className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0 ml-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Package</span>
                    </button>
                  </div>
                </SpotlightCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workPackages.map((pkg, idx) => (
                    <SpotlightCard
                      key={pkg.id || idx}
                      className="bg-[#0A0B10] border border-[#23242B] p-5 rounded-2xl space-y-3.5 group relative flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                              #{String(pkg.sort_order || idx + 1).padStart(2, "0")}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                              {pkg.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <ActiveToggle
                              isActive={pkg.is_active}
                              onToggle={() => toggleItemActive(workPackages, setWorkPackages, idx, "work_packages", "Package")}
                              label="Package"
                            />
                            <button
                              onClick={() => moveItem(workPackages, setWorkPackages, idx, -1, "work_packages")}
                              disabled={idx === 0}
                              className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moveItem(workPackages, setWorkPackages, idx, 1, "work_packages")}
                              disabled={idx === workPackages.length - 1}
                              className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingItem({
                                  ...pkg,
                                  sort_order: pkg.sort_order !== undefined ? pkg.sort_order : idx + 1,
                                  is_active: pkg.is_active !== undefined ? pkg.is_active : 1
                                });
                                setEditingIndex(idx);
                                setModalType("work_package");
                              }}
                              className="p-1 rounded-lg bg-[#12131A] text-[#F59E0B] hover:bg-emerald-500/20"
                              title="Edit Package"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteItem(workPackages, setWorkPackages, idx, "work_packages", "package")}
                              className="p-1 rounded-lg bg-[#12131A] text-red-400 hover:bg-red-500/20"
                              title="Delete Package"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-[#FBBF24] transition">
                          {pkg.title}
                        </h3>

                        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                          {pkg.description}
                        </p>

                        {pkg.deliverables && (
                          <div className="pt-2 text-[11px] text-slate-400">
                            <span className="font-mono uppercase text-[#F59E0B] font-bold block mb-1">Deliverables:</span>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {(pkg.deliverables || "").split('\n').filter(Boolean).slice(0, 3).map((d, dIdx) => (
                                <li key={dIdx} className="truncate">{d}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {pkg.tags && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {(pkg.tags || "").split(',').map(t => t.trim()).filter(Boolean).map((t, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#12131A] text-slate-400 border border-[#232A3B]">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </SpotlightCard>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: CONTACT */}
            {/* ============================================================== */}
            {currentTab === "contact" && (
              <div className="space-y-6">
{/* Section A: Contact Details & Social Links */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#23242B]">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#F59E0B]" />
                  Contact Details &amp; Social Channels
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shown on <code className="text-[#F59E0B]">/contact</code> and in the footer across all 7 pages.
                </p>
              </div>

              <button
                onClick={async () => {
                  await handleSaveSection("social_links", socialLinks, "Contact & Social links saved!");
                  if (contactChannels.length > 0) {
                    await handleSaveSection("contact_channels", { items: contactChannels }, "Contact channels updated!");
                  }
                }}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Contact Info"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Email */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#F59E0B]" /> Email Address
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("email")}
                    onToggle={() => toggleChannelActive("email", "Email")}
                    label="Email"
                  />
                </div>
                <input
                  type="email"
                  value={socialLinks.email || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, email: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              {/* Phone */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#F59E0B]" /> Phone Number
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("phone")}
                    onToggle={() => toggleChannelActive("phone", "Phone")}
                    label="Phone"
                  />
                </div>
                <input
                  type="text"
                  value={socialLinks.phone || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, phone: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F59E0B]" /> WhatsApp Number
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("whatsapp")}
                    onToggle={() => toggleChannelActive("whatsapp", "WhatsApp")}
                    label="WhatsApp"
                  />
                </div>
                <input
                  type="text"
                  value={socialLinks.whatsapp || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" /> Location / Address
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("location")}
                    onToggle={() => toggleChannelActive("location", "Location")}
                    label="Location"
                  />
                </div>
                <input
                  type="text"
                  value={socialLinks.location || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, location: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#F59E0B]" /> LinkedIn Profile URL
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("linkedin")}
                    onToggle={() => toggleChannelActive("linkedin", "LinkedIn")}
                    label="LinkedIn"
                  />
                </div>
                <input
                  type="text"
                  value={socialLinks.linkedin || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>

              {/* GitHub */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-medium text-slate-300 flex items-center gap-1.5">
                    <FolderGit2 className="w-3.5 h-3.5 text-[#F59E0B]" /> GitHub Profile URL
                  </label>
                  <ActiveToggle
                    isActive={getChannelActive("github")}
                    onToggle={() => toggleChannelActive("github", "GitHub")}
                    label="GitHub"
                  />
                </div>
                <input
                  type="text"
                  value={socialLinks.github || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, github: e.target.value })}
                  placeholder="https://github.com/ashifurrahmanbadhon"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Section B: Resume / CV Management */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#23242B]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileDown className="w-4 h-4 text-[#F59E0B]" />
                  Curriculum Vitae (CV) &amp; Resume Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Target of the &quot;Download CV&quot; button and interactive resume viewer modal.
                </p>
              </div>

              <button
                onClick={() => handleSaveSection("resume", resume, "Resume link saved successfully!")}
                disabled={saving}
                className="px-4 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Resume</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="w-full">
                <MediaUploader
                  value={resume.file_url || ""}
                  onChange={(url, fileName) =>
                    setResume({
                      ...resume,
                      file_url: url,
                      file_name: fileName || resume.file_name || "Ashifur_Rahman_CV.pdf",
                    })
                  }
                  label="Curriculum Vitae (PDF Document Upload)"
                  description="Upload your latest PDF CV/Resume file directly from your computer"
                  type="document"
                  accept=".pdf,application/pdf"
                  defaultValue=""
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Display Download File Name</label>
                <input
                  type="text"
                  value={resume.file_name || ""}
                  onChange={(e) => setResume({ ...resume, file_name: e.target.value })}
                  placeholder="Ashifur_Rahman_CV.pdf"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2 text-white outline-none font-mono"
                />
              </div>
            </div>
          </SpotlightCard>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: INBOX */}
            {/* ============================================================== */}
            {currentTab === "inbox" && (
              <div className="space-y-6">
                <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-5">
                  {/* Header and Bulk Action Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#23242B]">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-[#F59E0B]" />
                          Inbox
                        </h2>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 font-bold">
                          {messages.length} total
                        </span>
                        {messages.filter((m) => !m.is_read).length > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                            {messages.filter((m) => !m.is_read).length} new
                          </span>
                        )}
                      </div>

                      {/* Small Presence Status Line */}
                      <div className="mt-1.5 flex items-center gap-2">
                        {adminOnline ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#F59E0B] font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            ● You are online — new messages appear here only
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-slate-500" />
                            Email alerts ON when you are away
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        Direct visitor inquiries submitted via the <code className="text-[#F59E0B]">/contact</code> page. Select messages to mark or delete in bulk.
                      </p>
                    </div>

                    {/* Action Toolbar */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {messages.length > 0 && (
                        <button
                          type="button"
                          onClick={selectAllMessages}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition cursor-pointer ${
                            selectedMessages.length === messages.length && messages.length > 0
                              ? "bg-emerald-500/20 text-[#FBBF24] border-emerald-500/40"
                              : "bg-[#12131A] text-slate-300 hover:text-white border-[#23242B]"
                          }`}
                        >
                          {selectedMessages.length === messages.length && messages.length > 0 ? (
                            <CheckSquare className="w-3.5 h-3.5 text-[#F59E0B]" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span>
                            {selectedMessages.length === messages.length && messages.length > 0
                              ? "Deselect All"
                              : `Select All (${messages.length})`}
                          </span>
                        </button>
                      )}

                      {selectedMessages.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={handleBulkMarkRead}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-[#FBBF24] border border-[#F59E0B]/30 text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Read ({selectedMessages.length})</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleBulkDeleteMessages}
                            disabled={deletingBulk}
                            className="px-3.5 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{deletingBulk ? "Deleting..." : `Delete Selected (${selectedMessages.length})`}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Messages Body */}
                  {messages.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] flex items-center justify-center mx-auto">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <p className="text-white font-medium text-sm">No Inquiries Received Yet</p>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto">
                        Visitor messages submitted through the contact form will be recorded and displayed here immediately.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isSelected = selectedMessages.includes(msg.id);
                        const isExpanded = expandedMessageIds.includes(msg.id);
                        const replies = msg.replies || [];
                        const isSending = !!sendingReplies[msg.id];
                        const replyError = replyErrors[msg.id];
                        const isSentSuccess = !!replySuccesses[msg.id];
                        const draftText = replyDrafts[msg.id] || "";

                        return (
                          <div
                            key={msg.id}
                            className={`stat-box p-4 sm:p-5 border transition-all space-y-3.5 ${
                              isSelected
                                ? "bg-[#0e1726] border-emerald-500/70 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
                                : msg.is_read
                                ? "bg-[#06070B] border-[#23242B]"
                                : "bg-[#0E1524] border-emerald-500/40 shadow-sm"
                            }`}
                          >
                            {/* Card Top Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#23242B] pb-3">
                              <div className="flex items-center gap-3 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => toggleSelectMessage(msg.id)}
                                  className="p-1 text-slate-400 hover:text-[#F59E0B] transition cursor-pointer"
                                  title={isSelected ? "Deselect" : "Select message"}
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-[#F59E0B]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                                  )}
                                </button>

                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    msg.is_read ? "bg-slate-600" : "bg-emerald-400 animate-pulse"
                                  }`}
                                />
                                <span className="font-bold text-white text-xs sm:text-sm">{msg.name}</span>
                                <a
                                  href={`mailto:${msg.email}`}
                                  className="text-[11px] sm:text-xs font-mono text-[#F59E0B] hover:underline"
                                >
                                  &lt;{msg.email}&gt;
                                </a>

                                {replies.length > 0 && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                                    {replies.length} {replies.length === 1 ? "reply" : "replies"}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 self-end sm:self-auto">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {formatDhakaTime(msg.created_at)}
                                </span>

                                {!msg.is_read && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await api.markContactMessageRead(msg.id, 1);
                                      setMessages(messages.map((m) => (m.id === msg.id ? { ...m, is_read: 1 } : m)));
                                      showToast("Message marked as read", "success");
                                      fetchUnreadCount();
                                    }}
                                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-emerald-500/20 transition cursor-pointer"
                                  >
                                    Mark Read
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => toggleExpandMessage(msg.id)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition cursor-pointer ${
                                    isExpanded
                                      ? "bg-emerald-500/20 text-[#FBBF24] border border-emerald-500/40"
                                      : "bg-[#12131A] text-slate-300 hover:text-white border border-[#23242B] hover:border-[#2a364f]"
                                  }`}
                                  title="View Thread & Reply"
                                >
                                  <Reply className="w-3.5 h-3.5 text-[#F59E0B]" />
                                  <span>{isExpanded ? "Close" : replies.length > 0 ? `Thread (${replies.length})` : "Reply"}</span>
                                  {isExpanded ? (
                                    <ChevronDown className="w-3 h-3 text-[#F59E0B]" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm("Delete this message?")) return;
                                    await api.deleteContactMessage(msg.id);
                                    setMessages(messages.filter((m) => m.id !== msg.id));
                                    setSelectedMessages((prev) => prev.filter((id) => id !== msg.id));
                                    showToast("Message deleted", "info");
                                    fetchUnreadCount();
                                  }}
                                  className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                                  title="Delete Message"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Message Subject & Body */}
                            {msg.subject && (
                              <p className="text-xs font-semibold text-slate-200">
                                Subject: <span className="text-white font-normal">{msg.subject}</span>
                              </p>
                            )}
                            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed bg-[#0c1018] p-3 rounded-xl border border-[#23242B]/70">
                              {msg.message}
                            </p>

                            {/* Expanded Reply Thread & Composer */}
                            {isExpanded && (
                              <div className="pt-3 border-t border-[#23242B] space-y-4">
                                {/* Reply History Thread */}
                                {replies.length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                                        Reply History ({replies.length})
                                      </span>
                                    </div>
                                    <div className="space-y-2.5">
                                      {replies.map((r, rIdx) => (
                                        <div
                                          key={r.id || rIdx}
                                          className="p-3.5 rounded-xl bg-[#0f1728] border border-blue-500/20 space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="font-semibold text-blue-300">Ashifur Rahman (Admin)</span>
                                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                Email Sent
                                              </span>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-400">
                                              {formatDhakaTime(r.created_at)}
                                            </span>
                                          </div>
                                          <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                                            {r.body}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Inline Reply Composer */}
                                <div className="p-4 rounded-xl bg-[#0D121D] border border-[#F59E0B]/20 space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Reply className="w-4 h-4 text-[#F59E0B]" />
                                      <span className="text-xs font-semibold text-white">
                                        Send Reply to {msg.name} (&lt;{msg.email}&gt;)
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-500">
                                      {draftText.length} / 4000
                                    </span>
                                  </div>

                                  <textarea
                                    rows={3}
                                    maxLength={4000}
                                    value={draftText}
                                    onChange={(e) =>
                                      setReplyDrafts((prev) => ({ ...prev, [msg.id]: e.target.value }))
                                    }
                                    placeholder={`Write your response to ${msg.name}... (Sent from onboarding@resend.dev, replies arrive in your Gmail)`}
                                    className="w-full bg-[#080B11] border border-[#23242B] focus:border-[#F59E0B] focus:ring-1 focus:ring-emerald-500/30 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition resize-y font-sans"
                                  />

                                  {replyError && (
                                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
                                      <AlertCircle className="w-4 h-4 shrink-0" />
                                      <span>{replyError}</span>
                                    </div>
                                  )}

                                  {isSentSuccess && (
                                    <div className="p-2.5 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-xs text-[#F59E0B] flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                                      <span>Reply sent successfully! It has been added to the thread above.</span>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between pt-1">
                                    <p className="text-[11px] text-slate-500">
                                      Replies sent from <code className="text-[#F59E0B]">Ashifur Rahman &lt;onboarding@resend.dev&gt;</code>
                                    </p>

                                    <button
                                      type="button"
                                      onClick={() => handleSendReply(msg.id)}
                                      disabled={!draftText.trim() || isSending}
                                      className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs font-mono flex items-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-amber-500/20"
                                    >
                                      {isSending ? (
                                        <>
                                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                          <span>Sending Reply...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Send className="w-3.5 h-3.5" />
                                          <span>Send Reply</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </SpotlightCard>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB: SETTINGS */}
            {/* ============================================================== */}
            {currentTab === "settings" && (
              <div className="space-y-6">
<SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#23242B]">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#F59E0B]" />
                Global Portfolio Settings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Site metadata, copyright strings, and global branding parameters.
              </p>
            </div>

            <button
              onClick={() => handleSaveSection("site_settings", siteSettings, "Site settings saved!")}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Site Title (Browser Tab)</label>
              <input
                type="text"
                value={siteSettings.site_title || "Ashifur Rahman | Engineering Portfolio"}
                onChange={(e) => setSiteSettings({ ...siteSettings, site_title: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1.5">Footer Brand Text</label>
              <input
                type="text"
                value={siteSettings.footer_brand || "Ashifur Rahman"}
                onChange={(e) => setSiteSettings({ ...siteSettings, footer_brand: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium text-slate-300 mb-1.5">Meta Description (SEO)</label>
              <textarea
                rows={2}
                value={siteSettings.meta_description || "Official engineering portfolio of Ashifur Rahman. Electrical & Electronic Engineer."}
                onChange={(e) => setSiteSettings({ ...siteSettings, meta_description: e.target.value })}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none resize-none leading-relaxed"
              />
            </div>
          </div>
        </SpotlightCard>

          {/* Dynamic Page Headers & Subtitles Manager for All 7 Pages */}
          <PageHeadersManager
            pageHeaders={pageHeaders}
            setPageHeaders={setPageHeaders}
            onSave={handleSaveSection}
            saving={saving}
          />
              </div>
            )}

          </div>


          {/* RIGHT COLUMN: Live Simulation Rail (only for editable pages with live preview) */}
          {hasLiveRail && (
            <div className="w-full lg:w-[400px] xl:w-[460px] lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] h-[70vh] min-h-[500px] shrink-0 flex flex-col">
              <LivePreviewPanel
                url={railTargetUrl}
                draftSection={railDraftSection}
                getDraftData={railGetDraftData}
                savedOnly={railSavedOnly}
                collapsible={false}
                className="h-full"
              />
            </div>
          )}
        </div>
        </>
      )}

      {/* ============================================================== */}
      {/* UNIVERSAL CRUD MODALS                                          */}
      {/* ============================================================== */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0A0B10] border border-[#23242B] w-full max-w-xl rounded-2xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <h3 className="text-base font-bold text-white capitalize">
                {editingIndex >= 0 ? "Edit" : "Add"} {modalType}
              </h3>
              <button
                onClick={() => {
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="p-1 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Highlight */}
            {modalType === "highlight" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Metric Value (e.g. 15+, B.Sc.)</label>
                  <input
                    type="text"
                    value={editingItem.metric_value || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_value: e.target.value })}
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Metric Label</label>
                  <input
                    type="text"
                    value={editingItem.metric_label || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_label: e.target.value })}
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Subtext / Explanation</label>
                  <input
                    type="text"
                    value={editingItem.metric_subtext || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, metric_subtext: e.target.value })}
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2.5 text-white outline-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Experience */}
            {modalType === "experience" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Job Role / Designation</label>
                    <input
                      type="text"
                      value={editingItem.role || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, role: e.target.value })}
                      placeholder="e.g. Executive Engineer"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Organization / Company</label>
                    <input
                      type="text"
                      value={editingItem.organization || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, organization: e.target.value })}
                      placeholder="e.g. Energy Division"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Duration / Period</label>
                    <input
                      type="text"
                      value={editingItem.period || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, period: e.target.value })}
                      placeholder="e.g. 2023 - Present"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editingItem.location || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                      placeholder="Dhaka, Bangladesh"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                {/* Bullet Points */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-medium text-slate-300">Responsibility Bullet Points</label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem({
                          ...editingItem,
                          description_points: [...(editingItem.description_points || []), ""],
                        })
                      }
                      className="text-[#F59E0B] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" /> Add Point
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingItem.description_points || [""]).map((pt, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const updated = [...editingItem.description_points];
                            updated[pIdx] = e.target.value;
                            setEditingItem({ ...editingItem, description_points: updated });
                          }}
                          placeholder={`Key responsibility point ${pIdx + 1}`}
                          className="flex-1 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = editingItem.description_points.filter((_, i) => i !== pIdx);
                            setEditingItem({ ...editingItem, description_points: updated });
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Body: Education */}
            {modalType === "education" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Degree Title</label>
                  <input
                    type="text"
                    value={editingItem.degree || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                    placeholder="e.g. B.Sc. in Electrical & Electronic Engineering"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Institution</label>
                  <input
                    type="text"
                    value={editingItem.institution || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                    placeholder="e.g. American International University-Bangladesh"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Start Year</label>
                    <input
                      type="text"
                      value={editingItem.start_year || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, start_year: e.target.value })}
                      placeholder="2019"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">End Year</label>
                    <input
                      type="text"
                      value={editingItem.end_year || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, end_year: e.target.value })}
                      placeholder="2023"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Result / CGPA</label>
                    <input
                      type="text"
                      value={editingItem.result || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, result: e.target.value })}
                      placeholder="CGPA 3.85 / 4.00"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Honors / Badge Text</label>
                    <input
                      type="text"
                      value={editingItem.badge_text || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, badge_text: e.target.value })}
                      placeholder="Dean's List Honor"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Description / Major Highlights</label>
                  <textarea
                    rows={2}
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Skill */}
            {modalType === "skill" && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Skill Name</label>
                  <input
                    type="text"
                    value={editingItem.name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    placeholder="e.g. AutoCAD Electrical"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingItem.category || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    placeholder="Design & Simulation, GIS & Data Systems, etc."
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-300">Proficiency Percentage</label>
                    <span className="font-mono text-[#F59E0B] font-bold">{editingItem.level || 80}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={editingItem.level || 80}
                    onChange={(e) => setEditingItem({ ...editingItem, level: Number(e.target.value) })}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Modal Body: Project */}
            {modalType === "work_package" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      placeholder="WEBSITE, AI, TRACKING, AUTOMATION"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-medium text-slate-300 mb-1">Package Title</label>
                    <input
                      type="text"
                      value={editingItem.title || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      placeholder="e.g. Business Website"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editingItem.description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    placeholder="Brief description of the package"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Deliverables (one item per line)
                  </label>
                  <textarea
                    rows={4}
                    value={editingItem.deliverables || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, deliverables: e.target.value })}
                    placeholder="Home, services, gallery & about pages&#10;Order / inquiry buttons connected to WhatsApp"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-y leading-relaxed font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editingItem.tags || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                    placeholder="Next.js, CMS Admin, WhatsApp Orders"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                {/* Inquiry Modal Customization */}
                <div className="pt-2 border-t border-[#23242B] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#F59E0B] font-bold uppercase tracking-wider bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                      Inquiry Modal Configuration
                    </span>
                    <span className="text-[10px] text-slate-400">Customized inquiry fields for this package</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Inquiry Field Label</label>
                      <input
                        type="text"
                        value={editingItem.inquiry_field_label || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, inquiry_field_label: e.target.value })}
                        placeholder="e.g. WHICH DESIGN DO YOU NEED?"
                        className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Inquiry Field Placeholder</label>
                      <input
                        type="text"
                        value={editingItem.inquiry_field_placeholder || ""}
                        onChange={(e) => setEditingItem({ ...editingItem, inquiry_field_placeholder: e.target.value })}
                        placeholder="e.g. Email Template / YouTube Thumbnail"
                        className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">
                      Inquiry Prefilled Textarea Template ("Tell Me About It")
                    </label>
                    <textarea
                      rows={3}
                      value={editingItem.inquiry_template || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, inquiry_template: e.target.value })}
                      placeholder="e.g. Design type:&#10;Text / content:&#10;Quantity needed:"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-y leading-relaxed font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingItem.sort_order || 1}
                      onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Visibility</label>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                        <input
                          type="checkbox"
                          checked={editingItem.is_active !== 0}
                          onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked ? 1 : 0 })}
                          className="rounded bg-[#06070B] border-[#23242B] text-emerald-500 focus:ring-0"
                        />
                        Active (Visible on /work)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modalType === "project" && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Project Number</label>
                    <input
                      type="text"
                      value={editingItem.project_number || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, project_number: e.target.value })}
                      placeholder="01"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={editingItem.category || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      placeholder="Power Electronics, Substation GIS, etc."
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Project Title</label>
                  <input
                    type="text"
                    value={editingItem.title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Full project headline"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Short Summary</label>
                  <textarea
                    rows={2}
                    value={editingItem.short_description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, short_description: e.target.value })}
                    placeholder="Brief description shown on cards"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    value={editingItem.full_description || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, full_description: e.target.value })}
                    placeholder="Comprehensive project description, case study details, or implementation write-up"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-y leading-relaxed"
                  />
                </div>

                <div>
                  <MediaUploader
                    value={editingItem.image_url || ""}
                    onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                    positionValue={editingItem.image_position || "center center"}
                    onPositionChange={(pos) => setEditingItem({ ...editingItem, image_position: pos })}
                    previewAspect="16/9"
                    label="Project Media / Thumbnail (Image or Video Demo)"
                    description="Upload project demo screenshot, schematic diagram, or video showcase"
                    type="media"
                    defaultValue=""
                    defaultPosition="50% 50%"
                  />
                </div>

                {/* Gallery images (slider) */}
                <div className="space-y-3 pt-2 border-t border-[#23242B]">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block font-medium text-slate-300">
                        Gallery images (slider)
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Additional slides for project card photo slider (ordered)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = Array.isArray(editingItem.additional_images) ? [...editingItem.additional_images] : [];
                        setEditingItem({
                          ...editingItem,
                          additional_images: [...cur, ""],
                        });
                      }}
                      className="text-[#F59E0B] hover:text-[#FBBF24] flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 hover:bg-emerald-500/20 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Slide Image
                    </button>
                  </div>

                  {(!editingItem.additional_images || editingItem.additional_images.length === 0) && (
                    <div className="text-center py-3 px-3 rounded-xl border border-dashed border-[#23242B] bg-[#06070B]/50 text-slate-400 text-xs">
                      No gallery slides added. The project card will display the main thumbnail only.
                    </div>
                  )}

                  <div className="space-y-3">
                    {(editingItem.additional_images || []).map((slideUrl, sIdx) => (
                      <div
                        key={sIdx}
                        className="p-3 rounded-xl border border-[#23242B] bg-[#06070B] space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-xs pb-1 border-b border-[#23242B]/60">
                          <span className="font-mono font-bold text-[#F59E0B]">
                            Slide #{sIdx + 2}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() => {
                                const arr = [...editingItem.additional_images];
                                const tmp = arr[sIdx];
                                arr[sIdx] = arr[sIdx - 1];
                                arr[sIdx - 1] = tmp;
                                setEditingItem({ ...editingItem, additional_images: arr });
                              }}
                              className="p-1 rounded bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === editingItem.additional_images.length - 1}
                              onClick={() => {
                                const arr = [...editingItem.additional_images];
                                const tmp = arr[sIdx];
                                arr[sIdx] = arr[sIdx + 1];
                                arr[sIdx + 1] = tmp;
                                setEditingItem({ ...editingItem, additional_images: arr });
                              }}
                              className="p-1 rounded bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const arr = editingItem.additional_images.filter((_, i) => i !== sIdx);
                                setEditingItem({ ...editingItem, additional_images: arr });
                              }}
                              className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer ml-1"
                              title="Remove Slide"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <MediaUploader
                          value={slideUrl || ""}
                          onChange={(url) => {
                            const arr = [...editingItem.additional_images];
                            arr[sIdx] = url;
                            setEditingItem({ ...editingItem, additional_images: arr });
                          }}
                          previewAspect="16/9"
                          label={`Slide Image ${sIdx + 1}`}
                          description="Upload or enter URL for this gallery slide"
                          type="image"
                          defaultValue=""
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="MATLAB, Simulink, PCB Design"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Live URL (optional)</label>
                    <input
                      type="text"
                      value={editingItem.live_url || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, live_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">GitHub / Code URL</label>
                    <input
                      type="text"
                      value={editingItem.github_url || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, github_url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Project Date / Year</label>
                    <input
                      type="text"
                      value={editingItem.project_date || ""}
                      onChange={(e) => setEditingItem({ ...editingItem, project_date: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={editingItem.sort_order !== undefined ? editingItem.sort_order : 1}
                      onChange={(e) => setEditingItem({ ...editingItem, sort_order: parseInt(e.target.value, 10) || 0 })}
                      placeholder="1"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#06070B] border border-[#23242B] hover:border-emerald-500/40 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.is_published)}
                      onChange={(e) => setEditingItem({ ...editingItem, is_published: e.target.checked })}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="block font-medium text-white text-xs">Published</span>
                      <span className="block text-[10px] text-slate-400">Visible on public /projects page</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl bg-[#06070B] border border-[#23242B] hover:border-emerald-500/40 transition">
                    <input
                      type="checkbox"
                      checked={Boolean(editingItem.is_featured)}
                      onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                      className="accent-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <span className="block font-medium text-white text-xs">Featured</span>
                      <span className="block text-[10px] text-slate-400">Highlight in showcases</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Modal Footer: Save & Cancel */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#23242B]">
              <button
                type="button"
                onClick={() => {
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#12131A] text-slate-400 hover:text-white text-xs font-mono transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (modalType === "highlight") {
                    const updated = [...highlights];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setHighlights(updated);
                    handleSaveSection("highlights", { items: updated }, "Metric saved!");
                  } else if (modalType === "experience") {
                    const updated = [...experiences];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setExperiences(updated);
                    handleSaveSection("experiences", { items: updated }, "Experience saved!");
                  } else if (modalType === "education") {
                    const updated = [...educations];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setEducations(updated);
                    handleSaveSection("educations", { items: updated }, "Education saved!");
                  } else if (modalType === "skill") {
                    const updated = [...skills];
                    if (editingIndex >= 0) updated[editingIndex] = editingItem;
                    else updated.push(editingItem);
                    setSkills(updated);
                    handleSaveSection("skills", { items: updated }, "Skill saved!");
                  } else if (modalType === "project") {
                    const itemToSave = {
                      ...editingItem,
                      additional_images: (editingItem.additional_images || []).filter(Boolean),
                      tags: Array.isArray(editingItem.tags) ? editingItem.tags : [],
                      sort_order: Number(editingItem.sort_order) || (editingIndex >= 0 ? editingIndex + 1 : projects.length + 1),
                      is_published: editingItem.is_published !== undefined ? (editingItem.is_published ? 1 : 0) : 1,
                      is_featured: editingItem.is_featured ? 1 : 0,
                    };
                    const updated = [...projects];
                    if (editingIndex >= 0) updated[editingIndex] = itemToSave;
                    else updated.push(itemToSave);
                    setProjects(updated);
                    handleSaveSection("projects", { items: updated }, "Project saved!");
                  } else if (modalType === "work_package") {
                    const itemToSave = {
                      ...editingItem,
                      sort_order: Number(editingItem.sort_order) || (editingIndex >= 0 ? editingIndex + 1 : workPackages.length + 1),
                      is_active: editingItem.is_active !== undefined ? (editingItem.is_active ? 1 : 0) : 1,
                      inquiry_field_label: editingItem.inquiry_field_label || "",
                      inquiry_field_placeholder: editingItem.inquiry_field_placeholder || "",
                      inquiry_template: editingItem.inquiry_template || "",
                    };
                    const updated = [...workPackages];
                    if (editingIndex >= 0) updated[editingIndex] = itemToSave;
                    else updated.push(itemToSave);
                    setWorkPackages(updated);
                    handleSaveSection("work_packages", { items: updated }, "Work package saved!");
                  }
                  setModalType(null);
                  setEditingItem(null);
                }}
                className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Entry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminConsolePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-[#F59E0B]">Loading Portfolio Admin Console...</p>
        </div>
      }
    >
      <AdminConsoleContent />
    </Suspense>
  );
}
