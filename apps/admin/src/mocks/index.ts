import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api } from '@ai-learning/auth';
import {
  usersSeed,
  fieldsSeed,
  coursesSeed,
  lessonsSeed,
  questionsSeed,
  lessonTheorySeed,
  lessonInteractionSeed,
  assessmentConfigsSeed,
  settingsSeed,
  dashboardStatsSeed,
  deepClone,
  makeId,
} from './data';
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
} from '@ai-learning/types';

const mockEnabled =
  typeof import.meta !== 'undefined' &&
  (import.meta as any).env?.VITE_ENABLE_MOCK_DATA === 'true';

// In-memory DB (mutable during session)
let usersDb = deepClone(usersSeed);
let fieldsDb = deepClone(fieldsSeed);
let coursesDb = deepClone(coursesSeed);
let lessonsDb = deepClone(lessonsSeed);
let questionsDb = deepClone(questionsSeed);
let assessmentDb = deepClone(assessmentConfigsSeed);
let settingsDb: SystemSettings = deepClone(settingsSeed);
let lessonTheoryDb: Record<string, LessonTheory> = deepClone(lessonTheorySeed);
let lessonInteractionDb: Record<string, LessonInteraction> = deepClone(lessonInteractionSeed);

if (mockEnabled) {
  const realAdapter = api.defaults.adapter as AxiosAdapter | undefined;

  api.defaults.adapter = async (config) => {
    const mockResponse = await handleMockRequest(config);
    if (mockResponse) return mockResponse;
    if (realAdapter) return realAdapter(config);
    throw new Error('No real adapter available');
  };

  console.info('[mock-data] Enabled in-memory API mocks');
}

// ─────────────────── Helpers ───────────────────

function buildResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
  statusText = 'OK',
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText,
    headers: {},
    config,
    request: {},
  };
}

function getPath(config: InternalAxiosRequestConfig): string {
  try {
    return new URL(config.url || '', config.baseURL || window.location.origin).pathname;
  } catch {
    return config.url || '';
  }
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─────────────────── Mock router ───────────────────

async function handleMockRequest(
  config: InternalAxiosRequestConfig,
): Promise<AxiosResponse | undefined> {
  const method = (config.method || 'get').toLowerCase();
  const path = getPath(config);
  const params = config.params || {};
  const body = (config.data && typeof config.data === 'string'
    ? safeJsonParse(config.data)
    : config.data) || {};

  // Small delay to simulate network
  await delay(80);

  // Dashboard
  if (method === 'get' && path === '/admin/dashboard') {
    return buildResponse(config, deepClone(dashboardStatsSeed));
  }

  // Users
  if (path === '/users') {
    if (method === 'get') {
      return buildResponse(config, paginateUsers(config));
    }
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

  // Fields
  if (path === '/fields') {
    if (method === 'get') return buildResponse(config, deepClone(fieldsDb));
    if (method === 'post') {
      const field: Field = {
        id: makeId('f'),
        name: body.name,
        hasAssessment: !!body.hasAssessment,
        courseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fieldsDb.push(field);
      return buildResponse(config, deepClone(field), 201, 'Created');
    }
  }

  const fieldIdMatch = path.match(/^\/fields\/([^/]+)$/);
  if (fieldIdMatch) {
    const field = fieldsDb.find((f) => f.id === fieldIdMatch[1]);
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
      fieldsDb = fieldsDb.filter((f) => f.id !== field.id);
      coursesDb = coursesDb.filter((c) => c.fieldId !== field.id);
      return buildResponse(config, {});
    }
  }

  // Courses
  if (path === '/courses') {
    if (method === 'get') {
      return buildResponse(config, paginateCourses(config));
    }
    if (method === 'post') {
      const field = fieldsDb.find((f) => f.id === body.fieldId);
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
      coursesDb.push(course);
      if (field) field.courseCount += 1;
      return buildResponse(config, deepClone(course), 201, 'Created');
    }
  }

  const courseIdMatch = path.match(/^\/courses\/([^/]+)$/);
  if (courseIdMatch) {
    const course = coursesDb.find((c) => c.id === courseIdMatch[1]);
    if (!course) return buildResponse(config, { message: 'Not found' }, 404, 'Not Found');
    if (method === 'get') return buildResponse(config, deepClone(course));
    if (method === 'put') {
      course.title = body.title ?? course.title;
      course.fieldId = body.fieldId ?? course.fieldId;
      const field = fieldsDb.find((f) => f.id === course.fieldId);
      course.fieldName = field?.name || course.fieldName;
      course.level = body.level ?? course.level;
      course.description = body.description ?? course.description;
      course.passThreshold = body.passThreshold ?? course.passThreshold;
      course.updatedAt = new Date().toISOString();
      return buildResponse(config, deepClone(course));
    }
  }

  // Lessons list by course
  const lessonsByCourseMatch = path.match(/^\/courses\/([^/]+)\/lessons$/);
  if (lessonsByCourseMatch && method === 'get') {
    const courseId = lessonsByCourseMatch[1];
    const list = lessonsDb
      .filter((l) => l.courseId === courseId)
      .sort((a, b) => a.order - b.order);
    return buildResponse(config, deepClone(list));
  }
  if (lessonsByCourseMatch && method === 'post') {
    const courseId = lessonsByCourseMatch[1];
    const newLesson: Lesson = {
      id: makeId('l'),
      courseId,
      title: body.title,
      order: body.order ?? lessonsDb.filter((l) => l.courseId === courseId).length + 1,
      interactionType: body.interactionType ?? 'video_youtube',
      shortDescription: body.shortDescription ?? '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    lessonsDb.push(newLesson);
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

  const lessonsReorderMatch = path.match(/^\/courses\/([^/]+)\/lessons\/reorder$/);
  if (lessonsReorderMatch && method === 'put') {
    const ids: string[] = body.lessonIds || [];
    ids.forEach((id: string, idx: number) => {
      const l = lessonsDb.find((ls) => ls.id === id);
      if (l) l.order = idx + 1;
    });
    return buildResponse(config, {});
  }

  const lessonIdMatch = path.match(/^\/lessons\/([^/]+)$/);
  if (lessonIdMatch) {
    const lesson = lessonsDb.find((l) => l.id === lessonIdMatch[1]);
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
      lessonsDb = lessonsDb.filter((l) => l.id !== lesson.id);
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
    if (method === 'get') {
      return buildResponse(config, deepClone(lessonTheoryDb[lid]));
    }
    if (method === 'put') {
      lessonTheoryDb[lid] = { ...(lessonTheoryDb[lid] || { lessonId: lid, slideEnabled: false }), ...body };
      return buildResponse(config, deepClone(lessonTheoryDb[lid]));
    }
  }

  const lessonInteractionMatch = path.match(/^\/lessons\/([^/]+)\/interaction$/);
  if (lessonInteractionMatch) {
    const lid = lessonInteractionMatch[1];
    if (method === 'get') {
      return buildResponse(config, deepClone(lessonInteractionDb[lid]));
    }
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
          const lesson = lessonsDb.find((l) => l.id === lid);
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
    // Order isn't stored, just acknowledge
    return buildResponse(config, {});
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
        lessonTitle: lessonsDb.find((l) => l.id === body.lessonId)?.title,
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
          ? lessonsDb.find((l) => l.id === body.lessonId)?.title
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
    const field = fieldsDb.find((f) => f.id === body.fieldId);
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

  // Not handled -> let real adapter continue
  return undefined;
}

// ─────────────────── Helpers for pagination ───────────────────

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
  if (filters.role) {
    list = list.filter((u) => u.role === filters.role);
  }
  if (filters.isActive === 'true' || filters.isActive === 'false') {
    const val = filters.isActive === 'true';
    list = list.filter((u) => u.isActive === val);
  }

  const total = list.length;
  const start = (page - 1) * pageSize;
  const data = list.slice(start, start + pageSize);
  return {
    data: deepClone(data),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function paginateCourses(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = (params.search || '').toString().toLowerCase();

  let list = coursesDb.slice();
  if (search) {
    list = list.filter((c) => c.title.toLowerCase().includes(search));
  }
  const total = list.length;
  const data = list.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: deepClone(data),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function paginateQuestions(config: InternalAxiosRequestConfig) {
  const params = config.params || {};
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 10);
  const search = (params.search || '').toString().toLowerCase();
  const filters = (params.filters || {}) as Record<string, string>;

  let list = questionsDb.slice();
  if (search) {
    list = list.filter((q) => q.content.toLowerCase().includes(search));
  }
  if (filters.difficulty) {
    list = list.filter((q) => q.difficulty === filters.difficulty);
  }

  const total = list.length;
  const data = list.slice((page - 1) * pageSize, page * pageSize);
  return {
    data: deepClone(data),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}
