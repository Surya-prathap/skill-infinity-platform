import { useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
  showValue?: boolean;
  ariaLabel?: string;
}

/** Interactive/display star rating with keyboard support and hover preview. */
export const StarRating: React.FC<StarRatingProps> = ({
  value,
  onChange,
  size = 20,
  readOnly = !onChange,
  showValue = false,
  ariaLabel = 'Rating',
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (readOnly) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      onChange?.(Math.min(5, Math.round(display) + 1));
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      onChange?.(Math.max(1, Math.round(display) - 1));
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange?.(Math.round(display) || 1);
    }
  };

  return (
    <Box
      role="radiogroup"
      aria-label={ariaLabel}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-valuenow={readOnly ? value : undefined}
      onKeyDown={handleKeyDown}
      tabIndex={readOnly ? -1 : 0}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, outline: 'none' }}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = !filled && display > star - 1 && display < star;
        const Icon = filled ? StarIcon : half ? StarHalfIcon : StarBorderIcon;
        return (
          <Tooltip key={star} title={`${star} star${star > 1 ? 's' : ''}`} arrow>
            <Box
              component="button"
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} stars`}
              disabled={readOnly}
              onClick={(event) => {
                event.stopPropagation();
                onChange?.(star);
              }}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(null)}
              sx={{
                border: 'none',
                background: 'transparent',
                p: 0,
                m: 0,
                cursor: readOnly ? 'default' : 'pointer',
                color: filled || half ? '#F59E0B' : 'text.disabled',
                lineHeight: 0,
                transition: 'transform 0.15s ease, color 0.15s ease',
                '&:hover:not(:disabled)': {
                  transform: 'scale(1.2)',
                  color: '#F59E0B',
                },
                '&:active:not(:disabled)': {
                  transform: 'scale(0.9)',
                },
                '&:disabled': { cursor: 'default' },
              }}
            >
              <Icon sx={{ fontSize: size }} />
            </Box>
          </Tooltip>
        );
      })}
      {showValue && (
        <Box component="span" sx={{ ml: 0.75, fontWeight: 800, fontSize: '0.9rem', color: '#F59E0B' }}>
          {value.toFixed(1)}
        </Box>
      )}
    </Box>
  );
};

export default StarRating;
