import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@ai-learning/auth';
import { Spin } from 'antd';

/**
 * RoleRoute — chỉ kiểm tra authentication.
 * Không chặn role → cho phép "Chuyển giao diện" (admin xem student UI và ngược lại).
 * RoleRedirect (ở /) lo redirect đúng dashboard sau login.
 */
export default function RoleRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}/`} replace />;
}
