"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  UserPlus,
  Lock,
  Globe,
  Settings,
  Sliders,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Edit2,
  Trash2,
  X,
  Check,
  Camera,
  Upload,
  User,
} from "lucide-react";
import SpotlightCard from "@/components/SpotlightCard";
import { useToast } from "@/components/Toast";

const INITIAL_USERS = [
  {
    id: "usr-1",
    name: "Ashifur Rahman",
    title: "Electrical & Electronic Engineer",
    email: "ashifur.badhon@gmail.com",
    role: "Super Admin",
    access: ["All Websites", "Portfolio", "ToolGhor Platform"],
    status: "Active",
    avatar: "/ashifur.jpeg",
  },
  {
    id: "usr-2",
    name: "Editor Assistant",
    title: "Content & Web Editor",
    email: "editor@toolghor.com",
    role: "Editor",
    access: ["ToolGhor Platform"],
    status: "Active",
    avatar: null,
  },
];

const ROLES_INFO = [
  {
    role: "Super Admin",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    desc: "Complete, unrestricted root control over every connected website, database, API secrets, user roles, and security configurations.",
    powers: [
      "Access all current and future websites",
      "Assign and revoke user roles",
      "Full API keys and production credentials access",
      "Modify server-level security settings",
    ],
  },
  {
    role: "Admin",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    desc: "Operational administration across assigned websites with publishing, category editing, and content approval permissions.",
    powers: [
      "Publish and modify content on assigned sites",
      "Create and delete tools/categories",
      "View system ping metrics and analytics",
      "Limited access to settings",
    ],
  },
  {
    role: "Editor",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    desc: "Focused content creator role restricted strictly to managing specific tools, descriptions, and articles without deleting system configs.",
    powers: [
      "Add and edit tools in ToolGhor",
      "Update portfolio bio, skills, and projects",
      "Cannot access API keys or system security",
      "Restricted strictly to assigned websites",
    ],
  },
];

export default function RolesPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState(INITIAL_USERS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "Editor",
    siteAccess: "ToolGhor Platform",
    status: "Active",
    avatar: "",
  });

  // Modal scroll-lock
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen]);

  // Open modal for new user
  const handleOpenAdd = () => {
    setEditingUserId(null);
    setUserForm({
      name: "",
      email: "",
      role: "Editor",
      siteAccess: "ToolGhor Platform",
      status: "Active",
      avatar: "",
    });
    setModalOpen(true);
  };

  // Open modal for editing user
  const handleOpenEdit = (user) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      siteAccess: user.access[0] || "ToolGhor Platform",
      status: user.status || "Active",
      avatar: user.avatar || "",
    });
    setModalOpen(true);
  };

  // Delete user
  const handleDeleteUser = (userId) => {
    const target = users.find((u) => u.id === userId);
    if (confirm(`Are you sure you want to remove access for "${target?.name || "this user"}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (showToast) {
        showToast(`Revoked access for "${target?.name || "User"}"`, "info");
      }
    }
  };

  // Upload photo handler for user
  const handleUserPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      if (showToast) showToast("Photo size must be less than 5MB", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setUserForm((prev) => ({ ...prev, avatar: dataUrl }));
      if (showToast) showToast("User photo uploaded successfully!", "info");
    };
    reader.readAsDataURL(file);
  };

  // Submit (Add or Edit)
  const handleSubmitUser = (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email) return;

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? {
                ...u,
                name: userForm.name,
                email: userForm.email,
                role: userForm.role,
                access: userForm.siteAccess === "All Websites"
                  ? ["All Websites", "Portfolio", "ToolGhor Platform"]
                  : [userForm.siteAccess],
                status: userForm.status,
                avatar: userForm.avatar || null,
              }
            : u
        )
      );
      if (showToast) {
        showToast(`Updated permissions for "${userForm.name}"`, "success");
      }
    } else {
      setUsers((prev) => [
        ...prev,
        {
          id: "usr-" + Date.now(),
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
          access: userForm.siteAccess === "All Websites"
            ? ["All Websites", "Portfolio", "ToolGhor Platform"]
            : [userForm.siteAccess],
          status: userForm.status,
          avatar: userForm.avatar || null,
        },
      ]);
      if (showToast) {
        showToast(`Granted access to "${userForm.name}"`, "success");
      }
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1E2638]">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage granular website permissions, user accounts, and administrative authority across connected sites.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs font-mono interactive-btn cursor-pointer shadow-lg shadow-purple-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Grant Website Access</span>
        </button>
      </div>

      {/* Role Definitions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES_INFO.map((r, i) => (
          <SpotlightCard
            key={i}
            spotlightColor={
              r.role === "Super Admin"
                ? "rgba(168, 85, 247, 0.12)"
                : r.role === "Admin"
                ? "rgba(59, 130, 246, 0.12)"
                : "rgba(16, 185, 129, 0.12)"
            }
            borderColor={
              r.role === "Super Admin"
                ? "rgba(168, 85, 247, 0.25)"
                : r.role === "Admin"
                ? "rgba(59, 130, 246, 0.25)"
                : "rgba(16, 185, 129, 0.25)"
            }
            className="p-5 flex flex-col justify-between space-y-4 interactive-card group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${r.badge}`}>
                  {r.role}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{r.role} Authority</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{r.desc}</p>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block">
                  Permissions Included:
                </span>
                {r.powers.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E2638] text-[11px] font-mono text-slate-400">
              Assigned users: <strong className="text-white">{users.filter((u) => u.role === r.role).length}</strong>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Authorized Users & Website Access Table */}
      <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Users & Website Access Directory</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Total Authorized: <strong className="text-white">{users.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1E2638] text-slate-400">
                <th className="pb-3 font-semibold">USER NAME</th>
                <th className="pb-3 font-semibold">EMAIL</th>
                <th className="pb-3 font-semibold">ASSIGNED ROLE</th>
                <th className="pb-3 font-semibold">WEBSITE ACCESS</th>
                <th className="pb-3 font-semibold">STATUS</th>
                <th className="pb-3 font-semibold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2638]/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#111622]/50 transition-colors">
                  <td className="py-3.5 font-bold text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl overflow-hidden bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>
                            {u.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono truncate">
                          {u.title || (u.role === "Super Admin" ? "Root Administrator" : "Assigned Staff")}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-400">{u.email}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] ${
                        u.role === "Super Admin"
                          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                          : u.role === "Admin"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {u.access.map((acc, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-[#161C2A] text-slate-300 text-[10px] border border-[#1E2638]">
                          {acc}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse"></span>
                      <span>{u.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 rounded-lg bg-[#111622] hover:bg-[#161E30] text-slate-400 hover:text-white border border-[#1E2638] transition cursor-pointer interactive-btn"
                        title="Edit user access"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-300" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-[#111622] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#1E2638] transition cursor-pointer interactive-btn"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Policies Box */}
      <div className="p-5 rounded-2xl bg-[#0B0F17] border border-[#1E2638] space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span>Security & Session Enforcement</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Sessions are authenticated via JWT bearer tokens and enforced per HTTP request. Super Admins can revoke access instantaneously.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {["Enforce 2-Factor Authentication", "Session Auto-Logout (24h)", "IP Whitelisting & CORS Policy"].map((item, idx) => (
            <Link
              key={idx}
              href={`/settings?tab=${item.toLowerCase().replace(/[\s/]+/g, "-")}`}
              className="p-3.5 rounded-xl bg-[#111622] hover:bg-[#161E30] border border-[#1E2638] text-xs font-mono text-slate-300 hover:text-white transition flex items-center justify-between interactive-btn"
            >
              <span>{item}</span>
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </Link>
          ))}
        </div>
      </div>

      {/* Modal: Add or Edit User */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto my-auto bg-[#0E131F] border border-[#1E2638] rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#1E2638]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingUserId ? "Edit User Access & Role" : "Grant Website Access"}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editingUserId ? "Modify access permissions for this user" : "Authorize team member to access websites"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-[#161E30] cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="space-y-4">
              {/* User Photo Upload Section */}
              <div className="p-3.5 rounded-xl bg-[#111622] border border-[#1E2638] flex items-center gap-3.5">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-purple-500/40 bg-[#141A29] flex items-center justify-center text-purple-300 font-bold text-sm relative shadow-md">
                    {userForm.avatar ? (
                      <img src={userForm.avatar} alt={userForm.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-slate-400" />
                    )}
                    <label
                      htmlFor="role-user-photo"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition text-white"
                      title="Upload user photo"
                    >
                      <Camera className="w-4 h-4 text-purple-300 mb-0.5" />
                      <span className="text-[8px] font-mono">Upload</span>
                    </label>
                  </div>
                  <input
                    id="role-user-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleUserPhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-purple-400" />
                      <span>User Profile Photo</span>
                    </label>
                    {userForm.avatar && (
                      <button
                        type="button"
                        onClick={() => setUserForm((prev) => ({ ...prev, avatar: "" }))}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-mono cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Attach a photo for this team member to display across directory & security logs.
                  </p>
                  <label
                    htmlFor="role-user-photo"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono cursor-pointer transition"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{userForm.avatar ? "Change Photo" : "Upload Photo"}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">User Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#141A29] border border-[#1E2638] rounded-xl text-xs text-white placeholder-slate-500 focus:border-purple-500/50 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#141A29] border border-[#1E2638] rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:border-purple-500/50 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Assigned Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#141A29] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-purple-500/50 outline-none transition cursor-pointer"
                  >
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Account Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#141A29] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-purple-500/50 outline-none transition cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Website Access Scope</label>
                <select
                  value={userForm.siteAccess}
                  onChange={(e) => setUserForm({ ...userForm, siteAccess: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#141A29] border border-[#1E2638] rounded-xl text-xs text-white font-mono focus:border-purple-500/50 outline-none transition cursor-pointer"
                >
                  <option value="ToolGhor Platform">ToolGhor Platform</option>
                  <option value="Portfolio">Portfolio Only</option>
                  <option value="All Websites">All Websites</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#1E2638]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141A29] hover:bg-[#1A2234] text-slate-300 hover:text-white text-xs font-mono interactive-btn cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-xl text-xs font-mono interactive-btn cursor-pointer shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingUserId ? "Update User" : "Confirm & Grant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
