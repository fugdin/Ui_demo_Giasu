import { Card, Row, Col, Statistic, Tag, Button, Typography, Skeleton, message } from 'antd';
import { TrophyOutlined, HomeOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentApi, coursesApi, enrollmentsApi } from '../../../services/api';
import CourseCard from '../../../components/CourseCard';

const { Title, Text } = Typography;

const levelColors: Record<string, string> = {
  'Yếu': 'red',
  'Cơ bản': 'orange',
  'Trung cấp': 'blue',
  'Thành thạo': 'green',
};

export default function AssessmentResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollLoading, setEnrollLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await assessmentApi.getResult(id || 'latest');
        setResult(res.data);

        if (res.data.recommendedCourses?.length) {
          const coursePromises = res.data.recommendedCourses.map((cid: string) =>
            coursesApi.getCourseDetail(cid).then((r) => r.data).catch(() => null),
          );
          const courseResults = await Promise.all(coursePromises);
          setCourses(courseResults.filter(Boolean));
        }
      } catch {
        message.error('Không thể tải kết quả');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleEnroll = async (courseId: string) => {
    setEnrollLoading(courseId);
    try {
      await enrollmentsApi.enroll(courseId);
      message.success('Đăng ký khóa học thành công!');
    } catch {
      message.error('Đăng ký thất bại');
    } finally {
      setEnrollLoading(null);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <Card><Skeleton active paragraph={{ rows: 6 }} /></Card>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ textAlign: 'center', marginBottom: 24 }}>
        <TrophyOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
        <Title level={3}>KẾT QUẢ ĐÁNH GIÁ</Title>

        <Statistic
          value={result.score}
          suffix="/ 100"
          valueStyle={{ fontSize: 48, fontWeight: 700, color: '#2E75B6' }}
        />

        <div style={{ margin: '16px 0' }}>
          <Text style={{ fontSize: 16 }}>Trình độ: </Text>
          <Tag
            color={levelColors[result.level] || 'default'}
            style={{ fontSize: 16, padding: '4px 16px' }}
          >
            {result.level}
          </Tag>
        </div>

        <Text type="secondary">
          {result.fieldName} - {result.subjectName} | {result.correctAnswers}/{result.totalQuestions}{' '}
          câu đúng
        </Text>
      </Card>

      {courses.length > 0 && (
        <>
          <Title level={4} style={{ marginBottom: 16 }}>
            Khóa học đề xuất cho bạn
          </Title>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {courses.map((course: any) => (
              <Col xs={24} sm={12} key={course.id}>
                <CourseCard
                  {...course}
                  onEnroll={handleEnroll}
                  enrollLoading={enrollLoading === course.id}
                />
              </Col>
            ))}
          </Row>
        </>
      )}

      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <Button size="large" icon={<AppstoreOutlined />} onClick={() => navigate('/student/courses')}>
          Xem tất cả khóa học
        </Button>
        <Button size="large" type="primary" icon={<HomeOutlined />} onClick={() => navigate('/student/')}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}
