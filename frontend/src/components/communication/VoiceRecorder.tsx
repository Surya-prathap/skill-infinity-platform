import { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import MicNoneIcon from '@mui/icons-material/MicNone';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Typography } from '@/components/ui/Typography';

interface VoiceRecorderProps {
  /** Called when a recording is finished; the attachment is wired in the composer. */
  onComplete: (durationSeconds: number) => void;
}

/** Voice message recording UI — architecture ready for a MediaRecorder backend. */
export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onComplete }) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    };
  }, []);

  const start = () => {
    startRef.current = Date.now();
    setElapsed(0);
    setRecording(true);
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
  };

  const stop = (cancel: boolean) => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    const duration = Math.max(1, Math.floor((Date.now() - startRef.current) / 1000));
    setRecording(false);
    setElapsed(0);
    if (!cancel && duration >= 1) onComplete(duration);
  };

  const format = (seconds: number): string =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <AnimatePresence mode="wait">
      {recording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          role="timer"
          aria-label="Recording voice message"
        >
          <motion.span
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#EF4444',
              boxShadow: '0 0 0 4px rgba(239,68,68,0.25)',
            }}
          />
          <Typography variant="subtitle2" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {format(elapsed)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            {Array.from({ length: 14 }, (_, index) => (
              <motion.span
                key={index}
                animate={{ height: [5, 12 + (index % 5) * 4, 5] }}
                transition={{ duration: 0.7 + (index % 3) * 0.18, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 3, borderRadius: 999, background: '#EF4444' }}
              />
            ))}
          </Box>
          <IconButton size="small" aria-label="Stop recording" onClick={() => stop(false)} color="error">
            <StopRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Cancel recording" onClick={() => stop(true)}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <IconButton size="small" aria-label="Record voice message" onClick={start}>
            <MicNoneIcon fontSize="small" />
          </IconButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VoiceRecorder;
