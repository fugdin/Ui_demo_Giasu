import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';

// ─── Props ───────────────────────────────────────────────────

export interface ConfirmModalOptions {
  /** Modal title. */
  title: string;
  /** Body content / description. */
  content: React.ReactNode;
  /** Label for the confirm button. Defaults to "Xác nhận". */
  okText?: string;
  /** Label for the cancel button. Defaults to "Hủy". */
  cancelText?: string;
  /** Whether the confirm button should be styled as danger. Defaults to `true`. */
  danger?: boolean;
  /** Callback executed when the user confirms. Can return a Promise for async handling. */
  onConfirm: () => void | Promise<void>;
  /** Callback executed when the user cancels. */
  onCancel?: () => void;
}

// ─── Function ────────────────────────────────────────────────

/**
 * Opens a confirmation modal using Ant Design's `Modal.confirm`.
 *
 * Usage:
 * ```ts
 * confirmModal({
 *   title: 'Xóa người dùng',
 *   content: 'Bạn có chắc chắn muốn xóa người dùng này?',
 *   onConfirm: () => deleteUser(id),
 * });
 * ```
 */
const confirmModal = ({
  title,
  content,
  okText = 'Xác nhận',
  cancelText = 'Hủy',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalOptions) => {
  Modal.confirm({
    title,
    icon: <ExclamationCircleFilled />,
    content,
    okText,
    cancelText,
    okButtonProps: { danger },
    onOk: onConfirm,
    onCancel,
    centered: true,
  });
};

export default confirmModal;
