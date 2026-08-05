import { Chip } from '@mui/material';
import type { Role } from '@/types';

const ROLE_STYLES: Record<Role, { label: string; color: 'primary' | 'secondary' | 'warning' | 'info' | 'default' }> = {
  ROLE_LEARNER: { label: 'Learner', color: 'info' },
  ROLE_MENTOR: { label: 'Mentor', color: 'secondary' },
  ROLE_ADMIN: { label: 'Admin', color: 'primary' },
  ROLE_USER: { label: 'Member', color: 'default' },
};

interface RoleBadgeProps {
  role: Role | string;
  size?: 'small' | 'medium';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'small' }) => {
  const style = ROLE_STYLES[role as Role] ?? { label: role.replace('ROLE_', ''), color: 'default' as const };
  return (
    <Chip
      size={size}
      label={style.label}
      color={style.color}
      variant="outlined"
      sx={{ fontWeight: 700, textTransform: 'capitalize' }}
    />
  );
};

export default RoleBadge;
