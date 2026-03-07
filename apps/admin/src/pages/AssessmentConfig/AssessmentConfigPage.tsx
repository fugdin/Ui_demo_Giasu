import { useState, useEffect, useCallback } from 'react';
import {
  Select,
  Card,
  Table,
  InputNumber,
  Button,
  Space,
  Typography,
  Spin,
  message,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { PageHeader } from '@ai-learning/ui';
import type {
  Field,
  AssessmentConfig,
  ScoreLevelMapping,
  LevelCourseMapping,
  Course,
} from '@ai-learning/types';
import { fieldsApi, assessmentApi, coursesApi } from '@/services/api';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

// ─── Constants ───────────────────────────────────────────────

const DEFAULT_LEVELS: ScoreLevelMapping[] = [
  { level: 'Chưa biết', minScore: 0, maxScore: 25 },
  { level: 'Cơ bản', minScore: 25, maxScore: 50 },
  { level: 'Trung cấp', minScore: 50, maxScore: 75 },
  { level: 'Thành thạo', minScore: 75, maxScore: 100 },
];

const DEFAULT_LEVEL_COURSES: LevelCourseMapping[] = [
  { level: 'Chưa biết', courseIds: [] },
  { level: 'Cơ bản', courseIds: [] },
  { level: 'Trung cấp', courseIds: [] },
  { level: 'Thành thạo', courseIds: [] },
];

// ─── Component ───────────────────────────────────────────────

export default function AssessmentConfigPage() {
  // State
  const [fields, setFields] = useState<Field[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const [configLoading, setConfigLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [scoreLevelMappings, setScoreLevelMappings] = useState<ScoreLevelMapping[]>(DEFAULT_LEVELS);
  const [levelCourseMappings, setLevelCourseMappings] = useState<LevelCourseMapping[]>(DEFAULT_LEVEL_COURSES);

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // ─── Fetch fields with assessment ──────────────────────────

  useEffect(() => {
    const fetchFields = async () => {
      setFieldsLoading(true);
      try {
        const { data } = await fieldsApi.getAll();
        setFields(data.filter((f: Field) => f.hasAssessment));
      } catch {
        message.error('Không thể tải danh sách ngành');
      } finally {
        setFieldsLoading(false);
      }
    };

    fetchFields();
  }, []);

  // ─── Fetch all courses for recommendation select ───────────

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const { data } = await coursesApi.getAll({ page: 1, pageSize: 200 });
        setCourses(data.data);
      } catch {
        // Non-critical
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ─── Fetch config when field is selected ────────────────────

  const fetchConfig = useCallback(async (fieldId: string) => {
    setConfigLoading(true);
    try {
      const { data } = await assessmentApi.getConfig(fieldId);
      if (data.scoreLevelMappings && data.scoreLevelMappings.length > 0) {
        setScoreLevelMappings(data.scoreLevelMappings);
      } else {
        setScoreLevelMappings(DEFAULT_LEVELS);
      }
      if (data.levelCourseMappings && data.levelCourseMappings.length > 0) {
        setLevelCourseMappings(data.levelCourseMappings);
      } else {
        setLevelCourseMappings(DEFAULT_LEVEL_COURSES);
      }
    } catch {
      // If no config exists yet, use defaults
      setScoreLevelMappings(DEFAULT_LEVELS);
      setLevelCourseMappings(DEFAULT_LEVEL_COURSES);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedFieldId) {
      fetchConfig(selectedFieldId);
    }
  }, [selectedFieldId, fetchConfig]);

  // ─── Score level update handler ─────────────────────────────

  const updateScoreLevel = (index: number, field: 'minScore' | 'maxScore', value: number | null) => {
    if (value === null) return;
    setScoreLevelMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ─── Level course update handler ────────────────────────────

  const updateLevelCourses = (level: string, courseIds: string[]) => {
    setLevelCourseMappings((prev) =>
      prev.map((m) => (m.level === level ? { ...m, courseIds } : m)),
    );
  };

  // ─── Validation ─────────────────────────────────────────────

  const validateRanges = (): boolean => {
    for (let i = 0; i < scoreLevelMappings.length; i++) {
      const mapping = scoreLevelMappings[i];
      if (mapping.minScore >= mapping.maxScore) {
        message.error(`Level "${mapping.level}": Điểm từ phải nhỏ hơn Điểm đến`);
        return false;
      }
      if (i > 0 && mapping.minScore !== scoreLevelMappings[i - 1].maxScore) {
        message.error(
          `Khoảng điểm không liên tục giữa "${scoreLevelMappings[i - 1].level}" và "${mapping.level}"`,
        );
        return false;
      }
    }
    if (scoreLevelMappings[0].minScore !== 0) {
      message.error('Khoảng điểm phải bắt đầu từ 0');
      return false;
    }
    if (scoreLevelMappings[scoreLevelMappings.length - 1].maxScore !== 100) {
      message.error('Khoảng điểm phải kết thúc ở 100');
      return false;
    }
    return true;
  };

  // ─── Save ───────────────────────────────────────────────────

  const handleSave = async () => {
    if (!selectedFieldId) {
      message.error('Vui lòng chọn ngành');
      return;
    }
    if (!validateRanges()) return;

    setSaving(true);
    try {
      const selectedField = fields.find((f) => f.id === selectedFieldId);
      const config: AssessmentConfig = {
        fieldId: selectedFieldId,
        fieldName: selectedField?.name ?? '',
        scoreLevelMappings,
        levelCourseMappings,
      };
      await assessmentApi.saveConfig(config);
      message.success('Đã lưu cấu hình đánh giá');
    } catch {
      message.error('Không thể lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  // ─── Score table columns ────────────────────────────────────

  const scoreLevelColumns: ColumnsType<ScoreLevelMapping> = [
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      width: 160,
    },
    {
      title: 'Điểm từ',
      dataIndex: 'minScore',
      key: 'minScore',
      width: 150,
      render: (value: number, _record, index) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(v) => updateScoreLevel(index, 'minScore', v)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Điểm đến',
      dataIndex: 'maxScore',
      key: 'maxScore',
      width: 150,
      render: (value: number, _record, index) => (
        <InputNumber
          min={0}
          max={100}
          value={value}
          onChange={(v) => updateScoreLevel(index, 'maxScore', v)}
          style={{ width: '100%' }}
        />
      ),
    },
  ];

  // ─── Course options ─────────────────────────────────────────

  // ─── Course options grouped by field ────────────────────

  const courseOptions = (() => {
    const groups: Record<string, { value: string; label: string }[]> = {};
    for (const c of courses) {
      const fieldName = c.fieldName || 'Khác';
      if (!groups[fieldName]) groups[fieldName] = [];
      groups[fieldName].push({ value: c.id, label: c.title });
    }
    return Object.entries(groups).map(([label, options]) => ({ label, options }));
  })();

  // ─── Render ─────────────────────────────────────────────────

  return (
    <>
      <PageHeader title="Cấu hình đánh giá năng lực" />

      {/* Field selector */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Typography.Text strong>Chọn ngành</Typography.Text>
          <Select
            placeholder="Chọn ngành có đánh giá năng lực"
            loading={fieldsLoading}
            value={selectedFieldId}
            onChange={setSelectedFieldId}
            style={{ width: 400 }}
            options={fields.map((f) => ({ value: f.id, label: f.name }))}
            showSearch
            optionFilterProp="label"
          />
        </Space>
      </Card>

      {selectedFieldId && (
        <Spin spinning={configLoading}>
          {/* Section 1: Score → Level Mapping */}
          <Card title="Mapping Điểm → Level" style={{ marginBottom: 24 }}>
            <Table<ScoreLevelMapping>
              rowKey="level"
              columns={scoreLevelColumns}
              dataSource={scoreLevelMappings}
              pagination={false}
              size="middle"
            />
          </Card>

          {/* Section 2: Recommended courses per level */}
          <Card title="Khóa học đề xuất theo level" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {levelCourseMappings.map((mapping) => (
                <div key={mapping.level}>
                  <Title level={5} style={{ marginBottom: 8 }}>
                    {mapping.level}
                  </Title>
                  <Select
                    mode="multiple"
                    placeholder="Chọn khóa học đề xuất"
                    loading={coursesLoading}
                    value={mapping.courseIds}
                    onChange={(ids) => updateLevelCourses(mapping.level, ids)}
                    style={{ width: '100%' }}
                    options={courseOptions}
                    showSearch
                    optionFilterProp="label"
                    virtual
                  />
                </div>
              ))}
            </Space>
          </Card>

          {/* Save button */}
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={saving}
              onClick={handleSave}
            >
              Lưu cấu hình
            </Button>
          </div>
        </Spin>
      )}
    </>
  );
}
