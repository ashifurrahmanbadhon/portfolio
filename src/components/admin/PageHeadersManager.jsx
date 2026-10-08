"use client";

import { useState } from "react";
import { Sliders, Save } from "lucide-react";

const PAGES = [
  { key: "home", label: "Home Page (/)" },
  { key: "about", label: "About Page (/about)" },
  { key: "experience", label: "Experience Page (/experience)" },
  { key: "education", label: "Education Page (/education)" },
  { key: "skills", label: "Skills Page (/skills)" },
  { key: "projects", label: "Projects Page (/projects)" },
  { key: "contact", label: "Contact Page (/contact)" },
];

export default function PageHeadersManager({ pageHeaders, setPageHeaders, onSave, saving }) {
  const [activePage, setActivePage] = useState("about");

  const currentHeader = pageHeaders?.[activePage] || {
    badge_text: "",
    title: "",
    highlight_word: "",
    description: "",
  };

  const handleChange = (field, value) => {
    const updated = {
      ...pageHeaders,
      [activePage]: {
        ...currentHeader,
        page_key: activePage,
        [field]: value,
      },
    };
    setPageHeaders(updated);
  };

  const handleSave = () => {
    if (onSave) {
      onSave("page_headers", pageHeaders, "Page header banners updated!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Website Page Headers &amp; Banner Banners (All 7 Pages)
          </h3>
          <p className="text-xs text-slate-400">
            Customize the hero banner, status badge pill, title, and intro description at the top of every page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Headers"}</span>
        </button>
      </div>

      {/* Page Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#1E2638] scrollbar-none">
        {PAGES.map((pg) => {
          const isActive = activePage === pg.key;
          return (
            <button
              key={pg.key}
              type="button"
              onClick={() => setActivePage(pg.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold"
                  : "text-slate-400 hover:text-white hover:bg-[#161C2A]"
              }`}
            >
              {pg.label}
            </button>
          );
        })}
      </div>

      {/* Editor for current selected page */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
        <div>
          <label className="block font-medium text-slate-300 mb-1">Badge Text (Top Pill)</label>
          <input
            type="text"
            value={currentHeader.badge_text || ""}
            onChange={(e) => handleChange("badge_text", e.target.value)}
            placeholder="e.g. TECHNICAL PROFICIENCY"
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">Highlight Word (Gradient Green Text)</label>
          <input
            type="text"
            value={currentHeader.highlight_word || ""}
            onChange={(e) => handleChange("highlight_word", e.target.value)}
            placeholder="e.g. Engineering & AI"
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-slate-300 mb-1">Main Banner Title</label>
          <input
            type="text"
            value={currentHeader.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="e.g. About Ashifur Rahman —"
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-slate-300 mb-1">Header Description Paragraph</label>
          <textarea
            rows={3}
            value={currentHeader.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
