import { useMemo, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip } from '@mui/material';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Card, Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdminTableSkeleton } from '@/components/admin';
import { formatCurrency, formatRelativeTime } from '@/utils';
import {
  useAdminWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} from '@/features/wallet';
import type { Withdrawal } from '@/types';

/**
 * Admin withdrawal review — the "Platform pays the mentor" step.
 *
 * Pending requests show the gross/net split (₹10/credit, 10% platform fee)
 * computed by the wallet-service. Approving finalizes the payout; rejecting
 * returns the held credits to the mentor's withdrawable balance.
 */
export const WithdrawalsPage: React.FC = () => {
  useDocumentTitle('Withdrawal Requests');
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('PENDING');
  const [rejectTarget, setRejectTarget] = useState<Withdrawal | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isOffline } = useAdminWithdrawalsQuery(0, 100);
  const approveMutation = useApproveWithdrawalMutation();
  const rejectMutation = useRejectWithdrawalMutation();

  const rows = useMemo(() => {
    const all = data.content ?? [];
    return filter === 'PENDING' ? all.filter((w) => w.status === 'PENDING') : all;
  }, [data.content, filter]);

  const pendingCount = useMemo(() => (data.content ?? []).filter((w) => w.status === 'PENDING').length, [data.content]);

  const confirmReject = () => {
    if (!rejectTarget) return;
    rejectMutation.mutate({ withdrawalId: rejectTarget.id, reason: rejectReason.trim() || 'Rejected by admin' });
    setRejectTarget(null);
    setRejectReason('');
  };

  return (
    <Box>
      <PageHeader
        title="Withdrawals"
        subtitle="Review mentor payout requests — 1 credit = ₹10, platform fee 10%."
        actions={
          <Stack direction="row" gap={1}>
            <Chip
              label={`${pendingCount} pending`}
              color="warning"
              variant={filter === 'PENDING' ? 'filled' : 'outlined'}
              onClick={() => setFilter('PENDING')}
            />
            <Chip
              label="All requests"
              color="default"
              variant={filter === 'ALL' ? 'filled' : 'outlined'}
              onClick={() => setFilter('ALL')}
            />
          </Stack>
        }
      />

      {isLoading ? (
        <AdminTableSkeleton />
      ) : isOffline ? (
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">Could not load withdrawals. Check the wallet-service.</Typography>
        </Card>
      ) : rows.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center' }}>
          <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography variant="h6" fontWeight={800}>
            No withdrawal requests
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {filter === 'PENDING'
              ? 'Mentors with 10+ withdrawable credits will appear here when they request a payout.'
              : 'No withdrawal requests have been made yet.'}
          </Typography>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((withdrawal) => (
            <Card key={withdrawal.id} sx={{ p: 2.5 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                gap={2}
                sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
              >
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                    <Typography variant="subtitle2" fontWeight={800}>
                      {withdrawal.amountCredits} credits
                    </Typography>
                    <StatusBadge
                      label={withdrawal.status}
                      color={
                        withdrawal.status === 'PENDING'
                          ? 'warning'
                          : withdrawal.status === 'REJECTED'
                            ? 'error'
                            : 'success'
                      }
                    />
                    {withdrawal.transactionRef && (
                      <Typography variant="caption" color="text.secondary">
                        {withdrawal.transactionRef}
                      </Typography>
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Gross {formatCurrency(withdrawal.grossAmountInr, 'INR')} → fee{' '}
                    {formatCurrency(withdrawal.platformFeeInr, 'INR')} → net{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {formatCurrency(withdrawal.netAmountInr, 'INR')}
                    </Box>
                  </Typography>
                  {withdrawal.bankDetails && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {withdrawal.bankDetails}
                    </Typography>
                  )}
                  {withdrawal.rejectionReason && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                      Rejected: {withdrawal.rejectionReason}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ textAlign: { md: 'right' } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {withdrawal.createdAt ? formatRelativeTime(withdrawal.createdAt) : ''}
                  </Typography>
                  {withdrawal.status === 'PENDING' && (
                    <Stack direction="row" gap={1} sx={{ mt: 1, justifyContent: { md: 'flex-end' } }}>
                      <Tooltip title="Release the payout to the mentor">
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleOutlineOutlinedIcon />}
                          disabled={approveMutation.isPending}
                          onClick={() => approveMutation.mutate(withdrawal.id)}
                        >
                          Approve
                        </Button>
                      </Tooltip>
                      <Tooltip title="Return the credits to the mentor's withdrawable balance">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CloseOutlinedIcon />}
                          onClick={() => setRejectTarget(withdrawal)}
                        >
                          Reject
                        </Button>
                      </Tooltip>
                    </Stack>
                  )}
                </Box>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reject withdrawal</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The {rejectTarget?.amountCredits} held credits will be returned to the mentor&apos;s withdrawable balance.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Reason (optional)"
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmReject}
            disabled={rejectMutation.isPending}
          >
            Reject request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WithdrawalsPage;
