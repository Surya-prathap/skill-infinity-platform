import { Box, Button } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { WalletBalance } from '@/types';

interface WalletBalanceCardProps {
  balance: WalletBalance;
  onTopUp?: () => void;
  onHistory?: () => void;
}

const BUCKET_COLORS: Record<string, string> = {
  Welcome: '#34D399',
  Purchased: '#60A5FA',
  Learning: '#FBBF24',
  Withdrawable: '#F472B6',
};

/** Four credit buckets stay separate — never merged into one confusing number. */
const BUCKETS: { key: 'welcomeBalance' | 'purchasedBalance' | 'learningBalance' | 'withdrawableBalance'; label: string; hint: string }[] = [
  { key: 'welcomeBalance', label: 'Welcome', hint: 'One-time gift' },
  { key: 'purchasedBalance', label: 'Purchased', hint: 'Bought with ₹' },
  { key: 'learningBalance', label: 'Learning', hint: 'Earned by teaching' },
  { key: 'withdrawableBalance', label: 'Withdrawable', hint: 'Cash-eligible' },
];

export const WalletBalanceCard: React.FC<WalletBalanceCardProps> = ({
  balance,
  onTopUp,
  onHistory,
}) => {
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
          // Blur removed — the gradient fades to transparent by itself and
          // animating a blurred layer re-rasterizes every frame (expensive).
          pointerEvents: 'none',
          willChange: 'transform',
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
              <AnimatedNumber value={balance.availableBalance} decimals={0} />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {balance.currentBalance.toLocaleString('en-IN')} credits current
            </Typography>
          </Box>
        </Stack>

        {/* ================= Four separate credit buckets ================= */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.25,
            mb: 3,
          }}
        >
          {BUCKETS.map((bucket) => {
            const value = balance[bucket.key] ?? 0;
            const color = BUCKET_COLORS[bucket.label]!;
            return (
              <Box
                key={bucket.key}
                sx={{
                  borderRadius: 2.5,
                  px: 1.75,
                  py: 1.5,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s ease, background 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', bgcolor: 'rgba(255,255,255,0.16)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 700 }}>
                    {bucket.label}
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                  <AnimatedNumber value={value} decimals={0} />
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65 }}>
                  {bucket.hint}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" gap={1.5} sx={{ mb: 2.5 }}>
          <Box sx={{ flexGrow: 1, textAlign: 'center', py: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" fontWeight={800}>
              <AnimatedNumber value={balance.frozenBalance} />
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>Frozen (booked)</Typography>
          </Box>
          <Box sx={{ flexGrow: 1, textAlign: 'center', py: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.08)' }}>
            <Typography variant="h6" fontWeight={800}>
              <AnimatedNumber value={balance.pendingBalance} />
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
