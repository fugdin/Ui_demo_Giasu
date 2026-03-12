import React, { useState, useMemo } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Tag, theme, ConfigProvider } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  ReadOutlined,
  UserOutlined,
  LogoutOutlined,
  SwapOutlined,
  LineChartOutlined,
  TrophyOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@ai-learning/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const sidebarItems: MenuItem[] = [
  { key: 'home', icon: <HomeOutlined />, label: 'Trang chủ' },
  { key: 'courses', icon: <BookOutlined />, label: 'Khóa học' },
  { key: 'my-courses', icon: <ReadOutlined />, label: 'Khóa học của tôi' },
  { key: 'progress', icon: <LineChartOutlined />, label: 'Tiến độ' },
  { key: 'certificates', icon: <TrophyOutlined />, label: 'Chứng nhận' },
  { key: 'join-class', icon: <TeamOutlined />, label: 'Lớp học' },
];

const keyToPath: Record<string, string> = {
  home: '/student/',
  courses: '/student/courses',
  'my-courses': '/student/my-courses',
  progress: '/student/progress',
  certificates: '/student/certificates',
  'join-class': '/student/join-class',
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const selectedKey = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith('/student/courses')) return 'courses';
    if (path.startsWith('/student/my-courses')) return 'my-courses';
    if (path.startsWith('/student/assessment')) return 'assessment';
    if (path.startsWith('/student/progress')) return 'progress';
    if (path.startsWith('/student/certificates')) return 'certificates';
    if (path.startsWith('/student/join-class')) return 'join-class';
    return 'home';
  }, [location.pathname]);

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
    },
    { type: 'divider' },
    {
      key: 'switch-app',
      icon: <SwapOutlined />,
      label: 'Chuyển giao diện',
      children: [
        {
          key: 'go-admin',
          label: '🔧 Giao diện Admin',
          onClick: () => navigate('/admin/'),
        },
        {
          key: 'go-teacher',
          label: '👨‍🏫 Giao diện Giáo viên',
          onClick: () => navigate('/teacher/'),
        },
      ],
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => logout(),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={240}
        theme="light"
        trigger={null}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: '0 16px',
            cursor: 'pointer',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
          onClick={() => navigate('/student/')}
        >
          <span style={{ fontSize: collapsed ? 24 : 22, flexShrink: 0 }}>🎓</span>
          {!collapsed && (
            <Text
              strong
              style={{
                color: '#1a5276',
                fontSize: 16,
                marginLeft: 10,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              AI Learning
            </Text>
          )}
        </div>

        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemSelectedBg: '#141414',
                itemSelectedColor: '#ffffff',
                itemHoverBg: '#f0f0f0',
                itemBorderRadius: 8,
                itemMarginInline: 8,
                itemMarginBlock: 4,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={sidebarItems}
            onClick={({ key }) => navigate(keyToPath[key] ?? '/student/')}
            style={{ border: 'none', marginTop: 8 }}
          />
        </ConfigProvider>

        {/* Collapse toggle at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            padding: '12px 0',
            display: 'flex',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
            style: { fontSize: 16, color: token.colorTextSecondary },
          })}
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Space>
            <Tag color="blue">Học viên</Tag>
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2E75B6' }} />
              <Text>{user?.name || 'Học viên'}</Text>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ margin: 24, minHeight: 280, minWidth: 0 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
