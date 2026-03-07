import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute, GuestRoute } from '@ai-learning/auth';
import AdminLayout from '../layouts/AdminLayout';
import AuthPage from '../pages/AuthPage';

import DashboardPage from '../pages/Dashboard/DashboardPage';
import UserManagementPage from '../pages/UserManagement/UserManagementPage';
import FieldManagementPage from '../pages/FieldManagement/FieldManagementPage';
import CourseManagementPage from '../pages/CourseManagement/CourseManagementPage';
import CourseFormPage from '../pages/CourseForm/CourseFormPage';
import LessonManagementPage from '../pages/LessonManagement/LessonManagementPage';
import LessonFormPage from '../pages/LessonForm/LessonFormPage';
import LessonContentPage from '../pages/LessonContent/LessonContentPage';
import QuestionBankPage from '../pages/QuestionBank/QuestionBankPage';
import QuestionFormPage from '../pages/QuestionForm/QuestionFormPage';
import AssessmentConfigPage from '../pages/AssessmentConfig/AssessmentConfigPage';
import SystemSettingsPage from '../pages/SystemSettings/SystemSettingsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Guest routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Route>

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/fields" element={<FieldManagementPage />} />
          <Route path="/courses" element={<CourseManagementPage />} />
          <Route path="/courses/create" element={<CourseFormPage />} />
          <Route path="/courses/:id/edit" element={<CourseFormPage />} />
          <Route path="/courses/:courseId/lessons" element={<LessonManagementPage />} />
          <Route path="/courses/:courseId/lessons/create" element={<LessonFormPage />} />
          <Route path="/lessons/:id/edit" element={<LessonFormPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId/content" element={<LessonContentPage />} />
          <Route path="/questions" element={<QuestionBankPage />} />
          <Route path="/questions/create" element={<QuestionFormPage />} />
          <Route path="/questions/:id/edit" element={<QuestionFormPage />} />
          <Route path="/assessment-config" element={<AssessmentConfigPage />} />
          <Route path="/settings" element={<SystemSettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
