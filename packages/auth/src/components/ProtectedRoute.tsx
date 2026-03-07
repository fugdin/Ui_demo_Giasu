import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@ai-learning/types';
import { useAuth } from '../hooks/useAuth';

// ─── Role → dev-server origin mapping ───────────────────

const ROLE_ORIGINS: Record<UserRole, string> = {
  student: 'http://localhost:3001',
  teacher: 'http://localhost:3002',
  admin: 'http://localhost:3003',
};

interface ProtectedRouteProps {
  /** The role(s) allowed to access this route. Omit to allow any authenticated user. */
  allowedRoles?: UserRole[];
  /** Optional custom loading component shown while auth state is resolving. */
  fallback?: React.ReactNode;
}

/**
 * Route guard that ensures the user is authenticated and (optionally) has the
 * required role.
 *
 * - Not authenticated --> redirect to `/login`
 * - Authenticated but wrong role --> redirect to the correct app origin
 * - Authenticated with correct role --> render child routes via `<Outlet />`
 */
export function ProtectedRoute({
  allowedRoles,
  fallback = null,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Still resolving auth state -- show nothing (or a spinner)
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Not authenticated at all
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but role not permitted on this app
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const correctOrigin = ROLE_ORIGINS[user.role];

    // In production the apps live on different domains / ports, so we do a
    // full-page redirect rather than a client-side <Navigate>.
    if (typeof window !== 'undefined') {
      window.location.href = correctOrigin;
      return null;
    }

    // SSR fallback (shouldn't happen in this SPA, but keeps TS happy)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
