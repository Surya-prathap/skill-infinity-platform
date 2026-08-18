import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { AnimatedNumber } from './AnimatedNumber';
import { Typography } from './Typography';

interface ProfileCompletionRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

const clamp = (value: number): number => Math.min(100, Math.max(0, value));

export const ProfileCompletionRing: React.FC<ProfileCompletionRingProps> = ({
  value,
  size = 160,
  strokeWidth = 12,
  label = 'Complete',
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setProgress(clamp(value)));
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  const offset = circumference * (1 - progress / 100);
  const gradientId = `completion-ring-${size}`;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} role="img" aria-label={`Profile completion ${value}%`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6D5DF6" />
            <stop offset="100%" stopColor="#43C6C0" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.12}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <AnimatedNumber value={progress} suffix="%" variant="h4" fontWeight={800} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        {sublabel && (
          <Typography variant="caption" color="text.disabled">
            {sublabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProfileCompletionRing;
