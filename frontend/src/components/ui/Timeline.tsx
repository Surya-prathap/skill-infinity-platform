import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { Stack } from './Stack';
import { Typography } from './Typography';

export interface TimelineItem {
  title: string;
  description?: string;
  time?: string;
  icon?: ReactNode;
  color?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <Stack spacing={0}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const color = item.color ?? '#6D5DF6';
        return (
          <Stack key={index} direction="row" gap={2} sx={{ position: 'relative' }}>
            {/* Node */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: `linear-gradient(135deg, ${color}, ${color}AA)`,
                  boxShadow: `0 4px 12px ${color}40`,
                  zIndex: 1,
                }}
              >
                {item.icon ?? (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#fff' }} />
                )}
              </Box>
              {!isLast && (
                <Box
                  sx={{
                    width: 2,
                    flexGrow: 1,
                    minHeight: 24,
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.12)'
                        : 'rgba(15,23,42,0.1)',
                  }}
                />
              )}
            </Box>
            {/* Content */}
            <Box sx={{ pb: isLast ? 0 : 2.5, minWidth: 0, pt: 0.5 }}>
              <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                <Typography variant="subtitle2" fontWeight={700}>
                  {item.title}
                </Typography>
                {item.time && (
                  <Typography variant="caption" color="text.secondary">
                    {item.time}
                  </Typography>
                )}
              </Stack>
              {item.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                  {item.description}
                </Typography>
              )}
            </Box>
          </Stack>
        );
      })}
    </Stack>
  );
};

export default Timeline;
