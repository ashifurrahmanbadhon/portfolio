import React from 'react';

export default function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-emerald-500/10 blur-[130px] rounded-full" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] bg-teal-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-10 left-0 w-[500px] h-[500px] bg-emerald-700/5 blur-[140px] rounded-full" />
    </div>
  );
}
