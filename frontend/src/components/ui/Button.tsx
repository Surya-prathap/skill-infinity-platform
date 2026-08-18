import type { ReactNode } from 'react';
import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

export interface ButtonProps extends MuiButtonProps {
  /** Shows a spinner and disables the button. */
  loading?: boolean;
  /** Convenience leading icon (rendered before the label). */
  icon?: ReactNode;
  /** Renders the button as an anchor when provided. */
  href?: string;
  target?: string;
  rel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  icon,
  disabled,
  children,
  startIcon,
  href,
  target,
  rel,
  ...rest
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} thickness={5} color="inherit" /> : (startIcon ?? icon)}
      {...(href !== undefined ? { component: 'a' as const, href, target, rel } : {})}
      {...rest}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
