"use client";

import { useState } from "react";
import {
  Settings,
  Sliders,
  Globe,
  Mail,
  Shield,
  Key,
  Save,
  Check,
  Server,
  Lock,
  Cpu,
  ChevronDown,
} from "lucide-react";

import { useToast } from "@/components/Toast";
import TwoFactorSettings from "@/components/TwoFactorSettings";
import LivePreviewPanel from "@/components/admin/LivePreviewPanel";

export default function SettingsPage() {
  const { showToast } = useToast();
  // All collapsed except first per specs
  const [openSettingId, setOpenSettingId] = useState("general");
  const [saved, setSaved] = useState(false);

  // Settings states
  const [settings, setSettings] = useState({
    siteName: "Ashifur Rahman Central CMS",
    adminEmail: "ashifur.badhon@gmail.com",
    timezone: "Asia/Dhaka (GMT+6)",
    defaultLang: "English (US)",
    sessionTimeout: "24",
    enable2FA: true,
    requireStrongPw: true,
    smtpHost: "smtp.mailgun.org",
    smtpPort: "587",
    smtpUser: "ashifur.badhon@gmail.com",
    apiRateLimit: "120",
    corsOrigins: "http://localhost:3000, https://ashifurrahmanbadhon.vercel.app, https://toolghor.vercel.app",
    webhookUrl: "https://api.github.com/repos/ashifur/webhooks",
  });

  const handleSave = () => {
    setSaved(true);
    if (showToast) {
      showToast("System configurations saved successfully!", "success");
    }
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleAccordion = (id) => {
    setOpenSettingId((prev) => (prev === id ? null : id));
  };

  const settingGroups = [
    {
      id: "general",
      name: "General Settings",
      subtitle: "System title, timezone, and administrative contact",
      icon: Sliders,
    },
    {
      id: "cms",
      name: "CMS Settings",
      subtitle: "Content caching TTL and media upload limits",
      icon: Settings,
    },
    {
      id: "website",
      name: "Website Settings",
      subtitle: "Cross-origin CORS routing and automated health check intervals",
      icon: Globe,
    },
    {
      id: "email",
      name: "Email Settings",
      subtitle: "SMTP notification server and transmission credentials",
      icon: Mail,
    },
    {
      id: "security",
      name: "Security & 2FA",
      subtitle: "Two-factor authentication and session inactivity policies",
      icon: Shield,
    },
    {
      id: "api",
      name: "API / Integrations",
      subtitle: "Rate limiting thresholds and deployment automation webhooks",
      icon: Key,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <span>Central System Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global configurations, security policies, email dispatchers, and external integrations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors duration-150 cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Configuration Saved!" : "Save All Changes"}</span>
        </button>
      </div>

      {/* Main 2-Column Layout: Accordion (Left) + Live Preview Rail (Right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* LEFT COLUMN: Accordion stack */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          {settingGroups.map((g) => {
            const isOpen = openSettingId === g.id;
            const Icon = g.icon;

            return (
              <div
                key={g.id}
                className={`rounded-2xl border transition-colors duration-150 overflow-hidden ${
                  isOpen
                    ? "bg-[#111622] border-emerald-500/40"
                    : "bg-[#0B0F17] hover:bg-[#111622]/80 border-[#1E2638]"
                }`}
              >
                {/* Header */}
                <button
                  type="button"
                  onClick={() => toggleAccordion(g.id)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-150 ${
                        isOpen
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-[#141A29] text-slate-400 border-[#1E2638]"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {g.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {g.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                      {isOpen ? "Collapse" : "Configure"}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center bg-[#161C2A] border border-[#1E2638] text-slate-400 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-emerald-400 border-emerald-500/30" : "rotate-0"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* Body */}
                {isOpen && (
                  <div className="p-4 sm:p-6 border-t border-[#1E2638] space-y-5 bg-[#0B0F17]/50">
                    {/* General */}
                    {g.id === "general" && (
                      <div className="space-y-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Central CMS System Title
                          </label>
                          <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-mono text-slate-400 mb-1">
                              Default Timezone
                            </label>
                            <input
                              type="text"
                              value={settings.timezone}
                              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-slate-400 mb-1">
                              Super Admin Email
                            </label>
                            <input
                              type="email"
                              value={settings.adminEmail}
                              onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CMS */}
                    {g.id === "cms" && (
                      <div className="space-y-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Default Content Cache TTL (Seconds)
                          </label>
                          <input
                            type="number"
                            defaultValue="300"
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Max Media Upload File Size (MB)
                          </label>
                          <input
                            type="number"
                            defaultValue="25"
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Website */}
                    {g.id === "website" && (
                      <div className="space-y-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Allowed CORS Origins
                          </label>
                          <input
                            type="text"
                            value={settings.corsOrigins}
                            onChange={(e) => setSettings({ ...settings, corsOrigins: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Health Check Frequency (Minutes)
                          </label>
                          <input
                            type="number"
                            defaultValue="5"
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {g.id === "email" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Host</label>
                          <input
                            type="text"
                            value={settings.smtpHost}
                            onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Port</label>
                          <input
                            type="text"
                            value={settings.smtpPort}
                            onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Username</label>
                          <input
                            type="text"
                            value={settings.smtpUser}
                            onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Security */}
                    {g.id === "security" && (
                      <div className="space-y-6 max-w-3xl">
                        <TwoFactorSettings />

                        <div className="p-4 sm:p-5 rounded-xl bg-[#111622] border border-[#1E2638] space-y-4">
                          <h4 className="text-xs font-bold text-white font-mono flex items-center gap-2">
                            <Lock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Session & Token Configuration</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-mono text-slate-400 mb-1">
                                Session Inactivity Timeout (Hours)
                              </label>
                              <input
                                type="number"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-[#0A0D12] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-mono text-slate-400 mb-1">
                                Remember Me Lifespan (Days)
                              </label>
                              <input
                                type="number"
                                disabled
                                value="30"
                                className="w-full px-3.5 py-2.5 bg-[#0A0D12] border border-[#1E2638] rounded-xl text-xs text-slate-500 font-mono cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* API */}
                    {g.id === "api" && (
                      <div className="space-y-4 max-w-2xl">
                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Rate Limit (Requests per minute)
                          </label>
                          <input
                            type="number"
                            value={settings.apiRateLimit}
                            onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-mono text-slate-400 mb-1">
                            Deployment Webhook URL
                          </label>
                          <input
                            type="url"
                            value={settings.webhookUrl}
                            onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="p-4 rounded-xl bg-[#111622] border border-[#1E2638] space-y-2">
                          <span className="text-xs font-bold text-white block">Active API Key</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              readOnly
                              value="cms_live_sec_99384729184710293847"
                              className="flex-1 px-3 py-1.5 bg-[#0B0F17] border border-[#1E2638] rounded-lg text-xs text-emerald-400 font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (showToast) showToast("API Key copied to clipboard!", "success");
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#161E30] hover:bg-[#1E2638] text-slate-300 hover:text-white text-xs font-mono border border-[#1E2638] cursor-pointer transition-colors duration-150"
                            >
                              Copy Key
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Live Simulation Rail (w-[400px] lg / w-[460px] xl, sticky under TopBar) */}
        <div className="w-full lg:w-[400px] xl:w-[460px] lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] h-[70vh] min-h-[500px] shrink-0">
          <LivePreviewPanel
            url="/"
            savedOnly={true}
            collapsible={false}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
