"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import ActiveToggle from "./ActiveToggle";

export default function SkillBadgesManager({ skillBadges, setSkillBadges, onSave, saving }) {
  const rawList = Array.isArray(skillBadges) ? skillBadges : [];
  // Normalize items to ensure all are objects with name and is_active
  const list = rawList
    .map((b) => {
      if (typeof b === "object" && b !== null) {
        return {
          name: b.name || "",
          is_active: b.is_active !== 0 && b.is_active !== false ? 1 : 0,
        };
      }
      return { name: String(b || ""), is_active: 1 };
    })
    .filter((b) => b.name);

  const [newBadge, setNewBadge] = useState("");

  const handleAdd = (e) => {
    e?.preventDefault();
    const val = newBadge.trim();
    if (!val || list.some((b) => b.name.toLowerCase() === val.toLowerCase())) return;

    const updated = [...list, { name: val, is_active: 1 }];
    setSkillBadges(updated);
    setNewBadge("");
    if (onSave) {
      onSave("skill_badges", { items: updated }, "Skill badge added!");
    }
  };

  const handleToggleActive = (idx) => {
    const updated = list.map((item, i) => {
      if (i !== idx) return item;
      const currentActive = item.is_active !== 0 && item.is_active !== false;
      return { ...item, is_active: currentActive ? 0 : 1 };
    });
    setSkillBadges(updated);
    if (onSave) {
      const isNowActive = updated[idx].is_active === 1;
      onSave("skill_badges", { items: updated }, `Badge marked as ${isNowActive ? "Active" : "Disabled"}!`);
    }
  };

  const handleDelete = (idx) => {
    const updated = list.filter((_, i) => i !== idx);
    setSkillBadges(updated);
    if (onSave) {
      onSave("skill_badges", { items: updated }, "Skill badge removed!");
    }
  };

  return (
    <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-7 rounded-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#23242B] gap-4 w-full">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-[#F59E0B]" />
            Standards, Protocols &amp; Skill Badges
          </h3>
          <p className="text-xs text-slate-400">
            Pill badges displayed on <code className="text-[#F59E0B]">/skills</code> (e.g. AutoCAD Electrical 2D, ETAP Power Flow, IEEE Standards).
          </p>
        </div>

        <form onSubmit={handleAdd} className="flex items-center gap-2 shrink-0 ml-auto">
          <input
            type="text"
            value={newBadge}
            onChange={(e) => setNewBadge(e.target.value)}
            placeholder="Add new badge..."
            className="bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
          />
          <button
            type="submit"
            disabled={!newBadge.trim() || saving}
            className="px-3 py-1.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {list.map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#06070B] border border-[#23242B] hover:border-[#F59E0B]/40 text-xs text-slate-200 transition group"
          >
            <span className={item.is_active === 0 ? "line-through text-slate-500" : ""}>{item.name}</span>
            <ActiveToggle
              isActive={item.is_active}
              onToggle={() => handleToggleActive(idx)}
              label="Badge"
            />
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="p-0.5 text-slate-500 hover:text-red-400 transition cursor-pointer"
              title="Remove Badge"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </SpotlightCard>
  );
}
