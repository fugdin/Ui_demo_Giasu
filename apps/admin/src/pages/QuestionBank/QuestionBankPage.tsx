import { useState, useEffect, useCallback, useRef, type ChangeEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Space, Select, Input, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { PageHeader, DataTable, confirmModal } from '@ai-learning/ui';
import type { Question, QuestionType, DifficultyLevel } from '@ai-learning/types';
import { questionsApi } from '@/services/api';
import type { ColumnsType } from 'antd/es/table';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single_choice: 'Má»™t Ä‘Ã¡p Ã¡n',
  multiple_choice: 'Nhiá»u Ä‘Ã¡p Ã¡n',
  fill_in_blank: 'Äiá»n vÃ o chá»— trá»‘ng',
  true_false: 'ÄÃºng / Sai',
  drag_and_drop: 'KÃ©o tháº£',
  sort_paragraphs: 'Sáº¯p xáº¿p Ä‘oáº¡n vÄƒn',
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Dá»…',
  medium: 'Trung bÃ¬nh',
  hard: 'KhÃ³',
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // â”€â”€â”€ Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      message.error('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch cÃ¢u há»i');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, typeFilter, difficultyFilter]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // â”€â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleDelete = (id: string) => {
    confirmModal({
      title: 'XÃ³a cÃ¢u há»i',
      content: 'Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a cÃ¢u há»i nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.',
      onConfirm: async () => {
        try {
          await questionsApi.delete(id);
          message.success('ÄÃ£ xÃ³a cÃ¢u há»i');
          fetchQuestions();
        } catch {
          message.error('KhÃ´ng thá»ƒ xÃ³a cÃ¢u há»i');
        }
      },
    });
  };

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // TODO: wire up CSV parsing + API endpoint when backend is ready
    message.info(`ÄÃ£ chá»n file CSV: ${file.name} (tÃ­nh nÄƒng import sáº½ Ä‘Æ°á»£c bá»• sung).`);
    event.target.value = '';
  };

  // â”€â”€â”€ Columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const columns: ColumnsType<Question> = [
    {
      title: 'Ná»™i dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 350,
    },
    {
      title: 'Loáº¡i',
      dataIndex: 'type',
      key: 'type',
      width: 160,
      render: (type: QuestionType) => (
        <Tag>{QUESTION_TYPE_LABELS[type]}</Tag>
      ),
    },
    {
      title: 'Äá»™ khÃ³',
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
      title: 'BÃ i há»c',
      dataIndex: 'lessonTitle',
      key: 'lessonTitle',
      width: 200,
      render: (title: string | undefined) => title || 'â€”',
    },
    {
      title: 'Thao tÃ¡c',
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

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        actions={
          <Space direction="vertical">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/questions/create')}
            >
              Tạo câu hỏi
            </Button>
            <Button icon={<UploadOutlined />} onClick={handleImportClick}>
              Import file CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
          </Space>
        }
      />

      {/* Filter bar */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Loáº¡i cÃ¢u há»i"
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
          placeholder="Äá»™ khÃ³"
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
          placeholder="TÃ¬m kiáº¿m cÃ¢u há»i..."
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




