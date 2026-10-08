"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Cpu, X, Monitor, Terminal, Compass, FileSpreadsheet, Sun, Zap, ShieldCheck } from "lucide-react";

const ICON_OPTIONS = [
  { label: "CAD / Monitor", value: "Monitor" },
  { label: "Terminal / Code", value: "Terminal" },
  { label: "Power Analysis / CPU", value: "Cpu" },
  { label: "GIS / Compass", value: "Compass" },
  { label: "Excel / Spreadsheet", value: "FileSpreadsheet" },
  { label: "Solar / Sun", value: "Sun" },
  { label: "High Voltage / Zap", value: "Zap" },
  { label: "Security / Shield", value: "ShieldCheck" },
];

export default function SoftwareToolsManager({ softwareTools, setSoftwareTools, onSave, saving }) {
  const list = Array.isArray(softwareTools) ? softwareTools : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({
    name: "",
    tool_type: "",
    icon: "Monitor",
    level: "Advanced",
    summary: "",
  });

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({ name: "", tool_type: "", icon: "Monitor", level: "Advanced", summary: "" });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    setForm({ ...list[idx] });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    let updated;
    if (editingIndex >= 0) {
      updated = list.map((item, idx) => (idx === editingIndex ? { ...form } : item));
    } else {
      updated = [...list, { ...form }];
    }

    setSoftwareTools(updated);
    setModalOpen(false);
    if (onSave) {
      onSave("software_tools", { items: updated }, "Software tools updated!");
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm(`Delete tool "${list[idx].name}"?`)) return;
    const updated = list.filter((_, i) => i !== idx);
    setSoftwareTools(updated);
    if (onSave) {
      onSave("software_tools", { items: updated }, "Tool removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            Core Software &amp; Frameworks Stack
          </h3>
          <p className="text-xs text-slate-400">
            Featured engineering software cards on <code className="text-emerald-400">/skills</code> (e.g. AutoCAD Electrical, MATLAB, ETAP, ArcGIS, MS Excel, PVSyst).
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Tool</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/40 p-4 rounded-xl flex flex-col justify-between group transition relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.level || "Proficient"}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(idx)}
                    className="p-1 text-slate-400 hover:text-emerald-400 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1 text-slate-400 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                {item.name}
              </h4>
              {item.tool_type && (
                <p className="text-[11px] font-mono text-slate-400">{item.tool_type}</p>
              )}
              {item.summary && (
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingIndex >= 0 ? "Edit Software Tool" : "Add Software Tool"}
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
                <label className="block font-medium text-slate-300 mb-1">Tool Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. AutoCAD Electrical"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Category / Type</label>
                <input
                  type="text"
                  required
                  value={form.tool_type}
                  onChange={(e) => setForm({ ...form, tool_type: e.target.value })}
                  placeholder="e.g. CAD & Drafting"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Proficiency Level</label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    placeholder="e.g. Advanced / Mastery"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Icon</label>
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
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Usage Summary</label>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  placeholder="Single Line Diagrams (SLD), industrial motor control..."
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
                  Save Tool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
