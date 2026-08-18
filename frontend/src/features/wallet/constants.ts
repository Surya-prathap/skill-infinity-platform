import type { CreditPackOption } from '@/components/wallet';

/**
 * Credit pack catalog — static product configuration for the purchase page.
 * All pricing is in INR (₹). There is no backend catalog endpoint; amounts are
 * platform pricing config. 1 credit = 10 minutes.
 */
export const CREDIT_PACKS: CreditPackOption[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 10,
    price: 109,
    features: ['10 credits · 100 minutes of learning', '1 credit = 10 minutes', 'Added to your wallet instantly'],
    highlighted: false,
  },
  {
    id: 'popular',
    name: 'Popular',
    credits: 30,
    price: 299,
    features: ['30 credits · 5 hours of learning', '1 credit = 10 minutes', 'Added to your wallet instantly'],
    highlighted: true,
  },
  {
    id: 'value',
    name: 'Value',
    credits: 60,
    price: 549,
    features: ['60 credits · 10 hours of learning', '1 credit = 10 minutes', 'Added to your wallet instantly'],
    highlighted: false,
  },
];
