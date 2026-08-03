import { useState, type MouseEvent } from 'react';
import { Avatar as MuiAvatar, Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Avatar } from '@/components/ui';
import { ROUTES } from '@/constants';
import { ROLE_LABELS } from '@/constants';
import { showSuccess } from '@/utils';
import type { Role } from '@/types';

export const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleClose();
    await logout();
    showSuccess('You have been signed out.');
    navigate(ROUTES.HOME);
  };

  const displayName = user?.firstName || user?.username || user?.email || 'User';
  const primaryRole: Role | undefined = user?.roles?.[0];

  return (
    <>
      <IconButton onClick={handleOpen} aria-label="Account menu" size="small" sx={{ p: 0.25 }}>
        <Avatar
          firstName={user?.firstName}
          lastName={user?.lastName}
          email={user?.email}
          size={36}
        />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 240, mt: 1 } } }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <MuiAvatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
            <PersonOutlineOutlinedIcon />
          </MuiAvatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {primaryRole ? ROLE_LABELS[primaryRole] : user?.email}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            navigate(ROUTES.PROFILE);
          }}
        >
          <ListItemIcon>
            <PersonOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            navigate(ROUTES.SETTINGS);
          }}
        >
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ProfileMenu;
