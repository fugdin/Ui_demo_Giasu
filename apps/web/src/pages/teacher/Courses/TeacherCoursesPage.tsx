import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Typography,
  Spin,
  message,
  Tag,
  Button,
  Tooltip,
} from 'antd';
import {
  ArrowRightOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Course, Lesson } from '@ai-learning/types';
import { teacherApi } from '@/services/api';

const { Title, Text } = Typography;

interface TeacherCourse extends Course {
  classCount?: number;
  lessons?: Lesson[];
}

const levelLabels: Record<string, { text: string; color: string }> = {
  beginner: { text: 'Cơ bản', color: 'green' },
  intermediate: { text: 'Trung bình', color: 'blue' },
  advanced: { text: 'Nâng cao', color: 'red' },
};

export default function TeacherCoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await teacherApi.getCourses();
        setCourses(data);
      } catch {
        message.error('Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const lessonColumns: ColumnsType<Lesson> = [
    {
      title: 'Thứ tự',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tên bài học',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'interactionType',
      key: 'interactionType',
      width: 160,
      render: (type: string) => (
        <Tag>{type === 'video_youtube' ? '🎬 Video' : '💻 Mô phỏng'}</Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 140,
      render: (_: unknown, record) => (
        <Tooltip title="Quản lý slide">
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/teacher/courses/${record.courseId}/lessons/${record.id}/slides`);
            }}
          >
            Slide
          </Button>
        </Tooltip>
      ),
    },
  ];

  const columns: ColumnsType<TeacherCourse> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngành',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 160,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      align: 'center',
      render: (level: string) => {
        const info = levelLabels[level] ?? { text: level, color: 'default' };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: 'Số lớp',
      dataIndex: 'classCount',
      key: 'classCount',
      width: 100,
      align: 'center',
      render: (count?: number) => count ?? 0,
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: () => (
        <ArrowRightOutlined style={{ color: '#1890ff' }} />
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải khóa học..." />
      </div>
    );
  }

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>
        Khóa học
      </Title>

      <Card>
        <Table
          dataSource={courses}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có khóa học nào' }}
          expandable={{
            expandedRowRender: (record) => (
              <Table
                dataSource={record.lessons ?? []}
                columns={lessonColumns}
                rowKey="id"
                pagination={false}
                size="small"
                locale={{ emptyText: 'Chưa có bài học' }}
              />
            ),
            rowExpandable: (record) => (record.lessons?.length ?? 0) > 0,
          }}
        />
      </Card>
    </>
  );
}
