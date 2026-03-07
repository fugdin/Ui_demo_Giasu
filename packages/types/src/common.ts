// ─── Assessment Config ──────────────────────────────────

export interface ScoreLevelMapping {
  level: string;
  minScore: number;
  maxScore: number;
}

export interface LevelCourseMapping {
  level: string;
  courseIds: string[];
}

export interface AssessmentConfig {
  fieldId: string;
  fieldName: string;
  scoreLevelMappings: ScoreLevelMapping[];
  levelCourseMappings: LevelCourseMapping[];
}

// ─── System Settings ────────────────────────────────────

export interface SystemSettings {
  defaultPassThreshold: number;
  maxRetakePerDay: number;
  retakeResetHour: number;
  retakeResetMinute: number;
  maxAiMessagesPerDay: number;
  aiRevealAnswerAfterSubmit: boolean;
  assessmentDurationMinutes: number;
  assessmentQuestionCount: number;
}

// ─── Dashboard Stats ────────────────────────────────────

export interface AdminDashboardStats {
  totalStudents: number;
  activeCourses: number;
  completionRate: number;
  passRate: number;
  recentRegistrations: { date: string; count: number }[];
  completionByField: { field: string; percent: number }[];
}

export interface TeacherDashboardStats {
  totalClasses: number;
  totalStudents: number;
  averageCompletion: number;
  classes: {
    id: string;
    name: string;
    studentCount: number;
    completionPercent: number;
  }[];
}

// ─── Certificate ────────────────────────────────────────

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
}
