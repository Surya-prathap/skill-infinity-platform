import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';

export interface GlassCardProps extends MuiCardProps {
  /** Lifts the card on hover. */
  hoverable?: boolean;
}

/** Frosted-glass surface used for overlays and hero content. */
export const GlassCard: React.FC<GlassCardProps> = ({ hoverable = false, sx, ...rest }) => {
  return (
    <MuiCard
      sx={[
        (theme) => ({
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(18, 26, 43, 0.66)'
              : 'rgba(255, 255, 255, 0.66)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: `1px solid ${
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.6)'
          }`,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.35)'
              : '0 8px 32px rgba(15, 23, 42, 0.08)',
        }),
        hoverable && {
          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 44px rgba(15, 23, 42, 0.14)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export default GlassCard;
