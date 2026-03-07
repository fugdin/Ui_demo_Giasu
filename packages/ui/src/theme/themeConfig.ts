import type { ThemeConfig } from 'antd';

const themeConfig: ThemeConfig = {
  token: {
    // ─── Brand Colors ────────────────────────────────────────
    colorPrimary: '#2E75B6',
    colorError: '#FF4D4F',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorInfo: '#2E75B6',

    // ─── Typography ──────────────────────────────────────────
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // ─── Border / Radius ─────────────────────────────────────
    borderRadius: 6,

    // ─── Layout ──────────────────────────────────────────────
    colorBgLayout: '#F5F5F5',
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#FFFFFF',
      bodyBg: '#F5F5F5',
      headerHeight: 64,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#2E75B6',
    },
    Table: {
      headerBg: '#FAFAFA',
      borderColor: '#F0F0F0',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(46, 117, 182, 0.1)',
    },
  },
};

export default themeConfig;
