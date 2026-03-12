import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Spin } from 'antd';

const MainLayout = lazy(() => import('../layouts/MainLayout'));
const DashboardPage = lazy(() => import('../pages/student/Dashboard/DashboardPage'));
const AssessmentStartPage = lazy(() => import('../pages/student/Assessment/AssessmentStartPage'));
const AssessmentTakePage = lazy(() => import('../pages/student/Assessment/AssessmentTakePage'));
const AssessmentResultPage = lazy(() => import('../pages/student/Assessment/AssessmentResultPage'));
const CourseListPage = lazy(() => import('../pages/student/Courses/CourseListPage'));
const CourseDetailPage = lazy(() => import('../pages/student/Courses/CourseDetailPage'));
const MyCoursesPage = lazy(() => import('../pages/student/MyCourses/MyCoursesPage'));
const ProgressPage = lazy(() => import('../pages/student/Progress/ProgressPage'));
const CertificatesPage = lazy(() => import('../pages/student/Certificates/CertificatesPage'));
const JoinClassPage = lazy(() => import('../pages/student/JoinClass/JoinClassPage'));

export default function StudentRoutes() {
  return (
    <Suspense fallback={<Spin fullscreen />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="assessment" element={<AssessmentStartPage />} />
          <Route path="assessment/take" element={<AssessmentTakePage />} />
          <Route path="assessment/result/:id" element={<AssessmentResultPage />} />
          <Route path="courses" element={<CourseListPage />} />
          <Route path="courses/:id" element={<CourseDetailPage />} />
          <Route path="my-courses" element={<MyCoursesPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="certificates" element={<CertificatesPage />} />
          <Route path="join-class" element={<JoinClassPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
