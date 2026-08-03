import { useId, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export interface ChartPoint {
  label: string;
  value: number;
}

interface AreaChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  suffix?: string;
}

const W = 600;
const H = 220;
const PAD_X = 10;
const PAD_TOP = 18;
const PAD_BOTTOM = 24;

const smoothPath = (points: Array<[number, number]>): string => {
  if (points.length < 2) return '';
  const d: string[] = [`M ${points[0][0]} ${points[0][1]}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d.push(`C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`);
  }
  return d.join(' ');
};

export const AreaChart: React.FC<AreaChartProps> = ({ data, height = 260, color = '#6D5DF6', suffix = '' }) => {
  const gradientId = useId().replace(/:/g, '');
  const [active, setActive] = useState<number | null>(null);

  const { line, area, xs } = useMemo(() => {
    const values = data.map((point) => point.value);
    const max = Math.max(...values, 1) * 1.15;
    const x = (i: number) =>
      values.length === 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (values.length - 1);
    const y = (value: number) =>
      PAD_TOP + (1 - value / max) * (H - PAD_TOP - PAD_BOTTOM);
    const points = data.map((point, i) => [x(i), y(point.value)] as [number, number]);
    return {
      line: smoothPath(points),
      area: points.length
        ? `${smoothPath(points)} L ${points[points.length - 1][0]} ${H - PAD_BOTTOM} L ${points[0][0]} ${H - PAD_BOTTOM} Z`
        : '',
      xs: data.map((_, i) => x(i)),
    };
  }, [data]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (xs.length === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const scaledX = ratio * W;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    xs.forEach((xValue, index) => {
      const distance = Math.abs(xValue - scaledX);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });
    setActive(closest);
  };

  if (data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
          No data yet
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height, display: 'block', touchAction: 'none' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActive(null)}
          role="img"
          aria-label={`Area chart: ${data.map((point) => `${point.label} ${point.value}`).join(', ')}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.34} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid */}
          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={PAD_TOP + fraction * (H - PAD_TOP - PAD_BOTTOM)}
              y2={PAD_TOP + fraction * (H - PAD_TOP - PAD_BOTTOM)}
              stroke="currentColor"
              strokeOpacity={0.08}
              strokeDasharray="4 6"
            />
          ))}

          {/* Area fill */}
          {area && (
            <motion.path
              d={area}
              fill={`url(#${gradientId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            />
          )}

          {/* Line */}
          {line && (
            <motion.path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}

          {/* Hover marker */}
          {active !== null && data[active] && (
            <line
              x1={xs[active]}
              x2={xs[active]}
              y1={PAD_TOP - 6}
              y2={H - PAD_BOTTOM}
              stroke={color}
              strokeOpacity={0.35}
              strokeDasharray="3 4"
            />
          )}
        </svg>

        {/* Hover tooltip */}
        {active !== null && data[active] && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: `calc(${(xs[active] / W) * 100}% )`,
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              boxShadow: 4,
              pointerEvents: 'none',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', display: 'block' }}>
              {data[active].label}
            </Box>
            <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 800, color }}>
              {data[active].value.toLocaleString('en-US')}
              {suffix}
            </Box>
          </Box>
        )}
      </Box>

      {/* X labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mt: 0.75 }}>
        {data.map((point) => (
          <Box
            key={point.label}
            component="span"
            sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 600 }}
          >
            {point.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AreaChart;
