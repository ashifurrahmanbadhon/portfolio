"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  KeyRound,
  QrCode,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  X,
  Info,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function TwoFactorSettings() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    two_factor_enabled: false,
    masked_phone: "******7284",
    recovery_codes_remaining: 0,
    has_totp: false,
  });

  // Modals state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Setup state
  const [setupData, setSetupData] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [setupRecoveryCodes, setSetupRecoveryCodes] = useState(null);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);

  // Disable state
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [disableSubmitting, setDisableSubmitting] = useState(false);
  const [disableError, setDisableError] = useState("");

  // Regenerate state
  const [regenPassword, setRegenPassword] = useState("");
  const [regenCode, setRegenCode] = useState("");
  const [regenSubmitting, setRegenSubmitting] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [newRegenCodes, setNewRegenCodes] = useState(null);

  // Fetch 2FA status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get2FAStatus();
      if (res && res.success) {
        setStatus({
          two_factor_enabled: !!res.two_factor_enabled,
          masked_phone: res.masked_phone || "******7284",
          recovery_codes_remaining: res.recovery_codes_remaining || 0,
          has_totp: !!res.has_totp,
        });
      }
    } catch (err) {
      console.error("Failed to load 2FA status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Initiate Setup Flow
  const handleStartSetup = async () => {
    setShowSetupModal(true);
    setSetupLoading(true);
    setSetupData(null);
    setSetupCode("");
    setSetupError("");
    setSetupRecoveryCodes(null);
    setCopiedKey(false);
    setCopiedAllCodes(false);

    try {
      const res = await api.setup2FA();
      if (res && res.success) {
        setSetupData(res);
      } else {
        setSetupError(res?.error || "Could not generate TOTP setup credentials.");
      }
    } catch (e) {
      setSetupError("Failed to initiate 2FA setup. Check backend connectivity.");
    } finally {
      setSetupLoading(false);
    }
  };

  // Confirm Setup with 6-digit code
  const handleConfirmEnable = async (e) => {
    e.preventDefault();
    if (!setupCode.trim() || setupCode.length < 6) {
      setSetupError("Please enter the 6-digit verification code from your authenticator.");
      return;
    }

    setSetupSubmitting(true);
    setSetupError("");

    try {
      const res = await api.enable2FA(setupData.setup_token, setupCode.trim());
      if (res && res.success) {
        setSetupRecoveryCodes(res.recovery_codes || []);
        fetchStatus();
        if (showToast) showToast("Two-Factor Authentication activated!", "success");
      } else {
        setSetupError(res?.error || "Invalid code. Please check your authenticator clock.");
      }
    } catch (e) {
      setSetupError("Failed to verify code. Please try again.");
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Confirm Disable
  const handleConfirmDisable = async (e) => {
    e.preventDefault();
    if (!disablePassword || !disableCode) {
      setDisableError("Both password and 2FA / recovery code are required.");
      return;
    }

    setDisableSubmitting(true);
    setDisableError("");

    try {
      const res = await api.disable2FA(disablePassword, disableCode.trim());
      if (res && res.success) {
        setShowDisableModal(false);
        setDisablePassword("");
        setDisableCode("");
        fetchStatus();
        if (showToast) showToast("Two-Factor Authentication disabled.", "info");
      } else {
        setDisableError(res?.error || "Failed to disable 2FA. Incorrect credentials.");
      }
    } catch (e) {
      setDisableError("Error disabling 2FA. Please verify connection.");
    } finally {
      setDisableSubmitting(false);
    }
  };

  // Confirm Regenerate Recovery Codes
  const handleConfirmRegenerate = async (e) => {
    e.preventDefault();
    setRegenSubmitting(true);
    setRegenError("");

    try {
      const res = await api.regenerateRecoveryCodes(regenPassword, regenCode.trim());
      if (res && res.success) {
        setNewRegenCodes(res.recovery_codes || []);
        fetchStatus();
        if (showToast) showToast("New recovery codes generated!", "success");
      } else {
        setRegenError(res?.error || "Verification failed. Provide password or authenticator code.");
      }
    } catch (e) {
      setRegenError("Failed to regenerate recovery codes.");
    } finally {
      setRegenSubmitting(false);
    }
  };

  const copyToClipboard = (text, setCopied) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCodesAsFile = (codes) => {
    const content = `Ashifur Rahman Central CMS - Emergency 2FA Backup Recovery Codes
Generated on: ${new Date().toLocaleString()}
Account: ashifur.badhon@gmail.com

IMPORTANT: Keep these recovery codes safe. Each code can only be used once.

${codes.map((c, i) => `${i + 1}. ${c}`).join("\n")}
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `central-cms-recovery-codes-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 2FA Main Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111622] border border-[#1E2638] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                status.two_factor_enabled
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-slate-800/60 text-slate-400 border border-slate-700/50"
              }`}
            >
              {status.two_factor_enabled ? (
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              ) : (
                <ShieldAlert className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-sm font-bold text-white font-mono">Two-Factor Authentication (2FA)</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    status.two_factor_enabled
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {status.two_factor_enabled ? "Enabled & Active" : "Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Protect your Super Admin account with RFC 6238 TOTP Authenticator apps and verified SMS OTP fallback.
              </p>
            </div>
          </div>

          <div>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Checking status...</span>
              </div>
            ) : status.two_factor_enabled ? (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowRegenModal(true);
                    setRegenPassword("");
                    setRegenCode("");
                    setRegenError("");
                    setNewRegenCodes(null);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-[#161C2A] hover:bg-[#1E2638] text-slate-200 border border-[#1E2638] transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Regenerate Codes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDisableModal(true);
                    setDisablePassword("");
                    setDisableCode("");
                    setDisableError("");
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-mono font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Disable 2FA</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartSetup}
                className="px-4 py-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer interactive-btn"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enable 2FA Protection</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Primary Method */}
          <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Primary Method</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              TOTP Authenticator (Google Authenticator, Microsoft Authenticator, Authy).
            </p>
            <div className="text-[10px] font-mono text-emerald-400/90 pt-1 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>RFC 6238 Standard Compliant</span>
            </div>
          </div>

          {/* SMS OTP Fallback */}
          <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>SMS OTP Fallback</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Registered recovery phone: <span className="font-mono text-sky-300 font-semibold">{status.masked_phone}</span>
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-1">
              Used strictly for recovery / authenticator loss
            </div>
          </div>

          {/* Backup Recovery Codes */}
          <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Backup Recovery Codes</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {status.two_factor_enabled
                ? `${status.recovery_codes_remaining} single-use recovery code(s) remaining.`
                : "Codes generated upon enabling 2FA."}
            </p>
            <div className="text-[10px] font-mono text-amber-400/90 pt-1">
              {status.two_factor_enabled ? "Secure SHA-256 Hashed" : "Inactive"}
            </div>
          </div>
        </div>

        {/* Security Policy Information Card */}
        <div className="p-4 rounded-xl bg-[#0F141F] border border-blue-500/20 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold font-mono">
            <Info className="w-4 h-4" />
            <span>Enterprise Security & Lockout Policy</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 font-mono leading-relaxed">
            <li>Primary Admin Account: <strong className="text-white">ashifur.badhon@gmail.com</strong></li>
            <li>Default Verified Emergency Phone: <strong className="text-sky-400">{status.masked_phone}</strong> (Strictly verified)</li>
            <li>Brute-Force Lockout: 5 failed 2FA verification attempts triggers a 15-minute temporary lockout.</li>
            <li>SMS OTP Cooldown: Maximum 1 OTP dispatch every 60 seconds with 5-minute single-use expiration.</li>
          </ul>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: SETUP 2FA                                       */}
      {/* ======================================================== */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowSetupModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2638] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!setupRecoveryCodes ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Set Up Two-Factor Authentication</h3>
                  <p className="text-xs text-slate-400">
                    Scan the QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, or Authy).
                  </p>
                </div>

                {setupLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    <span>Generating unique TOTP secret...</span>
                  </div>
                ) : setupData ? (
                  <div className="space-y-4">
                    {/* QR Code Container */}
                    <div className="flex justify-center p-4 bg-white rounded-xl w-fit mx-auto shadow-inner border border-slate-200">
                      <img
                        src={setupData.qr_code}
                        alt="2FA QR Code"
                        className="w-44 h-44 sm:w-48 sm:h-48 rounded"
                      />
                    </div>

                    {/* Manual Setup Key Fallback */}
                    <div className="p-3 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <span>Manual Setup Key:</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(setupData.manual_key, setCopiedKey)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <div className="font-mono text-xs text-white tracking-widest break-all bg-[#161C2A] p-2 rounded-lg text-center select-all">
                        {setupData.manual_key}
                      </div>
                    </div>

                    {/* Verification Form */}
                    <form onSubmit={handleConfirmEnable} className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1.5 text-center">
                          Enter 6-digit verification code from app:
                        </label>
                        <input
                          type="text"
                          required
                          autoFocus
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="000000"
                          value={setupCode}
                          onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-emerald-400 rounded-xl px-4 py-2.5 text-center text-xl tracking-[0.35em] text-white font-mono placeholder:tracking-normal placeholder:text-slate-600 outline-none transition font-bold"
                        />
                      </div>

                      {setupError && (
                        <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-mono leading-relaxed flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <span className="flex-1">{setupError}</span>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowSetupModal(false)}
                          className="flex-1 py-2.5 rounded-xl text-xs font-mono font-medium bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 border border-[#1E2638] transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={setupSubmitting || setupCode.length !== 6}
                          className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold bg-emerald-500 hover:bg-emerald-400 text-black transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {setupSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4" />
                              <span>Activate 2FA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-6 text-rose-400 text-xs font-mono">
                    {setupError || "Unable to initialize setup."}
                  </div>
                )}
              </>
            ) : (
              /* Success & Recovery Codes View */
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-1">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">2FA Successfully Enabled!</h3>
                  <p className="text-xs text-slate-300">
                    Save these emergency recovery codes. Each code can only be used once if you lose your authenticator.
                  </p>
                </div>

                {/* Recovery Codes Grid */}
                <div className="p-4 rounded-xl bg-[#0A0D12] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Backup Recovery Codes (8)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(setupRecoveryCodes.join("\n"), setCopiedAllCodes)
                      }
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAllCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAllCodes ? "Copied All" : "Copy All"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs text-white">
                    {setupRecoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="bg-[#111622] border border-[#1E2638] px-3 py-1.5 rounded-lg text-center tracking-wider font-bold"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => downloadCodesAsFile(setupRecoveryCodes)}
                      className="w-full py-2 rounded-lg bg-[#161C2A] hover:bg-[#1E2638] border border-[#1E2638] text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Download Codes as .txt</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    Warning: You will not be shown these recovery codes again. Store them safely in a password manager or secure vault.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="w-full py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono transition cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  I Have Saved My Recovery Codes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DISABLE 2FA                                     */}
      {/* ======================================================== */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowDisableModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2638] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mx-auto flex items-center justify-center mb-1">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Disable Two-Factor Authentication</h3>
              <p className="text-xs text-slate-400">
                Requires strong identity verification. Enter your password and current 2FA / recovery code.
              </p>
            </div>

            <form onSubmit={handleConfirmDisable} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showDisablePassword ? "text" : "password"}
                    required
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showDisablePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  6-Digit Authenticator Code or Recovery Code
                </label>
                <input
                  type="text"
                  required
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.trim())}
                  placeholder="000000 or ABCD-1234"
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-rose-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none tracking-widest text-center"
                />
              </div>

              {disableError && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-mono leading-relaxed flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="flex-1">{disableError}</span>
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-mono font-medium bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 border border-[#1E2638] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableSubmitting || !disablePassword || !disableCode}
                  className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold bg-rose-500 hover:bg-rose-600 text-white transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {disableSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Disable 2FA</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: REGENERATE RECOVERY CODES                       */}
      {/* ======================================================== */}
      {showRegenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111622] border border-[#1E2638] w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowRegenModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1E2638] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!newRegenCodes ? (
              <>
                <div className="space-y-1 text-center">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-1">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">Regenerate Recovery Codes</h3>
                  <p className="text-xs text-slate-400">
                    Generating new recovery codes will instantly invalidate all previous codes.
                  </p>
                </div>

                <form onSubmit={handleConfirmRegenerate} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Current Password (or 6-digit Authenticator Code)
                    </label>
                    <input
                      type="password"
                      value={regenPassword}
                      onChange={(e) => setRegenPassword(e.target.value)}
                      placeholder="Admin password"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div className="text-center text-[11px] text-slate-500 font-mono">- OR -</div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">
                      Authenticator 6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={regenCode}
                      onChange={(e) => setRegenCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none tracking-widest text-center"
                    />
                  </div>

                  {regenError && (
                    <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-mono leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span className="flex-1">{regenError}</span>
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRegenModal(false)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-mono font-medium bg-[#161C2A] hover:bg-[#1E2638] text-slate-300 border border-[#1E2638] transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={regenSubmitting || (!regenPassword && !regenCode)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {regenSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>Generate New Codes</span>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="text-center space-y-1">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-1">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">New Recovery Codes Active</h3>
                  <p className="text-xs text-slate-300">
                    Your previous recovery codes have been revoked. Store these new codes safely.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0D12] border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-semibold">
                    <span>Active Backup Codes (8)</span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(newRegenCodes.join("\n"), setCopiedAllCodes)
                      }
                      className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedAllCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAllCodes ? "Copied All" : "Copy All"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono text-xs text-white">
                    {newRegenCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="bg-[#111622] border border-[#1E2638] px-3 py-1.5 rounded-lg text-center tracking-wider font-bold"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadCodesAsFile(newRegenCodes)}
                    className="w-full py-2 rounded-lg bg-[#161C2A] hover:bg-[#1E2638] border border-[#1E2638] text-xs font-mono text-slate-300 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Download Codes (.txt)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="w-full py-2.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono transition cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
