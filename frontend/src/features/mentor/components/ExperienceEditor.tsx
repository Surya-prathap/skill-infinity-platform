import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import { Stack } from '@/components/ui/Stack';
import { DatePickerField, FormCheckbox, FormInput, FormSelect, FormTextarea } from '@/components';
import { experienceSchema, type ExperienceFormValues } from '@/features/mentor/schemas';
import { EditorShell } from './EditorShell';
import type { ExperienceDraft } from '@/features/mentor/storage';

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Freelance', value: 'FREELANCE' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Self-employed', value: 'SELF_EMPLOYED' },
];

interface ExperienceEditorProps {
  initial: ExperienceDraft | null;
  onCancel: () => void;
  onSubmit: (values: Omit<ExperienceDraft, 'id'>) => void;
}

const toFormValues = (initial: ExperienceDraft | null): ExperienceFormValues => ({
  company: initial?.company ?? '',
  title: initial?.title ?? '',
  location: initial?.location ?? '',
  employmentType: initial?.employmentType ?? '',
  startDate: initial?.startDate ?? '',
  endDate: initial?.endDate ?? '',
  currentlyWorking: initial?.currentlyWorking ?? false,
  description: initial?.description ?? '',
});

export const ExperienceEditor: React.FC<ExperienceEditorProps> = ({ initial, onCancel, onSubmit }) => {
  const { control, handleSubmit, watch } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });
  const currentlyWorking = watch('currentlyWorking');

  return (
    <EditorShell
      title={initial ? 'Edit experience' : 'Add experience'}
      subtitle="Share the roles that shaped your expertise"
      icon={<WorkOutlineOutlinedIcon />}
      iconColor="#3B82F6"
      submitLabel={initial ? 'Save changes' : 'Add experience'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          company: values.company ?? '',
          title: values.title ?? '',
          location: values.location ?? '',
          employmentType: values.employmentType ?? '',
          startDate: values.startDate ?? '',
          endDate: values.endDate ?? '',
          currentlyWorking: values.currentlyWorking,
          description: values.description ?? '',
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="title" control={control} label="Job title" required placeholder="e.g. Senior Frontend Engineer" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="company" control={control} label="Company" required placeholder="e.g. Lumina Labs" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="location" control={control} label="Location" placeholder="e.g. San Francisco / Remote" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="employmentType" control={control} label="Employment type" options={EMPLOYMENT_TYPES} placeholder="Select type" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="startDate" control={control} label="Start date" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="endDate" control={control} label="End date" disabled={currentlyWorking} />
          </Grid>
        </Grid>
        <FormCheckbox
          name="currentlyWorking"
          control={control}
          label="I currently work here"
          helperText="Removes the end date requirement."
        />
        <FormTextarea name="description" control={control} label="What did you do?" rows={3} />
      </Stack>
    </EditorShell>
  );
};

export default ExperienceEditor;
