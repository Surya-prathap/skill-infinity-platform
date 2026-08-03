import { Box, Button, Grid } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import AddIcon from '@mui/icons-material/Add';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useState } from 'react';
import { Card, DataTable, PageHeader, Pagination, StatusBadge } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { formatCurrency } from '@/utils';
import { showInfo } from '@/utils';

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'Completed' | 'Pending';
}

const TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Session with Alex Rivera', date: 'Aug 6, 2026', amount: -40, type: 'debit', status: 'Completed' },
  { id: '2', description: 'Credit top-up', date: 'Aug 4, 2026', amount: 100, type: 'credit', status: 'Completed' },
  { id: '3', description: 'Referral bonus', date: 'Aug 2, 2026', amount: 50, type: 'credit', status: 'Completed' },
  { id: '4', description: 'Session with Emily Watson', date: 'Jul 30, 2026', amount: -35, type: 'debit', status: 'Completed' },
  { id: '5', description: 'Mentor payout', date: 'Jul 28, 2026', amount: 120, type: 'credit', status: 'Pending' },
];

export const WalletPage: React.FC = () => {
  useDocumentTitle('Wallet');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  return (
    <Box>
      <PageHeader
        title="Wallet"
        subtitle="Manage your credits, track transactions and top up anytime."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => showInfo('Top-up flow ships with the Payment feature.')}>
            Top Up
          </Button>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            gradient
            sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>
                Available Balance
              </Typography>
              <AccountBalanceWalletOutlinedIcon />
            </Stack>
            <Typography variant="h3" fontWeight={800} sx={{ my: 2 }}>
              {formatCurrency(248)}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: 'rgba(255,255,255,0.18)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.28)' } }}
                onClick={() => showInfo('Top-up flow ships with the Payment feature.')}
              >
                Deposit
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff', '&:hover': { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.08)' } }}
                onClick={() => showInfo('Withdrawal flow ships with the Payment feature.')}
              >
                Withdraw
              </Button>
            </Stack>
          </Card>

          <Card sx={{ p: 3, mt: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <TrendingUpIcon color="success" />
              <Typography variant="subtitle1" fontWeight={700}>
                Monthly Activity
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              You earned {formatCurrency(220)} and spent {formatCurrency(75)} this month.
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
              Transaction History
            </Typography>
            <DataTable<Transaction>
              columns={[
                { id: 'description', label: 'Description' },
                { id: 'date', label: 'Date' },
                {
                  id: 'amount',
                  label: 'Amount',
                  align: 'right',
                  render: (row) => (
                    <Typography variant="body2" fontWeight={700} color={row.type === 'credit' ? 'success.main' : 'text.primary'}>
                      {row.type === 'credit' ? '+' : '−'}
                      {formatCurrency(Math.abs(row.amount))}
                    </Typography>
                  ),
                },
                {
                  id: 'status',
                  label: 'Status',
                  align: 'center',
                  render: (row) => (
                    <StatusBadge
                      label={row.status}
                      color={row.status === 'Completed' ? 'success' : 'warning'}
                    />
                  ),
                },
              ]}
              rows={TRANSACTIONS}
              keyExtractor={(row) => row.id}
            />
            <Pagination
              page={page}
              count={2}
              totalItems={TRANSACTIONS.length}
              pageSize={pageSize}
              onChange={(_, value) => setPage(value)}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WalletPage;
