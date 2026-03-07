import React, { useState } from 'react';
import { Layout, Menu, Dropdown, Avatar, Space, Typography, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BranchesOutlined,
  BookOutlined,
  BankOutlined,
  SettingOutlined,
  FormOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  UsergroupAddOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { UserRole } from '@ai-learning/types';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// ─── Sidebar menu definitions per role ───────────────────────

type MenuItem = Required<MenuProps>['items'][number];

const adminMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'users', icon: <UserOutlined />, label: 'Quản lý người dùng' },
  { key: 'fields', icon: <BranchesOutlined />, label: 'Quản lý ngành' },
  { key: 'courses', icon: <BookOutlined />, label: 'Quản lý khóa học' },
  { key: 'question-bank', icon: <BankOutlined />, label: 'Ngân hàng câu hỏi' },
  { key: 'assessment-config', icon: <FormOutlined />, label: 'Cấu hình đánh giá' },
  { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt hệ thống' },
];

const teacherMenuItems: MenuItem[] = [
  { key: 'overview', icon: <DashboardOutlined />, label: 'Tổng quan' },
  { key: 'classes', icon: <TeamOutlined />, label: 'Lớp học' },
  { key: 'courses', icon: <BookOutlined />, label: 'Khóa học' },
];

const studentMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'courses', icon: <BookOutlined />, label: 'Khóa học' },
  { key: 'assessments', icon: <FormOutlined />, label: 'Đánh giá' },
  { key: 'progress', icon: <BarChartOutlined />, label: 'Tiến độ' },
  { key: 'certificates', icon: <SafetyCertificateOutlined />, label: 'Chứng nhận' },
  { key: 'join-class', icon: <UsergroupAddOutlined />, label: 'Tham gia lớp' },
];

const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  admin: adminMenuItems,
  teacher: teacherMenuItems,
  student: studentMenuItems,
};

// ─── Props ───────────────────────────────────────────────────

export interface AppLayoutProps {
  /** Current user role – determines which sidebar navigation is rendered. */
  role: UserRole;
  /** Display name shown next to the avatar in the header. */
  userName?: string;
  /** URL for the user's avatar image. Falls back to a default icon. */
  avatarUrl?: string;
  /** Currently selected menu key (controlled). */
  selectedKey?: string;
  /** Callback when a sidebar menu item is clicked. */
  onMenuSelect?: (key: string) => void;
  /** Callback when the user clicks "Trang cá nhân" (profile). */
  onProfile?: () => void;
  /** Callback when the user clicks "Đăng xuất" (logout). */
  onLogout?: () => void;
  /** Page content. */
  children: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────

const AppLayout: React.FC<AppLayoutProps> = ({
  role,
  userName,
  avatarUrl,
  selectedKey,
  onMenuSelect,
  onProfile,
  onLogout,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
      onClick: () => onProfile?.(),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => onLogout?.(),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Sidebar ────────────────────────────────────────── */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        width={240}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
          }}
        >
          <TrophyOutlined
            style={{ color: '#fff', fontSize: collapsed ? 24 : 20, flexShrink: 0 }}
          />
          {!collapsed && (
            <Text
              strong
              style={{
                color: '#fff',
                fontSize: 15,
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

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKey ? [selectedKey] : undefined}
          items={menuItemsByRole[role]}
          onClick={({ key }) => onMenuSelect?.(key)}
        />
      </Sider>

      {/* ── Main area ──────────────────────────────────────── */}
      <Layout style={{ marginLeft: collapsed ? 80 : 240, transition: 'margin-left 0.2s' }}>
        {/* ── Header ─────────────────────────────────────── */}
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
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              style: { fontSize: 18, cursor: 'pointer' },
              onClick: () => setCollapsed(!collapsed),
            })}
            <Text strong style={{ fontSize: 16, marginLeft: 8 }}>
              AI Learning Platform
            </Text>
          </Space>

          <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar src={avatarUrl} icon={!avatarUrl ? <UserOutlined /> : undefined} />
              {userName && <Text>{userName}</Text>}
            </Space>
          </Dropdown>
        </Header>

        {/* ── Content ────────────────────────────────────── */}
        <Content
          style={{
            margin: 24,
            minHeight: 280,
            minWidth: 0,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
