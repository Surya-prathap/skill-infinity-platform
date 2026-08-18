import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';
import { parseApiTime } from '@/utils';

interface CountdownTimerProps {
  target: string | Date;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

const getTimeLeft = (target: string | Date): TimeLeft => {
  const diff = (parseApiTime(target)?.valueOf() ?? 0) - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
};

const pad = (value: number): string => String(value).padStart(2, '0');

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ target, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = getTimeLeft(target);
      setTimeLeft(next);
      if (next.done) {
        window.clearInterval(interval);
        onComplete?.();
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [target, onComplete]);

  const cells = [
    { label: 'Days', value: pad(timeLeft.days) },
    { label: 'Hours', value: pad(timeLeft.hours) },
    { label: 'Mins', value: pad(timeLeft.minutes) },
    { label: 'Secs', value: pad(timeLeft.seconds) },
  ];

  if (timeLeft.done) {
    return (
      <Typography variant="body2" fontWeight={800} color="success.main">
        Session time — join now!
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.25 }}>
      {cells.map((cell) => (
        <Box
          key={cell.label}
          sx={{
            minWidth: 64,
            textAlign: 'center',
            p: 1.25,
            borderRadius: 2.5,
            background: 'linear-gradient(135deg, rgba(109,93,246,0.12), rgba(67,198,192,0.12))',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <motion.div
            key={cell.value}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.1 }}>
              {cell.value}
            </Typography>
          </motion.div>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {cell.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CountdownTimer;
