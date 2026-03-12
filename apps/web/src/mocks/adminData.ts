import type {
  AdminDashboardStats,
  AssessmentConfig,
  SystemSettings,
  Field,
  Course,
  Lesson,
  LessonTheory,
  LessonInteraction,
  Question,
  User,
} from '@ai-learning/types';

// Helper to build ISO strings
const now = () => new Date().toISOString();

export const usersSeed: User[] = [
  {
    id: 'u-admin',
    name: 'Mock Admin',
    email: 'admin@example.com',
    role: 'admin',
    isActive: true,
    emailVerified: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'u-teacher',
    name: 'Giáo viên A',
    email: 'teacher@example.com',
    role: 'teacher',
    isActive: true,
    emailVerified: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'u-student',
    name: 'Học sinh B',
    email: 'student@example.com',
    role: 'student',
    isActive: false,
    emailVerified: false,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const fieldsSeed: Field[] = [
  {
    id: 'f-it',
    name: 'Công nghệ thông tin',
    hasAssessment: true,
    courseCount: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'f-business',
    name: 'Kinh doanh',
    hasAssessment: true,
    courseCount: 1,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'f-design',
    name: 'Thiết kế',
    hasAssessment: false,
    courseCount: 0,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const coursesSeed: Course[] = [
  {
    id: 'c-react',
    title: 'React cơ bản',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'beginner',
    description: 'Làm quen React và component cơ bản.',
    passThreshold: 70,
    lessonCount: 3,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-node',
    title: 'Node.js API',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'intermediate',
    description: 'Xây dựng REST API với Node.js.',
    passThreshold: 75,
    lessonCount: 2,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-marketing',
    title: 'Marketing căn bản',
    fieldId: 'f-business',
    fieldName: 'Kinh doanh',
    level: 'beginner',
    description: 'Nhập môn marketing hiện đại.',
    passThreshold: 65,
    lessonCount: 2,
    createdAt: now(),
    updatedAt: now(),
  },
];

export const lessonsSeed: Lesson[] = [
  {
    id: 'l-react-1',
    courseId: 'c-react',
    title: 'Giới thiệu React',
    order: 1,
    interactionType: 'video_youtube',
    shortDescription: 'Tổng quan thư viện React.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-react-2',
    courseId: 'c-react',
    title: 'Component & Props',
    order: 2,
    interactionType: 'video_youtube',
    shortDescription: 'Hiểu về component và props.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-react-3',
    courseId: 'c-react',
    title: 'State & Lifecycle',
    order: 3,
    interactionType: 'simulation_html_css',
    shortDescription: 'Quản lý state và vòng đời.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-node-1',
    courseId: 'c-node',
    title: 'Thiết lập dự án',
    order: 1,
    interactionType: 'video_youtube',
    shortDescription: 'Chuẩn bị môi trường Node.js.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-node-2',
    courseId: 'c-node',
    title: 'Router & Controller',
    order: 2,
    interactionType: 'simulation_html_css',
    shortDescription: 'Xây dựng router cơ bản.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-marketing-1',
    courseId: 'c-marketing',
    title: '4P Marketing',
    order: 1,
    interactionType: 'video_youtube',
    shortDescription: 'Product, Price, Place, Promotion.',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'l-marketing-2',
    courseId: 'c-marketing',
    title: 'Chiến lược kênh số',
    order: 2,
    interactionType: 'simulation_html_css',
    shortDescription: 'Tổng quan kênh digital.',
    createdAt: now(),
    updatedAt: now(),
  },
];

export const lessonTheorySeed: Record<string, LessonTheory> = Object.fromEntries(
  lessonsSeed.map((l) => [
    l.id,
    {
      lessonId: l.id,
      htmlContent: `<h2>${l.title}</h2><p>Nội dung mô phỏng cho ${l.title}.</p>`,
      slideEnabled: false,
    },
  ]),
);

export const lessonInteractionSeed: Record<string, LessonInteraction> = Object.fromEntries(
  lessonsSeed.map((l) => [
    l.id,
    l.interactionType === 'video_youtube'
      ? {
          lessonId: l.id,
          type: 'video_youtube',
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        }
      : {
          lessonId: l.id,
          type: 'simulation_html_css',
          htmlCode: '<div class="box">Hello world</div>',
          cssCode: '.box { color: #1890ff; font-weight: 600; }',
          jsCode: '// add JS here',
        },
  ]),
);

export const questionsSeed: Question[] = [
  {
    id: 'q1',
    type: 'single_choice',
    content: 'React là gì?',
    difficulty: 'easy',
    lessonId: 'l-react-1',
    lessonTitle: 'Giới thiệu React',
    options: [
      { id: 'q1o1', content: 'Thư viện JS để xây dựng UI', isCorrect: true },
      { id: 'q1o2', content: 'Framework CSS', isCorrect: false },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'q2',
    type: 'true_false',
    content: 'Node.js chạy trên trình duyệt.',
    difficulty: 'easy',
    lessonId: 'l-node-1',
    lessonTitle: 'Thiết lập dự án',
    correctBoolean: false,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'q3',
    type: 'multiple_choice',
    content: 'Chọn các thành phần của 4P',
    difficulty: 'medium',
    lessonId: 'l-marketing-1',
    lessonTitle: '4P Marketing',
    options: [
      { id: 'q3o1', content: 'Product', isCorrect: true },
      { id: 'q3o2', content: 'Place', isCorrect: true },
      { id: 'q3o3', content: 'People', isCorrect: false },
    ],
    createdAt: now(),
    updatedAt: now(),
  },
];

export const assessmentConfigsSeed: AssessmentConfig[] = [
  {
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    scoreLevelMappings: [
      { level: 'Yếu', minScore: 0, maxScore: 49 },
      { level: 'Trung bình', minScore: 50, maxScore: 69 },
      { level: 'Khá', minScore: 70, maxScore: 84 },
      { level: 'Giỏi', minScore: 85, maxScore: 100 },
    ],
    levelCourseMappings: [
      { level: 'Yếu', courseIds: ['c-react'] },
      { level: 'Khá', courseIds: ['c-react', 'c-node'] },
    ],
  },
];

export const settingsSeed: SystemSettings = {
  defaultPassThreshold: 70,
  maxRetakePerDay: 3,
  retakeResetHour: 4,
  retakeResetMinute: 0,
  maxAiMessagesPerDay: 20,
  aiRevealAnswerAfterSubmit: false,
  assessmentDurationMinutes: 45,
  assessmentQuestionCount: 20,
};

export const dashboardStatsSeed: AdminDashboardStats = {
  totalStudents: 1520,
  activeCourses: coursesSeed.length,
  completionRate: 76.4,
  passRate: 68.9,
  recentRegistrations: Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    return { date: date.toISOString().slice(0, 10), count: 20 + idx * 5 };
  }),
  completionByField: [
    { field: 'Công nghệ thông tin', percent: 40 },
    { field: 'Kinh doanh', percent: 35 },
    { field: 'Thiết kế', percent: 25 },
  ],
};

export const deepClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));

export const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
