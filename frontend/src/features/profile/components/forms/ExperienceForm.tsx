import { Box, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@/components/ui/Stack';
import {
  Button,
  DatePickerField,
  FormCheckbox,
  FormInput,
  FormSelect,
  FormTextarea,
} from '@/components';
import { employmentTypeOptions } from '@/features/profile';
import {
  experienceSchema,
  type ExperienceFormValues,
} from '@/features/profile/schemas';
import type { SectionFormProps } from '../SectionPage';

export const ExperienceForm: React.FC<SectionFormProps<ExperienceFormValues>> = ({
  defaultValues,
  submitting,
  onSubmit,
}) => {
  const { control, handleSubmit, watch } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    defaultValues,
  });
  const currentlyWorking = watch('currentlyWorking');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            <FormInput name="location" control={control} label="Location" placeholder="e.g. Austin, TX / Remote" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="employmentType"
              control={control}
              label="Employment type"
              options={employmentTypeOptions}
              placeholder="Select type"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="startDate" control={control} label="Start date" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField
              name="endDate"
              control={control}
              label="End date"
              disabled={currentlyWorking}
            />
          </Grid>
        </Grid>
        <FormCheckbox
          name="currentlyWorking"
          control={control}
          label="I currently work here"
          helperText="Removes the end date requirement."
        />
        <FormTextarea name="description" control={control} label="Description" rows={3} />
        <Button type="submit" size="large" fullWidth loading={submitting}>
          Save Experience
        </Button>
      </Stack>
    </Box>
  );
};

export default ExperienceForm;
