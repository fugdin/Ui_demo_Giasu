import React from 'react';
import { Badge, Tag } from 'antd';

// ─── Status definitions ──────────────────────────────────────

export type StatusType = 'active' | 'locked' | 'completed' | 'pending';

interface StatusConfig {
  color: string;
  label: string;
}

const STATUS_MAP: Record<StatusType, StatusConfig> = {
  active: { color: 'green', label: 'Hoạt động' },
  locked: { color: 'red', label: 'Bị khóa' },
  completed: { color: 'blue', label: 'Hoàn thành' },
  pending: { color: 'orange', label: 'Đang chờ' },
};

// ─── Props ───────────────────────────────────────────────────

export interface StatusBadgeProps {
  /** The status to display. */
  status: StatusType;
  /**
   * Override the default Vietnamese label. If not provided, a built-in
   * Vietnamese translation is used.
   */
  label?: string;
  /**
   * Render as a Tag (pill shape) instead of a dot badge.
   * Defaults to `'tag'`.
   */
  variant?: 'badge' | 'tag';
}

// ─── Component ───────────────────────────────────────────────

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  variant = 'tag',
}) => {
  const config = STATUS_MAP[status];
  const displayLabel = label ?? config.label;

  if (variant === 'badge') {
    return <Badge color={config.color} text={displayLabel} />;
  }

  return <Tag color={config.color}>{displayLabel}</Tag>;
};

export default StatusBadge;
