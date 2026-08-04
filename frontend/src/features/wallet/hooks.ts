import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService, walletService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  CreditRequest,
  PageResponse,
  Payment,
  PaymentConfirmationRequest,
  PaymentInitRequest,
  WalletBalance,
  WalletStatistics,
  WalletTransaction,
} from '@/types';
import { walletKeys } from './queryKeys';
import {
  seedPayments,
  seedWalletBalance,
  seedWalletStatistics,
  seedWalletTransactions,
} from './data';

/** Current wallet balance (offline → seed). */
export const useWalletBalanceQuery = () => {
  const query = useQuery({
    queryKey: walletKeys.balance(),
    queryFn: async () => {
      const response = await walletService.getBalance();
      return response.data.data;
    },
    placeholderData: seedWalletBalance,
    retry: 1,
  });

  const balance = (query.data ?? seedWalletBalance) as WalletBalance;
  return { ...query, balance, isOffline: query.isError };
};

/** Wallet statistics (offline → seed). */
export const useWalletStatisticsQuery = () => {
  const query = useQuery({
    queryKey: walletKeys.statistics(),
    queryFn: async () => {
      const response = await walletService.getStatistics();
      return response.data.data;
    },
    placeholderData: seedWalletStatistics,
    retry: 1,
  });

  const statistics = (query.data ?? seedWalletStatistics) as WalletStatistics;
  return { ...query, statistics, isOffline: query.isError };
};

/** Paginated wallet transaction history (offline → seed). */
export const useWalletHistoryQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: walletKeys.history(page, size),
    queryFn: async () => {
      const response = await walletService.getHistory(page, size);
      return response.data.data;
    },
    placeholderData: (): PageResponse<WalletTransaction> => {
      const content = seedWalletTransactions;
      return {
        content,
        page,
        size,
        totalElements: content.length,
        totalPages: 1,
        first: page === 0,
        last: true,
        empty: false,
      };
    },
    retry: 1,
  });

  const data = (query.data ?? {
    content: seedWalletTransactions,
    page,
    size,
    totalElements: seedWalletTransactions.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  }) as PageResponse<WalletTransaction>;

  return { ...query, data, isOffline: query.isError };
};

/** Payment history (offline → seed). */
export const usePaymentHistoryQuery = (page = 0, size = 20) => {
  const query = useQuery({
    queryKey: [...walletKeys.all, 'payments', page, size],
    queryFn: async () => {
      const response = await paymentService.getHistory(page, size);
      return response.data.data;
    },
    placeholderData: (): PageResponse<Payment> => ({
      content: seedPayments,
      page,
      size,
      totalElements: seedPayments.length,
      totalPages: 1,
      first: page === 0,
      last: true,
      empty: false,
    }),
    retry: 1,
  });

  const data = (query.data ?? {
    content: seedPayments,
    page,
    size,
    totalElements: seedPayments.length,
    totalPages: 1,
    first: true,
    last: true,
    empty: false,
  }) as PageResponse<Payment>;

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
