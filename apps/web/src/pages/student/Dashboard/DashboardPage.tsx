import {
  Card, Row, Col, Statistic, Button, Progress, Input,
  Typography, Skeleton, message, Space,
} from 'antd';
import {
  BookOutlined, CheckCircleOutlined, TrophyOutlined,
  RocketOutlined, ExperimentOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useAuth } from '@ai-learning/auth';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentApi, enrollmentsApi, classApi } from '../../../services/api';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<any>(null);
  const [latestEnrollment, setLatestEnrollment] = useState<any>(null);
  const [classCode, setClassCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, enrollRes] = await Promise.all([
          studentApi.getDashboard(),
          enrollmentsApi.getEnrollments({ status: 'in_progress' }),
        ]);
        setDashboard(dashRes.data);
        const enrollments = enrollRes.data;
        if (Array.isArray(enrollments) && enrollments.length > 0) {
          setLatestEnrollment(enrollments[0]);
        }
      } catch {
        message.error('Không thể tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;
    setJoinLoading(true);
    try {
      await classApi.join(classCode.trim());
      message.success('Tham gia lớp học thành công!');
      setClassCode('');
    } catch {
      message.error('Mã lớp không hợp lệ');
    } finally {
      setJoinLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 24 }} />
        <Row gutter={[16, 16]}>
          {[1, 2, 3].map((i) => (
            <Col xs={24} sm={8} key={i}>
              <Card><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={14}><Card><Skeleton active paragraph={{ rows: 3 }} /></Card></Col>
          <Col xs={24} md={10}><Card><Skeleton active paragraph={{ rows: 3 }} /></Card></Col>
        </Row>
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        Xin chào, {user?.name || 'Học viên'}! 👋
      </Title>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Khóa học đang học"
              value={dashboard?.enrolledCourses ?? 0}
              prefix={<BookOutlined style={{ color: '#2E75B6' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bài hoàn thành"
              value={`${dashboard?.completedLessons ?? 0}/${dashboard?.totalLessons ?? 0}`}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chứng nhận"
              value={dashboard?.certificates ?? 0}
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Continue Learning + Assessment CTA */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {latestEnrollment && (
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <RocketOutlined style={{ color: '#2E75B6' }} />
                  <span>Tiếp tục học</span>
                </Space>
              }
            >
              <Title level={5} style={{ marginBottom: 4 }}>{latestEnrollment.courseName}</Title>
              <Text type="secondary">
                Bài {latestEnrollment.completedLessons}/{latestEnrollment.totalLessons}:{' '}
                {latestEnrollment.currentLessonTitle}
              </Text>
              <Progress
                percent={latestEnrollment.progress}
                style={{ margin: '12px 0' }}
                strokeColor="#2E75B6"
              />
              <Button type="primary" onClick={() => navigate(`/student/courses/${latestEnrollment.courseId}`)}>
                Tiếp tục
              </Button>
            </Card>
          </Col>
        )}

        <Col xs={24} md={latestEnrollment ? 10 : 24}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
            }}
          >
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <ExperimentOutlined style={{ fontSize: 48, color: '#fff', marginBottom: 16 }} />
              <Title level={4} style={{ color: '#fff', marginBottom: 8 }}>
                Đánh giá năng lực
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.85)', display: 'block', marginBottom: 16 }}>
                Kiểm tra trình độ để nhận gợi ý khóa học phù hợp
              </Text>
              <Button size="large" onClick={() => navigate('/student/assessment')} style={{ borderRadius: 20 }}>
                Bắt đầu ngay
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Join Class */}
      <Card
        title={
          <Space>
            <TeamOutlined style={{ color: '#2E75B6' }} />
            <span>Tham gia lớp học</span>
          </Space>
        }
      >
        <Space.Compact style={{ width: '100%', maxWidth: 400 }}>
          <Input
            placeholder="Nhập mã lớp..."
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            onPressEnter={handleJoinClass}
          />
          <Button type="primary" loading={joinLoading} onClick={handleJoinClass}>
            Tham gia
          </Button>
        </Space.Compact>
      </Card>
    </div>
  );
}
