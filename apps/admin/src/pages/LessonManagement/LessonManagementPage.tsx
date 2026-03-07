import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spin, Space, Typography, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  FileTextOutlined,
  DeleteOutlined,
  HolderOutlined,
  SaveOutlined,
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
import { PageHeader, confirmModal, EmptyState } from '@ai-learning/ui';
import type { Lesson, Course } from '@ai-learning/types';
import { lessonsApi, coursesApi } from '@/services/api';

const { Text } = Typography;

// ─── Sortable Lesson Item ────────────────────────────────────

interface SortableLessonItemProps {
  lesson: Lesson;
  courseId: string;
  onDelete: (id: string) => void;
}

function SortableLessonItem({ lesson, courseId, onDelete }: SortableLessonItemProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        style={{ marginBottom: 8 }}
        styles={{ body: { display: 'flex', alignItems: 'center', gap: 12 } }}
      >
        <HolderOutlined
          {...attributes}
          {...listeners}
          style={{ cursor: 'grab', fontSize: 18, color: '#999' }}
        />
        <Text strong style={{ minWidth: 32, textAlign: 'center' }}>
          {lesson.order}
        </Text>
        <Text style={{ flex: 1 }}>{lesson.title}</Text>
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            title="Sửa bài học"
            onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
          />
          <Button
            type="text"
            icon={<FileTextOutlined />}
            title="Nội dung"
            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}/content`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            title="Xóa bài học"
            onClick={() => onDelete(lesson.id)}
          />
        </Space>
      </Card>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────

export default function LessonManagementPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        coursesApi.getById(courseId),
        lessonsApi.getByCourse(courseId),
      ]);
      setCourse(courseRes.data);
      setLessons(lessonsRes.data);
    } catch {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLessons((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    if (!courseId) return;
    setSavingOrder(true);
    try {
      await lessonsApi.reorder(courseId, lessons.map((l) => l.id));
      message.success('Lưu thứ tự thành công');
      setOrderChanged(false);
      await fetchData();
    } catch {
      message.error('Lưu thứ tự thất bại');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = (lessonId: string) => {
    confirmModal({
      title: 'Xóa bài học',
      content: 'Bạn có chắc chắn muốn xóa bài học này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          await lessonsApi.delete(lessonId);
          message.success('Xóa bài học thành công');
          await fetchData();
        } catch {
          message.error('Xóa bài học thất bại');
        }
      },
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={course?.title ?? 'Quản lý bài học'}
        subtitle={`Tổng cộng ${lessons.length} bài học`}
        breadcrumbs={[
          { label: 'Khóa học', path: '/courses' },
          { label: course?.title ?? 'Bài học' },
        ]}
        onBreadcrumbClick={(path) => navigate(path)}
        actions={
          <Space>
            {orderChanged && (
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={savingOrder}
                onClick={handleSaveOrder}
              >
                Lưu thứ tự mới
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/courses/${courseId}/lessons/create`)}
            >
              Thêm bài
            </Button>
          </Space>
        }
      />

      {lessons.length === 0 ? (
        <EmptyState
          message="Chưa có bài học nào"
          description="Bắt đầu bằng cách thêm bài học đầu tiên cho khóa học này."
          ctaLabel="+ Thêm bài học"
          onCtaClick={() => navigate(`/courses/${courseId}/lessons/create`)}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lessons.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {lessons.map((lesson) => (
              <SortableLessonItem
                key={lesson.id}
                lesson={lesson}
                courseId={courseId!}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
