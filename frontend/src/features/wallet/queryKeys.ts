export const walletKeys = {
  all: ['wallet'] as const,
  balance: () => [...walletKeys.all, 'balance'] as const,
  history: (page: number, size: number) =>
    [...walletKeys.all, 'history', page, size] as const,
  statement: (startDate: string, endDate: string) =>
    [...walletKeys.all, 'statement', startDate, endDate] as const,
  statistics: () => [...walletKeys.all, 'statistics'] as const,
} as const;
