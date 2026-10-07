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
} from "lucide-react";

import { useToast } from "@/components/Toast";
import TwoFactorSettings from "@/components/TwoFactorSettings";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
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
    corsOrigins: "http://localhost:3000, https://toolghor.netlify.app, https://ashifurrahman.netlify.app",
    webhookUrl: "https://api.github.com/repos/ashifur/webhooks",
  });

  const handleSave = () => {
    setSaved(true);
    if (showToast) {
      showToast("System configurations saved successfully!", "success");
    }
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "general", name: "General Settings", icon: Sliders },
    { id: "cms", name: "CMS Settings", icon: Settings },
    { id: "website", name: "Website Settings", icon: Globe },
    { id: "email", name: "Email Settings", icon: Mail },
    { id: "security", name: "Security", icon: Shield },
    { id: "api", name: "API / Integrations", icon: Key },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          {saved ? <Check className="w-4 h-4 animate-pop" /> : <Save className="w-4 h-4" />}
          <span>{saved ? "Configuration Saved!" : "Save All Changes"}</span>
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#1E2638] gap-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`pb-3 px-4 text-xs font-mono font-medium border-b-2 transition flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "border-emerald-400 text-emerald-300 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0B0F17] border border-[#1E2638] animate-fade-up">
        {/* General */}
        {activeTab === "general" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-mono">General Configurations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Central CMS System Title</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Default Timezone</label>
                  <input
                    type="text"
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Super Admin Email</label>
                  <input
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CMS Settings */}
        {activeTab === "cms" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-mono">Content Management Engine</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Default Content Cache TTL (Seconds)</label>
                <input
                  type="number"
                  defaultValue="300"
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Max Media Upload File Size (MB)</label>
                <input
                  type="number"
                  defaultValue="25"
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Website Settings */}
        {activeTab === "website" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-mono">Connected Network Routing</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Allowed CORS Origins</label>
                <input
                  type="text"
                  value={settings.corsOrigins}
                  onChange={(e) => setSettings({ ...settings, corsOrigins: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Health Check Frequency (Minutes)</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Email Settings */}
        {activeTab === "email" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-mono">SMTP Notification Server</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={settings.smtpHost}
                  onChange={(e) => setSettings({ ...settings, smtpHost: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Port</label>
                <input
                  type="text"
                  value={settings.smtpPort}
                  onChange={(e) => setSettings({ ...settings, smtpPort: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-mono text-slate-400 mb-1">SMTP Username</label>
                <input
                  type="text"
                  value={settings.smtpUser}
                  onChange={(e) => setSettings({ ...settings, smtpUser: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-6 max-w-3xl">
            {/* Dedicated 2FA Management Component */}
            <TwoFactorSettings />

            {/* Session Inactivity Timeout Card */}
            <div className="p-5 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-4">
              <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Session & Token Configuration</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Session Inactivity Timeout (Hours)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#0A0D12] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Remember Me Lifespan (Days)</label>
                  <input
                    type="number"
                    disabled
                    value="30"
                    className="w-full px-3.5 py-2.5 bg-[#0A0D12] border border-[#1E2638] rounded-xl text-xs text-slate-400 font-mono cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API / Integrations */}
        {activeTab === "api" && (
          <div className="space-y-5 max-w-2xl">
            <h3 className="text-sm font-bold text-white font-mono">API Access & Automation Webhooks</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Rate Limit (Requests per minute)</label>
                <input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => setSettings({ ...settings, apiRateLimit: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Deployment Webhook URL</label>
                <input
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#111622] border border-[#1E2638] rounded-xl text-xs text-white font-mono"
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
                    onClick={() => alert("API Key copied to clipboard!")}
                    className="px-3 py-1.5 rounded-lg bg-[#161E30] hover:bg-[#1E2638] text-slate-300 hover:text-white text-xs font-mono border border-[#1E2638] interactive-btn cursor-pointer"
                  >
                    Copy Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
