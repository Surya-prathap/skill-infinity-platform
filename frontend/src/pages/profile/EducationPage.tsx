import { Box, IconButton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import { formatDate } from '@/utils';
import {
  useAddEducationMutation,
  useDeleteEducationMutation,
  useProfileQuery,
  useUpdateEducationMutation,
} from '@/features/profile';
import { EducationForm, SectionPage } from '@/features/profile/components';
import type { EducationFormValues } from '@/features/profile/schemas';
import type { Education, EducationRequest } from '@/types';

const toRequest = (values: EducationFormValues): EducationRequest => ({
  institution: values.institution,
  degree: values.degree || undefined,
  fieldOfStudy: values.fieldOfStudy || undefined,
  startDate: values.startDate || undefined,
  endDate: values.endDate || undefined,
  currentlyStudying: values.currentlyStudying,
  description: values.description || undefined,
  grade: values.grade || undefined,
  sortOrder: 0,
});

const formDefaultValues = (item: Education | null): EducationFormValues => ({
  institution: item?.institution ?? '',
  degree: item?.degree ?? '',
  fieldOfStudy: item?.fieldOfStudy ?? '',
  startDate: item?.startDate ?? '',
  endDate: item?.endDate ?? '',
  currentlyStudying: item?.currentlyStudying ?? false,
  description: item?.description ?? '',
  grade: item?.grade ?? '',
});

export const EducationPage: React.FC = () => {
  useDocumentTitle('Education');
  const { user } = useAuth();
  const { educations } = useProfileQuery();
  const addEducation = useAddEducationMutation();
  const updateEducation = useUpdateEducationMutation();
  const deleteEducation = useDeleteEducationMutation();
  const userId = user?.userId ?? '';

  const handleSubmit = (values: EducationFormValues, item: Education | null) => {
    const payload = toRequest(values);
    return item?.id
      ? updateEducation.mutateAsync({ userId, itemId: item.id, payload })
      : addEducation.mutateAsync({ userId, payload });
  };

  return (
    <SectionPage<Education, EducationFormValues>
      icon={<SchoolOutlinedIcon />}
      color="#6D5DF6"
      title="Education"
      subtitle="Degrees, courses and certifications that shape your expertise."
      addLabel="Add Education"
      modalTitle="Education"
      emptyTitle="No education added yet"
      emptyDescription="Add your degrees and studies so mentors can understand your academic background."
      items={educations}
      FormComponent={EducationForm}
      formDefaultValues={formDefaultValues}
      handleSubmit={handleSubmit}
      handleDelete={(item) => deleteEducation.mutateAsync({ userId, itemId: item.id! })}
      deleteMessage={(item) => `This will remove ${item.institution} from your profile permanently.`}
      renderItem={(item, { onEdit, onDelete }) => (
        <Box
          key={item.id ?? item.institution}
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
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
              background: 'linear-gradient(135deg, #6D5DF6, #8E80FF)',
              flexShrink: 0,
            }}
          >
            <SchoolOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {item.institution}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {[item.degree, item.fieldOfStudy].filter(Boolean).join(' · ') || 'Student'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.startDate)} — {item.currentlyStudying ? 'Present' : formatDate(item.endDate)}
            </Typography>
          </Box>
          <Stack direction="row" gap={0.5}>
            <IconButton aria-label="Edit education" size="small" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Delete education" size="small" color="error" onClick={onDelete}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    />
  );
};

export default EducationPage;
