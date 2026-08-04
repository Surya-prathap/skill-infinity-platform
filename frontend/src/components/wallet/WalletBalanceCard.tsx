import { Box, Button } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { formatCurrency } from '@/utils';
import type { WalletBalance } from '@/types';

interface WalletBalanceCardProps {
  balance: WalletBalance;
  onTopUp?: () => void;
  onHistory?: () => void;
}

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  onTopUp,
  onHistory,
}) => {
  const currency = balance.currency ?? 'USD';
  return (
    <Box
      sx={{
        borderRadius: 4,
        p: 3.5,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #0EA5E9 120%)',
      }}
    >
      <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.16 }} />
      <motion.div
        animate={{ x: [0, 24, 0], y: [0, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          top: -90,
          right: -40,
          background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)',
          filter: 'blur(24px)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative' }}>
        <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <AccountBalanceWalletOutlinedIcon />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              Available balance
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
              <AnimatedNumber value={balance.availableBalance} prefix="$" decimals={0} />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {formatCurrency(balance.currentBalance, currency)} current
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" gap={3} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              <AnimatedNumber value={balance.frozenBalance} prefix="$" />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Frozen</Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              <AnimatedNumber value={balance.pendingBalance} prefix="$" />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Pending</Typography>
          </Box>
        </Stack>

        <Stack direction="row" gap={1.5}>
          {onTopUp && (
            <Button
              variant="contained"
              onClick={onTopUp}
              sx={{
                bgcolor: '#fff',
                color: '#5443D4',
                fontWeight: 800,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
              }}
            >
              Top up credits
            </Button>
          )}
          {onHistory && (
            <Button
              variant="outlined"
              onClick={onHistory}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              History
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default WalletBalanceCard;
