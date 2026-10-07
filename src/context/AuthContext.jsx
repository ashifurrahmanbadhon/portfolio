"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api, API_BASE } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  verify2FA: async () => {},
  sendSmsOtp: async () => {},
  logout: () => {},
  updateUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const savedToken = localStorage.getItem("cms_auth_token");
      const savedUser = localStorage.getItem("cms_auth_user");
      const exp = localStorage.getItem("cms_auth_exp");

      // Verify expiration if present
      if (savedToken) {
        if (exp && Number(exp) * 1000 < Date.now()) {
          // Token expired
          localStorage.removeItem("cms_auth_token");
          localStorage.removeItem("cms_auth_user");
          localStorage.removeItem("cms_auth_exp");
          setToken(null);
          setUser(null);
        } else {
          setToken(savedToken);
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setUser({
              username: "admin",
              full_name: "Ashifur Rahman",
              role: "super_admin",
              title: "Electrical & Electronic Engineer",
              email: "ashifur.badhon@gmail.com",
            });
          }
        }
      }
    } catch (e) {
      console.error("Auth check failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (identifier, password, remember = false) => {
    try {
      const res = await api.login(identifier, password, remember);
      
      // If 2FA challenge is required by server
      if (res && res.requires_2fa) {
        return {
          success: true,
          requires_2fa: true,
          two_factor_token: res.two_factor_token,
          masked_phone: res.masked_phone || "******7284",
          primary_method: res.primary_method || "totp",
        };
      }

      if (res && (res.token || res.success)) {
        const authToken = res.token || "demo-jwt-token";
        const authUser = res.user || {
          username: identifier,
          full_name: "Ashifur Rahman",
          role: "super_admin",
          title: "Electrical & Electronic Engineer",
          email: "ashifur.badhon@gmail.com",
        };

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem("cms_auth_token", authToken);
        localStorage.setItem("cms_auth_user", JSON.stringify(authUser));
        if (res.expires_at) {
          localStorage.setItem("cms_auth_exp", res.expires_at.toString());
        }

        return { success: true, user: authUser };
      } else {
        return {
          success: false,
          error: res?.error || "Invalid username/email or password.",
        };
      }
    } catch (err) {
      // Fallback for default admin credentials if backend connection temporarily unavailable
      if (
        (identifier === "admin" ||
          identifier === "ashifur.badhon@gmail.com" ||
          identifier === "admin@ashifurrahman.com") &&
        password === "admin123"
      ) {
        const fallbackUser = {
          username: "admin",
          full_name: "Ashifur Rahman",
          role: "super_admin",
          title: "Electrical & Electronic Engineer",
          email: "ashifur.badhon@gmail.com",
        };
        const fallbackToken = "offline-admin-token-" + Date.now();
        setToken(fallbackToken);
        setUser(fallbackUser);
        localStorage.setItem("cms_auth_token", fallbackToken);
        localStorage.setItem("cms_auth_user", JSON.stringify(fallbackUser));
        return { success: true, user: fallbackUser };
      }

      return {
        success: false,
        error: "Server connection error. Please verify the Python server is running.",
      };
    }
  };

  const verify2FA = async (twoFactorToken, code, method = "totp") => {
    try {
      const res = await api.verify2FA(twoFactorToken, code, method);
      if (res && (res.token || res.success)) {
        const authToken = res.token;
        const authUser = res.user || {
          username: "admin",
          full_name: "Ashifur Rahman",
          role: "super_admin",
          title: "Electrical & Electronic Engineer",
          email: "ashifur.badhon@gmail.com",
        };

        setToken(authToken);
        setUser(authUser);

        localStorage.setItem("cms_auth_token", authToken);
        localStorage.setItem("cms_auth_user", JSON.stringify(authUser));
        if (res.expires_at) {
          localStorage.setItem("cms_auth_exp", res.expires_at.toString());
        }

        return { success: true, user: authUser };
      } else {
        return {
          success: false,
          error: res?.error || "Invalid 2FA verification code.",
        };
      }
    } catch (err) {
      return {
        success: false,
        error: "2FA verification request failed. Please check server connection.",
      };
    }
  };

  const sendSmsOtp = async (twoFactorToken) => {
    try {
      const res = await api.sendSmsOtp(twoFactorToken);
      if (res && res.success) {
        return {
          success: true,
          masked_phone: res.masked_phone || "******7284",
          message: res.message || "OTP code sent to your registered phone.",
        };
      } else {
        return {
          success: false,
          error: res?.error || "Failed to send SMS OTP. Please try again later.",
        };
      }
    } catch (err) {
      return {
        success: false,
        error: "Failed to request SMS OTP. Please check server connection.",
      };
    }
  };

  const logout = () => {
    try {
      if (token) {
        fetch(`${API_BASE}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }).catch(() => {});
      }
    } catch (e) {}

    setToken(null);
    setUser(null);
    localStorage.removeItem("cms_auth_token");
    localStorage.removeItem("cms_auth_user");
    localStorage.removeItem("cms_auth_exp");
  };

  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem("cms_auth_user", JSON.stringify(merged));
      } catch (e) {
        console.error("Failed to save updated user:", e);
      }
      return merged;
    });
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        verify2FA,
        sendSmsOtp,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
