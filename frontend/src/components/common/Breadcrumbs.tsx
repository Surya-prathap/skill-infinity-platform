import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Link } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { ROUTES } from '@/constants';

const LABEL_MAP: Record<string, string> = {
  dashboard: 'Dashboard',
  profile: 'Profile',
  community: 'Community',
  sessions: 'Sessions',
  wallet: 'Wallet',
  notifications: 'Notifications',
  settings: 'Settings',
  mentor: 'Mentor',
  admin: 'Admin',
  mentors: 'Mentors',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) return null;

  return (
    <MuiBreadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
      aria-label="breadcrumb"
    >
      <Link
        component={RouterLink}
        to={ROUTES.HOME}
        underline="hover"
        color="inherit"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        <HomeIcon fontSize="small" />
      </Link>
      {pathnames.map((segment, index) => {
        const path = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = LABEL_MAP[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);

        return isLast ? (
          <Typography key={path} color="text.primary" fontWeight={600} variant="body2">
            {label}
          </Typography>
        ) : (
          <Link key={path} component={RouterLink} to={path} underline="hover" color="inherit" variant="body2">
            {label}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
