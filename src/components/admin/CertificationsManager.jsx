"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, ShieldCheck, X, Check } from "lucide-react";
import ActiveToggle from "./ActiveToggle";

export default function CertificationsManager({ certifications, setCertifications, onSave, saving }) {
  const list = Array.isArray(certifications) ? certifications : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    year: "",
    description: "",
  });

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({ title: "", issuer: "", year: new Date().getFullYear().toString(), description: "" });
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

    setCertifications(updated);
    setModalOpen(false);
    if (onSave) {
      onSave("certifications", { items: updated }, "Certifications updated!");
    }
  };

  const handleToggleActive = (idx) => {
    const updated = list.map((item, i) => {
      if (i !== idx) return item;
      const currentActive = item.is_active !== 0 && item.is_active !== false;
      return { ...item, is_active: currentActive ? 0 : 1 };
    });
    setCertifications(updated);
    if (onSave) {
      const isNowActive = updated[idx].is_active === 1;
      onSave("certifications", { items: updated }, `Certification marked as ${isNowActive ? "Active" : "Disabled"}!`);
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm("Delete this certification?")) return;
    const updated = list.filter((_, i) => i !== idx);
    setCertifications(updated);
    if (onSave) {
      onSave("certifications", { items: updated }, "Certification removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Professional Certifications &amp; Industry Modules
          </h3>
          <p className="text-xs text-slate-400">
            Field certifications displayed on <code className="text-emerald-400">/education</code> and the homepage education preview.
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Certification</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0A0D12] border border-[#1E2638] p-4 rounded-xl flex flex-col justify-between group relative"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {item.year || "Certified"}
                </span>

                <div className="flex items-center gap-1.5">
                  <ActiveToggle
                    isActive={item.is_active}
                    onToggle={() => handleToggleActive(idx)}
                    label="Certification"
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

              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                {item.title}
              </h4>
              {item.issuer && (
                <p className="text-[11px] font-mono text-emerald-400/80">{item.issuer}</p>
              )}
              {item.description && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-[#1E2638] flex items-center gap-1 text-[11px] font-mono text-emerald-400">
              <Check className="w-3 h-3" /> Verified Credential
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingIndex >= 0 ? "Edit Certification" : "Add Certification"}
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
                <label className="block font-medium text-slate-300 mb-1">Certification Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. AutoCAD Electrical 2D & SLD Master Certification"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Issuing Organization / Institution</label>
                <input
                  type="text"
                  required
                  value={form.issuer}
                  onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                  placeholder="e.g. Dhaka Electric Supply Company Ltd. (DESCO)"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Year / Timeline</label>
                <input
                  type="text"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                  placeholder="e.g. 2023"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description / Curriculum Detail</label>
                <textarea
                  rows={3}
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
                  Save Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
