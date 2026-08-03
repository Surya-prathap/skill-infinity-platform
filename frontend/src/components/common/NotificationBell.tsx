import { useState, type MouseEvent } from 'react';
import { Badge, Box, Button, Divider, IconButton, List, ListItem, ListItemButton,  ListItemText,
  Popover, Tooltip } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
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

  const handleNotificationClick = (id: string) => {
    dispatch(markAsRead(id));
    handleClose();
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton onClick={handleOpen} aria-label="Notifications" size="small">
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 3, width: 360, mt: 1 } } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={() => dispatch(markAllAsRead())}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState title="You're all caught up" description="New notifications will appear here." />
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.slice(0, 8).map((notification) => (
              <ListItem key={notification.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNotificationClick(notification.id)}
                  sx={{
                    py: 1,
                    backgroundColor: notification.read ? 'transparent' : 'action.selected',
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notification.read ? 500 : 700}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {notification.message} · {formatRelativeTime(notification.createdAt)}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
        <Divider />
        <Box sx={{ p: 1 }}>
          <Button fullWidth size="small" onClick={() => { handleClose(); navigate(ROUTES.NOTIFICATIONS); }}>
            View all notifications
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
