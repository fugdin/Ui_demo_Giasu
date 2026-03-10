import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
} from '@ai-learning/types';
import api, { setAccessToken, getAccessToken } from '../services/api';

// Mock auth toggle (enable in any environment with VITE_ENABLE_MOCK_AUTH=true or when served from GitHub Pages)
const mockAuthEnabled =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_ENABLE_MOCK_AUTH === 'true') ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'));
const MOCK_USER_STORAGE_KEY = 'ai-learning-mock-user';

// ─── Context shape ──────────────────────────────────────

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helper: decode JWT payload without a library ───────

function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  // Consider expired 30 s before actual expiry to give a buffer
  return Date.now() >= (payload.exp - 30) * 1000;
}

// ─── Provider ───────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Guard against double-invoke in React StrictMode
  const initCalled = useRef(false);

  // ── Refresh token ────────────────────────────────────

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const { data } = await api.post<
        ApiResponse<{ accessToken: string; user: User }>
      >('/auth/refresh');

      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
    } catch {
      // Refresh failed -- clear everything
      setAccessToken(null);
      setUser(null);
      throw new Error('Session expired');
    }
  }, []);

  // ── Check auth on mount ──────────────────────────────

  const checkAuth = useCallback(async (): Promise<void> => {
    // Dev-only: restore mock session without hitting backend
    if (mockAuthEnabled && typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(MOCK_USER_STORAGE_KEY);
      if (stored) {
        try {
          const mockUser: User = JSON.parse(stored);
          setAccessToken('mock-token');
          setUser(mockUser);
          setIsLoading(false);
          return;
        } catch {
          window.localStorage.removeItem(MOCK_USER_STORAGE_KEY);
        }
      }
    }

    const token = getAccessToken();

    if (!token) {
      // No in-memory token. Attempt a silent refresh via the httpOnly cookie.
      try {
        await refreshToken();
      } catch {
        // No valid session -- remain unauthenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Token exists -- check expiry
    if (isTokenExpired(token)) {
      try {
        await refreshToken();
      } catch {
        setAccessToken(null);
        setUser(null);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Token valid & not expired -- fetch current user
    try {
      const { data } = await api.get<ApiResponse<User>>('/auth/me');
      setUser(data.data);
    } catch {
      // Token rejected by server
      try {
        await refreshToken();
      } catch {
        setAccessToken(null);
        setUser(null);
        navigate('/login', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate, refreshToken]);

  useEffect(() => {
    if (initCalled.current) return;
    initCalled.current = true;
    checkAuth();
  }, [checkAuth]);

  // ── Login ────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string, remember = false): Promise<void> => {
      // Dev-only mock login for quick prototyping
      if (mockAuthEnabled) {
        const isMockCredential =
          email === 'admin@example.com' && password === '123456';
        if (!isMockCredential) {
          throw new Error('Mock auth: invalid default credentials');
        }

        const mockUser: User = {
          id: 'mock-admin',
          name: 'Mock Admin',
          email,
          role: 'admin',
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setAccessToken('mock-token');
        setUser(mockUser);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(
            MOCK_USER_STORAGE_KEY,
            JSON.stringify(mockUser),
          );
        }
        return;
      }

      const payload: LoginRequest = { email, password, remember };
      const { data } = await api.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        payload,
      );

      // Access token → memory. Refresh token is set as httpOnly cookie by server.
      setAccessToken(data.data.tokens.accessToken);
      setUser(data.data.user);
    },
    [],
  );

  // ── Register ─────────────────────────────────────────

  const register = useCallback(
    async (registerData: RegisterRequest): Promise<void> => {
      const { data } = await api.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        registerData,
      );

      setAccessToken(data.data.tokens.accessToken);
      setUser(data.data.user);
    },
    [],
  );

  // ── Logout ───────────────────────────────────────────

  const logout = useCallback(async (): Promise<void> => {
    try {
      if (mockAuthEnabled) {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(MOCK_USER_STORAGE_KEY);
        }
        setAccessToken(null);
        setUser(null);
        navigate('/login', { replace: true });
        return;
      }

      // Tell server to invalidate the refresh token / clear the cookie
      await api.post('/auth/logout');
    } catch {
      // Even if the server call fails, clear local state
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ── Memoised context value ───────────────────────────

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      refreshToken,
    }),
    [user, isLoading, login, register, logout, refreshToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
