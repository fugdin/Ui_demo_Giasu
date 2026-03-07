import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Tabs,
  Input,
  Switch,
  Button,
  Space,
  Spin,
  Table,
  Modal,
  message,
  Typography,
  Card,
  Upload,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  HolderOutlined,
  UploadOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PageHeader, confirmModal } from '@ai-learning/ui';
import type {
  Lesson,
  LessonTheory,
  LessonInteraction,
  Question,
} from '@ai-learning/types';
import { lessonsApi, questionsApi } from '@/services/api';

const { Text } = Typography;

// ─── Question Type Labels ────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<string, string> = {
  single_choice: 'Trắc nghiệm một đáp án',
  multiple_choice: 'Trắc nghiệm nhiều đáp án',
  fill_in_blank: 'Điền vào chỗ trống',
  true_false: 'Đúng / Sai',
  drag_and_drop: 'Kéo thả',
  sort_paragraphs: 'Sắp xếp đoạn văn',
};

// ─── Sortable Question Row ───────────────────────────────────

interface SortableQuestionRowProps {
  question: Question;
  index: number;
  onRemove: (id: string) => void;
}

function SortableQuestionRow({ question, index, onRemove }: SortableQuestionRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
      }}
    >
      <HolderOutlined
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', fontSize: 16, color: '#999' }}
      />
      <Text style={{ minWidth: 32, textAlign: 'center' }}>{index + 1}</Text>
      <Text style={{ flex: 1 }}>{question.content}</Text>
      <Text type="secondary" style={{ minWidth: 140 }}>
        {QUESTION_TYPE_LABELS[question.type] ?? question.type}
      </Text>
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        title="Xóa khỏi bài học"
        onClick={() => onRemove(question.id)}
      />
    </div>
  );
}

// ─── Tab: Lý thuyết ──────────────────────────────────────────

interface TheoryTabProps {
  lessonId: string;
}

function TheoryTab({ lessonId }: TheoryTabProps) {
  const [theory, setTheory] = useState<Partial<LessonTheory>>({
    pdfUrl: '',
    slideEnabled: false,
    slideEmbedUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    lessonsApi
      .getTheory(lessonId)
      .then((res) => setTheory(res.data))
      .catch(() => { /* New lesson may not have theory yet */ })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonsApi.saveTheory(lessonId, theory);
      message.success('Lưu lý thuyết thành công');
    } catch {
      message.error('Lưu lý thuyết thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPdf = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      const res = await lessonsApi.uploadTheoryPdf(lessonId, formData);
      setTheory((prev) => ({ ...prev, pdfUrl: res.data.pdfUrl }));
      message.success('Upload PDF thành công');
    } catch {
      message.error('Upload PDF thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePdf = async () => {
    try {
      await lessonsApi.deleteTheoryPdf(lessonId);
      setTheory((prev) => ({ ...prev, pdfUrl: '' }));
      message.success('Đã xóa file PDF');
    } catch {
      message.error('Xóa PDF thất bại');
    }
  };

  if (loading) return <Spin />;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          File PDF lý thuyết
        </Text>

        {theory.pdfUrl ? (
          <div>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <FilePdfOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
              <Text>Đã upload file PDF</Text>
              <Button danger size="small" icon={<DeleteOutlined />} onClick={handleDeletePdf}>
                Xóa PDF
              </Button>
            </div>
            <iframe
              src={theory.pdfUrl}
              width="100%"
              height={600}
              style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
              title="PDF Preview"
            />
          </div>
        ) : (
          <Upload.Dragger
            accept=".pdf"
            showUploadList={false}
            customRequest={({ file }) => handleUploadPdf(file as File)}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#2E75B6' }} />
            </p>
            <p className="ant-upload-text">
              {uploading ? 'Đang upload...' : 'Kéo thả file PDF vào đây hoặc bấm để chọn file'}
            </p>
            <p className="ant-upload-hint">Chỉ hỗ trợ file PDF</p>
          </Upload.Dragger>
        )}
      </div>

      <Space align="center">
        <Switch
          checked={theory.slideEnabled}
          onChange={(checked) => setTheory((prev) => ({ ...prev, slideEnabled: checked }))}
        />
        <Text>Hiện slide cho học sinh</Text>
      </Space>

      {theory.slideEnabled && (
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Link embed slide
          </Text>
          <Input
            value={theory.slideEmbedUrl}
            onChange={(e) =>
              setTheory((prev) => ({ ...prev, slideEmbedUrl: e.target.value }))
            }
            placeholder="https://docs.google.com/presentation/d/.../embed"
          />
        </div>
      )}

      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
        Lưu Lý thuyết
      </Button>
    </Space>
  );
}

// ─── Tab: Tương tác ──────────────────────────────────────────

interface InteractionTabProps {
  lessonId: string;
}

function InteractionTab({ lessonId }: InteractionTabProps) {
  const [interaction, setInteraction] = useState<Partial<LessonInteraction>>({
    youtubeUrl: '',
    htmlContent: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    lessonsApi
      .getInteraction(lessonId)
      .then((res) => setInteraction(res.data))
      .catch(() => { /* May not exist yet */ })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await lessonsApi.saveInteraction(lessonId, interaction);
      message.success('Lưu tương tác thành công');
    } catch {
      message.error('Lưu tương tác thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleImportHtml = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInteraction((prev) => ({ ...prev, htmlContent: content }));
      message.success('Import file HTML thành công');
    };
    reader.readAsText(file);
  };

  if (loading) return <Spin />;

  const embedUrl = interaction.youtubeUrl
    ? interaction.youtubeUrl
        .replace('watch?v=', 'embed/')
        .replace('youtu.be/', 'www.youtube.com/embed/')
    : '';

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* ── Video YouTube ── */}
      <Card title="Video YouTube" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input
            value={interaction.youtubeUrl}
            onChange={(e) =>
              setInteraction((prev) => ({ ...prev, youtubeUrl: e.target.value }))
            }
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {embedUrl && (
            <iframe
              src={embedUrl}
              width="100%"
              height={400}
              style={{ border: 'none', borderRadius: 8 }}
              title="YouTube Preview"
              allowFullScreen
            />
          )}
        </Space>
      </Card>

      {/* ── Mô phỏng HTML ── */}
      <Card title="Mô phỏng tương tác" size="small">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Upload
              accept=".html,.htm"
              showUploadList={false}
              beforeUpload={(file) => {
                handleImportHtml(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />}>Import file HTML</Button>
            </Upload>
            {interaction.htmlContent && (
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setInteraction((prev) => ({ ...prev, htmlContent: '' }));
                  message.info('Đã xóa nội dung mô phỏng');
                }}
              >
                Xóa
              </Button>
            )}
          </div>

          {interaction.htmlContent && (
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Xem trước
              </Text>
              <iframe
                srcDoc={interaction.htmlContent}
                width="100%"
                height={450}
                style={{ border: '1px solid #d9d9d9', borderRadius: 8 }}
                title="Simulation Preview"
                sandbox="allow-scripts"
              />
            </div>
          )}
        </Space>
      </Card>

      <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
        Lưu Tương tác
      </Button>
    </Space>
  );
}

// ─── Tab: Bài tập ────────────────────────────────────────────

interface ExercisesTabProps {
  lessonId: string;
}

function ExercisesTab({ lessonId }: ExercisesTabProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lessonsApi.getLessonQuestions(lessonId);
      setQuestions(res.data);
    } catch {
      message.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setQuestions((prev) => {
      const oldIndex = prev.findIndex((q) => q.id === active.id);
      const newIndex = prev.findIndex((q) => q.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await lessonsApi.reorderQuestions(lessonId, questions.map((q) => q.id));
      message.success('Lưu thứ tự câu hỏi thành công');
      setOrderChanged(false);
    } catch {
      message.error('Lưu thứ tự thất bại');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    confirmModal({
      title: 'Xóa câu hỏi',
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này khỏi bài học?',
      onConfirm: async () => {
        try {
          await lessonsApi.removeQuestion(lessonId, questionId);
          message.success('Đã xóa câu hỏi khỏi bài học');
          await fetchQuestions();
        } catch {
          message.error('Xóa câu hỏi thất bại');
        }
      },
    });
  };

  const handleOpenAddModal = async () => {
    setModalOpen(true);
    setLoadingAll(true);
    try {
      const res = await questionsApi.getAll();
      // Filter out questions already assigned to this lesson
      const existingIds = new Set(questions.map((q) => q.id));
      setAllQuestions(res.data.data.filter((q: Question) => !existingIds.has(q.id)));
    } catch {
      message.error('Không thể tải ngân hàng câu hỏi');
    } finally {
      setLoadingAll(false);
    }
  };

  const handleAddQuestions = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }
    try {
      await lessonsApi.addQuestions(lessonId, selectedRowKeys as string[]);
      message.success(`Đã thêm ${selectedRowKeys.length} câu hỏi`);
      setModalOpen(false);
      setSelectedRowKeys([]);
      await fetchQuestions();
    } catch {
      message.error('Thêm câu hỏi thất bại');
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
          Thêm câu hỏi
        </Button>
        {orderChanged && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={savingOrder}
            onClick={handleSaveOrder}
          >
            Lưu thứ tự
          </Button>
        )}
      </Space>

      {questions.length === 0 ? (
        <Card>
          <Text type="secondary">Chưa có câu hỏi nào trong bài học này.</Text>
        </Card>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          {/* Table Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderBottom: '2px solid #f0f0f0',
              background: '#fafafa',
              fontWeight: 600,
            }}
          >
            <span style={{ width: 24 }} />
            <span style={{ minWidth: 32, textAlign: 'center' }}>STT</span>
            <span style={{ flex: 1 }}>Nội dung</span>
            <span style={{ minWidth: 140 }}>Loại</span>
            <span style={{ width: 40 }} />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.id)}
              strategy={verticalListSortingStrategy}
            >
              {questions.map((question, index) => (
                <SortableQuestionRow
                  key={question.id}
                  question={question}
                  index={index}
                  onRemove={handleRemoveQuestion}
                />
              ))}
            </SortableContext>
          </DndContext>
        </Card>
      )}

      {/* Modal: Add questions from bank */}
      <Modal
        title="Chọn câu hỏi từ ngân hàng"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedRowKeys([]);
        }}
        onOk={handleAddQuestions}
        okText={`Thêm (${selectedRowKeys.length})`}
        cancelText="Hủy"
        width={800}
      >
        <Table
          rowKey="id"
          loading={loadingAll}
          dataSource={allQuestions}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          columns={[
            {
              title: 'Nội dung',
              dataIndex: 'content',
              key: 'content',
              ellipsis: true,
            },
            {
              title: 'Loại',
              dataIndex: 'type',
              key: 'type',
              width: 180,
              render: (type: string) => QUESTION_TYPE_LABELS[type] ?? type,
            },
            {
              title: 'Độ khó',
              dataIndex: 'difficulty',
              key: 'difficulty',
              width: 100,
              render: (d: string) => {
                const labels: Record<string, string> = {
                  easy: 'Dễ',
                  medium: 'Trung bình',
                  hard: 'Khó',
                };
                return labels[d] ?? d;
              },
            },
          ]}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function LessonContentPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;
    setLoading(true);
    lessonsApi
      .getById(lessonId)
      .then((res) => setLesson(res.data))
      .catch(() => {
        message.error('Không thể tải dữ liệu bài học');
        navigate(`/courses/${courseId}/lessons`);
      })
      .finally(() => setLoading(false));
  }, [lessonId, courseId, navigate]);

  if (loading || !lesson) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Nội dung: ${lesson.title}`}
        breadcrumbs={[
          { label: 'Khóa học', path: '/courses' },
          { label: 'Bài học', path: `/courses/${courseId}/lessons` },
          { label: lesson.title },
        ]}
        onBreadcrumbClick={(path) => navigate(path)}
      />

      <Tabs
        defaultActiveKey="theory"
        items={[
          {
            key: 'theory',
            label: 'Lý thuyết',
            children: <TheoryTab lessonId={lessonId!} />,
          },
          {
            key: 'interaction',
            label: 'Tương tác',
            children: (
              <InteractionTab lessonId={lessonId!} />
            ),
          },
          {
            key: 'exercises',
            label: 'Bài tập',
            children: <ExercisesTab lessonId={lessonId!} />,
          },
        ]}
      />
    </div>
  );
}
