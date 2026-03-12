import { useState, useEffect } from 'react';
import {
  Card, Input, Button, List, Alert, message, Typography, Spin,
} from 'antd';
import {
  TeamOutlined, LoginOutlined,
} from '@ant-design/icons';
import { classApi } from '@/services/api';

const { Title, Text } = Typography;

interface MyClass {
  id: string;
  name: string;
  teacherName: string;
  courseCount: number;
}

export default function JoinClassPage() {
  const [code, setCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [classes, setClasses] = useState<MyClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await classApi.getMyClasses();
      setClasses(res.data);
    } catch {
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleJoin = async () => {
    if (code.length < 6) return;
    setJoinLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await classApi.join(code.trim());
      setSuccess('Tham gia lớp học thành công!');
      message.success('Tham gia lớp học thành công!');
      setCode('');
      // Refresh class list
      fetchClasses();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Mã lớp không hợp lệ hoặc đã hết hạn';
      setError(msg);
      message.error(msg);
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '24px 0' }}>
      {/* Join Card */}
      <Card style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ marginBottom: 24 }}>
          🏫 NHẬP MÃ LỚP HỌC
        </Title>

        <Input
          size="large"
          maxLength={6}
          placeholder="Nhập mã lớp..."
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(null);
            setSuccess(null);
          }}
          onPressEnter={handleJoin}
          style={{
            textAlign: 'center',
            fontSize: 24,
            letterSpacing: 8,
            fontWeight: 'bold',
            marginBottom: 16,
          }}
        />

        <Button
          type="primary"
          size="large"
          icon={<LoginOutlined />}
          loading={joinLoading}
          disabled={code.length < 6}
          onClick={handleJoin}
          block
        >
          THAM GIA LỚP
        </Button>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginTop: 16 }}
          />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            showIcon
            closable
            onClose={() => setSuccess(null)}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Joined Classes List */}
      <Card
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8, color: '#2E75B6' }} />
            Lớp học đã tham gia
          </span>
        }
      >
        {loadingClasses ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="Đang tải danh sách lớp..." />
          </div>
        ) : classes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Text type="secondary">Bạn chưa tham gia lớp học nào</Text>
          </div>
        ) : (
          <List
            dataSource={classes}
            renderItem={(cls) => (
              <List.Item>
                <Text>
                  ● {cls.name} · GV {cls.teacherName} · {cls.courseCount} khóa học
                </Text>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
