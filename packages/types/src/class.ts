// ─── Class (Lớp học) ─────────────────────────────────────

export interface Class {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  inviteCodeExpiry: string;
  teacherId: string;
  teacherName: string;
  studentCount: number;
  courseCount: number;
  createdAt: string;
}

export interface ClassStudent {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

export interface ClassCourse {
  id: string;
  courseId: string;
  courseTitle: string;
  assignedAt: string;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
}

// ─── Student Progress ───────────────────────────────────

export type LessonStatus = 'passed' | 'failed' | 'not_started';

export interface StudentLessonProgress {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  status: LessonStatus;
  highestScore: number | null;
}

export interface StudentCourseProgress {
  courseId: string;
  courseTitle: string;
  completionPercent: number;
  completedLessons: number;
  totalLessons: number;
}
