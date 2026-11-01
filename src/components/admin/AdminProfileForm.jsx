"use client";

import { useState, useEffect } from "react";
import { User, Mail, Key, Eye, EyeOff, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/Toast";

export default function AdminProfileForm() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.full_name || "Ashifur Rahman");
  const [email, setEmail] = useState(user?.email || "ashifur.badhon@gmail.com");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.full_name) setName(user.full_name);
      if (user.email) setEmail(user.email);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (newPw) {
      if (newPw.length < 6) {
        setFormError("New password must be at least 6 characters.");
        return;
      }
      if (newPw !== confirmPw) {
        setFormError("New password and confirm password do not match.");
        return;
      }
    }

    setSaving(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") || "" : "";
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          full_name: name.trim() || "Ashifur Rahman",
          email: email.trim(),
          current_password: currentPw || undefined,
          new_password: newPw || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update profile.");
      }

      if (updateUser) {
        updateUser({
          full_name: name.trim() || "Ashifur Rahman",
          email: email.trim(),
        });
      }

      if (newPw) {
        try {
          localStorage.setItem("cms_admin_pw", newPw);
        } catch (_) {}
      }

      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");

      if (showToast) {
        showToast(
          newPw
            ? "Super Admin profile and password updated successfully!"
            : "Super Admin profile details saved successfully!",
          "success"
        );
      }
    } catch (err) {
      setFormError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stat-box bg-[#0A0B10] border border-[#23242B] p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#23242B]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-none bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B]">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-[#F5F2EA]">Profile & Password</h2>
              <span className="stat-box text-[10px] font-mono px-2 py-0.5 bg-[#12131A] text-[#8E8B82] border border-[#23242B]">
                ADMIN CREDENTIALS
              </span>
            </div>
            <p className="text-xs text-[#B9B5A9] max-w-xl leading-relaxed mt-1">
              Manage administrator email address and update sign-in credentials.
            </p>
          </div>
        </div>
      </div>

      {formError && (
        <div className="stat-box p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Details Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase">
              <User className="w-3.5 h-3.5 text-[#8E8B82]" />
              <span>Admin Full Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="stat-box w-full px-3.5 py-2.5 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition rounded-none"
              placeholder="Ashifur Rahman"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase">
              <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Super Admin Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="stat-box w-full px-3.5 py-2.5 bg-[#06070B] border border-[#23242B] focus:border-[#F59E0B] text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono rounded-none"
              placeholder="ashifur.badhon@gmail.com"
              required
            />
          </div>
        </div>

        {/* Password Fields Section */}
        <div className="stat-box p-5 bg-[#06070B] border border-[#23242B] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#23242B]">
            <label className="text-[11px] font-mono text-[#8E8B82] flex items-center gap-1.5 uppercase font-semibold">
              <Key className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Change Administrator Password</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[10px] text-[#8E8B82] hover:text-[#F5F2EA] font-mono flex items-center gap-1 cursor-pointer transition"
            >
              {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPassword ? "Hide" : "Show"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                className="stat-box w-full px-3.5 py-2.5 bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono rounded-none"
                placeholder="Current Password (if changing)"
              />
            </div>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="stat-box w-full px-3.5 py-2.5 bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono rounded-none"
                placeholder="New Password (min. 6 chars)"
              />
            </div>
            <div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className="stat-box w-full px-3.5 py-2.5 bg-[#0A0B10] border border-[#23242B] focus:border-[#F59E0B] text-xs text-[#F5F2EA] placeholder-[#555] outline-none transition font-mono rounded-none"
                placeholder="Confirm New Password"
              />
            </div>
          </div>

          <p className="text-[10px] text-[#8E8B82] font-mono">
            Leave password fields blank if you only want to update name or email.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="stat-box px-5 py-2.5 bg-[#F59E0B] hover:bg-[#FBBF24] text-[#06070B] font-bold text-xs font-mono transition cursor-pointer flex items-center gap-1.5 rounded-none disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Credentials...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

