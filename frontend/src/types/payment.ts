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
