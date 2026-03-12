import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Statistic, Progress, Typography, Spin, DatePicker,
} from 'antd';
import {
  BookOutlined, CheckCircleOutlined, ClockCircleOutlined,
} from '@ant-design/icons';
import { Column } from '@ant-design/charts';
import dayjs, { Dayjs } from 'dayjs';
import { learningApi } from '@/services/api';
import type { StudentCourseProgress } from '@ai-learning/types';

const { Title, Text } = Typography;

interface DailyActivity {
  date: string;
  minutes: number;
}

interface ProgressData {
  lessonsCompleted: number;
  lessonsPassed: number;
  totalHours: number;
  dailyActivity: DailyActivity[];
  courses: StudentCourseProgress[];
}

export default function ProgressPage() {
  const [month, setMonth] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const res = await learningApi.getProgress(month.format('YYYY-MM'));
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [month]);

  const chartData = (data?.dailyActivity ?? []).map((item) => ({
    ngày: dayjs(item.date).format('DD/MM'),
    phút: item.minutes,
  }));

  const chartConfig = {
    data: chartData,
    xField: 'ngày',
    yField: 'phút',
    color: '#2E75B6',
    columnWidthRatio: 0.5,
    label: {
      position: 'top' as const,
      style: { fill: '#595959', fontSize: 11 },
    },
    xAxis: { label: { autoRotate: false, style: { fontSize: 11 } } },
    yAxis: { title: { text: 'Phút học' } },
    meta: { phút: { alias: 'Thời gian (phút)' } },
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3} style={{ margin: 0 }}>📊 Tiến độ học tập</Title>
        </Col>
        <Col>
          <DatePicker
            picker="month"
            value={month}
            onChange={(val) => val && setMonth(val)}
            allowClear={false}
            format="MM/YYYY"
            placeholder="Chọn tháng"
          />
        </Col>
      </Row>

      {/* Statistic Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bài học"
              value={data?.lessonsCompleted ?? 0}
              prefix={<BookOutlined style={{ color: '#2E75B6' }} />}
              suffix="hoàn thành"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Bài đạt"
              value={data?.lessonsPassed ?? 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              suffix="đạt yêu cầu"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng giờ"
              value={data?.totalHours ?? 0}
              precision={1}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              suffix="giờ"
            />
          </Card>
        </Col>
      </Row>

      {/* Bar Chart - Daily Activity */}
      <Card title="Hoạt động theo ngày" style={{ marginBottom: 24 }}>
        {chartData.length > 0 ? (
          <Column {...chartConfig} height={280} />
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">Không có dữ liệu trong tháng này</Text>
          </div>
        )}
      </Card>

      {/* Course Progress List */}
      <Card title="Tiến độ theo khóa học">
        {(data?.courses ?? []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">Chưa có khóa học nào</Text>
          </div>
        ) : (
          (data?.courses ?? []).map((course) => (
            <div
              key={course.courseId}
              style={{
                marginBottom: 20,
                padding: '12px 16px',
                background: '#fafafa',
                borderRadius: 8,
              }}
            >
              <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                <Col>
                  <Text strong>{course.courseTitle}</Text>
                </Col>
                <Col>
                  <Text type="secondary">
                    {course.completedLessons}/{course.totalLessons} bài
                  </Text>
                </Col>
              </Row>
              <Progress
                percent={Math.round(course.completionPercent)}
                strokeColor="#2E75B6"
                size="small"
              />
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
