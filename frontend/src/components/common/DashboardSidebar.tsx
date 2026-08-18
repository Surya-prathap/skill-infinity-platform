import { useEffect, useState } from 'react';
import { Box, Collapse, Divider, Drawer as MuiDrawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/hooks';
import { getPrimaryRole, ROLE_LABELS, ROUTES } from '@/constants';
import { showSuccess } from '@/utils';
import type { NavItem } from '@/types';

interface DashboardSidebarProps {
  items: NavItem[];
  open: boolean;
  onClose: () => void;
  width?: number;
  collapsedWidth?: number;
}

const isItemActive = (item: NavItem, pathname: string): boolean => {
  if (item.end) return pathname === item.path;
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  items,
  open,
  onClose,
  width = 264,
  collapsedWidth = 78,
}) => {
  const { user, roles, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredItems = items.filter(
    (item) => !item.roles || item.roles.some((role) => roles.includes(role)),
  );

  const handleLogout = async () => {
    await logout();
    showSuccess('You have been signed out.');
    navigate(ROUTES.HOME);
  };

  // Auto-expand the section whose child matches the current route.
  useEffect(() => {
    const activeParent = filteredItems.find((item) =>
      item.children?.some((child) => isItemActive(child, location.pathname)),
    );
    if (activeParent) {
      setExpanded((current) => current ?? activeParent.label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const displayName = user?.firstName || user?.username || user?.email || 'Member';
  // Roles are unordered — resolve the most privileged one (e.g. a mentor who
  // still carries ROLE_LEARNER must be labelled "Mentor", not "Learner").
  const roleLabel = ROLE_LABELS[getPrimaryRole(roles)];

  const renderNavItem = (item: NavItem, mini: boolean) => {
    const active = isItemActive(item, location.pathname);
    const hasChildren = Boolean(item.children?.length);
    const isOpen = expanded === item.label;

    const button = (
      <ListItemButton
        component={hasChildren ? 'div' : Link}
        to={hasChildren ? undefined : item.path}
        selected={active || isOpen}
        onClick={hasChildren ? () => setExpanded(isOpen ? null : item.label) : undefined}
        sx={{
          mb: 0.5,
          minHeight: 44,
          justifyContent: mini ? 'center' : 'flex-start',
          px: mini ? 1 : 1.5,
          '&.Mui-selected': {
            backgroundColor: (t) => (t.palette.mode === 'dark' ? 'rgba(142,128,255,0.16)' : 'rgba(109,93,246,0.1)'),
            '&:hover': {
              backgroundColor: (t) => (t.palette.mode === 'dark' ? 'rgba(142,128,255,0.24)' : 'rgba(109,93,246,0.16)'),
            },
          },
        }}
      >
        {mini ? (
          <Tooltip title={item.label} placement="right">
            <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
          </Tooltip>
        ) : (
          <ListItemIcon sx={{ color: active ? 'primary.main' : 'text.secondary' }}>
            {item.icon}
          </ListItemIcon>
        )}
        {!mini && (
          <>
            <ListItemText
              primary={
                <Typography fontSize="0.875rem" fontWeight={active ? 700 : 500}>
                  {item.label}
                </Typography>
              }
            />
            {hasChildren &&
              (isOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              ))}
          </>
        )}
      </ListItemButton>
    );

    return (
      <Box key={item.label}>
        {button}
        {hasChildren && !mini && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map((child) => {
                const childActive = isItemActive(child, location.pathname);
                return (
                  <ListItemButton
                    key={child.label}
                    component={Link}
                    to={child.path}
                    selected={childActive}
                    sx={{ pl: 5.5, mb: 0.25, minHeight: 40, borderRadius: 2 }}
                  >
                    {child.icon && (
                      <ListItemIcon
                        sx={{ minWidth: 32, color: childActive ? 'primary.main' : 'text.secondary' }}
                      >
                        {child.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={
                        <Typography fontSize="0.825rem" fontWeight={childActive ? 700 : 500}>
                          {child.label}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  const content = (mini: boolean) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Logo showText={!mini} size={32} to={ROUTES.DASHBOARD} />
        {!mini && (
          <Tooltip title="Collapse sidebar">
            <IconButton size="small" onClick={() => setCollapsed(true)}>
              <MenuOpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: mini ? 1 : 1.5, py: 2 }}>
        <List disablePadding>
          {filteredItems.map((item) => renderNavItem(item, mini))}
        </List>
      </Box>

      {mini && (
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton size="small" onClick={() => setCollapsed(false)}>
              <MenuOpenIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Divider />
      <Box sx={{ p: mini ? 1 : 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {mini ? (
          <Tooltip title={`${displayName} — Sign out`} placement="right">
            <IconButton
              onClick={handleLogout}
              sx={{ mx: 'auto', color: 'text.secondary', '&:hover': { color: 'error.main' } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Avatar firstName={user?.firstName} lastName={user?.lastName} email={user?.email} size={38} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {roleLabel}
              </Typography>
            </Box>
            <Tooltip title="Sign out">
              <IconButton size="small" onClick={handleLogout}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <MuiDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: collapsed ? collapsedWidth : width,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: collapsed ? collapsedWidth : width,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
          },
        }}
      >
        {content(collapsed)}
      </MuiDrawer>

      <MuiDrawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
        }}
      >
        {content(false)}
      </MuiDrawer>
    </>
  );
};

export default DashboardSidebar;
