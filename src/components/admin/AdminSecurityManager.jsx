"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
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
  ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function AdminSecurityManager() {
  const { showToast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({
    enabled: false,
    remaining_recovery_codes: 0,
    phone: "******7284",
  });

  // Modal triggers
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Setup state
  const [setupStep, setSetupStep] = useState("password"); // "password" | "verify" | "codes"
  const [setupPassword, setSetupPassword] = useState("");
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupCode, setSetupCode] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupRecoveryCodes, setSetupRecoveryCodes] = useState(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedAllCodes, setCopiedAllCodes] = useState(false);

  // Disable state
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState("");

  // Regenerate state
  const [regenStep, setRegenStep] = useState("password"); // "password" | "codes"
  const [regenPassword, setRegenPassword] = useState("");
  const [showRegenPassword, setShowRegenPassword] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState("");
  const [newRegenCodes, setNewRegenCodes] = useState(null);
  const [copiedRegenCodes, setCopiedRegenCodes] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get2FAStatus();
      if (res && res.success) {
        setStatus({
          enabled: Boolean(res.enabled ?? res.two_factor_enabled),
          remaining_recovery_codes: Number(res.remaining_recovery_codes ?? res.recovery_codes_remaining ?? 0),
          phone: res.phone || "******7284",
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

  // Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showSetupModal && setupStep !== "codes") setShowSetupModal(false);
        if (showDisableModal) setShowDisableModal(false);
        if (showRegenModal && regenStep !== "codes") setShowRegenModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSetupModal, setupStep, showDisableModal, showRegenModal, regenStep]);

  // Copy helper
  const copyToClipboard = (text, setCopied) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download backup codes as .txt
  const downloadCodesAsFile = (codes) => {
    const content = `Ashifur Rahman Central CMS — Emergency 2FA Backup Recovery Codes
Generated on: ${new Date().toLocaleString()}
Account: ashifur.badhon@gmail.com

IMPORTANT: Keep these recovery codes safe and secret.
Each recovery code can only be used once to log in if your authenticator device is lost.

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

  // Start Setup Flow
  const openSetupModal = () => {
    setSetupStep("password");
    setSetupPassword("");
    setShowSetupPassword(false);
    setSetupData(null);
    setSetupCode("");
    setSetupError("");
    setSetupRecoveryCodes(null);
    setCopiedKey(false);
    setCopiedAllCodes(false);
    setShowSetupModal(true);
  };

  // Step 1: Submit password to generate 2FA secret (POST /api/auth/2fa/setup)
  const handleSetupPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!setupPassword) {
      setSetupError("Admin password is required to initiate 2FA setup.");
      return;
    }
    setSetupLoading(true);
    setSetupError("");

    try {
      const res = await api.setup2FA(setupPassword);
      if (res && res.success) {
        setSetupData(res);
        setSetupStep("verify");
      } else {
        setSetupError(res?.error || "Incorrect password or authorization error.");
      }
    } catch {
      setSetupError("Failed to initiate 2FA setup. Check backend connectivity.");
    } finally {
      setSetupLoading(false);
    }
  };

  // Step 2: Submit 6-digit code to enable 2FA (POST /api/auth/2fa/enable)
  const handleConfirmEnable = async (e) => {
    e.preventDefault();
    const cleanCode = setupCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setSetupError("Please enter the 6-digit verification code from your authenticator.");
      return;
    }

    setSetupLoading(true);
    setSetupError("");

    try {
      const token = setupData?.secret || setupData?.manual_key;
      const res = await api.enable2FA(token, cleanCode, setupPassword);
      if (res && res.success) {
        setSetupRecoveryCodes(res.recovery_codes || []);
        setSetupStep("codes");
        fetchStatus();
        if (showToast) showToast("Two-Factor Authentication activated successfully!", "success");
      } else {
        setSetupError(res?.error || "Invalid verification code. Please check your authenticator clock.");
      }
    } catch {
      setSetupError("Failed to verify code. Please try again.");
    } finally {
      setSetupLoading(false);
    }
  };

  // Open Disable Modal
  const openDisableModal = () => {
    setDisablePassword("");
    setDisableCode("");
    setShowDisablePassword(false);
    setDisableError("");
    setShowDisableModal(true);
  };

  // Confirm Disable (POST /api/auth/2fa/disable)
  const handleConfirmDisable = async (e) => {
    e.preventDefault();
    if (!disablePassword) {
      setDisableError("Admin password is required to disable 2FA.");
      return;
    }

    setDisableLoading(true);
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
    } catch {
      setDisableError("Error disabling 2FA. Please verify connection.");
    } finally {
      setDisableLoading(false);
    }
  };

  // Open Regenerate Modal
  const openRegenModal = () => {
    setRegenStep("password");
    setRegenPassword("");
    setShowRegenPassword(false);
    setRegenError("");
    setNewRegenCodes(null);
    setCopiedRegenCodes(false);
    setShowRegenModal(true);
  };

  // Confirm Regenerate (POST /api/auth/2fa/regenerate-recovery-codes)
  const handleConfirmRegenerate = async (e) => {
    e.preventDefault();
    if (!regenPassword) {
      setRegenError("Admin password is required to regenerate recovery codes.");
      return;
    }

    setRegenLoading(true);
    setRegenError("");

    try {
      const res = await api.regenerateRecoveryCodes(regenPassword);
      if (res && res.success) {
        setNewRegenCodes(res.recovery_codes || []);
        setRegenStep("codes");
        fetchStatus();
        if (showToast) showToast("New emergency recovery codes generated!", "success");
      } else {
        setRegenError(res?.error || "Verification failed. Incorrect admin password.");
      }
    } catch {
      setRegenError("Failed to regenerate recovery codes.");
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-6">
      {/* Section Header with Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#23242B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-none bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[#F5F2EA]">Security & Access Control</h2>
              {loading ? (
                <span className="stat-box text-[10px] font-mono px-2 py-0.5 bg-[#12131A] text-[#8E8B82] border border-[#23242B] flex items-center gap-1.5">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Checking...
                </span>
              ) : status.enabled ? (
                <span className="stat-box text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  2FA ACTIVE
                </span>
              ) : (
                <span className="stat-box text-[10px] font-mono px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  2FA DISABLED
                </span>
              )}
            </div>
            <p className="text-xs text-[#B9B5A9] max-w-xl leading-relaxed mt-1">
              Manage multi-factor authentication, emergency recovery codes, and administrator credentials.
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          title="Refresh 2FA status from server"
          className="self-start sm:self-center px-3 py-1.5 rounded-none bg-[#06070B] border border-[#23242B] hover:border-[#F59E0B] text-[#B9B5A9] hover:text-[#F5F2EA] text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#F59E0B]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Main 2FA Action Card */}
      <div className="stat-box p-5 sm:p-6 bg-[#06070B] border border-[#23242B] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#F59E0B]" />
              <h3 className="text-sm font-bold text-[#F5F2EA]">Two-Factor Authentication (TOTP)</h3>
            </div>
            <p className="text-xs text-[#8E8B82] leading-relaxed">
              {status.enabled
                ? `Protected with time-based one-time passcodes (TOTP). Backup recovery codes remaining: ${status.remaining_recovery_codes} of 8.`
                : "Add an extra verification step at login using Google Authenticator, Microsoft Authenticator, or 1Password. Protects your dashboard even if your password is leaked."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {status.enabled ? (
              <>
                <button
                  type="button"
                  onClick={openRegenModal}
                  className="px-3.5 py-2 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Codes</span>
                </button>
                <button
                  type="button"
                  onClick={openDisableModal}
                  className="px-3.5 py-2 rounded-none bg-red-500/10 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-red-300 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Disable 2FA</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openSetupModal}
                className="px-4 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] text-xs font-bold font-mono transition flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Set Up 2FA Protection</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: SETUP 2FA (POST /api/auth/2fa/setup & enable)          */}
      {/* ============================================================== */}
      {showSetupModal && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            if (setupStep !== "codes") setShowSetupModal(false);
          }}
        >
          <div
            className="bg-[#0A0B10] border border-[#23242B] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-none shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#F5F2EA]">
                  {setupStep === "password" && "Authenticate to Begin 2FA Setup"}
                  {setupStep === "verify" && "Scan QR Code & Enter 6-Digit Token"}
                  {setupStep === "codes" && "Emergency 2FA Backup Recovery Codes"}
                </h3>
              </div>
              {setupStep !== "codes" && (
                <button
                  type="button"
                  onClick={() => setShowSetupModal(false)}
                  className="p-1 rounded-none hover:bg-[#12131A] text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Step 1: Admin Password */}
            {setupStep === "password" && (
              <form onSubmit={handleSetupPasswordSubmit} className="space-y-4 text-xs">
                <p className="text-[#B9B5A9] leading-relaxed">
                  Enter your current administrator password to generate your unique TOTP secret and QR code.
                </p>

                {setupError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-[#F5F2EA] mb-1.5 font-mono text-[11px]">ADMINISTRATOR PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showSetupPassword ? "text" : "password"}
                      required
                      autoFocus
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none px-3.5 py-2.5 text-[#F5F2EA] outline-none pr-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSetupPassword(!showSetupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
                    >
                      {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#23242B]">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="px-4 py-2 rounded-none bg-[#12131A] border border-[#23242B] text-[#B9B5A9] hover:text-[#F5F2EA] font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading}
                    className="px-4 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {setupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                    <span>Generate QR Code</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Scan QR & Enter 6-digit code */}
            {setupStep === "verify" && (
              <form onSubmit={handleConfirmEnable} className="space-y-4 text-xs">
                <p className="text-[#B9B5A9] leading-relaxed">
                  Scan this QR code with Google Authenticator, Microsoft Authenticator, or 1Password:
                </p>

                {setupData?.qr_code && (
                  <div className="flex justify-center p-3 bg-white w-fit mx-auto border border-[#23242B]">
                    <img
                      src={setupData.qr_code}
                      alt="2FA QR Code"
                      width={180}
                      height={180}
                      className="block"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-mono text-[#8E8B82] mb-1">OR ENTER SECRET MANUALLY</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={setupData?.manual_key || setupData?.secret || ""}
                      className="w-full bg-[#06070B] border border-[#23242B] rounded-none px-3 py-2 text-[#F59E0B] font-mono text-xs tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => copyToClipboard(setupData?.manual_key || setupData?.secret || "", setCopiedKey)}
                      className="px-3 py-2 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] font-mono text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {setupError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-[#F5F2EA] mb-1.5 font-mono text-[11px]">
                    VERIFICATION CODE FROM APP (6 DIGITS)
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none px-3.5 py-2.5 text-[#F5F2EA] text-center font-mono text-lg tracking-[0.3em] outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#23242B]">
                  <button
                    type="button"
                    onClick={() => setSetupStep("password")}
                    className="px-4 py-2 rounded-none bg-[#12131A] border border-[#23242B] text-[#B9B5A9] hover:text-[#F5F2EA] font-mono text-xs cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || setupCode.length < 6}
                    className="px-4 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {setupLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Verify & Activate 2FA</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Recovery Codes */}
            {setupStep === "codes" && setupRecoveryCodes && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Two-Factor Authentication is now enabled on your account!</span>
                </div>

                <p className="text-[#B9B5A9] leading-relaxed">
                  Store these 8 emergency recovery codes in a secure location. Each code can be used once to sign in if you lose access to your authenticator app.
                </p>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#06070B] border border-[#23242B]">
                  {setupRecoveryCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 bg-[#0A0B10] border border-[#23242B] text-center font-mono text-xs text-[#F5F2EA] tracking-wider select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(setupRecoveryCodes.join("\n"), setCopiedAllCodes)}
                    className="flex-1 py-2 px-3 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedAllCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAllCodes ? "All Codes Copied!" : "Copy All Codes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCodesAsFile(setupRecoveryCodes)}
                    className="flex-1 py-2 px-3 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.txt)</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#23242B] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="px-5 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold font-mono text-xs cursor-pointer"
                  >
                    Done & Return to Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DISABLE 2FA (POST /api/auth/2fa/disable)               */}
      {/* ============================================================== */}
      {showDisableModal && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowDisableModal(false)}
        >
          <div
            className="bg-[#0A0B10] border border-[#23242B] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-none shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-[#F5F2EA]">Disable Two-Factor Authentication</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDisableModal(false)}
                className="p-1 rounded-none hover:bg-[#12131A] text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#B9B5A9] leading-relaxed">
              Disabling 2FA lowers account protection. Secondary TOTP verification and backup recovery codes will be removed.
            </p>

            {disableError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{disableError}</span>
              </div>
            )}

            <form onSubmit={handleConfirmDisable} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-[#F5F2EA] mb-1 font-mono text-[11px]">ADMINISTRATOR PASSWORD</label>
                <div className="relative">
                  <input
                    type={showDisablePassword ? "text" : "password"}
                    required
                    autoFocus
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter password to confirm"
                    className="w-full bg-[#06070B] border border-[#23242B] focus:border-red-400 rounded-none px-3.5 py-2.5 text-[#F5F2EA] outline-none pr-10 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDisablePassword(!showDisablePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
                  >
                    {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#F5F2EA] mb-1 font-mono text-[11px]">
                  2FA OR RECOVERY CODE (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value)}
                  placeholder="Enter 6-digit app code or recovery code"
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none px-3.5 py-2.5 text-[#F5F2EA] outline-none font-mono text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#23242B]">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="px-4 py-2 rounded-none bg-[#12131A] border border-[#23242B] text-[#B9B5A9] hover:text-[#F5F2EA] font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableLoading || !disablePassword}
                  className="px-4 py-2 rounded-none bg-red-500/20 border border-red-500/40 hover:bg-red-500 hover:text-white text-red-300 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {disableLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                  <span>Confirm Disable 2FA</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REGENERATE CODES (POST /api/auth/2fa/regenerate-...)   */}
      {/* ============================================================== */}
      {showRegenModal && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            if (regenStep !== "codes") setShowRegenModal(false);
          }}
        >
          <div
            className="bg-[#0A0B10] border border-[#23242B] w-full max-w-md max-h-[90vh] overflow-y-auto rounded-none shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#23242B] pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#F5F2EA]">
                  {regenStep === "password" ? "Regenerate Recovery Codes" : "New Backup Recovery Codes"}
                </h3>
              </div>
              {regenStep !== "codes" && (
                <button
                  type="button"
                  onClick={() => setShowRegenModal(false)}
                  className="p-1 rounded-none hover:bg-[#12131A] text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {regenStep === "password" && (
              <form onSubmit={handleConfirmRegenerate} className="space-y-4 text-xs">
                <p className="text-[#B9B5A9] leading-relaxed">
                  Generating new recovery codes will immediately invalidate all existing unused backup codes. Confirm your password to proceed.
                </p>

                {regenError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{regenError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-medium text-[#F5F2EA] mb-1 font-mono text-[11px]">ADMINISTRATOR PASSWORD</label>
                  <div className="relative">
                    <input
                      type={showRegenPassword ? "text" : "password"}
                      required
                      autoFocus
                      value={regenPassword}
                      onChange={(e) => setRegenPassword(e.target.value)}
                      placeholder="Enter administrator password"
                      className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none px-3.5 py-2.5 text-[#F5F2EA] outline-none pr-10 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegenPassword(!showRegenPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8B82] hover:text-[#F5F2EA] cursor-pointer"
                    >
                      {showRegenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#23242B]">
                  <button
                    type="button"
                    onClick={() => setShowRegenModal(false)}
                    className="px-4 py-2 rounded-none bg-[#12131A] border border-[#23242B] text-[#B9B5A9] hover:text-[#F5F2EA] font-mono text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={regenLoading || !regenPassword}
                    className="px-4 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {regenLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Regenerate Codes</span>
                  </button>
                </div>
              </form>
            )}

            {regenStep === "codes" && newRegenCodes && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>8 new backup recovery codes generated. Old codes are invalid.</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#06070B] border border-[#23242B]">
                  {newRegenCodes.map((code, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1.5 bg-[#0A0B10] border border-[#23242B] text-center font-mono text-xs text-[#F5F2EA] tracking-wider select-all"
                    >
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(newRegenCodes.join("\n"), setCopiedRegenCodes)}
                    className="flex-1 py-2 px-3 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {copiedRegenCodes ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRegenCodes ? "All Codes Copied!" : "Copy All Codes"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadCodesAsFile(newRegenCodes)}
                    className="flex-1 py-2 px-3 rounded-none bg-[#12131A] border border-[#23242B] hover:border-[#F59E0B] text-[#F5F2EA] hover:text-[#F59E0B] font-mono text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download (.txt)</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#23242B] flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRegenModal(false)}
                    className="px-5 py-2 rounded-none bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold font-mono text-xs cursor-pointer"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
