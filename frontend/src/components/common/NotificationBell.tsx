import { useState, type MouseEvent } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Popover,
  Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectNotifications, selectUnreadCount } from '@/store/selectors';
import { markAllAsRead, markAsRead } from '@/store/slices/notificationsSlice';
import { ROUTES } from '@/constants';
import { formatRelativeTime } from '@/utils';
import { EmptyState } from '@/components/feedback';

export const NotificationBell: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const notifications = useAppSelector(selectNotifications);
  const unreadCount = useAppSelector(selectUnreadCount);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleNotificationClick = (id: string, link?: string) => {
    dispatch(markAsRead(id));
    handleClose();
    if (link) navigate(link);
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} aria-label="Notifications" size="small">
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <motion.span
              animate={unreadCount > 0 ? { rotate: [0, -8, 8, -4, 0] } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ display: 'inline-flex' }}
            >
              <NotificationsNoneIcon />
            </motion.span>
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 3, width: 380, mt: 1, overflow: 'hidden' } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.1)' : 'rgba(109,93,246,0.06)',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount > 0 ? `${unreadCount} unread` : 'You’re all caught up'}
            </Typography>
          </Box>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={() => dispatch(markAllAsRead())}
            >
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState title="No notifications yet" description="Session updates and activity will appear here." />
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.slice(0, 10).map((notification) => (
              <ListItem key={notification.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                  sx={{
                    py: 1,
                    backgroundColor: notification.read ? 'transparent' : 'action.selected',
                  }}
                >
                  <Box sx={{ mr: 1.5, fontSize: 20, flexShrink: 0 }}>
                    {notification.emoji ?? (notification.type === 'success' ? '✅' : '💬')}
                  </Box>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.read ? 500 : 700} noWrap>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                        {notification.message} · {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    }
                  />
                  {!notification.read && (
                    <Box
                      component="span"
                      sx={{ ml: 1, width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', flexShrink: 0 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => {
              handleClose();
              navigate(ROUTES.NOTIFICATIONS);
            }}
          >
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
