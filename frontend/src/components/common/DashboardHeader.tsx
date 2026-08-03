import { AppBar, Box, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Breadcrumbs } from './Breadcrumbs';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { ProfileMenu } from './ProfileMenu';

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backgroundColor: (t) =>
          t.palette.mode === 'dark' ? 'rgba(11,18,32,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: 1,
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: 64 }}>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Breadcrumbs />
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {isDesktop && (
          <Box sx={{ width: 300 }}>
            <SearchBar placeholder="Search mentors, sessions…" />
          </Box>
        )}
        <ThemeToggle />
        <LanguageSwitcher />
        <NotificationBell />
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;
