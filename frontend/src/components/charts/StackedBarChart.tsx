import { Box } from '@mui/material';
import { motion } from 'framer-motion';

export interface StackedBarSegment {
  name: string;
  value: number;
  color: string;
}

export interface StackedBarDatum {
  label: string;
  segments: StackedBarSegment[];
}

interface StackedBarChartProps {
  data: StackedBarDatum[];
  height?: number;
  suffix?: string;
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({ data, height = 240, suffix = '' }) => {
  const totals = data.map((datum) => datum.segments.reduce((sum, s) => sum + s.value, 0));
  const max = Math.max(...totals, 1);

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
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.25, height, px: 0.5 }}>
        {data.map((datum, index) => (
          <motion.div
            key={datum.label}
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((totals[index] / max) * 100, 2)}%` }}
            transition={{ duration: 0.7, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, minWidth: 10, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
          >
            <Box
              sx={{
                width: '100%',
                borderRadius: '8px 8px 4px 4px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                minHeight: 4,
              }}
              title={`${datum.label}: ${totals[index].toLocaleString('en-US')}${suffix}`}
            >
              {datum.segments.map((segment) => {
                const fraction = totals[index] > 0 ? segment.value / totals[index] : 0;
                return (
                  <Box
                    key={segment.name}
                    sx={{
                      width: '100%',
                      height: `${fraction * 100}%`,
                      backgroundColor: segment.color,
                      transition: 'opacity 0.15s ease',
                      '&:hover': { opacity: 0.85 },
                    }}
                    title={`${segment.name}: ${segment.value.toLocaleString('en-US')}${suffix}`}
                  />
                );
              })}
            </Box>
          </motion.div>
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 1.25, px: 0.5, mt: 0.75 }}>
        {data.map((datum) => (
          <Box
            key={`${datum.label}-label`}
            component="span"
            sx={{ flex: 1, fontSize: '0.7rem', color: 'text.disabled', textAlign: 'center', fontWeight: 600 }}
          >
            {datum.label}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default StackedBarChart;
