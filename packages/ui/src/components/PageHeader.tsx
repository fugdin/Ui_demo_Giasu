import React from 'react';
import { Breadcrumb, Space, Typography } from 'antd';
import type { BreadcrumbProps } from 'antd';

const { Title } = Typography;

// ─── Props ───────────────────────────────────────────────────

export interface BreadcrumbItem {
  /** Display label for the breadcrumb segment. */
  label: string;
  /** Optional path – makes the segment a clickable link. */
  path?: string;
}

export interface PageHeaderProps {
  /** Page title displayed prominently. */
  title: string;
  /** Optional subtitle rendered below the title. */
  subtitle?: string;
  /** Breadcrumb trail. The last item is treated as the current page. */
  breadcrumbs?: BreadcrumbItem[];
  /** Optional action buttons rendered on the right side. */
  actions?: React.ReactNode;
  /** Callback when a breadcrumb link is clicked (receives the path). */
  onBreadcrumbClick?: (path: string) => void;
}

// ─── Component ───────────────────────────────────────────────

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  actions,
  onBreadcrumbClick,
}) => {
  const breadcrumbItems: BreadcrumbProps['items'] = breadcrumbs?.map((item, index) => {
    const isLast = index === breadcrumbs.length - 1;
    return {
      key: item.path ?? index,
      title:
        !isLast && item.path ? (
          <a
            onClick={(e) => {
              e.preventDefault();
              onBreadcrumbClick?.(item.path!);
            }}
            href={item.path}
          >
            {item.label}
          </a>
        ) : (
          item.label
        ),
    };
  });

  return (
    <div style={{ marginBottom: 24 }}>
      {breadcrumbItems && breadcrumbItems.length > 0 && (
        <Breadcrumb items={breadcrumbItems} style={{ marginBottom: 12 }} />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Typography.Text type="secondary" style={{ marginTop: 4 }}>
              {subtitle}
            </Typography.Text>
          )}
        </div>

        {actions && <Space wrap>{actions}</Space>}
      </div>
    </div>
  );
};

export default PageHeader;
