import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  message,
  Modal,
  Space,
  Result,
} from 'antd';
import { CopyOutlined, ArrowRightOutlined } from '@ant-design/icons';
import type { CreateClassRequest } from '@ai-learning/types';
import { teacherApi } from '@/services/api';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function ClassCreatePage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [createdClass, setCreatedClass] = useState<{
    id: string;
    inviteCode: string;
  } | null>(null);

  const handleSubmit = async (values: CreateClassRequest) => {
    try {
      setSubmitting(true);
      const { data } = await teacherApi.createClass(values);
      setCreatedClass({ id: data.id, inviteCode: data.inviteCode });
      setSuccessModal(true);
      form.resetFields();
    } catch {
      message.error('Không thể tạo lớp học. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    if (createdClass?.inviteCode) {
      navigator.clipboard.writeText(createdClass.inviteCode);
      message.success('Đã sao chép mã mời!');
    }
  };

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>
        Tạo lớp học mới
      </Title>

      <Card style={{ maxWidth: 600 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Tên lớp"
            rules={[
              { required: true, message: 'Vui lòng nhập tên lớp' },
              { max: 100, message: 'Tên lớp không quá 100 ký tự' },
            ]}
          >
            <Input placeholder="Ví dụ: Lập trình Python - K15" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea
              rows={4}
              placeholder="Mô tả ngắn về lớp học (không bắt buộc)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo lớp
              </Button>
              <Button onClick={() => navigate('/teacher/classes')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Success Modal */}
      <Modal
        open={successModal}
        footer={null}
        closable={false}
        centered
        width={480}
      >
        <Result
          status="success"
          title="🎉 Tạo lớp thành công!"
          subTitle="Chia sẻ mã mời bên dưới cho học sinh để tham gia lớp."
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div
                style={{
                  background: '#f5f5f5',
                  padding: '16px 24px',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Mã mời lớp
                </Text>
                <Paragraph
                  strong
                  style={{ fontSize: 28, margin: '8px 0 0', letterSpacing: 4 }}
                >
                  {createdClass?.inviteCode}
                </Paragraph>
              </div>

              <Button
                icon={<CopyOutlined />}
                onClick={handleCopyCode}
                block
              >
                Sao chép mã mời
              </Button>

              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={() => {
                  setSuccessModal(false);
                  navigate(`/teacher/classes/${createdClass?.id}`);
                }}
                block
              >
                Đi đến chi tiết lớp
              </Button>
            </Space>
          }
        />
      </Modal>
    </>
  );
}
