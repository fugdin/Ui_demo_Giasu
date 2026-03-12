import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';

const AdminLayout = lazy(() => import('../layouts/AdminLayout'));
const DashboardPage = lazy(() => import('../pages/admin/Dashboard/DashboardPage'));
const UserManagementPage = lazy(() => import('../pages/admin/UserManagement/UserManagementPage'));
const FieldManagementPage = lazy(() => import('../pages/admin/FieldManagement/FieldManagementPage'));
const CourseManagementPage = lazy(() => import('../pages/admin/CourseManagement/CourseManagementPage'));
const CourseFormPage = lazy(() => import('../pages/admin/CourseForm/CourseFormPage'));
const LessonManagementPage = lazy(() => import('../pages/admin/LessonManagement/LessonManagementPage'));
const LessonFormPage = lazy(() => import('../pages/admin/LessonForm/LessonFormPage'));
const LessonContentPage = lazy(() => import('../pages/admin/LessonContent/LessonContentPage'));
const QuestionBankPage = lazy(() => import('../pages/admin/QuestionBank/QuestionBankPage'));
const QuestionFormPage = lazy(() => import('../pages/admin/QuestionForm/QuestionFormPage'));
const AssessmentConfigPage = lazy(() => import('../pages/admin/AssessmentConfig/AssessmentConfigPage'));
const SystemSettingsPage = lazy(() => import('../pages/admin/SystemSettings/SystemSettingsPage'));

export default function AdminRoutes() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="fields" element={<FieldManagementPage />} />
          <Route path="courses" element={<CourseManagementPage />} />
          <Route path="courses/create" element={<CourseFormPage />} />
          <Route path="courses/:id/edit" element={<CourseFormPage />} />
          <Route path="courses/:courseId/lessons" element={<LessonManagementPage />} />
          <Route path="courses/:courseId/lessons/create" element={<LessonFormPage />} />
          <Route path="lessons/:id/edit" element={<LessonFormPage />} />
          <Route path="courses/:courseId/lessons/:lessonId/content" element={<LessonContentPage />} />
          <Route path="questions" element={<QuestionBankPage />} />
          <Route path="questions/create" element={<QuestionFormPage />} />
          <Route path="questions/:id/edit" element={<QuestionFormPage />} />
          <Route path="assessment-config" element={<AssessmentConfigPage />} />
          <Route path="settings" element={<SystemSettingsPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
