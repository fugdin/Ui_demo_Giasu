import React from 'react';
import { Result, Button } from 'antd';

// ─── Props ───────────────────────────────────────────────────

export interface ErrorBoundaryProps {
  /** Content to protect. */
  children: React.ReactNode;
  /** Custom fallback UI. If not provided, a default Vietnamese error page is shown. */
  fallback?: React.ReactNode;
  /** Callback when the error boundary catches an error. */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ─── Component ───────────────────────────────────────────────

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            padding: 24,
          }}
        >
          <Result
            status="error"
            title="Đã xảy ra lỗi"
            subTitle="Rất tiếc, đã có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại hoặc liên hệ quản trị viên nếu lỗi tiếp tục."
            extra={[
              <Button key="retry" type="primary" onClick={this.handleReset}>
                Thử lại
              </Button>,
              <Button key="home" onClick={() => (window.location.href = '/')}>
                Về trang chủ
              </Button>,
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
