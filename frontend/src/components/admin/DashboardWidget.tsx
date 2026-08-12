import type { ReactNode } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Card, Stack, Typography } from '@/components/ui';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  index?: number;
  /** Renders a standard "more" menu trigger (visual only). */
  more?: boolean;
  sx?: object;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
  index = 0,
  more = false,
  sx,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      <Card sx={{ p: 2.5, height: '100%', ...sx }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          {icon && (
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                bgcolor: 'action.selected',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions}
          {more && (
            <Tooltip title="More options">
              <IconButton size="small" aria-label={`${title} more options`}>
                <MoreHorizIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {children}
      </Card>
    </motion.div>
  );
};

export default DashboardWidget;
