import { Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import { Stack } from '@/components/ui/Stack';
import { FormCheckbox, FormInput, FormSelect, FormTextarea } from '@/components';
import { pricingSchema, toOptionalNumber, type PricingFormValues } from '@/features/mentor/schemas';
import { CURRENCIES, SESSION_DURATIONS, SESSION_TYPES } from '@/features/mentor/constants';
import { EditorShell } from './EditorShell';
import type { PricingDraft } from '@/features/mentor/storage';

interface PricingEditorProps {
  initial: PricingDraft | null;
  onCancel: () => void;
  onSubmit: (values: Omit<PricingDraft, 'id'>) => void;
}

const toFormValues = (initial: PricingDraft | null): PricingFormValues => ({
  sessionType: initial?.sessionType ?? '',
  price: initial?.price ?? 50,
  originalPrice: initial?.originalPrice ?? null,
  currency: initial?.currency ?? 'USD',
  discountPercentage: initial?.discountPercentage ?? null,
  durationMinutes: initial?.durationMinutes ?? 60,
  isFree: initial?.isFree ?? false,
  description: initial?.description ?? '',
});

export const PricingEditor: React.FC<PricingEditorProps> = ({ initial, onCancel, onSubmit }) => {
  const { control, handleSubmit } = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: toFormValues(initial),
    mode: 'onChange',
  });

  return (
    <EditorShell
      title={initial ? 'Edit pricing plan' : 'Add pricing plan'}
      subtitle="Charge per session in your preferred currency"
      icon={<PriceChangeOutlinedIcon />}
      iconColor="#14B8A6"
      submitLabel={initial ? 'Save changes' : 'Add plan'}
      onCancel={onCancel}
      onSubmit={handleSubmit((values) => {
        onSubmit({
          sessionType: values.sessionType ?? '',
          price: Number(values.price),
          originalPrice: toOptionalNumber(values.originalPrice),
          currency: values.currency ?? 'USD',
          discountPercentage: toOptionalNumber(values.discountPercentage),
          durationMinutes: Number(values.durationMinutes),
          isFree: values.isFree,
          description: values.description ?? '',
        });
      })}
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="sessionType" control={control} label="Session type" options={SESSION_TYPES} placeholder="Select type" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="durationMinutes" control={control} label="Session duration" options={SESSION_DURATIONS} required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormInput name="price" control={control} label="Price per session" type="number" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormInput name="originalPrice" control={control} label="Original price (optional)" type="number" />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormSelect name="currency" control={control} label="Currency" options={CURRENCIES} required />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="discountPercentage" control={control} label="Discount % (optional)" type="number" helperText="e.g. 20 for a 20% launch discount" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <FormCheckbox name="isFree" control={control} label="Offer this session for free" />
          </Grid>
        </Grid>
        <FormTextarea name="description" control={control} label="What's included?" rows={2} />
      </Stack>
    </EditorShell>
  );
};

export default PricingEditor;
