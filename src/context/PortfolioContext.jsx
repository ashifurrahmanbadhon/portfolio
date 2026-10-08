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
  const [aboutData, setAboutData] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [skillsData, setSkillsData] = useState(DEFAULT_SKILLS);
  const [projectsData, setProjectsData] = useState(DEFAULT_PROJECTS);
  const [experiences, setExperiences] = useState(DEFAULT_EXPERIENCES);
  const [educations, setEducations] = useState(DEFAULT_EDUCATIONS);
  const [certifications, setCertifications] = useState(DEFAULT_CERTIFICATIONS);
  const [contactData, setContactData] = useState(DEFAULT_CONTACT);
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

      if (data.about && data.about.title) {
        setAboutData((prev) => ({ ...prev, ...data.about }));
      }

      if (Array.isArray(data.highlights) && data.highlights.length > 0) {
        setHighlights(data.highlights);
      }

      if (Array.isArray(data.projects)) {
        setProjectsData(
          data.projects.map((p, i) => ({
            id: p.project_number || String(i + 1).padStart(2, '0'),
            project_number: p.project_number || String(i + 1).padStart(2, '0'),
            title: p.title,
            category: p.category || 'Engineering',
            description: p.short_description || p.full_description,
            full_description: p.full_description || '',
            image_url: p.image_url || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            live_url: p.live_url || '',
            github_url: p.github_url || '',
            is_featured: !!p.is_featured,
          }))
        );
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

  return (
    <PortfolioContext.Provider
      value={{
        heroData,
        aboutData,
        highlights,
        skillsData,
        projectsData,
        experiences,
        educations,
        certifications,
        contactData,
        resumeUrl,
        resumeModalOpen,
        setResumeModalOpen,
        openResumeModal: () => setResumeModalOpen(true),
        closeResumeModal: () => setResumeModalOpen(false),
        refreshContent: loadContent
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    return {
      heroData: DEFAULT_HERO,
      aboutData: DEFAULT_ABOUT,
      highlights: DEFAULT_HIGHLIGHTS,
      skillsData: DEFAULT_SKILLS,
      projectsData: DEFAULT_PROJECTS,
      experiences: DEFAULT_EXPERIENCES,
      educations: DEFAULT_EDUCATIONS,
      certifications: DEFAULT_CERTIFICATIONS,
      contactData: DEFAULT_CONTACT,
      resumeUrl: '/resume.pdf',
      resumeModalOpen: false,
      setResumeModalOpen: () => {},
      openResumeModal: () => {},
      closeResumeModal: () => {},
      refreshContent: async () => {}
    };
  }
  return context;
}
