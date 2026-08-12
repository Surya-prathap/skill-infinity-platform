import { useState } from 'react';
import { AppBar, Box, Button, Container, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, Toolbar, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ProfileMenu } from './ProfileMenu';
import { useAuth } from '@/hooks';
import { ROUTES, getHomeRoute } from '@/constants';

const NAV_ITEMS = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Mentors', path: ROUTES.MENTORS },
  { label: 'Sessions', path: ROUTES.SESSIONS },
  { label: 'Wallet', path: ROUTES.WALLET },
];

export const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, roles } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path: string) =>
    path === ROUTES.HOME ? location.pathname === path : location.pathname.startsWith(path);

  const navLinks = (
    <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, justifyContent: 'center' }}>
      {NAV_ITEMS.map((item) => (
        <Button
          key={item.path}
          component={Link}
          to={item.path}
          sx={{
            color: isActive(item.path) ? 'primary.main' : 'text.secondary',
            fontWeight: isActive(item.path) ? 700 : 500,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 6,
              left: 20,
              right: 20,
              height: 2.5,
              borderRadius: 999,
              backgroundColor: 'primary.main',
              opacity: isActive(item.path) ? 1 : 0,
              transition: 'opacity 0.2s ease',
            },
            '&:hover': { color: 'primary.main', backgroundColor: 'transparent' },
          }}
        >
          {item.label}
        </Button>
      ))}
    </Stack>
  );

  const authActions = isAuthenticated ? (
    <>
      <Tooltip title="Go to Dashboard">
        <IconButton onClick={() => navigate(getHomeRoute(roles))} aria-label="Dashboard" size="small">
          <DashboardIcon />
        </IconButton>
      </Tooltip>
      <ProfileMenu />
    </>
  ) : (
    <>
      <Button component={Link} to={ROUTES.LOGIN} variant="outlined" size="small">
        Sign In
      </Button>
      <Button
        component={Link}
        to={ROUTES.REGISTER}
        variant="contained"
        size="small"
        sx={{ backgroundImage: 'linear-gradient(135deg, #6D5DF6, #5443D4)' }}
      >
        Get Started
      </Button>
    </>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backgroundColor: (t) => (t.palette.mode === 'dark' ? 'rgba(11,18,32,0.8)' : 'rgba(255,255,255,0.8)'),
          backdropFilter: 'blur(14px)',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64, gap: 2 }}>
            {isMobile && (
              <IconButton edge="start" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <MenuIcon />
              </IconButton>
            )}
            <Logo />
            {!isMobile && navLinks}
            {!isTablet && (
              <Box sx={{ width: 260 }}>
                <SearchBar placeholder="Search mentors, sessions…" />
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 'auto' }}>
              <ThemeToggle />
              <LanguageSwitcher />
              {authActions}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' } }}
      >
        <Box sx={{ px: 2.5, py: 2 }}>
          <Logo />
        </Box>
        <List>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                selected={isActive(item.path)}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box sx={{ px: 2, py: 2, display: 'flex', gap: 1 }}>
          {isAuthenticated ? (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setDrawerOpen(false);
                navigate(getHomeRoute(roles));
              }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button fullWidth variant="outlined" component={Link} to={ROUTES.LOGIN}>
                Sign In
              </Button>
              <Button fullWidth variant="contained" component={Link} to={ROUTES.REGISTER}>
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Header;
