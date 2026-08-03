import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button as MuiButton,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { AvailabilityCalendar } from '@/components/mentor/AvailabilityCalendar';
import { AnalyticsCard } from '@/components/mentor/AnalyticsCard';
import { GradientCard } from '@/components/mentor/GradientCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useDocumentTitle } from '@/hooks';
import { getStoredValue, setStoredValue, showSuccess } from '@/utils';
import { DAY_LABELS, TIMEZONES } from '@/features/mentor/constants';
import { availabilityToDraft } from '@/features/mentor/storage';
import { AvailabilityEditor } from '@/features/mentor/components';
import {
  useAvailabilityQuery,
  useMentorProfileQuery,
  useSaveAvailabilityMutation,
} from '@/features/mentor/hooks';
import type { AvailabilityRequest, MentorAvailability } from '@/types';

const BLOCKED_KEY = 'skill_mentor_blocked_dates';

const toRequest = (slot: MentorAvailability): AvailabilityRequest => ({
  dayOfWeek: slot.dayOfWeek,
  startTime: slot.startTime,
  endTime: slot.endTime,
  breakStartTime: slot.breakStartTime || undefined,
  breakEndTime: slot.breakEndTime || undefined,
  slotDurationMinutes: slot.slotDurationMinutes,
  recurring: slot.recurring,
  timezone: slot.timezone || undefined,
});

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export const MentorAvailabilityPage: React.FC = () => {
  useDocumentTitle('Availability');
  const { availabilities, isOffline } = useAvailabilityQuery();
  const { mentor } = useMentorProfileQuery();
  const saveMutation = useSaveAvailabilityMutation();

  const [slots, setSlots] = useState<MentorAvailability[]>(availabilities);
  const [dirty, setDirty] = useState(false);
  const [editor, setEditor] = useState<{
    open: boolean;
    editing: boolean;
    item: MentorAvailability | null;
  }>({
    open: false,
    editing: false,
    item: null,
  });
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropDay, setDropDay] = useState<string | null>(null);
  const [timezone, setTimezone] = useState(mentor?.profile?.timezone ?? '');
  const [blockedDates, setBlockedDates] = useState<string[]>(() =>
    getStoredValue<string[]>(BLOCKED_KEY, []),
  );

  useEffect(() => {
    setSlots(availabilities);
  }, [availabilities]);

  const markDirty = (next: MentorAvailability[]) => {
    setSlots(next);
    setDirty(true);
  };

  /* ---------------- Slot operations ---------------- */
  const toggleSlot = (slot: MentorAvailability) =>
    markDirty(
      slots.map((item) =>
        item.id === slot.id ? { ...item, active: item.active !== false ? false : true } : item,
      ),
    );

  const removeSlot = (slot: MentorAvailability) => {
    if (!slot.id) return;
    markDirty(slots.filter((item) => item.id !== slot.id));
  };

  const addOrUpdateSlot = (values: Omit<MentorAvailability, 'id' | 'timeSlots'>) => {
    if (editor.editing && editor.item?.id) {
      markDirty(
        slots.map((item) =>
          item.id === editor.item?.id
            ? { ...item, ...values, timezone: timezone || values.timezone }
            : item,
        ),
      );
    } else {
      markDirty([
        ...slots,
        {
          ...values,
          id: `avail-${Date.now()}`,
          active: true,
          timezone: timezone || values.timezone,
        },
      ]);
    }
    setEditor({ open: false, editing: false, item: null });
  };

  const handleDrop = (dayOfWeek: string) => {
    if (!draggingId) return;
    const target = slots.find((slot) => slot.id === draggingId);
    if (target) {
      markDirty(slots.map((slot) => (slot.id === draggingId ? { ...slot, dayOfWeek } : slot)));
      showSuccess(`Moved to ${DAY_LABELS[dayOfWeek] ?? dayOfWeek}`);
    }
    setDraggingId(null);
    setDropDay(null);
  };

  /* ---------------- Blocked dates ---------------- */
  const toggleBlockedDate = (date: string) => {
    const next = blockedDates.includes(date)
      ? blockedDates.filter((d) => d !== date)
      : [...blockedDates, date];
    setBlockedDates(next);
    setStoredValue(BLOCKED_KEY, next);
  };

  const calendarDays = useMemo(() => {
    const start = dayjs().startOf('month');
    const end = dayjs().endOf('month');
    const days: dayjs.Dayjs[] = [];
    let cursor = start;
    while (cursor.isBefore(end) || cursor.isSame(end, 'day')) {
      days.push(cursor);
      cursor = cursor.add(1, 'day');
    }
    return days;
  }, []);

  /* ---------------- Save ---------------- */
  const handleSave = () => {
    saveMutation.mutate(slots.map(toRequest));
    setDirty(false);
  };

  const activeSlotCount = slots.filter((slot) => slot.active !== false).length;

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="brand" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <CalendarMonthOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Availability
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {activeSlotCount} active slot{activeSlotCount === 1 ? '' : 's'} ·{' '}
                {blockedDates.length} blocked date{blockedDates.length === 1 ? '' : 's'}
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1.5}>
            {dirty && <StatusBadge label="Unsaved changes" color="warning" />}
            <MuiButton
              variant="contained"
              size="large"
              startIcon={<SaveOutlinedIcon />}
              loading={saveMutation.isPending}
              disabled={!dirty}
              onClick={handleSave}
              sx={{
                bgcolor: '#fff',
                color: '#5443D4',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
              }}
            >
              Save changes
            </MuiButton>
          </Stack>
        </Stack>
      </GradientCard>

      {/* ================= Controls ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 2 }}>
                <PublicOutlinedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  Timezone
                </Typography>
              </Stack>
              <FormControl fullWidth size="medium">
                <InputLabel id="availability-timezone-label">Timezone</InputLabel>
                <Select
                  labelId="availability-timezone-label"
                  value={timezone}
                  onChange={(event) => setTimezone(String(event.target.value))}
                  label="Timezone"
                >
                  {TIMEZONES.map((option) => (
                    <MenuItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1.5 }}
              >
                All slots are displayed and booked in this timezone. New slots inherit it
                automatically.
              </Typography>
              <Stack direction="row" gap={1} sx={{ mt: 2.5 }}>
                <MuiButton
                  variant="contained"
                  startIcon={<ScheduleOutlinedIcon />}
                  onClick={() => setEditor({ open: true, editing: false, item: null })}
                >
                  Add time slot
                </MuiButton>
              </Stack>
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <Card sx={{ p: 3, height: '100%' }}>
              <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 2 }}>
                <EventBusyOutlinedIcon sx={{ color: 'error.main' }} />
                <Typography variant="h6" fontWeight={700}>
                  Blocked dates
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pick dates when you're unavailable — they are excluded from generated time slots.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: 0.5,
                  maxWidth: 520,
                }}
              >
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, index) => (
                  <Box
                    key={index}
                    component="span"
                    sx={{
                      fontSize: '0.65rem',
                      textAlign: 'center',
                      fontWeight: 700,
                      color: 'text.disabled',
                      py: 0.5,
                    }}
                  >
                    {label}
                  </Box>
                ))}
                {calendarDays.map((day) => {
                  const iso = day.format('YYYY-MM-DD');
                  const blocked = blockedDates.includes(iso);
                  const isPast = day.isBefore(dayjs(), 'day');
                  return (
                    <Box
                      key={iso}
                      role="checkbox"
                      aria-checked={blocked}
                      tabIndex={isPast ? -1 : 0}
                      onClick={() => !isPast && toggleBlockedDate(iso)}
                      onKeyDown={(event) => {
                        if (!isPast && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault();
                          toggleBlockedDate(iso);
                        }
                      }}
                      sx={{
                        aspectRatio: '1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        borderRadius: 1.5,
                        cursor: isPast ? 'default' : 'pointer',
                        color: isPast ? 'text.disabled' : blocked ? '#fff' : 'text.primary',
                        bgcolor: blocked ? 'error.main' : isPast ? 'action.hover' : 'transparent',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isPast
                            ? 'action.hover'
                            : blocked
                              ? 'error.dark'
                              : 'action.selected',
                        },
                        '&:focus-visible': {
                          outline: '3px solid rgba(239,68,68,0.3)',
                          outlineOffset: 1,
                        },
                      }}
                    >
                      {day.format('D')}
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Editor ================= */}
      {editor.open && (
        <Card sx={{ mb: 3, p: { xs: 2.5, md: 3 } }}>
          <AvailabilityEditor
            initial={editor.item ? availabilityToDraft(editor.item) : null}
            onCancel={() => setEditor({ open: false, editing: false, item: null })}
            onSubmit={(values) => addOrUpdateSlot(values)}
          />
        </Card>
      )}

      {/* ================= Weekly calendar ================= */}
      <AnalyticsCard
        title="Weekly Schedule"
        subtitle="Drag slots between days · click a slot to edit · use × to remove"
        icon={<CalendarMonthOutlinedIcon />}
        iconColor="#EC4899"
        action={
          <Chip
            size="small"
            label={`${activeSlotCount} of ${slots.length} active`}
            sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}
          />
        }
      >
        {slots.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2.5 }}>
            No availability configured yet. Add your first time slot to start receiving booking
            requests.
          </Alert>
        ) : (
          <AvailabilityCalendar
            slots={slots}
            readOnly={false}
            onToggleSlot={toggleSlot}
            onRemoveSlot={removeSlot}
            onAddSlot={(dayOfWeek) =>
              setEditor({
                open: true,
                editing: false,
                item: {
                  id: '',
                  dayOfWeek,
                  startTime: '09:00',
                  endTime: '17:00',
                  slotDurationMinutes: 60,
                  recurring: true,
                  active: true,
                },
              })
            }
            onDragStartSlot={(slot) => setDraggingId(slot.id ?? null)}
            onDragEndSlot={() => {
              setDraggingId(null);
              setDropDay(null);
            }}
            onDropOnDay={(day) => handleDrop(day)}
            onHoverDay={setDropDay}
            draggingId={draggingId}
            dropDay={dropDay}
          />
        )}
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
          <Chip
            size="small"
            icon={<ScheduleOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Drag & drop slots between days"
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Tap a slot to edit"
            variant="outlined"
          />
          <Chip
            size="small"
            icon={<EventBusyOutlinedIcon sx={{ fontSize: 14 }} />}
            label="Blocked dates excluded from bookings"
            variant="outlined"
          />
        </Stack>
      </AnalyticsCard>
    </Box>
  );
};

export default MentorAvailabilityPage;
