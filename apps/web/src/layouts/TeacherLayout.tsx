import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Tag, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@ai-learning/auth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

type MenuItem = Required<MenuProps>['items'][number];

const sidebarItems: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'classes', icon: <TeamOutlined />, label: 'Lớp học' },
  { key: 'courses', icon: <BookOutlined />, label: 'Khóa học' },
];

const keyToPath: Record<string, string> = {
  dashboard: '/teacher/',
  classes: '/teacher/classes',
  courses: '/teacher/courses',
};

export default function TeacherLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/teacher/classes')) return 'classes';
    if (pathname.startsWith('/teacher/courses')) return 'courses';
    return 'dashboard';
  }, [location.pathname]);

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'switch-app',
      icon: <SwapOutlined />,
      label: 'Chuyển giao diện',
      children: [
        {
          key: 'go-admin',
          label: '🛠 Giao diện Quản trị',
          onClick: () => navigate('/admin/'),
        },
        {
          key: 'go-student',
          label: '🎓 Giao diện Học viên',
          onClick: () => navigate('/student/'),
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
        width={250}
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
          onClick={() => navigate('/teacher/')}
        >
          <span style={{ fontSize: collapsed ? 24 : 22, flexShrink: 0 }}>👨‍🏫</span>
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
            onClick={({ key }) => navigate(keyToPath[key] ?? '/teacher/')}
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

      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
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
            <Tag color="green">Giảng viên</Tag>
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#389e0d' }} />
              {user?.name && <Text>{user.name}</Text>}
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
