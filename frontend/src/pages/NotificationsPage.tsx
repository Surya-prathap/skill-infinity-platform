import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearNotifications,
  markAllAsRead,
  markAsRead,
  removeNotification,
} from '@/store/slices/notificationsSlice';
import { selectNotifications, selectUnreadCount } from '@/store/selectors';
import { PageHeader, PageTransition } from '@/components';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { formatRelativeTime } from '@/utils';
import type { AppNotification } from '@/types';

type FilterValue = 'all' | 'unread';

const dayGroup = (value: string): string => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  if (date >= weekAgo) return 'This week';
  return 'Earlier';
};

const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'];

/** Premium Notification Center — grouped, filterable, animated. */
export const NotificationsPage: React.FC = () => {
  useDocumentTitle('Notifications');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [filter, setFilter] = useState<FilterValue>('all');

  /* Notifications arrive from the real-time socket and stay empty until then. */

  const filtered = useMemo(
    () => (filter === 'unread' ? notifications.filter((notification) => !notification.read) : notifications),
    [notifications, filter],
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, AppNotification[]>();
    filtered.forEach((notification) => {
      const key = dayGroup(notification.createdAt);
      const list = groups.get(key) ?? [];
      list.push(notification);
      groups.set(key, list);
    });
    return GROUP_ORDER.filter((group) => groups.has(group)).map((group) => ({
      group,
      items: groups.get(group) ?? [],
    }));
  }, [filtered]);

  const handleOpen = (notification: AppNotification) => {
    dispatch(markAsRead(notification.id));
    if (notification.link) navigate(notification.link);
  };

  return (
    <PageTransition>
      <PageHeader
        title="Notification Center"
        subtitle="Session reminders, payments, wallet activity and community updates — all in one place."
        actions={
          <>
            {notifications.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineOutlinedIcon />}
                  onClick={() => dispatch(clearNotifications())}
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Clear all
                </Button>
                <Button variant="contained" startIcon={<DoneAllIcon />} onClick={() => dispatch(markAllAsRead())}>
                  Mark all read
                </Button>
              </>
            )}
          </>
        }
      />

      {/* Stats + filter strip */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2.5,
          flexWrap: 'wrap',
          p: 2,
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2.5 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              {notifications.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">Total</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="error.main">
              {unreadCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Unread</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} color="success.main">
              {notifications.length - unreadCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">Read</Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {(['all', 'unread'] as const).map((value) => (
            <Chip
              key={value}
              label={value === 'all' ? 'All' : `Unread (${unreadCount})`}
              size="small"
              onClick={() => setFilter(value)}
              color={filter === value ? 'primary' : 'default'}
              variant={filter === value ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: 'action.selected',
              mb: 2,
            }}
          >
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            {filter === 'unread' ? 'You’re all caught up 🎉' : 'No notifications yet'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {filter === 'unread'
              ? 'Every notification has been read.'
              : 'Book a session or join the community to see activity here.'}
          </Typography>
        </Box>
      ) : (
        grouped.map(({ group, items }) => (
          <Box key={group} sx={{ mb: 3 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 1,
                px: 0.5,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: 'text.disabled',
              }}
            >
              {group}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <AnimatePresence initial={false}>
                {items.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onOpen={() => handleOpen(notification)}
                    onDelete={() => dispatch(removeNotification(notification.id))}
                  />
                ))}
              </AnimatePresence>
            </Box>
          </Box>
        ))
      )}
    </PageTransition>
  );
};

/* ============================================================
   Notification card
   ============================================================ */

interface NotificationCardProps {
  notification: AppNotification;
  onOpen: () => void;
  onDelete: () => void;
}

const TYPE_COLOR: Record<AppNotification['type'], string> = {
  info: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onOpen, onDelete }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, x: 40, scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
  >
    <Box
      onClick={onOpen}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.75,
        borderRadius: 3,
        border: 1,
        borderColor: notification.read ? 'divider' : 'rgba(109,93,246,0.35)',
        cursor: 'pointer',
        background: notification.read ? 'background.paper' : 'action.selected',
        transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: (theme) => theme.shadows[4] as string,
          borderColor: 'primary.main',
        },
      }}
    >
      {/* Icon */}
      <Box
        sx={{
          width: 42,
          height: 42,
          minWidth: 42,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          background: `${TYPE_COLOR[notification.type]}1A`,
          border: `1px solid ${TYPE_COLOR[notification.type]}40`,
        }}
      >
        {notification.emoji ?? (notification.type === 'success' ? '✅' : '💬')}
      </Box>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" fontWeight={notification.read ? 600 : 800} noWrap sx={{ flexGrow: 1 }}>
            {notification.title}
          </Typography>
          {!notification.read && (
            <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }} />
          )}
        </Box>
        {notification.message && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.5 }}>
            {notification.message}
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
          {notification.category && (
            <Chip
              label={notification.category}
              size="small"
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, color: 'text.secondary' }}
              variant="outlined"
            />
          )}
          <Typography variant="caption" color="text.disabled">
            {formatRelativeTime(notification.createdAt)}
          </Typography>
          {notification.actionLabel && (
            <Button size="small" onClick={onOpen} sx={{ ml: 'auto', fontSize: '0.72rem' }}>
              {notification.actionLabel}
            </Button>
          )}
        </Box>
      </Box>

      <Tooltip title="Delete notification">
        <IconButton
          size="small"
          aria-label="Delete notification"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          sx={{ opacity: 0.6, '&:hover': { opacity: 1, color: 'error.main' } }}
        >
          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  </motion.div>
);

export default NotificationsPage;
