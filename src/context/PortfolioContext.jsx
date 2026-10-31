'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_HERO,
  DEFAULT_ABOUT,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_EXPERIENCE_METRICS,
  DEFAULT_SKILLS,
  DEFAULT_SOFTWARE_TOOLS,
  DEFAULT_SKILL_BADGES,
  DEFAULT_PROJECTS,
  DEFAULT_PROJECT_METHODOLOGIES,
  DEFAULT_EXPERIENCES,
  DEFAULT_EDUCATIONS,
  DEFAULT_COURSEWORK_PILLARS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_CONTACT,
  DEFAULT_PAGE_HEADERS,
  DEFAULT_HOMEPAGE_CTA
} from '@/lib/portfolioDefaults';

const CACHE_KEY = 'portfolio_cms_cache_v4';
let inMemorySessionCache = null;
const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [experienceMetrics, setExperienceMetrics] = useState(DEFAULT_EXPERIENCE_METRICS);
  const [skillsData, setSkillsData] = useState(DEFAULT_SKILLS);
  const [softwareTools, setSoftwareTools] = useState(DEFAULT_SOFTWARE_TOOLS);
  const [skillBadges, setSkillBadges] = useState(DEFAULT_SKILL_BADGES);
  const [projectsData, setProjectsData] = useState(DEFAULT_PROJECTS);
  const [projectMethodologies, setProjectMethodologies] = useState(DEFAULT_PROJECT_METHODOLOGIES);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [educations, setEducations] = useState(DEFAULT_EDUCATIONS);
  const [courseworkPillars, setCourseworkPillars] = useState(DEFAULT_COURSEWORK_PILLARS);
  const [certifications, setCertifications] = useState(DEFAULT_CERTIFICATIONS);
  const [contactData, setContactData] = useState(DEFAULT_CONTACT);
  const [contactChannels, setContactChannels] = useState([]);
  const [services, setServices] = useState([]);
  const [pageHeaders, setPageHeaders] = useState(DEFAULT_PAGE_HEADERS);
  const [homepageCta, setHomepageCta] = useState(DEFAULT_HOMEPAGE_CTA);
  const [resumeUrl, setResumeUrl] = useState('/Ashifur_Rahman_CV.pdf');
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Apply parsed JSON content into react states cleanly
  const applyContentData = useCallback((data) => {
    if (!data || typeof data !== 'object') return;

    if (data.hero && data.hero.name) {
      setHeroData((prev) => ({ ...prev, ...data.hero }));
    }

    if (data.about) {
      setAboutData((prev) => {
        const rawPillars = Array.isArray(data.about.pillars) ? data.about.pillars : (prev?.pillars || []);
        const rawPrinciples = Array.isArray(data.about.principles) ? data.about.principles : (prev?.principles || []);
        const activePillars = rawPillars.filter(p => p.is_active !== 0 && p.is_active !== false);
        const activePrinciples = rawPrinciples.filter(p => p.is_active !== 0 && p.is_active !== false);
        return {
          ...prev,
          ...data.about,
          profile_image: data.about.profile_image || prev.profile_image || '/ashifur-about.jpg',
          pillars: activePillars,
          principles: activePrinciples,
        };
      });
    }

    if (Array.isArray(data.highlights) && data.highlights.length > 0) {
      setHighlights(data.highlights.filter(h => h.is_active !== 0 && h.is_active !== false));
    }

    if (Array.isArray(data.experience_metrics) && data.experience_metrics.length > 0) {
      setExperienceMetrics(data.experience_metrics.filter(m => m.is_active !== 0 && m.is_active !== false));
    }

    if (Array.isArray(data.projects)) {
      const activeProjects = data.projects.filter(
        p => p.is_active !== 0 && p.is_active !== false && p.is_published !== 0 && p.is_published !== false
      );
      setProjectsData(
        activeProjects.map((p, i) => ({
          id: p.project_number || String(i + 1).padStart(2, '0'),
          project_number: p.project_number || String(i + 1).padStart(2, '0'),
          title: p.title,
          category: p.category || 'Engineering',
          description: p.short_description || p.full_description,
          short_description: p.short_description || '',
          full_description: p.full_description || '',
          image_url: p.image_url || '',
          image_position: p.image_position || 'center center',
          additional_images: Array.isArray(p.additional_images) ? p.additional_images : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          live_url: p.live_url || '',
          github_url: p.github_url || '',
          project_date: p.project_date || '',
          sort_order: p.sort_order !== undefined ? p.sort_order : i + 1,
          is_featured: !!p.is_featured,
        }))
      );
    }

    if (Array.isArray(data.project_methodologies) && data.project_methodologies.length > 0) {
      setProjectMethodologies(data.project_methodologies.filter(pm => pm.is_active !== 0 && pm.is_active !== false));
    }

    if (Array.isArray(data.experiences)) {
      const activeExperiences = data.experiences.filter(e => e.is_active !== 0 && e.is_active !== false);
      setExperiences(
        activeExperiences.map((e) => ({
          role: e.role,
          organization: e.organization,
          period: e.period,
          location: e.location || 'Dhaka, Bangladesh',
          points: Array.isArray(e.description_points) ? e.description_points : (e.points || []),
          tools: Array.isArray(e.tools) ? e.tools : ['Power Systems', 'Engineering']
        }))
      );
    }

    if (Array.isArray(data.educations)) {
      const activeEducations = data.educations.filter(ed => ed.is_active !== 0 && ed.is_active !== false);
      setEducations(
        activeEducations.map((ed) => {
          let parsedHighlights = [];
          if (Array.isArray(ed.highlights)) {
            parsedHighlights = ed.highlights;
          } else if (ed.highlights_json) {
            try {
              parsedHighlights = JSON.parse(ed.highlights_json);
            } catch (_) {}
          }
          const period = (ed.period || (ed.start_year ? `${ed.start_year} – ${ed.end_year || 'Present'}` : '')).trim();
          return {
            degree: ed.degree,
            institution: ed.institution,
            period: period || '2017 – 2023',
            start_year: ed.start_year || '',
            end_year: ed.end_year || '',
            result: ed.result || ed.badge_text || 'Completed',
            badge_text: ed.badge_text || '',
            description: ed.description || '',
            highlights: parsedHighlights
          };
        })
      );
    }

    if (Array.isArray(data.coursework_pillars) && data.coursework_pillars.length > 0) {
      setCourseworkPillars(data.coursework_pillars.filter(c => c.is_active !== 0 && c.is_active !== false));
    }

    if (Array.isArray(data.certifications) && data.certifications.length > 0) {
      setCertifications(data.certifications.filter(c => c.is_active !== 0 && c.is_active !== false));
    }

    if (Array.isArray(data.skills)) {
      const activeSkills = data.skills.filter(s => s.is_active !== 0 && s.is_active !== false);
      const grouped = {};
      activeSkills.forEach((s) => {
        const cat = s.category || 'General';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ name: s.name, level: Number(s.level) || 80, icon: s.icon || 'monitor' });
      });
      setSkillsData(
        Object.keys(grouped).map((cat) => ({
          category: cat,
          icon: cat.toLowerCase().includes('data') || cat.toLowerCase().includes('gis') ? 'database' : (cat.toLowerCase().includes('power') ? 'shield' : 'monitor'),
          items: grouped[cat]
        }))
      );
    }

    if (Array.isArray(data.software_tools) && data.software_tools.length > 0) {
      setSoftwareTools(data.software_tools.filter(st => st.is_active !== 0 && st.is_active !== false));
    }

    if (Array.isArray(data.skill_badges) && data.skill_badges.length > 0) {
      const activeBadges = data.skill_badges.filter(b => typeof b === 'object' ? (b.is_active !== 0 && b.is_active !== false) : true);
      setSkillBadges(activeBadges.map(b => (typeof b === 'object' ? b.name : b)));
    }

    if (data.page_headers) {
      setPageHeaders(data.page_headers);
    }

    if (data.homepage_cta && data.homepage_cta.title) {
      setHomepageCta(data.homepage_cta);
    }

    if (data.social_links && (data.social_links.email || data.social_links.phone)) {
      setContactData((prev) => ({
        ...prev,
        email: data.social_links.email || prev.email,
        phone: data.social_links.phone || prev.phone,
        whatsapp: data.social_links.whatsapp || prev.whatsapp,
        whatsapp_url: data.social_links.whatsapp
          ? `https://wa.me/${data.social_links.whatsapp.replace(/[^0-9]/g, '')}`
          : prev.whatsapp_url,
        linkedin: data.social_links.linkedin || prev.linkedin,
        linkedin_url: data.social_links.linkedin
          ? (data.social_links.linkedin.startsWith('http') ? data.social_links.linkedin : `https://${data.social_links.linkedin}`)
          : prev.linkedin_url,
        github: data.social_links.github || prev.github,
        github_url: data.social_links.github
          ? (data.social_links.github.startsWith('http') ? data.social_links.github : `https://${data.social_links.github}`)
          : (prev.github_url || 'https://github.com/ashifurrahmanbadhon'),
        location: data.social_links.location || prev.location,
        maps_url: data.social_links.maps_url || prev.maps_url,
      }));
    }

    if (Array.isArray(data.contact_channels)) {
      setContactChannels(data.contact_channels);
    }

    if (Array.isArray(data.services)) {
      setServices(data.services);
    }

    if (data.resume && data.resume.file_url) {
      setResumeUrl(data.resume.file_url);
    }
  }, []);

  // Per-session in-memory cache to prevent refetching on every page navigation
  const loadContent = useCallback(async (force = false) => {
    if (!force && inMemorySessionCache) {
      applyContentData(inMemorySessionCache);
      setIsLoaded(true);
      return;
    }
    try {
      const res = await fetch('/api/content');
      if (!res.ok) return;
      const data = await res.json();
      inMemorySessionCache = data;
      applyContentData(data);
      setIsLoaded(true);

      // Persist latest snapshot to localStorage for instantaneous future paints
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (_) {}
      }
    } catch (err) {
      console.log('Portfolio content loaded from resilient snapshot:', err);
      setIsLoaded(true);
    }
  }, [applyContentData]);

  // Instant hydration from cache on mount + fetch background update
  useEffect(() => {
    if (inMemorySessionCache) {
      applyContentData(inMemorySessionCache);
      setIsLoaded(true);
    } else if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          inMemorySessionCache = parsed;
          applyContentData(parsed);
          setIsLoaded(true);
        }
      } catch (_) {}
      loadContent();
    } else {
      loadContent();
    }

    // Listen to admin update events for live sync without reload
    const handleSync = () => {
      loadContent(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio_content_updated', handleSync);
      window.addEventListener('storage', handleSync);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('portfolio_content_updated', handleSync);
        window.removeEventListener('storage', handleSync);
      }
    };
  }, [applyContentData, loadContent]);

  // Live Simulation Preview hook (inert unless ?cms_preview=1 is present)
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.location.search.includes('cms_preview=1')) return;

    setIsPreview(true);

    // Notify parent window that preview is ready
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'CMS_PREVIEW_READY' }, window.location.origin);
    }

    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'CMS_PREVIEW_DRAFT') return;

      const { section, data } = event.data;
      if (!data || typeof data !== 'object') return;

      const payload = {};
      if (section === 'home') {
        if (data.hero) payload.hero = data.hero;
        if (data.cta) payload.homepage_cta = data.cta;
      } else if (section === 'about') {
        if (data.about) {
          payload.about = {
            ...data.about,
            pillars: data.pillars || data.about.pillars,
            principles: data.principles || data.about.principles,
          };
        }
      } else if (section === 'experience') {
        if (data.experiences) payload.experiences = data.experiences;
        if (data.metrics) payload.experience_metrics = data.metrics;
      } else if (section === 'education') {
        if (data.educations) payload.educations = data.educations;
        if (data.pillars) payload.coursework_pillars = data.pillars;
        if (data.certifications) payload.certifications = data.certifications;
      } else if (section === 'skills') {
        if (data.skills) payload.skills = data.skills;
        if (data.softwareTools) payload.software_tools = data.softwareTools;
        if (data.badges) payload.skill_badges = data.badges;
      } else if (section === 'projects') {
        if (data.projects) payload.projects = data.projects;
        if (data.methodologies) payload.project_methodologies = data.methodologies;
      } else if (section === 'contact') {
        if (data.contact) payload.social_links = data.contact;
        if (data.channels) payload.contact_channels = data.channels;
      } else if (section === 'settings') {
        if (data.pageHeaders) payload.page_headers = data.pageHeaders;
        if (data.resume) payload.resume = data.resume;
      }

      applyContentData(payload);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [applyContentData]);

  const openResumeModal = () => setResumeModalOpen(true);
  const closeResumeModal = () => setResumeModalOpen(false);

  return (
    <PortfolioContext.Provider
      value={{
        isPreview,
        heroData,
        aboutData,
        highlights,
        experienceMetrics,
        skillsData,
        softwareTools,
        skillBadges,
        projectsData,
        projectMethodologies,
        experiences,
        educations,
        courseworkPillars,
        certifications,
        services,
        contactData,
        contactChannels,
        pageHeaders,
        homepageCta,
        resumeUrl,
        resumeModalOpen,
        openResumeModal,
        closeResumeModal,
        reloadContent: loadContent,
        isLoaded,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}
