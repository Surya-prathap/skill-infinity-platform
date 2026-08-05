import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { MentorApproval } from '@/types';

interface ApprovalDialogProps {
  open: boolean;
  mentor: MentorApproval | null;
  action: 'APPROVE' | 'REJECT' | null;
  loading?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  mentor,
  action,
  loading = false,
  onConfirm,
  onClose,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason('');
  }, [open]);

  if (!mentor) return null;

  const isApprove = action === 'APPROVE';
  const title = isApprove ? 'Approve mentor' : 'Reject mentor application';

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6, fontWeight: 800 }}>
        {title}
        <IconButton aria-label="Close" onClick={onClose} disabled={loading} sx={{ position: 'absolute', right: 12, top: 12 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {isApprove
            ? `This will approve ${mentor.name} to start accepting learners at ${mentor.expertise.join(', ')}.`
            : `Rejecting ${mentor.name}'s application is permanent. A reason is required for the rejection email.`}
        </Typography>
        {isApprove && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Verification score:</strong> {mentor.verificationScore}/100 · <strong>Certificates:</strong>{' '}
            {mentor.certificates.join(', ') || 'None'}
          </Typography>
        )}
        {!isApprove && (
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Rejection reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            placeholder="e.g. Certificate could not be verified"
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={() => onConfirm(reason)}
          disabled={loading || (!isApprove && reason.trim().length === 0)}
          variant="contained"
          color={isApprove ? 'success' : 'error'}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isApprove ? 'Approve mentor' : 'Reject application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovalDialog;
