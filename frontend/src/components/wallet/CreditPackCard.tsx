import { Box, Chip } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { formatCurrency } from '@/utils';

export interface CreditPackOption {
  id: string;
  name: string;
  credits: number;
  price: number;
  originalPrice?: number;
  savings?: number;
  features: readonly string[];
  highlighted?: boolean;
}

interface CreditPackCardProps {
  pack: CreditPackOption;
  selected?: boolean;
  onSelect?: () => void;
  index?: number;
}

export const CreditPackCard: React.FC<CreditPackCardProps> = ({
  pack,
  selected = false,
  onSelect,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.3) }}
      whileHover={{ y: -6 }}
      style={{ height: '100%' }}
    >
      <Box
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect?.();
        }}
        sx={{
          position: 'relative',
          height: '100%',
          p: 3,
          borderRadius: 3.5,
          cursor: 'pointer',
          border: 2,
          borderColor: selected
            ? 'primary.main'
            : pack.highlighted
              ? 'rgba(109,93,246,0.4)'
              : 'divider',
          background: selected
            ? 'linear-gradient(160deg, rgba(109,93,246,0.1), rgba(67,198,192,0.08))'
            : 'background.paper',
          transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
          boxShadow: selected ? '0 12px 32px rgba(109,93,246,0.16)' : 'none',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        {pack.highlighted && (
          <Chip
            size="small"
            icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} />}
            label="Most popular"
            sx={{
              position: 'absolute',
              top: -12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'primary.main',
              color: '#fff',
              fontWeight: 800,
              height: 24,
            }}
          />
        )}

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            {pack.name}
          </Typography>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selected ? '#fff' : 'text.disabled',
              background: selected ? 'primary.main' : 'transparent',
              border: 2,
              borderColor: selected ? 'primary.main' : 'divider',
            }}
          >
            {selected && <CheckIcon sx={{ fontSize: 16 }} />}
          </Box>
        </Stack>

        <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
          <Typography component="span" variant="h5" fontWeight={700} color="text.secondary">
            {formatCurrency(pack.price)}
          </Typography>
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          {pack.credits.toLocaleString()} credits
          {pack.originalPrice && (
            <Box component="span" sx={{ textDecoration: 'line-through', ml: 1 }}>
              {formatCurrency(pack.originalPrice)}
            </Box>
          )}
          {pack.savings !== undefined && pack.savings > 0 && (
            <Chip
              size="small"
              label={`Save ${formatCurrency(pack.savings)}`}
              color="success"
              sx={{ ml: 1, height: 20, fontWeight: 700 }}
            />
          )}
        </Typography>

        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
          {pack.features.map((feature) => (
            <Stack key={feature} direction="row" alignItems="center" gap={1} sx={{ mb: 0.75 }}>
              <CheckIcon sx={{ fontSize: 15, color: 'success.main' }} />
              <Typography variant="body2" color="text.secondary">
                {feature}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </motion.div>
  );
};

export default CreditPackCard;
