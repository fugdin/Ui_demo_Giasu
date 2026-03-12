// ─── Chapter (Chương) ───────────────────────────────────

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessonCount: number;
}

export interface ChapterWithLessons extends Chapter {
  lessons: LessonInChapter[];
}

export interface LessonInChapter {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  /** e.g. "1.1", "2.3" */
  label: string;
  status: 'passed' | 'failed' | 'not_started' | 'locked';
  shortDescription: string;
}

// ─── Lesson (Bài học) ────────────────────────────────────

export type InteractionType = 'video_youtube' | 'simulation_html_css';

export interface Lesson {
  id: string;
  courseId: string;
  chapterId?: string;
  title: string;
  order: number;
  interactionType: InteractionType;
  shortDescription: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLessonRequest {
  title: string;
  order: number;
  interactionType: InteractionType;
  shortDescription: string;
}

export interface UpdateLessonRequest extends Partial<CreateLessonRequest> {}

export interface LessonTheory {
  lessonId: string;
  pdfUrl?: string;
  slideEnabled: boolean;
  slideEmbedUrl?: string;
  htmlContent?: string;
}

export interface LessonInteraction {
  lessonId: string;
  type: InteractionType;
  youtubeUrl?: string;
  htmlContent?: string;
}

export interface LessonSlide {
  id: string;
  lessonId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}
