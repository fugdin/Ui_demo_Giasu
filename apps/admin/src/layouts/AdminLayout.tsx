import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { AppLayout } from '@ai-learning/ui';
import { useAuth } from '@ai-learning/auth';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // Map menu keys <-> routes
  const keyToPath: Record<string, string> = {
    dashboard: '/',
    users: '/users',
    fields: '/fields',
    courses: '/courses',
    'question-bank': '/questions',
    'assessment-config': '/assessment-config',
    settings: '/settings',
  };

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/users')) return 'users';
    if (pathname.startsWith('/fields')) return 'fields';
    if (pathname.startsWith('/courses')) return 'courses';
    if (pathname.startsWith('/questions')) return 'question-bank';
    if (pathname.startsWith('/assessment-config')) return 'assessment-config';
    if (pathname.startsWith('/settings')) return 'settings';
    return 'dashboard';
  }, [location.pathname]);

  return (
    <AppLayout
      role="admin"
      userName={user?.name}
      selectedKey={selectedKey}
      onMenuSelect={(key) => navigate(keyToPath[key] ?? '/')}
      onLogout={logout}
    >
      <Outlet />
    </AppLayout>
  );
}
