import type { TeacherDashboardStats, Class, ClassStudent, ClassCourse, StudentLessonProgress, StudentCourseProgress, Certificate } from '@ai-learning/types';

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 3600 * 1000).toISOString();

// ─── Teacher Dashboard ──────────────────────────────────
export const teacherDashboardSeed: TeacherDashboardStats = {
  totalClasses: 3,
  totalStudents: 85,
  averageCompletion: 62,
  classes: [
    { id: 'tc-1', name: 'Python K1', studentCount: 30, completionPercent: 72 },
    { id: 'tc-2', name: 'JavaScript Nâng cao', studentCount: 25, completionPercent: 45 },
    { id: 'tc-3', name: 'React Cơ bản', studentCount: 30, completionPercent: 68 },
  ],
};

// ─── Activities ─────────────────────────────────────────
export const activitiesSeed = [
  { id: 'a-1', text: 'Nguyễn Văn Nam hoàn thành Bài 5 — Vòng lặp', time: '2 giờ trước', type: 'completed' },
  { id: 'a-2', text: 'Lê Thị Anh đạt 85% Bài 3 — Câu lệnh điều kiện', time: '3 giờ trước', type: 'passed' },
  { id: 'a-3', text: 'Trần Minh Đức tham gia lớp Python K1', time: '5 giờ trước', type: 'joined' },
  { id: 'a-4', text: 'Phạm Hương đạt 92% Bài 7 — List & Tuple', time: '1 ngày trước', type: 'passed' },
  { id: 'a-5', text: 'Ngô Quốc Bảo hoàn thành khóa Marketing căn bản', time: '2 ngày trước', type: 'completed' },
];

// ─── Classes ────────────────────────────────────────────
export const classesSeed: Class[] = [
  {
    id: 'tc-1',
    name: 'Python K1',
    description: 'Lớp Python cơ bản khóa 1',
    inviteCode: 'PYK101',
    inviteCodeExpiry: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    teacherId: 'mock-teacher',
    teacherName: 'Giáo viên Trần Thị B',
    studentCount: 30,
    courseCount: 2,
    createdAt: daysAgo(90),
  },
  {
    id: 'tc-2',
    name: 'JavaScript Nâng cao',
    description: 'Lớp JS nâng cao cho sinh viên năm 3',
    inviteCode: 'JSA202',
    inviteCodeExpiry: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    teacherId: 'mock-teacher',
    teacherName: 'Giáo viên Trần Thị B',
    studentCount: 25,
    courseCount: 1,
    createdAt: daysAgo(60),
  },
  {
    id: 'tc-3',
    name: 'React Cơ bản',
    description: 'Lớp React cho người mới bắt đầu',
    inviteCode: 'RCT303',
    inviteCodeExpiry: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    teacherId: 'mock-teacher',
    teacherName: 'Giáo viên Trần Thị B',
    studentCount: 30,
    courseCount: 1,
    createdAt: daysAgo(30),
  },
];

// ─── Class Students ─────────────────────────────────────
export const classStudentsSeed: Record<string, ClassStudent[]> = {
  'tc-1': [
    { id: 'cs-1', name: 'Nguyễn Văn Nam', email: 'nam@email.com', joinedAt: daysAgo(85) },
    { id: 'cs-2', name: 'Lê Thị Anh', email: 'anh@email.com', joinedAt: daysAgo(80) },
    { id: 'cs-3', name: 'Trần Minh Đức', email: 'duc@email.com', joinedAt: daysAgo(75) },
    { id: 'cs-4', name: 'Phạm Thị Hương', email: 'huong@email.com', joinedAt: daysAgo(70) },
    { id: 'cs-5', name: 'Ngô Quốc Bảo', email: 'bao@email.com', joinedAt: daysAgo(65) },
  ],
  'tc-2': [
    { id: 'cs-6', name: 'Vũ Đình Khôi', email: 'khoi@email.com', joinedAt: daysAgo(55) },
    { id: 'cs-7', name: 'Hoàng Mai Linh', email: 'linh@email.com', joinedAt: daysAgo(50) },
    { id: 'cs-8', name: 'Đặng Văn Tùng', email: 'tung@email.com', joinedAt: daysAgo(45) },
  ],
  'tc-3': [
    { id: 'cs-9', name: 'Bùi Thanh Hà', email: 'ha@email.com', joinedAt: daysAgo(25) },
    { id: 'cs-10', name: 'Lý Minh Tuấn', email: 'tuan@email.com', joinedAt: daysAgo(20) },
  ],
};

// ─── Class Courses ──────────────────────────────────────
export const classCoursesSeed: Record<string, ClassCourse[]> = {
  'tc-1': [
    { id: 'cc-1', courseId: 'c-python-basic', courseTitle: 'Python Cơ bản', assignedAt: daysAgo(88) },
    { id: 'cc-2', courseId: 'c-python-inter', courseTitle: 'Python Trung cấp', assignedAt: daysAgo(60) },
  ],
  'tc-2': [
    { id: 'cc-3', courseId: 'c-js-advanced', courseTitle: 'JavaScript Nâng cao', assignedAt: daysAgo(58) },
  ],
  'tc-3': [
    { id: 'cc-4', courseId: 'c-react-basic', courseTitle: 'React Cơ bản', assignedAt: daysAgo(28) },
  ],
};

// ─── Student Progress (per student per course) ──────────
export const studentProgressSeed: Record<string, { courses: StudentCourseProgress[]; lessons: StudentLessonProgress[] }> = {
  'cs-1': {
    courses: [
      { courseId: 'c-python-basic', courseTitle: 'Python Cơ bản', completionPercent: 70, completedLessons: 14, totalLessons: 20 },
    ],
    lessons: [
      { lessonId: 'l-py-1', lessonTitle: 'Giới thiệu Python', lessonOrder: 1, status: 'passed', highestScore: 95 },
      { lessonId: 'l-py-2', lessonTitle: 'Biến & Kiểu dữ liệu', lessonOrder: 2, status: 'passed', highestScore: 80 },
      { lessonId: 'l-py-3', lessonTitle: 'Câu lệnh điều kiện', lessonOrder: 3, status: 'passed', highestScore: 85 },
      { lessonId: 'l-py-4', lessonTitle: 'Vòng lặp', lessonOrder: 4, status: 'passed', highestScore: 90 },
      { lessonId: 'l-py-5', lessonTitle: 'Vòng lặp nâng cao', lessonOrder: 5, status: 'failed', highestScore: 65 },
      { lessonId: 'l-py-6', lessonTitle: 'Hàm', lessonOrder: 6, status: 'not_started', highestScore: null },
    ],
  },
  'cs-2': {
    courses: [
      { courseId: 'c-python-basic', courseTitle: 'Python Cơ bản', completionPercent: 90, completedLessons: 18, totalLessons: 20 },
    ],
    lessons: [
      { lessonId: 'l-py-1', lessonTitle: 'Giới thiệu Python', lessonOrder: 1, status: 'passed', highestScore: 100 },
      { lessonId: 'l-py-2', lessonTitle: 'Biến & Kiểu dữ liệu', lessonOrder: 2, status: 'passed', highestScore: 90 },
      { lessonId: 'l-py-3', lessonTitle: 'Câu lệnh điều kiện', lessonOrder: 3, status: 'passed', highestScore: 85 },
      { lessonId: 'l-py-4', lessonTitle: 'Vòng lặp', lessonOrder: 4, status: 'passed', highestScore: 95 },
      { lessonId: 'l-py-5', lessonTitle: 'Vòng lặp nâng cao', lessonOrder: 5, status: 'passed', highestScore: 75 },
      { lessonId: 'l-py-6', lessonTitle: 'Hàm', lessonOrder: 6, status: 'passed', highestScore: 88 },
    ],
  },
};

// ─── Teacher Courses (flattened view) ───────────────────
export const teacherCoursesSeed = [
  { courseId: 'c-python-basic', courseTitle: 'Python Cơ bản', fieldName: 'CNTT', level: 'Cơ bản', classCount: 1 },
  { courseId: 'c-python-inter', courseTitle: 'Python Trung cấp', fieldName: 'CNTT', level: 'Trung cấp', classCount: 1 },
  { courseId: 'c-js-advanced', courseTitle: 'JavaScript Nâng cao', fieldName: 'CNTT', level: 'Nâng cao', classCount: 1 },
  { courseId: 'c-react-basic', courseTitle: 'React Cơ bản', fieldName: 'CNTT', level: 'Cơ bản', classCount: 1 },
];

// ─── Slides ─────────────────────────────────────────────
export const slidesSeed: Record<string, { id: string; lessonId: string; fileName: string; fileSize: number; uploadedAt: string } | null> = {
  'l-py-1': { id: 'sl-1', lessonId: 'l-py-1', fileName: 'slide_bai1_gioi_thieu.pdf', fileSize: 1_200_000, uploadedAt: daysAgo(80) },
  'l-py-4': { id: 'sl-2', lessonId: 'l-py-4', fileName: 'slide_bai4_vong_lap.pdf', fileSize: 2_500_000, uploadedAt: daysAgo(60) },
};

// ─── Learning Mock Data ─────────────────────────────────

// Lesson learning detail (theory + interaction combined)
export const lessonLearningDetailSeed: Record<string, any> = {
  'l-py-1': {
    lessonId: 'l-py-1',
    title: 'Giới thiệu Python',
    courseId: 'c-python-basic',
    courseTitle: 'Python Cơ bản',
    order: 1,
    theory: {
      htmlContent: '<h2>Giới thiệu về Python</h2><p>Python là ngôn ngữ lập trình bậc cao, dễ học và rất phổ biến. Python được tạo bởi Guido van Rossum và phát hành lần đầu năm 1991.</p><h3>Tại sao chọn Python?</h3><ul><li>Cú pháp đơn giản, dễ đọc</li><li>Thư viện phong phú</li><li>Cộng đồng lớn</li><li>Ứng dụng đa dạng: web, AI, data science</li></ul><pre><code>print("Hello, World!")\nname = "Python"\nprint(f"Chào mừng bạn đến với {name}!")</code></pre>',
      slideEnabled: true,
      slideEmbedUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vRxxxxxx/embed',
    },
    interaction: {
      type: 'video_youtube',
      youtubeUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    },
    practice: {
      questionCount: 5,
      highestScore: 95,
      passed: true,
      remainingAttempts: 2,
    },
  },
  'l-py-2': {
    lessonId: 'l-py-2',
    title: 'Biến & Kiểu dữ liệu',
    courseId: 'c-python-basic',
    courseTitle: 'Python Cơ bản',
    order: 2,
    theory: {
      htmlContent: '<h2>Biến trong Python</h2><p>Biến là nơi lưu trữ dữ liệu. Trong Python, bạn không cần khai báo kiểu dữ liệu.</p><h3>Kiểu dữ liệu cơ bản</h3><ul><li><strong>int</strong>: Số nguyên (1, 2, -3)</li><li><strong>float</strong>: Số thực (3.14, -0.5)</li><li><strong>str</strong>: Chuỗi ("Hello")</li><li><strong>bool</strong>: True/False</li></ul><pre><code>x = 10        # int\ny = 3.14      # float\nname = "An"   # str\nis_ok = True  # bool</code></pre>',
      slideEnabled: false,
    },
    interaction: {
      type: 'simulation_html_css',
      htmlContent: '<html><body><h3>Thử nghiệm biến Python</h3><p>Hãy thay đổi giá trị biến bên dưới:</p><textarea style="width:100%;height:200px">x = 10\ny = 20\nprint(x + y)</textarea></body></html>',
    },
    practice: {
      questionCount: 5,
      highestScore: 80,
      passed: true,
      remainingAttempts: 3,
    },
  },
  'l-py-3': {
    lessonId: 'l-py-3',
    title: 'Câu lệnh điều kiện',
    courseId: 'c-python-basic',
    courseTitle: 'Python Cơ bản',
    order: 3,
    theory: {
      htmlContent: '<h2>Câu lệnh điều kiện</h2><p>Câu lệnh <code>if</code> cho phép thực hiện code dựa trên điều kiện.</p><pre><code>age = 18\nif age >= 18:\n    print("Đủ tuổi")\nelif age >= 16:\n    print("Gần đủ tuổi")\nelse:\n    print("Chưa đủ tuổi")</code></pre>',
      slideEnabled: false,
    },
    interaction: {
      type: 'video_youtube',
      youtubeUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    },
    practice: {
      questionCount: 5,
      highestScore: 85,
      passed: true,
      remainingAttempts: 1,
    },
  },
  'l-py-4': {
    lessonId: 'l-py-4',
    title: 'Vòng lặp',
    courseId: 'c-python-basic',
    courseTitle: 'Python Cơ bản',
    order: 4,
    theory: {
      htmlContent: '<h2>Vòng lặp trong Python</h2><p>Vòng lặp giúp lặp lại một khối code nhiều lần.</p><h3>Vòng lặp for</h3><pre><code>for i in range(5):\n    print(i)</code></pre><h3>Vòng lặp while</h3><pre><code>count = 0\nwhile count < 5:\n    print(count)\n    count += 1</code></pre>',
      slideEnabled: true,
      slideEmbedUrl: 'https://docs.google.com/presentation/d/e/2PACX-slide4/embed',
    },
    interaction: {
      type: 'video_youtube',
      youtubeUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    },
    practice: {
      questionCount: 5,
      highestScore: 90,
      passed: true,
      remainingAttempts: 3,
    },
  },
  'l-py-5': {
    lessonId: 'l-py-5',
    title: 'Vòng lặp nâng cao',
    courseId: 'c-python-basic',
    courseTitle: 'Python Cơ bản',
    order: 5,
    theory: {
      htmlContent: '<h2>Vòng lặp nâng cao</h2><p>Nested loops, break, continue và list comprehension.</p><pre><code>for i in range(3):\n    for j in range(3):\n        if i == j:\n            continue\n        print(f"({i},{j})")</code></pre>',
      slideEnabled: false,
    },
    interaction: {
      type: 'video_youtube',
      youtubeUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
    },
    practice: {
      questionCount: 5,
      highestScore: 65,
      passed: false,
      remainingAttempts: 2,
    },
  },
};

// Practice questions per lesson
export const practiceQuestionsSeed: Record<string, any[]> = {
  'l-py-1': [
    { id: 'pq-1', type: 'single_choice', content: 'Python được tạo bởi ai?', options: [{ id: 'o1', content: 'Guido van Rossum', isCorrect: true }, { id: 'o2', content: 'James Gosling', isCorrect: false }, { id: 'o3', content: 'Dennis Ritchie', isCorrect: false }, { id: 'o4', content: 'Bjarne Stroustrup', isCorrect: false }] },
    { id: 'pq-2', type: 'true_false', content: 'Python là ngôn ngữ lập trình thông dịch (interpreted).', correctBoolean: true },
    { id: 'pq-3', type: 'fill_in_blank', content: 'Hàm dùng để in ra màn hình trong Python là _____.', correctAnswer: 'print' },
    { id: 'pq-4', type: 'multiple_choice', content: 'Python được sử dụng trong lĩnh vực nào?', options: [{ id: 'o5', content: 'Web Development', isCorrect: true }, { id: 'o6', content: 'Data Science', isCorrect: true }, { id: 'o7', content: 'Machine Learning', isCorrect: true }, { id: 'o8', content: 'Chỉ game development', isCorrect: false }] },
    { id: 'pq-5', type: 'sort_paragraphs', content: 'Sắp xếp các bước để chạy chương trình Python:', sortItems: [{ id: 'si1', content: 'Cài đặt Python', correctOrder: 1 }, { id: 'si2', content: 'Viết code', correctOrder: 2 }, { id: 'si3', content: 'Lưu file .py', correctOrder: 3 }, { id: 'si4', content: 'Chạy python file.py', correctOrder: 4 }] },
  ],
  'l-py-4': [
    { id: 'pq-6', type: 'single_choice', content: 'Vòng lặp for trong Python dùng từ khóa nào?', options: [{ id: 'o9', content: 'for...in', isCorrect: true }, { id: 'o10', content: 'foreach', isCorrect: false }, { id: 'o11', content: 'for...of', isCorrect: false }] },
    { id: 'pq-7', type: 'true_false', content: 'Vòng lặp while có thể chạy vô hạn nếu điều kiện luôn True.', correctBoolean: true },
    { id: 'pq-8', type: 'fill_in_blank', content: 'Hàm _____(5) tạo ra dãy số từ 0 đến 4.', correctAnswer: 'range' },
    { id: 'pq-9', type: 'drag_and_drop', content: 'Kéo thả vào đúng nhóm:', dragDropItems: [{ id: 'dd1', content: 'for', targetPosition: 0 }, { id: 'dd2', content: 'while', targetPosition: 0 }, { id: 'dd3', content: 'if', targetPosition: 1 }, { id: 'dd4', content: 'elif', targetPosition: 1 }] },
    { id: 'pq-10', type: 'single_choice', content: 'break dùng để làm gì trong vòng lặp?', options: [{ id: 'o12', content: 'Thoát vòng lặp', isCorrect: true }, { id: 'o13', content: 'Bỏ qua 1 lần lặp', isCorrect: false }, { id: 'o14', content: 'Lặp lại từ đầu', isCorrect: false }] },
  ],
};

// Attempt result mock
export const attemptResultSeed = {
  id: 'att-1',
  lessonId: 'l-py-1',
  lessonTitle: 'Giới thiệu Python',
  score: 85,
  totalQuestions: 5,
  correctCount: 4,
  passed: true,
  highestScore: 95,
  remainingAttempts: 2,
  answers: [
    { questionId: 'pq-1', correct: true, userAnswer: 'Guido van Rossum', correctAnswer: 'Guido van Rossum' },
    { questionId: 'pq-2', correct: true, userAnswer: 'true', correctAnswer: 'true' },
    { questionId: 'pq-3', correct: false, userAnswer: 'println', correctAnswer: 'print' },
    { questionId: 'pq-4', correct: true, userAnswer: ['Web Development', 'Data Science', 'Machine Learning'], correctAnswer: ['Web Development', 'Data Science', 'Machine Learning'] },
    { questionId: 'pq-5', correct: true, userAnswer: 'correct_order', correctAnswer: 'correct_order' },
  ],
  aiAnalysis: 'Bạn đã làm tốt! Câu 3 bạn nhầm lẫn giữa `print` và `println`. Trong Python, hàm in ra màn hình là `print()`, không phải `println()` (Java). Hãy nhớ: Python sử dụng `print()` để xuất dữ liệu ra console.',
};

// Progress data
export const progressSeed = {
  lessonsCompleted: 18,
  lessonsPassed: 15,
  totalHours: 24,
  dailyActivity: [
    { date: '2026-03-01', count: 2 },
    { date: '2026-03-02', count: 1 },
    { date: '2026-03-03', count: 3 },
    { date: '2026-03-04', count: 0 },
    { date: '2026-03-05', count: 2 },
    { date: '2026-03-06', count: 1 },
    { date: '2026-03-07', count: 4 },
    { date: '2026-03-08', count: 2 },
    { date: '2026-03-09', count: 0 },
    { date: '2026-03-10', count: 3 },
    { date: '2026-03-11', count: 1 },
  ],
  courseProgress: [
    { courseId: 'c-python-basic', courseTitle: 'Python Cơ bản', completionPercent: 70, completedLessons: 14, totalLessons: 20 },
    { courseId: 'c-js-advanced', courseTitle: 'JavaScript Nâng cao', completionPercent: 20, completedLessons: 3, totalLessons: 15 },
    { courseId: 'c-react-basic', courseTitle: 'React Cơ bản', completionPercent: 5, completedLessons: 1, totalLessons: 18 },
  ],
};

// Certificates
export const certificatesSeed: Certificate[] = [
  {
    id: 'cert-1',
    studentId: 'mock-student',
    studentName: 'Nguyễn Văn An',
    courseId: 'c-marketing',
    courseTitle: 'Marketing căn bản',
    issuedAt: daysAgo(5),
  },
];

// Student joined classes
export const myClassesSeed = [
  { id: 'tc-1', name: 'Python K1', teacherName: 'Giáo viên Trần Thị B', courseCount: 2 },
  { id: 'tc-2', name: 'JavaScript Nâng cao', teacherName: 'Giáo viên Trần Thị B', courseCount: 1 },
];

// Lesson completion status for student learning sidebar
export const lessonStatusSeed: Record<string, 'passed' | 'failed' | 'not_started'> = {
  'l-py-1': 'passed',
  'l-py-2': 'passed',
  'l-py-3': 'passed',
  'l-py-4': 'passed',
  'l-py-5': 'failed',
  'l-py-6': 'not_started',
  'l-py-7': 'not_started',
  'l-py-8': 'not_started',
};

// ─── Chapters (Chương) ─────────────────────────────────
// Course "c-python-basic" has 3 chapters
export const chaptersSeed: Record<string, { id: string; courseId: string; title: string; order: number; lessonCount: number }[]> = {
  'c-python-basic': [
    { id: 'ch-py-1', courseId: 'c-python-basic', title: 'Làm quen với Python', order: 1, lessonCount: 3 },
    { id: 'ch-py-2', courseId: 'c-python-basic', title: 'Cấu trúc điều khiển', order: 2, lessonCount: 3 },
    { id: 'ch-py-3', courseId: 'c-python-basic', title: 'Cấu trúc dữ liệu', order: 3, lessonCount: 2 },
  ],
  'c-python-inter': [
    { id: 'ch-pyi-1', courseId: 'c-python-inter', title: 'Lập trình hướng đối tượng', order: 1, lessonCount: 2 },
  ],
  'c-js-advanced': [
    { id: 'ch-js-1', courseId: 'c-js-advanced', title: 'JavaScript nâng cao', order: 1, lessonCount: 3 },
  ],
  'c-react-basic': [
    { id: 'ch-react-1', courseId: 'c-react-basic', title: 'React cơ bản', order: 1, lessonCount: 3 },
  ],
  'c-marketing': [
    { id: 'ch-mk-1', courseId: 'c-marketing', title: 'Nền tảng Marketing', order: 1, lessonCount: 3 },
  ],
  'c-uiux': [
    { id: 'ch-ux-1', courseId: 'c-uiux', title: 'Thiết kế UI/UX', order: 1, lessonCount: 2 },
  ],
};

// Map lesson to chapter
export const lessonChapterMap: Record<string, string> = {
  // Python Cơ bản — Chương 1: Làm quen
  'l-py-1': 'ch-py-1',
  'l-py-2': 'ch-py-1',
  'l-py-3': 'ch-py-1',
  // Chương 2: Cấu trúc điều khiển
  'l-py-4': 'ch-py-2',
  'l-py-5': 'ch-py-2',
  'l-py-6': 'ch-py-2',
  // Chương 3: Cấu trúc dữ liệu
  'l-py-7': 'ch-py-3',
  'l-py-8': 'ch-py-3',
  // Python Trung cấp
  'l-pyi-1': 'ch-pyi-1',
  'l-pyi-2': 'ch-pyi-1',
  // JS Advanced
  'l-js-1': 'ch-js-1',
  'l-js-2': 'ch-js-1',
  'l-js-3': 'ch-js-1',
  // React
  'l-react-1': 'ch-react-1',
  'l-react-2': 'ch-react-1',
  'l-react-3': 'ch-react-1',
  // Marketing
  'l-mk-1': 'ch-mk-1',
  'l-mk-2': 'ch-mk-1',
  'l-mk-3': 'ch-mk-1',
  // UI/UX
  'l-ux-1': 'ch-ux-1',
  'l-ux-2': 'ch-ux-1',
};
