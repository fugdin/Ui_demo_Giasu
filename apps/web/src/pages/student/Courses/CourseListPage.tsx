import { Row, Col, Input, Select, Pagination, Skeleton, Card, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { coursesApi, fieldsApi, enrollmentsApi } from '../../../services/api';
import CourseCard from '../../../components/CourseCard';

const { Title, Text } = Typography;

export default function CourseListPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [fieldId, setFieldId] = useState<string | undefined>();
  const [level, setLevel] = useState<string | undefined>();
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pageSize = 12;

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await coursesApi.getCourses({ page, pageSize, search, fieldId, level });
      const data = res.data;
      setCourses(data.data || data);
      setTotal(data.total || (data.data || data).length);
    } catch {
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [page, search, fieldId, level]);

  useEffect(() => {
    fieldsApi.getFields().then((res) => setFields(res.data));
    enrollmentsApi.getEnrollments().then((res) => {
      const ids = new Set<string>((res.data || []).map((e: any) => e.courseId));
      setEnrolledIds(ids);
    });
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 300);
  };

  const handleEnroll = async (courseId: string) => {
    setEnrollLoading(courseId);
    try {
      await enrollmentsApi.enroll(courseId);
      message.success('Đăng ký khóa học thành công!');
      setEnrolledIds((prev) => new Set(prev).add(courseId));
    } catch {
      message.error('Đăng ký thất bại');
    } finally {
      setEnrollLoading(null);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>Khóa học</Title>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={10}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm khóa học..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            size="large"
          />
        </Col>
        <Col xs={12} sm={7}>
          <Select
            placeholder="Ngành"
            allowClear
            style={{ width: '100%' }}
            size="large"
            onChange={(v) => { setFieldId(v); setPage(1); }}
            options={fields.map((f: any) => ({ label: f.name, value: f.id }))}
          />
        </Col>
        <Col xs={12} sm={7}>
          <Select
            placeholder="Trình độ"
            allowClear
            style={{ width: '100%' }}
            size="large"
            onChange={(v) => { setLevel(v); setPage(1); }}
            options={[
              { label: 'Cơ bản', value: 'beginner' },
              { label: 'Trung cấp', value: 'intermediate' },
              { label: 'Nâng cao', value: 'advanced' },
            ]}
          />
        </Col>
      </Row>

      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Hiển thị {courses.length} / {total} khóa học
      </Text>

      {/* Grid */}
      {loading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <Card><Skeleton active paragraph={{ rows: 4 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : courses.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4} type="secondary">Không tìm thấy khóa học nào</Title>
          <Text type="secondary">Thử thay đổi bộ lọc để tìm kiếm</Text>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {courses.map((course: any) => (
            <Col xs={24} sm={12} md={8} lg={6} key={course.id}>
              <CourseCard
                {...course}
                enrolled={enrolledIds.has(course.id)}
                onEnroll={handleEnroll}
                enrollLoading={enrollLoading === course.id}
              />
            </Col>
          ))}
        </Row>
      )}

      {total > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}
