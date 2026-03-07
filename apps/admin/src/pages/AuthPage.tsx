import { Form, Input, Button, Alert, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@ai-learning/auth';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LoginRequest, RegisterRequest } from '@ai-learning/types';

const { Title, Text } = Typography;

// ─── Animation ──────────────────────────────────────────────

const DURATION = '0.7s';
const EASING = 'cubic-bezier(0.65, 0, 0.35, 1)';
const TRANSITION_ALL = `all ${DURATION} ${EASING}`;
const GRADIENT = 'linear-gradient(135deg, #2E75B6 0%, #1a5276 100%)';

// ─── Styles ─────────────────────────────────────────────────

const styles = {
  page: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    overflow: 'hidden',
  } as React.CSSProperties,

  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: '#fff',
  } as React.CSSProperties,

  formsWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
  } as React.CSSProperties,

  formPanel: {
    width: '50%',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 60px',
    transition: TRANSITION_ALL,
  } as React.CSSProperties,

  formInner: {
    width: '100%',
    maxWidth: 400,
  } as React.CSSProperties,

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '50%',
    height: '100%',
    background: GRADIENT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    color: '#fff',
    zIndex: 10,
    transition: TRANSITION_ALL,
    willChange: 'transform',
  } as React.CSSProperties,

  overlayTitle: {
    color: '#fff',
    marginBottom: 8,
    fontWeight: 600,
  } as React.CSSProperties,

  overlayText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 1.7,
    maxWidth: 320,
  } as React.CSSProperties,

  overlayBtn: {
    borderColor: '#fff',
    color: '#fff',
    borderRadius: 20,
    height: 40,
    paddingInline: 32,
    fontWeight: 500,
  } as React.CSSProperties,

  overlayContent: {
    transition: `opacity 0.4s ${EASING}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  } as React.CSSProperties,

  icon: {
    fontSize: 72,
    marginBottom: 20,
  } as React.CSSProperties,

  switchLink: {
    textAlign: 'center',
    marginTop: 8,
  } as React.CSSProperties,
} as const;

// ─── Component ──────────────────────────────────────────────

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [isRegister, setIsRegister] = useState(location.pathname === '/register');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // ── Toggle ──────────────────────────────────────────────

  const switchToRegister = () => {
    setIsRegister(true);
    navigate('/register', { replace: true });
  };

  const switchToLogin = () => {
    setIsRegister(false);
    navigate('/login', { replace: true });
  };

  // ── Login handler ───────────────────────────────────────

  const handleLogin = async (values: LoginRequest) => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(values.email, values.password, values.remember);
    } catch {
      setLoginError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Register handler ────────────────────────────────────

  const handleRegister = async (values: RegisterRequest) => {
    setRegisterLoading(true);
    setRegisterError(null);
    try {
      await register(values);
      navigate('/', { replace: true });
    } catch {
      setRegisterError('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegisterLoading(false);
    }
  };

  // ── Dynamic styles ─────────────────────────────────────

  // Overlay: starts at left=0, slides to right via translateX(100%)
  // Border-radius on the leading edge for a curved curtain effect
  const overlayStyle: React.CSSProperties = {
    ...styles.overlay,
    transform: isRegister ? 'translateX(100%)' : 'translateX(0)',
  };

  // Register form panel (LEFT): slides slightly right when revealed
  const registerPanelStyle: React.CSSProperties = {
    ...styles.formPanel,
    transform: isRegister ? 'translateX(0)' : 'translateX(-8%)',
    opacity: isRegister ? 1 : 0,
  };

  // Login form panel (RIGHT): slides slightly left when revealed
  const loginPanelStyle: React.CSSProperties = {
    ...styles.formPanel,
    transform: isRegister ? 'translateX(8%)' : 'translateX(0)',
    opacity: isRegister ? 0 : 1,
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ── Two forms side by side ─────────────────────── */}
        <div style={styles.formsWrapper}>
          {/* LEFT half: Register Form */}
          <div style={registerPanelStyle}>
            <div style={styles.formInner}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>Đăng ký</Title>
                <Text type="secondary">Tạo tài khoản mới</Text>
              </div>

              {registerError && (
                <Alert message={registerError} type="error" showIcon style={{ marginBottom: 16 }} />
              )}

              <Form layout="vertical" onFinish={handleRegister} autoComplete="off">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Họ và tên" size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không đúng định dạng' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                    { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                      },
                    }),
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu" size="large" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 12 }}>
                  <Button type="primary" htmlType="submit" block size="large" loading={registerLoading}>
                    ĐĂNG KÝ
                  </Button>
                </Form.Item>

                <div style={styles.switchLink}>
                  Đã có tài khoản?{' '}
                  <a onClick={switchToLogin}>Đăng nhập</a>
                </div>
              </Form>
            </div>
          </div>

          {/* RIGHT half: Login Form */}
          <div style={loginPanelStyle}>
            <div style={styles.formInner}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>Đăng nhập</Title>
                <Text type="secondary">Chào mừng bạn trở lại</Text>
              </div>

              {loginError && (
                <Alert message={loginError} type="error" showIcon style={{ marginBottom: 16 }} />
              )}

              <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không đúng định dạng' },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" size="large" />
                </Form.Item>

                <Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                      <Checkbox>Ghi nhớ</Checkbox>
                    </Form.Item>
                    <a>Quên mật khẩu?</a>
                  </div>
                </Form.Item>

                <Form.Item style={{ marginBottom: 12 }}>
                  <Button type="primary" htmlType="submit" block size="large" loading={loginLoading}>
                    ĐĂNG NHẬP
                  </Button>
                </Form.Item>

                <div style={styles.switchLink}>
                  Chưa có tài khoản?{' '}
                  <a onClick={switchToRegister}>Đăng ký ngay</a>
                </div>
              </Form>
            </div>
          </div>
        </div>

        {/* ── Sliding overlay panel (curtain) ────────────── */}
        <div style={overlayStyle}>
          <div style={styles.overlayContent as React.CSSProperties}>
            <div style={styles.icon}>🎓</div>
            <Title level={3} style={styles.overlayTitle}>
              {isRegister ? 'Chào mừng trở lại!' : 'Xin chào!'}
            </Title>
            <div style={styles.overlayText as React.CSSProperties}>
              {isRegister
                ? 'Đăng nhập để tiếp tục hành trình học tập cùng AI'
                : 'Đăng ký tài khoản để bắt đầu hành trình học tập cùng AI'}
            </div>
            <Button
              ghost
              size="large"
              style={styles.overlayBtn}
              onClick={isRegister ? switchToLogin : switchToRegister}
            >
              {isRegister ? 'ĐĂNG NHẬP' : 'ĐĂNG KÝ'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
