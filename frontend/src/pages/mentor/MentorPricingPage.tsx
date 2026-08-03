import { useState } from 'react';
import { Alert, Box, Chip, Grid, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { AnalyticsCard } from '@/components/mentor/AnalyticsCard';
import { GradientCard } from '@/components/mentor/GradientCard';
import { PricingCard } from '@/components/mentor/PricingCard';
import { useDocumentTitle } from '@/hooks';
import { formatCurrency } from '@/utils';
import { CURRENCIES, SESSION_TYPES } from '@/features/mentor/constants';
import { PricingEditor } from '@/features/mentor/components';
import {
  useAddPricingMutation,
  useDeletePricingMutation,
  useMentorProfileQuery,
  usePricingQuery,
} from '@/features/mentor/hooks';
import type { MentorPricing } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const sessionTypeLabel = (type: string): string =>
  SESSION_TYPES.find((option) => String(option.value) === type)?.label ??
  type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const MentorPricingPage: React.FC = () => {
  useDocumentTitle('Pricing');
  const { mentor } = useMentorProfileQuery();
  const mentorId = mentor?.id;
  const { pricing, isOffline } = usePricingQuery(mentorId);
  const addMutation = useAddPricingMutation(mentorId);
  const deleteMutation = useDeletePricingMutation(mentorId);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MentorPricing | null>(null);

  const activePlans = pricing.filter((plan) => plan.active !== false);
  const currency = activePlans[0]?.currency ?? 'USD';
  const paidPlans = activePlans.filter((plan) => !plan.isFree);
  const averagePrice = paidPlans.length
    ? Math.round(paidPlans.reduce((sum, plan) => sum + plan.price, 0) / paidPlans.length)
    : 0;
  const cheapest = paidPlans.length ? Math.min(...paidPlans.map((plan) => plan.price)) : 0;
  const discounts = activePlans.filter((plan) => plan.discountPercentage && plan.discountPercentage > 0).length;

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (plan: MentorPricing) => {
    setEditing(plan);
    setEditorOpen(true);
  };

  const handleSubmit = (values: Omit<MentorPricing, 'id' | 'active'>) => {
    if (editing?.id) {
      // Edit: replace then delete the temp copy — simplest robust flow is
      // delete + recreate for the demo backend.
      void deleteMutation.mutateAsync(editing.id).then(() => {
        addMutation.mutate(values);
      });
    } else {
      addMutation.mutate(values);
    }
    setEditorOpen(false);
    setEditing(null);
  };

  const stats = [
    { label: 'Active plans', value: `${activePlans.length}`, icon: <PriceChangeOutlinedIcon />, color: '#6D5DF6' },
    { label: 'Avg. price', value: averagePrice ? formatCurrency(averagePrice, currency) : '—', icon: <MonetizationOnOutlinedIcon />, color: '#10B981' },
    { label: 'From', value: cheapest ? formatCurrency(cheapest, currency) : '—', icon: <AccessTimeOutlinedIcon />, color: '#14B8A6' },
    { label: 'Discounts active', value: `${discounts}`, icon: <PercentOutlinedIcon />, color: '#F59E0B' },
  ];

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="brandWarm" sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }} gap={2}>
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <PriceChangeOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Pricing
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {activePlans.length} plan{activePlans.length === 1 ? '' : 's'} · paid in {currency}
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="medium"
            label={`Currency: ${currency}`}
            sx={{
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.16)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontWeight: 700,
              height: 34,
            }}
          />
        </Stack>
      </GradientCard>

      {/* ================= Stats ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index} style={{ height: '100%' }}>
              <AnalyticsCard title={stat.label} icon={stat.icon} iconColor={stat.color}>
                <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                  {stat.value}
                </Typography>
              </AnalyticsCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ================= Editor ================= */}
      {editorOpen && (
        <Card sx={{ mb: 3, p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {editing ? `Edit ${sessionTypeLabel(editing.sessionType)}` : 'Add a pricing plan'}
            </Typography>
            <Tooltip title="Close">
              <IconButton size="small" aria-label="Close editor" onClick={() => setEditorOpen(false)}>
                <CloseOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <PricingEditor
            initial={
              editing
                ? {
                    id: editing.id ?? '',
                    sessionType: editing.sessionType,
                    price: editing.price,
                    originalPrice: editing.originalPrice ?? null,
                    currency: editing.currency ?? 'USD',
                    discountPercentage: editing.discountPercentage ?? null,
                    durationMinutes: editing.durationMinutes ?? 60,
                    isFree: editing.isFree,
                    description: editing.description ?? '',
                  }
                : null
            }
            onCancel={() => setEditorOpen(false)}
            onSubmit={handleSubmit}
          />
        </Card>
      )}

      {/* ================= Plans ================= */}
      <AnalyticsCard
        title="Pricing Plans"
        subtitle="How learners pay for your sessions"
        icon={<MonetizationOnOutlinedIcon />}
        iconColor="#10B981"
        action={
          <Box
            component="button"
            role="button"
            tabIndex={0}
            onClick={openCreate}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openCreate();
              }
            }}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 1,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              color: '#fff',
              background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
              boxShadow: '0 6px 16px rgba(109,93,246,0.3)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(109,93,246,0.4)' },
              '&:focus-visible': { outline: '3px solid rgba(109,93,246,0.4)', outlineOffset: 2 },
            }}
          >
            <AddOutlinedIcon sx={{ fontSize: 18 }} />
            New plan
          </Box>
        }
      >
        {activePlans.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            No pricing plans yet. Add your first plan to start charging for sessions — or offer free intro sessions.
          </Alert>
        ) : (
          <Grid container spacing={2.5}>
            {activePlans.map((plan, index) => (
              <Grid key={plan.id ?? `${plan.sessionType}-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                <PricingCard
                  plan={plan}
                  featured={index === 0 && activePlans.length > 1}
                  onEdit={() => openEdit(plan)}
                  onDelete={() => {
                    if (plan.id) void deleteMutation.mutate(plan.id);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </AnalyticsCard>

      {/* ================= Learner preview ================= */}
      <AnalyticsCard
        title="Learner Preview"
        subtitle="This is how your pricing appears to students"
        icon={<AccessTimeOutlinedIcon />}
        iconColor="#14B8A6"
        sx={{ mt: 3 }}
        badge={activePlans.length ? 'Live' : 'Empty'}
        badgeColor={activePlans.length ? 'success' : 'default'}
      >
        <Grid container spacing={2.5} alignItems="stretch">
          <Grid size={{ xs: 12, md: 4 }}>
            <PricingCard
              plan={
                activePlans.find((plan) => !plan.isFree) ?? {
                  id: 'preview-1',
                  sessionType: 'ONE_ON_ONE',
                  price: 60,
                  currency,
                  durationMinutes: 60,
                  isFree: false,
                  description: 'Your most popular plan will be highlighted here.',
                  active: true,
                }
              }
              featured
            />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2} sx={{ height: '100%', justifyContent: 'center' }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <PercentOutlinedIcon sx={{ color: 'success.main' }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Discount rules
                </Typography>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Chip size="small" label="20% launch discount" sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 700 }} />
                <Chip size="small" label="Original price strikethrough" variant="outlined" sx={{ fontWeight: 600 }} />
                <Chip size="small" label="Free intro sessions" variant="outlined" sx={{ fontWeight: 600 }} />
                <Chip size="small" label="7 payout currencies" variant="outlined" sx={{ fontWeight: 600 }} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Learners see the discounted price with the original crossed out, the session duration, and your
                description. The featured plan is shown first — set your strongest offer as the default.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </AnalyticsCard>

      {/* Currency strip */}
      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1} sx={{ mt: 3 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Supported currencies:
        </Typography>
        {CURRENCIES.map((option) => (
          <Chip
            key={String(option.value)}
            size="small"
            label={String(option.value)}
            variant={String(option.value) === currency ? 'filled' : 'outlined'}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default MentorPricingPage;
