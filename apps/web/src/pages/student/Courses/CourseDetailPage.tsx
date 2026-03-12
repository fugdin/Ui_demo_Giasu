import {
  Card, Row, Col, Tag, Button, Typography, Collapse,
  Skeleton, Space, Divider, message,
} from 'antd';
import {
  BookOutlined, ClockCircleOutlined, TrophyOutlined, PlayCircleOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, enrollmentsApi } from '../../../services/api';

const { Title, Text } = Typography;

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

const levelColors: Record<string, string> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'orange',
};

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, lessonsRes, enrollRes] = await Promise.all([
          coursesApi.getCourseDetail(id!),
          coursesApi.getCourseLessons(id!),
          enrollmentsApi.getEnrollments(),
        ]);
        setCourse(courseRes.data);
        setLessons(lessonsRes.data || []);
        const enrollments = enrollRes.data || [];
        setEnrolled(enrollments.some((e: any) => e.courseId === id));
      } catch {
        message.error('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleEnroll = async () => {
    setEnrollLoading(true);
    try {
      await enrollmentsApi.enroll(id!);
      message.success('Đăng ký khóa học thành công!');
      setEnrolled(true);
    } catch {
      message.error('Đăng ký thất bại');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
    return (
      <Row gutter={[24, 24]}>
        <Col xs={24} md={14}><Card><Skeleton active paragraph={{ rows: 8 }} /></Card></Col>
        <Col xs={24} md={10}><Card><Skeleton active paragraph={{ rows: 6 }} /></Card></Col>
      </Row>
    );
  }

  if (!course) return null;

  const collapseItems = lessons.map((lesson: any, idx: number) => ({
    key: lesson.id,
    label: (
      <Space>
        <PlayCircleOutlined />
        <Text>Bài {idx + 1}: {lesson.title}</Text>
      </Space>
    ),
    children: <Text type="secondary">{lesson.shortDescription || 'Nội dung bài học'}</Text>,
  }));

  return (
    <Row gutter={[24, 24]}>
      {/* Left */}
      <Col xs={24} md={14}>
        <div
          style={{
            height: 300,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <BookOutlined style={{ fontSize: 80, color: '#fff' }} />
        </div>

        <Card title="Mô tả" style={{ marginBottom: 24 }}>
          <div dangerouslySetInnerHTML={{ __html: course.description || '<p>Chưa có mô tả</p>' }} />
        </Card>

        <Card title={`Nội dung khóa học (${lessons.length} bài)`}>
          {lessons.length > 0 ? (
            <Collapse items={collapseItems} />
          ) : (
            <Text type="secondary">Chưa có bài học nào</Text>
          )}
        </Card>
      </Col>

      {/* Right */}
      <Col xs={24} md={10}>
        <Card style={{ position: 'sticky', top: 88 }}>
          <Title level={3} style={{ marginBottom: 8 }}>{course.title}</Title>

          <Space direction="vertical" size={12} style={{ width: '100%', marginBottom: 24 }}>
            <div>
              <Text type="secondary">Trình độ: </Text>
              <Tag color={levelColors[course.level]}>{levelLabels[course.level] || course.level}</Tag>
            </div>
            <div>
              <BookOutlined style={{ marginRight: 8, color: '#2E75B6' }} />
              <Text>{course.lessonCount || lessons.length} bài học</Text>
            </div>
            <div>
              <ClockCircleOutlined style={{ marginRight: 8, color: '#2E75B6' }} />
              <Text>Ngành: {course.fieldName}</Text>
            </div>
            <div>
              <TrophyOutlined style={{ marginRight: 8, color: '#faad14' }} />
              <Text>Điểm pass: &ge; {course.passThreshold}%</Text>
            </div>
          </Space>

          <Divider />

          {enrolled ? (
            <Button type="primary" block size="large" onClick={() => navigate(`/learn/${id}`)}>
              VÀO HỌC
            </Button>
          ) : (
            <Button type="primary" block size="large" loading={enrollLoading} onClick={handleEnroll}>
              ĐĂNG KÝ
            </Button>
          )}
        </Card>
      </Col>
    </Row>
  );
}
