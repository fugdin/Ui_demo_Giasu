// ─── Course (Khóa học) ──────────────────────────────────

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  fieldId: string;
  fieldName: string;
  level: CourseLevel;
  description: string;
  passThreshold: number;
  lessonCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  title: string;
  fieldId: string;
  level: CourseLevel;
  description: string;
  passThreshold: number;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {}
