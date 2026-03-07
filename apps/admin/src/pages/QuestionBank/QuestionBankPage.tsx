import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Space, Select, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { PageHeader, DataTable, confirmModal } from '@ai-learning/ui';
import type { Question, QuestionType, DifficultyLevel } from '@ai-learning/types';
import { questionsApi } from '@/services/api';
import type { ColumnsType } from 'antd/es/table';

// ─── Constants ───────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Một đáp án',
  multiple_choice: 'Nhiều đáp án',
  fill_in_blank: 'Điền vào chỗ trống',
  true_false: 'Đúng / Sai',
  drag_and_drop: 'Kéo thả',
  sort_paragraphs: 'Sắp xếp đoạn văn',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó',
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};

// ─── Component ───────────────────────────────────────────────

export default function QuestionBankPage() {
  const navigate = useNavigate();

  // Data state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // Filter state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<QuestionType | undefined>();
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | undefined>();

  // ─── Fetch ──────────────────────────────────────────────────

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const filters: Record<string, string> = {};
      if (typeFilter) filters.type = typeFilter;
      if (difficultyFilter) filters.difficulty = difficultyFilter;

      const { data } = await questionsApi.getAll({
        page,
        pageSize,
        search: search || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });
      setQuestions(data.data);
      setTotal(data.total);
    } catch {
      message.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, typeFilter, difficultyFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // ─── Handlers ───────────────────────────────────────────────

  const handleDelete = (id: string) => {
    confirmModal({
      title: 'Xóa câu hỏi',
      content: 'Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác.',
      onConfirm: async () => {
        try {
          await questionsApi.delete(id);
          message.success('Đã xóa câu hỏi');
          fetchQuestions();
        } catch {
          message.error('Không thể xóa câu hỏi');
        }
      },
    });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  // ─── Columns ────────────────────────────────────────────────

  const columns: ColumnsType<Question> = [
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: QuestionType) => (
        <Tag>{QUESTION_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 120,
      render: (difficulty: DifficultyLevel) => (
        <Tag color={DIFFICULTY_COLORS[difficulty]}>
          {DIFFICULTY_LABELS[difficulty]}
        </Tag>
      ),
    },
    {
      title: 'Bài học',
      dataIndex: 'lessonTitle',
      key: 'lessonTitle',
      width: 200,
      render: (title: string | undefined) => title || '—',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/questions/${record.id}/edit`)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        actions={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/questions/create')}
          >
            Tạo câu hỏi
          </Button>
        }
      />

      {/* Filter bar */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Loại câu hỏi"
          allowClear
          style={{ width: 200 }}
          value={typeFilter}
          onChange={(value) => {
            setTypeFilter(value);
            setPage(1);
          }}
          options={Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <Select
          placeholder="Độ khó"
          allowClear
          style={{ width: 150 }}
          value={difficultyFilter}
          onChange={(value) => {
            setDifficultyFilter(value);
            setPage(1);
          }}
          options={Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({
            value,
            label,
          }))}
        />
        <Input
          placeholder="Tìm kiếm câu hỏi..."
          prefix={<SearchOutlined />}
          allowClear
          style={{ width: 260 }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </Space>

      <DataTable<Question>
        rowKey="id"
        columns={columns}
        dataSource={questions}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </>
  );
}
