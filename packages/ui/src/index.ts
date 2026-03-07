// ─── Components ──────────────────────────────────────────────
export { default as AppLayout } from './components/AppLayout';
export type { AppLayoutProps } from './components/AppLayout';

export { default as PageHeader } from './components/PageHeader';
export type { PageHeaderProps, BreadcrumbItem } from './components/PageHeader';

export { default as DataTable } from './components/DataTable';
export type { DataTableProps } from './components/DataTable';

export { default as FormBuilder } from './components/FormBuilder';
export type { FormBuilderProps, FormField } from './components/FormBuilder';

export { default as confirmModal } from './components/ConfirmModal';
export type { ConfirmModalOptions } from './components/ConfirmModal';

export { default as StatusBadge } from './components/StatusBadge';
export type { StatusBadgeProps, StatusType } from './components/StatusBadge';

export { default as EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

export { default as ErrorBoundary } from './components/ErrorBoundary';
export type { ErrorBoundaryProps } from './components/ErrorBoundary';

// ─── Theme ───────────────────────────────────────────────────
export { default as themeConfig } from './theme/themeConfig';
