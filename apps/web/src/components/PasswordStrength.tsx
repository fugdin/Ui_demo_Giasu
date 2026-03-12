import { Progress, Typography } from 'antd';

const { Text } = Typography;

interface Props {
  password: string;
}

export default function PasswordStrength({ password }: Props) {
  const getStrength = (pwd: string): { percent: number; label: string; color: string } => {
    if (!pwd) return { percent: 0, label: '', color: '#d9d9d9' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 1) return { percent: 20, label: 'Yếu', color: '#ff4d4f' };
    if (score <= 2) return { percent: 40, label: 'Trung bình', color: '#faad14' };
    if (score <= 3) return { percent: 70, label: 'Khá', color: '#1890ff' };
    return { percent: 100, label: 'Mạnh', color: '#52c41a' };
  };

  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: -8, marginBottom: 8 }}>
      <Progress percent={strength.percent} showInfo={false} strokeColor={strength.color} size="small" />
      <Text style={{ fontSize: 12, color: strength.color }}>{strength.label}</Text>
    </div>
  );
}
