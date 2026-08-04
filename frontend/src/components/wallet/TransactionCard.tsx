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

const isCredit = (type: string): boolean =>
  ['CREDIT', 'REWARD', 'REFUND'].includes(type.toUpperCase());

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
  const credit = isCredit(transaction.transactionType);
  const color = credit ? '#10B981' : '#EF4444';

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
          {TYPE_ICON[transaction.transactionType] ?? <AddOutlinedIcon sx={{ fontSize: 18 }} />}
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
            {credit ? '+' : '−'}
            {formatCurrency(Math.abs(transaction.amount), transaction.currency ?? 'USD')}
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
