import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@ai-learning/types';

// ─── In-memory token storage ────────────────────────────
// Access token is stored ONLY in memory (never localStorage)
// to mitigate XSS attacks. Refresh token lives in an httpOnly cookie
// set by the server, so it is never accessible to JS.

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

// ─── Axios instance ─────────────────────────────────────

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io')
    ? 'https://example.com/api'
    : 'http://localhost:4000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
  // Send httpOnly cookies (refresh token) with every request
  withCredentials: true,
});

// ─── Request interceptor: attach access token ───────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: auto-refresh on 401 ─────────

// Prevent multiple concurrent refresh requests
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only attempt refresh for 401 errors that haven't already been retried
    // and that are not the refresh endpoint itself (avoid infinite loop).
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === '/auth/refresh'
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another refresh is already in flight -- queue this request
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // The refresh endpoint relies on the httpOnly cookie; no body needed
      const { data } = await api.post<ApiResponse<{ accessToken: string }>>(
        '/auth/refresh',
      );

      const newToken = data.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      // Let the AuthProvider handle the redirect to /login
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
