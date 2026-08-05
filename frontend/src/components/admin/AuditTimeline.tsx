import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Stack, Typography } from '@/components/ui';
import { formatRelativeTime } from '@/utils';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import type { AuditActionCategory, AuditLog } from '@/types';

const CATEGORY_META: Record<AuditActionCategory, { color: string; icon: React.ReactNode }> = {
  ADMIN: { color: '#6D5DF6', icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 16 }} /> },
  PAYMENT: { color: '#F59E0B', icon: <PaymentOutlinedIcon sx={{ fontSize: 16 }} /> },
  MODERATION: { color: '#EF4444', icon: <GavelOutlinedIcon sx={{ fontSize: 16 }} /> },
  SETTINGS: { color: '#3B82F6', icon: <SettingsOutlinedIcon sx={{ fontSize: 16 }} /> },
  AUTH: { color: '#14B8A6', icon: <LockOutlinedIcon sx={{ fontSize: 16 }} /> },
  ROLE: { color: '#A855F7', icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} /> },
  SYSTEM: { color: '#64748B', icon: <MonitorHeartOutlinedIcon sx={{ fontSize: 16 }} /> },
};

interface AuditTimelineProps {
  logs: AuditLog[];
  limit?: number;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ logs, limit = 12 }) => {
  const items = logs.slice(0, limit);

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No audit activity yet.
      </Typography>
    );
  }

  return (
    <Stack spacing={0}>
      {items.map((log, index) => {
        const meta = CATEGORY_META[log.category] ?? CATEGORY_META.SYSTEM;
        const isLast = index === items.length - 1;
        return (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.05 }}
          >
            <Stack direction="row" gap={2} sx={{ position: 'relative' }}>
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
                    background: `linear-gradient(135deg, ${meta.color}, ${meta.color}AA)`,
                    boxShadow: `0 4px 12px ${meta.color}40`,
                    zIndex: 1,
                  }}
                >
                  {meta.icon}
                </Box>
                {!isLast && (
                  <Box sx={{ width: 2, flexGrow: 1, minHeight: 18, bgcolor: 'divider' }} />
                )}
              </Box>
              <Box sx={{ pb: isLast ? 0 : 2, minWidth: 0, pt: 0.25 }}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                    {log.action.replace(/_/g, ' ').toLowerCase()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatRelativeTime(log.createdAt)}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {log.description}
                </Typography>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                  <Typography variant="caption" fontWeight={700} color={meta.color}>
                    {log.adminName}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {log.ipAddress}
                  </Typography>
                  {log.newValue && (
                    <Typography variant="caption" sx={{ px: 0.75, py: 0.15, borderRadius: 999, bgcolor: 'action.selected', fontWeight: 700 }}>
                      {log.newValue}
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </motion.div>
        );
      })}
    </Stack>
  );
};

export default AuditTimeline;
