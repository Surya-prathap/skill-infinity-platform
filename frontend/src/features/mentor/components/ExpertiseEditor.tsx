import { Grid } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { Stack } from '@/components/ui/Stack';
import { FormInput, FormSelect, FormTextarea } from '@/components';
import { expertiseSchema, toOptionalNumber, type ExpertiseFormValues } from '@/features/mentor/schemas';
import { PROFICIENCY_LEVELS, TEACHING_LEVELS } from '@/features/mentor/constants';
import { EditorShell } from './EditorShell';
import type { ExpertiseDraft } from '@/features/mentor/storage';
import type { Category } from '@/types';

export const CUSTOM_CATEGORY_VALUE = 'CUSTOM';

interface ExpertiseEditorProps {
  initial: ExpertiseDraft | null;
  categories: Category[];
  onCancel: () => void;
  onSubmit: (values: Omit<ExpertiseDraft, 'id'>) => void;
}

const toFormValues = (initial: ExpertiseDraft | null): ExpertiseFormValues => ({
  categoryId: initial?.categoryId ?? '',
  subCategoryId: initial?.subCategoryId ?? '',
  skillName: initial?.skillName ?? '',
  yearsOfExperience: initial?.yearsOfExperience ?? null,
  teachingLevel: initial?.teachingLevel ?? '',
  proficiencyLevel: initial?.proficiencyLevel ?? '',
  technologies: initial?.technologies ?? '',
  description: initial?.description ?? '',
});

export const ExpertiseEditor: React.FC<ExpertiseEditorProps> = ({ initial, categories, onCancel, onSubmit }) => {
  const { control, handleSubmit } = useForm<ExpertiseFormValues>({
    resolver: zodResolver(expertiseSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  const categoryId = useWatch({ control, name: 'categoryId' });
  const isCustom = categoryId === CUSTOM_CATEGORY_VALUE;

  const categoryOptions = [
    ...categories.map((category) => ({ label: category.name, value: category.id })),
    { label: '✦ Custom skill (not listed)', value: CUSTOM_CATEGORY_VALUE },
  ];

  const selectedCategory = categories.find((category) => category.id === categoryId);
  const subCategoryOptions = (selectedCategory?.subCategories ?? []).map((sub) => ({
    label: sub.name,
    value: sub.id,
  }));

  return (
    <EditorShell
      title={initial ? 'Edit expertise' : 'Add expertise'}
      subtitle="Define what you teach and at what depth"
      icon={<LightbulbOutlinedIcon />}
      iconColor="#6D5DF6"
      submitLabel={initial ? 'Save changes' : 'Add expertise'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        const category = categories.find((c) => c.id === values.categoryId);
        const subCategory = category?.subCategories.find((s) => s.id === values.subCategoryId);
        onSubmit({
          categoryId: values.categoryId ?? '',
          categoryName: category?.name ?? (isCustom ? 'Custom Skill' : ''),
          subCategoryId: values.subCategoryId ?? '',
          subCategoryName: subCategory?.name ?? '',
          skillName: values.skillName ?? '',
          yearsOfExperience: toOptionalNumber(values.yearsOfExperience),
          teachingLevel: values.teachingLevel ?? '',
          proficiencyLevel: values.proficiencyLevel ?? '',
          technologies: values.technologies ?? '',
          description: values.description ?? '',
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: isCustom ? 12 : 6 }}>
            <FormSelect
              name="categoryId"
              control={control}
              label="Category"
              options={categoryOptions}
              placeholder="Select a category"
              required
            />
          </Grid>
          {!isCustom && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelect
                name="subCategoryId"
                control={control}
                label="Sub-category"
                options={subCategoryOptions}
                placeholder="Select sub-category"
              />
            </Grid>
          )}
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormInput
              name="skillName"
              control={control}
              label={isCustom ? 'Custom skill name' : 'Skill you teach'}
              required
              placeholder={isCustom ? 'e.g. Prompt Engineering' : 'e.g. System Design'}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormSelect name="teachingLevel" control={control} label="Teaching level" options={TEACHING_LEVELS} placeholder="Select" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormSelect name="proficiencyLevel" control={control} label="Your proficiency" options={PROFICIENCY_LEVELS} placeholder="Select" required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="yearsOfExperience" control={control} label="Years of experience" type="number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="technologies" control={control} label="Tools & technologies" placeholder="e.g. AWS, Kafka, Kubernetes" />
          </Grid>
        </Grid>
        <FormTextarea name="description" control={control} label="What will learners gain?" rows={2} />
      </Stack>
    </EditorShell>
  );
};

export default ExpertiseEditor;
