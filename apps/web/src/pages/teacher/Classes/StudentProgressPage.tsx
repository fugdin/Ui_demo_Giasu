import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Tag,
  Spin,
  message,
  Typography,
  Descriptions,
  Progress,
  Button,
  Space,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type {
  ClassStudent,
  StudentCourseProgress,
  StudentLessonProgress,
} from '@ai-learning/types';
import { teacherApi } from '@/services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface StudentProgressData {
  student: ClassStudent;
  courseProgresses: StudentCourseProgress[];
  lessonProgresses: StudentLessonProgress[];
}

export default function StudentProgressPage() {
  const { id: classId, studentId } = useParams<{ id: string; studentId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<StudentProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!classId || !studentId) return;
      try {
        const { data: result } = await teacherApi.getStudentProgress(classId, studentId);
        setData(result);
      } catch {
        message.error('Không thể tải tiến độ học sinh');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [classId, studentId]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải tiến độ..." />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <Text>Không tìm thấy thông tin học sinh.</Text>
      </Card>
    );
  }

  const renderStatus = (status: string) => {
    switch (status) {
      case 'passed':
        return <Tag color="green">✅ Đạt</Tag>;
      case 'failed':
        return <Tag color="red">❌ Chưa đạt</Tag>;
      default:
        return <Tag color="default">— Chưa làm</Tag>;
    }
  };

  const lessonColumns: ColumnsType<StudentLessonProgress> = [
    {
      title: 'Bài',
      dataIndex: 'lessonOrder',
      key: 'lessonOrder',
      width: 70,
      align: 'center',
      sorter: (a, b) => a.lessonOrder - b.lessonOrder,
    },
    {
      title: 'Tên bài học',
      dataIndex: 'lessonTitle',
      key: 'lessonTitle',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: renderStatus,
    },
    {
      title: 'Điểm cao nhất',
      dataIndex: 'highestScore',
      key: 'highestScore',
      width: 140,
      align: 'center',
      render: (score: number | null) =>
        score !== null ? (
          <Text strong style={{ color: score >= 80 ? '#52c41a' : score >= 50 ? '#faad14' : '#f5222d' }}>
            {score}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <>
      {/* Back button + Title */}
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/teacher/classes/${classId}`)}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Tiến độ học sinh
        </Title>
      </Space>

      {/* Student Info */}
      <Card style={{ marginBottom: 24 }}>
        <Descriptions column={{ xs: 1, sm: 3 }}>
          <Descriptions.Item label="Họ tên">
            <Text strong>{data.student.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email">{data.student.email}</Descriptions.Item>
          <Descriptions.Item label="Ngày tham gia">
            {dayjs(data.student.joinedAt).format('DD/MM/YYYY')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Course Progress Overview */}
      {data.courseProgresses.length > 0 && (
        <Card title="Tiến độ theo khóa học" style={{ marginBottom: 24 }}>
          {data.courseProgresses.map((cp) => (
            <div key={cp.courseId} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text strong>{cp.courseTitle}</Text>
                <Text type="secondary">
                  {cp.completedLessons}/{cp.totalLessons} bài
                </Text>
              </div>
              <Progress
                percent={cp.completionPercent}
                status={cp.completionPercent === 100 ? 'success' : 'active'}
              />
            </div>
          ))}
        </Card>
      )}

      {/* Lesson Detail Table */}
      <Card title="Chi tiết từng bài học">
        <Table
          dataSource={data.lessonProgresses}
          columns={lessonColumns}
          rowKey="lessonId"
          pagination={false}
          locale={{ emptyText: 'Chưa có dữ liệu bài học' }}
        />
      </Card>
    </>
  );
}
