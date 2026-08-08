import { AnimatePresence, motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addReaction } from '@/store/slices/meetingSlice';
import { selectMeetingReactions } from '@/store/selectors';
import { useCurrentUserIdentity } from '@/hooks';

const REACTION_EMOJIS = ['👍', '👏', '❤️', '🎉', '🔥', '😂', '👋'];

/** Floating animated reactions that drift across the stage. */
export const ReactionOverlay = () => {
  const reactions = useAppSelector(selectMeetingReactions);
  const dispatch = useAppDispatch();
  const { userId, userName } = useCurrentUserIdentity();

  const sendReaction = (emoji: string): void => {
    dispatch(
      addReaction({
        id: `me-reaction-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        emoji,
        userName,
        userId,
        createdAt: new Date().toISOString(),
      }),
    );
  };

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40, overflow: 'hidden' }}>
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            data-testid="floating-reaction"
            initial={{ opacity: 0, y: 40, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], y: -160, scale: [0.4, 1.25, 1, 0.9], rotate: [0, 12, -10, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.6, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${18 + (reaction.id.length % 70)}%`,
              bottom: 90,
              fontSize: '2.6rem',
              filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.45))',
              pointerEvents: 'none',
            }}
            aria-label={`${reaction.userName} reacted ${reaction.emoji}`}
            role="img"
          >
            {reaction.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Quick reaction bar */}
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 84,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'auto',
        }}
      >
        {REACTION_EMOJIS.map((emoji, index) => (
          <motion.button
            key={emoji}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ scale: 1.25, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => sendReaction(emoji)}
            aria-label={`Send ${emoji} reaction`}
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(13,19,34,0.8)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
