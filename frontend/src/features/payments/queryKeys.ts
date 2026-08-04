export const paymentKeys = {
  all: ['payments'] as const,
  history: (page: number, size: number) =>
    [...paymentKeys.all, 'history', page, size] as const,
  invoice: (invoiceId: string) => [...paymentKeys.all, 'invoice', invoiceId] as const,
  coupon: (code: string, amount: number) =>
    [...paymentKeys.all, 'coupon', code, amount] as const,
} as const;
