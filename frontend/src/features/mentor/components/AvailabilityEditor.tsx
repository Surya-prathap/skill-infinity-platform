import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Stack } from '@/components/ui/Stack';
import { FormCheckbox, FormInput, FormSelect } from '@/components';
import { availabilitySchema, type AvailabilityFormValues } from '@/features/mentor/schemas';
import { DAYS_OF_WEEK, SLOT_DURATIONS, TIMEZONES } from '@/features/mentor/constants';
import { EditorShell } from './EditorShell';
import type { AvailabilityDraft } from '@/features/mentor/storage';

interface AvailabilityEditorProps {
  initial: AvailabilityDraft | null;
  onCancel: () => void;
  onSubmit: (values: Omit<AvailabilityDraft, 'id'>) => void;
}

const toFormValues = (initial: AvailabilityDraft | null): AvailabilityFormValues => ({
  dayOfWeek: initial?.dayOfWeek ?? '',
  startTime: initial?.startTime ?? '09:00',
  endTime: initial?.endTime ?? '17:00',
  breakStartTime: initial?.breakStartTime ?? '',
  breakEndTime: initial?.breakEndTime ?? '',
  slotDurationMinutes: initial?.slotDurationMinutes ?? 60,
  recurring: initial?.recurring ?? true,
  timezone: initial?.timezone ?? '',
});

export const AvailabilityEditor: React.FC<AvailabilityEditorProps> = ({ initial, onCancel, onSubmit }) => {
  const { control, handleSubmit } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  return (
    <EditorShell
      title={initial ? 'Edit availability' : 'Add availability'}
      subtitle="Define a weekly window — breaks and slot length included"
      icon={<CalendarMonthOutlinedIcon />}
      iconColor="#EC4899"
      submitLabel={initial ? 'Save changes' : 'Add slot'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          dayOfWeek: values.dayOfWeek ?? '',
          startTime: values.startTime ?? '',
          endTime: values.endTime ?? '',
          breakStartTime: values.breakStartTime ?? '',
          breakEndTime: values.breakEndTime ?? '',
          slotDurationMinutes: Number(values.slotDurationMinutes),
          recurring: values.recurring,
          timezone: values.timezone ?? '',
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="dayOfWeek" control={control} label="Day of week" options={DAYS_OF_WEEK} placeholder="Select day" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="slotDurationMinutes" control={control} label="Slot length" options={SLOT_DURATIONS} required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="startTime" control={control} label="Start time" type="time" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="endTime" control={control} label="End time" type="time" required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="breakStartTime" control={control} label="Break starts (optional)" type="time" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="breakEndTime" control={control} label="Break ends (optional)" type="time" />
          </Grid>
        </Grid>
        <FormSelect name="timezone" control={control} label="Timezone" options={TIMEZONES} placeholder="Select timezone" />
        <FormCheckbox
          name="recurring"
          control={control}
          label="Repeat every week"
          helperText="Off for one-off availability (blocked dates are managed separately)."
        />
      </Stack>
    </EditorShell>
  );
};

export default AvailabilityEditor;
