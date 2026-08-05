import { AnimatePresence, motion } from 'framer-motion';
import FavoriteIcon from '@mui/icons-material/Favorite';

interface LikeBurstProps {
  active: boolean;
  size?: number;
}

const PARTICLES = 8;

/** Particle burst animation fired when a post is liked. */
export const LikeBurst: React.FC<LikeBurstProps> = ({ active, size = 20 }) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.span
          key="burst"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1.35, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ display: 'inline-flex', position: 'relative', lineHeight: 0 }}
          aria-hidden
        >
          <FavoriteIcon sx={{ fontSize: size, color: '#F43F5E', filter: 'drop-shadow(0 0 6px rgba(244,63,94,0.5))' }} />
          {PARTICLES > 0 &&
            Array.from({ length: PARTICLES }).map((_, index) => {
              const angle = (index / PARTICLES) * Math.PI * 2;
              const distance = size * 0.9;
              return (
                <motion.span
                  key={index}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    left: size / 2,
                    top: size / 2,
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: index % 2 === 0 ? '#F43F5E' : '#FBBF24',
                  }}
                />
              );
            })}
        </motion.span>
      )}
    </AnimatePresence>
  );
};

export default LikeBurst;
