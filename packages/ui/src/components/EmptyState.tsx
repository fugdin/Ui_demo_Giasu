import React from 'react';
import { Empty, Button } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

// ─── Props ───────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Icon rendered above the message. Defaults to Ant Design's InboxOutlined. */
  icon?: React.ReactNode;
  /** The message displayed to the user. Defaults to "Không có dữ liệu". */
  message?: string;
  /** Optional description rendered below the message. */
  description?: string;
  /** Optional call-to-action button label. */
  ctaLabel?: string;
  /** Callback when the CTA button is clicked. */
  onCtaClick?: () => void;
}

// ─── Component ───────────────────────────────────────────────

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  message = 'Không có dữ liệu',
  description,
  ctaLabel,
  onCtaClick,
}) => {
  return (
    <Empty
      image={icon ?? <InboxOutlined style={{ fontSize: 48, color: '#BFBFBF' }} />}
      imageStyle={{ height: 60 }}
      description={
        <div>
          <div style={{ fontSize: 14, color: '#595959' }}>{message}</div>
          {description && (
            <div style={{ fontSize: 12, color: '#8C8C8C', marginTop: 4 }}>
              {description}
            </div>
          )}
        </div>
      }
    >
      {ctaLabel && (
        <Button type="primary" onClick={onCtaClick}>
          {ctaLabel}
        </Button>
      )}
    </Empty>
  );
};

export default EmptyState;
