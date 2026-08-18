import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { motion } from 'framer-motion';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { SESSION_TYPES } from '@/features/mentor/constants';
import type { MentorPricing } from '@/types';

interface PricingCardProps {
  plan: MentorPricing;
  featured?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const sessionTypeLabel = (type: string): string =>
  SESSION_TYPES.find((option) => String(option.value) === type)?.label ??
  type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const PricingCard: React.FC<PricingCardProps> = ({
  plan,
  featured = false,
  onEdit,
  onDelete,
}) => {
  const hasDiscount = Boolean(plan.discountPercentage && plan.originalPrice);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{
          height: '100%',
          p: 2.75,
          position: 'relative',
          overflow: 'visible',
          ...(featured && {
            border: '1.5px solid rgba(109,93,246,0.55)',
            boxShadow: '0 14px 40px rgba(109,93,246,0.2)',
          }),
        }}
      >
        {featured && (
          <Chip
            size="small"
            label="Most popular"
            sx={{
              position: 'absolute',
              top: -12,
              right: 20,
              height: 24,
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
            }}
          />
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {sessionTypeLabel(plan.sessionType)}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {plan.durationMinutes ? `${plan.durationMinutes} min session` : 'Flexible duration'}
            </Typography>
          </Box>
          {(onEdit || onDelete) && (
            <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
              {onEdit && (
                <Tooltip title="Edit plan">
                  <IconButton size="small" onClick={onEdit} aria-label={`Edit ${sessionTypeLabel(plan.sessionType)}`}>
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {onDelete && (
                <Tooltip title="Remove plan">
                  <IconButton size="small" onClick={onDelete} aria-label={`Remove ${sessionTypeLabel(plan.sessionType)}`} color="error">
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}
        </Stack>

        <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline', gap: 1 }}>
          {plan.isFree ? (
            <Typography variant="h4" fontWeight={800} color="success.main">
              Free
            </Typography>
          ) : (
            <>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {plan.price} credits
              </Typography>
              {hasDiscount && plan.originalPrice && (
                <Typography variant="body2" color="text.disabled" sx={{ textDecoration: 'line-through' }}>
                  {plan.originalPrice} credits
                </Typography>
              )}
            </>
          )}
          <Typography variant="caption" color="text.secondary">
            / session
          </Typography>
        </Box>

        {hasDiscount && plan.discountPercentage && (
          <Box sx={{ mt: 1 }}>
            <Chip
              size="small"
              label={`${plan.discountPercentage}% off`}
              sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 800 }}
            />
          </Box>
        )}

        {plan.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.6 }}>
            {plan.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mt: 1.5, color: 'text.secondary' }}>
          <AccessTimeOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption" fontWeight={600}>
            {plan.durationMinutes ?? 60} minutes · {plan.price} credits
          </Typography>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default PricingCard;
