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
} from '@/types';

/**
 * wallet-service endpoints. The wallet is resolved from the JWT via the
 * X-User-ID header injected by the API gateway.
 */
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
};

export default walletService;
