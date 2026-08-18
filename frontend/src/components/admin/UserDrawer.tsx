import { Box, Button, Chip, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { AppDrawer, Avatar, Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RoleBadge } from './RoleBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/utils';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import type { AdminUser } from '@/types';

interface UserDrawerProps {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onToggleStatus: (user: AdminUser) => void;
}

const STATUS_COLOR = {
  ACTIVE: 'success',
  SUSPENDED: 'error',
  PENDING: 'warning',
  BANNED: 'error',
} as const;

export const UserDrawer: React.FC<UserDrawerProps> = ({ user, open, onClose, onToggleStatus }) => {
  if (!user) return null;
  const isSuspended = user.status !== 'ACTIVE';

  return (
    <AppDrawer open={open} onClose={onClose} title="User Profile" width={420}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* Identity */}
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Avatar firstName={user.name.split(' ')[0]} lastName={user.name.split(' ')[1]} email={user.email} size={72} />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            {user.name}
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1 }}>
            <RoleBadge role={user.role} />
            <StatusBadge label={user.status} color={STATUS_COLOR[user.status]} />
          </Stack>
          <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 1.5, color: 'text.secondary' }}>
            <EmailOutlinedIcon sx={{ fontSize: 16 }} />
            <Typography variant="body2">{user.email}</Typography>
          </Stack>
          {user.country && (
            <Stack direction="row" justifyContent="center" spacing={0.5} sx={{ mt: 0.5, color: 'text.secondary' }}>
              <LanguageOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="body2">{user.country}</Typography>
            </Stack>
          )}
        </Box>

        <Divider />

        {/* Key stats */}
        <Box sx={{ p: 3 }}>
          <Typography variant="overline" fontWeight={800} color="text.secondary">
            Statistics
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mt: 1.5 }}>
            {[
              { label: 'Sessions', value: String(user.sessionsCompleted) },
              { label: 'Total spend', value: formatCurrency(user.totalSpend) },
              { label: 'Wallet', value: `${user.walletBalance.toLocaleString('en-IN')} credits` },
              { label: 'Joined', value: formatDate(user.joinedAt) },
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {stat.label}
                </Typography>
                <Typography variant="subtitle1" fontWeight={800}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Timeline */}
        <Box sx={{ p: 3 }}>
          <Typography variant="overline" fontWeight={800} color="text.secondary">
            Activity timeline
          </Typography>
          <Stack spacing={2} sx={{ mt: 1.5 }}>
            {[
              { title: 'Last active', description: user.lastActiveAt, time: formatRelativeTime(user.lastActiveAt) },
              { title: 'Account created', description: `Signed up on ${formatDate(user.joinedAt)}`, time: formatRelativeTime(user.joinedAt) },
              { title: user.sessionsCompleted > 0 ? 'Sessions completed' : 'No sessions yet', description: user.sessionsCompleted > 0 ? `${user.sessionsCompleted} mentoring sessions attended` : 'Has not booked a session yet', time: user.sessionsCompleted > 0 ? formatRelativeTime(user.lastActiveAt) : '—' },
            ].map((item, index) => (
              <Stack key={item.title} direction="row" gap={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    mt: 0.75,
                    bgcolor: ['primary.main', 'secondary.main', 'success.main'][index % 3],
                    boxShadow: (t) => `0 0 0 4px ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.06)'}`,
                    flexShrink: 0,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {item.description}
                  </Typography>
                  <Chip size="small" label={item.time} variant="outlined" sx={{ mt: 0.5, height: 22 }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Divider />

        {/* Actions */}
        <Box sx={{ p: 3, display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant={isSuspended ? 'contained' : 'outlined'}
            color={isSuspended ? 'success' : 'error'}
            startIcon={isSuspended ? <CheckCircleOutlineOutlinedIcon /> : <BlockOutlinedIcon />}
            onClick={() => onToggleStatus(user)}
          >
            {isSuspended ? 'Activate account' : 'Suspend account'}
          </Button>
        </Box>
      </motion.div>
    </AppDrawer>
  );
};

export default UserDrawer;
