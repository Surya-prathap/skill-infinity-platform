/**
 * Wallet domain types — mirror the wallet-service DTOs
 * (WalletBalanceResponse, TransactionResponse, WalletStatisticsResponse,
 * CreditRequest, DebitRequest).
 */

export interface WalletBalance {
  id?: string;
  currentBalance: number;
  availableBalance: number;
  frozenBalance: number;
  pendingBalance: number;
  /** Credit-type buckets — Welcome, Purchased, Learning, Withdrawable. */
  welcomeBalance?: number;
  purchasedBalance?: number;
  learningBalance?: number;
  withdrawableBalance?: number;
  currency: string;
}

export type WalletTransactionType =
  | 'CREDIT'
  | 'DEBIT'
  | 'FREEZE'
  | 'RELEASE'
  | 'REFUND'
  | 'REWARD';

/** Reliable credit direction provided by the backend — the UI renders from this. */
export type TransactionDirection = 'CREDIT' | 'DEBIT' | 'HOLD';

export interface WalletTransaction {
  id: string;
  transactionNumber?: string;
  transactionType: WalletTransactionType | string;
  /** 'CREDIT' = gained, 'DEBIT' = spent, 'HOLD' = frozen/released. */
  direction?: TransactionDirection | string;
  status: string;
  amount: number;
  balanceBefore?: number;
  balanceAfter?: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  referenceType?: string;
  sessionId?: string;
  mentorId?: string;
  paymentGatewayRef?: string;
  failureReason?: string;
  createdAt?: string;
}

export interface WalletStatistics {
  id?: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalCreditsIn: number;
  totalCreditsOut: number;
  averageTransactionAmount: number;
  largestCredit: number;
  largestDebit: number;
  activeDays: number;
  lastActivityDate?: string;
}

export interface Wallet {
  id?: string;
  userId?: string;
  availableBalance: number;
  frozenBalance: number;
  pendingBalance: number;
  totalCreditsIn?: number;
  totalCreditsOut?: number;
  currency?: string;
  status?: string;
  createdAt?: string;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface CreditRequest {
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  creditType?: 'WELCOME' | 'PURCHASED' | 'LEARNING' | 'WITHDRAWABLE';
  sessionId?: string;
  mentorId?: string;
  paymentGatewayRef?: string;
}

export interface DebitRequest {
  amount: number;
  description: string;
  referenceId?: string;
  referenceType?: string;
  sessionId?: string;
  mentorId?: string;
}

/* ---------------- Withdrawals ---------------- */

export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface WithdrawalRequest {
  amountCredits: number;
  bankDetails?: string;
}

export interface Withdrawal {
  id: string;
  userId?: string;
  amountCredits: number;
  grossAmountInr: number;
  platformFeeInr: number;
  netAmountInr: number;
  status: WithdrawalStatus;
  bankDetails?: string;
  rejectionReason?: string;
  transactionRef?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
}
