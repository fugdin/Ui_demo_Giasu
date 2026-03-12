import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, message } from 'antd';
import {
  TeamOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/charts';
import { PageHeader } from '@ai-learning/ui';
import type { AdminDashboardStats } from '@ai-learning/types';
import { dashboardApi } from '@/services/adminApi';

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await dashboardApi.getStats();
        setStats(data);
      } catch {
        message.error('Không thể tải dữ liệu dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: 24 }}>
        <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống" />
        <div
          style={{
            marginTop: 16,
            padding: 32,
            background: '#fff',
            borderRadius: 8,
            textAlign: 'center',
            border: '1px dashed #d9d9d9',
          }}
        >
          Chưa có dữ liệu hiển thị (backend chưa kết nối hoặc đang tạm tắt).
        </div>
      </div>
    );
  }

  const lineConfig = {
    data: stats.recentRegistrations,
    xField: 'date',
    yField: 'count',
    smooth: true,
    point: { size: 4, shape: 'circle' },
    xAxis: { title: { text: 'Ngày' } },
    yAxis: { title: { text: 'Số đăng ký' }, minInterval: 1 },
  };

  const pieConfig = {
    data: stats.completionByField,
    angleField: 'percent',
    colorField: 'field',
    radius: 0.8,
    innerRadius: 0.5,
    label: {
      text: (d: { field: string; percent: number }) =>
        `${d.field}: ${d.percent}%`,
      position: 'outside' as const,
    },
    legend: { position: 'bottom' as const },
    tooltip: {
      title: 'field',
    },
  };

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Tổng quan hệ thống" />

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học sinh"
              value={stats.totalStudents}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="KH hoạt động"
              value={stats.activeCourses}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành"
              value={stats.completionRate}
              suffix="%"
              precision={1}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ pass"
              value={stats.passRate}
              suffix="%"
              precision={1}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="Đăng ký mới 7 ngày">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Phân bố hoàn thành theo ngành">
            <Pie {...pieConfig} />
          </Card>
        </Col>
      </Row>
    </>
  );
}
