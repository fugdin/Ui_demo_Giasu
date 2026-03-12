import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@ai-learning/auth';
import { ErrorBoundary, themeConfig } from '@ai-learning/ui';
import AppRoutes from './routes';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
