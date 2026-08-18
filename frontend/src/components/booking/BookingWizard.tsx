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
import { nowInAppZone, APP_TIMEZONE } from '@/utils';
import type { BookingRequest, Mentor, MentorAvailability, MentorPricing } from '@/types';

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

/** Converts "09:00" to minutes since midnight. */
const toMinutes = (value?: string): number | null => {
  if (!value) return null;
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
};

const formatMinutes = (minutes: number): string =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/**
 * Availability windows that apply to a given date — recurring windows match by
 * day of week, one-off windows match their specificDate.
 */
const windowsForDate = (availability: MentorAvailability[], date: Dayjs): MentorAvailability[] =>
  availability.filter(
    (window) =>
      window.active !== false &&
      (window.recurring
        ? window.dayOfWeek.toUpperCase() === date.format('dddd').toUpperCase()
        : window.specificDate === date.format('YYYY-MM-DD')),
  );

interface BookingWizardProps {
  mentor: Mentor;
  name?: string;
  pricing: MentorPricing[];
  /**
   * The mentor's availability, preloaded from the public profile — the booking
   * flow makes no extra API call for it (only the selected mentor's slots are
   * ever shown).
   */
  availability?: MentorAvailability[];
  learnerId?: string;
  learnerName?: string;
  /** Learner email — stored with the booking so status emails can reach them. */
  learnerEmail?: string;
  onSubmit: (request: BookingRequest) => Promise<void> | void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  mentor,
  name,
  pricing,
  availability = [],
  learnerId,
  learnerName,
  learnerEmail,
  onSubmit,
}) => {

  const [step, setStep] = useState(0);
  const [pricingId, setPricingId] = useState<string | undefined>(pricing[0]?.id);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedPricing = pricing.find((plan) => plan.id === pricingId) ?? pricing[0];
  const price = selectedPricing?.price ?? 0;

  /**
   * True when the mentor still has a bookable slot on the given day: the day
   * matches a configured window AND (for today) at least one slot has not
   * started yet. Today is never blanket-excluded — only its expired slots are.
   * E.g. a Sunday 6:00–6:30 PM window stays visible before 6 PM on Sunday.
   */
  const hasBookableSlots = (day: Dayjs, durationMinutes: number): boolean => {
    const windows = windowsForDate(availability, day);
    if (windows.length === 0) return false;
    if (!day.isSame(nowInAppZone(), 'day')) return true;
    const now = nowInAppZone();
    for (const window of windows) {
      const start = toMinutes(window.startTime);
      const end = toMinutes(window.endTime);
      if (start === null || end === null || durationMinutes <= 0) continue;
      const breakStart = toMinutes(window.breakStartTime);
      const breakEnd = toMinutes(window.breakEndTime);
      for (let t = start; t + durationMinutes <= end; t += durationMinutes) {
        if (breakStart !== null && breakEnd !== null && t < breakEnd && t + durationMinutes > breakStart) continue;
        const slotStart = day.hour(Math.floor(t / 60)).minute(t % 60).second(0);
        if (slotStart.isAfter(now)) return true;
      }
    }
    return false;
  };

  /**
   * Only dates on which the mentor actually has availability are offered —
   * starting from TODAY (a valid same-day slot must be bookable). No
   * generated/default dates, no other mentors' schedules, no expired slots.
   */
  const availableDates = useMemo(() => {
    if (!availability.length) return [];
    const duration = selectedPricing?.durationMinutes ?? 60;
    return Array.from({ length: DAYS_AHEAD })
      .map((_, index) => nowInAppZone().add(index, 'day'))
      .filter((day) => hasBookableSlots(day, duration));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availability, selectedPricing]);

  /**
   * Only the mentor's real time slots for the selected date. Slots that would
   * straddle a configured break or fall in the past (today) are excluded.
   */
  const slots = useMemo(() => {
    if (!date || !selectedPricing) return [];
    const duration = selectedPricing.durationMinutes ?? 60;
    const result: string[] = [];

    for (const window of windowsForDate(availability, date)) {
      const start = toMinutes(window.startTime);
      const end = toMinutes(window.endTime);
      if (start === null || end === null || duration <= 0) continue;
      const breakStart = toMinutes(window.breakStartTime);
      const breakEnd = toMinutes(window.breakEndTime);

      for (let t = start; t + duration <= end; t += duration) {
        const slotEnd = t + duration;
        if (breakStart !== null && breakEnd !== null && t < breakEnd && slotEnd > breakStart) continue;
        // Skip slots already in the past when the selected date is today.
        // "Now" is evaluated in the application timezone (Asia/Kolkata) so
        // same-day slots stay visible until their actual start time passes.
        if (date.isSame(nowInAppZone(), 'day')) {
          const slotDateTime = date.hour(Math.floor(t / 60)).minute(t % 60).second(0);
          if (slotDateTime.isBefore(nowInAppZone())) continue;
        }
        result.push(formatMinutes(t));
      }
    }
    return [...new Set(result)].sort();
  }, [availability, date, selectedPricing]);

  const hasAvailability = availability.length > 0;
  const noPricing = pricing.length === 0;
  const [first, last] = (name ?? 'Mentor').split(' ');

  const canNext =
    step === 0 ||
    (step === 1 && Boolean(selectedPricing)) ||
    (step === 2 && Boolean(date)) ||
    (step === 3 && Boolean(slot)) ||
    step === 4;

  const handleSelectPricing = (plan: MentorPricing) => {
    setPricingId(plan.id);
    // A different session type may have a different duration — the generated
    // slots change, so previously selected date/time must be re-picked.
    setDate(null);
    setSlot(null);
  };

  const handleNext = async () => {
    if (step === 4) {
      setSubmitting(true);
      try {
        await onSubmit({
          mentorId: mentor.id,
          learnerId,
          mentorName: name,
          learnerName,
          learnerEmail,
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
          // The backend recomputes the cost from the mentor's pricing plan —
          // the amount below is informational only.
          pricingId: selectedPricing?.id,
          credits: selectedPricing?.isFree ? 0 : price,
          timezone: APP_TIMEZONE,
        });
        setStep(5);
      } catch {
        // The mutation's onError already surfaced the real reason (e.g.
        // "Insufficient credits" or "This time slot is already booked").
        // Stay on the review step so the learner can correct and retry — and
        // swallow the rejection so it never becomes an unhandled promise
        // rejection in the console. The backend is idempotent: a retry of the
        // same slot returns the existing booking instead of duplicating it.
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
              {!hasAvailability && (
                <Typography variant="body2" color="warning.main" fontWeight={600} sx={{ textAlign: 'center' }}>
                  This mentor hasn&apos;t set their availability yet — you can&apos;t book a slot until they do.
                </Typography>
              )}
            </Stack>
          )}

          {step === 1 && (
            <Box sx={{ maxWidth: 560, mx: 'auto', py: 1 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2, textAlign: 'center' }}>
                Choose a session type
              </Typography>
              {noPricing ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  This mentor hasn&apos;t configured any session types yet.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {pricing.map((plan) => {
                    const selected = plan.id === pricingId;
                    return (
                      <Box
                        key={plan.id}
                        role="radio"
                        aria-checked={selected}
                        tabIndex={0}
                        onClick={() => handleSelectPricing(plan)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSelectPricing(plan);
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
                            {plan.isFree ? 'Free' : `${plan.price} credits`}
                          </Typography>
                          {plan.originalPrice && !plan.isFree && (
                            <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                              {plan.originalPrice} credits
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          )}

          {step === 2 && (
            <Box sx={{ maxWidth: 640, mx: 'auto' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, textAlign: 'center' }}>
                Pick a date
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                Only dates {name?.split(' ')[0] ?? 'the mentor'} is available are shown.
              </Typography>
              {availableDates.length === 0 ? (
                <Typography variant="body2" color="warning.main" sx={{ textAlign: 'center', py: 3 }} fontWeight={600}>
                  No upcoming availability in the next {DAYS_AHEAD} days.
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                  {availableDates.map((day) => {
                    const selected = date?.isSame(day, 'day');
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
              )}
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
              {slots.length === 0 ? (
                <Typography variant="body2" color="warning.main" sx={{ textAlign: 'center', py: 3 }} fontWeight={600}>
                  No available times for this date. Pick another date.
                </Typography>
              ) : (
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
              )}
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
                    <Typography variant="body2" fontWeight={700}>{price} credits</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Paid via wallet credits</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">−{price} credits</Typography>
                  </Stack>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5, mt: 1 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2" fontWeight={800}>Total due</Typography>
                      <Typography variant="subtitle2" fontWeight={800} color="success.main">0 credits</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Credits are reserved on booking and transferred to the mentor only after the
                      session is completed successfully.
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
            disabled={!canNext || submitting || noPricing}
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
