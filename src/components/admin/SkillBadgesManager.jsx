"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";

export default function SkillBadgesManager({ skillBadges, setSkillBadges, onSave, saving }) {
  const list = Array.isArray(skillBadges) ? skillBadges : [];
  const [newBadge, setNewBadge] = useState("");

  const handleAdd = (e) => {
    e?.preventDefault();
    const val = newBadge.trim();
    if (!val || list.includes(val)) return;

    const updated = [...list, val];
    setSkillBadges(updated);
    setNewBadge("");
    if (onSave) {
      onSave("skill_badges", { items: updated }, "Skill badge added!");
    }
  };

  const handleDelete = (badge) => {
    const updated = list.filter((b) => b !== badge);
    setSkillBadges(updated);
    if (onSave) {
      onSave("skill_badges", { items: updated }, "Skill badge removed!");
    }
  };

  return (
    <div className="bg-[#111622] border border-[#1E2638] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1E2638] gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Standards, Protocols &amp; Skill Badges
          </h3>
          <p className="text-xs text-slate-400">
            Pill badges displayed on <code className="text-emerald-400">/skills</code> (e.g. AutoCAD Electrical 2D, ETAP Power Flow, IEEE Standards).
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <input
            type="text"
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            placeholder="Add new badge..."
            className="bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-500 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          />
          <button
            type="submit"
            disabled={!newBadge.trim() || saving}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {list.map((badge, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0A0D12] border border-[#1E2638] hover:border-emerald-500/40 text-xs text-slate-200 transition group"
          >
            <span>{badge}</span>
            <button
              type="button"
              onClick={() => handleDelete(badge)}
              className="p-0.5 text-slate-500 hover:text-red-400 transition"
              title="Remove Badge"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
