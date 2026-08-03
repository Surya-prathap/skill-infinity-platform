import { Box, Chip, IconButton, LinearProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import TranslateIcon from '@mui/icons-material/Translate';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import {
  proficiencyToPercent,
  useAddLanguageMutation,
  useDeleteLanguageMutation,
  useProfileQuery,
  useUpdateLanguageMutation,
} from '@/features/profile';
import { LanguageForm, SectionPage } from '@/features/profile/components';
import type { LanguageFormValues } from '@/features/profile/schemas';
import type { Language, LanguageRequest } from '@/types';

const toRequest = (values: LanguageFormValues): LanguageRequest => ({
  name: values.name,
  proficiencyLevel: values.proficiencyLevel,
  isNative: values.isNative,
  sortOrder: 0,
});

const formDefaultValues = (item: Language | null): LanguageFormValues => ({
  name: item?.name ?? '',
  proficiencyLevel: item?.proficiencyLevel ?? '',
  isNative: item?.isNative ?? false,
});

export const LanguagesPage: React.FC = () => {
  useDocumentTitle('Languages');
  const { user } = useAuth();
  const { languages } = useProfileQuery();
  const addLanguage = useAddLanguageMutation();
  const updateLanguage = useUpdateLanguageMutation();
  const deleteLanguage = useDeleteLanguageMutation();
  const userId = user?.userId ?? '';

  const handleSubmit = (values: LanguageFormValues, item: Language | null) => {
    const payload = toRequest(values);
    return item?.id
      ? updateLanguage.mutateAsync({ userId, itemId: item.id, payload })
      : addLanguage.mutateAsync({ userId, payload });
  };

  return (
    <SectionPage<Language, LanguageFormValues>
      icon={<TranslateIcon />}
      color="#3B82F6"
      title="Languages"
      subtitle="The languages you speak and how comfortable you are in each."
      addLabel="Add Language"
      modalTitle="Language"
      emptyTitle="No languages added yet"
      emptyDescription="Add the languages you speak so mentors can communicate with you comfortably."
      items={languages}
      FormComponent={LanguageForm}
      formDefaultValues={formDefaultValues}
      handleSubmit={handleSubmit}
      handleDelete={(item) => deleteLanguage.mutateAsync({ userId, itemId: item.id! })}
      deleteMessage={(item) => `This will remove ${item.name} from your languages.`}
      renderItem={(item, { onEdit, onDelete }) => (
        <Box
          key={item.id ?? item.name}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover', transform: 'translateY(-1px)' },
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
              flexShrink: 0,
            }}
          >
            <TranslateIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                {item.name}
              </Typography>
              {item.isNative && <Chip size="small" label="Native" color="primary" sx={{ height: 20 }} />}
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.75 }}>
              <Box sx={{ flexGrow: 1, maxWidth: 220 }}>
                <LinearProgress
                  variant="determinate"
                  value={proficiencyToPercent(item.proficiencyLevel)}
                  sx={{ height: 6 }}
                  color="info"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72, textAlign: 'right' }}>
                {item.proficiencyLevel || '—'}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" gap={0.5}>
            <IconButton aria-label="Edit language" size="small" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Delete language" size="small" color="error" onClick={onDelete}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    />
  );
};

export default LanguagesPage;
