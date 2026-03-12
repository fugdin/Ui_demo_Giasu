import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api } from '@ai-learning/auth';
import {
  fieldsSeed as studentFieldsSeed,
  subjectsSeed,
  coursesSeed as studentCoursesSeed,
  lessonsSeed as studentLessonsSeed,
  enrollmentsSeed,
  assessmentQuestionsSeed,
  assessmentResultSeed,
  studentDashboardSeed,
  deepClone,
  makeId,
} from './studentData';
import {
  usersSeed,
  fieldsSeed as adminFieldsSeed,
  coursesSeed as adminCoursesSeed,
  lessonsSeed as adminLessonsSeed,
  questionsSeed,
  lessonTheorySeed,
  lessonInteractionSeed,
  assessmentConfigsSeed,
  settingsSeed,
  dashboardStatsSeed,
} from './adminData';
import {
  teacherDashboardSeed,
  activitiesSeed,
  classesSeed,
  classStudentsSeed,
  classCoursesSeed,
  studentProgressSeed,
  teacherCoursesSeed,
  slidesSeed,
  lessonLearningDetailSeed,
  practiceQuestionsSeed,
  attemptResultSeed,
  progressSeed,
  certificatesSeed,
  myClassesSeed,
  lessonStatusSeed,
  chaptersSeed,
  lessonChapterMap,
} from './teacherData';
import type {
  User,
  Field,
  Course,
  Lesson,
  Question,
  AssessmentConfig,
  SystemSettings,
  LessonTheory,
  LessonInteraction,
  Class,
} from '@ai-learning/types';

const mockEnabled =
  (typeof import.meta !== 'undefined' &&
    (import.meta as any).env?.VITE_ENABLE_MOCK_DATA === 'true') ||
  (typeof window !== 'undefined' && window.location.hostname.endsWith('github.io'));

// ─── Mock users for all roles ────────────────────────────
const MOCK_USER_STORAGE_KEY = 'ai-learning-mock-user';

const MOCK_USERS: Record<string, any> = {
  'student@example.com': {
    id: 'mock-student', name: 'Nguyễn Văn An', email: 'student@example.com',
    role: 'student', isActive: true, emailVerified: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  'admin@example.com': {
    id: 'mock-admin', name: 'Mock Admin', email: 'admin@example.com',
    role: 'admin', isActive: true, emailVerified: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
  'teacher@example.com': {
    id: 'mock-teacher', name: 'Giáo viên Trần Thị B', email: 'teacher@example.com',
    role: 'teacher', isActive: true, emailVerified: true,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
  },
};

const DEFAULT_MOCK_USER = MOCK_USERS['student@example.com'];

function getMockUserByEmail(email: string) {
  return MOCK_USERS[email] || { ...DEFAULT_MOCK_USER, email, name: email.split('@')[0] };
}

function getCurrentMockRole(): string {
  try {
    const stored = window.localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (stored) return JSON.parse(stored).role || 'student';
  } catch { /* ignore */ }
  return 'student';
}

// ─── Admin In-memory DB ──────────────────────────────────
let usersDb = deepClone(usersSeed);
let adminFieldsDb = deepClone(adminFieldsSeed);
let adminCoursesDb = deepClone(adminCoursesSeed);
let adminLessonsDb = deepClone(adminLessonsSeed);
let questionsDb = deepClone(questionsSeed);
let assessmentDb = deepClone(assessmentConfigsSeed);
let settingsDb: SystemSettings = deepClone(settingsSeed);
let lessonTheoryDb: Record<string, LessonTheory> = deepClone(lessonTheorySeed);
let lessonInteractionDb: Record<string, LessonInteraction> = deepClone(lessonInteractionSeed);

// ─── Student In-memory DB ────────────────────────────────
let enrollmentsDb = deepClone(enrollmentsSeed);

// ─── Teacher In-memory DB ───────────────────────────────
let teacherClassesDb = deepClone(classesSeed);
let teacherClassStudentsDb = deepClone(classStudentsSeed);
let teacherClassCoursesDb = deepClone(classCoursesSeed);

if (mockEnabled) {
  const realAdapter = api.defaults.adapter as AxiosAdapter | undefined;

  api.defaults.adapter = async (config) => {
    const mockResponse = await handleMockRequest(config);
    if (mockResponse) return mockResponse;
    if (realAdapter) return realAdapter(config);
    throw new Error('No real adapter available');
  };

  console.info('[mock-data] Unified app: enabled in-memory API mocks');
  console.info('[mock-data] Tài khoản test:');
  console.info('  🎓 student@example.com / 123456 → Học viên');
  console.info('  👨‍🏫 teacher@example.com / 123456 → Giáo viên');
  console.info('  🔧 admin@example.com / 123456 → Admin');
}

// ─── Helpers ─────────────────────────────────────────────

function buildResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
  statusText = 'OK',
): AxiosResponse<T> {
  return { data, status, statusText, headers: {}, config, request: {} };
}

function getPath(config: InternalAxiosRequestConfig): string {
  try {
    return new URL(config.url || '', config.baseURL || window.location.origin).pathname;
  } catch {
    return config.url || '';
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function safeJsonParse(str: string) {
  try { return JSON.parse(str); } catch { return {}; }
}

// ─── Mock Router (Unified) ──────────────────────────────

async function handleMockRequest(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse | undefined> {
  const method = (config.method || 'get').toLowerCase();
  const path = getPath(config);
  const params = config.params || {};
  const body =
    config.data && typeof config.data === 'string'
      ? safeJsonParse(config.data)
      : config.data || {};

  await delay(80);

  // ════════════════════════════════════════════════════════
  // 1. AUTH ROUTES (always handled)
  // ════════════════════════════════════════════════════════

  if (method === 'post' && path === '/auth/login') {
    const mockUser = getMockUserByEmail(body.email || '');
    window.localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(mockUser));
    return buildResponse(config, {
      data: {
        user: deepClone(mockUser),
        tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' },
      },
    });
  }

  if (method === 'post' && path === '/auth/register') {
    const newStudent = {
      ...DEFAULT_MOCK_USER,
      id: makeId('u'),
      name: body.name || 'Học viên mới',
      email: body.email || 'new@example.com',
    };
    return buildResponse(config, {
      data: {
        user: deepClone(newStudent),
        tokens: { accessToken: 'mock-token', refreshToken: 'mock-refresh' },
      },
    });
  }

  if (method === 'post' && path === '/auth/refresh') {
    const stored = window.localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (stored) {
      return buildResponse(config, {
        data: { accessToken: 'mock-token', user: JSON.parse(stored) },
      });
    }
    return buildResponse(config, { message: 'Unauthorized' }, 401, 'Unauthorized');
  }

  if (method === 'get' && path === '/auth/me') {
    const stored = window.localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (stored) {
      return buildResponse(config, { data: JSON.parse(stored) });
    }
    return buildResponse(config, { message: 'Unauthorized' }, 401, 'Unauthorized');
  }

  if (method === 'post' && path === '/auth/resend-verification') {
    return buildResponse(config, { message: 'ok' });
  }

  // ════════════════════════════════════════════════════════
  // 2. ADMIN-ONLY ROUTES
  // ════════════════════════════════════════════════════════

  // Admin Dashboard
  if (method === 'get' && path === '/admin/dashboard') {
    return buildResponse(config, deepClone(dashboardStatsSeed));
  }

  // Users
  if (path === '/users') {
    if (method === 'get') return buildResponse(config, paginateUsers(config));
    if (method === 'post') {
      const newUser: User = {
        id: makeId('u'),
        name: body.name,
        email: body.email,
        role: body.role || 'student',
        isActive: true,
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      usersDb.push(newUser);
      return buildResponse(config, deepClone(newUser), 201, 'Created');
    }
  }

  const userIdMatch = path.match(/^\/users\/([^/]+)$/);
  if (method === 'patch' && userIdMatch) {
    const userId = userIdMatch[1];
    const user = usersDb.find((u) => u.id === userId);
    if (!user) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    if (body.role) user.role = body.role;
    user.updatedAt = new Date().toISOString();
    return buildResponse(config, deepClone(user));
  }

  const userToggleMatch = path.match(/^\/users\/([^/]+)\/toggle-active$/);
  if (method === 'patch' && userToggleMatch) {
    const user = usersDb.find((u) => u.id === userToggleMatch[1]);
    if (!user) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    user.isActive = !user.isActive;
    user.updatedAt = new Date().toISOString();
    return buildResponse(config, deepClone(user));
  }

  // Questions root
  if (path === '/questions') {
    if (method === 'get') return buildResponse(config, paginateQuestions(config));
    if (method === 'post') {
      const q: Question = {
        id: makeId('q'),
        type: body.type,
        content: body.content,
        difficulty: body.difficulty ?? 'easy',
        lessonId: body.lessonId,
        lessonTitle: adminLessonsDb.find((l) => l.id === body.lessonId)?.title,
        options: body.options?.map((o: any, idx: number) => ({
          id: makeId(`qo${idx}`),
          content: o.content,
          isCorrect: !!o.isCorrect,
        })),
        correctAnswer: body.correctAnswer,
        correctBoolean: body.correctBoolean,
        dragDropItems: body.dragDropItems,
        sortItems: body.sortItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      questionsDb.push(q);
      return buildResponse(config, deepClone(q), 201, 'Created');
    }
  }

  const questionIdMatch = path.match(/^\/questions\/([^/]+)$/);
  if (questionIdMatch) {
    const q = questionsDb.find((qq) => qq.id === questionIdMatch[1]);
    if (!q) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    if (method === 'get') return buildResponse(config, deepClone(q));
    if (method === 'put') {
      Object.assign(q, body, {
        lessonTitle: body.lessonId
          ? adminLessonsDb.find((l) => l.id === body.lessonId)?.title
          : q.lessonTitle,
        updatedAt: new Date().toISOString(),
      });
      return buildResponse(config, deepClone(q));
    }
    if (method === 'delete') {
      questionsDb = questionsDb.filter((qq) => qq.id !== q.id);
      return buildResponse(config, {});
    }
  }

  // Lesson CRUD (admin-only endpoints)
  const lessonIdMatch = path.match(/^\/lessons\/([^/]+)$/);
  if (lessonIdMatch) {
    const lesson = adminLessonsDb.find((l) => l.id === lessonIdMatch[1]);
    if (!lesson) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    if (method === 'get') return buildResponse(config, deepClone(lesson));
    if (method === 'put') {
      lesson.title = body.title ?? lesson.title;
      lesson.order = body.order ?? lesson.order;
      lesson.interactionType = body.interactionType ?? lesson.interactionType;
      lesson.shortDescription = body.shortDescription ?? lesson.shortDescription;
      lesson.updatedAt = new Date().toISOString();
      return buildResponse(config, deepClone(lesson));
    }
    if (method === 'delete') {
      adminLessonsDb = adminLessonsDb.filter((l) => l.id !== lesson.id);
      delete lessonTheoryDb[lesson.id];
      delete lessonInteractionDb[lesson.id];
      questionsDb = questionsDb.map((q) =>
        q.lessonId === lesson.id ? { ...q, lessonId: undefined, lessonTitle: undefined } : q,
      );
      return buildResponse(config, {});
    }
  }

  // Lesson theory / interaction
  const lessonTheoryMatch = path.match(/^\/lessons\/([^/]+)\/theory$/);
  if (lessonTheoryMatch) {
    const lid = lessonTheoryMatch[1];
    if (method === 'get') return buildResponse(config, deepClone(lessonTheoryDb[lid]));
    if (method === 'put') {
      lessonTheoryDb[lid] = { ...(lessonTheoryDb[lid] || { lessonId: lid, slideEnabled: false }), ...body };
      return buildResponse(config, deepClone(lessonTheoryDb[lid]));
    }
  }

  const lessonInteractionMatch = path.match(/^\/lessons\/([^/]+)\/interaction$/);
  if (lessonInteractionMatch) {
    const lid = lessonInteractionMatch[1];
    if (method === 'get') return buildResponse(config, deepClone(lessonInteractionDb[lid]));
    if (method === 'put') {
      lessonInteractionDb[lid] = {
        ...(lessonInteractionDb[lid] || { lessonId: lid, type: body.type || 'video_youtube' }),
        ...body,
      };
      return buildResponse(config, deepClone(lessonInteractionDb[lid]));
    }
  }

  // Lesson questions
  const lessonQuestionsMatch = path.match(/^\/lessons\/([^/]+)\/questions$/);
  if (lessonQuestionsMatch) {
    const lid = lessonQuestionsMatch[1];
    if (method === 'get') {
      const list = questionsDb.filter((q) => q.lessonId === lid);
      return buildResponse(config, deepClone(list));
    }
    if (method === 'post') {
      const ids: string[] = body.questionIds || [];
      ids.forEach((qid) => {
        const q = questionsDb.find((qq) => qq.id === qid);
        if (q) {
          q.lessonId = lid;
          const lesson = adminLessonsDb.find((l) => l.id === lid);
          q.lessonTitle = lesson?.title;
        }
      });
      return buildResponse(config, {});
    }
  }

  const lessonQuestionDeleteMatch = path.match(/^\/lessons\/([^/]+)\/questions\/([^/]+)$/);
  if (lessonQuestionDeleteMatch && method === 'delete') {
    const [, lid, qid] = lessonQuestionDeleteMatch;
    const q = questionsDb.find((qq) => qq.id === qid && qq.lessonId === lid);
    if (!q) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    q.lessonId = undefined;
    q.lessonTitle = undefined;
    return buildResponse(config, {});
  }

  const lessonQuestionReorderMatch = path.match(/^\/lessons\/([^/]+)\/questions\/reorder$/);
  if (lessonQuestionReorderMatch && method === 'put') {
    return buildResponse(config, {});
  }

  // Assessment config
  const assessMatch = path.match(/^\/assessment-config\/([^/]+)$/);
  if (assessMatch && method === 'get') {
    const fieldId = assessMatch[1];
    const cfg = assessmentDb.find((c) => c.fieldId === fieldId);
    if (!cfg) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    return buildResponse(config, deepClone(cfg));
  }
  if (path === '/assessment-config' && method === 'put') {
    const existingIdx = assessmentDb.findIndex((c) => c.fieldId === body.fieldId);
    if (existingIdx >= 0) {
      assessmentDb[existingIdx] = { ...(assessmentDb[existingIdx] as AssessmentConfig), ...body };
      return buildResponse(config, deepClone(assessmentDb[existingIdx]));
    }
    const field = adminFieldsDb.find((f) => f.id === body.fieldId);
    const cfg: AssessmentConfig = { ...body, fieldName: field?.name || 'N/A' };
    assessmentDb.push(cfg);
    return buildResponse(config, deepClone(cfg));
  }

  // Settings
  if (path === '/settings') {
    if (method === 'get') return buildResponse(config, deepClone(settingsDb));
    if (method === 'put') {
      settingsDb = { ...settingsDb, ...body };
      return buildResponse(config, deepClone(settingsDb));
    }
  }

  // Slides (no-op)
  if (path.match(/^\/lessons\/[^/]+\/slides/)) {
    return buildResponse(config, {});
  }

  // ════════════════════════════════════════════════════════
  // 3. STUDENT-ONLY ROUTES
  // ════════════════════════════════════════════════════════

  // Student Dashboard
  if (method === 'get' && path === '/student/dashboard') {
    return buildResponse(config, deepClone(studentDashboardSeed));
  }

  // Subjects by field
  const subjectsByFieldMatch = path.match(/^\/fields\/([^/]+)\/subjects$/);
  if (method === 'get' && subjectsByFieldMatch) {
    const fieldId = subjectsByFieldMatch[1];
    const list = deepClone(subjectsSeed).filter((s) => s.fieldId === fieldId);
    return buildResponse(config, list);
  }

  // Enrollments
  if (method === 'get' && path === '/enrollments') {
    let list = deepClone(enrollmentsDb);
    if (params.status) {
      list = list.filter((e: any) => e.status === params.status);
    }
    return buildResponse(config, list);
  }

  const enrollMatch = path.match(/^\/enrollments\/([^/]+)$/);
  if (method === 'post' && enrollMatch) {
    const courseId = enrollMatch[1];
    const course = studentCoursesSeed.find((c) => c.id === courseId);
    if (!course) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    const existing = enrollmentsDb.find((e) => e.courseId === courseId);
    if (existing) return buildResponse(config, deepClone(existing));
    const courseLessons = studentLessonsSeed.filter((l) => l.courseId === courseId);
    const newEnrollment = {
      id: makeId('e'),
      courseId,
      courseName: course.title,
      courseImage: '',
      status: 'in_progress' as const,
      progress: 0,
      currentLessonId: courseLessons[0]?.id || '',
      currentLessonTitle: courseLessons[0]?.title || '',
      completedLessons: 0,
      totalLessons: course.lessonCount,
      enrolledAt: new Date().toISOString(),
    };
    enrollmentsDb.push(newEnrollment);
    return buildResponse(config, deepClone(newEnrollment), 201, 'Created');
  }

  // Assessment start/submit/result
  if (method === 'post' && path === '/assessment/start') {
    return buildResponse(config, {
      sessionId: makeId('session'),
      questions: deepClone(assessmentQuestionsSeed),
      duration: 1200,
    });
  }

  if (method === 'post' && path === '/assessment/submit') {
    await delay(500);
    return buildResponse(config, deepClone(assessmentResultSeed));
  }

  const resultMatch = path.match(/^\/assessment\/result\/([^/]+)$/);
  if (method === 'get' && resultMatch) {
    return buildResponse(config, deepClone(assessmentResultSeed));
  }

  // Join class
  if (method === 'post' && path === '/classes/join') {
    return buildResponse(config, { message: 'Tham gia thành công' });
  }

  // My classes (student)
  if (method === 'get' && path === '/classes/my') {
    return buildResponse(config, deepClone(myClassesSeed));
  }

  // ════════════════════════════════════════════════════════
  // 3b. STUDENT LEARNING ROUTES
  // ════════════════════════════════════════════════════════

  // Course chapters with lessons (for learning sidebar & course home)
  const courseChaptersMatch = path.match(/^\/courses\/([^/]+)\/chapters$/);
  if (method === 'get' && courseChaptersMatch) {
    const courseId = courseChaptersMatch[1];
    const chapters = deepClone(chaptersSeed[courseId] || []);
    const courseLessons = studentLessonsSeed.filter((l: any) => l.courseId === courseId).sort((a: any, b: any) => a.order - b.order);
    const chaptersWithLessons = chapters.map((ch: any) => {
      const chLessons = courseLessons.filter((l: any) => lessonChapterMap[l.id] === ch.id);
      return {
        ...ch,
        lessons: chLessons.map((l: any, idx: number) => {
          const status = lessonStatusSeed[l.id] || 'not_started';
          // A lesson is locked if previous chapter's lessons are not all passed
          // Simple rule: if this chapter order > 1 and the prev chapter has any non-passed, lock it
          let finalStatus: string = status;
          if (ch.order > 1) {
            const prevChapter = chapters.find((pc: any) => pc.order === ch.order - 1);
            if (prevChapter) {
              const prevLessons = courseLessons.filter((pl: any) => lessonChapterMap[pl.id] === prevChapter.id);
              const allPrevPassed = prevLessons.every((pl: any) => lessonStatusSeed[pl.id] === 'passed');
              if (!allPrevPassed) finalStatus = 'locked';
            }
          }
          return {
            id: l.id,
            chapterId: ch.id,
            title: l.title,
            order: l.order,
            label: `${ch.order}.${idx + 1}`,
            status: finalStatus,
            shortDescription: l.shortDescription || '',
          };
        }),
      };
    });
    return buildResponse(config, chaptersWithLessons);
  }

  // Lesson learning detail
  const learningLessonMatch = path.match(/^\/learning\/lessons\/([^/]+)$/);
  if (method === 'get' && learningLessonMatch) {
    const lessonId = learningLessonMatch[1];
    const detail = lessonLearningDetailSeed[lessonId];
    if (detail) return buildResponse(config, deepClone(detail));
    // Fallback: generate from student lesson data
    const lesson = studentLessonsSeed.find((l) => l.id === lessonId);
    if (!lesson) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    return buildResponse(config, deepClone({
      lessonId: lesson.id,
      title: lesson.title,
      courseId: lesson.courseId,
      courseTitle: studentCoursesSeed.find((c) => c.id === lesson.courseId)?.title || '',
      order: lesson.order,
      theory: { htmlContent: `<h2>${lesson.title}</h2><p>${lesson.shortDescription}</p>`, slideEnabled: false },
      interaction: { type: 'video_youtube', youtubeUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8' },
      practice: { questionCount: 5, highestScore: null, passed: false, remainingAttempts: 3 },
    }));
  }

  // Practice questions
  const practiceMatch = path.match(/^\/learning\/practice\/([^/]+)$/);
  if (method === 'get' && practiceMatch) {
    const lessonId = practiceMatch[1];
    const questions = practiceQuestionsSeed[lessonId] || practiceQuestionsSeed['l-py-1'];
    return buildResponse(config, deepClone(questions));
  }

  // Submit practice
  const practiceSubmitMatch = path.match(/^\/learning\/practice\/([^/]+)\/submit$/);
  if (method === 'post' && practiceSubmitMatch) {
    await delay(500);
    return buildResponse(config, deepClone({
      ...attemptResultSeed,
      id: makeId('att'),
      lessonId: practiceSubmitMatch[1],
    }));
  }

  // Attempt result
  const attemptMatch = path.match(/^\/learning\/attempts\/([^/]+)$/);
  if (method === 'get' && attemptMatch) {
    return buildResponse(config, deepClone(attemptResultSeed));
  }

  // Progress
  if (method === 'get' && path === '/learning/progress') {
    return buildResponse(config, deepClone(progressSeed));
  }

  // Certificates
  if (method === 'get' && path === '/learning/certificates') {
    return buildResponse(config, deepClone(certificatesSeed));
  }

  // AI Chat
  if (method === 'post' && path === '/ai/chat') {
    await delay(800);
    return buildResponse(config, {
      message: 'Đây là gợi ý từ AI: Hãy xem lại phần lý thuyết về chủ đề này. Bạn có thể tìm thấy câu trả lời trong mục "Khái niệm cơ bản". Chúc bạn học tốt! 🎓',
    });
  }

  // ════════════════════════════════════════════════════════
  // 3c. TEACHER ROUTES
  // ════════════════════════════════════════════════════════

  // Teacher Dashboard
  if (method === 'get' && path === '/teacher/dashboard') {
    return buildResponse(config, deepClone(teacherDashboardSeed));
  }

  // Teacher Activities
  if (method === 'get' && path === '/teacher/activities') {
    return buildResponse(config, deepClone(activitiesSeed));
  }

  // Teacher Classes list
  if (method === 'get' && path === '/teacher/classes') {
    return buildResponse(config, deepClone(teacherClassesDb));
  }

  // Teacher Create Class
  if (method === 'post' && path === '/teacher/classes') {
    const newClass: Class = {
      id: makeId('tc'),
      name: body.name,
      description: body.description,
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      inviteCodeExpiry: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
      teacherId: 'mock-teacher',
      teacherName: 'Giáo viên Trần Thị B',
      studentCount: 0,
      courseCount: 0,
      createdAt: new Date().toISOString(),
    };
    teacherClassesDb.push(newClass);
    teacherClassStudentsDb[newClass.id] = [];
    teacherClassCoursesDb[newClass.id] = [];
    return buildResponse(config, deepClone(newClass), 201, 'Created');
  }

  // Teacher Class Detail
  const teacherClassDetailMatch = path.match(/^\/teacher\/classes\/([^/]+)$/);
  if (teacherClassDetailMatch) {
    const classId = teacherClassDetailMatch[1];
    if (method === 'get') {
      const cls = teacherClassesDb.find((c) => c.id === classId);
      if (!cls) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
      const students = deepClone(teacherClassStudentsDb[classId] || []);
      const courses = deepClone(teacherClassCoursesDb[classId] || []);
      // Build progressMatrix from students x courses
      const progressMatrix = students.map((s: any) => ({
        studentId: s.id,
        studentName: s.name,
        courses: courses.map((c: any) => {
          const sp = studentProgressSeed[s.id];
          const cp = sp?.courses?.find((x: any) => x.courseId === c.courseId);
          return { courseId: c.courseId, courseTitle: c.courseTitle, percent: cp?.completionPercent ?? Math.floor(Math.random() * 80 + 10) };
        }),
      }));
      return buildResponse(config, {
        ...deepClone(cls),
        students,
        courses,
        progressMatrix,
      });
    }
    if (method === 'delete') {
      teacherClassesDb = teacherClassesDb.filter((c) => c.id !== classId);
      delete teacherClassStudentsDb[classId];
      delete teacherClassCoursesDb[classId];
      return buildResponse(config, {});
    }
  }

  // Regenerate invite code
  const regenCodeMatch = path.match(/^\/teacher\/classes\/([^/]+)\/regenerate-code$/);
  if (method === 'post' && regenCodeMatch) {
    const cls = teacherClassesDb.find((c) => c.id === regenCodeMatch[1]);
    if (!cls) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    cls.inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    cls.inviteCodeExpiry = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();
    return buildResponse(config, deepClone(cls));
  }

  // Assign course to class
  const assignCourseMatch = path.match(/^\/teacher\/classes\/([^/]+)\/courses$/);
  if (method === 'post' && assignCourseMatch) {
    const classId = assignCourseMatch[1];
    const courseId = body.courseId;
    const course = studentCoursesSeed.find((c) => c.id === courseId);
    if (!course) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    const courses = teacherClassCoursesDb[classId] || [];
    courses.push({ id: makeId('cc'), courseId, courseTitle: course.title, assignedAt: new Date().toISOString() });
    teacherClassCoursesDb[classId] = courses;
    const cls = teacherClassesDb.find((c) => c.id === classId);
    if (cls) cls.courseCount = courses.length;
    return buildResponse(config, {}, 201, 'Created');
  }

  // Remove course from class
  const removeCourseMatch = path.match(/^\/teacher\/classes\/([^/]+)\/courses\/([^/]+)$/);
  if (method === 'delete' && removeCourseMatch) {
    const [, classId, courseId] = removeCourseMatch;
    const courses = teacherClassCoursesDb[classId] || [];
    teacherClassCoursesDb[classId] = courses.filter((c) => c.courseId !== courseId);
    const cls = teacherClassesDb.find((c) => c.id === classId);
    if (cls) cls.courseCount = teacherClassCoursesDb[classId].length;
    return buildResponse(config, {});
  }

  // Student progress in class
  const studentProgressMatch = path.match(/^\/teacher\/classes\/([^/]+)\/students\/([^/]+)$/);
  if (method === 'get' && studentProgressMatch) {
    const [, classId, studentId] = studentProgressMatch;
    const students = teacherClassStudentsDb[classId] || [];
    const student = students.find((s) => s.id === studentId);
    if (!student) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    const progress = studentProgressSeed[studentId] || studentProgressSeed['cs-1'];
    return buildResponse(config, {
      student: deepClone(student),
      ...deepClone(progress),
    });
  }

  // Teacher courses
  if (method === 'get' && path === '/teacher/courses') {
    return buildResponse(config, deepClone(teacherCoursesSeed));
  }

  // Teacher slide
  const teacherSlideMatch = path.match(/^\/teacher\/lessons\/([^/]+)\/slide$/);
  if (method === 'get' && teacherSlideMatch) {
    const slide = slidesSeed[teacherSlideMatch[1]] || null;
    return buildResponse(config, deepClone(slide));
  }

  // Teacher slide upload/delete
  const teacherSlideActionMatch = path.match(/^\/teacher\/lessons\/([^/]+)\/slides$/);
  if (teacherSlideActionMatch) {
    if (method === 'post') {
      return buildResponse(config, { id: makeId('sl'), lessonId: teacherSlideActionMatch[1], fileName: 'uploaded_slide.pdf', fileSize: 1500000, uploadedAt: new Date().toISOString() });
    }
    if (method === 'delete') {
      return buildResponse(config, {});
    }
  }

  // ════════════════════════════════════════════════════════
  // 4. OVERLAPPING ROUTES (role-dispatched)
  // ════════════════════════════════════════════════════════

  const role = getCurrentMockRole();

  // Fields
  if (path === '/fields') {
    if (method === 'get') {
      if (role === 'admin') {
        return buildResponse(config, deepClone(adminFieldsDb));
      }
      // Student: read-only with optional filter
      let list = deepClone(studentFieldsSeed);
      if (params.hasAssessment === true || params.hasAssessment === 'true') {
        list = list.filter((f: any) => f.hasAssessment);
      }
      return buildResponse(config, list);
    }
    if (method === 'post') {
      const field: Field = {
        id: makeId('f'),
        name: body.name,
        hasAssessment: !!body.hasAssessment,
        courseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      adminFieldsDb.push(field);
      return buildResponse(config, deepClone(field), 201, 'Created');
    }
  }

  const fieldIdMatch = path.match(/^\/fields\/([^/]+)$/);
  if (fieldIdMatch) {
    const field = adminFieldsDb.find((f) => f.id === fieldIdMatch[1]);
    if (!field) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    if (method === 'put') {
      field.name = body.name ?? field.name;
      if (typeof body.hasAssessment === 'boolean') field.hasAssessment = body.hasAssessment;
      field.updatedAt = new Date().toISOString();
      return buildResponse(config, deepClone(field));
    }
    if (method === 'patch') {
      if (typeof body.hasAssessment === 'boolean') field.hasAssessment = body.hasAssessment;
      field.updatedAt = new Date().toISOString();
      return buildResponse(config, deepClone(field));
    }
    if (method === 'delete') {
      adminFieldsDb = adminFieldsDb.filter((f) => f.id !== field.id);
      adminCoursesDb = adminCoursesDb.filter((c) => c.fieldId !== field.id);
      return buildResponse(config, {});
    }
  }

  // Courses
  if (path === '/courses') {
    if (method === 'get') {
      if (role === 'admin') {
        return buildResponse(config, paginateAdminCourses(config));
      }
      // Student: filtered by fieldId/level/search
      const page = Number(params.page ?? 1);
      const pageSize = Number(params.pageSize ?? 12);
      const search = (params.search || '').toString().toLowerCase();
      let list = deepClone(studentCoursesSeed);
      if (search) list = list.filter((c: any) => c.title.toLowerCase().includes(search));
      if (params.fieldId) list = list.filter((c: any) => c.fieldId === params.fieldId);
      if (params.level) list = list.filter((c: any) => c.level === params.level);
      const total = list.length;
      const data = list.slice((page - 1) * pageSize, page * pageSize);
      return buildResponse(config, { data: deepClone(data), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
    }
    if (method === 'post') {
      const field = adminFieldsDb.find((f) => f.id === body.fieldId);
      const course: Course = {
        id: makeId('c'),
        title: body.title,
        fieldId: body.fieldId,
        fieldName: field?.name || 'N/A',
        level: body.level ?? 'beginner',
        description: body.description ?? '',
        passThreshold: body.passThreshold ?? 70,
        lessonCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      adminCoursesDb.push(course);
      if (field) field.courseCount += 1;
      return buildResponse(config, deepClone(course), 201, 'Created');
    }
  }

  const courseIdMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseIdMatch) {
    if (role === 'admin') {
      const course = adminCoursesDb.find((c) => c.id === courseIdMatch[1]);
      // Fallback: admin cũng có thể xem course từ student seed (khi dùng learning page)
      if (!course) {
        const studentCourse = studentCoursesSeed.find((c) => c.id === courseIdMatch[1]);
        if (studentCourse && method === 'get') return buildResponse(config, deepClone(studentCourse));
        return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
      }
      if (method === 'get') return buildResponse(config, deepClone(course));
      if (method === 'put') {
        course.title = body.title ?? course.title;
        course.fieldId = body.fieldId ?? course.fieldId;
        const field = adminFieldsDb.find((f) => f.id === course.fieldId);
        course.fieldName = field?.name || course.fieldName;
        course.level = body.level ?? course.level;
        course.description = body.description ?? course.description;
        course.passThreshold = body.passThreshold ?? course.passThreshold;
        course.updatedAt = new Date().toISOString();
        return buildResponse(config, deepClone(course));
      }
    } else {
      const course = studentCoursesSeed.find((c) => c.id === courseIdMatch[1]);
      if (!course) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
      if (method === 'get') return buildResponse(config, deepClone(course));
    }
  }

  // Lessons by course
  const lessonsByCourseMatch = path.match(/^\/courses\/([^/]+)\/lessons$/);
  if (lessonsByCourseMatch) {
    const courseId = lessonsByCourseMatch[1];
    if (role === 'admin') {
      if (method === 'get') {
        const list = adminLessonsDb
          .filter((l) => l.courseId === courseId)
          .sort((a, b) => a.order - b.order);
        // Fallback: if admin has no lessons for this course, try student seed
        if (list.length === 0) {
          const studentList = deepClone(studentLessonsSeed)
            .filter((l: any) => l.courseId === courseId)
            .sort((a: any, b: any) => a.order - b.order);
          return buildResponse(config, studentList);
        }
        return buildResponse(config, deepClone(list));
      }
      if (method === 'post') {
        const newLesson: Lesson = {
          id: makeId('l'),
          courseId,
          title: body.title,
          order: body.order ?? adminLessonsDb.filter((l) => l.courseId === courseId).length + 1,
          interactionType: body.interactionType ?? 'video_youtube',
          shortDescription: body.shortDescription ?? '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        adminLessonsDb.push(newLesson);
        lessonTheoryDb[newLesson.id] = {
          lessonId: newLesson.id,
          pdfUrl: '',
          slideEnabled: false,
        };
        lessonInteractionDb[newLesson.id] = {
          lessonId: newLesson.id,
          type: newLesson.interactionType,
          youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        };
        return buildResponse(config, deepClone(newLesson), 201, 'Created');
      }
    } else {
      if (method === 'get') {
        const list = deepClone(studentLessonsSeed)
          .filter((l: any) => l.courseId === courseId)
          .sort((a: any, b: any) => a.order - b.order);
        return buildResponse(config, list);
      }
    }
  }

  const lessonsReorderMatch = path.match(/^\/courses\/([^/]+)\/lessons\/reorder$/);
  if (lessonsReorderMatch && method === 'put') {
    const ids: string[] = body.lessonIds || [];
    ids.forEach((id: string, idx: number) => {
      const l = adminLessonsDb.find((ls) => ls.id === id);
      if (l) l.order = idx + 1;
    });
    return buildResponse(config, {});
  }

  // Not handled → let real adapter continue
  return undefined;
}

// ─── Pagination helpers ──────────────────────────────────

function paginateUsers(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = (params.search || '').toString().toLowerCase();
  const filters = (params.filters || {}) as Record<string, string>;
  let list = usersDb.slice();
  if (search) {
    list = list.filter(
      (u) => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search),
    );
  }
  if (filters.role) list = list.filter((u) => u.role === filters.role);
  if (filters.isActive === 'true' || filters.isActive === 'false') {
    const val = filters.isActive === 'true';
    list = list.filter((u) => u.isActive === val);
  }
  const total = list.length;
  const start = (page - 1) * pageSize;
  const data = list.slice(start, start + pageSize);
  return { data: deepClone(data), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function paginateAdminCourses(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = (params.search || '').toString().toLowerCase();
  let list = adminCoursesDb.slice();
  if (search) list = list.filter((c) => c.title.toLowerCase().includes(search));
  const total = list.length;
  const data = list.slice((page - 1) * pageSize, page * pageSize);
  return { data: deepClone(data), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

function paginateQuestions(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = (params.search || '').toString().toLowerCase();
  const filters = (params.filters || {}) as Record<string, string>;
  let list = questionsDb.slice();
  if (search) list = list.filter((q) => q.content.toLowerCase().includes(search));
  if (filters.difficulty) list = list.filter((q) => q.difficulty === filters.difficulty);
  const total = list.length;
  const data = list.slice((page - 1) * pageSize, page * pageSize);
  return { data: deepClone(data), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}
