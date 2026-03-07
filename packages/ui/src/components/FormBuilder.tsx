import React from 'react';
import { Form, Button, Space } from 'antd';
import type { FormProps, FormInstance, FormItemProps } from 'antd';

// ─── Vietnamese validation messages ──────────────────────────

const vietnameseValidateMessages: FormProps['validateMessages'] = {
  required: '${label} là bắt buộc',
  types: {
    email: '${label} không đúng định dạng email',
    number: '${label} phải là số',
    url: '${label} không đúng định dạng URL',
  },
  string: {
    len: '${label} phải có ${len} ký tự',
    min: '${label} phải có ít nhất ${min} ký tự',
    max: '${label} không được vượt quá ${max} ký tự',
    range: '${label} phải từ ${min} đến ${max} ký tự',
  },
  number: {
    len: '${label} phải bằng ${len}',
    min: '${label} phải lớn hơn hoặc bằng ${min}',
    max: '${label} phải nhỏ hơn hoặc bằng ${max}',
    range: '${label} phải từ ${min} đến ${max}',
  },
  pattern: {
    mismatch: '${label} không đúng định dạng yêu cầu',
  },
};

// ─── Props ───────────────────────────────────────────────────

export interface FormField extends FormItemProps {
  /** Unique field key used as `name`. */
  key: string;
  /** The form control element (Input, Select, etc.). */
  render: React.ReactNode;
}

export interface FormBuilderProps<T = unknown>
  extends Omit<FormProps<T>, 'validateMessages' | 'children'> {
  /** Array of field descriptors. Each one renders a Form.Item. */
  fields: FormField[];
  /** Label for the submit button. Defaults to "Lưu". */
  submitLabel?: string;
  /** Label for the reset/cancel button. Pass `undefined` to hide it. */
  cancelLabel?: string;
  /** Whether the submit button should show a loading spinner. */
  submitting?: boolean;
  /** Callback when the cancel button is clicked. */
  onCancel?: () => void;
  /** Expose the form instance to the parent via ref. */
  formRef?: React.Ref<FormInstance<T>>;
}

// ─── Component ───────────────────────────────────────────────

function FormBuilder<T = unknown>({
  fields,
  submitLabel = 'Lưu',
  cancelLabel,
  submitting = false,
  onCancel,
  formRef,
  layout = 'vertical',
  ...formProps
}: FormBuilderProps<T>) {
  const [form] = Form.useForm<T>();

  // Expose form instance
  React.useImperativeHandle(formRef, () => form, [form]);

  return (
    <Form<T>
      form={form}
      layout={layout}
      validateMessages={vietnameseValidateMessages}
      scrollToFirstError
      {...formProps}
    >
      {fields.map(({ key, render, ...itemProps }) => (
        <Form.Item key={key} name={key as string} {...itemProps}>
          {render}
        </Form.Item>
      ))}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {submitLabel}
          </Button>
          {cancelLabel && (
            <Button onClick={onCancel} disabled={submitting}>
              {cancelLabel}
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
}

export default FormBuilder;
