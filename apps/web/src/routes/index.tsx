import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GuestRoute } from '@ai-learning/auth';
import { Spin } from 'antd';
import AuthLayout from '../layouts/AuthLayout';
import AuthPage from '../pages/Auth/AuthPage';
import VerifyEmailPage from '../pages/VerifyEmail/VerifyEmailPage';
import RoleRoute, { RoleRedirect } from '../components/RoleRoute';

const AdminRoutes = lazy(() => import('./adminRoutes'));
const StudentRoutes = lazy(() => import('./studentRoutes'));
const TeacherRoutes = lazy(() => import('./teacherRoutes'));

// Learning pages (own layout — not under MainLayout)
const CourseLearnPage = lazy(() => import('../pages/student/Learning/CourseLearnPage'));
const LessonPage = lazy(() => import('../pages/student/Learning/LessonPage'));
const PracticePage = lazy(() => import('../pages/student/Learning/PracticePage'));
const PracticeResultPage = lazy(() => import('../pages/student/Learning/PracticeResultPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <Routes>
        {/* Public */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Route>

        {/* Protected (lazy loaded) — any authenticated user can view any interface */}
        <Route element={<RoleRoute />}>
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/student/*" element={<StudentRoutes />} />
          <Route path="/teacher/*" element={<TeacherRoutes />} />

          {/* Learning pages (student, own layout) */}
          <Route path="/learn/:courseId" element={<CourseLearnPage />} />
          <Route path="/learn/:courseId/:lessonId" element={<LessonPage />} />
          <Route path="/student/practice/:lessonId" element={<PracticePage />} />
          <Route path="/student/practice/:lessonId/result/:attemptId" element={<PracticeResultPage />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<RoleRedirect />} />
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </Suspense>
  );
}
