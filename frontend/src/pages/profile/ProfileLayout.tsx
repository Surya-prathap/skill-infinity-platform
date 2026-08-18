import { Box, Button, Chip } from '@mui/material';
import { NavLink, Outlet } from 'react-router-dom';
import { Typography } from '@/components/ui/Typography';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import { useDocumentTitle } from '@/hooks';
import { useProfileQuery } from '@/features/profile';
import { ROUTES } from '@/constants';

const NAV_ITEMS = [
  { label: 'Overview', to: ROUTES.PROFILE, icon: <PersonOutlineOutlinedIcon fontSize="small" />, end: true },
  { label: 'Edit Profile', to: ROUTES.PROFILE_EDIT, icon: <EditOutlinedIcon fontSize="small" /> },
  { label: 'Skills', to: ROUTES.PROFILE_SKILLS, icon: <BoltOutlinedIcon fontSize="small" /> },
];

export const ProfileLayout: React.FC = () => {
  useDocumentTitle('Profile');
  const { isOffline, notFound } = useProfileQuery();

  return (
    <Box>
      {isOffline && (
        <Box
          role="status"
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 2,
            py: 1.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'warning.main',
            bgcolor: 'warning.main',
            color: '#1F2937',
          }}
        >
          <CloudOffOutlinedIcon fontSize="small" />
          <Typography variant="body2" fontWeight={600}>
            You are offline — showing your saved profile. Changes are stored on this device and will sync when you reconnect.
          </Typography>
        </Box>
      )}

      {notFound && (
        <Box
          role="status"
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'primary.main',
            bgcolor: 'action.selected',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <RocketLaunchOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              Your profile isn&apos;t set up yet — create it to start matching with mentors.
            </Typography>
          </Box>
          <Button
            component={NavLink}
            to={ROUTES.PROFILE_EDIT}
            size="small"
            variant="contained"
            startIcon={<EditOutlinedIcon fontSize="small" />}
          >
            Set up profile
          </Button>
        </Box>
      )}

      {/* Section navigation */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          mb: 3,
          '&::-webkit-scrollbar': { height: 6 },
          scrollbarWidth: 'thin',
        }}
        role="navigation"
        aria-label="Profile sections"
      >
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={{ textDecoration: 'none' }}
            aria-label={item.label}
          >
            {({ isActive }) => (
              <Chip
                icon={item.icon}
                label={item.label}
                sx={{
                  px: 0.5,
                  py: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  color: isActive ? '#FFFFFF' : 'text.secondary',
                  background: isActive
                    ? 'linear-gradient(135deg, #6D5DF6, #7C3AED)'
                    : 'background.paper',
                  border: 1,
                  borderColor: isActive ? 'transparent' : 'divider',
                  boxShadow: isActive ? '0 6px 18px rgba(109,93,246,0.35)' : 'none',
                  '& .MuiChip-icon': { color: isActive ? '#FFFFFF' : 'inherit' },
                  '&:hover': isActive
                    ? undefined
                    : { bgcolor: 'action.hover', borderColor: 'primary.main' },
                  transition: 'all 0.2s ease',
                }}
              />
            )}
          </NavLink>
        ))}
      </Box>

      <Outlet />
    </Box>
  );
};

export default ProfileLayout;
