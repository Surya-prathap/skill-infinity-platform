import { useId, useMemo } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Fills the area under the line. */
  area?: boolean;
  ariaLabel?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 36,
  color = '#6D5DF6',
  area = true,
  ariaLabel = 'Sparkline',
}) => {
  const gradientId = useId().replace(/:/g, '');

  const path = useMemo<{ line: string; fill: string }>(() => {
    if (data.length < 2) return { line: '', fill: '' };
    const max = Math.max(...data, 1) * 1.1;
    const min = Math.min(...data, 0);
    const range = Math.max(max - min, 1);
    const step = width / (data.length - 1);
    const points = data.map((value, index) => [
      index * step,
      height - 3 - ((value - min) / range) * (height - 6),
    ] as [number, number]);
    const d = points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    const fill = `${d} L ${width} ${height} L 0 ${height} Z`;
    return { line: d, fill };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <Box sx={{ width, height, display: 'flex', alignItems: 'center' }}>
        <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.disabled' }}>
          —
        </Box>
      </Box>
    );
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {area && <motion.path d={path.fill} fill={`url(#${gradientId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.4 }} />}
      <motion.path
        d={path.line}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      />
    </svg>
  );
};

export default Sparkline;
