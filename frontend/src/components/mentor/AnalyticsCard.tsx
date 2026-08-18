import type { ReactNode } from 'react';
import { Box, Chip, type SxProps, type Theme } from '@mui/material';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  /** Optional chip/label in the header (e.g. "+18% vs last month"). */
  badge?: string;
  badgeColor?: 'success' | 'warning' | 'info' | 'error' | 'default';
  children?: ReactNode;
  action?: ReactNode;
  sx?: SxProps<Theme>;
}

/** Card shell for charts & data visualisations with a consistent header. */
export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor = '#6D5DF6',
  badge,
  badgeColor = 'success',
  children,
  action,
  sx,
}) => {
  return (
    <Card
      sx={[
        { p: { xs: 2.5, md: 3 }, height: '100%', display: 'flex', flexDirection: 'column' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: `linear-gradient(135deg, ${iconColor}, ${iconColor}99)`,
                boxShadow: `0 6px 16px ${iconColor}40`,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {badge && <Chip size="small" label={badge} color={badgeColor} sx={{ fontWeight: 700 }} />}
          {action}
        </Box>
      </Stack>
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>{children}</Box>
    </Card>
  );
};

export default AnalyticsCard;
