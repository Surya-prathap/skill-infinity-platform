import { Box } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import RemoveOutlinedIcon from '@mui/icons-material/RemoveOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDateTime } from '@/utils';
import type { WalletTransaction } from '@/types';

type TransactionDirection = 'CREDIT' | 'DEBIT' | 'HOLD';

/**
 * Direction of a transaction. The backend provides a reliable `direction`
 * field on every wallet transaction; the fallback below only covers legacy
 * rows from before that field existed (never guess for current data).
 */
const getDirection = (transaction: WalletTransaction): TransactionDirection => {
  const explicit = transaction.direction?.toUpperCase();
  if (explicit === 'CREDIT' || explicit === 'DEBIT' || explicit === 'HOLD') {
    return explicit;
  }
  const type = transaction.transactionType.toUpperCase();
  if (['CREDIT_PURCHASE', 'CREDIT_REFUND', 'PROMOTIONAL_CREDIT', 'REWARD_CREDIT', 'BONUS_CREDIT', 'SESSION_PAYMENT', 'REFERRAL_REWARD', 'COUPON_REDEMPTION', 'CREDIT', 'REWARD', 'REFUND'].includes(type)) {
    return 'CREDIT';
  }
  if (['CREDIT_CONSUMPTION', 'CREDIT_TRANSFER', 'CREDIT_EXPIRATION', 'WITHDRAWAL', 'DEBIT'].includes(type)) {
    return 'DEBIT';
  }
  return 'HOLD';
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  CREDIT: <AddOutlinedIcon sx={{ fontSize: 18 }} />,
  DEBIT: <RemoveOutlinedIcon sx={{ fontSize: 18 }} />,
  FREEZE: <LockOutlinedIcon sx={{ fontSize: 18 }} />,
  RELEASE: <LockOutlinedIcon sx={{ fontSize: 18 }} />,
  REWARD: <RedeemOutlinedIcon sx={{ fontSize: 18 }} />,
};

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

interface TransactionCardProps {
  transaction: WalletTransaction;
  index?: number;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, index = 0 }) => {
  const direction = getDirection(transaction);
  // CREDIT = gained (green +), DEBIT = spent (red −), HOLD = frozen/released (neutral).
  const color = direction === 'CREDIT' ? '#10B981' : direction === 'DEBIT' ? '#EF4444' : '#64748B';
  const icon =
    direction === 'CREDIT'
      ? <AddOutlinedIcon sx={{ fontSize: 18 }} />
      : direction === 'DEBIT'
        ? <RemoveOutlinedIcon sx={{ fontSize: 18 }} />
        : <LockOutlinedIcon sx={{ fontSize: 18 }} />;
  // Wallet-service transactions are denominated in credits; payment-service
  // transactions carry a real currency code (INR).
  const creditDenominated =
    !transaction.currency || transaction.currency === 'CREDITS';
  const amountLabel = creditDenominated
    ? `${Math.abs(transaction.amount).toLocaleString('en-IN')} credits`
    : formatCurrency(Math.abs(transaction.amount), transaction.currency);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 2,
          borderRadius: 2.5,
          border: 1,
          borderColor: 'divider',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover', transform: 'translateY(-1px)' },
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            background: `${color}14`,
            border: `1px solid ${color}33`,
            flexShrink: 0,
          }}
        >
          {TYPE_ICON[transaction.transactionType] ?? icon}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {transaction.description ?? transaction.transactionType}
          </Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary">
              {formatDateTime(transaction.createdAt)}
            </Typography>
            {transaction.transactionNumber && (
              <Typography variant="caption" color="text.disabled">
                · {transaction.transactionNumber}
              </Typography>
            )}
          </Stack>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ color }}>
            {direction === 'HOLD' ? '' : direction === 'CREDIT' ? '+' : '−'}
            {amountLabel}
          </Typography>
          <StatusBadge
            label={transaction.status}
            color={STATUS_COLOR[transaction.status] ?? 'default'}
            size="small"
          />
        </Box>
      </Box>
    </motion.div>
  );
};

export default TransactionCard;
