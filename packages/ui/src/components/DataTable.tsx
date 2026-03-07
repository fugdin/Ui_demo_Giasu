import React, { useMemo } from 'react';
import { Table, Input, Skeleton, Card } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { TableProps, TablePaginationConfig } from 'antd';
import EmptyState from './EmptyState';

// ─── Props ───────────────────────────────────────────────────

export interface DataTableProps<T extends object> extends Omit<TableProps<T>, 'loading'> {
  /** Show skeleton placeholder instead of a spinner while loading. */
  loading?: boolean;
  /** Value bound to the search input. Pass `undefined` to hide the search bar. */
  searchValue?: string;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
  /** Callback when the search input value changes. */
  onSearchChange?: (value: string) => void;
  /** Total number of records (for server-side pagination). */
  total?: number;
  /** Current page number (1-indexed). */
  page?: number;
  /** Number of rows per page (defaults to 10). */
  pageSize?: number;
  /** Callback when page or pageSize changes. */
  onPageChange?: (page: number, pageSize: number) => void;
  /** Message shown when the table has no data. */
  emptyText?: string;
}

// ─── Component ───────────────────────────────────────────────

function DataTableInner<T extends object>(
  {
    loading = false,
    searchValue,
    searchPlaceholder = 'Tìm kiếm…',
    onSearchChange,
    total,
    page,
    pageSize = 10,
    onPageChange,
    emptyText = 'Không có dữ liệu',
    columns,
    dataSource,
    ...restTableProps
  }: DataTableProps<T>,
  ref: React.Ref<HTMLDivElement>,
) {
  // Build pagination config
  const pagination: TablePaginationConfig | false = useMemo(() => {
    if (total === undefined && !onPageChange) {
      // Let Ant Design handle client-side pagination with defaults
      return {
        showSizeChanger: true,
        showTotal: (t: number, range: [number, number]) =>
          `${range[0]}-${range[1]} / ${t} mục`,
        pageSizeOptions: ['10', '20', '50'],
      };
    }
    return {
      current: page,
      pageSize,
      total,
      showSizeChanger: true,
      showTotal: (t: number, range: [number, number]) =>
        `${range[0]}-${range[1]} / ${t} mục`,
      pageSizeOptions: ['10', '20', '50'],
      onChange: onPageChange,
      onShowSizeChange: onPageChange,
    };
  }, [total, page, pageSize, onPageChange]);

  // Skeleton loading state – show placeholder rows while data is being fetched
  if (loading && (!dataSource || dataSource.length === 0)) {
    return (
      <Card ref={ref}>
        {searchValue !== undefined && (
          <div style={{ marginBottom: 16 }}>
            <Input
              prefix={<SearchOutlined />}
              placeholder={searchPlaceholder}
              value={searchValue}
              disabled
              style={{ maxWidth: 360 }}
            />
          </div>
        )}
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    );
  }

  return (
    <Card ref={ref}>
      {searchValue !== undefined && (
        <div style={{ marginBottom: 16 }}>
          <Input
            prefix={<SearchOutlined />}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            allowClear
            style={{ maxWidth: 360 }}
          />
        </div>
      )}

      <Table<T>
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        locale={{
          emptyText: <EmptyState message={emptyText} />,
        }}
        scroll={{ x: 'max-content' }}
        {...restTableProps}
      />
    </Card>
  );
}

// Preserve generic through forwardRef
const DataTable = React.forwardRef(DataTableInner) as <T extends object>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement;

export default DataTable;
