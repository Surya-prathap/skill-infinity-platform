import { Box } from '@mui/material';
import { Avatar } from './Avatar';
import { Typography } from './Typography';

export interface AvatarStackItem {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  src?: string;
}

interface AvatarStackProps {
  items: AvatarStackItem[];
  size?: number;
  max?: number;
  /** Label shown next to the stack (e.g. "12 mentors"). */
  label?: string;
}

export const AvatarStack: React.FC<AvatarStackProps> = ({ items, size = 34, max = 4, label }) => {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}
      role="img"
      aria-label={label ?? `${items.length} avatars`}
    >
      <Box sx={{ display: 'flex' }}>
        {visible.map((item, index) => (
          <Box
            key={index}
            sx={{
              ml: index === 0 ? 0 : -0.9,
              borderRadius: '50%',
              padding: 1.5,
              backgroundColor: 'background.paper',
              display: 'flex',
              '&:hover': { zIndex: 2, transform: 'translateY(-2px)', transition: 'transform 0.15s ease' },
            }}
          >
            <Avatar
              firstName={item.firstName}
              lastName={item.lastName}
              name={item.name}
              email={item.email}
              src={item.src}
              size={size - 3}
            />
          </Box>
        ))}
        {overflow > 0 && (
          <Box
            sx={{
              ml: -0.9,
              borderRadius: '50%',
              padding: 1.5,
              backgroundColor: 'background.paper',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: size - 3,
                height: size - 3,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.selected',
                color: 'primary.main',
              }}
            >
              <Typography variant="caption" fontWeight={700}>
                +{overflow}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
      {label && (
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      )}
    </Box>
  );
};

export default AvatarStack;
