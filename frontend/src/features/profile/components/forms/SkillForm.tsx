import { Box, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@/components/ui/Stack';
import { Button, FormInput, FormSelect } from '@/components';
import { proficiencyOptions } from '@/features/profile';
import { skillSchema, type SkillFormValues } from '@/features/profile/schemas';
import type { SectionFormProps } from '../SectionPage';

export const SkillForm: React.FC<SectionFormProps<SkillFormValues>> = ({
  defaultValues,
  submitting,
  onSubmit,
}) => {
  const { control, handleSubmit } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <FormInput name="name" control={control} label="Skill" required placeholder="e.g. React" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="proficiencyLevel"
              control={control}
              label="Proficiency"
              options={proficiencyOptions}
              placeholder="Select level"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              name="yearsOfExperience"
              control={control}
              label="Years of experience"
              type="number"
              placeholder="e.g. 4"
            />
          </Grid>
        </Grid>
        <Button type="submit" size="large" fullWidth loading={submitting}>
          Save Skill
        </Button>
      </Stack>
    </Box>
  );
};

export default SkillForm;
