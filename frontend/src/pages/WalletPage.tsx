import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { MetricCard } from '@/components/ui/MetricCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PageHeader } from '@/components/common';
import { AreaChart, DonutChart } from '@/components/charts';
import { WalletBalanceCard, TransactionCard } from '@/components/wallet';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { Pagination } from '@/components/ui/Pagination';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import {
  useRequestWithdrawalMutation,
  useWalletBalanceQuery,
  useWalletHistoryQuery,
  useWalletMonthlySeriesQuery,
  useWalletStatisticsQuery,
  useWithdrawalsQuery,
} from '@/features/wallet';
import type { Withdrawal } from '@/types';
import { formatCompactNumber, formatCurrency } from '@/utils';

const CREDIT_VALUE_INR = 10;
const PLATFORM_FEE_PERCENT = 10;
const MIN_WITHDRAWAL = 10;

const WITHDRAWAL_STATUS_COLOR: Record<string, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  PENDING: 'warning',
  APPROVED: 'info',
  COMPLETED: 'success',
  REJECTED: 'error',
  CANCELLED: 'default',
};

const PAGE_SIZE = 5;

const SPLIT_COLORS = ['#6D5DF6', '#14B8A6', '#F59E0B', '#EC4899'];

/** Categorizes the real wallet transactions shown on this page (no seed data). */
const categorize = (reference: string | undefined): string => {
  const key = (reference ?? '').toUpperCase();
  if (key.includes('SESSION') || key.includes('BOOKING')) return 'Sessions';
  if (key.includes('PURCHASE')) return 'Purchases';
  if (key.includes('REWARD') || key.includes('EARN')) return 'Rewards';
  if (key.includes('REFUND')) return 'Refunds';
  return 'Other';
};

/**
 * Withdrawal request panel: real-time gross/fee/net preview and a list of the
 * user's withdrawal requests with their review status.
 */
const WithdrawalPanel: React.FC = () => {
  const balance = useWalletBalanceQuery();
  const withdrawals = useWithdrawalsQuery(0, 10);
  const requestWithdrawal = useRequestWithdrawalMutation();
  const [amount, setAmount] = useState('');

  const withdrawable = balance.balance?.withdrawableBalance ?? 0;
  const credits = Number(amount) || 0;
  const gross = credits * CREDIT_VALUE_INR;
  const fee = Math.round(gross * PLATFORM_FEE_PERCENT) / 100;
  const net = gross - fee;
  const tooLow = credits > 0 && credits < MIN_WITHDRAWAL;
  const tooHigh = credits > withdrawable;
  const canSubmit = credits >= MIN_WITHDRAWAL && credits <= withdrawable && !requestWithdrawal.isPending;

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2}>
            <TextField
              label="Withdrawable credits"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min ${MIN_WITHDRAWAL} credits`}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">credits</InputAdornment>,
                },
              }}
              helperText={
                tooLow
                  ? `Minimum withdrawal is ${MIN_WITHDRAWAL} withdrawable credits.`
                  : tooHigh
                    ? `You only have ${withdrawable.toLocaleString('en-IN')} withdrawable credits.`
                    : `Available: ${withdrawable.toLocaleString('en-IN')} withdrawable credits`
              }
              error={tooLow || tooHigh}
            />
            <Box
              sx={{
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                p: 2,
                bgcolor: 'action.hover',
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Gross amount</Typography>
                <Typography variant="body2" fontWeight={700}>{formatCurrency(gross)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">Platform fee ({PLATFORM_FEE_PERCENT}%)</Typography>
                <Typography variant="body2" color="error" fontWeight={700}>−{formatCurrency(fee)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5, borderTop: 1, borderColor: 'divider', pt: 1 }}>
                <Typography variant="body2" fontWeight={800}>You receive</Typography>
                <Typography variant="body2" fontWeight={800} color="success.main">{formatCurrency(net)}</Typography>
              </Stack>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              disabled={!canSubmit}
              startIcon={requestWithdrawal.isPending ? <CircularProgress size={16} color="inherit" /> : <CurrencyExchangeOutlinedIcon />}
              onClick={() => {
                requestWithdrawal.mutate(
                  { amountCredits: credits, bankDetails: 'Bank transfer (UPI)' },
                  { onSuccess: () => setAmount('') },
                );
              }}
              sx={{ fontWeight: 800, py: 1.25 }}
            >
              Request withdrawal
            </Button>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
            Withdrawal history
          </Typography>
          {withdrawals.data.empty ? (
            <Box
              sx={{
                borderRadius: 2.5,
                border: 1,
                borderStyle: 'dashed',
                borderColor: 'divider',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No withdrawal requests yet. Your withdrawable credits appear here once you&apos;ve
                taught professional sessions.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.25}>
              {withdrawals.data.content.map((w: Withdrawal) => (
                <Box
                  key={w.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'divider',
                    px: 2,
                    py: 1.5,
                    transition: 'border-color 0.2s ease',
                    '&:hover': { borderColor: 'primary.main' },
                  }}
                >
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" fontWeight={800}>
                      {w.amountCredits.toLocaleString('en-IN')} credits → {formatCurrency(w.netAmountInr)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Gross {formatCurrency(w.grossAmountInr)} · fee {formatCurrency(w.platformFeeInr)} ·{' '}
                      {w.createdAt ? new Date(w.createdAt).toLocaleDateString('en-IN') : ''}
                    </Typography>
                  </Box>
                  <Chip
                    label={w.status}
                    size="small"
                    color={WITHDRAWAL_STATUS_COLOR[w.status] ?? 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                  {w.rejectionReason && (
                    <Typography variant="caption" color="error">{w.rejectionReason}</Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export const WalletPage: React.FC = () => {
  useDocumentTitle('Wallet');
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const balance = useWalletBalanceQuery();
  const statistics = useWalletStatisticsQuery();
  const monthly = useWalletMonthlySeriesQuery(7);
  const history = useWalletHistoryQuery(page, PAGE_SIZE);

  const stats = statistics.statistics;
  const totalCreditsOut = stats?.totalCreditsOut ?? 0;

  /** Spending breakdown derived from real transaction reference types. */
  const spendingSplit = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (const tx of history.data.content) {
      const label = categorize(tx.referenceType);
      buckets[label] = (buckets[label] ?? 0) + Math.abs(tx.amount ?? 0);
    }
    return Object.entries(buckets).map(([label, value], index) => ({
      label,
      value,
      color: SPLIT_COLORS[index % SPLIT_COLORS.length]!,
    }));
  }, [history.data.content]);

  return (
    <Box>
      <PageHeader
        title="Wallet"
        subtitle="Manage your credits, track spending and top up anytime."
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<ReceiptLongOutlinedIcon />}
              onClick={() => navigate(ROUTES.TRANSACTIONS)}
            >
              Transactions
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.CREDITS)}
            >
              Buy credits
            </Button>
          </>
        }
      />

      {/* ================= Balance hero ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ height: '100%' }}>
            <WalletBalanceCard
              balance={
                balance.balance ?? {
                  currentBalance: 0,
                  availableBalance: 0,
                  frozenBalance: 0,
                  pendingBalance: 0,
                  currency: 'CREDITS',
                }
              }
              onTopUp={() => navigate(ROUTES.CREDITS)}
              onHistory={() => navigate(ROUTES.TRANSACTIONS)}
            />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={3}>
            {[
              { label: 'Credits purchased', value: stats?.totalCreditsIn ?? 0, suffix: '', color: '#6D5DF6', icon: <AddIcon /> },
              { label: 'Credits used', value: stats?.totalCreditsOut ?? 0, suffix: '', color: '#14B8A6', icon: <AccountBalanceWalletOutlinedIcon /> },
              { label: 'Transactions', value: stats?.totalTransactions ?? 0, suffix: '', color: '#F59E0B', icon: <ReceiptLongOutlinedIcon /> },
              { label: 'Active days', value: stats?.activeDays ?? 0, suffix: '', color: '#3B82F6', icon: <TrendingUpOutlinedIcon /> },
            ].map((stat, index) => (
              <Grid key={stat.label} size={{ xs: 12, sm: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  style={{ height: '100%' }}
                >
                  <MetricCard
                    label={stat.label}
                    value={stat.value}
                    suffix={stat.suffix}
                    icon={stat.icon}
                    color={stat.color}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>

      {/* ================= Charts ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<TrendingUpOutlinedIcon />}
                iconColor="#6D5DF6"
                title="Monthly spending"
                subtitle="Credits in & out over the last 7 months"
                action={
                  <Chip
                    label={`${(balance.balance?.availableBalance ?? 0).toLocaleString('en-IN')} credits available`}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                }
              />
              <AreaChart data={[...monthly.series]} color="#6D5DF6" suffix=" credits" height={240} />
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.15 }} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%', textAlign: 'center' }}>
              <SectionHeader
                icon={<AccountBalanceWalletOutlinedIcon />}
                iconColor="#14B8A6"
                title="Spending split"
                subtitle="Where credits go"
              />
              {spendingSplit.length > 0 ? (
                <>
                  <DonutChart
                    segments={spendingSplit}
                    size={170}
                    centerValue={formatCompactNumber(totalCreditsOut)}
                    centerLabel="spent"
                  />
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {spendingSplit.map((segment) => (
                      <Stack key={segment.label} direction="row" alignItems="center" gap={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                        <Typography variant="caption" fontWeight={600} sx={{ flexGrow: 1 }}>
                          {segment.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={800}>
                          {segment.value.toLocaleString('en-IN')} credits
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </>
              ) : (
                <Box
                  sx={{
                    height: 170,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2.5,
                    border: 1,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No spending data yet.
                  </Typography>
                </Box>
              )}
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Withdraw earnings ================= */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}>
        <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
          <SectionHeader
            icon={<CurrencyExchangeOutlinedIcon />}
            iconColor="#EC4899"
            title="Withdraw earnings"
            subtitle="Convert withdrawable credits to INR — 1 credit = ₹10, 10% platform fee, 10-credit minimum"
          />
          <WithdrawalPanel />
        </Card>
      </motion.div>

      {/* ================= Recent transactions ================= */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
        <Card sx={{ p: { xs: 2, md: 3.5 } }}>
          <SectionHeader
            icon={<ReceiptLongOutlinedIcon />}
            iconColor="#F59E0B"
            title="Recent transactions"
            subtitle="Your latest wallet activity"
            action={
              <Button
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                onClick={() => navigate(ROUTES.TRANSACTIONS)}
              >
                View all
              </Button>
            }
          />

          {history.isFetching && history.data.content.length === 0 ? (
            <PageSkeleton />
          ) : history.data.empty ? (
            <EmptyState
              icon={<AccountBalanceWalletOutlinedIcon />}
              title="No transactions yet"
              description="Buy credits to start your learning journey."
              actionLabel="Buy credits"
              onAction={() => navigate(ROUTES.CREDITS)}
            />
          ) : (
            <>
              <Stack spacing={1.25}>
                {history.data.content.map((transaction, index) => (
                  <TransactionCard key={transaction.id} transaction={transaction} index={index} />
                ))}
              </Stack>
              <Pagination
                page={page + 1}
                count={history.data.totalPages}
                totalItems={history.data.totalElements}
                pageSize={PAGE_SIZE}
                onChange={(_, value) => setPage(value - 1)}
                sx={{ mt: 2.5 }}
              />
            </>
          )}

          {history.isOffline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Showing your local wallet preview — live balance syncs when the API is reachable.
            </Typography>
          )}
        </Card>
      </motion.div>
    </Box>
  );
};

export default WalletPage;
