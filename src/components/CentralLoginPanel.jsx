"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  MailCheck,
  Send,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Smartphone,
  KeyRound,
  ShieldAlert,
  RotateCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

export default function CentralLoginPanel() {
  const router = useRouter();
  const { login, verify2FA, sendSmsOtp } = useAuth();

  // Active view: 'login' | '2fa' | 'forgot' | 'reset'
  const [view, setView] = useState("login");

  // Login form state
  const [identifier, setIdentifier] = useState("ashifur.badhon@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // 2FA Challenge state
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("******7284");
  const [twoFactorMethod, setTwoFactorMethod] = useState("totp"); // 'totp' | 'recovery_code' | 'sms_otp'
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorSubmitting, setTwoFactorSubmitting] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState("");
  const [smsSending, setSmsSending] = useState(false);
  const [smsMessage, setSmsMessage] = useState("");
  const [smsCooldown, setSmsCooldown] = useState(0);
  const [showFallbackMenu, setShowFallbackMenu] = useState(false);
  const codeInputRef = useRef(null);

  // SMS cooldown timer
  useEffect(() => {
    let interval = null;
    if (smsCooldown > 0) {
      interval = setInterval(() => {
        setSmsCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [smsCooldown]);

  // Focus input when 2FA view opens or method changes
  useEffect(() => {
    if (view === "2fa" && codeInputRef.current) {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    }
  }, [view, twoFactorMethod]);

  // Forgot password form state
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotStatus, setForgotStatus] = useState(null);

  // Reset password form state
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setSubmitting(true);

    const res = await login(identifier.trim(), password.trim(), remember);

    if (res.requires_2fa) {
      setSubmitting(false);
      setTwoFactorToken(res.two_factor_token);
      setMaskedPhone(res.masked_phone || "******7284");
      setTwoFactorMethod("totp");
      setTwoFactorCode("");
      setTwoFactorError("");
      setSmsMessage("");
      setShowFallbackMenu(false);
      setView("2fa");
      return;
    }

    if (!res.success) {
      setLoginError(res.error || "Invalid username/email or password.");
      setSubmitting(false);
    } else {
      setSubmitting(false);
      router.push("/admin");
    }
  };

  // Handle 2FA Verification Submit
  const handleVerify2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setTwoFactorError("Please enter the verification code.");
      return;
    }

    setTwoFactorError("");
    setTwoFactorSubmitting(true);

    const res = await verify2FA(twoFactorToken, twoFactorCode.trim(), twoFactorMethod);

    if (!res.success) {
      setTwoFactorError(res.error || "Verification failed. Please try again.");
      setTwoFactorSubmitting(false);
    } else {
      setTwoFactorSubmitting(false);
      router.push("/admin");
    }
  };

  // Handle Send SMS OTP Fallback
  const handleSendSmsOtp = async () => {
    if (smsCooldown > 0 || smsSending) return;

    setSmsSending(true);
    setTwoFactorError("");
    setSmsMessage("");

    const res = await sendSmsOtp(twoFactorToken);

    if (res.success) {
      setTwoFactorMethod("sms_otp");
      setTwoFactorCode("");
      setSmsMessage(res.message || `Code sent to ${maskedPhone}. Enter the 6 digits.`);
      setSmsCooldown(60);
      setShowFallbackMenu(false);
    } else {
      setTwoFactorError(res.error || "Could not dispatch SMS. Try again later.");
    }

    setSmsSending(false);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotStatus(null);
    setForgotSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setForgotStatus({
          type: "success",
          msg: "Password reset instructions issued!",
          token: data.reset_token || "Token generated and active for 1 hour.",
        });
      } else {
        setForgotStatus({
          type: "error",
          msg: data.error || "Failed to process recovery request.",
        });
      }
    } catch (err) {
      setForgotStatus({
        type: "error",
        msg: "Server connection error. Please verify the Python server is running.",
      });
    } finally {
      setForgotSubmitting(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setResetStatus(null);

    if (newPassword !== confirmPassword) {
      setResetStatus({
        type: "error",
        msg: "New password and confirmation password do not match.",
      });
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken.trim(),
          new_password: newPassword.trim(),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setResetStatus({
          type: "success",
          msg: "Password reset successfully! You can now log in.",
        });
        setTimeout(() => {
          setView("login");
          setPassword("");
        }, 1800);
      } else {
        setResetStatus({
          type: "error",
          msg: data.error || "Invalid or expired recovery token.",
        });
      }
    } catch (err) {
      setResetStatus({
        type: "error",
        msg: "Server connection error. Please try again.",
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-50 bg-[#0A0D12] overflow-hidden">
      {/* Background dynamic ambient glowing meshes */}
      <div className="absolute w-96 h-96 bg-[#10B981]/10 blur-[130px] rounded-full pointer-events-none -top-24 -left-24"></div>
      <div className="absolute w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -bottom-20 -right-20"></div>

      {/* Main Card */}
      <div className="animate-fade-up bg-[#111622]/95 backdrop-blur-md border border-[#1E2638] w-full max-w-sm p-7 sm:p-8 rounded-2xl shadow-2xl relative z-10 space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center mb-1">
            <AnimatedLogo size={46} showText={false} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161C2A] border border-[#1E2638] text-[11px] font-mono font-bold text-[#10B981] tracking-wider uppercase shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Ashifur Rahman
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">CENTRAL CMS</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">“One Login. Every Website.”</p>
          </div>
        </div>

        {/* ========================================= */}
        {/* VIEW 1: SIGN IN */}
        {/* ========================================= */}
        {view === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email / Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="ashifur.badhon@gmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-[#0A0D12] border-[#1E2638] text-[#10B981] focus:ring-0 cursor-pointer accent-emerald-500"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setView("forgot")}
                className="text-[#10B981] hover:underline text-[11px] transition font-mono"
              >
                Forgot Password?
              </button>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 p-3 rounded-xl font-mono leading-relaxed flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1">{loginError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl font-bold bg-[#10B981] hover:bg-[#059669] text-black transition duration-150 flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-500/20 interactive-btn cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================= */}
        {/* VIEW: TWO-FACTOR AUTHENTICATION (2FA)     */}
        {/* ========================================= */}
        {view === "2fa" && (
          <div className="space-y-4 animate-fade-up">
            {/* Header Badge & Title */}
            <div className="text-center space-y-1.5 pb-1">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-1 shadow-inner">
                {twoFactorMethod === "totp" && <ShieldCheck className="w-6 h-6 animate-pulse" />}
                {twoFactorMethod === "sms_otp" && <Smartphone className="w-6 h-6 text-sky-400 animate-pulse" />}
                {twoFactorMethod === "recovery_code" && <KeyRound className="w-6 h-6 text-amber-400" />}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Two-Factor Authentication</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {twoFactorMethod === "totp" && "Enter the 6-digit code from your authenticator app."}
                {twoFactorMethod === "sms_otp" && `Enter the 6-digit verification code sent to ${maskedPhone}.`}
                {twoFactorMethod === "recovery_code" && "Enter one of your 8-character emergency backup recovery codes."}
              </p>
            </div>

            <form onSubmit={handleVerify2FASubmit} className="space-y-3.5">
              {/* Code Input */}
              <div>
                <div className="relative">
                  <input
                    ref={codeInputRef}
                    type="text"
                    required
                    autoFocus
                    autoComplete="one-time-code"
                    inputMode={twoFactorMethod === "recovery_code" ? "text" : "numeric"}
                    maxLength={twoFactorMethod === "recovery_code" ? 12 : 6}
                    placeholder={twoFactorMethod === "recovery_code" ? "ABCD-1234" : "000000"}
                    value={twoFactorCode}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (twoFactorMethod === "recovery_code") {
                        setTwoFactorCode(val.toUpperCase());
                      } else {
                        setTwoFactorCode(val.replace(/\D/g, "").slice(0, 6));
                      }
                      if (twoFactorError) setTwoFactorError("");
                    }}
                    className={`w-full bg-[#0A0D12] border ${
                      twoFactorError ? "border-rose-500/60 focus:border-rose-500" : "border-[#1E2638] focus:border-[#10B981]"
                    } rounded-xl px-4 py-3 text-center text-xl tracking-[0.35em] text-white font-mono placeholder:tracking-normal placeholder:text-slate-600 outline-none transition shadow-inner font-bold`}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1 font-mono">
                  <span>
                    {twoFactorMethod === "recovery_code" ? "Single-use recovery format" : "Time-based one-time code"}
                  </span>
                  <span>
                    {twoFactorCode.length}/{twoFactorMethod === "recovery_code" ? "9" : "6"}
                  </span>
                </div>
              </div>

              {/* Success SMS banner */}
              {smsMessage && (
                <div className="text-xs text-sky-300 bg-sky-500/10 border border-sky-500/30 p-2.5 rounded-xl font-mono leading-relaxed flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="flex-1">{smsMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {twoFactorError && (
                <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl font-mono leading-relaxed flex items-start gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="flex-1">{twoFactorError}</span>
                </div>
              )}

              {/* Verify Button */}
              <button
                type="submit"
                disabled={twoFactorSubmitting || !twoFactorCode.trim()}
                className="w-full py-2.5 rounded-xl font-bold bg-[#10B981] hover:bg-[#059669] text-black transition duration-150 flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-500/20 interactive-btn cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                {twoFactorSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>

              {/* Fallback Drawer Trigger */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowFallbackMenu(!showFallbackMenu)}
                  className="w-full text-center text-xs text-slate-400 hover:text-emerald-400 transition flex items-center justify-center gap-1 font-medium py-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>Can’t access your authenticator?</span>
                  {showFallbackMenu ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {/* Collapsible Fallback Options */}
                {showFallbackMenu && (
                  <div className="mt-2.5 p-3 rounded-xl bg-[#0A0D12] border border-[#1E2638] space-y-2 animate-fadeIn">
                    <p className="text-[11px] text-slate-400 mb-2">Alternative verification options:</p>

                    {/* Option A: Send OTP to registered phone */}
                    <button
                      type="button"
                      disabled={smsSending || smsCooldown > 0}
                      onClick={handleSendSmsOtp}
                      className="w-full text-left p-2.5 rounded-lg bg-[#111622] hover:bg-[#161C2A] border border-[#1E2638] hover:border-sky-500/40 transition flex items-center justify-between group disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Smartphone className="w-4 h-4 text-sky-400 group-hover:scale-110 transition" />
                        <div>
                          <div className="text-xs font-semibold text-white">Send OTP to registered phone</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Sent to: <span className="text-sky-300 font-bold">{maskedPhone}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-sky-400 font-mono font-medium">
                        {smsSending ? "Sending..." : smsCooldown > 0 ? `${smsCooldown}s` : "Send SMS"}
                      </span>
                    </button>

                    {/* Option B: Recovery Code */}
                    {twoFactorMethod !== "recovery_code" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorMethod("recovery_code");
                          setTwoFactorCode("");
                          setTwoFactorError("");
                          setShowFallbackMenu(false);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-[#111622] hover:bg-[#161C2A] border border-[#1E2638] hover:border-amber-500/40 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <KeyRound className="w-4 h-4 text-amber-400 group-hover:scale-110 transition" />
                          <div>
                            <div className="text-xs font-semibold text-white">Use a recovery code</div>
                            <div className="text-[10px] text-slate-400 font-mono">Single-use emergency key</div>
                          </div>
                        </div>
                        <span className="text-[11px] text-amber-400 font-mono font-medium">Use Code</span>
                      </button>
                    ) : null}

                    {/* Option C: Back to Authenticator App */}
                    {twoFactorMethod !== "totp" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTwoFactorMethod("totp");
                          setTwoFactorCode("");
                          setTwoFactorError("");
                          setShowFallbackMenu(false);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-[#111622] hover:bg-[#161C2A] border border-[#1E2638] hover:border-emerald-500/40 transition flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
                          <div>
                            <div className="text-xs font-semibold text-white">Use Authenticator App</div>
                            <div className="text-[10px] text-slate-400 font-mono">Google, Microsoft, Authy</div>
                          </div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-mono font-medium">Select</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Back to normal login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setView("login");
                    setTwoFactorCode("");
                    setTwoFactorError("");
                    setSmsMessage("");
                    setShowFallbackMenu(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white transition font-mono flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 2: FORGOT PASSWORD */}
        {/* ========================================= */}
        {view === "forgot" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-left border-b border-[#1E2638] pb-2.5">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <MailCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Reset Password</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Enter your email or username. A password reset token will be issued for your account.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email or Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="admin@ashifurrahman.com"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white outline-none transition font-mono"
                  />
                </div>
              </div>

              {forgotStatus && forgotStatus.type === "success" && (
                <div className="text-xs p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2.5 font-sans animate-pop">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Reset instructions generated!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    A recovery token was created for <strong>{forgotIdentifier}</strong>:
                  </p>
                  <div className="bg-[#0A0D12] p-2 rounded-lg border border-[#1E2638] text-[11px] select-all break-all text-white font-mono">
                    {forgotStatus.token}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetToken(forgotStatus.token);
                      setView("reset");
                    }}
                    className="w-full mt-2 py-2 bg-[#10B981] hover:bg-[#059669] text-black font-bold text-xs rounded-xl transition interactive-btn"
                  >
                    Set New Password Now →
                  </button>
                </div>
              )}

              {forgotStatus && forgotStatus.type === "error" && (
                <div className="text-xs p-3 rounded-xl font-mono leading-relaxed bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-shake">
                  {forgotStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={forgotSubmitting}
                className="w-full py-2.5 rounded-xl font-semibold bg-[#161C2A] hover:bg-[#10B981] text-[#10B981] hover:text-black border border-emerald-500/30 transition text-xs flex items-center justify-center gap-1.5 interactive-btn disabled:opacity-75"
              >
                {forgotSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setView("reset")}
                  className="text-cyan-400 hover:underline text-[11px] font-mono"
                >
                  Have a reset token? Enter here →
                </button>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-slate-400 hover:text-white text-[11px] font-mono"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================= */}
        {/* VIEW 3: RESET PASSWORD */}
        {/* ========================================= */}
        {view === "reset" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-left border-b border-[#1E2638] pb-2.5">
              <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Set New Password</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                Paste the recovery token and choose your new administrator password.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  placeholder="Paste token here"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl px-3 py-2 text-xs font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  New Password (Min 8 chars)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl pl-3 pr-9 py-2 text-xs text-white outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0A0D12] border border-[#1E2638] focus:border-[#10B981] rounded-xl px-3 py-2 text-xs text-white outline-none font-mono"
                />
              </div>

              {resetStatus && (
                <div
                  className={`text-xs p-2.5 rounded-xl font-mono leading-relaxed ${
                    resetStatus.type === "success"
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                  }`}
                >
                  {resetStatus.msg}
                </div>
              )}

              <button
                type="submit"
                disabled={resetSubmitting}
                className="w-full py-2.5 rounded-xl font-bold bg-[#10B981] text-black hover:bg-[#059669] transition text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {resetSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Minimal Public Link */}
        <div className="pt-4 border-t border-[#1E2638] flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-[#10B981] transition inline-flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
          <span className="text-[10px] text-slate-500 font-mono">
            🔒 Secure Multi-Website Session Protection
          </span>
        </div>
      </div>
    </div>
  );
}
