import { useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Tab, Tabs, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { PageHeader } from '@/components/common';
import { TransactionCard } from '@/components/wallet';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { Pagination } from '@/components/ui/Pagination';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { usePaymentHistoryQuery, useWalletHistoryQuery } from '@/features/wallet';
import { formatDateTime } from '@/utils';
import type { Payment, WalletTransaction } from '@/types';

const toWalletTransaction = (payment: Payment): WalletTransaction => ({
  id: payment.id,
  transactionNumber: payment.paymentNumber,
  transactionType: payment.referenceType === 'CREDIT_PURCHASE' ? 'CREDIT' : 'DEBIT',
  status: payment.status,
  amount: payment.totalAmount ?? payment.amount,
  currency: payment.currency,
  description: payment.description ?? 'Payment',
  referenceType: payment.referenceType,
  createdAt: payment.createdAt,
});

const PAGE_SIZE = 8;

export const TransactionHistoryPage: React.FC = () => {
  useDocumentTitle('Transactions');
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const walletHistory = useWalletHistoryQuery(page, PAGE_SIZE);
  const paymentHistory = usePaymentHistoryQuery(page, PAGE_SIZE);

  const filteredWallet = useMemo(() => {
    const rows = walletHistory.data.content;
    const q = search.toLowerCase();
    return rows.filter((row) => {
      const matchesType = typeFilter === 'ALL' || row.transactionType === typeFilter;
      const matchesSearch =
        !q ||
        (row.description ?? '').toLowerCase().includes(q) ||
        (row.transactionNumber ?? '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [walletHistory.data.content, search, typeFilter]);

  const exportCsv = () => {
    const rows = walletHistory.data.content;
    const header = 'Transaction,Type,Status,Amount,Currency,Description,Date';
    const lines = rows.map((row) =>
      [
        row.transactionNumber ?? '',
        row.transactionType,
        row.status,
        row.amount,
        row.currency ?? 'USD',
        (row.description ?? '').replace(/,/g, ' '),
        formatDateTime(row.createdAt),
      ].join(','),
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'transactions.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const isWalletTab = tab === 0;
  const loading = isWalletTab ? walletHistory.isFetching : paymentHistory.isFetching;
  const offline = isWalletTab ? walletHistory.isOffline : paymentHistory.isOffline;
  const rows = isWalletTab
    ? filteredWallet
    : paymentHistory.data.content.map(toWalletTransaction);
  const empty = isWalletTab ? filteredWallet.length === 0 : paymentHistory.data.empty;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.WALLET)} sx={{ mb: 2.5 }}>
        Back to wallet
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <PageHeader
          title="Transaction history"
          subtitle="Every credit movement and payment, in one timeline."
          actions={
            <>
              <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={exportCsv}>
                Export CSV
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

        <Card sx={{ p: { xs: 2, md: 3.5 } }}>
          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value as number);
              setPage(0);
            }}
            sx={{ mb: 3 }}
          >
            <Tab label="Wallet transactions" />
            <Tab label="Payments" />
          </Tabs>

          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ mb: 3, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                },
              }}
              sx={{ maxWidth: 340 }}
            />
            <TextField
              select
              size="small"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ minWidth: 180 }}
              disabled={!isWalletTab}
            >
              <MenuItem value="ALL">All types</MenuItem>
              <MenuItem value="CREDIT">Credits</MenuItem>
              <MenuItem value="DEBIT">Debits</MenuItem>
              <MenuItem value="REWARD">Rewards</MenuItem>
              <MenuItem value="REFUND">Refunds</MenuItem>
            </TextField>
            <Box sx={{ flexGrow: 1 }} />
            <Chip
              size="small"
              icon={<ReceiptLongOutlinedIcon />}
              label={`${isWalletTab ? walletHistory.data.totalElements : paymentHistory.data.totalElements} records`}
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          {loading && rows.length === 0 ? (
            <PageSkeleton />
          ) : empty ? (
            <EmptyState
              icon={<ReceiptLongOutlinedIcon />}
              title="No transactions found"
              description={search ? 'Try a different search or filter.' : 'Your wallet activity will appear here.'}
              actionLabel="Buy credits"
              onAction={() => navigate(ROUTES.CREDITS)}
            />
          ) : (
            <>
              <Stack spacing={1.25}>
                {rows.map((row, index) => (
                  <TransactionCard key={row.id} transaction={row} index={index} />
                ))}
              </Stack>

              {isWalletTab && (
                <Pagination
                  page={page + 1}
                  count={walletHistory.data.totalPages}
                  totalItems={walletHistory.data.totalElements}
                  pageSize={PAGE_SIZE}
                  onChange={(_, value) => setPage(value - 1)}
                  sx={{ mt: 2.5 }}
                />
              )}
            </>
          )}

          {offline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Showing your local transaction preview — live data syncs when the API is reachable.
            </Typography>
          )}
        </Card>
      </motion.div>
    </Box>
  );
};

export default TransactionHistoryPage;
