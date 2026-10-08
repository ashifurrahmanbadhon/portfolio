"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Layers, X } from "lucide-react";
import ActiveToggle from "./ActiveToggle";

export default function ProjectMethodologyManager({ methodologies, setMethodologies, onSave, saving }) {
  const list = Array.isArray(methodologies) ? methodologies : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ step_number: "01", title: "", description: "" });

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({
      step_number: String(list.length + 1).padStart(2, "0"),
      title: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    setForm({ ...list[idx] });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    let updated;
    if (editingIndex >= 0) {
      updated = list.map((item, idx) => (idx === editingIndex ? { ...form } : item));
    } else {
      updated = [...list, { ...form }];
    }

    setMethodologies(updated);
    setModalOpen(false);
    if (onSave) {
      onSave("project_methodologies", { items: updated }, "Project methodologies saved!");
    }
  };

  const handleToggleActive = (idx) => {
    const updated = list.map((item, i) => {
      if (i !== idx) return item;
      const currentActive = item.is_active !== 0 && item.is_active !== false;
      return { ...item, is_active: currentActive ? 0 : 1 };
    });
    setMethodologies(updated);
    if (onSave) {
      const isNowActive = updated[idx].is_active === 1;
      onSave("project_methodologies", { items: updated }, `Step marked as ${isNowActive ? "Active" : "Disabled"}!`);
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm("Delete this workflow step?")) return;
    const updated = list.filter((_, i) => i !== idx);
    setMethodologies(updated);
    if (onSave) {
      onSave("project_methodologies", { items: updated }, "Workflow step removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Engineering Lifecycle &amp; Project Methodologies
          </h3>
          <p className="text-xs text-slate-400">
            Workflow steps shown at the bottom of <code className="text-emerald-400">/projects</code> (e.g. Specification, Simulation, Drafting, Verification).
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Workflow Step</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0A0D12] border border-[#1E2638] p-4 rounded-xl space-y-2 group relative"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {item.step_number || String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5">
                <ActiveToggle
                  isActive={item.is_active}
                  onToggle={() => handleToggleActive(idx)}
                  label="Workflow Step"
                />
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

            <h4 className="text-xs font-bold text-white">{item.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingIndex >= 0 ? "Edit Workflow Step" : "Add Workflow Step"}
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Step #</label>
                  <input
                    type="text"
                    value={form.step_number}
                    onChange={(e) => setForm({ ...form, step_number: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Step Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Step Description</label>
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
                  Save Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
