import React, { useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, Tag, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BranchesOutlined,
  BookOutlined,
  BankOutlined,
  SettingOutlined,
  FormOutlined,
  TrophyOutlined,
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
  { key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'fields', icon: <BranchesOutlined />, label: 'Quản lý ngành' },
  { key: 'courses', icon: <BookOutlined />, label: 'Quản lý khóa học' },
  { key: 'question-bank', icon: <BankOutlined />, label: 'Ngân hàng câu hỏi' },
  { key: 'assessment-config', icon: <FormOutlined />, label: 'Cấu hình đánh giá' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt hệ thống' },
];

const keyToPath: Record<string, string> = {
  dashboard: '/admin/',
  users: '/admin/users',
  fields: '/admin/fields',
  courses: '/admin/courses',
  'question-bank': '/admin/questions',
  'assessment-config': '/admin/assessment-config',
  settings: '/admin/settings',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const selectedKey = useMemo(() => {
    const pathname = location.pathname;
    if (pathname.startsWith('/admin/users')) return 'users';
    if (pathname.startsWith('/admin/fields')) return 'fields';
    if (pathname.startsWith('/admin/courses')) return 'courses';
    if (pathname.startsWith('/admin/questions')) return 'question-bank';
    if (pathname.startsWith('/admin/assessment-config')) return 'assessment-config';
    if (pathname.startsWith('/admin/settings')) return 'settings';
    return 'dashboard';
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
          key: 'go-student',
          label: '🎓 Giao diện Học viên',
          onClick: () => navigate('/student/'),
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
          onClick={() => navigate('/admin/')}
        >
          <TrophyOutlined
            style={{ color: '#d48806', fontSize: collapsed ? 24 : 22, flexShrink: 0 }}
          />
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
            onClick={({ key }) => navigate(keyToPath[key] ?? '/admin/')}
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
            <Tag color="orange">Quản trị viên</Tag>
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d48806' }} />
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
