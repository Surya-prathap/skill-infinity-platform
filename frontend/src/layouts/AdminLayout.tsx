import { useEffect, useState } from 'react';
import { AppBar, Box, IconButton, Toolbar, Tooltip } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { AdminSidebar, AdminCommandPalette } from '@/components/admin';
import { Breadcrumbs, PageTransition, ThemeToggle, NotificationBell, ProfileMenu } from '@/components/common';
import { Typography } from '@/components/ui/Typography';
import { useAppSelector } from '@/store/hooks';
import { selectAdminEnvironment } from '@/store/selectors';

export const AdminLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const location = useLocation();
  const environment = useAppSelector(selectAdminEnvironment);

  // Ctrl+K (or Cmd+K) opens the admin command palette.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AdminSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            backgroundColor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(11,18,32,0.8)' : 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.primary',
          }}
        >
          <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              sx={{ display: { lg: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Breadcrumbs />
            </Box>

            {/* Command palette trigger */}
            <Tooltip title="Search (Ctrl+K)">
              <Box
                role="button"
                tabIndex={0}
                aria-label="Open command palette"
                onClick={() => setPaletteOpen(true)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setPaletteOpen(true);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  color: 'text.secondary',
                  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (t) => `0 0 0 3px ${t.palette.mode === 'dark' ? 'rgba(142,128,255,0.15)' : 'rgba(109,93,246,0.12)'}`,
                  },
                }}
              >
                <SearchOutlinedIcon sx={{ fontSize: 17 }} />
                <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
                  Search console…
                </Typography>
                <Box
                  component="span"
                  sx={{
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 0.75,
                    border: 1,
                    borderColor: 'divider',
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: 'text.disabled',
                    ml: { xs: 0, md: 2 },
                  }}
                >
                  Ctrl K
                </Box>
              </Box>
            </Tooltip>

            <Box sx={{ flexGrow: 1 }} />

            {/* Environment badge */}
            <Tooltip title="Deployment environment">
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  border: 1,
                  borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: environment === 'production' ? 'success.main' : 'warning.main',
                    boxShadow: '0 0 0 3px rgba(16,185,129,0.18)',
                  }}
                />
                <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'capitalize' }}>
                  {environment}
                </Typography>
              </Box>
            </Tooltip>

            <ThemeToggle />
            <NotificationBell />
            <ProfileMenu />
          </Toolbar>
        </AppBar>

        <Box sx={{ flexGrow: 1, px: { xs: 2, sm: 3, lg: 4 }, py: 3.5 }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Box>
      </Box>

      <AdminCommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </Box>
  );
};

export default AdminLayout;
