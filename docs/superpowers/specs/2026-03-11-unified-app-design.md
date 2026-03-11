# Design: Gộp 3 Apps → 1 Unified App

**Date:** 2026-03-11
**Status:** Approved
**Approach:** Copy & Rename (Approach A)

---

## Problem

Hiện tại platform có 3 SPA riêng biệt (admin port 3003, student port 3001, teacher port 3002) chạy trên 3 ports khác nhau. Cross-app navigation dùng `window.location.href` gây full page reload. Teacher app chỉ là stub. Cần gộp thành 1 unified app để đơn giản hóa deployment, cải thiện UX, và dùng SPA navigation thay vì reload.

## Solution

Rename `apps/student/` → `apps/web/`, copy admin pages vào, tạo role-based routing với `RoleRoute` component mới thay thế `ProtectedRoute`. Packages giữ nguyên không sửa.

---

## 1. File Structure

```
apps/web/                          ← renamed từ apps/student/
├── package.json                   ← name: "@ai-learning/web", merge deps từ admin
├── vite.config.ts                 ← giữ port 3001
├── src/
│   ├── main.tsx                   ← entry point (giữ nguyên, import mocks)
│   ├── App.tsx                    ← BrowserRouter > AuthProvider > AppRoutes
│   ├── routes/
│   │   ├── index.tsx              ← Root router: public + role-based splits
│   │   ├── adminRoutes.tsx        ← React.lazy() all admin pages, AdminLayout
│   │   ├── studentRoutes.tsx      ← React.lazy() all student pages, MainLayout
│   │   └── teacherRoutes.tsx      ← Placeholder "Coming soon"
│   ├── layouts/
│   │   ├── AdminLayout.tsx        ← Copy từ admin (sidebar), sửa navigation → /admin/*
│   │   ├── MainLayout.tsx         ← Giữ từ student (top-bar), sửa navigation → /student/*
│   │   └── AuthLayout.tsx         ← Giữ từ student (verify-email)
│   ├── pages/
│   │   ├── Auth/AuthPage.tsx      ← Giữ từ student (sliding panel + PasswordStrength)
│   │   ├── VerifyEmail/VerifyEmailPage.tsx
│   │   ├── admin/                 ← Copy toàn bộ pages từ admin app
│   │   │   ├── Dashboard/DashboardPage.tsx
│   │   │   ├── UserManagement/UserManagementPage.tsx
│   │   │   ├── FieldManagement/FieldManagementPage.tsx
│   │   │   ├── CourseManagement/CourseManagementPage.tsx
│   │   │   ├── CourseForm/CourseFormPage.tsx
│   │   │   ├── LessonManagement/LessonManagementPage.tsx
│   │   │   ├── LessonForm/LessonFormPage.tsx
│   │   │   ├── LessonContent/LessonContentPage.tsx
│   │   │   ├── QuestionBank/QuestionBankPage.tsx
│   │   │   ├── QuestionForm/QuestionFormPage.tsx
│   │   │   ├── AssessmentConfig/AssessmentConfigPage.tsx
│   │   │   └── SystemSettings/SystemSettingsPage.tsx
│   │   ├── student/               ← Move student pages vào subfolder
│   │   │   ├── Dashboard/DashboardPage.tsx
│   │   │   ├── Assessment/AssessmentStartPage.tsx
│   │   │   ├── Assessment/AssessmentTakePage.tsx
│   │   │   ├── Assessment/AssessmentResultPage.tsx
│   │   │   ├── Courses/CourseListPage.tsx
│   │   │   ├── Courses/CourseDetailPage.tsx
│   │   │   └── MyCourses/MyCoursesPage.tsx
│   │   └── teacher/
│   │       └── ComingSoonPage.tsx  ← Placeholder
│   ├── components/
│   │   ├── CourseCard.tsx          ← Giữ từ student
│   │   ├── PasswordStrength.tsx   ← Giữ từ student
│   │   └── RoleRoute.tsx          ← MỚI: role-based route guard
│   ├── mocks/
│   │   ├── index.ts               ← Unified mock interceptor (merge cả hai)
│   │   ├── adminData.ts           ← Seed data admin
│   │   └── studentData.ts         ← Seed data student (rename từ data.ts)
│   └── services/
│       ├── api.ts                 ← Student API client (giữ nguyên)
│       └── adminApi.ts            ← Admin API client (copy từ admin)
```

---

## 2. Routing

### URL Schema

```
/login, /register          → AuthPage (GuestRoute)
/verify-email              → VerifyEmailPage (AuthLayout)

/admin/                    → AdminLayout (sidebar)
/admin/users               → UserManagementPage
/admin/fields              → FieldManagementPage
/admin/courses             → CourseManagementPage
/admin/courses/create      → CourseFormPage
/admin/courses/:id/edit    → CourseFormPage
/admin/courses/:courseId/lessons         → LessonManagementPage
/admin/courses/:courseId/lessons/create  → LessonFormPage
/admin/lessons/:id/edit                 → LessonFormPage
/admin/courses/:courseId/lessons/:lessonId/content → LessonContentPage
/admin/questions           → QuestionBankPage
/admin/questions/create    → QuestionFormPage
/admin/questions/:id/edit  → QuestionFormPage
/admin/assessment-config   → AssessmentConfigPage
/admin/settings            → SystemSettingsPage

/student/                  → MainLayout (top-bar)
/student/assessment        → AssessmentStartPage
/student/assessment/take   → AssessmentTakePage
/student/assessment/result/:id → AssessmentResultPage
/student/courses           → CourseListPage
/student/courses/:id       → CourseDetailPage
/student/my-courses        → MyCoursesPage

/teacher/                  → ComingSoonPage (placeholder)
```

### Router Structure

```tsx
<Routes>
  {/* Public */}
  <Route element={<GuestRoute />}>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
  </Route>
  <Route element={<AuthLayout />}>
    <Route path="/verify-email" element={<VerifyEmailPage />} />
  </Route>

  {/* Role-based (lazy loaded) */}
  <Route element={<RoleRoute allowedRole="admin" />}>
    <Route path="/admin/*" element={<AdminRoutes />} />
  </Route>
  <Route element={<RoleRoute allowedRole="student" />}>
    <Route path="/student/*" element={<StudentRoutes />} />
  </Route>
  <Route element={<RoleRoute allowedRole="teacher" />}>
    <Route path="/teacher/*" element={<TeacherRoutes />} />
  </Route>

  {/* Fallbacks */}
  <Route path="/" element={<RoleRedirect />} />
  <Route path="*" element={<Navigate to="/" />} />
</Routes>
```

### Login Flow

1. User → `/login` → AuthPage (sliding panel from student app)
2. Submit login → mock intercepts → recognizes email → sets role
3. GuestRoute detects `isAuthenticated` → redirect to `/`
4. RoleRedirect reads `user.role` → navigates to `/{role}/`
5. RoleRoute verifies role match → renders layout + pages

---

## 3. Key Components

### RoleRoute (new, in apps/web/)

Replaces `ProtectedRoute` from `packages/auth`. Does NOT modify the package.

```tsx
interface RoleRouteProps {
  allowedRole: UserRole;
}

function RoleRoute({ allowedRole }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== allowedRole) return <Navigate to={`/${user?.role}/`} />;

  return <Outlet />;
}
```

Key difference from ProtectedRoute: uses `<Navigate>` (SPA navigation) instead of `window.location.href` (full page redirect to different port).

### RoleRedirect (new)

```tsx
function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <Navigate to={`/${user?.role}/`} />;
}
```

---

## 4. Layout Changes

### AdminLayout

- Copy from `apps/admin/src/layouts/AdminLayout.tsx`
- Change sidebar menu `onClick` navigation: remove path-to-key mapping prefix, add `/admin/` prefix
- Change dropdown "Chuyển giao diện": `window.location.href` → `navigate('/student/')`, `navigate('/teacher/')`
- Internal links: all paths prefixed with `/admin/`

### MainLayout

- Keep from student app
- Change dropdown "Chuyển giao diện": `window.location.href` → `navigate('/admin/')`, `navigate('/teacher/')`
- Change menu navigation: add `/student/` prefix to paths
- Keep horizontal header style

### AuthLayout

- Keep as-is from student app (for /verify-email)

---

## 5. Mock System

### Unified Mock (`mocks/index.ts`)

Merge both mock routers into one Axios adapter override.

**Data files:**
- `adminData.ts` — copy from `apps/admin/src/mocks/data.ts`
- `studentData.ts` — rename from `apps/student/src/mocks/data.ts`

**Route groups:**

| Group | Endpoints | Source |
|---|---|---|
| Auth | `POST /auth/login\|register\|refresh`, `GET /auth/me` | student mock (multi-role) |
| Admin Dashboard | `GET /admin/dashboard` | admin mock |
| Users | `GET/POST /users`, `PATCH /users/:id` | admin mock |
| Fields (admin) | `GET/POST /fields`, `PUT/PATCH/DELETE /fields/:id` | admin mock |
| Courses (admin) | `GET/POST /courses`, `GET/PUT /courses/:id` | admin mock |
| Lessons | Full CRUD + theory + interaction + questions | admin mock |
| Questions | Full CRUD | admin mock |
| Assessment Config | `GET/PUT /assessment-config` | admin mock |
| Settings | `GET/PUT /settings` | admin mock |
| Student Dashboard | `GET /student/dashboard` | student mock |
| Fields (student) | `GET /fields`, `GET /fields/:id/subjects` | student mock |
| Courses (student) | `GET /courses`, `GET /courses/:id`, `GET /courses/:id/lessons` | student mock |
| Enrollments | `GET/POST /enrollments` | student mock |
| Assessment | `POST /assessment/start\|submit`, `GET /assessment/result/:id` | student mock |

**In-memory DBs:** Both admin and student DBs maintained separately, initialized from their respective seed data.

### Mock Auth

Uses student mock's multi-role login:

| Email | Role |
|---|---|
| `admin@example.com` | admin |
| `student@example.com` | student |
| `teacher@example.com` | teacher |
| Any other | student (default) |

Password: `123456` for all.

---

## 6. Dependencies

### Added to apps/web/package.json (from admin)

```json
{
  "@ant-design/charts": "...",
  "@dnd-kit/core": "...",
  "@dnd-kit/sortable": "...",
  "@dnd-kit/utilities": "...",
  "@monaco-editor/react": "...",
  "@tinymce/tinymce-react": "...",
  "dayjs": "..."
}
```

### Workspace Updates

**Root package.json scripts:**
- Remove: `dev:admin`, `dev:teacher`
- Rename: `dev:student` → `dev:web`
- Keep: `dev` (turbo run dev — auto-detects remaining app)

### Cleanup

- Delete: `apps/admin/` (fully merged)
- Delete: `apps/teacher/` (placeholder integrated)
- Delete: Legacy `LoginPage.tsx`, `RegisterPage.tsx` in student

---

## 7. Admin Page Navigation Fix

Admin pages currently use absolute paths like `navigate('/courses')`. After merge, these need `/admin/` prefix.

**Strategy:** Update all `navigate()` and `<Link>` calls in admin pages to include `/admin/` prefix.

Affected patterns:
- `navigate('/courses')` → `navigate('/admin/courses')`
- `navigate('/courses/create')` → `navigate('/admin/courses/create')`
- `navigate('/questions')` → `navigate('/admin/questions')`
- `navigate(-1)` — no change needed (relative back navigation)
- Dynamic paths like `` navigate(`/courses/${id}/edit`) `` → `` navigate(`/admin/courses/${id}/edit`) ``

---

## 8. Edge Cases

1. **Bookmarked old admin URLs** (`/users`, `/fields`): Fall to `path="*"` → redirect to `/` → RoleRedirect
2. **Teacher login**: Mock returns role `teacher` → RoleRedirect → `/teacher/` → ComingSoonPage
3. **Direct URL access** (`/admin/courses`): RoleRoute checks role → correct: render, wrong: redirect to `/{correctRole}/`
4. **Browser refresh on nested route** (`/admin/courses/123/lessons`): Works — BrowserRouter handles it

---

## 9. What Does NOT Change

- `packages/auth` — no modifications (ProtectedRoute, GuestRoute, AuthProvider, api service)
- `packages/ui` — no modifications (shared components, theme)
- `packages/types` — no modifications (type definitions)
- Auth flow (login, refresh, token management) — same mechanism, different routing
- Mock pattern (Axios adapter override) — same approach, merged into one file
- Vietnamese UI language — preserved throughout
