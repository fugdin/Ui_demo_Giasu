// ─── Lesson (Bài học) ────────────────────────────────────

export type InteractionType = 'video_youtube' | 'simulation_html_css';

export interface Lesson {
  id: string;
  courseId: string;
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
