import {
  Card, Radio, Checkbox, Input, Button, Progress, Typography, Space,
  Modal, Spin, Drawer, Tag, message,
} from 'antd';
import {
  LeftOutlined, RightOutlined, ClockCircleOutlined, SendOutlined,
  MessageOutlined, ArrowUpOutlined, ArrowDownOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningApi } from '@/services/api';
import type { Question, QuestionType } from '@ai-learning/types';

const { Title, Text } = Typography;

/* ── Kiểu dữ liệu ───────────────────────────────────── */
type AnswerValue = string | string[] | Record<string, number>;

interface PracticeData {
  lessonId: string;
  lessonTitle: string;
  questions: Question[];
}

/* ── Component ───────────────────────────────────────── */
export default function PracticePage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  // State
  const [practice, setPractice] = useState<PracticeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Tải dữ liệu bài tập ──────────────────────────────
  useEffect(() => {
    if (!lessonId) return;
    const fetchPractice = async () => {
      setLoading(true);
      try {
        const res = await learningApi.getPractice(lessonId);
        setPractice(res.data);
      } catch {
        message.error('Không thể tải bài tập');
      } finally {
        setLoading(false);
      }
    };
    fetchPractice();
  }, [lessonId]);

  // ── Timer đếm lên ────────────────────────────────────
  useEffect(() => {
    if (loading || !practice) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, practice]);

  // ── Helpers ───────────────────────────────────────────
  const questions = practice?.questions || [];
  const totalQuestions = questions.length;
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleAnswer = (questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ── Nộp bài ───────────────────────────────────────────
  const doSubmit = useCallback(async () => {
    if (!lessonId || submitting) return;
    setSubmitting(true);
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      const res = await learningApi.submitPractice(lessonId, answers);
      const attemptId = res.data?.attemptId || res.data?.id || 'latest';
      navigate(`/student/practice/${lessonId}/result/${attemptId}`, {
        replace: true,
      });
    } catch {
      message.error('Không thể nộp bài. Vui lòng thử lại.');
      setSubmitting(false);
    }
  }, [lessonId, answers, submitting, navigate]);

  const confirmSubmit = () => {
    const unanswered = totalQuestions - answeredCount;
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      content:
        unanswered > 0
          ? `Bạn còn ${unanswered} câu chưa trả lời. Vẫn nộp?`
          : 'Bạn có chắc muốn nộp bài?',
      okText: 'Nộp bài',
      cancelText: 'Tiếp tục làm',
      onOk: doSubmit,
    });
  };

  // ── Drag & Drop helpers ───────────────────────────────
  const [dragItem, setDragItem] = useState<string | null>(null);

  const handleDragStart = (itemId: string) => {
    setDragItem(itemId);
  };

  const handleDrop = (targetPosition: number, questionId: string) => {
    if (!dragItem) return;
    const current = (answers[questionId] as Record<string, number>) || {};
    handleAnswer(questionId, { ...current, [dragItem]: targetPosition });
    setDragItem(null);
  };

  // ── Sort helpers ──────────────────────────────────────
  const getSortOrder = (questionId: string, items: { id: string; content: string }[]) => {
    const stored = answers[questionId] as string[] | undefined;
    if (stored && stored.length === items.length) return stored;
    return items.map((item) => item.id);
  };

  const moveItem = (questionId: string, items: { id: string; content: string }[], fromIdx: number, direction: 'up' | 'down') => {
    const order = [...getSortOrder(questionId, items)];
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= order.length) return;
    [order[fromIdx], order[toIdx]] = [order[toIdx], order[fromIdx]];
    handleAnswer(questionId, order);
  };

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" tip="Đang tải bài tập..." />
      </div>
    );
  }

  if (!practice || totalQuestions === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <Card>
          <Title level={4}>Không có câu hỏi</Title>
          <Text type="secondary">Bài học này chưa có câu hỏi luyện tập.</Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Render câu hỏi theo type ──────────────────────────
  const renderQuestion = (q: Question) => {
    switch (q.type as QuestionType) {
      /* ─── Single choice ─── */
      case 'single_choice':
        return (
          <Radio.Group
            value={answers[q.id] as string}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {q.options?.map((opt) => (
                <Radio
                  key={opt.id}
                  value={opt.id}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    width: '100%',
                    background:
                      answers[q.id] === opt.id ? '#e6f4ff' : '#fff',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.content}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );

      /* ─── Multiple choice ─── */
      case 'multiple_choice':
        return (
          <Checkbox.Group
            value={(answers[q.id] as string[]) || []}
            onChange={(values) => handleAnswer(q.id, values as string[])}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {q.options?.map((opt) => (
                <Checkbox
                  key={opt.id}
                  value={opt.id}
                  style={{
                    padding: '12px 16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  {opt.content}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        );

      /* ─── Fill in blank ─── */
      case 'fill_in_blank':
        return (
          <div>
            <Text type="secondary" style={{ marginBottom: 8, display: 'block' }}>
              Nhập câu trả lời của bạn:
            </Text>
            <Input
              size="large"
              placeholder="Nhập câu trả lời..."
              value={(answers[q.id] as string) || ''}
              onChange={(e) => handleAnswer(q.id, e.target.value)}
              style={{ maxWidth: 500 }}
            />
          </div>
        );

      /* ─── True / False ─── */
      case 'true_false':
        return (
          <Radio.Group
            value={answers[q.id] as string}
            onChange={(e) => handleAnswer(q.id, e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio
                value="true"
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  width: '100%',
                  background: answers[q.id] === 'true' ? '#e6f4ff' : '#fff',
                }}
              >
                Đúng
              </Radio>
              <Radio
                value="false"
                style={{
                  padding: '12px 16px',
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  width: '100%',
                  background: answers[q.id] === 'false' ? '#e6f4ff' : '#fff',
                }}
              >
                Sai
              </Radio>
            </Space>
          </Radio.Group>
        );

      /* ─── Drag and Drop ─── */
      case 'drag_and_drop': {
        const items = q.dragDropItems || [];
        const placed = (answers[q.id] as Record<string, number>) || {};
        const positions = Array.from(
          { length: items.length },
          (_, i) => i + 1,
        );

        return (
          <div>
            <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
              Kéo các thẻ vào vị trí đúng:
            </Text>

            {/* Danh sách thẻ có thể kéo */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginBottom: 16,
                padding: 12,
                background: '#fafafa',
                borderRadius: 8,
                border: '1px dashed #d9d9d9',
                minHeight: 50,
              }}
            >
              {items
                .filter((item) => placed[item.id] === undefined)
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#fff',
                      border: '1px solid #1890ff',
                      borderRadius: 6,
                      cursor: 'grab',
                      userSelect: 'none',
                      color: '#1890ff',
                      fontWeight: 500,
                    }}
                  >
                    {item.content}
                  </div>
                ))}
              {items.filter((item) => placed[item.id] === undefined).length === 0 && (
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Tất cả thẻ đã được đặt
                </Text>
              )}
            </div>

            {/* Vùng thả */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {positions.map((pos) => {
                const placedItemId = Object.keys(placed).find(
                  (key) => placed[key] === pos,
                );
                const placedItem = items.find((i) => i.id === placedItemId);

                return (
                  <div
                    key={pos}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(pos, q.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      background: placedItem ? '#e6f4ff' : '#fafafa',
                      border: `2px dashed ${placedItem ? '#1890ff' : '#d9d9d9'}`,
                      borderRadius: 8,
                      minHeight: 44,
                      transition: 'all 0.2s',
                    }}
                  >
                    <Tag color="blue" style={{ minWidth: 36, textAlign: 'center' }}>
                      {pos}
                    </Tag>
                    {placedItem ? (
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Text strong>{placedItem.content}</Text>
                        <Button
                          type="text"
                          size="small"
                          danger
                          onClick={() => {
                            const newPlaced = { ...placed };
                            delete newPlaced[placedItem.id];
                            handleAnswer(q.id, newPlaced);
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <Text type="secondary">Kéo thẻ vào đây</Text>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      /* ─── Sort paragraphs ─── */
      case 'sort_paragraphs': {
        const sortItems = q.sortItems || [];
        const order = getSortOrder(q.id, sortItems);
        const orderedItems = order
          .map((id) => sortItems.find((item) => item.id === id))
          .filter(Boolean) as typeof sortItems;

        return (
          <div>
            <Text type="secondary" style={{ marginBottom: 12, display: 'block' }}>
              Sắp xếp các đoạn theo thứ tự đúng bằng nút ▲ ▼:
            </Text>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {orderedItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    background: '#fff',
                    border: '1px solid #d9d9d9',
                    borderRadius: 8,
                  }}
                >
                  <Tag
                    color="geekblue"
                    style={{ minWidth: 28, textAlign: 'center' }}
                  >
                    {idx + 1}
                  </Tag>
                  <Text style={{ flex: 1 }}>{item.content}</Text>
                  <Space size={4}>
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={idx === 0}
                      onClick={() => moveItem(q.id, sortItems, idx, 'up')}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={idx === orderedItems.length - 1}
                      onClick={() => moveItem(q.id, sortItems, idx, 'down')}
                    />
                  </Space>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return <Text type="secondary">Loại câu hỏi chưa được hỗ trợ.</Text>;
    }
  };

  // ── Nhãn loại câu hỏi ────────────────────────────────
  const typeLabels: Record<string, { label: string; color: string }> = {
    single_choice: { label: 'Chọn một', color: 'blue' },
    multiple_choice: { label: 'Chọn nhiều', color: 'purple' },
    fill_in_blank: { label: 'Điền vào chỗ trống', color: 'cyan' },
    true_false: { label: 'Đúng / Sai', color: 'orange' },
    drag_and_drop: { label: 'Kéo & thả', color: 'magenta' },
    sort_paragraphs: { label: 'Sắp xếp', color: 'geekblue' },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* ═══ HEADER ═══ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          📝 Bài tập: {practice.lessonTitle}
        </Title>
        <Space
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#2E75B6',
          }}
        >
          <ClockCircleOutlined />
          {timeStr}
        </Space>
      </div>

      {/* ═══ PROGRESS ═══ */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 4,
          }}
        >
          <Text>
            Câu {currentIndex + 1} / {totalQuestions}
          </Text>
          <Text type="secondary">
            {answeredCount}/{totalQuestions} đã trả lời
          </Text>
        </div>
        <Progress
          percent={Math.round((answeredCount / totalQuestions) * 100)}
          showInfo={false}
          strokeColor="#2E75B6"
        />
      </div>

      {/* ═══ QUESTION ═══ */}
      {currentQ && (
        <Card style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Title level={5} style={{ margin: 0 }}>
              Câu {currentIndex + 1}
            </Title>
            <Tag color={typeLabels[currentQ.type]?.color || 'default'}>
              {typeLabels[currentQ.type]?.label || currentQ.type}
            </Tag>
          </div>

          <div
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              marginBottom: 20,
              padding: '12px 16px',
              background: '#fafafa',
              borderRadius: 8,
              borderLeft: '4px solid #1890ff',
            }}
          >
            {currentQ.content}
          </div>

          {renderQuestion(currentQ)}
        </Card>
      )}

      {/* ═══ NAVIGATION ═══ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <Button
          icon={<LeftOutlined />}
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          Câu trước
        </Button>
        <Button
          type="primary"
          danger
          icon={<SendOutlined />}
          onClick={confirmSubmit}
          loading={submitting}
        >
          Nộp bài
        </Button>
        <Button
          disabled={currentIndex === totalQuestions - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
        >
          Câu tiếp <RightOutlined />
        </Button>
      </div>

      {/* ═══ DOT GRID ═══ */}
      <Card size="small" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          {questions.map((q, idx) => (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: idx === currentIndex ? 700 : 400,
                background: answers[q.id]
                  ? '#2E75B6'
                  : idx === currentIndex
                    ? '#e6f4ff'
                    : '#f0f0f0',
                color: answers[q.id] ? '#fff' : '#333',
                border:
                  idx === currentIndex
                    ? '2px solid #2E75B6'
                    : '1px solid #d9d9d9',
                transition: 'all 0.2s',
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </Card>

      {/* ═══ FLOATING CHAT BUTTON ═══ */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<MessageOutlined />}
        onClick={() => setChatOpen(true)}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          fontSize: 24,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      />

      {/* ═══ AI CHAT DRAWER ═══ */}
      <Drawer
        title="💬 Trợ lý AI"
        placement="right"
        width={400}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 0',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Card
              size="small"
              style={{
                background: '#f6f8fa',
                borderRadius: 12,
                maxWidth: '85%',
              }}
            >
              <Text>
                Bạn cần gợi ý cho câu hỏi nào không? Mình sẽ giúp bạn hiểu
                bài tốt hơn!
              </Text>
            </Card>
          </div>
          <div style={{ paddingTop: 12 }}>
            <Space.Compact style={{ width: '100%' }}>
              <input
                placeholder="Nhập câu hỏi..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px 0 0 6px',
                  outline: 'none',
                  fontSize: 14,
                }}
              />
              <Button type="primary">Gửi</Button>
            </Space.Compact>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
