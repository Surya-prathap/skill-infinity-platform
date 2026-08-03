import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6, fontWeight: 700 }}>
        {title}
        <IconButton
          aria-label="Close"
          onClick={onCancel}
          disabled={loading}
          sx={{ position: 'absolute', right: 12, top: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      {message && (
        <DialogContent>
          <DialogContentText>{message}</DialogContentText>
        </DialogContent>
      )}
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} disabled={loading} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={variant === 'danger' ? 'error' : 'primary'}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
