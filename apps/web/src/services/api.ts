import { api } from '@ai-learning/auth';

// Dashboard
export const studentApi = {
  getDashboard: () => api.get('/student/dashboard'),
};

// Fields & Subjects
export const fieldsApi = {
  getFields: (params?: { hasAssessment?: boolean }) => api.get('/fields', { params }),
  getSubjects: (fieldId: string) => api.get(`/fields/${fieldId}/subjects`),
};

// Courses
export const coursesApi = {
  getCourses: (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    fieldId?: string;
    level?: string;
  }) => api.get('/courses', { params }),
  getCourseDetail: (id: string) => api.get(`/courses/${id}`),
  getCourseLessons: (courseId: string) => api.get(`/courses/${courseId}/lessons`),
  getCourseChapters: (courseId: string) => api.get(`/courses/${courseId}/chapters`),
};

// Enrollments
export const enrollmentsApi = {
  getEnrollments: (params?: { status?: string }) => api.get('/enrollments', { params }),
  enroll: (courseId: string) => api.post(`/enrollments/${courseId}`),
};

// Assessment
export const assessmentApi = {
  start: (data: { fieldId: string; subjectId: string; level: string }) =>
    api.post('/assessment/start', data),
  submit: (data: { sessionId: string; answers: Record<string, string | string[]> }) =>
    api.post('/assessment/submit', data),
  getResult: (id: string) => api.get(`/assessment/result/${id}`),
};

// Auth extras
export const authExtraApi = {
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
};

// Classes
export const classApi = {
  join: (code: string) => api.post('/classes/join', { code }),
  getMyClasses: () => api.get('/classes/my'),
};

// ─── Student Learning ────────────────────────────────────
export const learningApi = {
  // Lesson detail (theory + interaction + practice info)
  getLesson: (lessonId: string) => api.get(`/learning/lessons/${lessonId}`),
  // Practice questions for a lesson
  getPractice: (lessonId: string) => api.get(`/learning/practice/${lessonId}`),
  // Submit practice
  submitPractice: (lessonId: string, answers: Record<string, any>) =>
    api.post(`/learning/practice/${lessonId}/submit`, { answers }),
  // Get attempt result
  getAttemptResult: (attemptId: string) => api.get(`/learning/attempts/${attemptId}`),
  // Progress
  getProgress: (month?: string) => api.get('/learning/progress', { params: { month } }),
  // Certificates
  getCertificates: () => api.get('/learning/certificates'),
  // AI Chat
  sendChat: (data: { courseId: string; lessonId: string; message: string; attemptId?: string; isBeforeSubmit?: boolean }) =>
    api.post('/ai/chat', data),
};

// ─── Teacher ─────────────────────────────────────────────
export const teacherApi = {
  // Dashboard
  getDashboard: () => api.get('/teacher/dashboard'),
  getActivities: () => api.get('/teacher/activities'),
  // Classes
  getClasses: () => api.get('/teacher/classes'),
  createClass: (data: { name: string; description?: string }) => api.post('/teacher/classes', data),
  getClassDetail: (id: string) => api.get(`/teacher/classes/${id}`),
  deleteClass: (id: string) => api.delete(`/teacher/classes/${id}`),
  regenerateInviteCode: (id: string) => api.post(`/teacher/classes/${id}/regenerate-code`),
  // Class courses
  assignCourse: (classId: string, courseId: string) => api.post(`/teacher/classes/${classId}/courses`, { courseId }),
  removeCourse: (classId: string, courseId: string) => api.delete(`/teacher/classes/${classId}/courses/${courseId}`),
  // Student progress
  getStudentProgress: (classId: string, studentId: string) =>
    api.get(`/teacher/classes/${classId}/students/${studentId}`),
  // Courses & Slides
  getCourses: () => api.get('/teacher/courses'),
  getSlide: (lessonId: string) => api.get(`/teacher/lessons/${lessonId}/slide`),
  uploadSlide: (lessonId: string, formData: FormData) =>
    api.post(`/teacher/lessons/${lessonId}/slides`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteSlide: (lessonId: string) => api.delete(`/teacher/lessons/${lessonId}/slides`),
};
