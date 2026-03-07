import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@ai-learning/auth';
import { ErrorBoundary, themeConfig } from '@ai-learning/ui';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <BrowserRouter>
          <AuthProvider>
            <div style={{ padding: 24 }}>
              <h1>Teacher App - Coming soon</h1>
            </div>
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
