import { useState } from 'react';
import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import HowToVoteOutlinedIcon from '@mui/icons-material/HowToVoteOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import type { Poll } from '@/types';

interface PollCardProps {
  poll: Poll;
  onVote?: (optionIds: string[]) => void;
  disabled?: boolean;
}

/** Poll with optimistic voting and animated live result bars. */
export const PollCard: React.FC<PollCardProps> = ({ poll, onVote, disabled = false }) => {
  const [voting, setVoting] = useState(false);
  const votedOptionId = poll.votedOptionId ?? null;
  const total = poll.totalVotes || poll.options.reduce((sum, option) => sum + option.votes, 0);

  const castVote = (optionId: string) => {
    if (votedOptionId || voting || disabled) return;
    setVoting(true);
    onVote?.([optionId]);
    window.setTimeout(() => setVoting(false), 450);
  };

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(109,93,246,0.05), rgba(67,198,192,0.05))',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
          }}
        >
          <HowToVoteOutlinedIcon sx={{ fontSize: 17 }} />
        </Box>
        <Typography variant="subtitle2" fontWeight={700}>
          {poll.question}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        {poll.options.map((option) => {
          const percentage = total > 0 ? (option.votes / total) * 100 : 0;
          const isVoted = option.id === votedOptionId;
          return (
            <motion.div
              key={option.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Box
                component="button"
                type="button"
                disabled={Boolean(votedOptionId) || disabled}
                onClick={() => castVote(option.id)}
                aria-pressed={isVoted}
                sx={{
                  width: '100%',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                  border: isVoted ? '1.5px solid' : 1,
                  borderColor: isVoted ? 'primary.main' : 'divider',
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  px: 1.75,
                  py: 1.25,
                  cursor: votedOptionId || disabled ? 'default' : 'pointer',
                  transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover:not(:disabled)': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)',
                    boxShadow: 2,
                  },
                  '&:disabled': { cursor: 'default' },
                }}
              >
                {/* Live result bar */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    right: undefined,
                    width: `${percentage}%`,
                    bgcolor: isVoted
                      ? 'linear-gradient(90deg, rgba(109,93,246,0.22), rgba(109,93,246,0.08))'
                      : 'action.hover',
                    transition: 'width 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderRadius: 2,
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ position: 'relative' }}
                >
                  <Stack direction="row" alignItems="center" gap={1.25} sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: isVoted ? 'primary.main' : 'text.disabled',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        ...(isVoted && {
                          bgcolor: 'primary.main',
                          '&::after': {
                            content: '""',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: '#fff',
                          },
                        }),
                      }}
                    />
                    <Typography
                      fontSize="0.88rem"
                      fontWeight={isVoted ? 800 : 600}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {option.text}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
                    {votedOptionId && (
                      <AnimatePresence>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{ fontWeight: 800, fontSize: '0.82rem', color: 'primary.main' }}
                        >
                          {Math.round(percentage)}%
                        </motion.span>
                      </AnimatePresence>
                    )}
                    {votedOptionId && (
                      <Typography fontSize="0.75rem" color="text.secondary">
                        {option.votes.toLocaleString('en-US')} votes
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </motion.div>
          );
        })}
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }}>
        <Typography fontSize="0.75rem" color="text.secondary" fontWeight={600}>
          {total.toLocaleString('en-US')} votes
        </Typography>
        {votedOptionId ? (
          <Typography fontSize="0.78rem" fontWeight={700} color="success.main">
            ✓ Vote recorded
          </Typography>
        ) : (
          !disabled && (
            <Typography fontSize="0.78rem" color="text.secondary">
              Tap an option to vote
            </Typography>
          )
        )}
      </Stack>
    </Box>
  );
};

export default PollCard;
