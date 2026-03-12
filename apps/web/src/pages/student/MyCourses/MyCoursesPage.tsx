import {
  Tabs, Card, Progress, Button, Typography, Space,
  Skeleton, Row, Col, Badge, message,
} from 'antd';
import {
  BookOutlined, CheckCircleOutlined, PlayCircleOutlined,
  SafetyCertificateOutlined, SearchOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { enrollmentsApi } from '../../../services/api';

const { Title, Text } = Typography;

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await enrollmentsApi.getEnrollments();
        setEnrollments(res.data || []);
      } catch {
        message.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const inProgress = enrollments.filter((e) => e.status === 'in_progress');
  const completed = enrollments.filter((e) => e.status === 'completed');

  const renderEmpty = (text: string) => (
    <Card style={{ textAlign: 'center', padding: 48 }}>
      <BookOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16, display: 'block' }} />
      <Title level={4} type="secondary" style={{ marginBottom: 8 }}>{text}</Title>
      <Button type="primary" icon={<SearchOutlined />} onClick={() => navigate('/student/courses')}>
        Khám phá khóa học
      </Button>
    </Card>
  );

  const renderCourseCard = (enrollment: any, showCertificate = false) => (
    <Card key={enrollment.id} style={{ marginBottom: 16 }}>
      <Row gutter={16} align="middle">
        <Col xs={24} sm={4}>
          <div
            style={{
              height: 80,
              width: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
        </Col>
        <Col xs={24} sm={14}>
          <Title level={5} style={{ marginBottom: 4 }}>{enrollment.courseName}</Title>
          <Text type="secondary">
            Bài {enrollment.completedLessons}/{enrollment.totalLessons}
            {enrollment.currentLessonTitle && ` · ${enrollment.currentLessonTitle}`}
          </Text>
          <Progress
            percent={enrollment.progress}
            strokeColor={enrollment.status === 'completed' ? '#52c41a' : '#2E75B6'}
            style={{ marginTop: 8, marginBottom: 0, maxWidth: 400 }}
            format={(p) => `${p}%`}
          />
        </Col>
        <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
          <Space direction="vertical">
            {enrollment.status === 'completed' ? (
              <Badge status="success" text={<Text type="success">Đã hoàn thành</Text>} />
            ) : (
              <Badge status="processing" text={<Text style={{ color: '#2E75B6' }}>Đang học</Text>} />
            )}
            {showCertificate ? (
              <Button icon={<SafetyCertificateOutlined />}>Xem chứng nhận</Button>
            ) : (
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={() => navigate(`/learn/${enrollment.courseId}`)}
              >
                Tiếp tục học
              </Button>
            )}
          </Space>
        </Col>
      </Row>
    </Card>
  );

  if (loading) {
    return (
      <div>
        <Title level={3} style={{ marginBottom: 24 }}>Khóa học của tôi</Title>
        {[1, 2, 3].map((i) => (
          <Card key={i} style={{ marginBottom: 16 }}>
            <Skeleton active avatar paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  const tabItems = [
    {
      key: 'in_progress',
      label: (
        <Space>
          <BookOutlined />
          Đang học
          <Badge count={inProgress.length} style={{ backgroundColor: '#2E75B6' }} />
        </Space>
      ),
      children:
        inProgress.length > 0
          ? inProgress.map((e) => renderCourseCard(e))
          : renderEmpty('Bạn chưa đăng ký khóa học nào'),
    },
    {
      key: 'completed',
      label: (
        <Space>
          <CheckCircleOutlined />
          Đã hoàn thành
          <Badge count={completed.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      ),
      children:
        completed.length > 0
          ? completed.map((e) => renderCourseCard(e, true))
          : renderEmpty('Chưa hoàn thành khóa học nào'),
    },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Khóa học của tôi</Title>
      <Tabs items={tabItems} defaultActiveKey="in_progress" />
    </div>
  );
}
