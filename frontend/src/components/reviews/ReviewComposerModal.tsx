import { useState } from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, TextField } from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { StarRating } from './StarRating';
import { useSubmitReviewMutation } from '@/features/reviews';
import { showInfo } from '@/utils';
import type { ReviewDimensionRatings, ReviewDimensionKey } from '@/types';

interface ReviewComposerModalProps {
  open: boolean;
  onClose: () => void;
  mentorId: string;
  mentorName: string;
  sessionId?: string;
}

const DIMENSIONS: Array<{ key: ReviewDimensionKey; label: string; hint: string }> = [
  { key: 'skill', label: 'Skill', hint: 'Technical depth' },
  { key: 'communication', label: 'Communication', hint: 'Clarity & feedback' },
  { key: 'knowledge', label: 'Knowledge', hint: 'Subject expertise' },
  { key: 'professionalism', label: 'Professionalism', hint: 'Punctuality & respect' },
];

/** World-class review composer: overall + dimension ratings, anonymous option. */
export const ReviewComposerModal: React.FC<ReviewComposerModalProps> = ({
  open,
  onClose,
  mentorId,
  mentorName,
  sessionId,
}) => {
  const [rating, setRating] = useState(5);
  const [dimensions, setDimensions] = useState<ReviewDimensionRatings>({ skill: 5, communication: 5, knowledge: 5, professionalism: 5 });
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const submitReview = useSubmitReviewMutation(mentorId);

  const setDimension = (key: ReviewDimensionKey, value: number) => {
    setDimensions((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!title.trim() || !content.trim()) {
      showInfo('Please add a title and your written review.');
      return;
    }
    submitReview.mutate(
      {
        sessionId: sessionId ?? 's-004',
        mentorId,
        rating,
        title: title.trim(),
        content: content.trim(),
        anonymous,
        dimensionRatings: dimensions,
      },
      {
        onSuccess: () => {
          onClose();
          setTitle('');
          setContent('');
          setAnonymous(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 4, p: 1 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            color: '#fff',
          }}
        >
          <StarBorderIcon />
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={800}>
            Review {mentorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Share your session experience honestly
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.25}>
          {/* Overall rating */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Overall rating
            </Typography>
            <StarRating value={rating} onChange={setRating} size={34} ariaLabel="Overall rating" />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
            </Typography>
          </Box>

          {/* Dimension ratings */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.25 }}>
            {DIMENSIONS.map((dimension) => (
              <Box
                key={dimension.key}
                sx={{ p: 1.5, borderRadius: 2.5, border: 1, borderColor: 'divider', bgcolor: 'action.hover', textAlign: 'center' }}
              >
                <Typography variant="subtitle2" fontWeight={800} fontSize="0.85rem">
                  {dimension.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {dimension.hint}
                </Typography>
                <Box sx={{ mt: 0.75, display: 'flex', justifyContent: 'center' }}>
                  <StarRating
                    value={dimensions[dimension.key] ?? rating}
                    onChange={(value) => setDimension(dimension.key, value)}
                    size={18}
                    ariaLabel={`${dimension.label} rating`}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Review title"
            placeholder="Summarize your experience"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Written review"
            placeholder="What went well? What could improve?"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
                color="secondary"
                size="small"
              />
            }
            label={<Typography fontSize="0.85rem" fontWeight={600}>Post anonymously — hide my identity</Typography>}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={submit} variant="contained" disabled={submitReview.isPending}>
          {submitReview.isPending ? 'Submitting…' : 'Submit review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewComposerModal;
