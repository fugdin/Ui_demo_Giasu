// ─── Helpers ─────────────────────────────────────────────
export const deepClone = <T>(val: T): T => JSON.parse(JSON.stringify(val));
export const makeId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;

// ─── Fields ──────────────────────────────────────────────
export const fieldsSeed = [
  { id: 'f-it', name: 'Công nghệ thông tin', hasAssessment: true, courseCount: 3 },
  { id: 'f-business', name: 'Kinh doanh', hasAssessment: true, courseCount: 2 },
  { id: 'f-design', name: 'Thiết kế', hasAssessment: true, courseCount: 1 },
];

// ─── Subjects ────────────────────────────────────────────
export const subjectsSeed = [
  { id: 's-python', name: 'Python', fieldId: 'f-it' },
  { id: 's-js', name: 'JavaScript', fieldId: 'f-it' },
  { id: 's-react', name: 'React', fieldId: 'f-it' },
  { id: 's-marketing', name: 'Marketing', fieldId: 'f-business' },
  { id: 's-accounting', name: 'Kế toán', fieldId: 'f-business' },
  { id: 's-uiux', name: 'UI/UX Design', fieldId: 'f-design' },
];

// ─── Courses ─────────────────────────────────────────────
const now = () => new Date().toISOString();

export const coursesSeed = [
  {
    id: 'c-python-basic',
    title: 'Python Cơ bản',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'beginner',
    description:
      '<p>Khóa học Python dành cho người mới bắt đầu. Bạn sẽ học các kiến thức nền tảng về lập trình Python bao gồm biến, kiểu dữ liệu, vòng lặp, hàm và các cấu trúc dữ liệu cơ bản.</p>',
    passThreshold: 70,
    lessonCount: 20,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-python-inter',
    title: 'Python Trung cấp',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'intermediate',
    description:
      '<p>Nâng cao kỹ năng Python với OOP, xử lý file, database và web scraping.</p>',
    passThreshold: 75,
    lessonCount: 15,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-js-advanced',
    title: 'JavaScript Nâng cao',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'advanced',
    description:
      '<p>Chinh phục JavaScript với async/await, closure, prototype và design patterns.</p>',
    passThreshold: 75,
    lessonCount: 15,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-react-basic',
    title: 'React Cơ bản',
    fieldId: 'f-it',
    fieldName: 'Công nghệ thông tin',
    level: 'beginner',
    description: '<p>Làm quen với React, component, props, state và hooks.</p>',
    passThreshold: 70,
    lessonCount: 18,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-marketing',
    title: 'Marketing căn bản',
    fieldId: 'f-business',
    fieldName: 'Kinh doanh',
    level: 'beginner',
    description:
      '<p>Nhập môn marketing hiện đại: 4P, phân tích thị trường, chiến lược kênh số.</p>',
    passThreshold: 65,
    lessonCount: 12,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: 'c-uiux',
    title: 'UI/UX Design Fundamentals',
    fieldId: 'f-design',
    fieldName: 'Thiết kế',
    level: 'beginner',
    description:
      '<p>Học nguyên tắc thiết kế giao diện và trải nghiệm người dùng.</p>',
    passThreshold: 70,
    lessonCount: 14,
    imageUrl: '',
    createdAt: now(),
    updatedAt: now(),
  },
];

// ─── Lessons ─────────────────────────────────────────────
export const lessonsSeed = [
  { id: 'l-py-1', courseId: 'c-python-basic', title: 'Giới thiệu Python', order: 1, shortDescription: 'Tổng quan về ngôn ngữ Python' },
  { id: 'l-py-2', courseId: 'c-python-basic', title: 'Biến & Kiểu dữ liệu', order: 2, shortDescription: 'Học về biến, số, chuỗi' },
  { id: 'l-py-3', courseId: 'c-python-basic', title: 'Câu lệnh điều kiện', order: 3, shortDescription: 'if, elif, else' },
  { id: 'l-py-4', courseId: 'c-python-basic', title: 'Vòng lặp', order: 4, shortDescription: 'for, while loops' },
  { id: 'l-py-5', courseId: 'c-python-basic', title: 'Vòng lặp nâng cao', order: 5, shortDescription: 'Nested loops, break, continue' },
  { id: 'l-py-6', courseId: 'c-python-basic', title: 'Hàm', order: 6, shortDescription: 'Định nghĩa và gọi hàm' },
  { id: 'l-py-7', courseId: 'c-python-basic', title: 'List & Tuple', order: 7, shortDescription: 'Cấu trúc dữ liệu tuần tự' },
  { id: 'l-py-8', courseId: 'c-python-basic', title: 'Dictionary & Set', order: 8, shortDescription: 'Key-value và tập hợp' },
  { id: 'l-pyi-1', courseId: 'c-python-inter', title: 'OOP cơ bản', order: 1, shortDescription: 'Class, object, method' },
  { id: 'l-pyi-2', courseId: 'c-python-inter', title: 'Kế thừa', order: 2, shortDescription: 'Inheritance & Polymorphism' },
  { id: 'l-js-1', courseId: 'c-js-advanced', title: 'Closure & Scope', order: 1, shortDescription: 'Hiểu về closure' },
  { id: 'l-js-2', courseId: 'c-js-advanced', title: 'Async/Await', order: 2, shortDescription: 'Lập trình bất đồng bộ' },
  { id: 'l-js-3', courseId: 'c-js-advanced', title: 'Prototype Chain', order: 3, shortDescription: 'Chuỗi prototype' },
  { id: 'l-react-1', courseId: 'c-react-basic', title: 'JSX & Component', order: 1, shortDescription: 'Cơ bản về JSX' },
  { id: 'l-react-2', courseId: 'c-react-basic', title: 'Props & State', order: 2, shortDescription: 'Truyền dữ liệu' },
  { id: 'l-react-3', courseId: 'c-react-basic', title: 'useEffect Hook', order: 3, shortDescription: 'Side effects' },
  { id: 'l-mk-1', courseId: 'c-marketing', title: '4P Marketing', order: 1, shortDescription: 'Product, Price, Place, Promotion' },
  { id: 'l-mk-2', courseId: 'c-marketing', title: 'Phân tích thị trường', order: 2, shortDescription: 'Nghiên cứu thị trường' },
  { id: 'l-mk-3', courseId: 'c-marketing', title: 'Chiến lược kênh số', order: 3, shortDescription: 'Digital marketing channels' },
  { id: 'l-ux-1', courseId: 'c-uiux', title: 'Nguyên tắc thiết kế', order: 1, shortDescription: 'Principles of design' },
  { id: 'l-ux-2', courseId: 'c-uiux', title: 'Typography & Color', order: 2, shortDescription: 'Chữ và màu sắc' },
];

// ─── Enrollments ─────────────────────────────────────────
export const enrollmentsSeed = [
  {
    id: 'e-1',
    courseId: 'c-python-basic',
    courseName: 'Python Cơ bản',
    courseImage: '',
    status: 'in_progress' as const,
    progress: 60,
    currentLessonId: 'l-py-5',
    currentLessonTitle: 'Vòng lặp nâng cao',
    completedLessons: 4,
    totalLessons: 20,
    enrolledAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'e-2',
    courseId: 'c-js-advanced',
    courseName: 'JavaScript Nâng cao',
    courseImage: '',
    status: 'in_progress' as const,
    progress: 13,
    currentLessonId: 'l-js-2',
    currentLessonTitle: 'Async/Await',
    completedLessons: 2,
    totalLessons: 15,
    enrolledAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'e-3',
    courseId: 'c-react-basic',
    courseName: 'React Cơ bản',
    courseImage: '',
    status: 'in_progress' as const,
    progress: 5,
    currentLessonId: 'l-react-1',
    currentLessonTitle: 'JSX & Component',
    completedLessons: 1,
    totalLessons: 18,
    enrolledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'e-4',
    courseId: 'c-marketing',
    courseName: 'Marketing căn bản',
    courseImage: '',
    status: 'completed' as const,
    progress: 100,
    currentLessonId: 'l-mk-3',
    currentLessonTitle: 'Chiến lược kênh số',
    completedLessons: 12,
    totalLessons: 12,
    enrolledAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
  },
];

// ─── Assessment Questions ────────────────────────────────
export const assessmentQuestionsSeed = [
  {
    id: 'aq-1', type: 'single_choice', content: 'print(2 ** 3) bằng bao nhiêu?',
    options: [
      { id: 'aq1-a', content: '6', isCorrect: false },
      { id: 'aq1-b', content: '8', isCorrect: true },
      { id: 'aq1-c', content: '9', isCorrect: false },
      { id: 'aq1-d', content: '23', isCorrect: false },
    ],
  },
  {
    id: 'aq-2', type: 'single_choice', content: 'Kiểu dữ liệu nào sau đây là immutable trong Python?',
    options: [
      { id: 'aq2-a', content: 'list', isCorrect: false },
      { id: 'aq2-b', content: 'dict', isCorrect: false },
      { id: 'aq2-c', content: 'tuple', isCorrect: true },
      { id: 'aq2-d', content: 'set', isCorrect: false },
    ],
  },
  {
    id: 'aq-3', type: 'single_choice', content: 'Kết quả của len("Hello") là?',
    options: [
      { id: 'aq3-a', content: '4', isCorrect: false },
      { id: 'aq3-b', content: '5', isCorrect: true },
      { id: 'aq3-c', content: '6', isCorrect: false },
    ],
  },
  {
    id: 'aq-4', type: 'multiple_choice', content: 'Chọn các kiểu dữ liệu cơ bản trong Python:',
    options: [
      { id: 'aq4-a', content: 'int', isCorrect: true },
      { id: 'aq4-b', content: 'float', isCorrect: true },
      { id: 'aq4-c', content: 'str', isCorrect: true },
      { id: 'aq4-d', content: 'array', isCorrect: false },
    ],
  },
  {
    id: 'aq-5', type: 'single_choice', content: 'Từ khóa nào dùng để định nghĩa hàm?',
    options: [
      { id: 'aq5-a', content: 'function', isCorrect: false },
      { id: 'aq5-b', content: 'def', isCorrect: true },
      { id: 'aq5-c', content: 'func', isCorrect: false },
      { id: 'aq5-d', content: 'define', isCorrect: false },
    ],
  },
  {
    id: 'aq-6', type: 'single_choice', content: 'Cú pháp đúng để tạo dictionary?',
    options: [
      { id: 'aq6-a', content: 'd = [1, 2, 3]', isCorrect: false },
      { id: 'aq6-b', content: 'd = {"key": "value"}', isCorrect: true },
      { id: 'aq6-c', content: 'd = (1, 2, 3)', isCorrect: false },
    ],
  },
  {
    id: 'aq-7', type: 'single_choice', content: 'Kết quả của 10 // 3 là?',
    options: [
      { id: 'aq7-a', content: '3', isCorrect: true },
      { id: 'aq7-b', content: '3.33', isCorrect: false },
      { id: 'aq7-c', content: '1', isCorrect: false },
    ],
  },
  {
    id: 'aq-8', type: 'single_choice', content: 'Vòng lặp nào phù hợp khi biết trước số lần lặp?',
    options: [
      { id: 'aq8-a', content: 'while', isCorrect: false },
      { id: 'aq8-b', content: 'for', isCorrect: true },
      { id: 'aq8-c', content: 'do-while', isCorrect: false },
    ],
  },
  {
    id: 'aq-9', type: 'multiple_choice', content: 'Chọn các phương thức của list:',
    options: [
      { id: 'aq9-a', content: 'append()', isCorrect: true },
      { id: 'aq9-b', content: 'pop()', isCorrect: true },
      { id: 'aq9-c', content: 'push()', isCorrect: false },
      { id: 'aq9-d', content: 'remove()', isCorrect: true },
    ],
  },
  {
    id: 'aq-10', type: 'single_choice', content: 'Cách import module math?',
    options: [
      { id: 'aq10-a', content: 'include math', isCorrect: false },
      { id: 'aq10-b', content: 'import math', isCorrect: true },
      { id: 'aq10-c', content: 'require("math")', isCorrect: false },
    ],
  },
  {
    id: 'aq-11', type: 'single_choice', content: 'Kết quả của bool("") là?',
    options: [
      { id: 'aq11-a', content: 'True', isCorrect: false },
      { id: 'aq11-b', content: 'False', isCorrect: true },
      { id: 'aq11-c', content: 'Error', isCorrect: false },
    ],
  },
  {
    id: 'aq-12', type: 'single_choice', content: 'List comprehension đúng cú pháp?',
    options: [
      { id: 'aq12-a', content: '[x for x in range(10)]', isCorrect: true },
      { id: 'aq12-b', content: '[for x in range(10): x]', isCorrect: false },
      { id: 'aq12-c', content: 'list(x for x range(10))', isCorrect: false },
    ],
  },
  {
    id: 'aq-13', type: 'single_choice', content: 'Từ khóa dùng để xử lý ngoại lệ?',
    options: [
      { id: 'aq13-a', content: 'catch', isCorrect: false },
      { id: 'aq13-b', content: 'try/except', isCorrect: true },
      { id: 'aq13-c', content: 'handle', isCorrect: false },
    ],
  },
  {
    id: 'aq-14', type: 'single_choice', content: 'Phương thức nào đọc toàn bộ file?',
    options: [
      { id: 'aq14-a', content: 'file.readAll()', isCorrect: false },
      { id: 'aq14-b', content: 'file.read()', isCorrect: true },
      { id: 'aq14-c', content: 'file.get()', isCorrect: false },
    ],
  },
  {
    id: 'aq-15', type: 'single_choice', content: 'Decorator trong Python bắt đầu bằng ký tự gì?',
    options: [
      { id: 'aq15-a', content: '#', isCorrect: false },
      { id: 'aq15-b', content: '@', isCorrect: true },
      { id: 'aq15-c', content: '$', isCorrect: false },
    ],
  },
];

// ─── Assessment Result ───────────────────────────────────
export const assessmentResultSeed = {
  id: 'ar-1',
  score: 78,
  totalQuestions: 15,
  correctAnswers: 12,
  level: 'Trung cấp',
  fieldName: 'Công nghệ thông tin',
  subjectName: 'Python',
  recommendedCourses: ['c-python-inter', 'c-js-advanced'],
  completedAt: now(),
};

// ─── Dashboard Stats ─────────────────────────────────────
export const studentDashboardSeed = {
  enrolledCourses: 3,
  completedLessons: 19,
  totalLessons: 53,
  certificates: 1,
  hasAssessment: true,
};
