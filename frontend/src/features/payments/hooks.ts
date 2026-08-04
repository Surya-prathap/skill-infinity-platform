import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  CouponValidationRequest,
  PaymentConfirmationRequest,
  PaymentInitRequest,
  Payment,
} from '@/types';
import { paymentKeys } from './queryKeys';

/** Validate a coupon code against an amount. */
export const useValidateCouponMutation = () =>
  useMutation({
    mutationFn: async (payload: CouponValidationRequest): Promise<boolean> => {
      const response = await paymentService.validateCoupon(payload);
      return response.data.success;
    },
  });

/**
 * Full credit-purchase flow: initiate → confirm.
 * Simulates the gateway round-trip that real integrations (Stripe,
 * Razorpay, UPI) will drive on Day 14+.
 */
export const usePurchaseCredits = () => {
  const queryClient = useQueryClient();

  const initiate = useMutation({
    mutationFn: (payload: PaymentInitRequest): Promise<Payment> =>
      paymentService.initiatePayment(payload).then((response) => response.data.data),
    onError: (error) => showError(getErrorMessage(error)),
  });

  const confirm = useMutation({
    mutationFn: (payload: PaymentConfirmationRequest): Promise<Payment> =>
      paymentService.confirmPayment(payload).then((response) => response.data.data),
    onSuccess: () => {
      showSuccess('Payment successful — credits added to your wallet.');
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  return { initiate, confirm };
};

export const useInvoiceQuery = (invoiceId?: string) =>
  useQuery({
    queryKey: paymentKeys.invoice(invoiceId ?? 'none'),
    queryFn: async () => {
      const response = await paymentService.getInvoice(invoiceId!);
      return response.data.data;
    },
    enabled: Boolean(invoiceId),
    retry: 1,
  });
