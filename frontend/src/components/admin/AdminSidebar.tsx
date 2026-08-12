import { useEffect } from 'react';
import { Box, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';
import { Avatar, Typography } from '@/components/ui';
import { Logo } from '@/components/common';
import { ADMIN_NAV_GROUPS, type AdminNavGroup } from '@/constants/navigation';
import { ROLE_LABELS, ROUTES } from '@/constants';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectAdminSidebarCollapsed } from '@/store/selectors';
import { setSidebarCollapsed, toggleSidebarCollapsed } from '@/store/slices/adminSlice';
import { useAuth } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { showSuccess } from '@/utils';
import type { NavItem } from '@/types';

const SIDEBAR_WIDTH = 268;
const COLLAPSED_WIDTH = 84;

const isActive = (item: NavItem, pathname: string): boolean =>
  item.end ? pathname === item.path : pathname === item.path || pathname.startsWith(`${item.path}/`);

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const SidebarContent: React.FC<{ collapsed: boolean; onNavigate?: () => void }> = ({ collapsed, onNavigate }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    await logout();
    showSuccess('You have been signed out.');
    navigate(ROUTES.HOME);
  };

  const displayName = user?.firstName || user?.username || user?.email || 'Administrator';
  const roleLabel = user?.roles?.[0] ? ROLE_LABELS[user.roles[0]] : 'Admin';

  const renderGroup = (group: AdminNavGroup, mini: boolean) => (
    <Box key={group.label} sx={{ mb: 1.5 }}>
      {!mini && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            px: 2,
            mb: 0.75,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'text.disabled',
            fontSize: '0.66rem',
          }}
        >
          {group.label}
        </Typography>
      )}
      <List disablePadding>
        {group.items.map((item) => {
          const active = isActive(item, location.pathname);
          const button = (
            <ListItemButton
              component={Link}
              to={item.path}
              selected={active}
              onClick={onNavigate}
              sx={{
                mb: 0.25,
                minHeight: 42,
                mx: mini ? 1 : 1.25,
                borderRadius: 2,
                justifyContent: mini ? 'center' : 'flex-start',
                px: mini ? 1 : 1.25,
                position: 'relative',
                '&.Mui-selected': {
                  backgroundColor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(142,128,255,0.18)' : 'rgba(109,93,246,0.12)',
                  '&:hover': {
                    backgroundColor: (t) =>
                      t.palette.mode === 'dark' ? 'rgba(142,128,255,0.26)' : 'rgba(109,93,246,0.18)',
                  },
                },
              }}
            >
              {active && (
                <Box
                  component="span"
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: 999,
                    background: 'linear-gradient(180deg, #6D5DF6, #43C6C0)',
                  }}
                />
              )}
              {mini ? (
                <Tooltip title={item.label} placement="right">
                  <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: active ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                </Tooltip>
              ) : (
                <ListItemIcon sx={{ minWidth: 38, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              {!mini && (
                <ListItemText
                  primary={
                    <Typography fontSize="0.84rem" fontWeight={active ? 700 : 500}>
                      {item.label}
                    </Typography>
                  }
                />
              )}
            </ListItemButton>
          );
          return <Box key={item.label}>{button}</Box>;
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: collapsed ? 1 : 2,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Logo showText={!collapsed} size={32} to={ROUTES.ADMIN} />
        {!collapsed && (
          <Tooltip title="Collapse sidebar">
            <IconButton size="small" onClick={() => dispatch(toggleSidebarCollapsed())} aria-label="Collapse sidebar">
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {collapsed && (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton size="small" onClick={() => dispatch(toggleSidebarCollapsed())} aria-label="Expand sidebar">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Nav */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', py: 1.5, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 999 } }}>
        {ADMIN_NAV_GROUPS.map((group) => renderGroup(group, collapsed))}
      </Box>

      {/* Environment + user */}
      <Divider />
      <Box sx={{ p: collapsed ? 1 : 1.5 }}>
        {!collapsed && (
          <Box
            sx={{
              px: 1.5,
              py: 1,
              mb: 1,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.default',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
            <Typography variant="caption" fontWeight={700}>
              Production
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              v1.0.0
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {collapsed ? (
            <Tooltip title="Sign out" placement="right">
              <IconButton onClick={handleLogout} sx={{ mx: 'auto' }} aria-label="Sign out">
                <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Avatar firstName={user?.firstName} lastName={user?.lastName} email={user?.email} size={36} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} noWrap>
                  {displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {roleLabel}
                </Typography>
              </Box>
              <Tooltip title="Sign out">
                <IconButton size="small" onClick={handleLogout} aria-label="Sign out">
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const collapsed = useAppSelector(selectAdminSidebarCollapsed);
  const dispatch = useAppDispatch();
  const width = isDesktop && collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  // When switching to a small viewport, expand the sidebar so navigation stays usable.
  useEffect(() => {
    if (!isDesktop && collapsed) dispatch(setSidebarCollapsed(false));
  }, [isDesktop, collapsed, dispatch]);

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            backgroundImage: 'none',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
          },
        }}
      >
        <SidebarContent collapsed={isDesktop && collapsed} />
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, backgroundImage: 'none' } }}
      >
        <SidebarContent collapsed={false} onNavigate={onMobileClose} />
      </Drawer>
    </>
  );
};

export default AdminSidebar;
