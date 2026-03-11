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
│   │   ├── adminRoutes.tsx        ← React.lazy() all admin pages, wrapped in Suspense with Spin fallback
│   │   ├── studentRoutes.tsx      ← React.lazy() all student pages, wrapped in Suspense with Spin fallback
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

/admin/                    → AdminLayout (sidebar) → DashboardPage (index)
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

/student/                  → MainLayout (top-bar) → DashboardPage (index)
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
  <Route element={<GuestRoute redirectTo="/" />}>
    <Route path="/login" element={<AuthPage />} />
    <Route path="/register" element={<AuthPage />} />
  </Route>
  <Route element={<AuthLayout />}>
    <Route path="/verify-email" element={<VerifyEmailPage />} />
  </Route>

  {/* Role-based (lazy loaded) */}
  <Route element={<RoleRoute allowedRoles={['admin']} />}>
    <Route path="/admin/*" element={<AdminRoutes />} />
  </Route>
  <Route element={<RoleRoute allowedRoles={['student']} />}>
    <Route path="/student/*" element={<StudentRoutes />} />
  </Route>
  <Route element={<RoleRoute allowedRoles={['teacher']} />}>
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
  allowedRoles: UserRole[];
}

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role!)) return <Navigate to={`/${user?.role}/`} replace />;

  return <Outlet />;
}
```

Key difference from ProtectedRoute: uses `<Navigate replace>` (SPA navigation) instead of `window.location.href` (full page redirect to different port). Uses `replace` to prevent history pollution (back button redirect loops).

### RoleRedirect (new)

```tsx
function RoleRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spin fullscreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user?.role}/`} replace />;
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
- Change logo click: `navigate('/')` → `navigate('/student/')` (avoid unnecessary redirect through RoleRedirect)
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

### Route Collision Resolution

Admin and student mocks share overlapping endpoints (`GET /fields`, `GET /courses`, `GET /courses/:id`, `GET /courses/:id/lessons`). These are disambiguated using the **logged-in user's role** stored in localStorage mock:

```
GET /fields:
  → if current user role === 'admin' → admin handler (full CRUD, returns fieldsDb)
  → else → student handler (read-only, supports ?hasAssessment filter)

GET /courses:
  → if current user role === 'admin' → admin handler (paginated coursesDb)
  → else → student handler (filtered by fieldId/level/search)

GET /courses/:id:
  → if current user role === 'admin' → admin handler (coursesDb lookup)
  → else → student handler (coursesSeed lookup with HTML descriptions)

GET /courses/:id/lessons:
  → if current user role === 'admin' → admin handler (lessonsDb)
  → else → student handler (lessonsSeed sorted by order)
```

**Implementation:** The mock router reads the current user from `localStorage.getItem('ai-learning-mock-user')`, parses the role, and dispatches to the correct handler for overlapping routes. Non-overlapping routes (e.g. `/users`, `/enrollments`, `/assessment/*`) match directly without role checking.

**Route processing order:**
1. Auth routes first (`/auth/*`) — always student mock handler
2. Non-overlapping admin-only routes (`/users`, `/lessons/*`, `/questions/*`, `/assessment-config/*`, `/settings`, `/admin/dashboard`)
3. Non-overlapping student-only routes (`/student/dashboard`, `/enrollments`, `/assessment/*`, `/fields/:id/subjects`)
4. Overlapping routes with role-based dispatch (`/fields`, `/courses`, `/courses/:id`, `/courses/:id/lessons`)

**Route groups:**

| Group | Endpoints | Source |
|---|---|---|
| Auth | `POST /auth/login\|register\|refresh`, `GET /auth/me` | student mock (multi-role) |
| Admin Dashboard | `GET /admin/dashboard` | admin mock |
| Users | `GET/POST /users`, `PATCH /users/:id` | admin mock |
| Fields | `GET/POST /fields`, `PUT/PATCH/DELETE /fields/:id` | role-dispatched (admin: CRUD, student: read + filter) |
| Courses | `GET/POST /courses`, `GET/PUT /courses/:id` | role-dispatched (admin: CRUD, student: read + filter) |
| Lessons | Full CRUD + theory + interaction + questions | admin mock |
| Questions | Full CRUD | admin mock |
| Assessment Config | `GET/PUT /assessment-config` | admin mock |
| Settings | `GET/PUT /settings` | admin mock |
| Student Dashboard | `GET /student/dashboard` | student mock |
| Subjects | `GET /fields/:id/subjects` | student mock |
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

### Added to apps/web/package.json (from admin — only truly new deps)

```json
{
  "@dnd-kit/core": "...",
  "@dnd-kit/sortable": "...",
  "@dnd-kit/utilities": "...",
  "@monaco-editor/react": "...",
  "@tinymce/tinymce-react": "..."
}
```

Note: `@ant-design/charts` and `dayjs` are already in student's package.json — no need to add.

### Workspace Updates

**Root package.json scripts:**
- Remove: `dev:admin`, `dev:teacher`
- Change: `"dev:web": "turbo run dev --filter=@ai-learning/web"` (filter matches new package name)
- Keep: `dev` (turbo run dev — auto-detects remaining app)

### Vite Config

- Keep port 3001
- Keep `base: '/'` (student default) — do NOT inherit admin's `base: '/Ui_demo_Giasu/'`
- Keep `@` alias (`resolve.alias: { '@': path.resolve(__dirname, './src') }`)
- `BrowserRouter` in `App.tsx`: no `basename` prop (matches `base: '/'`)

### Cleanup

- Delete: `apps/admin/` (fully merged)
- Delete: `apps/teacher/` (placeholder integrated)
- Delete: Legacy `LoginPage.tsx`, `RegisterPage.tsx` in student (already replaced by `Auth/AuthPage.tsx`)
- Do NOT copy: admin's `AuthPage.tsx`, `LoginPage.tsx`, `RegisterPage.tsx` (using student's AuthPage)

### AuthPage Decision

Using student's `Auth/AuthPage.tsx` which includes:
- Sliding panel login/register UI
- `PasswordStrength` component on register form
- Register flow: on success → `navigate('/verify-email?email=...')` (email verification)
- This is the behavior for ALL roles (admin, student, teacher)

---

## 7. Admin Page Navigation Fix

Admin pages currently use absolute paths like `navigate('/courses')`. After merge, these need `/admin/` prefix.

**Strategy:** Update all `navigate()`, `<Link>`, and breadcrumb `path` props in admin pages to include `/admin/` prefix.

Affected patterns:
- `navigate('/courses')` → `navigate('/admin/courses')`
- `navigate('/courses/create')` → `navigate('/admin/courses/create')`
- `navigate('/questions')` → `navigate('/admin/questions')`
- `navigate(-1)` — no change needed (relative back navigation)
- Dynamic paths like `` navigate(`/courses/${id}/edit`) `` → `` navigate(`/admin/courses/${id}/edit`) ``
- Breadcrumb `path` props: `{ path: '/courses' }` → `{ path: '/admin/courses' }` (affects CourseFormPage, LessonManagementPage, LessonFormPage, LessonContentPage, QuestionFormPage)

### Admin Import Path Fix

Admin pages use `@/services/api` import alias. After copying into `apps/web/`, this resolves to the **student** API service. All admin page imports must be updated:

- `import { ...Api } from '@/services/api'` → `import { ...Api } from '@/services/adminApi'`
- Affected: all 12 admin pages that import from `@/services/api`

---

## 7b. Student Page Navigation Fix

Student pages also use hardcoded absolute paths that break when moved under `/student/*`:

| Page | Current | After |
|---|---|---|
| `DashboardPage` | `navigate('/courses/${id}')`, `navigate('/assessment')` | `navigate('/student/courses/${id}')`, `navigate('/student/assessment')` |
| `AssessmentStartPage` | `navigate('/assessment/take')` | `navigate('/student/assessment/take')` |
| `AssessmentTakePage` | `navigate('/assessment', ...)`, `navigate('/assessment/result/${id}', ...)` | `navigate('/student/assessment', ...)`, `navigate('/student/assessment/result/${id}', ...)` |
| `AssessmentResultPage` | `navigate('/courses')`, `navigate('/')` | `navigate('/student/courses')`, `navigate('/student/')` |
| `CourseDetailPage` | `navigate('/my-courses')` | `navigate('/student/my-courses')` |
| `MyCoursesPage` | `navigate('/courses')`, `navigate('/courses/${id}')` | `navigate('/student/courses')`, `navigate('/student/courses/${id}')` |
| `AuthPage` | `navigate('/verify-email?email=...')` | No change (verify-email is a public route, not under /student/) |

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
