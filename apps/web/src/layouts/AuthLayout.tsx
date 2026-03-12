import { Outlet } from 'react-router-dom';

const GRADIENT = 'linear-gradient(135deg, #2E75B6 0%, #1a5276 100%)';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: GRADIENT,
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 460,
          background: '#fff',
          borderRadius: 12,
          padding: '40px 32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎓</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1a5276' }}>
            AI Learning Platform
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
