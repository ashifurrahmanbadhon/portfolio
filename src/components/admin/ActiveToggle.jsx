'use client';

import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function ActiveToggle({ isActive, onToggle, label = 'Item' }) {
  const active = isActive !== 0 && isActive !== false;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={`px-2 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition cursor-pointer select-none ${
        active
          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-xs'
          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
      }`}
      title={active ? `${label} is currently VISIBLE on website (Click to Disable)` : `${label} is currently HIDDEN from website (Click to Activate)`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      <span className="font-semibold">{active ? 'Active' : 'Disabled'}</span>
    </button>
  );
}
