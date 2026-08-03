import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';
import { initials, initialsFromEmail } from '@/utils';

export interface AvatarProps extends MuiAvatarProps {
  firstName?: string;
  lastName?: string;
  /** Full name — used when firstName/lastName are not provided. */
  name?: string;
  email?: string;
  size?: number;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #6D5DF6, #43C6C0)',
  'linear-gradient(135deg, #F59E0B, #EF4444)',
  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  'linear-gradient(135deg, #10B981, #0EA5E9)',
  'linear-gradient(135deg, #EC4899, #F59E0B)',
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  name,
  email,
  size = 40,
  src,
  sx,
  children,
  ...rest
}) => {
  const seed = (firstName ?? '') + (lastName ?? '') + (name ?? '') + (email ?? '');
  const background =
    AVATAR_GRADIENTS[hashString(seed || '?') % AVATAR_GRADIENTS.length] ?? AVATAR_GRADIENTS[0];

  const fallback =
    firstName || lastName
      ? initials(firstName, lastName)
      : name
        ? initials(name.split(' ')[0], name.split(' ').slice(1).join(' ') || undefined)
        : initialsFromEmail(email);

  return (
    <MuiAvatar
      src={src}
      sx={[
        {
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 700,
          background,
          color: '#FFFFFF',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {children ?? fallback}
    </MuiAvatar>
  );
};

export default Avatar;
