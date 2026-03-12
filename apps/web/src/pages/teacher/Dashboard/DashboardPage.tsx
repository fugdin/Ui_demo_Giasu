import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Spin,
  message,
  Table,
  Button,
  Typography,
  Timeline,
  Progress,
} from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '@ai-learning/auth';
import type { TeacherDashboardStats } from '@ai-learning/types';
import { teacherApi } from '@/services/api';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<TeacherDashboardStats | null>(null);
  const [activities, setActivities] = useState<{ id: string; text: string; time: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, actRes] = await Promise.all([
          teacherApi.getDashboard(),
          teacherApi.getActivities(),
        ]);
        setStats(dashRes.data);
        setActivities(actRes.data);
      } catch {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  const recentActivities = activities.map((a) => ({
    children: (
      <span>
        {a.text} <Text type="secondary">— {a.time}</Text>
      </span>
    ),
    color: a.type === 'completed' ? 'green' : a.type === 'passed' ? 'blue' : 'gray',
  }));

  const classColumns: ColumnsType<TeacherDashboardStats['classes'][number]> = [
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Số HS',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Hoàn thành',
      dataIndex: 'completionPercent',
      key: 'completionPercent',
      width: 200,
      render: (value: number) => <Progress percent={value} size="small" />,
    },
    {
      title: '',
      key: 'action',
      width: 120,
      render: (_: unknown, record) => (
        <Button
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate(`/teacher/classes/${record.id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Greeting */}
      <Title level={3} style={{ marginBottom: 24 }}>
        Xin chào, thầy/cô {user?.name}! 👋
      </Title>

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng số lớp"
              value={stats?.totalClasses ?? 0}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={stats?.totalStudents ?? 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Hoàn thành trung bình"
              value={stats?.averageCompletion ?? 0}
              suffix="%"
              precision={1}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent activity timeline */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <>
                <ClockCircleOutlined /> Hoạt động gần đây
              </>
            }
          >
            <Timeline items={recentActivities} />
          </Card>
        </Col>

        {/* Classes mini table */}
        <Col xs={24} lg={16}>
          <Card
            title="Danh sách lớp học"
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/teacher/classes/create')}
              >
                Tạo lớp mới
              </Button>
            }
          >
            <Table
              dataSource={stats?.classes ?? []}
              columns={classColumns}
              rowKey="id"
              pagination={false}
              size="middle"
              locale={{ emptyText: 'Chưa có lớp học nào' }}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}
