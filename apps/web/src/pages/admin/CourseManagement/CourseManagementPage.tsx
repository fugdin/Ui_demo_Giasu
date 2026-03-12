import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Tag, Space, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PageHeader, DataTable } from '@ai-learning/ui';
import type { Course, CourseLevel, Field, TableParams } from '@ai-learning/types';
import type { ColumnsType } from 'antd/es/table';
import { coursesApi, fieldsApi } from '@/services/adminApi';

const LEVEL_CONFIG: Record<CourseLevel, { color: string; label: string }> = {
  beginner: { color: 'green', label: 'Cơ bản' },
  intermediate: { color: 'orange', label: 'Trung bình' },
  advanced: { color: 'red', label: 'Nâng cao' },
};

export default function CourseManagementPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [fieldFilter, setFieldFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch field options for the filter
  useEffect(() => {
    fieldsApi.getAll().then(({ data }) => setFields(data)).catch(() => {});
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params: TableParams = {
        page,
        pageSize,
        search: search || undefined,
        filters: {
          ...(fieldFilter !== 'all' ? { fieldId: fieldFilter } : {}),
        },
      };
      const { data } = await coursesApi.getAll(params);
      setCourses(data.data);
      setTotal(data.total);
    } catch {
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, fieldFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const columns: ColumnsType<Course> = [
    {
      title: 'Tên KH',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Ngành',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      width: 120,
      render: (level: CourseLevel) => {
        const config = LEVEL_CONFIG[level];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Số bài',
      dataIndex: 'lessonCount',
      key: 'lessonCount',
      width: 100,
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: unknown, record: Course) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/courses/${record.id}/edit`)}
            title="Chỉnh sửa"
          >
            Sửa
          </Button>
          <Button
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => navigate(`/admin/courses/${record.id}/lessons`)}
            title="Quản lý bài"
          >
            Bài học
          </Button>
        </Space>
      ),
    },
  ];

  const fieldOptions = [
    { value: 'all', label: 'Tất cả ngành' },
    ...fields.map((f) => ({ value: f.id, label: f.name })),
  ];

  return (
    <>
      <PageHeader
        title="Quản lý khóa học"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/courses/create')}
          >
            + Tạo khóa học
          </Button>
        }
      />

      {/* Filter bar */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          value={fieldFilter}
          onChange={(value) => {
            setFieldFilter(value);
            setPage(1);
          }}
          style={{ width: 200 }}
          options={fieldOptions}
        />
      </Space>

      <DataTable<Course>
        rowKey="id"
        columns={columns}
        dataSource={courses}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </>
  );
}
