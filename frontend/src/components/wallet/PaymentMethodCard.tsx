import { Box } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import { motion } from 'framer-motion';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckIcon from '@mui/icons-material/Check';

export type PaymentMethodType =
  | 'CARD'
  | 'UPI'
  | 'NET_BANKING'
  | 'WALLET'
  | 'STRIPE'
  | 'RAZORPAY'
  | 'GPAY'
  | 'PHONEPE';

export interface PaymentMethodOption {
  id: string;
  type: PaymentMethodType;
  label: string;
  sublabel?: string;
}

const METHOD_ICON: Record<PaymentMethodType, React.ReactNode> = {
  CARD: <CreditCardOutlinedIcon />,
  UPI: <QrCode2OutlinedIcon />,
  NET_BANKING: <AccountBalanceOutlinedIcon />,
  WALLET: <AccountBalanceWalletOutlinedIcon />,
  STRIPE: <CreditCardOutlinedIcon />,
  RAZORPAY: <AccountBalanceOutlinedIcon />,
  GPAY: <QrCode2OutlinedIcon />,
  PHONEPE: <QrCode2OutlinedIcon />,
};

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  { id: 'card', type: 'CARD', label: 'Credit / Debit Card', sublabel: 'Visa, Mastercard, Amex' },
  { id: 'upi', type: 'UPI', label: 'UPI', sublabel: 'GPay, PhonePe, Paytm' },
  { id: 'netbanking', type: 'NET_BANKING', label: 'Net Banking', sublabel: 'All major banks' },
  { id: 'wallet', type: 'WALLET', label: 'Wallet', sublabel: 'Wallet credits & gift cards' },
  { id: 'stripe', type: 'STRIPE', label: 'Stripe', sublabel: 'International cards' },
  { id: 'razorpay', type: 'RAZORPAY', label: 'Razorpay', sublabel: 'Cards, UPI & net banking' },
];

interface PaymentMethodCardProps {
  method: PaymentMethodOption;
  selected?: boolean;
  onSelect?: () => void;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected = false,
  onSelect,
}) => {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
      <Box
        role="radio"
        aria-checked={selected}
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSelect?.();
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.75,
          borderRadius: 2.5,
          border: 2,
          borderColor: selected ? 'primary.main' : 'divider',
          bgcolor: selected ? 'action.selected' : 'background.paper',
          cursor: 'pointer',
          transition: 'border-color 0.15s ease, background-color 0.15s ease',
          '&:hover': { borderColor: 'primary.main' },
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            bgcolor: 'action.selected',
            flexShrink: 0,
          }}
        >
          {METHOD_ICON[method.type]}
        </Box>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {method.label}
          </Typography>
          {method.sublabel && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {method.sublabel}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? '#fff' : 'text.disabled',
            background: selected ? 'primary.main' : 'transparent',
            border: 2,
            borderColor: selected ? 'primary.main' : 'divider',
            flexShrink: 0,
          }}
        >
          {selected && <CheckIcon sx={{ fontSize: 14 }} />}
        </Box>
      </Box>
    </motion.div>
  );
};

export default PaymentMethodCard;
