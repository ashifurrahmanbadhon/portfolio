"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, BookOpen, X, Check } from "lucide-react";

export default function CourseworkManager({ courseworkPillars, setCourseworkPillars, onSave, saving }) {
  const list = Array.isArray(courseworkPillars) ? courseworkPillars : [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [form, setForm] = useState({ title: "", coursesStr: "" });

  const openAdd = () => {
    setEditingIndex(-1);
    setForm({ title: "", coursesStr: "" });
    setModalOpen(true);
  };

  const openEdit = (idx) => {
    setEditingIndex(idx);
    const item = list[idx];
    setForm({
      title: item.title || "",
      coursesStr: Array.isArray(item.courses) ? item.courses.join("\n") : "",
    });
    setModalOpen(true);
  };

  const handleSaveModal = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const coursesArray = form.coursesStr
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newItem = {
      title: form.title.trim(),
      courses: coursesArray,
    };

    let updated;
    if (editingIndex >= 0) {
      updated = list.map((item, idx) => (idx === editingIndex ? newItem : item));
    } else {
      updated = [...list, newItem];
    }

    setCourseworkPillars(updated);
    setModalOpen(false);
    if (onSave) {
      onSave("coursework_pillars", { items: updated }, "Coursework curriculum saved!");
    }
  };

  const handleDelete = (idx) => {
    if (!window.confirm("Delete this coursework pillar?")) return;
    const updated = list.filter((_, i) => i !== idx);
    setCourseworkPillars(updated);
    if (onSave) {
      onSave("coursework_pillars", { items: updated }, "Coursework pillar removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Undergraduate Coursework Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Curriculum pillars shown on <code className="text-emerald-400">/education</code> (e.g. Power Systems, Electronics, Control & Computing).
          </p>
        </div>

        <button
          type="button"
          onClick={openAdd}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Curriculum Pillar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#0A0D12] border border-[#1E2638] p-4 rounded-xl space-y-3 group relative"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition">
                {item.title}
              </h4>
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

            <ul className="space-y-1.5 text-xs text-slate-300">
              {(item.courses || []).map((c, cIdx) => (
                <li key={cIdx} className="flex items-start gap-1.5 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2638] pb-3">
              <h3 className="text-base font-bold text-white">
                {editingIndex >= 0 ? "Edit Curriculum Pillar" : "Add Curriculum Pillar"}
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
                <label className="block font-medium text-slate-300 mb-1">Pillar Domain Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Power & High Voltage Systems"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">
                  Courses (One Course per Line)
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.coursesStr}
                  onChange={(e) => setForm({ ...form, coursesStr: e.target.value })}
                  placeholder="Power System Analysis & Grid Stability&#10;High Voltage Engineering&#10;Switchgear Protection"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed font-mono"
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
