import { Box, Chip, IconButton, LinearProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import {
  proficiencyToPercent,
  useAddSkillMutation,
  useDeleteSkillMutation,
  useProfileQuery,
  useUpdateSkillMutation,
} from '@/features/profile';
import { SectionPage, SkillForm } from '@/features/profile/components';
import type { SkillFormValues } from '@/features/profile/schemas';
import type { Skill, SkillRequest } from '@/types';

const toRequest = (values: SkillFormValues): SkillRequest => {
  const years = values.yearsOfExperience;
  return {
    name: values.name,
    proficiencyLevel: values.proficiencyLevel || undefined,
    yearsOfExperience:
      years === null || years === undefined || years === '' ? undefined : Number(years),
    sortOrder: 0,
  };
};

const formDefaultValues = (item: Skill | null): SkillFormValues => ({
  name: item?.name ?? '',
  proficiencyLevel: item?.proficiencyLevel ?? '',
  yearsOfExperience: item?.yearsOfExperience ?? null,
});

export const SkillsPage: React.FC = () => {
  useDocumentTitle('Skills');
  const { user } = useAuth();
  const { skills } = useProfileQuery();
  const addSkill = useAddSkillMutation();
  const updateSkill = useUpdateSkillMutation();
  const deleteSkill = useDeleteSkillMutation();
  const userId = user?.userId ?? '';

  const handleSubmit = (values: SkillFormValues, item: Skill | null) => {
    const payload = toRequest(values);
    return item?.id
      ? updateSkill.mutateAsync({ userId, itemId: item.id, payload })
      : addSkill.mutateAsync({ userId, payload });
  };

  return (
    <SectionPage<Skill, SkillFormValues>
      icon={<BoltOutlinedIcon />}
      color="#F59E0B"
      title="Skills"
      subtitle="The skills you bring — with proficiency and years of experience."
      addLabel="Add Skill"
      modalTitle="Skill"
      emptyTitle="No skills added yet"
      emptyDescription="List the skills you want mentors to see, from languages to frameworks to soft skills."
      items={skills}
      FormComponent={SkillForm}
      formDefaultValues={formDefaultValues}
      handleSubmit={handleSubmit}
      handleDelete={(item) => deleteSkill.mutateAsync({ userId, itemId: item.id! })}
      deleteMessage={(item) => `This will remove the skill "${item.name}" from your profile.`}
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
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              flexShrink: 0,
            }}
          >
            <BoltOutlinedIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="subtitle1" fontWeight={700}>
                {item.name}
              </Typography>
              {item.proficiencyLevel && (
                <Chip size="small" label={item.proficiencyLevel} variant="outlined" sx={{ height: 20 }} />
              )}
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.75 }}>
              <Box sx={{ flexGrow: 1, maxWidth: 220 }}>
                <LinearProgress
                  variant="determinate"
                  value={proficiencyToPercent(item.proficiencyLevel)}
                  sx={{ height: 6 }}
                  color="warning"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                {item.yearsOfExperience != null ? `${item.yearsOfExperience} yrs` : '—'}
              </Typography>
            </Box>
          </Box>
          <Stack direction="row" gap={0.5}>
            <IconButton aria-label="Edit skill" size="small" onClick={onEdit}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
            <IconButton aria-label="Delete skill" size="small" color="error" onClick={onDelete}>
              <DeleteOutlineOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}
    />
  );
};

export default SkillsPage;
