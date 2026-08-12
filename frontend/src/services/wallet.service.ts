import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  CreditRequest,
  DebitRequest,
  PageResponse,
  Wallet,
  WalletBalance,
  WalletStatistics,
  WalletTransaction,
  Withdrawal,
  WithdrawalRequest,
} from '@/types';

/**
 * wallet-service endpoints. The wallet is resolved from the JWT via the
 * X-User-ID header injected by the API gateway.
 */
const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

export const walletService = {
  getWallet: () => apiClient.get<ApiResponse<Wallet>>(API_ENDPOINTS.WALLET.BASE),

  getBalance: () =>
    apiClient.get<ApiResponse<WalletBalance>>(API_ENDPOINTS.WALLET.BALANCE),

  getHistory: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<WalletTransaction>>>(
      `${API_ENDPOINTS.WALLET.HISTORY}?page=${page}&size=${size}`,
    ),

  getStatement: (startDate: string, endDate: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<WalletTransaction>>>(
      `${API_ENDPOINTS.WALLET.STATEMENT}?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`,
    ),

  getStatistics: () =>
    apiClient.get<ApiResponse<WalletStatistics>>(API_ENDPOINTS.WALLET.STATISTICS),

  credit: (payload: CreditRequest) =>
    apiClient.post<ApiResponse<WalletTransaction>>(API_ENDPOINTS.WALLET.CREDIT, payload),

  debit: (payload: DebitRequest) =>
    apiClient.post<ApiResponse<WalletTransaction>>(API_ENDPOINTS.WALLET.DEBIT, payload),

  /* ---------------- Withdrawals ---------------- */

  requestWithdrawal: (payload: WithdrawalRequest) =>
    apiClient.post<ApiResponse<Withdrawal>>(API_ENDPOINTS.WALLET.WITHDRAWALS, payload),

  getWithdrawals: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Withdrawal>>>(
      `${API_ENDPOINTS.WALLET.WITHDRAWALS}?page=${page}&size=${size}`,
    ),

  /* ---------------- Admin withdrawals ---------------- */

  adminGetWithdrawals: (page = 0, size = 50) =>
    apiClient.get<ApiResponse<PageResponse<Withdrawal>>>(
      `${API_ENDPOINTS.WALLET.ADMIN_WITHDRAWALS}?page=${page}&size=${size}`,
    ),

  adminApproveWithdrawal: (withdrawalId: string) =>
    apiClient.put<ApiResponse<Withdrawal>>(
      resolve(API_ENDPOINTS.WALLET.ADMIN_WITHDRAWAL_APPROVE, { withdrawalId }),
    ),

  adminRejectWithdrawal: (withdrawalId: string, reason: string) =>
    apiClient.put<ApiResponse<Withdrawal>>(
      `${resolve(API_ENDPOINTS.WALLET.ADMIN_WITHDRAWAL_REJECT, { withdrawalId })}?reason=${encodeURIComponent(reason)}`,
    ),
};

export default walletService;
