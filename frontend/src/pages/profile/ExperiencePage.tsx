import { Box, Chip, IconButton } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import { formatDate } from '@/utils';
import {
  useAddExperienceMutation,
  useDeleteExperienceMutation,
  useProfileQuery,
  useUpdateExperienceMutation,
} from '@/features/profile';
import { ExperienceForm, SectionPage } from '@/features/profile/components';
import type { ExperienceFormValues } from '@/features/profile/schemas';
import type { Experience, ExperienceRequest } from '@/types';

const toRequest = (values: ExperienceFormValues): ExperienceRequest => ({
  company: values.company,
  title: values.title,
  location: values.location || undefined,
  employmentType: values.employmentType || undefined,
  startDate: values.startDate || undefined,
  endDate: values.endDate || undefined,
  currentlyWorking: values.currentlyWorking,
  description: values.description || undefined,
  sortOrder: 0,
});

const formDefaultValues = (item: Experience | null): ExperienceFormValues => ({
  company: item?.company ?? '',
  title: item?.title ?? '',
  location: item?.location ?? '',
  employmentType: item?.employmentType ?? '',
  startDate: item?.startDate ?? '',
  endDate: item?.endDate ?? '',
  currentlyWorking: item?.currentlyWorking ?? false,
  description: item?.description ?? '',
});

export const ExperiencePage: React.FC = () => {
  useDocumentTitle('Experience');
  const { user } = useAuth();
  const { experiences } = useProfileQuery();
  const addExperience = useAddExperienceMutation();
  const updateExperience = useUpdateExperienceMutation();
  const deleteExperience = useDeleteExperienceMutation();
  const userId = user?.userId ?? '';

  const handleSubmit = (values: ExperienceFormValues, item: Experience | null) => {
    const payload = toRequest(values);
    return item?.id
      ? updateExperience.mutateAsync({ userId, itemId: item.id, payload })
      : addExperience.mutateAsync({ userId, payload });
  };

  return (
    <SectionPage<Experience, ExperienceFormValues>
      icon={<WorkOutlineOutlinedIcon />}
      color="#14B8A6"
      title="Experience"
      subtitle="Your professional journey — companies, roles and what you achieved."
      addLabel="Add Experience"
      modalTitle="Experience"
      emptyTitle="No experience added yet"
      emptyDescription="Share where you've worked so mentors can relate to your career path."
      items={experiences}
      FormComponent={ExperienceForm}
      formDefaultValues={formDefaultValues}
      handleSubmit={handleSubmit}
      handleDelete={(item) => deleteExperience.mutateAsync({ userId, itemId: item.id! })}
      deleteMessage={(item) => `This will remove ${item.title} at ${item.company} from your profile permanently.`}
      renderItem={(item, { onEdit, onDelete }) => (
        <Box
          key={item.id ?? `${item.company}-${item.title}`}
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
              background: 'linear-gradient(135deg, #14B8A6, #5EEAD4)',
              flexShrink: 0,
            }}
          >
            <WorkOutlineOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle1" fontWeight={700}>
                {item.title}
              </Typography>
              {item.currentlyWorking && (
                <Chip size="small" label="Current" color="success" sx={{ height: 20 }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {[item.company, item.location, item.employmentType].filter(Boolean).join(' · ')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(item.startDate)} — {item.currentlyWorking ? 'Present' : formatDate(item.endDate)}
            </Typography>
          </Box>
          <Stack direction="row" gap={0.5}>
            <IconButton aria-label="Edit experience" size="small" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Delete experience" size="small" color="error" onClick={onDelete}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    />
  );
};

export default ExperiencePage;
