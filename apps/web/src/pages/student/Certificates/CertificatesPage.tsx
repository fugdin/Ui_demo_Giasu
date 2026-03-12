import { useState, useEffect } from 'react';
import {
  Card, Row, Col, Button, Modal, Empty, Typography, Spin, Divider,
} from 'antd';
import {
  TrophyOutlined, DownloadOutlined, EyeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { learningApi } from '@/services/api';
import type { Certificate } from '@ai-learning/types';

const { Title, Text } = Typography;

export default function CertificatesPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setLoading(true);
      try {
        const res = await learningApi.getCertificates();
        setCertificates(res.data);
      } catch {
        setCertificates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  const handleDownload = (cert: Certificate) => {
    // Trigger PDF download via API endpoint
    const link = document.createElement('a');
    link.href = `/api/learning/certificates/${cert.id}/pdf`;
    link.download = `chung-nhan-${cert.courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" tip="Đang tải chứng nhận..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>🏆 Chứng nhận của tôi</Title>

      {certificates.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary" style={{ fontSize: 16 }}>
                Hoàn thành khóa học để nhận chứng nhận
              </Text>
            }
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate('/student/courses')}
            >
              Xem khóa học
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {certificates.map((cert) => (
            <Col xs={24} sm={12} lg={8} key={cert.id}>
              <Card
                hoverable
                style={{ textAlign: 'center', height: '100%' }}
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setPreviewCert(cert)}
                    key="view"
                  >
                    Xem chi tiết
                  </Button>,
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(cert)}
                    key="download"
                  >
                    Tải PDF
                  </Button>,
                ]}
              >
                <TrophyOutlined style={{ fontSize: 48, color: '#faad14', marginBottom: 16 }} />
                <div>
                  <Text
                    strong
                    style={{
                      display: 'block',
                      fontSize: 12,
                      letterSpacing: 2,
                      color: '#8c8c8c',
                      marginBottom: 8,
                    }}
                  >
                    CHỨNG NHẬN HOÀN THÀNH
                  </Text>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    {cert.courseTitle}
                  </Title>
                  <Text type="secondary">{cert.studentName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(cert.issuedAt).format('DD/MM/YYYY')}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Preview Modal */}
      <Modal
        open={!!previewCert}
        onCancel={() => setPreviewCert(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewCert(null)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => previewCert && handleDownload(previewCert)}
          >
            Tải PDF
          </Button>,
        ]}
        width={600}
        title="Chi tiết chứng nhận"
      >
        {previewCert && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <TrophyOutlined style={{ fontSize: 64, color: '#faad14', marginBottom: 16 }} />
            <div>
              <Text
                strong
                style={{
                  display: 'block',
                  fontSize: 14,
                  letterSpacing: 3,
                  color: '#8c8c8c',
                  marginBottom: 12,
                }}
              >
                CHỨNG NHẬN HOÀN THÀNH
              </Text>
              <Divider />
              <Title level={4} style={{ marginBottom: 4 }}>
                {previewCert.courseTitle}
              </Title>
              <Text style={{ fontSize: 16, display: 'block', marginBottom: 16 }}>
                Được cấp cho
              </Text>
              <Title level={3} style={{ color: '#2E75B6', marginBottom: 16 }}>
                {previewCert.studentName}
              </Title>
              <Divider />
              <Text type="secondary">
                Ngày cấp: {dayjs(previewCert.issuedAt).format('DD/MM/YYYY')}
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
