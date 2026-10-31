"use client";

import React, { useState } from "react";
import { Sparkles, Save, Plus, Trash2, MessageSquare, Bot, User } from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";

const DEFAULT_WELCOME = "Hello! I am Ashifur's AI Assistant. Ask me anything about his electrical engineering background, substation operations, AutoCAD & GIS skills, or projects.";

const DEFAULT_CHIPS = [
  { label: "Skills?", question: "What are your core engineering skills and software tools?" },
  { label: "Projects", question: "Can you highlight your top engineering projects?" },
  { label: "Experience?", question: "What is your background and work experience?" },
  { label: "Hire him", question: "How can I hire or contact Ashifur for engineering work?" },
];

export default function AiChatEditor({ siteTexts, setSiteTexts, onSave, saving }) {
  const texts = siteTexts || {};
  const welcome = texts.chat_welcome !== undefined && texts.chat_welcome !== null ? texts.chat_welcome : DEFAULT_WELCOME;

  let initialChips = DEFAULT_CHIPS;
  if (texts.chat_chips) {
    try {
      const parsed = typeof texts.chat_chips === "string" ? JSON.parse(texts.chat_chips) : texts.chat_chips;
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialChips = parsed.map((c) => (typeof c === "string" ? { label: c, question: c } : c));
      }
    } catch (_) {}
  }

  const [chips, setChips] = useState(initialChips);
  const [welcomeText, setWelcomeText] = useState(welcome);

  const handleAddChip = () => {
    setChips([...chips, { label: "New Chip", question: "What would you like to know?" }]);
  };

  const handleChipChange = (idx, field, value) => {
    const updated = chips.map((c, i) => (i === idx ? { ...c, [field]: value } : c));
    setChips(updated);
  };

  const handleDeleteChip = (idx) => {
    setChips(chips.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const updatedTexts = {
      ...texts,
      chat_welcome: welcomeText,
      chat_chips: JSON.stringify(chips),
    };
    if (setSiteTexts) setSiteTexts(updatedTexts);
    if (onSave) {
      onSave(
        "ai_chat",
        { chat_welcome: welcomeText, chat_chips: JSON.stringify(chips) },
        "AI Chat assistant settings saved!"
      );
    }
  };

  return (
    <div className="space-y-6">
      <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              AI Chat Assistant Configuration
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize the welcome message and quick starter question chips for visitors using the floating AI chat assistant.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save AI Chat"}</span>
          </button>
        </div>
      </SpotlightCard>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        {/* Left Column: Welcome Message & Chips Editor */}
        <div className="space-y-6">
          {/* Welcome Message Card */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#23242B] pb-3">
              <Bot className="w-4 h-4 text-[#F59E0B]" />
              Welcome Greeting Message
            </h3>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Assistant Initial Greeting (shown when chat window opens)
              </label>
              <textarea
                rows={3}
                value={welcomeText}
                onChange={(e) => setWelcomeText(e.target.value)}
                placeholder={DEFAULT_WELCOME}
                className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-xl px-3 py-2 text-white outline-none resize-none leading-relaxed"
              />
            </div>
          </SpotlightCard>

          {/* Quick Suggestion Chips */}
          <SpotlightCard className="bg-[#0A0B10] border border-[#23242B] p-5 sm:p-6 rounded-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#F59E0B]" />
                  Quick Suggestion Question Chips ({chips.length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Clickable pill tags in the chat header that trigger instant pre-filled inquiries.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddChip}
                className="px-3 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Chip</span>
              </button>
            </div>

            <div className="space-y-3">
              {chips.map((chip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#06070B] border border-[#23242B] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/20">
                      CHIP #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteChip(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition cursor-pointer"
                      title="Delete Chip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Pill Label (Button)
                      </label>
                      <input
                        type="text"
                        value={chip.label || ""}
                        onChange={(e) => handleChipChange(idx, "label", e.target.value)}
                        placeholder="e.g. Skills?"
                        className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-2.5 py-1.5 text-white outline-none font-bold"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">
                        Full Prompt Sent to AI
                      </label>
                      <input
                        type="text"
                        value={chip.question || ""}
                        onChange={(e) => handleChipChange(idx, "question", e.target.value)}
                        placeholder="e.g. What are your core engineering software tools?"
                        className="w-full bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] rounded-lg px-2.5 py-1.5 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        {/* Right Column: Live Chat UI Simulation Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
            <span>LIVE CHAT PREVIEW</span>
            <span className="text-emerald-400">● 24/7 Interactive</span>
          </div>

          <div className="rounded-2xl border border-[#23242B] bg-[#0A0B10] shadow-2xl overflow-hidden flex flex-col h-[460px]">
            {/* Header */}
            <div className="p-3.5 border-b border-[#23242B] bg-[#0E1017] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center text-[#F59E0B]">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    Ashifur — AI Assistant
                    <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                  </h4>
                  <p className="text-[9px] font-mono text-[#F59E0B]">ONLINE — REPLIES INSTANTLY</p>
                </div>
              </div>
            </div>

            {/* Quick Chips Bar Preview */}
            <div className="px-3 py-2 bg-[#06070B] border-b border-[#23242B] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {chips.map((chip, idx) => (
                <span
                  key={idx}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[#B9B5A9] text-[10px] font-mono border border-[#23242B] bg-[#12131A] select-none"
                >
                  {chip.label}
                </span>
              ))}
            </div>

            {/* Messages Area Preview */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto text-xs">
              <div className="flex justify-start">
                <div className="max-w-[90%] rounded-2xl rounded-bl-xs px-3.5 py-2.5 bg-[#111219] text-[#F5F2EA] border border-[#23242B] leading-relaxed">
                  {welcomeText}
                </div>
              </div>

              {chips[0] && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2 bg-[#F59E0B] text-[#1A1202] font-semibold">
                    {chips[0].question}
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar Preview */}
            <div className="p-3 border-t border-[#23242B] bg-[#06070B] flex items-center gap-2">
              <div className="flex-1 px-3 py-1.5 rounded-xl bg-[#0A0B10] border border-[#23242B] text-slate-500 text-xs font-mono">
                Ask about substation, AutoCAD, GIS...
              </div>
              <div className="p-2 rounded-xl bg-[#F59E0B] text-[#06070B]">
                <Bot className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

