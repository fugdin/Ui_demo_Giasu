import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Result
        status="info"
        title="Giao diện Giáo viên"
        subTitle="Tính năng này đang được phát triển. Vui lòng quay lại sau!"
        extra={[
          <Button key="home" type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>,
        ]}
      />
    </div>
  );
}
