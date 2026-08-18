import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';
import { paymentService, walletService } from '@/services';
import { getErrorMessage, nowInAppZone, parseApiTime, showError, showSuccess } from '@/utils';
import type {
  CreditRequest,
  PageResponse,
  Payment,
  PaymentConfirmationRequest,
  PaymentInitRequest,
  WalletBalance,
  WalletStatistics,
  WalletTransaction,
  Withdrawal,
  WithdrawalRequest,
} from '@/types';
import { walletKeys } from './queryKeys';

const emptyPage = (page: number, size: number): PageResponse<WalletTransaction> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 1,
  first: page === 0,
  last: true,
  empty: true,
});

/** Current wallet balance. */
export const useWalletBalanceQuery = (options?: { silent?: boolean }) => {
  const config: AxiosRequestConfig | undefined = options?.silent ? { silent: true } : undefined;
  const query = useQuery({
    queryKey: walletKeys.balance(),
    queryFn: async () => {
      const response = await walletService.getBalance(config);
      return response.data.data;
    },
    retry: 1,
  });

  const balance = query.data as WalletBalance | undefined;
  return { ...query, balance, isOffline: query.isError };
};

/** Wallet statistics. */
export const useWalletStatisticsQuery = () => {
  const query = useQuery({
    queryKey: walletKeys.statistics(),
    queryFn: async () => {
      const response = await walletService.getStatistics();
      return response.data.data;
    },
    retry: 1,
  });

  const statistics = query.data as WalletStatistics | undefined;
  return { ...query, statistics, isOffline: query.isError };
};

/**
 * Monthly credits-in/out series for the last `months` months, aggregated
 * from the real wallet transaction history (no seed data).
 */
export const useWalletMonthlySeriesQuery = (months = 7) => {
  const query = useQuery({
    queryKey: [...walletKeys.all, 'monthly', months],
    queryFn: async (): Promise<WalletTransaction[]> => {
      const response = await walletService.getHistory(0, 500);
      return response.data.data.content;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const series = useMemo(() => {
    const now = nowInAppZone();
    const buckets: { label: string; value: number }[] = [];
    for (let i = months - 1; i >= 0; i -= 1) {
      const monthStart = now.startOf('month').subtract(i, 'month');
      const monthEnd = monthStart.add(1, 'month');
      const monthKey = monthStart.format('MMM');
      const net = (query.data ?? []).reduce((total, tx) => {
        const at = tx.createdAt ? parseApiTime(tx.createdAt) : null;
        if (!at || at.isBefore(monthStart) || !at.isBefore(monthEnd)) return total;
        // Prefer the backend-provided direction; fall back to the known
        // credit-gaining transaction types for legacy rows.
        const direction = tx.direction?.toUpperCase();
        const isCredit =
          direction === 'CREDIT' ||
          (!direction &&
            ['CREDIT_PURCHASE', 'PROMOTIONAL_CREDIT', 'REWARD_CREDIT', 'BONUS_CREDIT', 'SESSION_PAYMENT', 'REFERRAL_REWARD', 'COUPON_REDEMPTION', 'CREDIT_REFUND']
              .includes((tx.transactionType ?? '').toUpperCase()));
        return isCredit ? total + (tx.amount ?? 0) : total - (tx.amount ?? 0);
      }, 0);
      buckets.push({ label: monthKey, value: Math.round(net * 100) / 100 });
    }
    return buckets;
  }, [query.data, months]);

  return { ...query, series, isOffline: query.isError };
};
export const useWalletHistoryQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: walletKeys.history(page, size),
    queryFn: async () => {
      const response = await walletService.getHistory(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = query.data ?? emptyPage(page, size);

  return { ...query, data, isOffline: query.isError };
};

/** Payment history. */
export const usePaymentHistoryQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: [...walletKeys.all, 'payments', page, size],
    queryFn: async () => {
      const response = await paymentService.getHistory(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = (query.data ?? emptyPage(page, size)) as PageResponse<Payment>;

  return { ...query, data, isOffline: query.isError };
};

/* ============================================================
   Mutations — credit wallet + full payment lifecycle
   ============================================================ */

export const useCreditWalletMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditRequest): Promise<WalletTransaction> =>
      walletService.credit(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Credits added to your wallet.');
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useInitiatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentInitRequest): Promise<Payment> =>
      paymentService.initiatePayment(payload).then((response) => response.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useConfirmPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PaymentConfirmationRequest): Promise<Payment> =>
      paymentService.confirmPayment(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Payment completed successfully.');
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Withdrawals — convert withdrawable credits into INR
   ============================================================ */

/** The authenticated user's withdrawal requests. */
export const useWithdrawalsQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: walletKeys.withdrawals(page, size),
    queryFn: async () => {
      const response = await walletService.getWithdrawals(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = (query.data ?? emptyPage(page, size)) as PageResponse<Withdrawal>;
  return { ...query, data, isOffline: query.isError };
};

/** Request a withdrawal of withdrawable credits (1 credit = ₹10, 10% fee). */
export const useRequestWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: WithdrawalRequest): Promise<Withdrawal> =>
      walletService.requestWithdrawal(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Withdrawal requested — pending admin review.');
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/* ============================================================
   Admin withdrawal review (wallet-service admin endpoints)
   ============================================================ */

export const useAdminWithdrawalsQuery = (page = 0, size = 50) => {
  const query = useQuery({
    queryKey: [...walletKeys.all, 'admin', 'withdrawals', page, size],
    queryFn: async () => {
      const response = await walletService.adminGetWithdrawals(page, size);
      return response.data.data;
    },
    retry: 1,
  });

  const data = (query.data ?? emptyPage(page, size)) as PageResponse<Withdrawal>;
  return { ...query, data, isOffline: query.isError };
};

export const useApproveWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (withdrawalId: string): Promise<Withdrawal> =>
      walletService.adminApproveWithdrawal(withdrawalId).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Withdrawal approved.');
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useRejectWithdrawalMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ withdrawalId, reason }: { withdrawalId: string; reason: string }): Promise<Withdrawal> =>
      walletService.adminRejectWithdrawal(withdrawalId, reason).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Withdrawal rejected — credits returned to the mentor.');
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};
