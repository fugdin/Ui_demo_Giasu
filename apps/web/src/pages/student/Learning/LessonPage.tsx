import {
  Layout, Tabs, Breadcrumb, Button, Progress, Drawer, Collapse,
  Spin, Tag, Card, Typography, Space, Menu, message,
} from 'antd';
import {
  LeftOutlined, RightOutlined, CheckCircleOutlined, PlayCircleFilled,
  MessageOutlined, BookOutlined, ExperimentOutlined, FormOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, FilePdfOutlined,
  LockOutlined, CloseCircleOutlined, HomeOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningApi, coursesApi } from '@/services/api';
import type {
  Lesson, LessonTheory, LessonInteraction, Course, ChapterWithLessons, LessonInChapter,
} from '@ai-learning/types';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const SIDEBAR_WIDTH = 280;

/* ── Kiểu dữ liệu nội bộ ─────────────────────────────── */
interface PracticeSummary {
  questionCount: number;
  highestScore: number;
  passed: boolean;
  attemptsUsed: number;
  maxAttempts: number;
}

interface LessonDetail {
  lesson: Lesson;
  theory: LessonTheory;
  interaction: LessonInteraction;
  practice: PracticeSummary;
}

/* ── Component ─────────────────────────────────────────── */
export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  // State
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // ── Tải course + chapters ────────────────────────
  useEffect(() => {
    if (!courseId) return;
    const fetchCourseData = async () => {
      setLoading(true);
      try {
        const [courseRes, chapRes] = await Promise.all([
          coursesApi.getCourseDetail(courseId),
          coursesApi.getCourseChapters(courseId),
        ]);
        setCourse(courseRes.data);
        setChapters(chapRes.data || []);
      } catch {
        message.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  // ── Tải chi tiết bài học ──────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    const fetchLesson = async () => {
      setDetailLoading(true);
      try {
        const res = await learningApi.getLesson(lessonId);
        setLessonDetail(res.data);
      } catch {
        message.error('Không thể tải nội dung bài học');
      } finally {
        setDetailLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  // ── Flat lesson list from chapters ─────────────────
  const allLessons = useMemo(() => {
    const result: LessonInChapter[] = [];
    chapters.forEach((ch) => ch.lessons.forEach((l) => result.push(l)));
    return result;
  }, [chapters]);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const currentLesson = currentIndex >= 0 ? allLessons[currentIndex] : null;
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // ── Progress ─────────────────────────
  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    let completed = 0;
    let total = 0;
    chapters.forEach((ch) =>
      ch.lessons.forEach((l) => {
        total++;
        if (l.status === 'passed') completed++;
      }),
    );
    return {
      completedCount: completed,
      totalCount: total,
      progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [chapters]);

  const goToLesson = (lesson: LessonInChapter) => {
    if (lesson.status === 'locked') {
      message.warning('Hãy hoàn thành chương trước để mở khoá bài này');
      return;
    }
    navigate(`/learn/${courseId}/${lesson.id}`);
  };

  // ── Render YouTube embed ──────────────────────────
  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/,
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // ── Loading state ─────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải khóa học..." />
      </div>
    );
  }

  // ── Build sidebar menu items ──
  const lessonStatusIcon = (l: LessonInChapter) => {
    if (l.id === lessonId) return <PlayCircleFilled style={{ color: '#1890ff' }} />;
    if (l.status === 'passed') return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    if (l.status === 'failed') return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    if (l.status === 'locked') return <LockOutlined style={{ color: '#bbb' }} />;
    return <BookOutlined style={{ color: '#999' }} />;
  };

  const sidebarMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ khoá học',
      onClick: () => navigate(`/learn/${courseId}`),
    },
    {
      key: 'content-group',
      label: 'Nội dung',
      type: 'group' as const,
      children: chapters.map((ch) => ({
        key: ch.id,
        icon: <BookOutlined />,
        label: `Bài ${ch.order}: ${ch.title}`,
        children: ch.lessons.map((l) => ({
          key: l.id,
          icon: lessonStatusIcon(l),
          label: (
            <Text
              ellipsis
              style={{
                fontSize: 13,
                color: l.status === 'locked' ? '#bbb' : undefined,
                fontWeight: l.id === lessonId ? 600 : undefined,
              }}
              title={`${l.label} ${l.title}`}
            >
              {l.label} {l.title}
            </Text>
          ),
          onClick: () => goToLesson(l),
          disabled: l.status === 'locked',
        })),
      })),
    },
  ];

  // Find current chapter for breadcrumb
  const currentChapter = chapters.find((ch) => ch.lessons.some((l) => l.id === lessonId));

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ═══ SIDEBAR ═══ */}
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={0}
        collapsed={sidebarCollapsed}
        theme="light"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        {/* Course info */}
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          <div
            style={{
              width: '100%',
              height: 100,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}
          >
            <BookOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 2 }}>
            {course?.title}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {course?.fieldName}
          </Text>

          {/* Progress */}
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text type="secondary" style={{ fontSize: 11 }}>Tiến độ</Text>
              <Text strong style={{ fontSize: 11 }}>{progressPercent}%</Text>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {completedCount}/{totalCount} bài
            </Text>
          </div>
        </div>

        {/* Chapter navigation */}
        <Menu
          mode="inline"
          selectedKeys={lessonId ? [lessonId] : []}
          defaultOpenKeys={currentChapter ? [currentChapter.id] : chapters.map((ch) => ch.id)}
          items={sidebarMenuItems}
          style={{ border: 'none', fontSize: 13 }}
        />
      </Sider>

      {/* ═══ CONTENT ═══ */}
      <Content
        style={{
          marginLeft: sidebarCollapsed ? 0 : SIDEBAR_WIDTH,
          transition: 'margin-left 0.2s',
          padding: '16px 24px',
          minHeight: '100vh',
        }}
      >
        {/* Toggle sidebar */}
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ marginBottom: 8 }}
        />

        {/* Breadcrumb */}
        <Breadcrumb
          style={{ marginBottom: 16 }}
          items={[
            {
              title: (
                <a onClick={() => navigate(`/learn/${courseId}`)}>
                  {course?.title || 'Khóa học'}
                </a>
              ),
            },
            ...(currentChapter
              ? [{ title: `Bài ${currentChapter.order}: ${currentChapter.title}` }]
              : []),
            {
              title: currentLesson
                ? `${currentLesson.label} ${lessonDetail?.lesson?.title || currentLesson.title}`
                : 'Đang tải...',
            },
          ]}
        />

        {detailLoading ? (
          <Card>
            <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: 60 }} />
          </Card>
        ) : lessonDetail ? (
          <>
            {/* ── 3 Tabs ── */}
            <Card style={{ marginBottom: 16 }}>
              <Tabs
                defaultActiveKey="theory"
                items={[
                  /* ─── Tab Lý thuyết ─── */
                  {
                    key: 'theory',
                    label: (
                      <span>
                        <BookOutlined /> Lý thuyết
                      </span>
                    ),
                    children: (
                      <div>
                        {/* Nội dung HTML */}
                        {lessonDetail.theory?.htmlContent ? (
                          <div
                            className="lesson-theory-content"
                            dangerouslySetInnerHTML={{
                              __html: lessonDetail.theory.htmlContent,
                            }}
                            style={{
                              lineHeight: 1.8,
                              fontSize: 15,
                              color: '#333',
                            }}
                          />
                        ) : (
                          <Text type="secondary">Chưa có nội dung lý thuyết.</Text>
                        )}

                        {/* PDF */}
                        {lessonDetail.theory?.pdfUrl && (
                          <div style={{ marginTop: 16 }}>
                            <Button
                              type="link"
                              icon={<FilePdfOutlined />}
                              href={lessonDetail.theory.pdfUrl}
                              target="_blank"
                            >
                              Tải tài liệu PDF
                            </Button>
                          </div>
                        )}

                        {/* Slides */}
                        {lessonDetail.theory?.slideEnabled &&
                          lessonDetail.theory?.slideEmbedUrl && (
                            <Collapse
                              style={{ marginTop: 16 }}
                              items={[
                                {
                                  key: 'slides',
                                  label: 'Xem slide bài giảng',
                                  children: (
                                    <div
                                      style={{
                                        position: 'relative',
                                        paddingBottom: '56.25%',
                                        height: 0,
                                        overflow: 'hidden',
                                      }}
                                    >
                                      <iframe
                                        src={lessonDetail.theory.slideEmbedUrl}
                                        title="Slide bài giảng"
                                        style={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          border: 'none',
                                        }}
                                        allowFullScreen
                                      />
                                    </div>
                                  ),
                                },
                              ]}
                            />
                          )}
                      </div>
                    ),
                  },

                  /* ─── Tab Tương tác ─── */
                  {
                    key: 'interaction',
                    label: (
                      <span>
                        <ExperimentOutlined /> Tương tác
                      </span>
                    ),
                    children: (
                      <div>
                        {lessonDetail.interaction?.type === 'video_youtube' &&
                          lessonDetail.interaction?.youtubeUrl ? (
                          <div>
                            <Title level={5} style={{ marginBottom: 12 }}>
                              Video bài giảng
                            </Title>
                            <div
                              style={{
                                position: 'relative',
                                paddingBottom: '56.25%',
                                height: 0,
                                overflow: 'hidden',
                                borderRadius: 8,
                              }}
                            >
                              <iframe
                                src={getYoutubeEmbedUrl(
                                  lessonDetail.interaction.youtubeUrl,
                                )}
                                title="Video bài giảng"
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  border: 'none',
                                  borderRadius: 8,
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        ) : lessonDetail.interaction?.type ===
                            'simulation_html_css' &&
                          lessonDetail.interaction?.htmlContent ? (
                          <div>
                            <Title level={5} style={{ marginBottom: 12 }}>
                              Mô phỏng tương tác
                            </Title>
                            <div
                              style={{
                                border: '1px solid #d9d9d9',
                                borderRadius: 8,
                                overflow: 'hidden',
                              }}
                            >
                              <iframe
                                srcDoc={lessonDetail.interaction.htmlContent}
                                title="Mô phỏng tương tác"
                                style={{
                                  width: '100%',
                                  height: 500,
                                  border: 'none',
                                }}
                                sandbox="allow-scripts allow-same-origin"
                              />
                            </div>
                          </div>
                        ) : (
                          <Text type="secondary">
                            Chưa có nội dung tương tác cho bài học này.
                          </Text>
                        )}
                      </div>
                    ),
                  },

                  /* ─── Tab Bài tập ─── */
                  {
                    key: 'practice',
                    label: (
                      <span>
                        <FormOutlined /> Bài tập
                      </span>
                    ),
                    children: (
                      <div>
                        <Card
                          style={{
                            background: '#fafafa',
                            textAlign: 'center',
                            maxWidth: 480,
                            margin: '0 auto',
                          }}
                        >
                          {/* Tổng quan */}
                          <Space
                            direction="vertical"
                            size={12}
                            style={{ width: '100%', marginBottom: 20 }}
                          >
                            <Title level={4} style={{ margin: 0 }}>
                              Bài tập luyện tập
                            </Title>

                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 32,
                              }}
                            >
                              <div>
                                <Text type="secondary">Số câu hỏi</Text>
                                <div>
                                  <Text strong style={{ fontSize: 20 }}>
                                    {lessonDetail.practice?.questionCount || 0}
                                  </Text>
                                </div>
                              </div>
                              <div>
                                <Text type="secondary">Điểm cao nhất</Text>
                                <div>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: 20,
                                      color:
                                        (lessonDetail.practice?.highestScore || 0) >= 70
                                          ? '#52c41a'
                                          : '#faad14',
                                    }}
                                  >
                                    {lessonDetail.practice?.highestScore ?? '--'}
                                  </Text>
                                </div>
                              </div>
                            </div>

                            {/* Badge đạt/chưa đạt */}
                            {lessonDetail.practice?.highestScore != null && (
                              <div>
                                {lessonDetail.practice.passed ? (
                                  <Tag
                                    color="success"
                                    icon={<CheckCircleOutlined />}
                                    style={{ fontSize: 14, padding: '4px 12px' }}
                                  >
                                    Đã đạt
                                  </Tag>
                                ) : (
                                  <Tag
                                    color="warning"
                                    style={{ fontSize: 14, padding: '4px 12px' }}
                                  >
                                    Chưa đạt (cần ≥ 70%)
                                  </Tag>
                                )}
                              </div>
                            )}
                          </Space>

                          {/* Nút bắt đầu */}
                          <Button
                            type="primary"
                            size="large"
                            block
                            icon={<FormOutlined />}
                            onClick={() =>
                              navigate(`/student/practice/${lessonId}`)
                            }
                            disabled={
                              !lessonDetail.practice?.questionCount
                            }
                          >
                            Bắt đầu làm bài
                          </Button>

                          {!lessonDetail.practice?.questionCount && (
                            <Text
                              type="secondary"
                              style={{
                                display: 'block',
                                marginTop: 8,
                                fontSize: 13,
                              }}
                            >
                              Chưa có câu hỏi nào cho bài này.
                            </Text>
                          )}
                        </Card>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* ── Bottom navigation ── */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 16,
              }}
            >
              <Button
                icon={<LeftOutlined />}
                disabled={!prevLesson || prevLesson.status === 'locked'}
                onClick={() => prevLesson && goToLesson(prevLesson)}
              >
                Bài trước
              </Button>
              <Button
                type="primary"
                disabled={!nextLesson || nextLesson.status === 'locked'}
                onClick={() => nextLesson && goToLesson(nextLesson)}
              >
                Bài tiếp <RightOutlined />
              </Button>
            </div>
          </>
        ) : (
          <Card>
            <Text type="secondary">Không tìm thấy nội dung bài học.</Text>
          </Card>
        )}
      </Content>

      {/* ═══ FLOATING CHAT BUTTON ═══ */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          fontSize: 24,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      />

      {/* ═══ AI CHAT DRAWER ═══ */}
      <Drawer
        title="Trợ lý AI"
        placement="right"
        width={400}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Card
              size="small"
              style={{
                background: '#f6f8fa',
                borderRadius: 12,
                maxWidth: '85%',
              }}
            >
              <Text>
                Xin chào! Mình là trợ lý AI. Bạn cần hỗ trợ gì về bài{' '}
                <Text strong>
                  &quot;{lessonDetail?.lesson?.title}&quot;
                </Text>{' '}
                không?
              </Text>
            </Card>
          </div>
          <div style={{ paddingTop: 12 }}>
            <Space.Compact style={{ width: '100%' }}>
              <input
                placeholder="Nhập câu hỏi..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px 0 0 6px',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
              <Button type="primary">Gửi</Button>
            </Space.Compact>
          </div>
        </div>
      </Drawer>
    </Layout>
  );
}
