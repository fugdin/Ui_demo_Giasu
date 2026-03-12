import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Select, InputNumber, Button, Space, Spin, message } from 'antd';
import { PageHeader } from '@ai-learning/ui';
import type { CreateLessonRequest } from '@ai-learning/types';
import { lessonsApi } from '@/services/adminApi';

const INTERACTION_TYPE_OPTIONS = [
  { value: 'video_youtube', label: 'Video YouTube' },
  { value: 'simulation_html_css', label: 'Mô phỏng HTML/CSS' },
];

export default function LessonFormPage() {
  const { courseId, id } = useParams<{ courseId: string; id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateLessonRequest>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = Boolean(id);

  // If editing, fetch existing lesson data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    lessonsApi
      .getById(id)
      .then((res) => {
        form.setFieldsValue(res.data);
      })
      .catch(() => {
        message.error('Không thể tải dữ liệu bài học');
        navigateBack();
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, form]);

  // When creating, auto-set order to max+1
  useEffect(() => {
    if (isEditing || !courseId) return;
    lessonsApi.getByCourse(courseId).then((res) => {
      const maxOrder = res.data.reduce(
        (max: number, l: { order: number }) => Math.max(max, l.order),
        0,
      );
      form.setFieldsValue({ order: maxOrder + 1 });
    });
  }, [courseId, isEditing, form]);

  const navigateBack = () => {
    if (courseId) {
      navigate(`/admin/courses/${courseId}/lessons`);
    } else {
      navigate('/admin/courses');
    }
  };

  const handleSubmit = async (values: CreateLessonRequest) => {
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await lessonsApi.update(id, values);
        message.success('Cập nhật bài học thành công');
      } else if (courseId) {
        await lessonsApi.create(courseId, values);
        message.success('Tạo bài học thành công');
      }
      navigateBack();
    } catch {
      message.error(isEditing ? 'Cập nhật bài học thất bại' : 'Tạo bài học thất bại');
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
        title={isEditing ? 'Sửa bài học' : 'Thêm bài học'}
        breadcrumbs={[
          { label: 'Khóa học', path: '/admin/courses' },
          ...(courseId
            ? [{ label: 'Bài học', path: `/admin/courses/${courseId}/lessons` }]
            : []),
          { label: isEditing ? 'Sửa bài học' : 'Thêm bài học' },
        ]}
        onBreadcrumbClick={(path) => navigate(path)}
      />

      <Form<CreateLessonRequest>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 720 }}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài học' }]}
        >
          <Input placeholder="Nhập tiêu đề bài học" />
        </Form.Item>

        <Form.Item
          name="order"
          label="Thứ tự"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
        >
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="interactionType"
          label="Loại tương tác"
          rules={[{ required: true, message: 'Vui lòng chọn loại tương tác' }]}
        >
          <Select placeholder="Chọn loại tương tác" options={INTERACTION_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item name="shortDescription" label="Mô tả ngắn">
          <Input.TextArea rows={4} placeholder="Nhập mô tả ngắn cho bài học" />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={submitting}>
              Lưu
            </Button>
            <Button onClick={navigateBack}>Hủy</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
