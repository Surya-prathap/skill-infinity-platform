import { motion, AnimatePresence } from 'framer-motion';
import { LinearProgress } from '@mui/material';
import { useAppSelector } from '@/store/hooks';
import { selectGlobalLoading } from '@/store/selectors';

/**
 * Slim top progress bar shown while any API request is in flight.
 * Driven by the global loading slice (wired to the axios interceptors).
 */
export const GlobalLoadingBar: React.FC = () => {
  const loading = useAppSelector(selectGlobalLoading);

  return (
    <AnimatePresence>
      {loading && (
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
