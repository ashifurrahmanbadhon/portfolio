"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit2, Trash2, Layers, X, Check } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ActiveToggle from "./ActiveToggle";

export default function ProjectMethodologyManager({
  methodologies,
  projectMethodologies,
  setMethodologies,
  setProjectMethodologies,
  onSave,
  saving,
}) {
  const list = Array.isArray(projectMethodologies)
    ? projectMethodologies
    : Array.isArray(methodologies)
    ? methodologies
    : [];
  const updateList = setProjectMethodologies || setMethodologies;

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ step_number: "01", title: "", description: "" });

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
    setForm({
      step_number: String(list.length + 1).padStart(2, "0"),
      title: "",
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    setForm({
      step_number: list[idx]?.step_number || String(idx + 1).padStart(2, "0"),
      title: list[idx]?.title || "",
      description: list[idx]?.description || "",
      is_active: list[idx]?.is_active !== undefined ? list[idx].is_active : 1,
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    let updated;
    if (editingIndex >= 0) {
      updated = list.map((item, idx) => (idx === editingIndex ? { ...item, ...form } : item));
    } else {
      updated = [...list, { ...form, is_active: 1, sort_order: list.length + 1 }];
    }

    if (updateList) updateList(updated);
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
    if (updateList) updateList(updated);
    if (onSave) {
      const isNowActive = updated[idx].is_active === 1;
      onSave("project_methodologies", { items: updated }, `Step marked as ${isNowActive ? "Active" : "Disabled"}!`);
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm(`Delete workflow step "${list[idx]?.title || list[idx]?.step_number}"?`)) return;
    const updated = list.filter((_, i) => i !== idx);
    if (updateList) updateList(updated);
    if (onSave) {
      onSave("project_methodologies", { items: updated }, "Workflow step removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-4 w-full">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Engineering Lifecycle &amp; Project Methodologies
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Workflow steps shown at the bottom of <code className="text-emerald-400">/projects</code> (e.g. Specification, Simulation, Drafting, Verification).
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Workflow Step</span>
        </button>
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#1E2638] bg-[#0A0D12]/50 text-slate-400 text-xs">
          No workflow steps configured. Click &ldquo;Add New Workflow Step&rdquo; above to create one.
        </div>
      )}

      {/* Grid of Steps */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {list.map((item, idx) => (
            <SpotlightCard
              key={idx}
              className="bg-[#0A0D12] border border-[#1E2638] p-4 sm:p-5 rounded-xl space-y-3 group relative flex flex-col justify-between"
            >
              <div className="space-y-2">
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
                      className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                      title="Edit Step"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 rounded-lg bg-[#161C2A] text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Delete Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
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
            className="bg-[#111622] border border-[#1E2638] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>{editingIndex >= 0 ? "Edit Workflow Step" : "Add New Workflow Step"}</span>
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
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1.5">Step #</label>
                  <input
                    type="text"
                    value={form.step_number}
                    onChange={(e) => setForm({ ...form, step_number: e.target.value })}
                    placeholder="01"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white outline-none font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-slate-300 mb-1.5">Step Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Specification & Requirements"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1.5">Step Description</label>
                <textarea
                  rows={4}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed explanation of this engineering lifecycle step..."
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 hover:text-white border border-[#1E2638] text-xs font-mono transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Step"}</span>
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
