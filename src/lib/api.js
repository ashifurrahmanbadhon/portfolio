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

  async loginTotp(code) {
    const res = await fetch(`${API_BASE}/api/auth/login-totp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
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

  async setup2FA(password = "") {
    const res = await fetch(`${API_BASE}/api/auth/2fa/setup`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  async enable2FA(setup_token, code, password = "") {
    const res = await fetch(`${API_BASE}/api/auth/2fa/enable`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ setup_token, code, password }),
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

  async getDevices() {
    const res = await fetch(`${API_BASE}/api/admin/devices`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async removeDevice(id) {
    const res = await fetch(`${API_BASE}/api/admin/devices`, {
      method: "DELETE",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  async getActivityLog() {
    const res = await fetch(`${API_BASE}/api/admin/activity`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  // Portfolio Hub
  async getPortfolioContent() {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/content?_t=${Date.now()}`, {
      headers: {
        ...getAuthHeaders(),
        "Pragma": "no-cache",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      cache: "no-store",
    });
    return res.json();
  },

  async savePortfolioSection(section, data) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/admin/${section}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result && result.success && typeof window !== "undefined") {
      try {
        localStorage.removeItem("portfolio_cms_cache_v7");
        localStorage.removeItem("portfolio_cms_placeholder_data");
        window.dispatchEvent(new Event("portfolio_content_updated"));
      } catch (_) {}
    }
    return result;
  },

  async uploadMedia(file) {
    const formData = new FormData();
    formData.append("file", file);
    const token = typeof window !== "undefined" ? localStorage.getItem("cms_auth_token") || "" : "";
    const res = await fetch(`${API_BASE}/api/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });
    return res.json();
  },

  async getContactMessages() {
    return cachedFetch(`${API_BASE}/api/contact`, {
      headers: getAuthHeaders(),
    }, 5000);
  },

  async getUnreadContactCount() {
    const res = await fetch(`${API_BASE}/api/contact?unread=1`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async deleteContactMessage(id) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/contact?id=${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async deleteContactMessages(ids) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/contact?ids=${ids.join(",")}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async markContactMessageRead(id, isRead = 1) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, is_read: isRead }),
    });
    return res.json();
  },

  async replyContactMessage(messageId, reply) {
    cache.clear();
    const res = await fetch(`${API_BASE}/api/contact/reply`, {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ messageId, reply }),
    });
    return res.json();
  },

  async getPresence() {
    const res = await fetch(`${API_BASE}/api/admin/presence`, {
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async updatePresence() {
    const res = await fetch(`${API_BASE}/api/admin/presence`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },

  async syncGit() {
    const res = await fetch(`${API_BASE}/api/admin/sync-git`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return res.json();
  },
};
