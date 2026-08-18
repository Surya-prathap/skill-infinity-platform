import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services';
import { openRazorpayCheckout } from '@/services/razorpay';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  CouponValidationRequest,
  CreditPackage,
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

/* ============================================================
   Razorpay (INR, test mode) — credit purchases + subscriptions
   ============================================================ */

/** Backend-controlled credit packages (the backend decides credits + price). */
export const useCreditPackagesQuery = () =>
  useQuery({
    queryKey: paymentKeys.packages(),
    queryFn: async (): Promise<CreditPackage[]> => {
      const response = await paymentService.getCreditPackages();
      return response.data.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

interface RazorpayPurchaseOptions {
  packageCode: string;
  couponCode?: string;
  prefill?: { name?: string; email?: string; contact?: string };
}

/**
 * Full Razorpay credit purchase: create order → checkout → server-side verify.
 * The final amount is decided by the backend (package + discounts); the UI
 * never sends a price.
 */
export const useRazorpayCreditPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: RazorpayPurchaseOptions): Promise<Payment> => {
      const orderResponse = await paymentService.createRazorpayOrder({
        packageCode: options.packageCode,
        couponCode: options.couponCode,
      });
      const order = orderResponse.data.data;
      if (!order) {
        throw new Error('Payment could not be initiated. Please try again.');
      }

      const result = await openRazorpayCheckout({
        mode: 'order',
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Skill Infinity',
        description: `${order.credits ?? 0} credits purchase`,
        prefill: options.prefill,
      });

      const verifyResponse = await paymentService.verifyRazorpayPayment({
        paymentId: order.paymentId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpayOrderId: result.razorpayOrderId,
        razorpaySignature: result.razorpaySignature,
      });
      return verifyResponse.data.data!;
    },
    onSuccess: () => {
      showSuccess('Payment successful. Purchased credits have been added to your wallet.');
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/**
 * Razorpay subscription purchase: checkout → server-side verify → subscription
 * activated. The checkout uses the SAME one-time order flow as credit
 * purchases (the Razorpay test account has no recurring subscription API
 * access) — the backend creates the order, the frontend opens the checkout,
 * and the backend verifies the signature and activates the plan. Mentor plans
 * are validated server-side.
 */
export const useRazorpaySubscriptionPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const checkoutResponse = await paymentService.createSubscriptionCheckout(planId);
      const checkout = checkoutResponse.data.data;
      if (!checkout) {
        throw new Error('Subscription could not be initiated. Please try again.');
      }

      const result = await openRazorpayCheckout({
        mode: 'order',
        keyId: checkout.keyId,
        orderId: checkout.orderId,
        amount: checkout.amount,
        currency: checkout.currency,
        name: 'Skill Infinity',
        description: checkout.planName ? `${checkout.planName} subscription` : 'Subscription',
      });

      const verifyResponse = await paymentService.verifySubscriptionPayment({
        paymentId: checkout.paymentId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpayOrderId: result.razorpayOrderId,
        razorpaySignature: result.razorpaySignature,
      });
      return verifyResponse.data.data;
    },
    onSuccess: () => {
      showSuccess('Subscription activated — enjoy your benefits!');
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
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
