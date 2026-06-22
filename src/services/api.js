// api.js
// Configured Axios instance for all HTTP communication
// with the CodeShield backend.

import axios from 'axios';

const api = axios.create({
  // Base URL from environment variable
  // Vite exposes env vars prefixed with VITE_
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',

  // 30 second timeout — scans can start slowly
  // but this is just for the initial HTTP response
  // (which should be 202 in ~235ms as we saw)
  timeout: 30000,

  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Future: attach auth token
    // const token = localStorage.getItem('authToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log(`[api] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
api.interceptors.response.use(
  // Success: pass through
  (response) => response,

  // Error: normalize into consistent shape
  (error) => {
    if (!error.response) {
      // Network error — server unreachable
      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: 'Cannot connect to CodeShield server. Please check your connection.',
      });
    }

    const { data, status } = error.response;

    // Our server always returns { success: false, error: { code, message } }
    // Extract that structure
    if (data?.error) {
      return Promise.reject({
        code: data.error.code,
        message: data.error.message,
        retryAfter: data.error.retryAfter,
        status,
      });
    }

    return Promise.reject({
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      status,
    });
  }
);

export default api;