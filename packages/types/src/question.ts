// ─── Question (Câu hỏi) ─────────────────────────────────

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'fill_in_blank'
  | 'true_false'
  | 'drag_and_drop'
  | 'sort_paragraphs';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuestionOption {
  id: string;
  content: string;
  isCorrect: boolean;
}

export interface DragDropItem {
  id: string;
  content: string;
  targetPosition: number;
}

export interface SortItem {
  id: string;
  content: string;
  correctOrder: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  content: string;
  difficulty: DifficultyLevel;
  lessonId?: string;
  lessonTitle?: string;
  options?: QuestionOption[];
  correctAnswer?: string; // for fill_in_blank
  correctBoolean?: boolean; // for true_false
  dragDropItems?: DragDropItem[];
  sortItems?: SortItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  content: string;
  difficulty: DifficultyLevel;
  lessonId?: string;
  options?: Omit<QuestionOption, 'id'>[];
  correctAnswer?: string;
  correctBoolean?: boolean;
  dragDropItems?: Omit<DragDropItem, 'id'>[];
  sortItems?: Omit<SortItem, 'id'>[];
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}
