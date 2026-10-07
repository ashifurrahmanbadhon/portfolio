// Central CMS High-Performance API Client with In-Memory Caching & Deduplication
const getApiBase = () => {
  if (typeof window !== "undefined") {
    const custom = localStorage.getItem("cms_api_base");
    if (custom && custom.trim()) return custom.trim().replace(/\/$/, "");
  }
  return process.env.NEXT_PUBLIC_API_BASE || "";
};

export const API_BASE = getApiBase();

export const getAuthHeaders = () => {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("cms_auth_token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// In-Memory Request Cache & Flight Deduplication
const cache = new Map();
const inFlightRequests = new Map();
const DEFAULT_TTL_MS = 25000; // 25 seconds cache

const cachedFetch = async (url, options = {}, ttl = DEFAULT_TTL_MS) => {
  const method = options.method || "GET";
  if (method !== "GET") {
    // Bust cache on mutations
    cache.clear();
    const res = await fetch(url, options);
    return res.json();
  }

  const cacheKey = `${url}`;
  const now = Date.now();

  // Check valid cache entry
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey);
    if (now - entry.timestamp < ttl) {
      return entry.data;
    }
    cache.delete(cacheKey);
  }

  // Deduplicate simultaneous in-flight requests to the same URL
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(url, options);
      const data = await res.json();
      cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};

export const api = {
  // Auth
  async login(identifier, password, remember = false) {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, remember }),
    });
    return res.json();
  },

  async verify2FA(two_factor_token, code, method = "totp") {
    const res = await fetch(`${API_BASE}/api/auth/2fa/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ two_factor_token, code, method }),
    });
    return res.json();
  },

  async sendSmsOtp(two_factor_token) {
    const res = await fetch(`${API_BASE}/api/auth/2fa/send-sms-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ two_factor_token }),
    });
    return res.json();
  },

  async get2FAStatus() {
    const res = await fetch(`${API_BASE}/api/auth/2fa/status`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async setup2FA() {
    const res = await fetch(`${API_BASE}/api/auth/2fa/setup`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async enable2FA(setup_token, code) {
    const res = await fetch(`${API_BASE}/api/auth/2fa/enable`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ setup_token, code }),
    });
    return res.json();
  },

  async disable2FA(password, code) {
    const res = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ password, code }),
    });
    return res.json();
  },

  async regenerateRecoveryCodes(password = "", code = "") {
    const res = await fetch(`${API_BASE}/api/auth/2fa/regenerate-recovery-codes`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ password, code }),
    });
    return res.json();
  },

  async getMe() {
    return cachedFetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    }, 15000);
  },

  // Change History & Audit Logs
  async getHistory(params = {}) {
    const q = new URLSearchParams();
    if (params.category && params.category !== "all") q.set("category", params.category);
    if (params.search) q.set("search", params.search);
    if (params.limit) q.set("limit", params.limit);
    const queryString = q.toString() ? `?${q.toString()}` : "";
    const res = await fetch(`${API_BASE}/api/admin/history${queryString}`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async logActivity(action, details = "", website_name = "Central CMS") {
    const res = await fetch(`${API_BASE}/api/admin/history/log`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, details, website_name }),
    });
    return res.json();
  },

  // Central Dashboard & Websites
  async getCentralDashboard() {
    return cachedFetch(`${API_BASE}/api/admin/central/dashboard`, {
      headers: getAuthHeaders(),
    }, 20000);
  },

  async getWebsites() {
    return cachedFetch(`${API_BASE}/api/admin/websites`, {
      headers: getAuthHeaders(),
    }, 20000);
  },

  async pingWebsite(id) {
    const res = await fetch(`${API_BASE}/api/admin/websites/${id}/ping`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveWebsite(id, data) {
    cache.clear();
    const url = id ? `${API_BASE}/api/admin/websites/${id}` : `${API_BASE}/api/admin/websites`;
    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteWebsite(id) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/websites/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // ToolGhor Hub
  async getToolGhorContent() {
    return cachedFetch(`${API_BASE}/api/admin/toolghor/content`, {
      headers: getAuthHeaders(),
    }, 25000);
  },

  async saveToolGhorTool(id, data) {
    cache.clear();
    const url = id ? `${API_BASE}/api/admin/toolghor/tools/${id}` : `${API_BASE}/api/admin/toolghor/tools`;
    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteToolGhorTool(id) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/toolghor/tools/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveToolGhorCategory(id, data) {
    cache.clear();
    const url = id ? `${API_BASE}/api/admin/toolghor/categories/${id}` : `${API_BASE}/api/admin/toolghor/categories`;
    const res = await fetch(url, {
      method: id ? "PUT" : "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteToolGhorCategory(id) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/toolghor/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async saveToolGhorSettings(data) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/toolghor/settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Portfolio Hub
  async getPortfolioContent() {
    return cachedFetch(`${API_BASE}/api/content`, {}, 25000);
  },

  async savePortfolioSection(section, data) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/${section}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Roles & Users
  async getUsers() {
    return cachedFetch(`${API_BASE}/api/admin/users`, {
      headers: getAuthHeaders(),
    }, 20000);
  },

  // System Settings
  async getSystemSettings() {
    return cachedFetch(`${API_BASE}/api/admin/system-settings`, {
      headers: getAuthHeaders(),
    }, 20000);
  },

  async saveSystemSettings(category, data) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/system-settings`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ category, ...data }),
    });
    return res.json();
  },
};
