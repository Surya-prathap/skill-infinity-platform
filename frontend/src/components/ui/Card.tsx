import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card';
import { gradients } from '@/theme';

export interface CardProps extends MuiCardProps {
  /** Lifts the card on hover. */
  hoverable?: boolean;
  /** Applies the brand gradient background. */
  gradient?: boolean;
}

export const Card: React.FC<CardProps> = ({ hoverable = false, gradient = false, sx, ...rest }) => {
  return (
    <MuiCard
      sx={[
        hoverable && {
          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 8,
          },
        },
        gradient && {
          backgroundImage: gradients.brand,
          border: 'none',
          color: '#FFFFFF',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    />
  );
};

export default Card;
