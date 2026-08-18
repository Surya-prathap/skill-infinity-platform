/**
 * Razorpay Checkout (TEST MODE) helper.
 *
 * Loads the official checkout script once, then opens a checkout for either a
 * one-time order (credit purchase) or a recurring subscription. The Key ID and
 * order/subscription details come from the payment-service; the Key Secret is
 * never present in the browser.
 */

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

interface RazorpayInstance {
  open: () => void;
  on?: (event: string, handler: (response: Record<string, string>) => void) => void;
}

export interface RazorpayCheckoutResult {
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySubscriptionId?: string;
  razorpaySignature: string;
}

export interface OpenRazorpayCheckoutOptions {
  /** 'order' for one-time credit purchases, 'subscription' for recurring plans. */
  mode: 'order' | 'subscription';
  keyId: string;
  /** Amount in paise — the backend always decides the charge. */
  amount: number;
  currency: string;
  orderId?: string;
  subscriptionId?: string;
  name?: string;
  description?: string;
  prefill?: { name?: string; email?: string; contact?: string };
  themeColor?: string;
}

let checkoutPromise: Promise<void> | null = null;

/** Loads the Razorpay checkout script exactly once. */
const loadCheckoutScript = (): Promise<void> => {
  if (window.Razorpay) return Promise.resolve();
  if (checkoutPromise) return checkoutPromise;

  checkoutPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      checkoutPromise = null;
      reject(new Error('Could not load the Razorpay checkout. Please check your connection.'));
    };
    document.head.appendChild(script);
  });
  return checkoutPromise;
};

/**
 * Opens the Razorpay checkout and resolves with the payment payload returned
 * by Razorpay's handler. Rejects when the user closes the modal without paying
 * (so the UI can show "Payment cancelled" instead of success).
 */
export const openRazorpayCheckout = (options: OpenRazorpayCheckoutOptions): Promise<RazorpayCheckoutResult> =>
  loadCheckoutScript().then(
    () =>
      new Promise<RazorpayCheckoutResult>((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error('Razorpay checkout is unavailable.'));
          return;
        }

        const checkoutOptions: Record<string, unknown> = {
          key: options.keyId,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name || 'Skill Infinity',
          description: options.description || 'Payment',
          theme: { color: options.themeColor || '#6D5DF6' },
          prefill: options.prefill ?? {},
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled.')),
          },
          handler: (response: Record<string, string>) => {
            resolve({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            });
          },
        };

        if (options.mode === 'order' && options.orderId) {
          checkoutOptions.order_id = options.orderId;
        } else if (options.mode === 'subscription' && options.subscriptionId) {
          checkoutOptions.subscription_id = options.subscriptionId;
        } else {
          reject(new Error('Missing checkout identifier (order or subscription).'));
          return;
        }

        try {
          const checkout = new window.Razorpay(checkoutOptions);
          checkout.open();
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Could not open the Razorpay checkout.'));
        }
      }),
  );

export default openRazorpayCheckout;
