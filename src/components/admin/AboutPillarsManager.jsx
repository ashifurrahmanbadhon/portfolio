"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Check, X, Layers, Zap, Monitor, Database, Briefcase, Cpu, ShieldCheck } from "lucide-react";

const ICON_OPTIONS = [
  { label: "High Voltage / Power (Zap)", value: "Zap" },
  { label: "CAD / Monitor (Monitor)", value: "Monitor" },
  { label: "GIS / Database (Database)", value: "Database" },
  { label: "Analytics / Business (Briefcase)", value: "Briefcase" },
  { label: "AI / Microcontroller (Cpu)", value: "Cpu" },
  { label: "Safety / Standards (ShieldCheck)", value: "ShieldCheck" },
  { label: "Layers / Architecture (Layers)", value: "Layers" },
];

export default function AboutPillarsManager({ about, setAbout, onSave, saving }) {
  const pillars = Array.isArray(about?.pillars) ? about.pillars : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    icon: "Zap",
  });

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({ title: "", subtitle: "", description: "", icon: "Zap" });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    setForm({ ...pillars[idx] });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    let updated;
    if (editingIndex >= 0) {
      updated = pillars.map((item, idx) => (idx === editingIndex ? { ...form } : item));
    } else {
      updated = [...pillars, { ...form }];
    }

    const newAbout = { ...about, pillars: updated };
    setAbout(newAbout);
    setModalOpen(false);
    if (onSave) {
      onSave("about", newAbout, "Core Competency Pillars updated successfully!");
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm(`Delete pillar "${pillars[idx].title}"?`)) return;
    const updated = pillars.filter((_, i) => i !== idx);
    const newAbout = { ...about, pillars: updated };
    setAbout(newAbout);
    if (onSave) {
      onSave("about", newAbout, "Pillar removed successfully!");
    }
  };

  const handleMove = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= pillars.length) return;
    const updated = [...pillars];
    const [moved] = updated.splice(idx, 1);
    updated.splice(targetIdx, 0, moved);
    const newAbout = { ...about, pillars: updated };
    setAbout(newAbout);
    if (onSave) {
      onSave("about", newAbout, "Pillar order updated!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Core Competency Pillars (About Page &amp; Home Overview)
          </h3>
          <p className="text-xs text-slate-400">
            Displayed as the 6 major engineering capability cards on <code className="text-emerald-400">/about</code> and the homepage preview.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Pillar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {pillars.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/40 p-4 rounded-xl flex flex-col justify-between group transition relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.icon || "Zap"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move Left"
                  >
                    <ArrowUp className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === pillars.length - 1}
                    className="p-1 text-slate-500 hover:text-white disabled:opacity-30"
                    title="Move Right"
                  >
                    <ArrowDown className="w-3.5 h-3.5 rotate-[-90deg]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(idx)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition"
                    title="Edit Pillar"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1 text-slate-400 hover:text-red-400 transition"
                    title="Delete Pillar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                {item.title}
              </h4>
              {item.subtitle && (
                <p className="text-[11px] font-mono text-emerald-400/80">{item.subtitle}</p>
              )}
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pillar Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-lg rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingIndex >= 0 ? "Edit Competency Pillar" : "Add Competency Pillar"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-[#1E2638] text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Pillar Title (e.g. Substation Engineering)</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Subtitle / Subcategory</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  placeholder="e.g. Power Distribution & Safety"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Icon Representation</label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161C2A] text-slate-300 hover:text-white border border-[#1E2638]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Save Pillar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
