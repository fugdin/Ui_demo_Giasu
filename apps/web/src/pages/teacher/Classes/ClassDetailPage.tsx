import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Spin,
  message,
  Tooltip,
  Popconfirm,
  Modal,
  Select,
  Progress,
  Descriptions,
} from 'antd';
import {
  CopyOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
  BookOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Class, ClassStudent, ClassCourse } from '@ai-learning/types';
import { teacherApi, coursesApi } from '@/services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

interface ClassDetail extends Class {
  students: ClassStudent[];
  courses: ClassCourse[];
  progressMatrix?: {
    studentId: string;
    studentName: string;
    courses: { courseId: string; courseTitle: string; percent: number }[];
  }[];
}

export default function ClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [allCourses, setAllCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [assigning, setAssigning] = useState(false);

  const fetchClassDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data } = await teacherApi.getClassDetail(id);
      setClassDetail(data);
    } catch {
      message.error('Không thể tải thông tin lớp học');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClassDetail();
  }, [fetchClassDetail]);

  const handleCopyCode = () => {
    if (classDetail?.inviteCode) {
      navigator.clipboard.writeText(classDetail.inviteCode);
      message.success('Đã sao chép mã mời!');
    }
  };

  const handleRegenerateCode = async () => {
    if (!id) return;
    try {
      await teacherApi.regenerateInviteCode(id);
      message.success('Đã tạo mã mời mới!');
      fetchClassDetail();
    } catch {
      message.error('Không thể tạo mã mời mới');
    }
  };

  const handleOpenAssignModal = async () => {
    try {
      const { data } = await coursesApi.getCourses();
      const courses = data.data ?? data;
      setAllCourses(courses);
      setAssignModalOpen(true);
    } catch {
      message.error('Không thể tải danh sách khóa học');
    }
  };

  const handleAssignCourse = async () => {
    if (!id || !selectedCourseId) return;
    try {
      setAssigning(true);
      await teacherApi.assignCourse(id, selectedCourseId);
      message.success('Đã gán khóa học!');
      setAssignModalOpen(false);
      setSelectedCourseId(undefined);
      fetchClassDetail();
    } catch {
      message.error('Không thể gán khóa học');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!id) return;
    try {
      await teacherApi.removeCourse(id, courseId);
      message.success('Đã gỡ khóa học');
      fetchClassDetail();
    } catch {
      message.error('Không thể gỡ khóa học');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!classDetail) {
    return (
      <Card>
        <Text>Không tìm thấy thông tin lớp học.</Text>
      </Card>
    );
  }

  // ─── Tab: Học sinh ──────────────────────────────────────
  const studentColumns: ColumnsType<ClassStudent> = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinedAt',
      key: 'joinedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record) => (
        <Tooltip title="Xem tiến độ">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/teacher/classes/${id}/students/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  // ─── Tab: Khóa học ─────────────────────────────────────
  const courseColumns: ColumnsType<ClassCourse> = [
    {
      title: 'Tên khóa học',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Ngày gán',
      dataIndex: 'assignedAt',
      key: 'assignedAt',
      width: 150,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_: unknown, record) => (
        <Popconfirm
          title="Gỡ khóa học"
          description="Bạn có chắc muốn gỡ khóa học này khỏi lớp?"
          onConfirm={() => handleRemoveCourse(record.courseId)}
          okText="Gỡ"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Gỡ khóa học">
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  // ─── Tab: Tiến độ ──────────────────────────────────────
  const progressColumns: ColumnsType<NonNullable<ClassDetail['progressMatrix']>[number]> = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      fixed: 'left',
      width: 180,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    ...(classDetail.progressMatrix?.[0]?.courses ?? classDetail.courses ?? []).map(
      (course: { courseId: string; courseTitle: string }) => ({
        title: course.courseTitle,
        key: course.courseId,
        width: 160,
        align: 'center' as const,
        render: (_: unknown, record: NonNullable<ClassDetail['progressMatrix']>[number]) => {
          const c = record.courses?.find((c) => c.courseId === course.courseId);
          return <Progress percent={c?.percent ?? 0} size="small" />;
        },
      }),
    ),
  ];

  // Average row
  const averageRow = classDetail.progressMatrix?.length
    ? {
        studentId: '__avg__',
        studentName: 'Trung bình',
        courses: (classDetail.progressMatrix[0]?.courses ?? []).map((c) => {
          const values = classDetail.progressMatrix!.map(
            (row) => row.courses.find((rc) => rc.courseId === c.courseId)?.percent ?? 0,
          );
          const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
          return { courseId: c.courseId, courseTitle: c.courseTitle, percent: Math.round(avg) };
        }),
      }
    : null;

  const progressData = [
    ...(classDetail.progressMatrix ?? []),
    ...(averageRow ? [averageRow] : []),
  ];

  const tabItems = [
    {
      key: 'students',
      label: (
        <span>
          <TeamOutlined /> Học sinh ({classDetail.students?.length ?? 0})
        </span>
      ),
      children: (
        <Table
          dataSource={classDetail.students ?? []}
          columns={studentColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Chưa có học sinh nào' }}
        />
      ),
    },
    {
      key: 'courses',
      label: (
        <span>
          <BookOutlined /> Khóa học ({classDetail.courses?.length ?? 0})
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAssignModal}
            >
              Gán khóa học
            </Button>
          </div>
          <Table
            dataSource={classDetail.courses ?? []}
            columns={courseColumns}
            rowKey="courseId"
            pagination={false}
            locale={{ emptyText: 'Chưa gán khóa học nào' }}
          />
        </>
      ),
    },
    {
      key: 'progress',
      label: (
        <span>
          <BarChartOutlined /> Tiến độ
        </span>
      ),
      children: (
        <Table
          dataSource={progressData}
          columns={progressColumns}
          rowKey="studentId"
          pagination={false}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'Chưa có dữ liệu tiến độ' }}
          rowClassName={(record) =>
            record.studentId === '__avg__' ? 'ant-table-row-highlight' : ''
          }
        />
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <Card style={{ marginBottom: 24 }}>
        <Descriptions
          title={
            <Title level={4} style={{ margin: 0 }}>
              {classDetail.name}
            </Title>
          }
          extra={
            <Button onClick={() => navigate('/teacher/classes')}>
              ← Quay lại
            </Button>
          }
          column={{ xs: 1, sm: 2, md: 3 }}
        >
          <Descriptions.Item label="Số học sinh">
            <Tag color="blue">{classDetail.studentCount} HS</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {dayjs(classDetail.createdAt).format('DD/MM/YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Mã mời">
            <Space>
              <Tag color="green" style={{ fontSize: 16, padding: '4px 12px', letterSpacing: 2 }}>
                {classDetail.inviteCode}
              </Tag>
              <Tooltip title="Sao chép">
                <Button size="small" icon={<CopyOutlined />} onClick={handleCopyCode} />
              </Tooltip>
              <Tooltip title="Tạo mã mới">
                <Button size="small" icon={<ReloadOutlined />} onClick={handleRegenerateCode} />
              </Tooltip>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs items={tabItems} defaultActiveKey="students" />
      </Card>

      {/* Assign Course Modal */}
      <Modal
        title="Gán khóa học cho lớp"
        open={assignModalOpen}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedCourseId(undefined);
        }}
        onOk={handleAssignCourse}
        okText="Gán"
        cancelText="Hủy"
        confirmLoading={assigning}
        okButtonProps={{ disabled: !selectedCourseId }}
      >
        <div style={{ marginTop: 16 }}>
          <Text>Chọn khóa học:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Chọn khóa học..."
            value={selectedCourseId}
            onChange={setSelectedCourseId}
            showSearch
            optionFilterProp="label"
            options={allCourses.map((c) => ({
              value: c.id,
              label: c.title,
            }))}
          />
        </div>
      </Modal>
    </>
  );
}
