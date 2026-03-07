import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface GuestRouteProps {
  /** Where to redirect if the user is already authenticated. Defaults to "/". */
  redirectTo?: string;
  /** Optional custom loading component shown while auth state is resolving. */
  fallback?: React.ReactNode;
}

/**
 * Route guard that is only accessible to **unauthenticated** users
 * (e.g. /login, /register).
 *
 * If the user is already logged in they are redirected to `redirectTo`
 * (defaults to "/").
 */
export function GuestRoute({
  redirectTo = '/',
  fallback = null,
}: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
