import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LinearProgress } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalLoading } from '@/store/selectors';

/**
 * Wait this long (ms) before revealing the bar. Fast requests (most of them)
 * start and finish below the threshold, so the bar never flashes for them —
 * it only appears for genuinely slow loads.
 */
const SHOW_DELAY_MS = 350;

/**
 * Keep the bar visible at least this long once shown, so quick back-to-back
 * requests (e.g. background refetches) don't make it strobe.
 */
const MIN_VISIBLE_MS = 350;

/**
 * Slim top progress bar shown while any API request is in flight.
 * Driven by the global loading slice (wired to the axios interceptors),
 * with a debounce so it only appears for real work.
 */
export const GlobalLoadingBar: React.FC = () => {
  const loading = useAppSelector(selectGlobalLoading);
  const [visible, setVisible] = useState(false);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    if (loading) {
      // New work arrived — cancel any pending hide and start the show timer.
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (!visible && showTimer.current === null) {
        showTimer.current = window.setTimeout(() => {
          showTimer.current = null;
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
    } else {
      // All requests settled — cancel the pending show and schedule a hide.
      if (showTimer.current !== null) {
        window.clearTimeout(showTimer.current);
        showTimer.current = null;
      }
      if (visible && hideTimer.current === null) {
        hideTimer.current = window.setTimeout(() => {
          hideTimer.current = null;
          setVisible(false);
        }, MIN_VISIBLE_MS);
      }
    }
  }, [loading, visible]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      if (showTimer.current !== null) window.clearTimeout(showTimer.current);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    },
    [],
  );

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}
        >
          <LinearProgress
            sx={{
              height: 3,
              borderRadius: 999,
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #6D5DF6, #43C6C0)',
                borderRadius: 999,
              },
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingBar;
