"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit2, Trash2, Sparkles, X, Check } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ActiveToggle from "./ActiveToggle";

export default function ExperienceMetricsManager({
  metrics,
  experienceMetrics,
  setMetrics,
  setExperienceMetrics,
  onSave,
  saving,
}) {
  const list = Array.isArray(experienceMetrics)
    ? experienceMetrics
    : Array.isArray(metrics)
    ? metrics
    : [];
  const updateList = setExperienceMetrics || setMetrics;

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ metric: "", label: "", subtext: "" });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && modalOpen) {
        setModalOpen(false);
      }
    };
    if (modalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [modalOpen]);

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({ metric: "", label: "", subtext: "" });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    setForm({
      metric: list[idx]?.metric || "",
      label: list[idx]?.label || "",
      subtext: list[idx]?.subtext || "",
      is_active: list[idx]?.is_active !== undefined ? list[idx].is_active : 1,
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.metric.trim() || !form.label.trim()) return;

    let updated;
    if (editingIndex >= 0) {
      updated = list.map((item, idx) => (idx === editingIndex ? { ...item, ...form } : item));
    } else {
      updated = [...list, { ...form, is_active: 1, sort_order: list.length + 1 }];
    }

    if (updateList) updateList(updated);
    setModalOpen(false);
    if (onSave) {
      onSave("experience_metrics", { items: updated }, "Experience metrics saved!");
    }
  };

  const handleToggleActive = (idx) => {
    const updated = list.map((item, i) => {
      if (i !== idx) return item;
      const currentActive = item.is_active !== 0 && item.is_active !== false;
      return { ...item, is_active: currentActive ? 0 : 1 };
    });
    if (updateList) updateList(updated);
    if (onSave) {
      const isNowActive = updated[idx].is_active === 1;
      onSave("experience_metrics", { items: updated }, `Metric marked as ${isNowActive ? "Active" : "Disabled"}!`);
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm(`Delete metric "${list[idx]?.label || list[idx]?.metric}"?`)) return;
    const updated = list.filter((_, i) => i !== idx);
    if (updateList) updateList(updated);
    if (onSave) {
      onSave("experience_metrics", { items: updated }, "Metric removed!");
    }
  };

  return (
    <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#23242B] gap-4 w-full">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            Career Highlights Metrics (Top of Experience Page)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Metric counters displayed on <code className="text-[#F59E0B]">/experience</code> (e.g. 2+ Years, 33/11 kV, 100%, 500+).
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3.5 py-2 rounded-xl bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Metric</span>
        </button>
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#23242B] bg-[#06070B]/50 text-slate-400 text-xs">
          No metrics configured yet. Click &ldquo;Add New Metric&rdquo; above to create one.
        </div>
      )}

      {/* Grid of Metrics */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {list.map((item, idx) => (
            <SpotlightCard
              key={idx}
              className="bg-[#06070B] border border-[#23242B] p-4 sm:p-5 rounded-xl space-y-3 group relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-mono text-[#F59E0B]">
                    {item.metric}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <ActiveToggle
                      isActive={item.is_active}
                      onToggle={() => handleToggleActive(idx)}
                      label="Metric"
                    />
                    <button
                      type="button"
                      onClick={() => openEdit(idx)}
                      className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-[#F59E0B] hover:bg-[#F59E0B]/10 transition cursor-pointer"
                      title="Edit Metric"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 rounded-lg bg-[#12131A] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete Metric"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-bold text-white group-hover:text-[#FBBF24] transition">{item.label}</p>
                {item.subtext && <p className="text-[11px] text-slate-400 leading-relaxed">{item.subtext}</p>}
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      {/* Portal-rendered Fullscreen Modal (Never trapped or clipped by transforms/overflow) */}
      {modalOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-[#0A0B10] border border-[#23242B] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>{editingIndex >= 0 ? "Edit Metric" : "Add Experience Metric"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Metric Value (e.g. 2+ Years, 33/11 kV, 100%)</label>
                <input
                  type="text"
                  required
                  value={form.metric}
                  onChange={(e) => setForm({ ...form, metric: e.target.value })}
                  placeholder="e.g. 2+ Years"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Metric Label</label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Field Experience"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Subtext / Detail (optional)</label>
                <input
                  type="text"
                  value={form.subtext}
                  onChange={(e) => setForm({ ...form, subtext: e.target.value })}
                  placeholder="e.g. Substation engineering & operations"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2.5 text-white outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#23242B]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#12131A] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#23242B] text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Metric"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
