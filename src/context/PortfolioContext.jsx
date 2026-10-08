'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_HERO,
  DEFAULT_ABOUT,
  DEFAULT_HIGHLIGHTS,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_EDUCATIONS,
  DEFAULT_CERTIFICATIONS,
  DEFAULT_CONTACT
} from '@/lib/portfolioDefaults';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [heroData, setHeroData] = useState(DEFAULT_HERO);
  const [aboutData, setAboutData] = useState({
    ...DEFAULT_ABOUT,
    pillars: [],
    principles: [],
  });
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [experienceMetrics, setExperienceMetrics] = useState([]);
  const [skillsData, setSkillsData] = useState(DEFAULT_SKILLS);
  const [softwareTools, setSoftwareTools] = useState([]);
  const [skillBadges, setSkillBadges] = useState([]);
  const [projectsData, setProjectsData] = useState(DEFAULT_PROJECTS);
  const [projectMethodologies, setProjectMethodologies] = useState([]);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [educations, setEducations] = useState(DEFAULT_EDUCATIONS);
  const [courseworkPillars, setCourseworkPillars] = useState([]);
  const [certifications, setCertifications] = useState(DEFAULT_CERTIFICATIONS);
  const [contactData, setContactData] = useState(DEFAULT_CONTACT);
  const [pageHeaders, setPageHeaders] = useState({});
  const [homepageCta, setHomepageCta] = useState({});
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  const loadContent = useCallback(async () => {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();

      if (data.hero && data.hero.name) {
        setHeroData((prev) => ({ ...prev, ...data.hero }));
      }

      if (data.about) {
        setAboutData((prev) => ({
          ...prev,
          ...data.about,
          pillars: Array.isArray(data.about.pillars) ? data.about.pillars : (prev.pillars || []),
          principles: Array.isArray(data.about.principles) ? data.about.principles : (prev.principles || []),
        }));
      }

      if (Array.isArray(data.highlights) && data.highlights.length > 0) {
        setHighlights(data.highlights);
      }

      if (Array.isArray(data.experience_metrics) && data.experience_metrics.length > 0) {
        setExperienceMetrics(data.experience_metrics);
      }

      if (Array.isArray(data.projects)) {
        setProjectsData(
          data.projects.map((p, i) => ({
            id: p.project_number || String(i + 1).padStart(2, '0'),
            project_number: p.project_number || String(i + 1).padStart(2, '0'),
            title: p.title,
            category: p.category || 'Engineering',
            description: p.short_description || p.full_description,
            short_description: p.short_description || '',
            full_description: p.full_description || '',
            image_url: p.image_url || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            live_url: p.live_url || '',
            github_url: p.github_url || '',
            is_featured: !!p.is_featured,
          }))
        );
      }

      if (Array.isArray(data.project_methodologies) && data.project_methodologies.length > 0) {
        setProjectMethodologies(data.project_methodologies);
      }

      if (Array.isArray(data.experiences)) {
        setExperiences(
          data.experiences.map((e) => ({
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
        setEducations(
          data.educations.map((ed) => ({
            degree: ed.degree,
            institution: ed.institution,
            period: `${ed.start_year || ''} – ${ed.end_year || 'Present'}`.trim(),
            result: ed.result || ed.badge_text || 'Completed',
            badge_text: ed.badge_text || '',
            description: ed.description || '',
            highlights: ed.highlights || []
          }))
        );
      }

      if (Array.isArray(data.coursework_pillars) && data.coursework_pillars.length > 0) {
        setCourseworkPillars(data.coursework_pillars);
      }

      if (Array.isArray(data.certifications) && data.certifications.length > 0) {
        setCertifications(data.certifications);
      }

      if (Array.isArray(data.skills)) {
        const grouped = {};
        data.skills.forEach((s) => {
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
        setSoftwareTools(data.software_tools);
      }

      if (Array.isArray(data.skill_badges) && data.skill_badges.length > 0) {
        setSkillBadges(data.skill_badges.map(b => b.name || b));
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
          location: data.social_links.location || prev.location,
          maps_url: data.social_links.maps_url || prev.maps_url,
        }));
      }

      if (data.resume && data.resume.file_url) {
        setResumeUrl(data.resume.file_url);
      }
    } catch (err) {
      console.log('Portfolio content loaded from resilient default snapshot:', err);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const openResumeModal = () => setResumeModalOpen(true);
  const closeResumeModal = () => setResumeModalOpen(false);

  return (
    <PortfolioContext.Provider
      value={{
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
        contactData,
        pageHeaders,
        homepageCta,
        resumeUrl,
        resumeModalOpen,
        openResumeModal,
        closeResumeModal,
        reloadContent: loadContent,
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
