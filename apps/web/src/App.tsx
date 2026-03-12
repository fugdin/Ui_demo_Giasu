import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@ai-learning/auth';
import { ErrorBoundary, themeConfig } from '@ai-learning/ui';
import AppRoutes from './routes';

export default function App() {
  // GitHub Pages serves at /Ui_demo_Giasu/, Vite sets import.meta.env.BASE_URL
  const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/';

  return (
    <ErrorBoundary>
      <ConfigProvider theme={themeConfig} locale={viVN}>
        <BrowserRouter basename={basename}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
