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
  currency: string;
}

export type WalletTransactionType =
  | 'CREDIT'
  | 'DEBIT'
  | 'FREEZE'
  | 'RELEASE'
  | 'REFUND'
  | 'REWARD';

export interface WalletTransaction {
  id: string;
  transactionNumber?: string;
  transactionType: WalletTransactionType | string;
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
  totalRewardsClaimed: number;
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
