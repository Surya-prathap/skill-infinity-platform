import { Box, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Stack } from '@/components/ui/Stack';
import { Button, FormCheckbox, FormSelect } from '@/components';
import { languageOptions, proficiencyOptions } from '@/features/profile';
import { languageSchema, type LanguageFormValues } from '@/features/profile/schemas';
import type { SectionFormProps } from '../SectionPage';

export const LanguageForm: React.FC<SectionFormProps<LanguageFormValues>> = ({
  defaultValues,
  submitting,
  onSubmit,
}) => {
  const { control, handleSubmit } = useForm<LanguageFormValues>({
    resolver: zodResolver(languageSchema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="name"
              control={control}
              label="Language"
              options={languageOptions}
              placeholder="Select language"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="proficiencyLevel"
              control={control}
              label="Proficiency"
              options={[
                ...proficiencyOptions,
                { label: 'Native', value: 'Native' },
              ]}
              placeholder="Select level"
              required
            />
          </Grid>
        </Grid>
        <FormCheckbox
          name="isNative"
          control={control}
          label="This is my native language"
        />
        <Button type="submit" size="large" fullWidth loading={submitting}>
          Save Language
        </Button>
      </Stack>
    </Box>
  );
};

export default LanguageForm;
