import type { Payment, WalletBalance, WalletStatistics, WalletTransaction } from '@/types';

/* ============================================================
   Empty typed defaults — the wallet, payments and history pages
   render honest empty states until the wallet / payment services
   return real data. No fabricated transactions or balances.
   ============================================================ */

export const seedWalletBalance: WalletBalance | null = null;
export const seedWalletStatistics: WalletStatistics | null = null;
export const seedWalletTransactions: WalletTransaction[] = [];
export const seedPayments: Payment[] = [];
export const seedWalletMonthlySeries: { label: string; value: number }[] = [];
export const seedCreditPacks: never[] = [];
export const seedPaymentMethods: never[] = [];
