import { useState, useEffect, useCallback } from 'react';
import { Button, Input, Select, Tag, Space, Dropdown, Modal, Form, message } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  LockOutlined,
  UnlockOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { PageHeader, DataTable, StatusBadge } from '@ai-learning/ui';
import type { User, UserRole, TableParams } from '@ai-learning/types';
import type { ColumnsType } from 'antd/es/table';
import { usersApi } from '@/services/api';

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'red',
  teacher: 'blue',
  student: 'green',
};

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Giáo viên',
  student: 'Học sinh',
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Create modal
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: TableParams = {
        page,
        pageSize,
        search: search || undefined,
        filters: {
          ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
          ...(statusFilter !== 'all' ? { isActive: statusFilter } : {}),
        },
      };
      const { data } = await usersApi.getAll(params);
      setUsers(data.data);
      setTotal(data.total);
    } catch {
      message.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await usersApi.updateRole(userId, newRole);
      message.success('Cập nhật vai trò thành công');
      fetchUsers();
    } catch {
      message.error('Cập nhật vai trò thất bại');
    }
  };

  const handleToggleActive = async (userId: string) => {
    try {
      await usersApi.toggleActive(userId);
      message.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch {
      message.error('Cập nhật trạng thái thất bại');
    }
  };

  const handleCreate = async (values: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setCreateLoading(true);
    try {
      await usersApi.create(values);
      message.success('Tạo người dùng thành công');
      setCreateOpen(false);
      form.resetFields();
      setPage(1);
      fetchUsers();
    } catch {
      message.error('Tạo người dùng thất bại');
    } finally {
      setCreateLoading(false);
    }
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => (
        <Tag color={ROLE_COLORS[role]}>{ROLE_LABELS[role]}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive: boolean) => (
        <StatusBadge status={isActive ? 'active' : 'locked'} />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: User) => {
        const roleMenuItems = (['student', 'teacher', 'admin'] as UserRole[])
          .filter((r) => r !== record.role)
          .map((r) => ({
            key: r,
            label: ROLE_LABELS[r],
            onClick: () => handleRoleChange(record.id, r),
          }));

        return (
          <Space>
            <Dropdown menu={{ items: roleMenuItems }} trigger={['click']}>
              <Button size="small">
                Đổi role <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              size="small"
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleActive(record.id)}
              title={record.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý người dùng"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            + Tạo
          </Button>
        }
      />

      {/* Filter bar */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm theo tên, email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          allowClear
          style={{ width: 280 }}
        />
        <Select
          value={roleFilter}
          onChange={(value) => {
            setRoleFilter(value);
            setPage(1);
          }}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: 'Tất cả Role' },
            { value: 'student', label: 'Học sinh' },
            { value: 'teacher', label: 'Giáo viên' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
          style={{ width: 160 }}
          options={[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Hoạt động' },
            { value: 'false', label: 'Bị khóa' },
          ]}
        />
      </Space>

      <DataTable<User>
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      {/* Create user modal */}
      <Modal
        title="Tạo người dùng mới"
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createLoading}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không đúng định dạng' },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn vai trò"
              options={[
                { value: 'student', label: 'Học sinh' },
                { value: 'teacher', label: 'Giáo viên' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
