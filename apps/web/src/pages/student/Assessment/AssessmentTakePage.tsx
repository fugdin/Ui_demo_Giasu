import { Card, Radio, Checkbox, Button, Progress, Typography, Space, Modal, message } from 'antd';
import { LeftOutlined, RightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessmentApi } from '../../../services/api';

const { Title, Text } = Typography;

export default function AssessmentTakePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('assessmentSession');
    if (!stored) {
      navigate('/student/assessment', { replace: true });
      return;
    }
    const data = JSON.parse(stored);
    setSession(data);
    setTimeLeft(data.duration || 1200);
  }, [navigate]);

  const doSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await assessmentApi.submit({
        sessionId: session?.sessionId,
        answers,
      });
      sessionStorage.removeItem('assessmentSession');
      const resultId = res.data?.id || 'latest';
      navigate(`/student/assessment/result/${resultId}`, { replace: true });
    } catch {
      message.error('Không thể nộp bài');
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [session, answers, navigate]);

  // Countdown
  useEffect(() => {
    if (!session) return;
    if (timeLeft <= 0) {
      doSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, session, doSubmit]);

  const confirmSubmit = () => {
    const unanswered = (session?.questions?.length || 0) - Object.keys(answers).length;
    Modal.confirm({
      title: 'Xác nhận nộp bài',
      content:
        unanswered > 0
          ? `Bạn còn ${unanswered} câu chưa trả lời. Bạn có chắc muốn nộp bài?`
          : 'Bạn có chắc muốn nộp bài?',
      okText: 'Nộp bài',
      cancelText: 'Tiếp tục làm',
      onOk: doSubmit,
    });
  };

  if (!session) return null;

  const questions = session.questions || [];
  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLowTime = timeLeft < 120;

  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Bài đánh giá</Title>
        <Space
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: isLowTime ? '#ff4d4f' : '#2E75B6',
            animation: isLowTime ? 'pulse 1s infinite' : undefined,
          }}
        >
          <ClockCircleOutlined />
          {timeStr}
        </Space>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text>Câu {currentIndex + 1} / {totalQuestions}</Text>
          <Text type="secondary">{answeredCount}/{totalQuestions} đã trả lời</Text>
        </div>
        <Progress
          percent={Math.round((answeredCount / totalQuestions) * 100)}
          showInfo={false}
          strokeColor="#2E75B6"
        />
      </div>

      {/* Question */}
      {currentQ && (
        <Card style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 16 }}>{currentQ.content}</Title>

          {currentQ.type === 'single_choice' && (
            <Radio.Group
              value={answers[currentQ.id] as string}
              onChange={(e) => handleAnswer(currentQ.id, e.target.value)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQ.options?.map((opt: any) => (
                  <Radio
                    key={opt.id}
                    value={opt.id}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 8,
                      width: '100%',
                      background: answers[currentQ.id] === opt.id ? '#e6f4ff' : '#fff',
                    }}
                  >
                    {opt.content}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          )}

          {currentQ.type === 'multiple_choice' && (
            <Checkbox.Group
              value={(answers[currentQ.id] as string[]) || []}
              onChange={(values) => handleAnswer(currentQ.id, values as string[])}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                {currentQ.options?.map((opt: any) => (
                  <Checkbox
                    key={opt.id}
                    value={opt.id}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 8,
                      width: '100%',
                    }}
                  >
                    {opt.content}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </Card>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          icon={<LeftOutlined />}
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          Câu trước
        </Button>
        <Button type="primary" danger onClick={confirmSubmit} loading={submitting}>
          Nộp bài
        </Button>
        <Button
          disabled={currentIndex === totalQuestions - 1}
          onClick={() => setCurrentIndex((i) => i + 1)}
        >
          Câu tiếp <RightOutlined />
        </Button>
      </div>

      {/* Dot grid */}
      <Card size="small">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {questions.map((q: any, idx: number) => (
            <div
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: idx === currentIndex ? 700 : 400,
                background: answers[q.id]
                  ? '#2E75B6'
                  : idx === currentIndex
                    ? '#e6f4ff'
                    : '#f0f0f0',
                color: answers[q.id] ? '#fff' : '#333',
                border: idx === currentIndex ? '2px solid #2E75B6' : '1px solid #d9d9d9',
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
