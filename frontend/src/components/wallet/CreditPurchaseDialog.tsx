import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { CreditPackCard, InvoicePreview, PaymentMethodCard, PAYMENT_METHOD_OPTIONS } from '@/components/wallet';
import type { CreditPackOption } from '@/components/wallet';
import { usePurchaseCredits, useValidateCouponMutation } from '@/features/payments';
import { CREDIT_PACKS } from '@/features/wallet/constants';
import { walletKeys } from '@/features/wallet/queryKeys';
import { formatCurrency } from '@/utils';

const TAX_RATE = 0.08;

interface CreditPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Inline credit top-up — replaces the old standalone /wallet/credits page so
 * buying credits never leaves the wallet. Same checkout flow: pick a pack,
 * apply a coupon, pay.
 */
export const CreditPurchaseDialog: React.FC<CreditPurchaseDialogProps> = ({ open, onClose }) => {
  const { initiate, confirm } = usePurchaseCredits();
  const validateCoupon = useValidateCouponMutation();
  const queryClient = useQueryClient();

  const [selectedPack, setSelectedPack] = useState<CreditPackOption>(CREDIT_PACKS[0]!);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD_OPTIONS[0].id);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const subtotal = selectedPack.price;
  const discount = couponApplied ? (selectedPack.savings ?? 0) : 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const valid = await validateCoupon.mutateAsync({ couponCode: code, amount: subtotal });
      if (valid) {
        setCouponApplied(code);
      } else {
        setCouponError('This coupon code is invalid.');
      }
    } catch {
      setCouponError('This coupon code is invalid.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePurchase = async () => {
    setProcessing(true);
    setPaymentError(null);
    try {
      const initiated = await initiate.mutateAsync({
        amount: total,
        credits: selectedPack.credits,
        currency: 'INR',
        description: `${selectedPack.name} credit pack — ${selectedPack.credits} credits`,
        referenceType: 'CREDIT_PURCHASE',
        couponCode: couponApplied ?? undefined,
        gateway: paymentMethod === 'stripe' ? 'STRIPE' : paymentMethod === 'razorpay' ? 'RAZORPAY' : 'INTERNAL',
      });
      await confirm.mutateAsync({
        paymentId: initiated.id,
        gatewayTransactionId: `gw_${Date.now()}`,
      });
      // Refresh the wallet balance/history behind the dialog so the page
      // shows the updated credits as soon as it closes.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      setComplete(true);
    } catch {
      setPaymentError('Payment failed. Please check your payment details and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    // Reset the flow so the next open starts fresh.
    setComplete(false);
    setPaymentError(null);
    setCouponApplied(null);
    setCouponCode('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="body"
      aria-labelledby="credit-purchase-title"
    >
      <DialogContent sx={{ p: { xs: 2.5, md: 4 } }}>
        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.15 }}
                >
                  <Box
                    sx={{
                      width: 88,
                      height: 88,
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
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 44 }} />
                  </Box>
                </motion.div>
                <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }} id="credit-purchase-title">
                  Payment successful!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 420, mx: 'auto' }}>
                  {selectedPack.credits.toLocaleString()} credits were added to your wallet. Happy learning!
                </Typography>
                <Button variant="contained" onClick={handleClose}>
                  Done
                </Button>
              </Box>
            </motion.div>
          ) : (
            <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }} id="credit-purchase-title">
                Buy credits
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Choose a pack, apply a coupon and top up instantly.
              </Typography>

              <Grid container spacing={3}>
                {/* Packs */}
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                    Choose your pack
                  </Typography>
                  <Grid container spacing={2.5}>
                    {CREDIT_PACKS.map((pack, index) => (
                      <Grid key={pack.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <CreditPackCard
                          pack={{ ...pack, highlighted: pack.id === 'popular' }}
                          selected={selectedPack.id === pack.id}
                          onSelect={() => {
                            setSelectedPack({ ...pack, highlighted: pack.id === 'popular' });
                            setCouponApplied(null);
                          }}
                          index={index}
                        />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Coupon */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                      Have a coupon?
                    </Typography>
                    <Stack direction="row" gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocalOfferOutlinedIcon fontSize="small" />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => void applyCoupon()}
                        disabled={couponLoading || !couponCode.trim()}
                        sx={{ minWidth: 110 }}
                      >
                        {couponLoading ? <CircularProgress size={18} color="inherit" /> : 'Apply'}
                      </Button>
                    </Stack>
                    {couponApplied && (
                      <Chip
                        size="small"
                        label={`${couponApplied} applied — save ${formatCurrency(discount)}`}
                        color="success"
                        onDelete={() => setCouponApplied(null)}
                        sx={{ mt: 1.5, fontWeight: 700 }}
                      />
                    )}
                    {couponError && (
                      <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
                        {couponError}
                      </Typography>
                    )}
                  </Box>
                </Grid>

                {/* Checkout */}
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
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
                    subtotal={subtotal}
                    discount={discount}
                    tax={tax}
                    total={total}
                    couponCode={couponApplied ?? undefined}
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
                    disabled={processing}
                    onClick={() => void handlePurchase()}
                    startIcon={processing ? <CircularProgress size={18} color="inherit" /> : <LockOutlinedIcon />}
                    sx={{ mt: 2.5, fontWeight: 800 }}
                  >
                    {processing ? 'Processing…' : `Pay ${formatCurrency(total)}`}
                  </Button>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                    Secured by Stripe · Razorpay · UPI — credits arrive instantly
                  </Typography>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CreditPurchaseDialog;
