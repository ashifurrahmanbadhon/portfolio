"use client";

import React, { useState } from "react";
import { Globe, Save, ExternalLink } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const PAGES_CONFIG = [
  { key: "home", label: "Home Page", path: "/", defaultTitle: "Ashifur Rahman • Portfolio", defaultDesc: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services." },
  { key: "about", label: "About Ashifur", path: "/about", defaultTitle: "Ashifur Rahman • About", defaultDesc: "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence." },
  { key: "projects", label: "Engineering Projects", path: "/projects", defaultTitle: "Ashifur Rahman • Projects", defaultDesc: "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV simulations, and AI automations." },
  { key: "work", label: "Work & Packages", path: "/work", defaultTitle: "Work — Service Packages | Ashifur Rahman", defaultDesc: "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start." },
  { key: "experience", label: "Work Experience", path: "/experience", defaultTitle: "Ashifur Rahman • Experience", defaultDesc: "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and data analytics in engineering environments." },
  { key: "skills", label: "Technical Skills", path: "/skills", defaultTitle: "Ashifur Rahman • Skills", defaultDesc: "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, programming, and engineering tools." },
  { key: "education", label: "Academic Education", path: "/education", defaultTitle: "Ashifur Rahman • Education & Training", defaultDesc: "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the academic and professional credentials of Ashifur Rahman." },
  { key: "contact", label: "Contact Hub", path: "/contact", defaultTitle: "Ashifur Rahman • Contact", defaultDesc: "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub." },
];

export default function SeoTitlesEditor({ pageHeaders, setPageHeaders, onSave, saving }) {
  const headers = pageHeaders || {};

  const getPageHeader = (key) => headers[key] || {};

  const handleFieldChange = (key, field, value) => {
    const current = getPageHeader(key);
    setPageHeaders({
      ...headers,
      [key]: {
        ...current,
        page_key: key,
        [field]: value,
      },
    });
  };

  const handleSave = () => {
    if (onSave) {
      const items = PAGES_CONFIG.map((p) => {
        const ph = getPageHeader(p.key);
        return {
          page_key: p.key,
          seo_title: ph.seo_title || p.defaultTitle,
          seo_description: ph.seo_description || p.defaultDesc,
          title: ph.title || "",
          badge_text: ph.badge_text || "",
          highlight_word: ph.highlight_word || "",
          description: ph.description || "",
        };
      });
      onSave("seo", { items }, "All 8 SEO page titles and descriptions saved!");
    }
  };

  return (
    <div className="space-y-6">
      <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#F59E0B]" />
              SEO Titles &amp; SERP Snippet Preview (8 Pages)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure search engine titles and meta descriptions for each public page with live Google desktop SERP preview.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save All SEO Titles"}</span>
          </button>
        </div>
      </SpotlightCard>

      <div className="space-y-6">
        {PAGES_CONFIG.map((page) => {
          const ph = getPageHeader(page.key);
          const seoTitle = ph.seo_title !== undefined && ph.seo_title !== null ? ph.seo_title : page.defaultTitle;
          const seoDesc = ph.seo_description !== undefined && ph.seo_description !== null ? ph.seo_description : page.defaultDesc;
          const previewUrl = `https://ashifurrahman.vercel.app${page.path === "/" ? "" : page.path}`;

          return (
            <SpotlightCard
              key={page.key}
              className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl space-y-4 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#23242B]">
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                    {page.path}
                  </span>
                  <span className="text-white font-bold">{page.label}</span>
                </div>

                <a
                  href={page.path}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-[#F59E0B] flex items-center gap-1 font-mono text-[11px] transition"
                >
                  <span>Open Page</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Input Controls */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-medium text-slate-300">SEO Page Title (Browser Tab)</label>
                      <span className={`font-mono text-[10px] ${seoTitle.length > 65 ? "text-amber-400" : "text-slate-500"}`}>
                        {seoTitle.length}/60 chars
                      </span>
                    </div>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => handleFieldChange(page.key, "seo_title", e.target.value)}
                      placeholder={page.defaultTitle}
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-medium"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-medium text-slate-300">SEO Meta Description</label>
                      <span className={`font-mono text-[10px] ${seoDesc.length > 160 ? "text-amber-400" : "text-slate-500"}`}>
                        {seoDesc.length}/155 chars
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={seoDesc}
                      onChange={(e) => handleFieldChange(page.key, "seo_description", e.target.value)}
                      placeholder={page.defaultDesc}
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Right: Live SERP Snippet Preview */}
                <div className="p-4 rounded-xl bg-[#202124] border border-[#303134] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono text-[#9AA0A6]">
                      <span className="text-[#81C995] font-semibold">{previewUrl}</span>
                    </div>

                    <h4 className="text-base font-semibold text-[#8AB4F8] hover:underline cursor-pointer leading-snug line-clamp-1 mb-1.5 font-sans">
                      {seoTitle || page.defaultTitle}
                    </h4>

                    <p className="text-xs text-[#BDC1C6] leading-relaxed line-clamp-2 font-sans">
                      {seoDesc || page.defaultDesc}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#303134]/60 flex items-center justify-between text-[10px] font-mono text-[#9AA0A6]">
                    <span>Google Desktop SERP Preview</span>
                    <span className="text-emerald-400">Indexed 200 OK</span>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </div>
  );
}

