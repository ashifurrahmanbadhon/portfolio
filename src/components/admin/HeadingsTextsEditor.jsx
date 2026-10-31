"use client";

import React, { useState } from "react";
import {
  FileText,
  Save,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Check,
  RotateCcw
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ActiveToggle from "@/components/admin/ActiveToggle";
import { DEFAULT_SITE_TEXTS, DEFAULT_PROCESS_STEPS } from "@/lib/portfolioDefaults";

export default function HeadingsTextsEditor({
  siteTexts,
  setSiteTexts,
  processSteps,
  setProcessSteps,
  onSave,
  saving
}) {
  const texts = { ...DEFAULT_SITE_TEXTS, ...(siteTexts || {}) };
  const steps = Array.isArray(processSteps) && processSteps.length > 0 ? processSteps : DEFAULT_PROCESS_STEPS;

  const [activeSubTab, setActiveSubTab] = useState("homepage"); // "homepage" | "subpages" | "process_steps"
  const [editingStep, setEditingStep] = useState(null);
  const [editingStepIndex, setEditingStepIndex] = useState(-1);

  const handleTextChange = (key, value) => {
    setSiteTexts({ ...texts, [key]: value });
  };

  const handleSaveTexts = () => {
    if (onSave) {
      onSave("headings", texts, "Headings & microcopy texts saved successfully!");
    }
  };

  const handleSaveSteps = (updatedSteps) => {
    const toSave = updatedSteps || steps;
    setProcessSteps(toSave);
    if (onSave) {
      onSave("process_steps", { items: toSave }, "How I Work process steps updated!");
    }
  };

  const toggleStepActive = (idx) => {
    const updated = steps.map((s, i) => {
      if (i !== idx) return s;
      return { ...s, is_active: s.is_active === 1 || s.is_active === true ? 0 : 1 };
    });
    handleSaveSteps(updated);
  };

  const moveStep = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= steps.length) return;
    const updated = [...steps];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    const reordered = updated.map((s, i) => ({ ...s, sort_order: i + 1 }));
    handleSaveSteps(reordered);
  };

  const deleteStep = (idx) => {
    if (!window.confirm(`Delete step "${steps[idx]?.title || 'Step'}"?`)) return;
    const updated = steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, sort_order: i + 1 }));
    handleSaveSteps(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Main Save */}
      <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F59E0B]" />
              Headings, Microcopy &amp; Process Steps Editor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Edit all 39 visitor-visible section headings, buttons, and "How I Work" process steps.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveTexts}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save All Texts"}</span>
          </button>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[#23242B] overflow-x-auto text-xs font-mono">
          {[
            { id: "homepage", label: "Homepage Sections & Buttons" },
            { id: "subpages", label: "Sub-Pages & Global Strings" },
            { id: "process_steps", label: `How I Work Steps (${steps.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer font-semibold ${
                activeSubTab === tab.id
                  ? "bg-[#F59E0B] text-[#06070B]"
                  : "bg-[#12131A] text-slate-400 hover:text-white border border-[#23242B]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </SpotlightCard>

      {/* ============================================================== */}
      {/* TAB 1: HOMEPAGE SECTIONS & BUTTONS                             */}
      {/* ============================================================== */}
      {activeSubTab === "homepage" && (
        <div className="space-y-4">
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-5 text-xs">
            <h3 className="text-sm font-bold text-[#F5F2EA] uppercase tracking-wider font-mono border-b border-[#23242B] pb-2 text-[#F59E0B]">
              Homepage Section Headings &amp; Navigation Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Featured Projects */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Featured Projects Section Heading</label>
                <input
                  type="text"
                  value={texts.home_featured_projects_heading || ""}
                  onChange={(e) => handleTextChange("home_featured_projects_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Featured Projects Link Button</label>
                <input
                  type="text"
                  value={texts.home_featured_projects_btn || ""}
                  onChange={(e) => handleTextChange("home_featured_projects_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Career Journey / Experience Heading</label>
                <input
                  type="text"
                  value={texts.home_experience_heading || ""}
                  onChange={(e) => handleTextChange("home_experience_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Experience Timeline Button</label>
                <input
                  type="text"
                  value={texts.home_experience_btn || ""}
                  onChange={(e) => handleTextChange("home_experience_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Technical Skills Heading</label>
                <input
                  type="text"
                  value={texts.home_skills_heading || ""}
                  onChange={(e) => handleTextChange("home_skills_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Skills Matrix Button</label>
                <input
                  type="text"
                  value={texts.home_skills_btn || ""}
                  onChange={(e) => handleTextChange("home_skills_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Education */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Education &amp; Credentials Heading</label>
                <input
                  type="text"
                  value={texts.home_education_heading || ""}
                  onChange={(e) => handleTextChange("home_education_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Credentials Link Button</label>
                <input
                  type="text"
                  value={texts.home_education_btn || ""}
                  onChange={(e) => handleTextChange("home_education_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              {/* Services & Packages */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Engineering Services Section Heading</label>
                <input
                  type="text"
                  value={texts.home_services_heading || ""}
                  onChange={(e) => handleTextChange("home_services_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Digital Services (Work Teaser) Heading</label>
                <input
                  type="text"
                  value={texts.home_packages_heading || ""}
                  onChange={(e) => handleTextChange("home_packages_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">View All Packages Button</label>
                <input
                  type="text"
                  value={texts.home_packages_btn || ""}
                  onChange={(e) => handleTextChange("home_packages_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">How I Work Section Heading</label>
                <input
                  type="text"
                  value={texts.home_how_i_work_heading || ""}
                  onChange={(e) => handleTextChange("home_how_i_work_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SUB-PAGES & GLOBAL STRINGS                              */}
      {/* ============================================================== */}
      {activeSubTab === "subpages" && (
        <div className="space-y-4 text-xs">
          {/* About Page */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider font-mono border-b border-[#23242B] pb-2">
              About Page Microcopy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Read Full Bio Button</label>
                <input
                  type="text"
                  value={texts.about_read_bio_btn || ""}
                  onChange={(e) => handleTextChange("about_read_bio_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Core Focus Heading</label>
                <input
                  type="text"
                  value={texts.about_focus_heading || ""}
                  onChange={(e) => handleTextChange("about_focus_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Engineering Domains Heading</label>
                <input
                  type="text"
                  value={texts.about_domains_heading || ""}
                  onChange={(e) => handleTextChange("about_domains_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Operating Principles Heading</label>
                <input
                  type="text"
                  value={texts.about_principles_heading || ""}
                  onChange={(e) => handleTextChange("about_principles_heading", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Work Page Bottom CTA */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider font-mono border-b border-[#23242B] pb-2">
              Work Page Bottom CTA Block
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">CTA Heading Title</label>
                <input
                  type="text"
                  value={texts.work_bottom_cta_title || ""}
                  onChange={(e) => handleTextChange("work_bottom_cta_title", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={texts.work_bottom_cta_btn || ""}
                  onChange={(e) => handleTextChange("work_bottom_cta_btn", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-300 mb-1">CTA Paragraph Description</label>
                <textarea
                  rows={2}
                  value={texts.work_bottom_cta_desc || ""}
                  onChange={(e) => handleTextChange("work_bottom_cta_desc", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                />
              </div>
            </div>
          </SpotlightCard>

          {/* Global Branding & Footer */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#F59E0B] uppercase tracking-wider font-mono border-b border-[#23242B] pb-2">
              Navbar &amp; Footer Strings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Navbar Status Typewriter Badge</label>
                <input
                  type="text"
                  value={texts.nav_status_badge || ""}
                  onChange={(e) => handleTextChange("nav_status_badge", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Footer Copyright Rights Text</label>
                <input
                  type="text"
                  value={texts.footer_rights_text || ""}
                  onChange={(e) => handleTextChange("footer_rights_text", e.target.value)}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono uppercase"
                />
              </div>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: "HOW I WORK" PROCESS STEPS CRUD                         */}
      {/* ============================================================== */}
      {activeSubTab === "process_steps" && (
        <div className="space-y-4">
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#23242B] mb-5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#F59E0B]" />
                  "How I Work" Process Steps ({steps.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordered steps rendered on homepage section 10. Reorder, edit, or add steps.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStep({
                    title: "",
                    description: "",
                    sort_order: steps.length + 1,
                    is_active: 1
                  });
                  setEditingStepIndex(-1);
                }}
                className="px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Process Step</span>
              </button>
            </div>

            {/* List of Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="stat-box p-5 bg-[#06070B] border border-[#23242B] space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                          #{String(step.sort_order || idx + 1).padStart(2, "0")}
                        </span>
                        <span className="text-white font-bold">{step.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <ActiveToggle
                          isActive={step.is_active}
                          onToggle={() => toggleStepActive(idx)}
                          label="Step"
                        />
                        <button
                          type="button"
                          onClick={() => moveStep(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveStep(idx, 1)}
                          disabled={idx === steps.length - 1}
                          className="p-1 rounded-lg bg-[#12131A] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStep({ ...step });
                            setEditingStepIndex(idx);
                          }}
                          className="p-1 rounded-lg bg-[#12131A] text-[#F59E0B] hover:bg-amber-500/20 cursor-pointer"
                          title="Edit Step"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteStep(idx)}
                          className="p-1 rounded-lg bg-[#12131A] text-red-400 hover:bg-red-500/20 cursor-pointer"
                          title="Delete Step"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Inline Modal for Editing / Adding Step */}
      {editingStep && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0A0B10] border border-[#23242B] rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F59E0B]" />
              {editingStepIndex >= 0 ? `Edit Step #${editingStepIndex + 1}` : "Add Process Step"}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Step Title</label>
                <input
                  type="text"
                  value={editingStep.title || ""}
                  onChange={(e) => setEditingStep({ ...editingStep, title: e.target.value })}
                  placeholder="e.g. Consult, Plan, Execute, Support"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingStep.description || ""}
                  onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                  placeholder="Detailed description of this step in your methodology..."
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={editingStep.sort_order || 1}
                    onChange={(e) => setEditingStep({ ...editingStep, sort_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#23242B]">
              <button
                type="button"
                onClick={() => {
                  setEditingStep(null);
                  setEditingStepIndex(-1);
                }}
                className="px-4 py-2 rounded-xl bg-[#12131A] text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = [...steps];
                  if (editingStepIndex >= 0) {
                    updated[editingStepIndex] = editingStep;
                  } else {
                    updated.push({ ...editingStep, sort_order: steps.length + 1 });
                  }
                  handleSaveSteps(updated);
                  setEditingStep(null);
                  setEditingStepIndex(-1);
                }}
                className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4" />
                <span>Save Step</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

