"use client";

import { Sparkles, Save } from "lucide-react";

export default function HomepageCtaManager({ homepageCta, setHomepageCta, onSave, saving }) {
  const cta = homepageCta || {};

  const handleChange = (field, val) => {
    setHomepageCta({ ...cta, [field]: val });
  };

  const handleSave = () => {
    if (onSave) {
      onSave("homepage_cta", cta, "Homepage CTA section updated!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Homepage Collaboration CTA Banner
          </h3>
          <p className="text-xs text-slate-400">
            The prominent callout block at the bottom of the home page inviting collaborators to reach out.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save CTA"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
        <div>
          <label className="block font-medium text-slate-300 mb-1">Badge Text</label>
          <input
            type="text"
            value={cta.badge_text || ""}
            onChange={(e) => handleChange("badge_text", e.target.value)}
            placeholder="Open for Engineering & AI Opportunities"
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">Main Heading</label>
          <input
            type="text"
            value={cta.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Let's Collaborate on Engineering Solutions"
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block font-medium text-slate-300 mb-1">Description</label>
          <textarea
            rows={2}
            value={cta.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Whether you need substation consultation, AutoCAD schematics, GIS utility analysis..."
            className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">Primary Button Text &amp; Link</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={cta.primary_btn_text || ""}
              onChange={(e) => handleChange("primary_btn_text", e.target.value)}
              placeholder="Open Contact Hub"
              className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
            />
            <input
              type="text"
              value={cta.primary_btn_link || ""}
              onChange={(e) => handleChange("primary_btn_link", e.target.value)}
              placeholder="/contact"
              className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-300 mb-1">Secondary Button Text &amp; Link</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={cta.secondary_btn_text || ""}
              onChange={(e) => handleChange("secondary_btn_text", e.target.value)}
              placeholder="Download Official CV"
              className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
            />
            <input
              type="text"
              value={cta.secondary_btn_link || ""}
              onChange={(e) => handleChange("secondary_btn_link", e.target.value)}
              placeholder="/resume.pdf"
              className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
