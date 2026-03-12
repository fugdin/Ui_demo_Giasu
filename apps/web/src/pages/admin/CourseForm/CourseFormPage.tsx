import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, InputNumber, Button, Space, Spin, message } from 'antd';
import { PageHeader } from '@ai-learning/ui';
import type { Field, CreateCourseRequest } from '@ai-learning/types';
import { coursesApi, fieldsApi } from '@/services/adminApi';

const LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Cơ bản' },
  { value: 'intermediate', label: 'Trung cấp' },
  { value: 'advanced', label: 'Nâng cao' },
];

export default function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateCourseRequest>();
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(id);

  // Fetch fields for the select dropdown
  useEffect(() => {
    fieldsApi.getAll().then((res) => {
      setFields(res.data);
    });
  }, []);

  // If editing, fetch existing course data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    coursesApi
      .getById(id)
      .then((res) => {
        form.setFieldsValue(res.data);
      })
      .catch(() => {
        message.error('Không thể tải dữ liệu khóa học');
        navigate('/admin/courses');
      })
      .finally(() => setLoading(false));
  }, [id, form, navigate]);

  const handleSubmit = async (values: CreateCourseRequest) => {
    setSubmitting(true);
    try {
      if (isEditing) {
        await coursesApi.update(id!, values);
        message.success('Cập nhật khóa học thành công');
      } else {
        await coursesApi.create(values);
        message.success('Tạo khóa học thành công');
      }
      navigate('/admin/courses');
    } catch {
      message.error(isEditing ? 'Cập nhật khóa học thất bại' : 'Tạo khóa học thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Sửa khóa học' : 'Tạo khóa học'}
        breadcrumbs={[
          { label: 'Khóa học', path: '/admin/courses' },
          { label: isEditing ? 'Sửa khóa học' : 'Tạo khóa học' },
        ]}
        onBreadcrumbClick={(path) => navigate(path)}
      />

      <Form<CreateCourseRequest>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ passThreshold: 70 }}
        style={{ maxWidth: 720 }}
      >
        <Form.Item
          name="title"
          label="Tên khóa học"
          rules={[
            { required: true, message: 'Vui lòng nhập tên khóa học' },
            { max: 200, message: 'Tên khóa học không được vượt quá 200 ký tự' },
          ]}
        >
          <Input placeholder="Nhập tên khóa học" />
        </Form.Item>

        <Form.Item
          name="fieldId"
          label="Ngành"
          rules={[{ required: true, message: 'Vui lòng chọn ngành' }]}
        >
          <Select
            placeholder="Chọn ngành"
            options={fields.map((f) => ({ value: f.id, label: f.name }))}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          name="level"
          label="Cấp độ"
          rules={[{ required: true, message: 'Vui lòng chọn cấp độ' }]}
        >
          <Select placeholder="Chọn cấp độ" options={LEVEL_OPTIONS} />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea
            rows={6}
            placeholder="Nhập mô tả khóa học (hỗ trợ HTML, sẽ tích hợp TinyMCE sau)"
          />
        </Form.Item>

        <Form.Item
          name="passThreshold"
          label="Ngưỡng pass"
          rules={[{ required: true, message: 'Vui lòng nhập ngưỡng pass' }]}
        >
          <InputNumber min={50} max={100} addonAfter="%" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Lưu
            </Button>
            <Button onClick={() => navigate('/admin/courses')}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
