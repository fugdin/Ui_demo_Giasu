# Merge 3 Apps into 1 Unified App

## Context

The monorepo has 3 separate Vite React apps (admin:3003, student:3001, teacher:3002) sharing packages (`@ai-learning/auth`, `@ai-learning/types`, `@ai-learning/ui`). Switching between roles requires full-page redirect to a different port. The goal is to merge everything into a single app so role switching is instant (no page reload, no re-login).

## Decision

**Approach 1 (chosen):** Merge into one app by copying admin/teacher code into a new `apps/web/` directory, using route prefixes (`/admin/*`, `/student/*`, `/teacher/*`) for role separation. The existing student app has the most complete mock data (multi-role support), making it the best merge target.

## Architecture

### Directory Structure

```
apps/web/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── routes/
│   │   ├── index.tsx           # Root router, post-login redirect
│   │   ├── adminRoutes.tsx     # Lazy-loaded admin routes
│   │   ├── studentRoutes.tsx   # Lazy-loaded student routes
│   │   └── teacherRoutes.tsx   # Lazy-loaded teacher routes
│   ├── layouts/
│   │   ├── AdminLayout.tsx     # Sidebar layout (from admin app)
│   │   ├── StudentLayout.tsx   # Top-bar layout (from student MainLayout)
│   │   └── AuthLayout.tsx      # Gradient card layout (verify-email)
│   ├── components/
│   │   ├── RoleRoute.tsx       # Replaces ProtectedRoute for in-app role guard
│   │   ├── CourseCard.tsx
│   │   └── PasswordStrength.tsx
│   ├── pages/
│   │   ├── Auth/AuthPage.tsx   # Single login page (admin sliding panel)
│   │   ├── admin/              # All admin pages
│   │   ├── student/            # All student pages
│   │   └── teacher/            # Placeholder
│   ├── mocks/
│   │   ├── index.ts            # Unified interceptor
│   │   ├── adminData.ts        # Admin seed data
│   │   └── studentData.ts      # Student seed data
│   └── services/
│       └── api.ts
```

### Routing

| Path | Layout | Role |
|------|--------|------|
| `/login`, `/register` | Full-screen AuthPage | Guest |
| `/verify-email` | AuthLayout | Any |
| `/admin/*` | AdminLayout (sidebar) | admin |
| `/student/*` | StudentLayout (top-bar) | student |
| `/teacher/*` | TeacherLayout | teacher |

### Login Flow

1. User visits `/login` → enters credentials
2. Mock auth returns user with role based on email (`admin@example.com` → admin, `student@example.com` → student, `teacher@example.com` → teacher)
3. App redirects to `/{role}/` automatically
4. Unknown emails default to `student` role

### Role Switching (No Re-login)

- Avatar dropdown → "Chuyển giao diện" submenu
- Clicking navigates to the other role's prefix: `navigate('/admin/')` or `navigate('/student/')`
- Same SPA, same AuthProvider → user state persists, no reload needed
- RoleRoute component handles access control (wrong role → redirect to correct prefix)

### RoleRoute Component

Replaces `ProtectedRoute` from packages (which does `window.location.href` to different ports). The new `RoleRoute`:
- Checks `user.role` against `allowedRoles` prop
- Wrong role → `<Navigate to={`/${user.role}/`} />` (client-side, no reload)
- Not authenticated → `<Navigate to="/login" />`
- Correct role → `<Outlet />`

### Mock Data

Unified interceptor merges both mock layers:
- Auth routes: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/me` (multi-role MOCK_USERS map)
- Admin routes: CRUD for users, fields, courses, lessons, questions, assessment-config, settings
- Student routes: dashboard, fields, subjects, courses, enrollments, assessment

### Packages

No changes to packages. `ProtectedRoute` remains for backward compatibility but `apps/web/` uses `RoleRoute` instead.

### Cleanup

After merge, delete:
- `apps/admin/`
- `apps/student/`
- `apps/teacher/`

Update root `package.json`:
- Single `dev:web` script → `vite --port 3000`
- Remove `dev:admin`, `dev:student`, `dev:teacher`

## Code Splitting

All role-specific routes use `React.lazy()` + `<Suspense>`:
```tsx
const AdminDashboard = React.lazy(() => import('./pages/admin/Dashboard/DashboardPage'));
```
This keeps initial bundle small — only the active role's code is loaded.
