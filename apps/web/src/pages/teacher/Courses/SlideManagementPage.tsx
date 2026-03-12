import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Upload,
  Button,
  Typography,
  Spin,
  message,
  Space,
  Descriptions,
  Popconfirm,
  Alert,
} from 'antd';
import {
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { LessonSlide } from '@ai-learning/types';
import { teacherApi } from '@/services/api';

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function SlideManagementPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [slide, setSlide] = useState<LessonSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lessonTitle, setLessonTitle] = useState('');

  const fetchSlide = useCallback(async () => {
    if (!lessonId) return;
    try {
      setLoading(true);
      const { data } = await teacherApi.getSlide(lessonId);
      setSlide(data.slide ?? data ?? null);
      setLessonTitle(data.lessonTitle ?? data.slide?.fileName ?? '');
    } catch {
      // No slide yet — that's okay
      setSlide(null);
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchSlide();
  }, [fetchSlide]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    if (!lessonId) return;
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append('file', file as File);

    try {
      setUploading(true);
      await teacherApi.uploadSlide(lessonId, formData);
      message.success('Upload slide thành công!');
      onSuccess?.('ok');
      fetchSlide();
    } catch (err) {
      message.error('Upload thất bại. Vui lòng thử lại.');
      onError?.(err as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!lessonId) return;
    try {
      await teacherApi.deleteSlide(lessonId);
      message.success('Đã xóa slide');
      setSlide(null);
    } catch {
      message.error('Không thể xóa slide');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const beforeUpload = (file: UploadFile) => {
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      message.error('Chỉ chấp nhận file PDF!');
      return false;
    }
    const isLt20M = (file.size ?? 0) / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error('File phải nhỏ hơn 20MB!');
      return false;
    }
    return true;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 120 }}>
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <Space style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/teacher/courses')}
        >
          Quay lại
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Slide bài giảng: {lessonTitle || 'Bài học'}
        </Title>
      </Space>

      {/* Current slide info */}
      {slide && (
        <Card
          title={
            <Space>
              <FileOutlined />
              <span>Slide hiện tại</span>
            </Space>
          }
          style={{ marginBottom: 24 }}
          extra={
            <Space>
              <Button
                icon={<EyeOutlined />}
                onClick={() => {
                  // Open slide in new tab - assuming URL is available from the API
                  const slideUrl = `/api/teacher/lessons/${lessonId}/slide/view`;
                  window.open(slideUrl, '_blank');
                }}
              >
                Xem
              </Button>
              <Popconfirm
                title="Xóa slide"
                description="Bạn có chắc chắn muốn xóa slide này?"
                onConfirm={handleDelete}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  Xóa
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <Descriptions column={{ xs: 1, sm: 3 }}>
            <Descriptions.Item label="Tên file">
              <Text strong>{slide.fileName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kích thước">
              {formatFileSize(slide.fileSize)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày upload">
              {new Date(slide.uploadedAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Upload area */}
      <Card title="Upload slide mới">
        {slide && (
          <Alert
            message="⚠️ Upload mới sẽ thay thế slide cũ"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Dragger
          accept=".pdf"
          maxCount={1}
          showUploadList={false}
          customRequest={handleUpload}
          beforeUpload={beforeUpload}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading ? 'Đang upload...' : 'Nhấp hoặc kéo thả file PDF vào đây'}
          </p>
          <p className="ant-upload-hint">
            Chỉ chấp nhận file PDF, dung lượng tối đa 20MB
          </p>
        </Dragger>
      </Card>
    </>
  );
}
