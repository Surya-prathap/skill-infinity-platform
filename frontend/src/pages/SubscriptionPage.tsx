import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { paymentService } from '@/services';
import { PageHeader } from '@/components/common';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { InvoicePreview, PaymentMethodCard, PAYMENT_METHOD_OPTIONS } from '@/components/wallet';
import { useDocumentTitle } from '@/hooks';
import { formatCurrency, formatDate, getErrorMessage, showSuccess, showError } from '@/utils';
import {
  useConfirmPaymentMutation,
  useInitiatePaymentMutation,
} from '@/features/wallet';
import type { MySubscription, SubscriptionPlan } from '@/types';

interface SubscriptionPlansPageProps {
  role: 'learner' | 'mentor';
}

const SUBSCRIPTION_QUERY_KEY = ['payments', 'subscription', 'plans'];
const MY_SUBSCRIPTION_KEY = ['payments', 'subscription', 'mine'];

/** Formats a plan price, handling the credits-denominated plans gracefully. */
const formatPlanPrice = (price: number, currency?: string): string => {
  if (!currency || currency === 'CREDITS') return `${price.toLocaleString('en-IN')} credits`;
  return formatCurrency(price, currency);
};

/** Billing period label — 30-day plans are advertised as monthly (₹99/month). */
const formatPlanDuration = (durationDays?: number): string =>
  durationDays && durationDays !== 30 ? `/ ${durationDays} days` : '/ month';

/**
 * Subscription plans with visible benefits. Learner and mentor subscriptions
 * are paid platform features — clearly separate from earned Community Mentor
 * benefits (which can never be purchased).
 */
export const SubscriptionPlansPage: React.FC<SubscriptionPlansPageProps> = ({ role }) => {
  useDocumentTitle(role === 'mentor' ? 'Mentor Subscription' : 'Subscription');
  const queryClient = useQueryClient();
  const isMentor = role === 'mentor';
  const expectedPlanType = isMentor ? 'MENTOR' : 'LEARNER';
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  /* ---------- Checkout state — subscription purchase goes through a real payment step ---------- */
  const [checkoutPlan, setCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD_OPTIONS[0].id);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const plansQuery = useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEY, expectedPlanType],
    queryFn: async (): Promise<SubscriptionPlan[]> => {
      const response = await paymentService.getSubscriptionPlans(expectedPlanType);
      return response.data.data ?? [];
    },
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  const mineQuery = useQuery({
    queryKey: MY_SUBSCRIPTION_KEY,
    queryFn: async (): Promise<MySubscription | null> => {
      const response = await paymentService.getMySubscription();
      return response.data.data ?? null;
    },
    retry: 1,
    staleTime: 60_000,
  });

  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) =>
      paymentService.cancelSubscription(subscriptionId).then((response) => response.data),
    onSuccess: () => {
      showSuccess('Your subscription has been cancelled.');
      void queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_KEY });
      setCancelOpen(false);
    },
    onError: (error) => showError(getErrorMessage(error)),
  });

  const initiate = useInitiatePaymentMutation();
  const confirm = useConfirmPaymentMutation();

  /** Plans are filtered server-side by audience. The fallback guard keeps
   *  legacy backend responses (which lack a type) from leaking cross-role
   *  plans onto the page. */
  const plans = (plansQuery.data ?? []).filter((plan) =>
    plan.type
      ? plan.type === expectedPlanType
      : plan.name.toLowerCase().startsWith(isMentor ? 'mentor' : 'learner'),
  );
  const current = mineQuery.data;

  /** Opens the payment checkout for the chosen plan (no payment happens yet). */
  const purchase = (plan: SubscriptionPlan) => {
    setCheckoutPlan(plan);
    setPaymentMethod(PAYMENT_METHOD_OPTIONS[0].id);
    setPaymentError(null);
    setPaymentComplete(false);
  };

  const closeCheckout = (): void => {
    if (processingPayment) return;
    setCheckoutPlan(null);
    setPaymentComplete(false);
    setPaymentError(null);
  };

  /** Runs the payment: initiate → gateway confirm → activation. */
  const confirmCheckout = (): void => {
    if (!checkoutPlan) return;
    setPurchasingPlan(checkoutPlan.id);
    setProcessingPayment(true);
    setPaymentError(null);
    initiate.mutate(
      {
        amount: checkoutPlan.price,
        currency: checkoutPlan.currency === 'CREDITS' ? 'INR' : (checkoutPlan.currency ?? 'INR'),
        description: `Subscription: ${checkoutPlan.name}`,
        referenceType: 'SUBSCRIPTION',
        subscriptionPlanId: checkoutPlan.id,
        gateway: paymentMethod === 'stripe' ? 'STRIPE' : paymentMethod === 'razorpay' ? 'RAZORPAY' : 'INTERNAL',
      },
      {
        onSuccess: (payment) => {
          confirm.mutate(
            { paymentId: payment.id, gatewayPaymentId: `gw-${payment.id}` },
            {
              onSuccess: () => {
                setProcessingPayment(false);
                setPurchasingPlan(null);
                setPaymentComplete(true);
                void queryClient.invalidateQueries({ queryKey: MY_SUBSCRIPTION_KEY });
              },
              onError: () => {
                setProcessingPayment(false);
                setPurchasingPlan(null);
                setPaymentError('Payment could not be completed. Please try again.');
              },
            },
          );
        },
        onError: (error) => {
          setProcessingPayment(false);
          setPurchasingPlan(null);
          setPaymentError(getErrorMessage(error) || 'Payment could not be initiated. Please try again.');
        },
      },
    );
  };

  return (
    <Box>
      <PageHeader
        title={isMentor ? 'Mentor Subscription' : 'Learner Subscription'}
        subtitle={
          isMentor
            ? 'Professional tools for mentors — better visibility, analytics and growth.'
            : 'Convenience and access features for learners — never unlimited community sessions.'
        }
      />

      {/* ============ Current subscription summary ============ */}
      {current ? (
        <Card
          sx={{
            p: { xs: 2.5, md: 3.5 },
            mb: 3,
            border: 1,
            borderColor: 'success.main',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16,185,129,0.18), transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <Stack direction={{ xs: 'column', md: 'row' }} gap={3} sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
                flexShrink: 0,
              }}
            >
              <AutoAwesomeOutlinedIcon />
            </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="h6" fontWeight={800}>
                  Your plan · {current.plan.name}
                </Typography>
                <Chip
                  label={current.status.replace(/_/g, ' ')}
                  size="small"
                  color={current.status === 'ACTIVE' ? 'success' : 'default'}
                  sx={{ fontWeight: 800 }}
                />
                {current.autoRenew && (
                  <Chip label="Auto-renew on" size="small" color="info" variant="outlined" sx={{ fontWeight: 700 }} />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {current.startedAt && <>Started {formatDate(current.startedAt)}</>}
                {current.expiresAt && (
                  <> · {current.autoRenew ? 'Renews' : 'Expires'} {formatDate(current.expiresAt)}</>
                )}
              </Typography>
              {current.plan.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {current.plan.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setCancelOpen(true)}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'Cancel subscription'}
              </Button>
            </Box>
          </Stack>

          {(current.plan.features?.length ?? 0) > 0 && (
            <>
              <Divider sx={{ my: 2.5 }} />
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                Your benefits
              </Typography>
              <Grid container spacing={1.25}>
                {current.plan.features!.map((feature) => (
                  <Grid key={feature} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          background: 'linear-gradient(135deg, #10B981, #34D399)',
                          flexShrink: 0,
                        }}
                      >
                        <CheckIcon sx={{ fontSize: 12 }} />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {feature}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Card>
      ) : (
        <Card sx={{ p: 2.5, mb: 3, bgcolor: 'action.hover' }}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <WorkspacePremiumOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" color="text.secondary">
              You don&apos;t have an active subscription yet — pick a plan below to unlock its advantages.
            </Typography>
          </Stack>
        </Card>
      )}

      {/* ============ Benefit callout ============ */}
      <Box
        sx={{
          borderRadius: 3,
          p: 2.5,
          mb: 3,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ color: isMentor ? '#6D5DF6' : '#10B981', display: 'flex' }}>{isMentor ? <WorkspacePremiumOutlinedIcon /> : <SchoolOutlinedIcon />}</Box>
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, minWidth: 240 }}>
          {isMentor
            ? 'A subscription is a paid platform product — it adds visibility, analytics and commission perks. It never replaces credits, and it does not bypass the mentor approval workflow.'
            : 'A subscription adds convenience, discounts and discovery — it never replaces credits. Professional sessions always require credits; Community sessions stay free.'}
        </Typography>
      </Box>

      {plansQuery.isLoading ? (
        <PageSkeleton />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<WorkspacePremiumOutlinedIcon />}
          title="No plans available yet"
          description="Subscription plans will appear here once published by the platform."
        />
      ) : (
        <>
          <Typography variant="overline" fontWeight={800} sx={{ display: 'block', mb: 2, letterSpacing: '0.08em' }}>
            Available plans
          </Typography>
          <Grid container spacing={3}>
            {plans.map((plan, index) => {
              const isCurrent = current?.plan.id === plan.id;
              const isPopular = index === 1 && plans.length > 1;
              return (
                <Grid key={plan.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        border: 2,
                        borderColor: isCurrent ? 'success.main' : isPopular ? 'primary.main' : 'divider',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(109,93,246,0.12)' },
                      }}
                    >
                      {isPopular && (
                        <Chip
                          label="Most popular"
                          size="small"
                          color="primary"
                          sx={{ position: 'absolute', top: -12, right: 16, fontWeight: 800 }}
                        />
                      )}
                      {isCurrent && (
                        <Chip
                          label="Your plan"
                          size="small"
                          color="success"
                          sx={{ position: 'absolute', top: -12, left: 16, fontWeight: 800 }}
                        />
                      )}
                      <Typography variant="h6" fontWeight={800}>
                        {plan.name}
                      </Typography>
                      {plan.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: 40 }}>
                          {plan.description}
                        </Typography>
                      )}
                      <Stack direction="row" alignItems="baseline" gap={1} sx={{ my: 2 }}>
                        <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.03em' }}>
                          {formatPlanPrice(plan.price, plan.currency)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatPlanDuration(plan.durationDays)}
                        </Typography>
                      </Stack>
                      <Stack spacing={1.25} sx={{ mb: 3, flexGrow: 1 }}>
                        {(plan.features?.length ? plan.features : ['No benefits listed']).map((feature) => (
                          <Stack key={feature} direction="row" alignItems="center" gap={1.25}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                background: 'linear-gradient(135deg, #10B981, #34D399)',
                                flexShrink: 0,
                              }}
                            >
                              <CheckIcon sx={{ fontSize: 13 }} />
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {feature}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                      {plan.price <= 0 ? (
                        <Button variant="outlined" disabled sx={{ fontWeight: 800, py: 1.25 }}>
                          Free forever
                        </Button>
                      ) : isCurrent ? (
                        <Button variant="outlined" disabled sx={{ fontWeight: 800, py: 1.25 }}>
                          Current plan
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          disabled={purchasingPlan === plan.id}
                          startIcon={purchasingPlan === plan.id ? <CircularProgress size={16} color="inherit" /> : undefined}
                          onClick={() => purchase(plan)}
                          sx={{ fontWeight: 800, py: 1.25 }}
                        >
                          {purchasingPlan === plan.id ? 'Processing…' : `Subscribe · ${formatPlanPrice(plan.price, plan.currency)}`}
                        </Button>
                      )}
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </>
      )}

      {/* ============ Subscription checkout dialog — real payment step ============ */}
      <Dialog
        open={Boolean(checkoutPlan)}
        onClose={closeCheckout}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 4, overflow: 'hidden' } } }}
      >
        {paymentComplete && checkoutPlan ? (
          <Box sx={{ p: { xs: 4, md: 5 }, textAlign: 'center' }}>
            <Box
              sx={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2.5,
                color: '#fff',
                background: 'linear-gradient(135deg, #10B981, #34D399)',
                boxShadow: '0 12px 32px rgba(16,185,129,0.4)',
              }}
            >
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 42 }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
              Payment successful!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 380, mx: 'auto' }}>
              Your <b>{checkoutPlan.name}</b> subscription is now active. Enjoy your benefits!
            </Typography>
            <Button variant="contained" onClick={closeCheckout} sx={{ fontWeight: 800, px: 4 }}>
              Done
            </Button>
          </Box>
        ) : checkoutPlan ? (
          <>
            <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover' }}>
              <Typography variant="h6" fontWeight={800}>
                Subscribe to {checkoutPlan.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {checkoutPlan.description ?? 'Complete your payment to activate this plan.'}
              </Typography>
            </Box>
            <Box sx={{ px: 3, py: 3 }}>
              <Stack direction="row" alignItems="baseline" gap={1} sx={{ mb: 2.5 }}>
                <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: '-0.03em' }}>
                  {formatPlanPrice(checkoutPlan.price, checkoutPlan.currency)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPlanDuration(checkoutPlan.durationDays)}
                </Typography>
              </Stack>

              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                Payment method
              </Typography>
              <Stack spacing={1.25} sx={{ mb: 3 }}>
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    method={method}
                    selected={paymentMethod === method.id}
                    onSelect={() => setPaymentMethod(method.id)}
                  />
                ))}
              </Stack>

              <InvoicePreview
                subtotal={checkoutPlan.price}
                total={checkoutPlan.price}
                currency={checkoutPlan.currency === 'CREDITS' ? 'INR' : (checkoutPlan.currency ?? 'INR')}
              />

              {paymentError && (
                <Box
                  role="alert"
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'error.main',
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    {paymentError}
                  </Typography>
                </Box>
              )}

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={processingPayment}
                onClick={confirmCheckout}
                startIcon={processingPayment ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
                sx={{ mt: 2.5, fontWeight: 800, py: 1.25 }}
              >
                {processingPayment ? 'Processing…' : `Pay ${formatCurrency(checkoutPlan.price, checkoutPlan.currency === 'CREDITS' ? 'INR' : (checkoutPlan.currency ?? 'INR'))}`}
              </Button>
              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                Secured by Stripe · Razorpay · UPI — instant activation
              </Typography>
            </Box>
          </>
        ) : null}
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel your subscription?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Your {current?.plan.name} plan will be cancelled and you will lose access to its benefits at the end of
            the current period. You can subscribe again anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCancelOpen(false)}>Keep subscription</Button>
          <Button
            color="error"
            variant="contained"
            disabled={cancelMutation.isPending}
            onClick={() => current && cancelMutation.mutate(current.subscriptionId)}
          >
            {cancelMutation.isPending ? 'Cancelling…' : 'Cancel subscription'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/** Learner-facing subscription page. */
export const LearnerSubscriptionPage: React.FC = () => <SubscriptionPlansPage role="learner" />;

/** Mentor-facing subscription page. */
export const MentorSubscriptionPage: React.FC = () => <SubscriptionPlansPage role="mentor" />;

export default LearnerSubscriptionPage;
