import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';

const TeacherLayout = lazy(() => import('../layouts/TeacherLayout'));
const DashboardPage = lazy(() => import('../pages/teacher/Dashboard/DashboardPage'));
const ClassListPage = lazy(() => import('../pages/teacher/Classes/ClassListPage'));
const ClassCreatePage = lazy(() => import('../pages/teacher/Classes/ClassCreatePage'));
const ClassDetailPage = lazy(() => import('../pages/teacher/Classes/ClassDetailPage'));
const StudentProgressPage = lazy(() => import('../pages/teacher/Classes/StudentProgressPage'));
const TeacherCoursesPage = lazy(() => import('../pages/teacher/Courses/TeacherCoursesPage'));
const SlideManagementPage = lazy(() => import('../pages/teacher/Courses/SlideManagementPage'));

export default function TeacherRoutes() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <Routes>
        <Route element={<TeacherLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="classes" element={<ClassListPage />} />
          <Route path="classes/create" element={<ClassCreatePage />} />
          <Route path="classes/:id" element={<ClassDetailPage />} />
          <Route path="classes/:id/students/:studentId" element={<StudentProgressPage />} />
          <Route path="courses" element={<TeacherCoursesPage />} />
          <Route path="courses/:courseId/lessons/:lessonId/slides" element={<SlideManagementPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
