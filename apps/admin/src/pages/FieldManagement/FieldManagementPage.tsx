import { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Form, Input, Switch, Space, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { PageHeader, DataTable, confirmModal } from '@ai-learning/ui';
import type { Field, CreateFieldRequest, UpdateFieldRequest } from '@ai-learning/types';
import type { ColumnsType } from 'antd/es/table';
import { fieldsApi } from '@/services/api';

export default function FieldManagementPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [form] = Form.useForm();

  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fieldsApi.getAll();
      setFields(data);
    } catch {
      message.error('Không thể tải danh sách ngành');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const openCreateModal = () => {
    setEditingField(null);
    form.resetFields();
    form.setFieldsValue({ name: '', hasAssessment: false });
    setModalOpen(true);
  };

  const openEditModal = (field: Field) => {
    setEditingField(field);
    form.setFieldsValue({ name: field.name, hasAssessment: field.hasAssessment });
    setModalOpen(true);
  };

  const handleModalSubmit = async (values: { name: string; hasAssessment: boolean }) => {
    setModalLoading(true);
    try {
      if (editingField) {
        const updateData: UpdateFieldRequest = {
          name: values.name,
          hasAssessment: values.hasAssessment,
        };
        await fieldsApi.update(editingField.id, updateData);
        message.success('Cập nhật ngành thành công');
      } else {
        const createData: CreateFieldRequest = {
          name: values.name,
          hasAssessment: values.hasAssessment,
        };
        await fieldsApi.create(createData);
        message.success('Thêm ngành thành công');
      }
      setModalOpen(false);
      form.resetFields();
      setEditingField(null);
      fetchFields();
    } catch {
      message.error(editingField ? 'Cập nhật ngành thất bại' : 'Thêm ngành thất bại');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = (field: Field) => {
    confirmModal({
      title: 'Xóa ngành',
      content: `Bạn có chắc chắn muốn xóa ngành "${field.name}"? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await fieldsApi.delete(field.id);
          message.success('Xóa ngành thành công');
          fetchFields();
        } catch {
          message.error('Xóa ngành thất bại');
        }
      },
    });
  };

  const handleToggleAssessment = async (field: Field, checked: boolean) => {
    try {
      await fieldsApi.toggleAssessment(field.id, checked);
      message.success('Cập nhật đánh giá năng lực thành công');
      setFields((prev) =>
        prev.map((f) => (f.id === field.id ? { ...f, hasAssessment: checked } : f)),
      );
    } catch {
      message.error('Cập nhật đánh giá năng lực thất bại');
      // Revert optimistic update by re-fetching
      fetchFields();
    }
  };

  const columns: ColumnsType<Field> = [
    {
      title: 'Tên ngành',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Đánh giá năng lực',
      dataIndex: 'hasAssessment',
      key: 'hasAssessment',
      width: 180,
      render: (hasAssessment: boolean, record: Field) => (
        <Switch
          checked={hasAssessment}
          onChange={(checked) => handleToggleAssessment(record, checked)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: 'Số khóa học',
      dataIndex: 'courseCount',
      key: 'courseCount',
      width: 120,
      align: 'center',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Field) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            title="Chỉnh sửa"
          />
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            title="Xóa"
          />
        </Space>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Quản lý ngành"
        actions={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
            + Thêm ngành
          </Button>
        }
      />

      <DataTable<Field>
        rowKey="id"
        columns={columns}
        dataSource={fields}
        loading={loading}
      />

      {/* Create / Edit modal */}
      <Modal
        title={editingField ? 'Chỉnh sửa ngành' : 'Thêm ngành mới'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingField(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={modalLoading}
        okText={editingField ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleModalSubmit}>
          <Form.Item
            name="name"
            label="Tên ngành"
            rules={[{ required: true, message: 'Vui lòng nhập tên ngành' }]}
          >
            <Input placeholder="Nhập tên ngành" />
          </Form.Item>
          <Form.Item
            name="hasAssessment"
            label="Đánh giá năng lực"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
