import { Autocomplete, Grid, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Stack } from '@/components/ui/Stack';
import { FormInput, FormSelect } from '@/components';
import { skillSchema, toOptionalNumber, type SkillFormValues } from '@/features/mentor/schemas';
import { PROFICIENCY_LEVELS, SKILL_SUGGESTIONS } from '@/features/mentor/constants';
import { EditorShell } from './EditorShell';
import type { SkillDraft } from '@/features/mentor/storage';

interface SkillEditorProps {
  initial: SkillDraft | null;
  onCancel: () => void;
  onSubmit: (values: Omit<SkillDraft, 'id'>) => void;
}

const toFormValues = (initial: SkillDraft | null): SkillFormValues => ({
  name: initial?.name ?? '',
  proficiencyLevel: initial?.proficiencyLevel ?? '',
  yearsOfExperience: initial?.yearsOfExperience ?? null,
});

export const SkillEditor: React.FC<SkillEditorProps> = ({ initial, onCancel, onSubmit }) => {
  const { control, handleSubmit } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  return (
    <EditorShell
      title={initial ? 'Edit skill' : 'Add skill'}
      subtitle="Skills you can teach with confidence"
      icon={<BoltOutlinedIcon />}
      iconColor="#F59E0B"
      submitLabel={initial ? 'Save changes' : 'Add skill'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          name: values.name ?? '',
          proficiencyLevel: values.proficiencyLevel ?? '',
          yearsOfExperience: toOptionalNumber(values.yearsOfExperience),
        });
      })}
    >
      <Stack spacing={2.5}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Autocomplete
              freeSolo
              options={SKILL_SUGGESTIONS}
              value={field.value}
              onChange={(_, value) => field.onChange(value ?? '')}
              onInputChange={(_, value) => field.onChange(value)}
              renderInput={(params) => (
                <TextField
                  slotProps={{
                    input: params.slotProps.input,
                    inputLabel: params.slotProps.inputLabel,
                    htmlInput: params.slotProps.htmlInput,
                  }}
                  label="Skill"
                  placeholder="e.g. System Design"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message ?? 'Start typing to see suggestions'}
                />
              )}
            />
          )}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="proficiencyLevel" control={control} label="Proficiency" options={PROFICIENCY_LEVELS} placeholder="Select level" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="yearsOfExperience" control={control} label="Years of experience" type="number" />
          </Grid>
        </Grid>
      </Stack>
    </EditorShell>
  );
};

export default SkillEditor;
