import { Grid } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Stack } from '@/components/ui/Stack';
import { DatePickerField, FormCheckbox, FormInput, FormTextarea } from '@/components';
import { certificationSchema, type CertificationFormValues } from '@/features/mentor/schemas';
import { EditorShell } from './EditorShell';
import type { CertificationDraft } from '@/features/mentor/storage';

interface CertificationEditorProps {
  initial: CertificationDraft | null;
  onCancel: () => void;
  onSubmit: (values: Omit<CertificationDraft, 'id'>) => void;
}

const toFormValues = (initial: CertificationDraft | null): CertificationFormValues => ({
  title: initial?.title ?? '',
  issuingOrganization: initial?.issuingOrganization ?? '',
  credentialId: initial?.credentialId ?? '',
  credentialUrl: initial?.credentialUrl ?? '',
  issueDate: initial?.issueDate ?? '',
  doesNotExpire: initial?.doesNotExpire ?? true,
  description: initial?.description ?? '',
});

export const CertificationEditor: React.FC<CertificationEditorProps> = ({ initial, onCancel, onSubmit }) => {
  const { control, handleSubmit } = useForm<CertificationFormValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });
  const doesNotExpire = useWatch({ control, name: 'doesNotExpire' });

  return (
    <EditorShell
      title={initial ? 'Edit certification' : 'Add certification'}
      subtitle="Credentials build instant trust with learners"
      icon={<WorkspacePremiumOutlinedIcon />}
      iconColor="#F59E0B"
      submitLabel={initial ? 'Save changes' : 'Add certification'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          title: values.title ?? '',
          issuingOrganization: values.issuingOrganization ?? '',
          credentialId: values.credentialId ?? '',
          credentialUrl: values.credentialUrl ?? '',
          issueDate: values.issueDate ?? '',
          doesNotExpire: values.doesNotExpire,
          description: values.description ?? '',
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="title" control={control} label="Certification title" required placeholder="e.g. AWS Solutions Architect — Professional" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="issuingOrganization" control={control} label="Issuing organization" required placeholder="e.g. Amazon Web Services" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="credentialId" control={control} label="Credential ID (optional)" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="credentialUrl" control={control} label="Credential URL (optional)" placeholder="https://…" />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="issueDate" control={control} label="Issue date" disabled={doesNotExpire} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormCheckbox
              name="doesNotExpire"
              control={control}
              label="This certification does not expire"
              helperText="Selecting this removes the issue date requirement."
            />
          </Grid>
        </Grid>
        <FormTextarea name="description" control={control} label="Description (optional)" rows={2} />
      </Stack>
    </EditorShell>
  );
};

export default CertificationEditor;
