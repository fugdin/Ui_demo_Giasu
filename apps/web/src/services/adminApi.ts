import { api } from '@ai-learning/auth';
import type {
  AdminDashboardStats,
  User,
  Field, CreateFieldRequest, UpdateFieldRequest,
  Course, CreateCourseRequest, UpdateCourseRequest,
  Lesson, CreateLessonRequest, UpdateLessonRequest,
  LessonTheory, LessonInteraction,
  Question, CreateQuestionRequest, UpdateQuestionRequest,
  AssessmentConfig,
  SystemSettings,
  PaginatedResponse, TableParams,
} from '@ai-learning/types';

// ─── Dashboard ──────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<AdminDashboardStats>('/admin/dashboard'),
};

// ─── Users ──────────────────────────────────────────────
export const usersApi = {
  getAll: (params: TableParams) => api.get<PaginatedResponse<User>>('/users', { params }),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<User>('/users', data),
  updateRole: (id: string, role: string) => api.patch<User>(`/users/${id}`, { role }),
  toggleActive: (id: string) => api.patch<User>(`/users/${id}/toggle-active`),
};

// ─── Fields ─────────────────────────────────────────────
export const fieldsApi = {
  getAll: () => api.get<Field[]>('/fields'),
  create: (data: CreateFieldRequest) => api.post<Field>('/fields', data),
  update: (id: string, data: UpdateFieldRequest) => api.put<Field>(`/fields/${id}`, data),
  delete: (id: string) => api.delete(`/fields/${id}`),
  toggleAssessment: (id: string, hasAssessment: boolean) =>
    api.patch<Field>(`/fields/${id}`, { hasAssessment }),
};

// ─── Courses ────────────────────────────────────────────
export const coursesApi = {
  getAll: (params?: TableParams) => api.get<PaginatedResponse<Course>>('/courses', { params }),
  getById: (id: string) => api.get<Course>(`/courses/${id}`),
  create: (data: CreateCourseRequest) => api.post<Course>('/courses', data),
  update: (id: string, data: UpdateCourseRequest) => api.put<Course>(`/courses/${id}`, data),
};

// ─── Lessons ────────────────────────────────────────────
export const lessonsApi = {
  getByCourse: (courseId: string) => api.get<Lesson[]>(`/courses/${courseId}/lessons`),
  getById: (id: string) => api.get<Lesson>(`/lessons/${id}`),
  create: (courseId: string, data: CreateLessonRequest) =>
    api.post<Lesson>(`/courses/${courseId}/lessons`, data),
  update: (id: string, data: UpdateLessonRequest) => api.put<Lesson>(`/lessons/${id}`, data),
  delete: (id: string) => api.delete(`/lessons/${id}`),
  reorder: (courseId: string, lessonIds: string[]) =>
    api.put(`/courses/${courseId}/lessons/reorder`, { lessonIds }),
  // Theory
  getTheory: (id: string) => api.get<LessonTheory>(`/lessons/${id}/theory`),
  saveTheory: (id: string, data: Partial<LessonTheory>) =>
    api.put<LessonTheory>(`/lessons/${id}/theory`, data),
  uploadTheoryPdf: (id: string, formData: FormData) =>
    api.post<{ pdfUrl: string }>(`/lessons/${id}/theory/pdf`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteTheoryPdf: (id: string) => api.delete(`/lessons/${id}/theory/pdf`),
  // Interaction
  getInteraction: (id: string) => api.get<LessonInteraction>(`/lessons/${id}/interaction`),
  saveInteraction: (id: string, data: Partial<LessonInteraction>) =>
    api.put<LessonInteraction>(`/lessons/${id}/interaction`, data),
  // Questions
  getLessonQuestions: (id: string) => api.get<Question[]>(`/lessons/${id}/questions`),
  addQuestions: (id: string, questionIds: string[]) =>
    api.post(`/lessons/${id}/questions`, { questionIds }),
  removeQuestion: (id: string, questionId: string) =>
    api.delete(`/lessons/${id}/questions/${questionId}`),
  reorderQuestions: (id: string, questionIds: string[]) =>
    api.put(`/lessons/${id}/questions/reorder`, { questionIds }),
  // Slides
  uploadSlide: (lessonId: string, formData: FormData) =>
    api.post(`/lessons/${lessonId}/slides`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteSlide: (lessonId: string) => api.delete(`/lessons/${lessonId}/slides`),
};

// ─── Questions ──────────────────────────────────────────
export const questionsApi = {
  getAll: (params?: TableParams) => api.get<PaginatedResponse<Question>>('/questions', { params }),
  getById: (id: string) => api.get<Question>(`/questions/${id}`),
  create: (data: CreateQuestionRequest) => api.post<Question>('/questions', data),
  update: (id: string, data: UpdateQuestionRequest) => api.put<Question>(`/questions/${id}`, data),
  delete: (id: string) => api.delete(`/questions/${id}`),
};

// ─── Assessment Config ──────────────────────────────────
export const assessmentApi = {
  getConfig: (fieldId: string) => api.get<AssessmentConfig>(`/assessment-config/${fieldId}`),
  saveConfig: (data: AssessmentConfig) => api.put<AssessmentConfig>('/assessment-config', data),
};

// ─── System Settings ────────────────────────────────────
export const settingsApi = {
  get: () => api.get<SystemSettings>('/settings'),
  save: (data: SystemSettings) => api.put<SystemSettings>('/settings', data),
};
