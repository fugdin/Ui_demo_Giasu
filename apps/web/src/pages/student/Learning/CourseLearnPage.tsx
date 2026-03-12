import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout, Menu, Typography, Progress, Spin, message, Button, Tag, Tooltip,
} from 'antd';
import {
  BookOutlined, CheckCircleOutlined, LockOutlined,
  CloseCircleOutlined, PlayCircleFilled,
  HomeOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { coursesApi } from '@/services/api';
import type { Course, ChapterWithLessons, LessonInChapter } from '@ai-learning/types';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const SIDEBAR_WIDTH = 280;

/* ═══════════════════════════════════════════════════════════
 * CourseLearnPage — "Trang chủ khóa học"
 * Layout: Fixed left sidebar (course info + chapter nav)
 *         Main area listing all chapters → lessons
 * ═══════════════════════════════════════════════════════════ */
export default function CourseLearnPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<ChapterWithLessons[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    const fetch = async () => {
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
    fetch();
  }, [courseId]);

  // ── Progress calculation ──
  const { completedCount, totalCount, progressPercent } = useMemo(() => {
    let completed = 0;
    let total = 0;
    chapters.forEach((ch) => {
      ch.lessons.forEach((l) => {
        total++;
        if (l.status === 'passed') completed++;
      });
    });
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Đang tải khóa học..." />
      </div>
    );
  }

  // ── Build sidebar menu items ──
  const sidebarMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Trang chủ khoá học',
      style: { fontWeight: 600 },
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
          icon:
            l.status === 'passed' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
            l.status === 'failed' ? <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> :
            l.status === 'locked' ? <LockOutlined style={{ color: '#bbb' }} /> :
            <PlayCircleFilled style={{ color: '#1890ff' }} />,
          label: (
            <span style={{ color: l.status === 'locked' ? '#bbb' : undefined }}>
              {l.label} {l.title}
            </span>
          ),
          onClick: () => goToLesson(l),
          disabled: l.status === 'locked',
        })),
      })),
    },
  ];

  // ── Status rendering helpers ──
  const statusIcon = (l: LessonInChapter) => {
    if (l.status === 'passed') return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />;
    if (l.status === 'failed') return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 18 }} />;
    if (l.status === 'locked') return <LockOutlined style={{ color: '#bbb', fontSize: 18 }} />;
    return <PlayCircleFilled style={{ color: '#1890ff', fontSize: 18 }} />;
  };

  const statusTag = (l: LessonInChapter) => {
    if (l.status === 'passed') return <Tag color="success">Đã hoàn thành</Tag>;
    if (l.status === 'failed') return <Tag color="error">Chưa đạt</Tag>;
    if (l.status === 'locked') return <Tag color="default">Khoá</Tag>;
    return <Tag color="processing">Chưa học</Tag>;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* ═══ LEFT SIDEBAR ═══ */}
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={0}
        collapsed={collapsed}
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
        {/* Course info header */}
        <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
          {/* Course thumbnail */}
          <div
            style={{
              width: '100%',
              height: 120,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <BookOutlined style={{ fontSize: 40, color: '#fff' }} />
          </div>
          <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
            {course?.title}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {course?.fieldName} · {course?.level === 'beginner' ? 'Cơ bản' : course?.level === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
          </Text>

          {/* Progress */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>Tiến độ</Text>
              <Text strong style={{ fontSize: 12 }}>{progressPercent}%</Text>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="#52c41a"
              size="small"
            />
            <Text type="secondary" style={{ fontSize: 11 }}>
              {completedCount}/{totalCount} bài hoàn thành
            </Text>
          </div>
        </div>

        {/* Chapter navigation */}
        <Menu
          mode="inline"
          selectedKeys={['home']}
          defaultOpenKeys={chapters.map((ch) => ch.id)}
          items={sidebarMenuItems}
          style={{ border: 'none', fontSize: 13 }}
        />

        {/* Back button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            block
            onClick={() => navigate('/student/my-courses')}
            style={{ textAlign: 'left' }}
          >
            Khoá học của tôi
          </Button>
        </div>
      </Sider>

      {/* ═══ MAIN CONTENT ═══ */}
      <Layout style={{ marginLeft: collapsed ? 0 : SIDEBAR_WIDTH, transition: 'margin-left 0.2s' }}>
        <Content style={{ padding: 24, minHeight: '100vh' }}>
          {/* Toggle sidebar */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginBottom: 16 }}
          />

          {/* Course home title */}
          <Title level={3} style={{ marginBottom: 8 }}>
            {course?.title}
          </Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Khoá học bao gồm {chapters.length} chương · {totalCount} bài học
          </Text>

          {/* Chapters listing */}
          {chapters.map((ch) => {
            const allPassed = ch.lessons.every((l) => l.status === 'passed');
            const chapterProgress = ch.lessons.length > 0
              ? Math.round((ch.lessons.filter((l) => l.status === 'passed').length / ch.lessons.length) * 100)
              : 0;

            return (
              <div
                key={ch.id}
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 16,
                  border: '1px solid #f0f0f0',
                }}
              >
                {/* Chapter header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: allPassed ? '#f6ffed' : '#e6f7ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {allPassed ? (
                        <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 18 }} />
                      ) : (
                        <BookOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                      )}
                    </div>
                    <div>
                      <Text strong style={{ fontSize: 15 }}>
                        Bài {ch.order}: {ch.title}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {ch.lessons.length} bài học · Hoàn thành {chapterProgress}%
                      </Text>
                    </div>
                  </div>
                  <Progress
                    type="circle"
                    percent={chapterProgress}
                    size={40}
                    strokeColor="#52c41a"
                  />
                </div>

                {/* Lessons list */}
                {ch.lessons.map((lesson, idx) => {
                  const isLocked = lesson.status === 'locked';
                  // Find the prerequisite chapter name for locked lessons
                  const prevChapter = isLocked
                    ? chapters.find((c) => c.order === ch.order - 1)
                    : null;

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => goToLesson(lesson)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 8,
                        marginBottom: idx < ch.lessons.length - 1 ? 8 : 0,
                        background: isLocked ? '#fafafa' : '#fff',
                        border: '1px solid #f0f0f0',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.6 : 1,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        if (!isLocked) (e.currentTarget as HTMLElement).style.borderColor = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {statusIcon(lesson)}
                        <div>
                          <Text
                            strong={!isLocked}
                            style={{
                              fontSize: 14,
                              color: isLocked ? '#bbb' : undefined,
                            }}
                          >
                            {lesson.label} {lesson.title}
                          </Text>
                          {lesson.shortDescription && (
                            <>
                              <br />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {lesson.shortDescription}
                              </Text>
                            </>
                          )}
                          {isLocked && prevChapter && (
                            <>
                              <br />
                              <Text type="secondary" style={{ fontSize: 11, fontStyle: 'italic' }}>
                                <LockOutlined /> Hoàn thành "Bài {prevChapter.order}: {prevChapter.title}" để mở khoá
                              </Text>
                            </>
                          )}
                        </div>
                      </div>
                      {statusTag(lesson)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </Content>
      </Layout>
    </Layout>
  );
}
