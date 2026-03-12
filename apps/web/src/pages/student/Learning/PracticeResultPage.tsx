import {
  Card, Button, Progress, Statistic, Collapse, Tag, Typography,
  Spin, Alert, Space, Row, Col, message,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, TrophyOutlined,
  ReloadOutlined, RightOutlined, HomeOutlined, RobotOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningApi } from '@/services/api';
import type { QuestionType } from '@ai-learning/types';

const { Title, Text } = Typography;

/* ── Kiểu dữ liệu ───────────────────────────────────── */
interface AnswerReview {
  questionId: string;
  questionContent: string;
  questionType: QuestionType;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

interface AttemptResult {
  attemptId: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  highestScore: number;
  attemptsUsed: number;
  maxAttempts: number;
  timeSpent: number; // seconds
  answers: AnswerReview[];
  aiAnalysis?: string;
  nextLessonId?: string;
  courseId?: string;
}

/* ── Component ───────────────────────────────────────── */
export default function PracticeResultPage() {
  const { lessonId, attemptId } = useParams<{
    lessonId: string;
    attemptId: string;
  }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Tải kết quả ───────────────────────────────────────
  useEffect(() => {
    if (!attemptId) return;
    const fetchResult = async () => {
      setLoading(true);
      try {
        const res = await learningApi.getAttemptResult(attemptId);
        setResult(res.data);
      } catch {
        message.error('Không thể tải kết quả bài tập');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  // ── Loading ───────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
        }}
      >
        <Spin size="large" tip="Đang tải kết quả..." />
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', textAlign: 'center' }}>
        <Card>
          <Title level={4}>Không tìm thấy kết quả</Title>
          <Text type="secondary">Kết quả bài tập không tồn tại.</Text>
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
          </div>
        </Card>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────
  const isPassed = result.passed;
  const scoreColor = isPassed ? '#52c41a' : '#ff4d4f';
  const remainingAttempts = result.maxAttempts - result.attemptsUsed;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m} phút ${s} giây`;
  };

  // ── Nhãn loại câu hỏi ────────────────────────────────
  const typeLabels: Record<string, string> = {
    single_choice: 'Chọn một',
    multiple_choice: 'Chọn nhiều',
    fill_in_blank: 'Điền vào chỗ trống',
    true_false: 'Đúng / Sai',
    drag_and_drop: 'Kéo & thả',
    sort_paragraphs: 'Sắp xếp',
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* ═══ RESULT BANNER ═══ */}
      <Card
        style={{
          textAlign: 'center',
          marginBottom: 24,
          background: isPassed
            ? 'linear-gradient(135deg, #f0fff4 0%, #e6fffb 100%)'
            : 'linear-gradient(135deg, #fff2f0 0%, #fff7e6 100%)',
          border: `2px solid ${isPassed ? '#b7eb8f' : '#ffccc7'}`,
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 8 }}>
          {isPassed ? '🎉' : '💪'}
        </div>
        <Title
          level={2}
          style={{
            color: scoreColor,
            margin: '0 0 8px',
          }}
        >
          {isPassed ? '✅ BẠN ĐÃ ĐẠT!' : '❌ CHƯA ĐẠT'}
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {isPassed
            ? 'Tuyệt vời! Bạn đã hoàn thành bài tập.'
            : 'Đừng nản, hãy ôn lại và thử lần nữa nhé!'}
        </Text>

        {/* Score circle */}
        <div style={{ margin: '24px 0' }}>
          <Progress
            type="circle"
            percent={result.score}
            size={160}
            strokeColor={scoreColor}
            format={(percent) => (
              <div>
                <div style={{ fontSize: 36, fontWeight: 700, color: scoreColor }}>
                  {percent}
                </div>
                <div style={{ fontSize: 14, color: '#999' }}>điểm</div>
              </div>
            )}
          />
        </div>

        {/* Thống kê */}
        <Row gutter={16} justify="center" style={{ marginBottom: 16 }}>
          <Col>
            <Statistic
              title="Điểm lần này"
              value={result.score}
              suffix="/ 100"
              valueStyle={{ color: scoreColor, fontSize: 24 }}
            />
          </Col>
          <Col>
            <Statistic
              title="Điểm cao nhất"
              value={result.highestScore}
              suffix="/ 100"
              prefix={<TrophyOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ fontSize: 24 }}
            />
          </Col>
          <Col>
            <Statistic
              title="Câu đúng"
              value={result.correctCount}
              suffix={`/ ${result.totalQuestions}`}
              valueStyle={{ fontSize: 24 }}
            />
          </Col>
        </Row>

        {/* Meta info */}
        <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
          <Text type="secondary">
            ⏱ Thời gian: {formatTime(result.timeSpent)}
          </Text>
          <Text type="secondary">
            Lần thử: {result.attemptsUsed}/{result.maxAttempts}
          </Text>
        </Space>
      </Card>

      {/* ═══ AI ANALYSIS ═══ */}
      {result.aiAnalysis && (
        <Collapse
          style={{ marginBottom: 24 }}
          items={[
            {
              key: 'ai-analysis',
              label: (
                <Space>
                  <RobotOutlined style={{ color: '#722ed1' }} />
                  <Text strong>🤖 Phân tích từ AI</Text>
                </Space>
              ),
              children: (
                <div
                  style={{
                    lineHeight: 1.8,
                    fontSize: 14,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {result.aiAnalysis}
                </div>
              ),
            },
          ]}
          defaultActiveKey={['ai-analysis']}
        />
      )}

      {/* ═══ QUESTION REVIEW ═══ */}
      <Card
        title={
          <Space>
            <Text strong style={{ fontSize: 16 }}>
              📋 Chi tiết từng câu
            </Text>
            <Tag color="blue">
              {result.correctCount} đúng / {result.totalQuestions - result.correctCount} sai
            </Tag>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Collapse
          accordion
          items={result.answers.map((answer, idx) => ({
            key: answer.questionId,
            label: (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                }}
              >
                {/* Icon đúng/sai */}
                {answer.isCorrect ? (
                  <CheckCircleOutlined
                    style={{ color: '#52c41a', fontSize: 18 }}
                  />
                ) : (
                  <CloseCircleOutlined
                    style={{ color: '#ff4d4f', fontSize: 18 }}
                  />
                )}

                {/* Số câu */}
                <Tag
                  style={{
                    minWidth: 50,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  Câu {idx + 1}
                </Tag>

                {/* Nội dung rút gọn */}
                <Text
                  ellipsis
                  style={{
                    flex: 1,
                    color: answer.isCorrect ? '#333' : '#ff4d4f',
                  }}
                >
                  {answer.questionContent}
                </Text>

                {/* Loại câu hỏi */}
                <Tag color="processing" style={{ fontSize: 11 }}>
                  {typeLabels[answer.questionType] || answer.questionType}
                </Tag>
              </div>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                {/* Nội dung câu hỏi */}
                <div
                  style={{
                    padding: '12px 16px',
                    background: '#fafafa',
                    borderRadius: 8,
                    marginBottom: 16,
                    borderLeft: '4px solid #1890ff',
                  }}
                >
                  <Text style={{ fontSize: 14, lineHeight: 1.8 }}>
                    {answer.questionContent}
                  </Text>
                </div>

                {/* Câu trả lời của bạn */}
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ marginRight: 8 }}>
                    Câu trả lời của bạn:
                  </Text>
                  <Tag
                    color={answer.isCorrect ? 'success' : 'error'}
                    icon={
                      answer.isCorrect ? (
                        <CheckCircleOutlined />
                      ) : (
                        <CloseCircleOutlined />
                      )
                    }
                    style={{ fontSize: 13, padding: '2px 10px' }}
                  >
                    {answer.userAnswer || '(Chưa trả lời)'}
                  </Tag>
                </div>

                {/* Đáp án đúng (chỉ hiện khi sai) */}
                {!answer.isCorrect && (
                  <div style={{ marginBottom: 12 }}>
                    <Text strong style={{ marginRight: 8 }}>
                      Đáp án đúng:
                    </Text>
                    <Tag
                      color="success"
                      icon={<CheckCircleOutlined />}
                      style={{ fontSize: 13, padding: '2px 10px' }}
                    >
                      {answer.correctAnswer}
                    </Tag>
                  </div>
                )}

                {/* Giải thích */}
                {answer.explanation && (
                  <Alert
                    message="Giải thích"
                    description={answer.explanation}
                    type="info"
                    showIcon
                    style={{ marginTop: 8 }}
                  />
                )}
              </div>
            ),
          }))}
        />
      </Card>

      {/* ═══ ACTION BUTTONS ═══ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}
      >
        {/* Làm lại */}
        <Button
          size="large"
          icon={<ReloadOutlined />}
          disabled={remainingAttempts <= 0}
          onClick={() => navigate(`/student/practice/${lessonId}`, { replace: true })}
        >
          Làm lại
          {remainingAttempts > 0 && (
            <Text type="secondary" style={{ marginLeft: 4, fontSize: 13 }}>
              · còn {remainingAttempts} lượt
            </Text>
          )}
        </Button>

        {/* Bài tiếp theo */}
        {result.nextLessonId && result.courseId && (
          <Button
            type="primary"
            size="large"
            icon={<RightOutlined />}
            onClick={() =>
              navigate(
                `/student/learn/${result.courseId}/${result.nextLessonId}`,
              )
            }
          >
            Bài tiếp theo
          </Button>
        )}

        {/* Quay về khóa học */}
        {result.courseId && (
          <Button
            size="large"
            icon={<HomeOutlined />}
            onClick={() => navigate(`/student/courses/${result.courseId}`)}
          >
            Quay về khóa học
          </Button>
        )}
      </div>

      {/* Cảnh báo hết lượt */}
      {remainingAttempts <= 0 && (
        <Alert
          message="Bạn đã sử dụng hết số lần thử"
          description="Hãy ôn tập lý thuyết và liên hệ giáo viên nếu cần hỗ trợ thêm."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
    </div>
  );
}
