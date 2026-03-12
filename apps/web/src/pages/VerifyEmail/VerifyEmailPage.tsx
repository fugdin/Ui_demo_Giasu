import { Button, Typography, Result } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authExtraApi } from '../../services/api';

const { Text } = Typography;

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResend = async () => {
    setLoading(true);
    try {
      await authExtraApi.resendVerification(email);
      setCountdown(60);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Result
      icon={<MailOutlined style={{ color: '#2E75B6', fontSize: 64 }} />}
      title="Kiểm tra email của bạn!"
      subTitle={
        <>
          <Text>Đã gửi link xác minh đến:</Text>
          <br />
          <Text strong>{email}</Text>
        </>
      }
      extra={[
        <Button
          key="resend"
          type="primary"
          onClick={handleResend}
          loading={loading}
          disabled={countdown > 0}
        >
          {countdown > 0 ? `Gửi lại email (${countdown}s)` : 'Gửi lại email'}
        </Button>,
        <br key="br" />,
        <Link key="login" to="/login" style={{ marginTop: 8, display: 'inline-block' }}>
          Về trang đăng nhập
        </Link>,
      ]}
    />
  );
}
