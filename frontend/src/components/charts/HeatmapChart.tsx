import { Box, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';

export interface HeatmapCell {
  label: string;
  value: number;
}

export interface HeatmapRow {
  label: string;
  cells: HeatmapCell[];
}

interface HeatmapChartProps {
  rows: HeatmapRow[];
  /** Maximum value used to normalize the color scale. */
  maxValue?: number;
  /** Optional legend labels for the gradient scale. */
  showLegend?: boolean;
}

const colorFor = (value: number, max: number): string => {
  if (max <= 0) return 'rgba(109, 93, 246, 0.06)';
  const ratio = Math.min(value / max, 1);
  // Purple → teal scale, low opacity to full.
  return `rgba(80, 92, 240, ${0.08 + ratio * 0.82})`;
};

export const HeatmapChart: React.FC<HeatmapChartProps> = ({ rows, maxValue, showLegend = true }) => {
  const max = maxValue ?? Math.max(1, ...rows.flatMap((r) => r.cells.map((c) => c.value)));

  if (rows.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 160 }}>
        <Box component="span" sx={{ color: 'text.disabled', fontSize: '0.875rem' }}>
          No data yet
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {rows.map((row, rowIndex) => (
          <Box key={row.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="span"
              sx={{
                width: 84,
                flexShrink: 0,
                fontSize: '0.72rem',
                color: 'text.secondary',
                fontWeight: 600,
                textAlign: 'right',
                pr: 1,
              }}
            >
              {row.label}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {row.cells.map((cell, cellIndex) => (
                <Tooltip key={`${row.label}-${cell.label}`} title={`${cell.label}: ${cell.value.toLocaleString('en-US')}`}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, delay: rowIndex * 0.05 + cellIndex * 0.02 }}
                    style={{ flex: 1, minWidth: 14, height: 34 }}
                  >
                    <Box
                      role="img"
                      aria-label={`${row.label} ${cell.label}: ${cell.value}`}
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 1,
                        backgroundColor: colorFor(cell.value, max),
                        transition: 'transform 0.15s ease',
                        '&:hover': { transform: 'scale(1.08)' },
                      }}
                    />
                  </motion.div>
                </Tooltip>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      {showLegend && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, mt: 1.5 }}>
          <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.disabled', mr: 0.5 }}>
            Less
          </Box>
          {[0.1, 0.3, 0.55, 0.8, 1].map((ratio) => (
            <Box
              key={ratio}
              sx={{ width: 16, height: 10, borderRadius: 0.75, backgroundColor: `rgba(80, 92, 240, ${ratio * 0.9})` }}
            />
          ))}
          <Box component="span" sx={{ fontSize: '0.68rem', color: 'text.disabled', ml: 0.5 }}>
            More
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default HeatmapChart;
