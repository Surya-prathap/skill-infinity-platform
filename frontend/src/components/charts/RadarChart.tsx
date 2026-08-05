import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export interface RadarAxis {
  label: string;
  value: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  height?: number;
  color?: string;
  /** Optional secondary dataset drawn as a dashed outline. */
  secondary?: { label: string; color: string; axes: RadarAxis[] };
  max?: number;
}

const toPolygon = (axes: RadarAxis[], cx: number, cy: number, radius: number, max: number): string => {
  const points = axes.map((axis, index) => {
    const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
    const r = (Math.min(axis.value, max) / max) * radius;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });
  return points.join(' ');
};

export const RadarChart: React.FC<RadarChartProps> = ({ axes, height = 260, color = '#6D5DF6', secondary, max = 100 }) => {
  const size = Math.min(height, 320);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 38;
  const levels = 4;

  if (axes.length === 0) {
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
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height, display: 'block' }} role="img" aria-label={`Radar chart: ${axes.map((a) => a.label).join(', ')}`}>
        {/* Level rings */}
        {Array.from({ length: levels }).map((_, level) => {
          const ringRadius = (radius * (level + 1)) / levels;
          return (
            <polygon
              key={level}
              points={toPolygon(axes, cx, cy, ringRadius, max)}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis spokes */}
        {axes.map((axis, index) => {
          const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
          return (
            <line
              key={axis.label}
              x1={cx}
              y1={cy}
              x2={cx + radius * Math.cos(angle)}
              y2={cy + radius * Math.sin(angle)}
              stroke="currentColor"
              strokeOpacity={0.08}
            />
          );
        })}

        {/* Secondary dataset */}
        {secondary && (
          <motion.polygon
            points={toPolygon(secondary.axes, cx, cy, radius, max)}
            fill={secondary.color}
            fillOpacity={0.05}
            stroke={secondary.color}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          />
        )}

        {/* Primary dataset */}
        <motion.polygon
          points={toPolygon(axes, cx, cy, radius, max)}
          fill={color}
          fillOpacity={0.18}
          stroke={color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: '50% 50%' }}
        />

        {/* Vertex dots + labels */}
        {axes.map((axis, index) => {
          const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
          const r = (Math.min(axis.value, max) / max) * radius;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const labelR = radius + 18;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          return (
            <g key={axis.label}>
              <circle cx={x} cy={y} r={3.5} fill={color} />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fontSize={10}
                fontWeight={600}
                opacity={0.75}
              >
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export default RadarChart;
