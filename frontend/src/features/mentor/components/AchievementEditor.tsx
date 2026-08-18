import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import { Stack } from '@/components/ui/Stack';
import { DatePickerField, FormInput, FormSelect, FormTextarea } from '@/components';
import { achievementSchema, type AchievementFormValues } from '@/features/mentor/schemas';
import { ACHIEVEMENT_TYPES } from '@/features/mentor/constants';
import { EditorShell } from './EditorShell';
import type { MentorAchievement } from '@/types';

interface AchievementEditorProps {
  initial: MentorAchievement | null;
  onCancel: () => void;
  onSubmit: (values: Omit<MentorAchievement, 'id'>) => void;
}

const toFormValues = (initial: MentorAchievement | null): AchievementFormValues => ({
  title: initial?.title ?? '',
  type: initial?.type ?? 'AWARD',
  dateAchieved: initial?.dateAchieved ?? '',
  issuer: initial?.issuer ?? '',
  url: initial?.url ?? '',
  description: initial?.description ?? '',
});

export const AchievementEditor: React.FC<AchievementEditorProps> = ({
  initial,
  onCancel,
  onSubmit,
}) => {
  const { control, handleSubmit } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  return (
    <EditorShell
      title={initial ? 'Edit achievement' : 'Add achievement'}
      subtitle="Badges, awards, milestones and highlights"
      icon={<EmojiEventsOutlinedIcon />}
      iconColor="#F59E0B"
      submitLabel={initial ? 'Save changes' : 'Add achievement'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          title: values.title ?? '',
          type: values.type ?? 'AWARD',
          dateAchieved: values.dateAchieved || undefined,
          issuer: values.issuer || undefined,
          url: values.url || undefined,
          description: values.description || undefined,
          sortOrder: initial?.sortOrder ?? 0,
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <FormInput
              name="title"
              control={control}
              label="Title"
              required
              placeholder="e.g. Top 1% Mentor 2025"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormSelect
              name="type"
              control={control}
              label="Type"
              options={ACHIEVEMENT_TYPES}
              required
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="dateAchieved" control={control} label="Date achieved" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              name="issuer"
              control={control}
              label="Issuer (optional)"
              placeholder="e.g. Skill Infinity"
            />
          </Grid>
        </Grid>
        <FormInput
          name="url"
          control={control}
          label="Reference URL (optional)"
          placeholder="https://…"
        />
        <FormTextarea
          name="description"
          control={control}
          label="Description (optional)"
          rows={3}
        />
      </Stack>
    </EditorShell>
  );
};

export default AchievementEditor;
