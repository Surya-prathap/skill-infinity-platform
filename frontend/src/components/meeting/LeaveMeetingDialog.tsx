import { motion } from 'framer-motion';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

interface LeaveMeetingDialogProps {
  open: boolean;
  isHost: boolean;
  onClose: () => void;
  onLeave: () => void;
  onEnd: () => void;
}

/** Premium leave / end meeting confirmation. */
export const LeaveMeetingDialog = ({ open, isHost, onClose, onLeave, onEnd }: LeaveMeetingDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="leave-meeting-title"
      slotProps={{
        paper: {
          style: {
            background: 'linear-gradient(160deg, #1A2438, #121A2B)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            maxWidth: 420,
          },
        },
      }}
    >
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
        <DialogTitle id="leave-meeting-title" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800 }}>
          Leave this meeting?
        </DialogTitle>
        <DialogContent sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: 1.6 }}>
          You can rejoin from the meeting link at any time.
          {isHost && (
            <span style={{ display: 'block', marginTop: 10, color: '#FBBF24', fontWeight: 600 }}>
              As the host, ending the meeting disconnects everyone.
            </span>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: '12px 20px 18px', gap: 8 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{ color: 'rgba(255,255,255,0.85)', borderColor: 'rgba(255,255,255,0.2)', '&:hover': { borderColor: 'rgba(255,255,255,0.4)' } }}
          >
            Stay
          </Button>
          {isHost && (
            <Button
              onClick={onEnd}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                color: '#fff',
                '&:hover': { background: 'linear-gradient(135deg, #F87171, #EF4444)' },
              }}
            >
              End for everyone
            </Button>
          )}
          <Button
            onClick={onLeave}
            variant="contained"
            autoFocus
            data-testid="confirm-leave"
            sx={{
              background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
              color: '#fff',
              '&:hover': { background: 'linear-gradient(135deg, #8E80FF, #6D5DF6)' },
            }}
          >
            Leave meeting
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};
