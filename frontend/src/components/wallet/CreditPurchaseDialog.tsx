import { useMemo, useState } from 'react';
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
import { CreditPackCard, InvoicePreview } from '@/components/wallet';
import type { CreditPackOption } from '@/components/wallet';
import { useCreditPackagesQuery, useRazorpayCreditPurchase, useValidateCouponMutation } from '@/features/payments';
import { CREDIT_PACKS } from '@/features/wallet/constants';
import { walletKeys } from '@/features/wallet/queryKeys';
import { formatCurrency, getErrorMessage } from '@/utils';
import type { CreditPackage } from '@/types';

interface CreditPurchaseDialogProps {
  open: boolean;
  onClose: () => void;
}

/** Maps a backend-controlled package onto the pack-card UI shape. */
const toPackOption = (pkg: CreditPackage): CreditPackOption => ({
  id: pkg.code,
  name: pkg.name,
  credits: pkg.credits,
  price: pkg.price,
  features: pkg.features ?? [],
  highlighted: pkg.highlighted,
});

/** Static fallback used only when the backend catalog cannot be fetched. */
const FALLBACK_PACKS: CreditPackOption[] = CREDIT_PACKS.map((pack) => ({
  id: pack.id === 'starter' ? 'CREDIT_10' : pack.id === 'popular' ? 'CREDIT_30' : 'CREDIT_60',
  name: pack.name,
  credits: pack.credits,
  price: pack.price,
  features: pack.features,
  highlighted: pack.highlighted,
}));

/**
 * Inline credit top-up — replaces the old standalone /wallet/credits page so
 * buying credits never leaves the wallet. Pricing comes from the backend
 * (credit package catalog); payment goes through the Razorpay Checkout (INR,
 * test mode). The backend decides the final amount — the UI never sends one.
 */
export const CreditPurchaseDialog: React.FC<CreditPurchaseDialogProps> = ({ open, onClose }) => {
  const purchase = useRazorpayCreditPurchase();
  const validateCoupon = useValidateCouponMutation();
  const queryClient = useQueryClient();

  const packagesQuery = useCreditPackagesQuery();
  const packages = useMemo<CreditPackOption[]>(() => {
    if (packagesQuery.data && packagesQuery.data.length > 0) {
      return packagesQuery.data.map(toPackOption);
    }
    return FALLBACK_PACKS;
  }, [packagesQuery.data]);

  const [selectedPackId, setSelectedPackId] = useState<string>(FALLBACK_PACKS[0]!.id);
  // The selected pack is always derived from the live (backend) list so prices
  // can never drift from what the server will actually charge.
  const selectedPack = packages.find((pack) => pack.id === selectedPackId) ?? packages[0] ?? FALLBACK_PACKS[0]!;
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const valid = await validateCoupon.mutateAsync({ couponCode: code, amount: selectedPack.price });
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
      await purchase.mutateAsync({
        packageCode: selectedPack.id,
        couponCode: couponApplied ?? undefined,
      });
      // Refresh the wallet balance/history behind the dialog so the page
      // shows the updated credits as soon as it closes.
      void queryClient.invalidateQueries({ queryKey: walletKeys.all });
      setComplete(true);
    } catch (error) {
      // Surface the real reason (e.g. "Razorpay is not configured") instead of
      // a generic failure so users can act on it; a cancelled checkout is the
      // one case we translate to a friendly message.
      const cancelled = error instanceof Error && /cancel/i.test(error.message);
      const message = cancelled
        ? 'Payment cancelled. Your credits have not been added.'
        : getErrorMessage(error);
      setPaymentError(message);
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
                  {selectedPack.credits.toLocaleString()} purchased credits have been added to your wallet.
                  Happy learning!
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
                Choose a pack and pay securely with Razorpay (UPI, cards, net banking).
              </Typography>

              <Grid container spacing={3}>
                {/* Packs */}
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2 }}>
                    Choose your pack
                  </Typography>
                  <Grid container spacing={2.5}>
                    {packages.map((pack, index) => (
                      <Grid key={pack.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <CreditPackCard
                          pack={pack}
                          selected={selectedPack.id === pack.id}
                          onSelect={() => {
                            setSelectedPackId(pack.id);
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
                        label={`${couponApplied} applied — discount applied at checkout`}
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
                  <InvoicePreview
                    subtotal={selectedPack.price}
                    total={selectedPack.price}
                    currency="INR"
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
                    {processing ? 'Processing…' : `Pay ${formatCurrency(selectedPack.price)} with Razorpay`}
                  </Button>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                    Secured by Razorpay · UPI, cards & net banking — credits arrive instantly
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
