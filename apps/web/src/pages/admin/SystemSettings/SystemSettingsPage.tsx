import { useState, useEffect } from 'react';
import {
  Form,
  InputNumber,
  Switch,
  Button,
  Card,
  Divider,
  Spin,
  TimePicker,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { PageHeader } from '@ai-learning/ui';
import type { SystemSettings } from '@ai-learning/types';
import { settingsApi } from '@/services/adminApi';
import dayjs from 'dayjs';

// ─── Component ───────────────────────────────────────────────

export default function SystemSettingsPage() {
  const [form] = Form.useForm<SystemSettings>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ─── Fetch existing settings ────────────────────────────────

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await settingsApi.get();
        form.setFieldsValue(data);
      } catch {
        // Use defaults if no settings exist yet
        form.setFieldsValue({
          defaultPassThreshold: 70,
          maxRetakePerDay: 3,
          retakeResetHour: 12,
          retakeResetMinute: 0,
          maxAiMessagesPerDay: 50,
          aiRevealAnswerAfterSubmit: false,
          assessmentDurationMinutes: 20,
          assessmentQuestionCount: 15,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  // ─── Save ───────────────────────────────────────────────────

  const handleSubmit = async (values: SystemSettings) => {
    setSaving(true);
    try {
      await settingsApi.save(values);
      message.success('Đã lưu cài đặt hệ thống');
    } catch {
      message.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        <PageHeader title="Cài đặt hệ thống" />
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Spin size="large" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Cài đặt hệ thống" />

      <Form<SystemSettings>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          defaultPassThreshold: 70,
          maxRetakePerDay: 3,
          retakeResetHour: 12,
          retakeResetMinute: 0,
          maxAiMessagesPerDay: 50,
          aiRevealAnswerAfterSubmit: false,
          assessmentDurationMinutes: 20,
          assessmentQuestionCount: 15,
        }}
      >
        {/* ─── Cài đặt bài học ──────────────────────────────────── */}
        <Card title="Cài đặt bài học" style={{ marginBottom: 24 }}>
          <Form.Item
            name="defaultPassThreshold"
            label="Ngưỡng pass mặc định (%)"
            rules={[{ required: true, message: 'Nhập ngưỡng pass' }]}
          >
            <InputNumber min={50} max={100} addonAfter="%" style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="maxRetakePerDay"
            label="Số lần retake tối đa / ngày"
            rules={[{ required: true, message: 'Nhập số lần retake' }]}
          >
            <InputNumber min={1} max={10} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item label="Giờ reset lượt retake" required>
            <Form.Item noStyle dependencies={['retakeResetHour', 'retakeResetMinute']}>
              {() => {
                const hour = form.getFieldValue('retakeResetHour') ?? 12;
                const minute = form.getFieldValue('retakeResetMinute') ?? 0;
                return (
                  <TimePicker
                    format="HH:mm"
                    value={dayjs().hour(hour).minute(minute)}
                    onChange={(time) => {
                      if (time) {
                        form.setFieldsValue({
                          retakeResetHour: time.hour(),
                          retakeResetMinute: time.minute(),
                        });
                      }
                    }}
                    style={{ width: 200 }}
                  />
                );
              }}
            </Form.Item>
            {/* Hidden fields to hold the actual values */}
            <Form.Item name="retakeResetHour" hidden>
              <InputNumber />
            </Form.Item>
            <Form.Item name="retakeResetMinute" hidden>
              <InputNumber />
            </Form.Item>
          </Form.Item>
        </Card>

        {/* ─── Cài đặt AI Chat ──────────────────────────────────── */}
        <Card title="Cài đặt AI Chat" style={{ marginBottom: 24 }}>
          <Form.Item
            name="maxAiMessagesPerDay"
            label="Số tin nhắn tối đa / ngày / user"
            rules={[{ required: true, message: 'Nhập số tin nhắn tối đa' }]}
          >
            <InputNumber min={1} style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="aiRevealAnswerAfterSubmit"
            label="AI tiết lộ đáp án sau nộp bài"
            valuePropName="checked"
          >
            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
          </Form.Item>
        </Card>

        {/* ─── Cài đặt Assessment ───────────────────────────────── */}
        <Card title="Cài đặt Assessment" style={{ marginBottom: 24 }}>
          <Form.Item
            name="assessmentDurationMinutes"
            label="Thời gian làm bài (phút)"
            rules={[{ required: true, message: 'Nhập thời gian làm bài' }]}
          >
            <InputNumber min={1} addonAfter="phút" style={{ width: 200 }} />
          </Form.Item>

          <Form.Item
            name="assessmentQuestionCount"
            label="Số câu hỏi mỗi bài"
            rules={[{ required: true, message: 'Nhập số câu hỏi' }]}
          >
            <InputNumber min={1} style={{ width: 200 }} />
          </Form.Item>
        </Card>

        {/* ─── Save button ──────────────────────────────────────── */}
        <div style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            size="large"
            loading={saving}
          >
            Lưu cài đặt
          </Button>
        </div>
      </Form>
    </>
  );
}
