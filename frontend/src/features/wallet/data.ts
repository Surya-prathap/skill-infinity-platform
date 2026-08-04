import type {
  Payment,
  WalletBalance,
  WalletStatistics,
  WalletTransaction,
} from '@/types';

/* ============================================================
   Seed wallet data — dashboard, history and statistics work
   offline and upgrade to live wallet-service data seamlessly.
   ============================================================ */

export const seedWalletBalance: WalletBalance = {
  id: 'wallet-1',
  currentBalance: 248,
  availableBalance: 248,
  frozenBalance: 0,
  pendingBalance: 0,
  currency: 'USD',
};

export const seedWalletStatistics: WalletStatistics = {
  totalTransactions: 24,
  successfulTransactions: 22,
  failedTransactions: 2,
  totalCreditsIn: 620,
  totalCreditsOut: 372,
  averageTransactionAmount: 41.5,
  largestCredit: 200,
  largestDebit: 75,
  totalRewardsClaimed: 3,
  activeDays: 34,
  lastActivityDate: new Date().toISOString(),
};

const daysAgoIso = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const seedWalletTransactions: WalletTransaction[] = [
  { id: 't-001', transactionNumber: 'TXN-88231', transactionType: 'CREDIT', status: 'COMPLETED', amount: 200, balanceAfter: 200, currency: 'USD', description: 'Credit top-up — Pro Pack', referenceType: 'PAYMENT', createdAt: daysAgoIso(14) },
  { id: 't-002', transactionNumber: 'TXN-88277', transactionType: 'DEBIT', status: 'COMPLETED', amount: 75, balanceAfter: 125, currency: 'USD', description: 'Session with Alex Rivera', referenceType: 'SESSION', sessionId: 's-001', createdAt: daysAgoIso(9) },
  { id: 't-003', transactionNumber: 'TXN-88312', transactionType: 'CREDIT', status: 'COMPLETED', amount: 50, balanceAfter: 175, currency: 'USD', description: 'Referral bonus', referenceType: 'REWARD', createdAt: daysAgoIso(6) },
  { id: 't-004', transactionNumber: 'TXN-88344', transactionType: 'DEBIT', status: 'COMPLETED', amount: 65, balanceAfter: 110, currency: 'USD', description: 'Session with Emily Watson', referenceType: 'SESSION', sessionId: 's-002', createdAt: daysAgoIso(4) },
  { id: 't-005', transactionNumber: 'TXN-88360', transactionType: 'DEBIT', status: 'COMPLETED', amount: 40, balanceAfter: 70, currency: 'USD', description: 'Session with Sarah Chen', referenceType: 'SESSION', sessionId: 's-005', createdAt: daysAgoIso(2) },
  { id: 't-006', transactionNumber: 'TXN-88389', transactionType: 'CREDIT', status: 'COMPLETED', amount: 178, balanceAfter: 248, currency: 'USD', description: 'Credit top-up — Starter Pack', referenceType: 'PAYMENT', createdAt: daysAgoIso(1) },
  { id: 't-007', transactionNumber: 'TXN-88401', transactionType: 'REWARD', status: 'PENDING', amount: 20, balanceAfter: 268, currency: 'USD', description: 'Weekly learning streak reward', referenceType: 'REWARD', createdAt: daysAgoIso(0) },
];

export const seedPayments: Payment[] = [
  { id: 'pay-001', userId: 'u-me', paymentNumber: 'PAY-2026-0001', status: 'COMPLETED', amount: 200, currency: 'USD', credits: 200, discountAmount: 0, taxAmount: 0, totalAmount: 200, description: 'Credit top-up — Pro Pack', referenceType: 'CREDIT_PURCHASE', gateway: 'STRIPE', paidAt: daysAgoIso(14), createdAt: daysAgoIso(14) },
  { id: 'pay-002', userId: 'u-me', paymentNumber: 'PAY-2026-0002', status: 'COMPLETED', amount: 178, currency: 'USD', credits: 150, discountAmount: 22, taxAmount: 0, totalAmount: 178, description: 'Credit top-up — Starter Pack (WELCOME15)', referenceType: 'CREDIT_PURCHASE', couponCode: 'WELCOME15', gateway: 'RAZORPAY', paidAt: daysAgoIso(1), createdAt: daysAgoIso(1) },
];

export const seedWalletMonthlySeries = [
  { label: 'Jan', value: 320 },
  { label: 'Feb', value: 410 },
  { label: 'Mar', value: 280 },
  { label: 'Apr', value: 520 },
  { label: 'May', value: 460 },
  { label: 'Jun', value: 620 },
  { label: 'Jul', value: 540 },
] as const;

export const seedCreditPacks = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 150,
    price: 178,
    originalPrice: 200,
    savings: 22,
    features: ['150 credits', 'Valid 12 months', 'Email support'],
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 400,
    price: 440,
    originalPrice: 520,
    savings: 80,
    features: ['400 credits', 'Valid 12 months', 'Priority support', 'Free reschedule'],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 1000,
    price: 950,
    originalPrice: 1200,
    savings: 250,
    features: ['1000 credits', 'Valid 24 months', 'Dedicated manager', 'Team analytics'],
    highlighted: false,
  },
] as const;

export const seedPaymentMethods = [
  { id: 'card-1', type: 'CARD', label: 'Visa •••• 4242', brand: 'Visa', last4: '4242', expiry: '08/28', icon: 'visa' },
  { id: 'upi-1', type: 'UPI', label: 'name@okbank', icon: 'upi' },
  { id: 'netbanking', type: 'NET_BANKING', label: 'HDFC Bank', icon: 'bank' },
  { id: 'wallet', type: 'WALLET', label: 'Paytm Wallet', icon: 'wallet' },
] as const;
