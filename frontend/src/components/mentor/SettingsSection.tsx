import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';

interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  action?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Premium collapsible-free settings panel with a consistent icon header. */
export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  subtitle,
  icon,
  iconColor = '#6D5DF6',
  action,
  children,
  sx,
}) => {
  return (
    <Card sx={[{ p: { xs: 2.5, md: 3 } }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 42,
                height: 42,
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
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
      {children}
    </Card>
  );
};

export default SettingsSection;
