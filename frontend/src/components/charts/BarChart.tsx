import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import type { ChartPoint } from './AreaChart';

interface BarChartProps {
  data: ChartPoint[];
  height?: number;
  color?: string;
  suffix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 220,
  color = '#6D5DF6',
  suffix = '',
}) => {
  const max = Math.max(...data.map((point) => point.value), 1);

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
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1.5,
          px: 0.5,
        }}
      >
        {data.map((point, index) => {
          const percentage = (point.value / max) * 100;
          return (
            <motion.div
              key={`${point.label}-${index}`}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(percentage, 2)}%` }}
              transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              style={{ flex: 1, minWidth: 8, position: 'relative' }}
            >
              <Box
                title={`${point.label}: ${point.value.toLocaleString('en-US')}${suffix}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '8px 8px 4px 4px',
                  background: `linear-gradient(180deg, ${color}, ${color}77)`,
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                  '&:hover': { opacity: 0.8, transform: 'scaleY(1.02)' },
                  transformOrigin: 'bottom',
                }}
              />
            </motion.div>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, px: 0.5, mt: 0.75 }}>
        {data.map((point, index) => (
          <Box
            key={`${point.label}-label-${index}`}
            component="span"
            sx={{ flex: 1, fontSize: '0.7rem', color: 'text.disabled', textAlign: 'center', fontWeight: 600 }}
          >
            {point.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default BarChart;
