import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Tab, Tabs, Tooltip } from '@mui/material';
import { Stack, Stack as UiStack, Typography, Typography as UiTypography } from '@/components/ui';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AdvancedDataTable, type AdminColumn, AdminTableSkeleton, AnimatedProgress } from '@/components/admin';
import { AreaChart } from '@/components/charts';
import { formatCurrency, formatDateTime, showSuccess } from '@/utils';
import { useAdminPaymentsQuery, useRefundMutation } from '@/features/admin';
import type { AdminPayment, AdminRefund, AdminSubscription, AdminCoupon } from '@/types';

type TabValue = 'transactions' | 'refunds' | 'subscriptions' | 'coupons';

const PAYMENT_STATUS_COLOR = {
  SUCCEEDED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  REFUNDED: 'info',
  CANCELLED: 'default',
} as const;

export const PaymentsPage: React.FC = () => {
  useDocumentTitle('Payments');
  const [tab, setTab] = useState<TabValue>('transactions');
  const { payments, refunds, subscriptions, coupons, revenue, isLoading } = useAdminPaymentsQuery();
  const refundMutation = useRefundMutation();

  const pendingRefunds = refunds.filter((refund) => refund.status === 'REQUESTED').length;

  const revenuePoints = useMemo(
    () =>
      Object.entries(revenue?.revenueByMonth ?? {}).map(([label, value]) => ({ label: label.slice(0, 3), value })),
    [revenue],
  );

  const kpis = [
    { label: 'Gross revenue', value: revenue?.monthlyRevenue ?? 0, prefix: '₹', icon: <PaymentsOutlinedIcon />, color: '#10B981' },
    { label: 'Transactions', value: payments.length, icon: <ReceiptLongOutlinedIcon />, color: '#6D5DF6' },
    { label: 'Pending refunds', value: pendingRefunds, icon: <ReplayOutlinedIcon />, color: '#F59E0B' },
    { label: 'Avg. transaction', value: revenue?.averageTransactionValue ?? 0, prefix: '₹', decimals: 2, icon: <PercentOutlinedIcon />, color: '#3B82F6' },
  ];

  const transactionColumns: AdminColumn<AdminPayment>[] = [
    { id: 'id', label: 'Reference', sortable: true, render: (row) => <Typography variant="caption" fontWeight={700} sx={{ fontFamily: 'monospace' }}>{row.id.toUpperCase()}</Typography> },
    { id: 'userName', label: 'Customer', sortable: true },
    { id: 'description', label: 'Description', render: (row) => <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>{row.description}</Typography> },
    { id: 'method', label: 'Method', align: 'center', sortable: true, render: (row) => <Chip size="small" label={row.method} variant="outlined" sx={{ fontWeight: 700 }} /> },
    { id: 'amount', label: 'Amount', align: 'right', sortable: true, sortValue: (row) => row.amount, render: (row) => <Typography variant="body2" fontWeight={800}>{formatCurrency(row.amount)}</Typography> },
    { id: 'fee', label: 'Fee', align: 'right', render: (row) => <Typography variant="caption" color="text.secondary">{formatCurrency(row.fee)}</Typography> },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={PAYMENT_STATUS_COLOR[row.status]} /> },
    { id: 'createdAt', label: 'Date', sortable: true, sortValue: (row) => row.createdAt, render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.createdAt)}</Typography> },
  ];

  const refundColumns: AdminColumn<AdminRefund>[] = [
    { id: 'userName', label: 'Customer', sortable: true },
    { id: 'amount', label: 'Amount', align: 'right', sortable: true, render: (row) => <Typography variant="body2" fontWeight={800}>{formatCurrency(row.amount)}</Typography> },
    { id: 'reason', label: 'Reason', render: (row) => <Typography variant="body2" noWrap sx={{ maxWidth: 260 }}>{row.reason}</Typography> },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={row.status === 'PROCESSED' ? 'success' : row.status === 'REQUESTED' ? 'warning' : row.status === 'APPROVED' ? 'info' : 'error'} /> },
    { id: 'requestedAt', label: 'Requested', sortable: true, render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.requestedAt)}</Typography> },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'REQUESTED' ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Approve refund">
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<CheckCircleOutlineOutlinedIcon />}
                onClick={() => refundMutation.mutate({ refundId: row.id, action: 'APPROVE' })}
              >
                Approve
              </Button>
            </Tooltip>
            <Tooltip title="Reject refund">
              <IconButtonSmall color="error" label="Reject" onClick={() => refundMutation.mutate({ refundId: row.id, action: 'REJECT' })} />
            </Tooltip>
          </Stack>
        ) : (
          <StatusBadge label="Handled" color="default" withDot={false} />
        ),
    },
  ];

  const subscriptionColumns: AdminColumn<AdminSubscription>[] = [
    { id: 'userName', label: 'Organization', sortable: true },
    { id: 'plan', label: 'Plan', sortable: true, render: (row) => <Chip size="small" label={row.plan} color="primary" variant="outlined" sx={{ fontWeight: 700 }} /> },
    { id: 'seats', label: 'Seats', align: 'center', sortable: true },
    { id: 'amount', label: 'Amount', align: 'right', sortable: true, render: (row) => <Typography variant="body2" fontWeight={800}>{formatCurrency(row.amount)}/mo</Typography> },
    { id: 'status', label: 'Status', align: 'center', sortable: true, render: (row) => <StatusBadge label={row.status} color={row.status === 'ACTIVE' ? 'success' : row.status === 'TRIAL' ? 'info' : row.status === 'PAST_DUE' ? 'warning' : 'error'} /> },
    { id: 'renewsAt', label: 'Renews', sortable: true, render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.renewsAt)}</Typography> },
  ];

  const couponColumns: AdminColumn<AdminCoupon>[] = [
    { id: 'code', label: 'Code', render: (row) => <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'monospace' }}>{row.code}</Typography> },
    { id: 'type', label: 'Type', align: 'center', render: (row) => <Chip size="small" label={row.type} variant="outlined" sx={{ fontWeight: 700 }} /> },
    { id: 'value', label: 'Value', align: 'right', render: (row) => <Typography variant="body2" fontWeight={700}>{row.type === 'PERCENT' ? `${row.value}%` : formatCurrency(row.value)}</Typography> },
    { id: 'usageCount', label: 'Usage', align: 'center', render: (row) => (
        <Box sx={{ width: 120 }}>
          <AnimatedProgress value={row.usageCount} max={row.usageLimit} label="" suffix="" color="#6D5DF6" height={6} showValue={false} />
          <Typography variant="caption" color="text.secondary">
            {row.usageCount}/{row.usageLimit}
          </Typography>
        </Box>
      ) },
    { id: 'active', label: 'Active', align: 'center', render: (row) => <StatusBadge label={row.active ? 'Active' : 'Disabled'} color={row.active ? 'success' : 'default'} /> },
    { id: 'expiresAt', label: 'Expires', render: (row) => <Typography variant="caption" color="text.secondary">{formatDateTime(row.expiresAt)}</Typography> },
  ];

  if (isLoading) return <AdminTableSkeleton />;

  return (
    <Box>
      <PageHeader
        title="Payments"
        subtitle="Transactions, refunds, subscriptions and revenue analytics."
        actions={
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => showSuccess('Payment report queued for export')}>
            Export report
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${kpi.color}, ${kpi.color}99)`,
                    boxShadow: `0 6px 16px ${kpi.color}3D`,
                  }}
                >
                  {kpi.icon}
                </Box>
                <Box>
                  <UiTypography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block' }}>
                    {kpi.label}
                  </UiTypography>
                  <UiTypography variant="h5" fontWeight={800}>
                    {kpi.prefix}
                    {kpi.value.toLocaleString('en-US', { minimumFractionDigits: kpi.decimals ?? 0, maximumFractionDigits: kpi.decimals ?? 0 })}
                  </UiTypography>
                </Box>
              </Stack>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ p: 2.5, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <UiStack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <UiTypography variant="subtitle1" fontWeight={700}>
                Revenue Trend
              </UiTypography>
              <UiTypography variant="caption" color="text.secondary">
                Monthly gross revenue
              </UiTypography>
            </UiStack>
            <AreaChart data={revenuePoints} height={220} color="#10B981" />
          </Box>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, next: TabValue) => setTab(next)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }} aria-label="Payment sections">
        <Tab label={`Transactions (${payments.length})`} value="transactions" />
        <Tab label={`Refunds (${refunds.length})`} value="refunds" />
        <Tab label={`Subscriptions (${subscriptions.length})`} value="subscriptions" />
        <Tab label={`Coupons (${coupons.length})`} value="coupons" />
      </Tabs>

      {tab === 'transactions' && (
        <AdvancedDataTable<AdminPayment>
          columns={transactionColumns}
          rows={payments}
          keyExtractor={(row) => row.id}
          searchKeys={(row) => `${row.id} ${row.userName} ${row.description} ${row.method} ${row.status}`}
          searchPlaceholder="Search transactions…"
          selectable
          exportFilename="skill-infinity-payments"
          maxHeight={560}
        />
      )}
      {tab === 'refunds' && (
        <AdvancedDataTable<AdminRefund>
          columns={refundColumns}
          rows={refunds}
          keyExtractor={(row) => row.id}
          searchKeys={(row) => `${row.userName} ${row.reason} ${row.status}`}
          searchPlaceholder="Search refunds…"
          exportFilename="skill-infinity-refunds"
          maxHeight={560}
        />
      )}
      {tab === 'subscriptions' && (
        <AdvancedDataTable<AdminSubscription>
          columns={subscriptionColumns}
          rows={subscriptions}
          keyExtractor={(row) => row.id}
          searchKeys={(row) => `${row.userName} ${row.plan} ${row.status}`}
          searchPlaceholder="Search subscriptions…"
          exportFilename="skill-infinity-subscriptions"
          maxHeight={560}
        />
      )}
      {tab === 'coupons' && (
        <AdvancedDataTable<AdminCoupon>
          columns={couponColumns}
          rows={coupons}
          keyExtractor={(row) => row.id}
          searchKeys={(row) => `${row.code} ${row.type}`}
          searchPlaceholder="Search coupons…"
          exportFilename="skill-infinity-coupons"
          maxHeight={560}
        />
      )}
    </Box>
  );
};

const IconButtonSmall: React.FC<{ color: 'error' | 'success' | 'info'; label: string; onClick: () => void }> = ({ color, label, onClick }) => (
  <Tooltip title={label}>
    <Box
      component="button"
      onClick={onClick}
      aria-label={label}
      sx={{
        width: 30,
        height: 30,
        borderRadius: 1.5,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'transparent',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: `${color}.main`,
        transition: 'background-color 0.15s ease',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <CloseOutlinedIcon sx={{ fontSize: 16 }} />
    </Box>
  </Tooltip>
);

export default PaymentsPage;
