import { useMemo } from 'react';
import { Box, Tooltip } from '@mui/material';

interface ContributionGraphProps {
  /** Map of 'YYYY-MM-DD' → contribution count. */
  data: Record<string, number>;
  weeks?: number;
}

const LEVELS = [
  'rgba(109,93,246,0.08)',
  'rgba(109,93,246,0.28)',
  'rgba(109,93,246,0.52)',
  'rgba(109,93,246,0.75)',
  '#6D5DF6',
];

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** GitHub-style contribution heatmap. */
export const ContributionGraph: React.FC<ContributionGraphProps> = ({ data, weeks = 16 }) => {
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(start.getDate() - weeks * 7 + 1);
    // Align so the first column starts on a Sunday.
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

    const grid: Array<{ key: string; date: Date; count: number }[]> = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const column: Array<{ key: string; date: Date; count: number }> = [];
      for (let day = 0; day < 7; day += 1) {
        const date = new Date(cursor);
        const key = date.toISOString().slice(0, 10);
        const isFuture = date > today;
        column.push({ key, date, count: isFuture ? 0 : data[key] ?? 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      grid.push(column);
    }
    return grid;
  }, [data, weeks]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 0.4 }}>
        {/* Day labels */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, mr: 0.4, pt: 0 }}>
          {DAY_KEYS.map((day, index) => (
            <Box key={day} sx={{ height: 11, fontSize: '0.6rem', color: 'text.disabled', fontWeight: 600, lineHeight: '11px', display: index % 2 === 0 ? 'block' : 'none' }}>
              {index % 2 === 0 ? day : ''}
            </Box>
          ))}
        </Box>
        {/* Heatmap */}
        <Box sx={{ display: 'flex', gap: 0.4, overflowX: 'auto', pb: 0.5 }}>
          {cells.map((column, columnIndex) => (
            <Box key={columnIndex} sx={{ display: 'flex', flexDirection: 'column', gap: 0.4 }}>
              {column.map((cell) => (
                <Tooltip key={cell.key} title={`${cell.count} activity · ${cell.key}`} arrow>
                  <Box
                    sx={{
                      width: 11,
                      height: 11,
                      borderRadius: 0.7,
                      background: LEVELS[Math.min(cell.count, 4)],
                      transition: 'transform 0.12s ease, background-color 0.2s ease',
                      '&:hover': { transform: 'scale(1.35)', outline: '1px solid rgba(109,93,246,0.4)' },
                      ...(cell.count === 0 && { background: 'action.hover' }),
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: 'flex-end', mt: 0.5 }}>
        <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 600 }}>
          Less
        </Box>
        {LEVELS.map((level, index) => (
          <Box key={index} sx={{ width: 11, height: 11, borderRadius: 0.7, background: level }} />
        ))}
        <Box component="span" sx={{ fontSize: '0.65rem', color: 'text.disabled', fontWeight: 600 }}>
          More
        </Box>
      </Box>
    </Box>
  );
};

export default ContributionGraph;
