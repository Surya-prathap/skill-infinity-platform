import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { Stack, Stack as UiStack, Typography, Typography as UiTypography } from '@/components/ui';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import RemoveCircleOutlineOutlinedIcon from '@mui/icons-material/RemoveCircleOutlineOutlined';
import RedeemOutlinedIcon from '@mui/icons-material/RedeemOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import CurrencyExchangeOutlinedIcon from '@mui/icons-material/CurrencyExchangeOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { AdvancedDataTable, type AdminColumn, AdminTableSkeleton } from '@/components/admin';
import { DonutChart } from '@/components/charts';
import { formatCompactNumber, formatCurrency, formatDateTime } from '@/utils';
import { useAdminWalletQuery } from '@/features/admin';
import {
  useAdminWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} from '@/features/wallet';
import type { AdminWalletTransaction, Withdrawal } from '@/types';

const CATEGORY_COLOR = {
  PURCHASE: { color: 'info', label: 'Purchase' },
  REWARD: { color: 'success', label: 'Reward' },
  BONUS: { color: 'secondary', label: 'Bonus' },
  REFUND: { color: 'warning', label: 'Refund' },
  WITHDRAWAL: { color: 'error', label: 'Withdrawal' },
  SESSION: { color: 'primary', label: 'Session' },
} as const;

/**
 * Admin review of mentor withdrawal requests — shows gross/fee/net and lets
 * the admin approve or reject. Rejection returns the credits to the mentor.
 */
const WithdrawalReviewSection: React.FC = () => {
  const { data: withdrawals } = useAdminWithdrawalsQuery(0, 50);
  const approve = useApproveWithdrawalMutation();
  const reject = useRejectWithdrawalMutation();
  const [rejecting, setRejecting] = useState<Withdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pending = (withdrawals?.content ?? []).filter((w) => w.status === 'PENDING');

  const submitReject = () => {
    if (!rejecting) return;
    reject.mutate({ withdrawalId: rejecting.id, reason: rejectReason.trim() || 'Rejected by admin' });
    setRejecting(null);
    setRejectReason('');
  };

  return (
    <Box sx={{ mb: 3 }}>
      <UiStack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <CurrencyExchangeOutlinedIcon sx={{ color: '#EC4899' }} />
        <UiTypography variant="subtitle1" fontWeight={800}>
          Withdrawal requests
        </UiTypography>
        <Chip label={`${pending.length} pending`} size="small" color={pending.length > 0 ? 'warning' : 'success'} variant="outlined" sx={{ fontWeight: 800 }} />
      </UiStack>

      {pending.length === 0 ? (
        <Box sx={{ py: 3, borderRadius: 2.5, border: 1, borderStyle: 'dashed', borderColor: 'divider', textAlign: 'center' }}>
          <UiTypography variant="body2" color="text.secondary">
            No pending withdrawal requests.
          </UiTypography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {pending.map((withdrawal) => (
            <Box
              key={withdrawal.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
                p: 2,
                borderRadius: 2.5,
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'border-color 0.2s ease',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <Box sx={{ flexGrow: 1, minWidth: 220 }}>
                <UiTypography variant="body2" fontWeight={800}>
                  {withdrawal.amountCredits.toLocaleString('en-IN')} credits → {formatCurrency(withdrawal.netAmountInr)}
                </UiTypography>
                <UiTypography variant="caption" color="text.secondary">
                  Gross {formatCurrency(withdrawal.grossAmountInr)} · platform fee {formatCurrency(withdrawal.platformFeeInr)} ·{' '}
                  {withdrawal.createdAt ? formatDateTime(withdrawal.createdAt) : ''}
                </UiTypography>
                {withdrawal.bankDetails && (
                  <UiTypography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Payout: {withdrawal.bankDetails}
                  </UiTypography>
                )}
              </Box>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={approve.isPending}
                startIcon={approve.isPending && approve.variables === withdrawal.id ? <CircularProgress size={14} color="inherit" /> : undefined}
                onClick={() => approve.mutate(withdrawal.id)}
                sx={{ fontWeight: 800 }}
              >
                Approve
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={reject.isPending}
                onClick={() => setRejecting(withdrawal)}
                sx={{ fontWeight: 800 }}
              >
                Reject
              </Button>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(rejecting)} onClose={() => setRejecting(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reject withdrawal</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason"
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Invalid bank details"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejecting(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={submitReject} disabled={reject.isPending}>
            Reject & return credits
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export const WalletPage: React.FC = () => {
  useDocumentTitle('Wallet Management');
  const { transactions, stats, isLoading } = useAdminWalletQuery();
  const [categoryFilter, setCategoryFilter] = useState<string | 'ALL'>('ALL');

  const filtered = useMemo(
    () => (categoryFilter === 'ALL' ? transactions : transactions.filter((t) => t.category === categoryFilter)),
    [transactions, categoryFilter],
  );

  const usageSegments = [
    { label: 'Used', value: stats.creditsUsed, color: '#6D5DF6' },
    { label: 'Outstanding', value: stats.creditsOutstanding, color: '#14B8A6' },
  ];

  const kpis = [
    { label: 'Credits issued', value: stats.totalCreditsIssued, icon: <AddCircleOutlineOutlinedIcon />, color: '#6D5DF6' },
    { label: 'Credits used', value: stats.creditsUsed, icon: <RemoveCircleOutlineOutlinedIcon />, color: '#14B8A6' },
    { label: 'Outstanding', value: stats.creditsOutstanding, icon: <AccountBalanceWalletOutlinedIcon />, color: '#3B82F6' },
    { label: 'Rewards', value: stats.rewardsDistributed, icon: <RedeemOutlinedIcon />, color: '#F59E0B' },
    { label: 'Bonuses', value: stats.bonusesDistributed, icon: <CardGiftcardOutlinedIcon />, color: '#A855F7' },
    { label: 'Refunds', value: stats.refundsProcessed, icon: <ReplayOutlinedIcon />, color: '#EF4444' },
    { label: 'Avg balance', value: stats.averageBalance, icon: <AccountBalanceOutlinedIcon />, color: '#10B981' },
  ];

  const columns: AdminColumn<AdminWalletTransaction>[] = [
    {
      id: 'userName',
      label: 'User',
      sortable: true,
      render: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={700}>
            {row.userName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.description}
          </Typography>
        </Box>
      ),
    },
    { id: 'type', label: 'Type', align: 'center', sortable: true, render: (row) => <Chip size="small" label={row.type} variant="outlined" color={row.type === 'CREDIT' ? 'success' : 'error'} sx={{ fontWeight: 800 }} /> },
    { id: 'category', label: 'Category', align: 'center', sortable: true, render: (row) => <Chip size="small" label={CATEGORY_COLOR[row.category].label} variant="outlined" color={CATEGORY_COLOR[row.category].color} sx={{ fontWeight: 700 }} /> },
    {
      id: 'amount',
      label: 'Amount',
      align: 'right',
      sortable: true,
      sortValue: (row) => row.amount,
      render: (row) => (
        <Typography variant="body2" fontWeight={800} color={row.type === 'CREDIT' ? 'success.main' : 'error.main'}>
          {row.type === 'CREDIT' ? '+' : '−'}{row.amount.toLocaleString('en-IN')}
        </Typography>
      ),
    },
    { id: 'balance', label: 'Balance', align: 'right', sortable: true, render: (row) => <Typography variant="body2" color="text.secondary">{row.balance.toLocaleString('en-IN')} credits</Typography> },
    { id: 'createdAt', label: 'Date', sortable: true, sortValue: (row) => row.createdAt, render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.createdAt)}</Typography> },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader title="Wallet Management" subtitle="Credits, rewards, bonuses, purchases and refunds." />

      <WithdrawalReviewSection />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 6, sm: 4, lg: 3, xl: 2 }}>
            <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${kpi.color}, ${kpi.color}99)`,
                    boxShadow: `0 6px 14px ${kpi.color}3D`,
                    flexShrink: 0,
                  }}
                >
                  {kpi.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }} noWrap>
                    {kpi.label}
                  </UiTypography>
                  <UiTypography variant="subtitle1" fontWeight={800}>
                    {formatCompactNumber(kpi.value)}
                  </UiTypography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
            <UiTypography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
              Credit Usage
            </UiTypography>
            <DonutChart segments={usageSegments} size={170} centerValue={formatCompactNumber(stats.totalCreditsIssued)} centerLabel="issued" />
            <UiStack spacing={1} sx={{ mt: 2 }}>
              {usageSegments.map((segment) => (
                <UiStack key={segment.label} direction="row" alignItems="center" spacing={1}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                  <UiTypography variant="caption" fontWeight={600}>
                    {segment.label}
                  </UiTypography>
                  <UiTypography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {formatCompactNumber(segment.value)} credits
                  </UiTypography>
                </UiStack>
              ))}
            </UiStack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
            <UiStack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <UiTypography variant="subtitle1" fontWeight={700}>
                Credit Volume Trend
              </UiTypography>
              <UiTypography variant="caption" color="text.secondary">
                Monthly credit volume
              </UiTypography>
            </UiStack>
            <Box
              sx={{
                height: 230,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2.5,
                border: 1,
                borderStyle: 'dashed',
                borderColor: 'divider',
              }}
            >
              <UiTypography variant="body2" color="text.secondary">
                No credit volume data available yet.
              </UiTypography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        {(['ALL', 'PURCHASE', 'SESSION', 'REWARD', 'BONUS', 'REFUND', 'WITHDRAWAL'] as const).map((category) => (
          <Chip
            key={category}
            label={category === 'ALL' ? `All (${transactions.length})` : CATEGORY_COLOR[category].label}
            onClick={() => setCategoryFilter(category)}
            color={categoryFilter === category ? 'primary' : 'default'}
            variant={categoryFilter === category ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>

      <AdvancedDataTable<AdminWalletTransaction>
        columns={columns}
        rows={filtered}
        keyExtractor={(row) => row.id}
        searchKeys={(row) => `${row.userName} ${row.description} ${row.category} ${row.type}`}
        searchPlaceholder="Search wallet transactions…"
        selectable
        exportFilename="skill-infinity-wallet"
        maxHeight={560}
      />
    </Box>
  );
};

export default WalletPage;
