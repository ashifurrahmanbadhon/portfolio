"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";
import SpotlightCard from "./SpotlightCard";
import { useAuth } from "@/context/AuthContext";

export default function CentralLoginPanel() {
  const router = useRouter();
  const { login, loginWithTotp } = useAuth();

  // Active door: 'password' | 'authenticator'
  const [door, setDoor] = useState("password");

  // Password door state
  const [identifier] = useState("admin");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Authenticator door state
  const [code, setCode] = useState("");
  const [codeSubmitting, setCodeSubmitting] = useState(false);
  const [codeError, setCodeError] = useState("");
  const codeInputRef = useRef(null);

  // Focus code input when switching to authenticator door
  useEffect(() => {
    if (door === "authenticator" && codeInputRef.current) {
      setTimeout(() => {
        codeInputRef.current?.focus();
      }, 100);
    }
  }, [door]);

  // Handle Password Door Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSubmitting(true);

    const res = await login(identifier, password.trim(), remember);

    if (!res.success) {
      setPasswordError(res.error || "Invalid username or password.");
      setPasswordSubmitting(false);
    } else {
      setPasswordSubmitting(false);
      router.push("/admin");
    }
  };

  // Handle Authenticator Door Submit
  const handleAuthenticatorSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setCodeError("Please enter your 6-digit code or recovery code.");
      return;
    }

    setCodeError("");
    setCodeSubmitting(true);

    const res = await loginWithTotp(code.trim());

    if (!res.success) {
      setCodeError(res.error || "Invalid verification code.");
      setCodeSubmitting(false);
    } else {
      setCodeSubmitting(false);
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-50 bg-[#06070B] overflow-hidden admin-shell">
      {/* Background ambient warm glowing mesh */}
      <div className="absolute w-96 h-96 bg-[#F59E0B]/5 blur-[140px] rounded-full pointer-events-none -top-24 -left-24"></div>
      <div className="absolute w-80 h-80 bg-[#F59E0B]/5 blur-[120px] rounded-full pointer-events-none -bottom-20 -right-20"></div>

      {/* Main Login Console Card with SpotlightCard effect */}
      <SpotlightCard
        className="animate-fade-up bg-[#0A0B10] backdrop-blur-md border border-[#23242B] w-full max-w-sm p-6 sm:p-8 rounded-none shadow-2xl relative z-10 stat-box"
        contentClassName="space-y-6"
      >
        {/* Branding */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <AnimatedLogo size={44} showText={false} />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-[#F5F2EA] font-sans">
              ADMIN CONSOLE
            </h1>
            <p className="text-[11px] text-[#8E8B82] font-mono mt-0.5">
              Portfolio Content Management System
            </p>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOOR SWITCH: [ Password ] [ Authenticator ] (Segmented Toggle) */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 p-1 bg-[#06070B] border border-[#23242B] rounded-none">
          <button
            type="button"
            onClick={() => {
              setDoor("password");
              setPasswordError("");
            }}
            className={`py-2 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
              door === "password"
                ? "bg-[#12131A] text-[#F59E0B] border border-[#F59E0B]/40 shadow-sm"
                : "text-[#8E8B82] hover:text-[#F5F2EA] border border-transparent"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDoor("authenticator");
              setCodeError("");
            }}
            className={`py-2 text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 rounded-none cursor-pointer ${
              door === "authenticator"
                ? "bg-[#12131A] text-[#F59E0B] border border-[#F59E0B]/40 shadow-sm"
                : "text-[#8E8B82] hover:text-[#F5F2EA] border border-transparent"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticator</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* DOOR 1: PASSWORD LOGIN                                         */}
        {/* ============================================================== */}
        {door === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-[11px] font-mono text-[#8E8B82] mb-1.5 uppercase">
                Admin Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#8E8B82]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoFocus
                  autoComplete="current-password"
                  placeholder="Enter administrator password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none pl-9 pr-10 py-2.5 text-xs text-[#F5F2EA] placeholder-[#8E8B82]/50 outline-none transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8E8B82] hover:text-[#F5F2EA] transition cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me on Password Door */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#8E8B82] hover:text-[#B9B5A9] select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-none bg-[#06070B] border-[#23242B] text-[#F59E0B] focus:ring-0 cursor-pointer accent-[#F59E0B]"
                />
                <span className="font-mono text-[11px]">Remember this session</span>
              </label>
            </div>

            {/* Error Banner */}
            {passwordError && (
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 p-3 rounded-none font-mono leading-relaxed flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1">{passwordError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={passwordSubmitting}
              className="w-full py-2.5 rounded-none font-bold font-mono bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] transition duration-150 flex items-center justify-center gap-2 text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-75 disabled:pointer-events-none"
            >
              {passwordSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Password...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In with Password</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ============================================================== */}
        {/* DOOR 2: AUTHENTICATOR LOGIN (TOTP OR RECOVERY CODE)            */}
        {/* ============================================================== */}
        {door === "authenticator" && (
          <form onSubmit={handleAuthenticatorSubmit} className="space-y-4 animate-fade-in">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono text-[#8E8B82] uppercase">
                6-Digit Token or Recovery Code
              </label>
              <div className="relative">
                <input
                  ref={codeInputRef}
                  type="text"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.trim().toUpperCase());
                    if (codeError) setCodeError("");
                  }}
                  className="w-full bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] rounded-none px-4 py-3 text-center text-lg tracking-[0.25em] text-[#F5F2EA] font-mono font-bold outline-none transition placeholder:tracking-normal placeholder:text-[#8E8B82]/40"
                />
              </div>
              <p className="text-[10px] text-[#8E8B82] font-mono leading-relaxed pt-1">
                Enter code from Google Authenticator, Microsoft Authenticator, or an emergency recovery code (e.g. XXXXX-XXXXX).
              </p>
            </div>

            {/* Error Banner */}
            {codeError && (
              <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/25 p-3 rounded-none font-mono leading-relaxed flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="flex-1">{codeError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={codeSubmitting || !code.trim()}
              className="w-full py-2.5 rounded-none font-bold font-mono bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] transition duration-150 flex items-center justify-center gap-2 text-xs shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {codeSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verify & Sign In</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Public Link & Footer */}
        <div className="pt-4 border-t border-[#23242B] flex flex-col items-center gap-2 text-center">
          <Link
            href="/"
            className="text-xs text-[#8E8B82] hover:text-[#F59E0B] transition inline-flex items-center gap-1.5 font-mono cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
          <span className="text-[10px] text-[#8E8B82] font-mono">
            🔒 Independent Dual-Door Session Protection
          </span>
        </div>
      </SpotlightCard>
    </div>
  );
}
