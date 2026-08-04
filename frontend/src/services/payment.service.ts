import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  CouponValidationRequest,
  Invoice,
  PageResponse,
  Payment,
  PaymentConfirmationRequest,
  PaymentFailureRequest,
  PaymentInitRequest,
  Receipt,
  RefundRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * payment-service endpoints. Identity is resolved by the API gateway from the
 * JWT (X-User-ID header).
 */
export const paymentService = {
  initiatePayment: (payload: PaymentInitRequest) =>
    apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.INITIATE, payload),

  confirmPayment: (payload: PaymentConfirmationRequest) =>
    apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.CONFIRM, payload),

  failPayment: (payload: PaymentFailureRequest) =>
    apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.FAIL, payload),

  retryPayment: (payload: PaymentInitRequest) =>
    apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.RETRY, payload),

  requestRefund: (payload: RefundRequest) =>
    apiClient.post<ApiResponse<Payment>>(API_ENDPOINTS.PAYMENTS.REFUND, payload),

  getHistory: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PageResponse<Payment>>>(
      `${API_ENDPOINTS.PAYMENTS.HISTORY}?page=${page}&size=${size}`,
    ),

  getPayment: (paymentId: string) =>
    apiClient.get<ApiResponse<Payment>>(
      resolve(API_ENDPOINTS.PAYMENTS.ITEM, { paymentId }),
    ),

  validateCoupon: (payload: CouponValidationRequest) =>
    apiClient.post<ApiResponse<null>>(API_ENDPOINTS.PAYMENTS.COUPON, payload),

  getInvoice: (invoiceId: string) =>
    apiClient.get<ApiResponse<Invoice>>(
      resolve(API_ENDPOINTS.PAYMENTS.INVOICE, { invoiceId }),
    ),

  getReceipt: (receiptId: string) =>
    apiClient.get<ApiResponse<Receipt>>(
      resolve(API_ENDPOINTS.PAYMENTS.RECEIPT, { receiptId }),
    ),
};

export default paymentService;
