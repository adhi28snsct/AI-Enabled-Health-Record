// src/services/notificationService.js
import axios from "axios";

const API_BASE = "http://localhost:5000"; // update if needed

function getToken() {
  return localStorage.getItem("token");
}

const looksLikeHtmlResponse = (resp) => {
  if (!resp) return false;
  const headers = resp.headers || resp?.response?.headers;
  const contentType = headers?.["content-type"] || headers?.["Content-Type"] || "";
  if (typeof contentType === "string" && contentType.includes("text/html")) return true;
  const data = resp.data ?? resp?.response?.data;
  return typeof data === "string" && data.trim().startsWith("<");
};

export const instance = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000, // 10s
});

// attach token to every request
instance.interceptors.request.use((cfg) => {
  const token = getToken();
  if (token) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
}, (err) => Promise.reject(err));

// Optional: lightweight dev logging for requests/responses
if (process.env.NODE_ENV !== "production") {
  instance.interceptors.request.use((cfg) => {
    try { console.debug("[notifications] req", cfg.method, cfg.url, cfg.data ?? ""); } catch {}
    return cfg;
  });
  instance.interceptors.response.use((res) => {
    try { console.debug("[notifications] res", res.config?.url, res.status); } catch {}
    return res;
  }, (err) => {
    try { console.debug("[notifications] resERR", err?.config?.url, err?.message); } catch {}
    return Promise.reject(err);
  });
}

export const fetchNotifications = async () => {
  try {
    const res = await instance.get("/api/notifications");
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    console.error("fetchNotifications failed:", err?.message ?? err);
    return [];
  }
};

export const fetchNotificationById = async (id) => {
  if (!id) return null;
  try {
    const res = await instance.get(`/api/notifications/${id}`);
    return res.data?.data ?? res.data ?? null;
  } catch (err) {
    console.warn("fetchNotificationById: primary request failed", {
      message: err?.message,
      status: err?.response?.status,
    });

    if (looksLikeHtmlResponse(err)) {
      console.warn("fetchNotificationById: server responded with HTML (check backend route or dev proxy).");
    }

    // fallback: fetch list and search locally
    try {
      const listRes = await instance.get("/api/notifications");
      const list = listRes.data?.data ?? listRes.data ?? [];
      if (!Array.isArray(list)) return null;
      const found = list.find((n) => String(n._id) === String(id) || String(n.id) === String(id));
      return found ?? null;
    } catch (err2) {
      console.error("fetchNotificationById: fallback list fetch failed", {
        message: err2?.message,
        status: err2?.response?.status,
      });
      return null;
    }
  }
};

/**
 * markNotificationRead
 * Unified function: mark read (read=true) or unread (read=false).
 * Tries dedicated endpoints first (/read or /unread), falls back to PATCH /api/notifications/:id with { read }
 */
export const markNotificationRead = async (id, read = true) => {
  if (!id) return null;
  try {
    if (read) {
      // attempt dedicated endpoint
      try {
        const res = await instance.patch(`/api/notifications/${id}/read`);
        return res.data ?? res;
      } catch (err) {
        // fallback to generic patch
        const res2 = await instance.patch(`/api/notifications/${id}`, { read: true });
        return res2.data ?? res2;
      }
    } else {
      // mark unread: try dedicated endpoint first
      try {
        const res = await instance.patch(`/api/notifications/${id}/unread`);
        return res.data ?? res;
      } catch (err) {
        // fallback to generic patch
        const res2 = await instance.patch(`/api/notifications/${id}`, { read: false });
        return res2.data ?? res2;
      }
    }
  } catch (err) {
    console.warn("markNotificationRead (with read flag) failed:", err?.message ?? err);
    throw err;
  }
};

// convenience wrapper
export const markNotificationUnread = async (id) => {
  return markNotificationRead(id, false);
};

export const markAllNotificationsRead = async () => {
  try {
    const res = await instance.patch("/api/notifications/read-all");
    return res.data ?? res;
  } catch (err) {
    console.warn("markAllNotificationsRead failed:", err?.message ?? err);
    throw err;
  }
};

/**
 * deleteNotification
 */
export const deleteNotification = async (id) => {
  if (!id) return null;
  try {
    const res = await instance.delete(`/api/notifications/${id}`);
    return res.data ?? res;
  } catch (err) {
    console.warn("deleteNotification failed:", err?.message ?? err);
    throw err;
  }
};

/**
 * togglePinNotification: tries /pin endpoint then falls back to generic PATCH
 */
export const togglePinNotification = async (id, pinned = true) => {
  if (!id) return null;
  try {
    try {
      const res = await instance.patch(`/api/notifications/${id}/pin`, { pinned });
      return res.data ?? res;
    } catch (err) {
      // fallback
    }
    const res2 = await instance.patch(`/api/notifications/${id}`, { pinned });
    return res2.data ?? res2;
  } catch (err) {
    console.warn("togglePinNotification failed:", err?.message ?? err);
    throw err;
  }
};

export default {
  fetchNotifications,
  fetchNotificationById,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
  deleteNotification,
  togglePinNotification,
  instance,
};
