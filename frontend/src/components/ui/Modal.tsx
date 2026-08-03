import type { ReactNode } from 'react';
import MuiModal from '@mui/material/Modal';
import { Box, IconButton } from '@mui/material';
import { Typography } from '@/components/ui/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { fadeIn, scaleIn } from '@/theme';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 520 }) => {
  return (
    <MuiModal open={open} onClose={onClose} aria-labelledby={title ? 'modal-title' : undefined}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `min(${maxWidth}px, calc(100vw - 32px))`,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: 24,
          p: 3.5,
          outline: 'none',
          animation: `${fadeIn} 0.15s ease-out, ${scaleIn} 0.2s cubic-bezier(0.34, 1.3, 0.64, 1)`,
        }}
      >
        {title && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
            <IconButton aria-label="Close" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        )}
        {children}
      </Box>
    </MuiModal>
  );
};

export default Modal;
