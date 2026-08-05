import { useId, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import type { ChartPoint } from './AreaChart';

export interface LineSeries {
  name: string;
  color: string;
  points: ChartPoint[];
}

interface LineChartProps {
  series: LineSeries[];
  height?: number;
  suffix?: string;
  /** Fills the area under each line. */
  area?: boolean;
}

const W = 640;
const H = 240;
const PAD_X = 12;
const PAD_TOP = 18;
const PAD_BOTTOM = 26;

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

export const LineChart: React.FC<LineChartProps> = ({ series, height = 260, suffix = '', area = true }) => {
  const gradientId = useId().replace(/:/g, '');
  const [active, setActive] = useState<number | null>(null);

  const labels = series[0]?.points.map((p) => p.label) ?? [];
  const count = labels.length;

  const { paths, xs } = useMemo(() => {
    const max = Math.max(
      1,
      ...series.flatMap((s) => s.points.map((p) => p.value)),
    ) * 1.12;
    const x = (i: number) => (count <= 1 ? W / 2 : PAD_X + (i * (W - PAD_X * 2)) / (count - 1));
    const y = (value: number) => PAD_TOP + (1 - value / max) * (H - PAD_TOP - PAD_BOTTOM);

    const nextPaths = series.map((s) => {
      const pts = s.points.map((p, i) => [x(i), y(p.value)] as [number, number]);
      return { line: smoothPath(pts), fill: pts.length ? `${smoothPath(pts)} L ${pts[pts.length - 1][0]} ${H - PAD_BOTTOM} L ${pts[0][0]} ${H - PAD_BOTTOM} Z` : '' };
    });
    return { paths: nextPaths, xs: labels.map((_, i) => x(i)) };
  }, [series, count, labels]);

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

  if (count === 0) {
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
          aria-label={`Line chart: ${series.map((s) => s.name).join(', ')}`}
        >
          <defs>
            {series.map((s) => (
              <linearGradient key={s.name} id={`${gradientId}-${s.name}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>

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

          {paths.map((path, seriesIndex) => (
            <g key={series[seriesIndex].name}>
              {area && path.fill && (
                <motion.path
                  d={path.fill}
                  fill={`url(#${gradientId}-${series[seriesIndex].name})`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.3 + seriesIndex * 0.15 }}
                />
              )}
              <motion.path
                d={path.line}
                fill="none"
                stroke={series[seriesIndex].color}
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, delay: seriesIndex * 0.15, ease: 'easeOut' }}
              />
            </g>
          ))}

          {active !== null && (
            <line
              x1={xs[active]}
              x2={xs[active]}
              y1={PAD_TOP - 6}
              y2={H - PAD_BOTTOM}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeDasharray="3 4"
            />
          )}
        </svg>

        {active !== null && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: `calc(${(xs[active] / W) * 100}%)`,
              transform: 'translateX(-50%)',
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              px: 1.5,
              py: 1,
              boxShadow: 4,
              pointerEvents: 'none',
              zIndex: 2,
              whiteSpace: 'nowrap',
            }}
          >
            <Box component="span" sx={{ fontSize: '0.72rem', color: 'text.secondary', display: 'block', mb: 0.5 }}>
              {labels[active]}
            </Box>
            {series.map((s) => (
              <Box key={s.name} component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.8rem', fontWeight: 700 }}>
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color, flexShrink: 0 }} />
                {s.name}: {s.points[active]?.value.toLocaleString('en-US')}{suffix}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mt: 0.75 }}>
        {labels.map((label) => (
          <Box key={label} component="span" sx={{ fontSize: '0.7rem', color: 'text.disabled', fontWeight: 600 }}>
            {label}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LineChart;
