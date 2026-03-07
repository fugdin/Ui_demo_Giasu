import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Radio,
  Checkbox,
  InputNumber,
  message,
  Card,
  Spin,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { PageHeader } from '@ai-learning/ui';
import type {
  QuestionType,
  DifficultyLevel,
  Question,
  CreateQuestionRequest,
  Lesson,
} from '@ai-learning/types';
import { questionsApi, lessonsApi, coursesApi } from '@/services/api';

const { TextArea } = Input;

// ─── Constants ───────────────────────────────────────────────

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'single_choice', label: 'Một đáp án' },
  { value: 'multiple_choice', label: 'Nhiều đáp án' },
  { value: 'fill_in_blank', label: 'Điền vào chỗ trống' },
  { value: 'true_false', label: 'Đúng / Sai' },
  { value: 'drag_and_drop', label: 'Kéo thả' },
  { value: 'sort_paragraphs', label: 'Sắp xếp đoạn văn' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'easy', label: 'Dễ' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'hard', label: 'Khó' },
];

// ─── Form values type ────────────────────────────────────────

interface OptionField {
  content: string;
  isCorrect: boolean;
}

interface DragDropField {
  content: string;
  targetPosition: number;
}

interface SortField {
  content: string;
  correctOrder: number;
}

interface QuestionFormValues {
  type: QuestionType;
  difficulty: DifficultyLevel;
  content: string;
  lessonId?: string;
  options?: OptionField[];
  correctAnswer?: string;
  correctBoolean?: boolean;
  dragDropItems?: DragDropField[];
  sortItems?: SortField[];
}

// ─── Component ───────────────────────────────────────────────

export default function QuestionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [form] = Form.useForm<QuestionFormValues>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [groupedLessons, setGroupedLessons] = useState<{ label: string; options: { value: string; label: string }[] }[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const questionType = Form.useWatch('type', form);

  // ─── Fetch lessons for select ───────────────────────────────

  useEffect(() => {
    const fetchLessons = async () => {
      setLessonsLoading(true);
      try {
        // Fetch all courses, then get lessons for each
        const { data: coursesRes } = await coursesApi.getAll({ page: 1, pageSize: 100 });
        const groups: { label: string; options: { value: string; label: string }[] }[] = [];

        for (const course of coursesRes.data) {
          try {
            const { data: courseLessons } = await lessonsApi.getByCourse(course.id);
            if (courseLessons.length > 0) {
              groups.push({
                label: course.title,
                options: courseLessons.map((lesson: Lesson) => ({
                  value: lesson.id,
                  label: lesson.title,
                })),
              });
            }
          } catch {
            // Skip courses with no lessons
          }
        }

        setGroupedLessons(groups);
      } catch {
        // Non-critical: lessons select will just be empty
      } finally {
        setLessonsLoading(false);
      }
    };

    fetchLessons();
  }, []);

  // ─── Fetch existing question for editing ────────────────────

  useEffect(() => {
    if (!id) return;

    const fetchQuestion = async () => {
      setLoading(true);
      try {
        const { data: question } = await questionsApi.getById(id);
        const values: QuestionFormValues = {
          type: question.type,
          difficulty: question.difficulty,
          content: question.content,
          lessonId: question.lessonId,
        };

        // Populate type-specific fields
        switch (question.type) {
          case 'single_choice':
          case 'multiple_choice':
            values.options = question.options?.map((opt) => ({
              content: opt.content,
              isCorrect: opt.isCorrect,
            })) ?? [];
            break;
          case 'fill_in_blank':
            values.correctAnswer = question.correctAnswer;
            break;
          case 'true_false':
            values.correctBoolean = question.correctBoolean;
            break;
          case 'drag_and_drop':
            values.dragDropItems = question.dragDropItems?.map((item) => ({
              content: item.content,
              targetPosition: item.targetPosition,
            })) ?? [];
            break;
          case 'sort_paragraphs':
            values.sortItems = question.sortItems?.map((item) => ({
              content: item.content,
              correctOrder: item.correctOrder,
            })) ?? [];
            break;
        }

        form.setFieldsValue(values);
      } catch {
        message.error('Không thể tải thông tin câu hỏi');
        navigate('/questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, form, navigate]);

  // ─── Submit ─────────────────────────────────────────────────

  const handleSubmit = async (values: QuestionFormValues) => {
    setSubmitting(true);
    try {
      const payload: CreateQuestionRequest = {
        type: values.type,
        difficulty: values.difficulty,
        content: values.content,
        lessonId: values.lessonId,
      };

      // Attach type-specific data
      switch (values.type) {
        case 'single_choice':
        case 'multiple_choice':
          payload.options = values.options;
          break;
        case 'fill_in_blank':
          payload.correctAnswer = values.correctAnswer;
          break;
        case 'true_false':
          payload.correctBoolean = values.correctBoolean;
          break;
        case 'drag_and_drop':
          payload.dragDropItems = values.dragDropItems;
          break;
        case 'sort_paragraphs':
          payload.sortItems = values.sortItems;
          break;
      }

      if (isEditing && id) {
        await questionsApi.update(id, payload);
        message.success('Đã cập nhật câu hỏi');
      } else {
        await questionsApi.create(payload);
        message.success('Đã tạo câu hỏi');
      }

      navigate('/questions');
    } catch {
      message.error(isEditing ? 'Không thể cập nhật câu hỏi' : 'Không thể tạo câu hỏi');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Dynamic fields per question type ───────────────────────

  const renderTypeSpecificFields = () => {
    switch (questionType) {
      case 'single_choice':
        return (
          <Card title="Đáp án" size="small" style={{ marginBottom: 16 }}>
            <Form.List
              name="options"
              rules={[
                {
                  validator: async (_, opts) => {
                    if (!opts || opts.length < 2) {
                      return Promise.reject(new Error('Cần ít nhất 2 đáp án'));
                    }
                    const correctCount = opts.filter((o: OptionField) => o?.isCorrect).length;
                    if (correctCount !== 1) {
                      return Promise.reject(new Error('Chọn đúng 1 đáp án đúng'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'isCorrect']}
                        valuePropName="checked"
                        noStyle
                      >
                        <Radio
                          checked={form.getFieldValue(['options', name, 'isCorrect'])}
                          onChange={() => {
                            // Uncheck all, then check this one
                            const options = form.getFieldValue('options') as OptionField[];
                            const updated = options.map((opt, idx) => ({
                              ...opt,
                              isCorrect: idx === name,
                            }));
                            form.setFieldsValue({ options: updated });
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder={`Đáp án ${name + 1}`} style={{ width: 400 }} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ content: '', isCorrect: false })} icon={<PlusOutlined />}>
                    Thêm đáp án
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Card>
        );

      case 'multiple_choice':
        return (
          <Card title="Đáp án (chọn nhiều)" size="small" style={{ marginBottom: 16 }}>
            <Form.List
              name="options"
              rules={[
                {
                  validator: async (_, opts) => {
                    if (!opts || opts.length < 2) {
                      return Promise.reject(new Error('Cần ít nhất 2 đáp án'));
                    }
                    const correctCount = opts.filter((o: OptionField) => o?.isCorrect).length;
                    if (correctCount < 1) {
                      return Promise.reject(new Error('Chọn ít nhất 1 đáp án đúng'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'isCorrect']}
                        valuePropName="checked"
                        noStyle
                      >
                        <Checkbox />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung đáp án' }]}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder={`Đáp án ${name + 1}`} style={{ width: 400 }} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ content: '', isCorrect: false })} icon={<PlusOutlined />}>
                    Thêm đáp án
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Card>
        );

      case 'fill_in_blank':
        return (
          <Form.Item
            name="correctAnswer"
            label="Đáp án đúng"
            rules={[{ required: true, message: 'Nhập đáp án đúng' }]}
          >
            <Input placeholder="Nhập đáp án đúng" />
          </Form.Item>
        );

      case 'true_false':
        return (
          <Form.Item
            name="correctBoolean"
            label="Đáp án đúng"
            rules={[{ required: true, message: 'Chọn đáp án đúng' }]}
          >
            <Radio.Group>
              <Radio value={true}>Đúng</Radio>
              <Radio value={false}>Sai</Radio>
            </Radio.Group>
          </Form.Item>
        );

      case 'drag_and_drop':
        return (
          <Card title="Mục kéo thả" size="small" style={{ marginBottom: 16 }}>
            <Form.List
              name="dragDropItems"
              rules={[
                {
                  validator: async (_, items) => {
                    if (!items || items.length < 2) {
                      return Promise.reject(new Error('Cần ít nhất 2 mục'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Nội dung" style={{ width: 350 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'targetPosition']}
                        rules={[{ required: true, message: 'Nhập vị trí' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber placeholder="Vị trí đích" min={1} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ content: '', targetPosition: fields.length + 1 })}
                    icon={<PlusOutlined />}
                  >
                    Thêm mục
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Card>
        );

      case 'sort_paragraphs':
        return (
          <Card title="Đoạn văn cần sắp xếp" size="small" style={{ marginBottom: 16 }}>
            <Form.List
              name="sortItems"
              rules={[
                {
                  validator: async (_, items) => {
                    if (!items || items.length < 2) {
                      return Promise.reject(new Error('Cần ít nhất 2 đoạn văn'));
                    }
                  },
                },
              ]}
            >
              {(fields, { add, remove }, { errors }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'content']}
                        rules={[{ required: true, message: 'Nhập nội dung' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Input placeholder="Nội dung đoạn văn" style={{ width: 350 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'correctOrder']}
                        rules={[{ required: true, message: 'Nhập thứ tự' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber placeholder="Thứ tự đúng" min={1} />
                      </Form.Item>
                      {fields.length > 2 && (
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      )}
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add({ content: '', correctOrder: fields.length + 1 })}
                    icon={<PlusOutlined />}
                  >
                    Thêm đoạn văn
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Card>
        );

      default:
        return null;
    }
  };

  // ─── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={isEditing ? 'Sửa câu hỏi' : 'Tạo câu hỏi'}
        breadcrumbs={[
          { label: 'Ngân hàng câu hỏi', path: '/questions' },
          { label: isEditing ? 'Sửa câu hỏi' : 'Tạo câu hỏi' },
        ]}
        onBreadcrumbClick={(path) => navigate(path)}
      />

      <Card>
        <Form<QuestionFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'single_choice',
            difficulty: 'medium',
            options: [
              { content: '', isCorrect: true },
              { content: '', isCorrect: false },
            ],
          }}
        >
          {/* Top section — always visible */}
          <Form.Item
            name="type"
            label="Loại câu hỏi"
            rules={[{ required: true, message: 'Chọn loại câu hỏi' }]}
          >
            <Select options={QUESTION_TYPE_OPTIONS} placeholder="Chọn loại câu hỏi" />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="Độ khó"
            rules={[{ required: true, message: 'Chọn độ khó' }]}
          >
            <Select options={DIFFICULTY_OPTIONS} placeholder="Chọn độ khó" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung câu hỏi"
            rules={[{ required: true, message: 'Nhập nội dung câu hỏi' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung câu hỏi..." />
          </Form.Item>

          {/* Dynamic section based on question type */}
          {renderTypeSpecificFields()}

          {/* Lesson assignment */}
          <Form.Item name="lessonId" label="Gắn vào bài học">
            <Select
              placeholder="Chọn bài học (không bắt buộc)"
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label as string ?? '').toLowerCase().includes(input.toLowerCase())
              }
              loading={lessonsLoading}
              options={groupedLessons}
              virtual
            />
          </Form.Item>

          {/* Action buttons */}
          <Form.Item>
            <Space>
              <Button onClick={() => navigate('/questions')}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Lưu câu hỏi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
