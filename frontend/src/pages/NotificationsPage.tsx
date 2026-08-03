import { Box, Button, IconButton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddAlertOutlinedIcon from '@mui/icons-material/AddAlertOutlined';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addNotification,
  clearNotifications,
  markAllAsRead,
  markAsRead,
  removeNotification,
} from '@/store/slices/notificationsSlice';
import { selectNotifications } from '@/store/selectors';
import { Card, EmptyState, PageHeader } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { formatRelativeTime } from '@/utils';
import type { AppNotification } from '@/types';

const TYPE_EMOJI: Record<AppNotification['type'], string> = {
  info: '💡',
  success: '✅',
  warning: '⚠️',
  error: '⛔',
};

export const NotificationsPage: React.FC = () => {
  useDocumentTitle('Notifications');
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  const addSample = () => {
    dispatch(
      addNotification({
        id: `n-${Date.now()}`,
        title: 'Welcome to Skill Infinity!',
        message: 'Your account is ready — book your first session to get started.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
      }),
    );
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Stay up to date with your sessions, wallet and community."
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<AddAlertOutlinedIcon />}
              onClick={addSample}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Add sample
            </Button>
            {notifications.length > 0 && (
              <Button variant="contained" startIcon={<DoneAllIcon />} onClick={() => dispatch(markAllAsRead())}>
                Mark all read
              </Button>
            )}
          </>
        }
      />

      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        {notifications.length === 0 ? (
          <EmptyState
            icon={<AddAlertOutlinedIcon />}
            title="No notifications yet"
            description="When something happens — a session booking, wallet credit or community reply — it will show up here."
            actionLabel="Add a sample notification"
            onAction={addSample}
          />
        ) : (
          <Stack spacing={1.5}>
            {notifications.map((notification) => (
              <Box
                key={notification.id}
                onClick={() => dispatch(markAsRead(notification.id))}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  backgroundColor: notification.read ? 'transparent' : 'action.selected',
                  transition: 'background-color 0.2s ease',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ fontSize: 22, lineHeight: 1 }}>{TYPE_EMOJI[notification.type]}</Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={notification.read ? 600 : 800}>
                    {notification.title}
                    {!notification.read && (
                      <Box component="span" sx={{ ml: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', display: 'inline-block' }} />
                    )}
                  </Typography>
                  {notification.message && (
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.disabled">
                    {formatRelativeTime(notification.createdAt)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  aria-label="Delete notification"
                  onClick={(event) => {
                    event.stopPropagation();
                    dispatch(removeNotification(notification.id));
                  }}
                >
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="text"
              color="error"
              onClick={() => dispatch(clearNotifications())}
              sx={{ alignSelf: 'flex-start' }}
            >
              Clear all
            </Button>
          </Stack>
        )}
      </Card>
    </Box>
  );
};

export default NotificationsPage;
