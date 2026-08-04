import { useMemo, useState } from 'react';
import { Box, Button, Chip, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs, { type Dayjs } from 'dayjs';
import CheckIcon from '@mui/icons-material/Check';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import CelebrationOutlinedIcon from '@mui/icons-material/CelebrationOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { formatCurrency } from '@/utils';
import type { BookingRequest, Mentor, MentorPricing } from '@/types';

const STEPS = [
  { label: 'Mentor', icon: <PersonOutlinedIcon /> },
  { label: 'Type', icon: <CategoryOutlinedIcon /> },
  { label: 'Date', icon: <CalendarMonthOutlinedIcon /> },
  { label: 'Time', icon: <ScheduleOutlinedIcon /> },
  { label: 'Payment', icon: <PaymentOutlinedIcon /> },
  { label: 'Done', icon: <CelebrationOutlinedIcon /> },
];

const SESSION_TYPE_LABEL: Record<string, string> = {
  ONE_ON_ONE: '1:1 Mentoring',
  GROUP_SESSION: 'Group Session',
  INTERVIEW_PREP: 'Interview Prep',
  CODE_REVIEW: 'Code Review',
  RESUME_REVIEW: 'Resume Review',
  PORTFOLIO_REVIEW: 'Portfolio Review',
  CAREER_COACHING: 'Career Coaching',
  PROJECT_SUPPORT: 'Project Support',
};

const DAYS_AHEAD = 14;

/** Deterministic slot generation from the selected pricing plan. */
const generateSlots = (pricing: MentorPricing | undefined): string[] => {
  const slots: string[] = [];
  if (!pricing) return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const duration = pricing.durationMinutes || 60;
  for (let hour = 9; hour <= 17; hour += duration / 60) {
    if (hour < 17) slots.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return slots;
};

interface BookingWizardProps {
  mentor: Mentor;
  name?: string;
  pricing: MentorPricing[];
  learnerId?: string;
  learnerName?: string;
  onSubmit: (request: BookingRequest) => Promise<void> | void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  mentor,
  name,
  pricing,
  learnerId,
  learnerName,
  onSubmit,
}) => {
  const [step, setStep] = useState(0);
  const [pricingId, setPricingId] = useState<string | undefined>(pricing[0]?.id);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedPricing = pricing.find((plan) => plan.id === pricingId) ?? pricing[0];
  const price = selectedPricing?.price ?? 0;

  const availableDates = useMemo(
    () => Array.from({ length: DAYS_AHEAD }).map((_, index) => dayjs().add(index + 1, 'day')),
    [],
  );

  const slots = useMemo(
    () => (date ? generateSlots(selectedPricing) : []),
    [date, selectedPricing],
  );

  const [first, last] = (name ?? 'Mentor').split(' ');

  const canNext =
    step === 0 ||
    (step === 1 && Boolean(selectedPricing)) ||
    (step === 2 && Boolean(date)) ||
    (step === 3 && Boolean(slot)) ||
    step === 4;

  const handleNext = async () => {
    if (step === 4) {
      setSubmitting(true);
      try {
        await onSubmit({
          mentorId: mentor.id,
          learnerId,
          mentorName: name,
          learnerName,
          topic: `${SESSION_TYPE_LABEL[selectedPricing?.sessionType ?? 'ONE_ON_ONE']} with ${name ?? 'Mentor'}`,
          description: selectedPricing?.description || undefined,
          preferredDate: date?.format('YYYY-MM-DDTHH:mm:ss') ?? undefined,
          preferredStartTime: date ? `${date.format('YYYY-MM-DD')}T${slot}:00` : '',
          preferredEndTime: date
            ? `${date.format('YYYY-MM-DD')}T${dayjs(`${date.format('YYYY-MM-DD')}T${slot}:00`)
                .add(selectedPricing?.durationMinutes ?? 60, 'minute')
                .format('HH:mm')}:00`
            : '',
          durationMinutes: selectedPricing?.durationMinutes ?? 60,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setStep(5);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  return (
    <Box>
      {/* Stepper */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', mb: 4, px: { xs: 1, md: 3 } }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: 22,
            left: { xs: 24, md: 56 },
            right: { xs: 24, md: 56 },
            height: 3,
            borderRadius: 999,
            bgcolor: 'action.selected',
          }}
        >
          <motion.div
            animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: 'linear-gradient(90deg, #6D5DF6, #43C6C0)',
              boxShadow: '0 0 12px rgba(109,93,246,0.5)',
            }}
          />
        </Box>
        {STEPS.map((stepConfig, index) => {
          const isActive = index === step;
          const isDone = index < step;
          return (
            <Tooltip key={stepConfig.label} title={stepConfig.label}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 56, zIndex: 2 }}>
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.14, 1], boxShadow: '0 0 0 6px rgba(109,93,246,0.15)' }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive || isDone ? '#fff' : 'text.secondary',
                    background: isActive
                      ? 'linear-gradient(135deg, #6D5DF6, #43C6C0)'
                      : isDone
                        ? 'linear-gradient(135deg, #10B981, #34D399)'
                        : 'transparent',
                    border: isActive || isDone ? 'none' : '2px solid',
                    borderColor: 'divider',
                    fontSize: 18,
                  }}
                >
                  {isDone ? <CheckIcon sx={{ fontSize: 20 }} /> : stepConfig.icon}
                </motion.div>
                <Typography
                  variant="caption"
                  fontWeight={isActive ? 700 : 600}
                  sx={{ color: isActive ? 'primary.main' : 'text.secondary', whiteSpace: 'nowrap' }}
                >
                  {stepConfig.label}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {step === 0 && (
            <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
              <Box sx={{ p: 1, borderRadius: '50%', background: 'action.selected' }}>
                <Avatar firstName={first} lastName={last} name={name} size={96} />
              </Box>
              <Typography variant="h5" fontWeight={800}>
                {name ?? 'Your Mentor'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 480 }}>
                {mentor.profile?.headline}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Chip label={`${mentor.profile?.yearsOfExperience ?? 0}+ years`} variant="outlined" size="small" />
                <Chip label={`★ ${(mentor.statistics?.averageRating ?? 0).toFixed(1)}`} variant="outlined" size="small" />
                <Chip label={`${mentor.statistics?.totalSessions ?? 0} sessions`} variant="outlined" size="small" />
                {mentor.verified && <Chip label="Verified" color="success" size="small" variant="outlined" />}
              </Box>
            </Stack>
          )}

          {step === 1 && (
            <Box sx={{ maxWidth: 560, mx: 'auto', py: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, textAlign: 'center' }}>
                Choose a session type
              </Typography>
              <Stack spacing={1.5}>
                {pricing.map((plan) => {
                  const selected = plan.id === pricingId;
                  return (
                    <Box
                      key={plan.id}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      onClick={() => setPricingId(plan.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setPricingId(plan.id);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2.25,
                        borderRadius: 3,
                        border: 2,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.paper',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease, background-color 0.2s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
                          flexShrink: 0,
                        }}
                      >
                        <CategoryOutlinedIcon />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={800}>
                          {SESSION_TYPE_LABEL[plan.sessionType] ?? plan.sessionType}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {plan.durationMinutes} min · {plan.description ?? 'Personalized mentoring session'}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                          {plan.isFree ? 'Free' : formatCurrency(plan.price)}
                        </Typography>
                        {plan.originalPrice && !plan.isFree && (
                          <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            {formatCurrency(plan.originalPrice)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ maxWidth: 640, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, textAlign: 'center' }}>
                Pick a date
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                {availableDates.map((day) => {
                  const selected = date?.isSame(day, 'day');
                  const isWeekend = [0, 6].includes(day.day());
                  return (
                    <Box
                      key={day.format('YYYY-MM-DD')}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setDate(day);
                        setSlot(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setDate(day);
                          setSlot(null);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        border: 2,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.paper',
                        textAlign: 'center',
                        cursor: 'pointer',
                        opacity: isWeekend ? 0.55 : 1,
                        transition: 'border-color 0.15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {day.format('ddd')}
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {day.format('D')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {day.format('MMM')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {step === 3 && (
            <Box sx={{ maxWidth: 560, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, textAlign: 'center' }}>
                Choose a time slot
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, textAlign: 'center' }}>
                {date?.format('dddd, MMMM D')} · {selectedPricing?.durationMinutes ?? 60} min session
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
                {slots.map((time) => {
                  const selected = slot === time;
                  return (
                    <Box
                      key={time}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSlot(time)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSlot(time);
                      }}
                      sx={{
                        py: 1.5,
                        borderRadius: 2.5,
                        border: 2,
                        borderColor: selected ? 'primary.main' : 'divider',
                        bgcolor: selected ? 'action.selected' : 'background.paper',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700} color={selected ? 'primary.main' : 'text.primary'}>
                        {dayjs(`2000-01-01T${time}`).format('h:mm A')}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {step === 4 && (
            <Box sx={{ maxWidth: 560, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, textAlign: 'center' }}>
                Review & pay with wallet credits
              </Typography>
              <Box sx={{ borderRadius: 3, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, bgcolor: 'action.hover' }}>
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Avatar firstName={first} lastName={last} name={name} size={44} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {SESSION_TYPE_LABEL[selectedPricing?.sessionType ?? 'ONE_ON_ONE']} with {name ?? 'Mentor'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {date?.format('dddd, MMMM D')} · {slot ? dayjs(`2000-01-01T${slot}`).format('h:mm A') : ''} · {selectedPricing?.durationMinutes ?? 60} min
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Session fee</Typography>
                    <Typography variant="body2" fontWeight={700}>{formatCurrency(price)}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Paid via wallet credits</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">−{formatCurrency(price)}</Typography>
                  </Stack>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2" fontWeight={800}>Total due</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main">$0.00</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Credits are deducted when the mentor approves your booking.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {step === 5 && (
            <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
              >
                <Box
                  sx={{
                    width: 88,
                    height: 88,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: 'linear-gradient(135deg, #10B981, #34D399)',
                    boxShadow: '0 12px 32px rgba(16,185,129,0.4)',
                  }}
                >
                  <CheckIcon sx={{ fontSize: 44 }} />
                </Box>
              </motion.div>
              <Typography variant="h5" fontWeight={800}>
                Booking submitted!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 420 }}>
                Your session request with {name ?? 'your mentor'} is awaiting confirmation. You'll be notified the moment it's approved.
              </Typography>
            </Stack>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      {step < 5 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            disabled={!canNext || submitting}
            onClick={() => void handleNext()}
          >
            {submitting ? 'Submitting…' : step === 4 ? 'Confirm & Book' : 'Continue'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BookingWizard;
