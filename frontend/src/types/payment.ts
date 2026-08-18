/**
 * Payment domain types — mirror the payment-service DTOs
 * (PaymentResponse, InvoiceResponse, ReceiptResponse, TransactionResponse,
 * PaymentRequest, PaymentConfirmationRequest, CouponRequest, RefundRequest).
 */

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type PaymentGateway =
  | 'INTERNAL'
  | 'STRIPE'
  | 'RAZORPAY'
  | 'PAYPAL'
  | 'UPI'
  | 'CARD';

export interface Payment {
  id: string;
  userId: string;
  paymentNumber?: string;
  status: PaymentStatus | string;
  amount: number;
  currency?: string;
  credits?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  couponCode?: string;
  gateway?: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  failureReason?: string;
  refundedAmount?: number;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  paymentId: string;
  userId?: string;
  status?: string;
  amount: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  currency?: string;
  description?: string;
  issuedAt?: string;
  dueDate?: string;
  paidAt?: string;
}

export interface Receipt {
  id: string;
  receiptNumber?: string;
  paymentId?: string;
  invoiceId?: string;
  userId?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  gatewayTransactionId?: string;
  issuedAt?: string;
}

export interface PaymentTransaction {
  id: string;
  transactionNumber?: string;
  transactionType?: string;
  status?: string;
  amount: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  createdAt?: string;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface PaymentInitRequest {
  amount: number;
  /** Number of credits purchased with this payment (pack credits, not INR). */
  credits?: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  couponCode?: string;
  gateway?: string;
  subscriptionPlanId?: string;
}

export interface PaymentConfirmationRequest {
  paymentId: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  gatewayTransactionId?: string;
}

export interface PaymentFailureRequest {
  paymentId: string;
  failureReason?: string;
  failureCode?: string;
  gatewayResponse?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: string;
}

export interface CouponValidationRequest {
  couponCode: string;
  amount: number;
  userId?: string;
}

/* ---------------- Subscriptions ---------------- */

export interface SubscriptionPlan {
  id: string;
  name: string;
  /** Audience this plan targets — 'LEARNER' or 'MENTOR'. */
  type?: 'LEARNER' | 'MENTOR';
  description?: string;
  price: number;
  currency?: string;
  durationDays?: number;
  maxSessionsPerMonth?: number;
  features?: string[];
  active?: boolean;
}

export interface MySubscription {
  subscriptionId: string;
  plan: SubscriptionPlan;
  status: string;
  startedAt?: string;
  expiresAt?: string;
  autoRenew?: boolean;
}

export interface SubscriptionPurchaseRequest {
  planId: string;
  couponCode?: string;
}

/* ---------------- Razorpay (INR, test mode) ---------------- */

/** Backend-controlled credit package — the backend decides credits + price. */
export interface CreditPackage {
  code: string;
  name: string;
  credits: number;
  price: number;
  currency?: string;
  highlighted?: boolean;
  features?: string[];
  active?: boolean;
}

/** Razorpay order details for opening the checkout. */
export interface RazorpayOrder {
  paymentId: string;
  orderId: string;
  /** Amount in paise (₹109 → 10900). */
  amount: number;
  currency: string;
  /** Razorpay Key ID — safe for the browser. */
  keyId: string;
  credits?: number;
  discountAmount?: number;
  totalAmount?: number;
}

export interface RazorpayVerifyRequest {
  paymentId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature: string;
}

/** Razorpay subscription checkout details (order-based, same as credit purchase). */
export interface RazorpaySubscriptionCheckout {
  paymentId: string;
  orderId: string;
  keyId: string;
  planId?: string;
  planName?: string;
  amount: number;
  currency: string;
  totalCount?: number;
}

export interface RazorpaySubscriptionVerifyRequest {
  paymentId: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature: string;
}

export interface CreditPurchaseRequest {
  packageCode: string;
  couponCode?: string;
}
