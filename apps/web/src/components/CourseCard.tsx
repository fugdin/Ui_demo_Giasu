import { Card, Tag, Button, Typography } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

interface CourseCardProps {
  id: string;
  title: string;
  fieldName: string;
  level: string;
  lessonCount: number;
  description?: string;
  enrolled?: boolean;
  onEnroll?: (courseId: string) => void;
  enrollLoading?: boolean;
}

const levelColors: Record<string, string> = {
  beginner: 'green',
  intermediate: 'blue',
  advanced: 'orange',
};

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function CourseCard({
  id,
  title,
  fieldName,
  level,
  lessonCount,
  description,
  enrolled,
  onEnroll,
  enrollLoading,
}: CourseCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, display: 'flex', flexDirection: 'column' } }}
      cover={
        <div
          style={{
            height: 140,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BookOutlined style={{ fontSize: 48, color: '#fff' }} />
        </div>
      }
      actions={[
        enrolled ? (
          <Button type="primary" key="continue" onClick={() => navigate(`/courses/${id}`)}>
            Tiếp tục học
          </Button>
        ) : onEnroll ? (
          <Button type="primary" key="enroll" loading={enrollLoading} onClick={() => onEnroll(id)}>
            Đăng ký
          </Button>
        ) : (
          <Button key="detail" onClick={() => navigate(`/courses/${id}`)}>
            Xem thêm
          </Button>
        ),
      ]}
    >
      <Tag color={levelColors[level] || 'default'} style={{ marginBottom: 8 }}>
        {levelLabels[level] || level}
      </Tag>
      <Card.Meta
        title={<Text strong style={{ fontSize: 16 }}>{title}</Text>}
        description={
          <>
            <Text type="secondary" style={{ fontSize: 12 }}>{fieldName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{lessonCount} bài học</Text>
            {description && (
              <Paragraph
                type="secondary"
                ellipsis={{ rows: 2 }}
                style={{ marginTop: 8, fontSize: 13 }}
              >
                {description.replace(/<[^>]*>/g, '')}
              </Paragraph>
            )}
          </>
        }
      />
    </Card>
  );
}
