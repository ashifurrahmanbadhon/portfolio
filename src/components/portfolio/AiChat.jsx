'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { usePortfolio } from '@/context/PortfolioContext';

const QUICK_CHIPS = [
  'Skills?',
  'Projects',
  'Experience?',
  'Hire him'
];

export default function AiChat() {
  const { heroData } = usePortfolio();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am Ashifur's AI Assistant. Ask me anything about his electrical engineering background, substation operations, AutoCAD & GIS skills, or projects."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const trimmed = (textToSend || input).trim();
    if (!trimmed || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages.map((m) => ({
        role: m.role,
        content: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload
        })
      });

      const data = await res.json();
      const replyText = data.reply || "I am currently unable to reply. Please connect with Ashifur through the Contact page.";

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: replyText
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          text: "I am having trouble connecting right now. Please reach out to Ashifur directly through the Contact page."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chip) => {
    let question = chip;
    if (chip === 'Skills?') question = 'What are your core engineering skills and software tools?';
    if (chip === 'Projects') question = 'Can you highlight your top engineering projects?';
    if (chip === 'Experience?') question = 'What is your background and work experience?';
    if (chip === 'Hire him') question = 'How can I hire or contact Ashifur for engineering work?';
    handleSendMessage(question);
  };

  return (
    <>
      {/* 62px circle trigger button at bottom-right */}
      <div className="fixed bottom-6 right-6 z-[99]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Chat" : "Open AI Assistant"}
          className="relative w-[62px] h-[62px] rounded-full bg-[#F59E0B] hover:bg-[#FBBF24] text-[#1A1202] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          {/* Soft pulse ring */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-[#F59E0B]/35 animate-ping pointer-events-none" />
          )}

          {/* Amber online dot */}
          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#F59E0B] border-2 border-[#06070B]" />

          {isOpen ? (
            <X size={24} className="stroke-[2.5]" />
          ) : (
            <MessageSquare size={26} className="fill-[#1A1202] stroke-[1.5]" />
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-4 sm:right-6 z-[99] w-[calc(100vw-32px)] sm:w-[362px] h-[min(560px,calc(100vh-140px))] bg-[#0A0B10] border border-[#23242B] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-label="AI Assistant"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#23242B] bg-[#0E1017] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#F59E0B]/50 shrink-0 bg-[#06070B]">
                <Image
                  src={heroData.profile_image || '/ashifur-home.jpg'}
                  alt="Ashifur Rahman"
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#F5F2EA] flex items-center gap-1.5">
                  Ashifur — AI Assistant
                  <Sparkles size={12} className="text-[#F59E0B]" />
                </h4>
                <p className="font-mono text-[10px] text-[#F59E0B] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                  ONLINE — REPLIES INSTANTLY
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#8E8B82] hover:text-[#F5F2EA] hover:bg-white/5 rounded-lg transition cursor-pointer"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Chips Bar */}
          <div className="px-3.5 py-2.5 bg-[#06070B] border-b border-[#23242B] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full border border-[#23242B] bg-[#0A0B10] text-[#B9B5A9] hover:text-[#F59E0B] hover:border-[#F59E0B]/50 text-[11px] font-mono transition cursor-pointer disabled:opacity-50"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-[#F59E0B] text-[#1A1202] font-semibold rounded-br-xs'
                      : 'bg-[#111219] text-[#F5F2EA] border border-[#23242B] rounded-bl-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#111219] border border-[#23242B] rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#23242B] bg-[#0E1017] flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about skills, projects, substation..."
              disabled={loading}
              className="flex-1 bg-[#06070B] border border-[#23242B] text-[#F5F2EA] placeholder-[#8E8B82] text-xs px-3.5 py-2.5 rounded-xl outline-none focus:border-[#F59E0B] transition"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 rounded-xl bg-[#F59E0B] hover:bg-[#FBBF24] text-[#1A1202] flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
