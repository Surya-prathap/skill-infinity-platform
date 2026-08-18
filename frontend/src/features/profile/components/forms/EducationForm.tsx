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
import { degreeOptions } from '@/features/profile';
import {
  educationSchema,
  type EducationFormValues,
} from '@/features/profile/schemas';
import type { SectionFormProps } from '../SectionPage';

export const EducationForm: React.FC<SectionFormProps<EducationFormValues>> = ({
  defaultValues,
  submitting,
  onSubmit,
}) => {
  const { control, handleSubmit, watch } = useForm<EducationFormValues>({
    resolver: zodResolver(educationSchema),
    defaultValues,
  });
  const currentlyStudying = watch('currentlyStudying');

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <FormInput
          name="institution"
          control={control}
          label="Institution"
          required
          placeholder="e.g. Stanford University"
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="degree"
              control={control}
              label="Degree"
              options={degreeOptions}
              placeholder="Select degree"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              name="fieldOfStudy"
              control={control}
              label="Field of study"
              placeholder="e.g. Computer Science"
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
              disabled={currentlyStudying}
            />
          </Grid>
        </Grid>
        <FormCheckbox
          name="currentlyStudying"
          control={control}
          label="I am currently studying here"
          helperText="Removes the end date requirement."
        />
        <FormTextarea name="description" control={control} label="Description" rows={3} />
        <FormInput name="grade" control={control} label="Grade / GPA" placeholder="e.g. 3.8 GPA" />
        <Button type="submit" size="large" fullWidth loading={submitting}>
          Save Education
        </Button>
      </Stack>
    </Box>
  );
};

export default EducationForm;
