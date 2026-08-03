import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 180,
  strokeWidth = 20,
  centerLabel,
  centerValue,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setAnimated(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  let accumulated = 0;
  const gap = segments.length > 1 ? 0.02 : 0;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto' }}>
      <svg width={size} height={size} role="img" aria-label={segments.map((s) => s.label).join(', ')}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={strokeWidth}
        />
        {segments.map((segment, index) => {
          const fraction = segment.value / total;
          const dashLength = Math.max(fraction - gap, 0) * circumference;
          const dashOffset = -accumulated * circumference;
          accumulated += fraction;
          return (
            <circle
              key={`${segment.label}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${animated ? dashLength : 0} ${circumference}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              style={{ transition: 'stroke-dasharray 900ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            />
          );
        })}
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
        {centerValue && (
          <Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
            {centerValue}
          </Box>
        )}
        {centerLabel && (
          <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
            {centerLabel}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DonutChart;
