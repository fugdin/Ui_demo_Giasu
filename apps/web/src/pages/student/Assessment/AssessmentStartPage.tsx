import { Card, Form, Select, Radio, Button, Typography, Space, message } from 'antd';
import { ExperimentOutlined, ClockCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldsApi, assessmentApi } from '../../../services/api';

const { Title, Text } = Typography;

export default function AssessmentStartPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fieldsLoading, setFieldsLoading] = useState(true);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fieldsApi.getFields({ hasAssessment: true }).then((res) => {
      setFields(res.data);
      setFieldsLoading(false);
    });
  }, []);

  const handleFieldChange = async (fieldId: string) => {
    form.setFieldValue('subjectId', undefined);
    setSubjects([]);
    setSubjectsLoading(true);
    try {
      const res = await fieldsApi.getSubjects(fieldId);
      setSubjects(res.data);
    } catch {
      message.error('Không thể tải danh sách môn học');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const res = await assessmentApi.start(values);
      sessionStorage.setItem('assessmentSession', JSON.stringify(res.data));
      navigate('/student/assessment/take');
    } catch {
      message.error('Không thể bắt đầu bài đánh giá');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <ExperimentOutlined style={{ fontSize: 48, color: '#2E75B6', marginBottom: 16 }} />
          <Title level={3}>ĐÁNH GIÁ NĂNG LỰC</Title>
          <Text type="secondary">Chọn ngành và môn học để bắt đầu bài đánh giá</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
          <Form.Item
            name="fieldId"
            label="Ngành học"
            rules={[{ required: true, message: 'Vui lòng chọn ngành học' }]}
          >
            <Select
              placeholder="Chọn ngành"
              loading={fieldsLoading}
              onChange={handleFieldChange}
              options={fields.map((f: any) => ({ label: f.name, value: f.id }))}
            />
          </Form.Item>

          <Form.Item
            name="subjectId"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng chọn môn học' }]}
          >
            <Select
              placeholder="Chọn môn"
              loading={subjectsLoading}
              disabled={subjects.length === 0}
              options={subjects.map((s: any) => ({ label: s.name, value: s.id }))}
            />
          </Form.Item>

          <Form.Item
            name="level"
            label="Trình độ hiện tại"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="beginner">Chưa biết gì</Radio>
                <Radio value="basic">Biết sơ sơ</Radio>
                <Radio value="proficient">Thành thạo</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <div
            style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              margin: '24px 0',
              color: '#666',
            }}
          >
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">~20 phút</Text>
            </Space>
            <Space>
              <FileTextOutlined />
              <Text type="secondary">15-20 câu</Text>
            </Space>
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              BẮT ĐẦU
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
