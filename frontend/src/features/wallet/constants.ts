import type { CreditPackOption } from '@/components/wallet';

/**
 * Credit pack catalog — static product configuration for the purchase page.
 * There is no backend catalog endpoint; amounts are platform pricing config.
 */
export const CREDIT_PACKS: CreditPackOption[] = [
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
];
