import { Box, Chip, Divider } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { formatCurrency } from '@/utils';

export interface InvoiceLine {
  label: string;
  value: number;
  highlight?: boolean;
}

interface InvoicePreviewProps {
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  currency?: string;
  couponCode?: string;
  lines?: InvoiceLine[];
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  subtotal,
  discount = 0,
  tax = 0,
  total,
  currency = 'USD',
  couponCode,
  lines,
}) => {
  return (
    <Box sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'action.hover',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <ReceiptLongOutlinedIcon sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={800}>
          Invoice preview
        </Typography>
        {couponCode && (
          <Chip
            size="small"
            label={`Coupon ${couponCode}`}
            color="success"
            variant="outlined"
            sx={{ ml: 'auto', fontWeight: 700 }}
          />
        )}
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={1.25}>
          {lines && lines.length > 0 ? (
            lines.map((line) => (
              <Stack key={line.label} direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  {line.label}
                </Typography>
                <Typography variant="body2" fontWeight={line.highlight ? 800 : 600}>
                  {formatCurrency(line.value, currency)}
                </Typography>
              </Stack>
            ))
          ) : (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(subtotal, currency)}
              </Typography>
            </Stack>
          )}

          {discount > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="success.main" fontWeight={600}>
                Discount
              </Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                −{formatCurrency(discount, currency)}
              </Typography>
            </Stack>
          )}

          {tax > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Tax
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatCurrency(tax, currency)}
              </Typography>
            </Stack>
          )}

          <Divider sx={{ my: 0.5 }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle1" fontWeight={800}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
              {formatCurrency(total, currency)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.disabled">
            Taxes calculated at checkout · GST/VAT may apply
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default InvoicePreview;
