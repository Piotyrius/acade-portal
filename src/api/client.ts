import axios from "axios";
import { useAuthStore } from "@/store/authStore";

// --- ALWAYS use env value if provided ---
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "https://academy-crm.onrender.com";

console.log("🔗 Using API:", API_BASE_URL);

// --- Create axios instance ---
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// --- Attach token ---
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (import.meta.env.DEV) {
    try {
      const method = (config.method || 'GET').toUpperCase();
      const url = config.url;
      // Log request body for debugging API mismatches; do NOT log headers/tokens.
      if (method !== 'GET') {
        console.debug('➡️ API request', { method, url, data: config.data });
      }
    } catch {
      // ignore logging failures
    }
  }

  if (token) {
    // config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Refresh token handling ---
let isRefreshing = false;
let pending: Array<(token: string | null) => void> = [];

function subscribe(cb: (token: string | null) => void) {
  pending.push(cb);
}
function notify(token: string | null) {
  pending.forEach((cb) => cb(token));
  pending = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (import.meta.env.DEV) {
      try {
        const status = error?.response?.status;
        const method = (original?.method || 'GET').toUpperCase();
        const url = original?.url;
        const data = error?.response?.data;
        console.warn('🌐 API error', { status, method, url, data });
      } catch {
        // ignore logging failures
      }
    }

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const auth = useAuthStore.getState();

      if (!auth.refreshToken) {
        auth.clearAuth();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribe((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const resp = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh/`,
          { refresh: auth.refreshToken }
        );

        const newAccess = resp.data.access;
        auth.setAuth(auth.user!, newAccess, auth.refreshToken);

        notify(newAccess);

        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        auth.clearAuth();
        notify(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
