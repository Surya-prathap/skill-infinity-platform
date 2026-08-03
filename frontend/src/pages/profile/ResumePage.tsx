import { useEffect, useState } from 'react';
import { Box, Chip, IconButton, InputAdornment, TextField } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Button, Card, SectionHeader, UploadArea } from '@/components';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import { useProfileQuery, useUpdateProfileMutation } from '@/features/profile';
import type { UpdateProfileRequest } from '@/types';

export const ResumePage: React.FC = () => {
  useDocumentTitle('Resume');
  const { user } = useAuth();
  const { profile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const userId = user?.userId;

  const [resumeUrl, setResumeUrl] = useState<string | undefined>(profile?.resumeUrl);
  const [resumeMeta, setResumeMeta] = useState<{ name: string; size: number } | null>(
    profile?.resumeUrl ? { name: 'resume.pdf', size: 0 } : null,
  );
  const [certifications, setCertifications] = useState<string[]>(profile?.certifications ?? []);

  // Sync resume + certifications when the profile loads asynchronously.
  useEffect(() => {
    if (profile?.resumeUrl) setResumeUrl(profile.resumeUrl);
    if (profile?.certifications) setCertifications(profile.certifications);
  }, [profile?.resumeUrl, profile?.certifications]);
  const [draft, setDraft] = useState('');

  const addCertification = () => {
    const value = draft.trim();
    if (!value) return;
    if (certifications.includes(value)) return;
    setCertifications((current) => [...current, value]);
    setDraft('');
  };

  const removeCertification = (value: string) => {
    setCertifications((current) => current.filter((item) => item !== value));
  };

  const handleSave = async () => {
    if (!userId) return;
    const payload: UpdateProfileRequest = {
      resumeUrl: resumeUrl || undefined,
      certifications,
    };
    await updateProfile.mutateAsync({ userId, payload });
  };

  return (
    <Box>
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <SectionHeader
          icon={<DescriptionOutlinedIcon />}
          iconColor="#EF4444"
          title="Resume"
          subtitle="Upload your resume so mentors can review your full background."
        />
        <Box sx={{ maxWidth: 520 }}>
          <UploadArea
            variant="file"
            accept=".pdf,.doc,.docx"
            maxSizeMB={5}
            label="Upload your resume"
            hint="PDF or Word document · max 5 MB"
            value={resumeUrl}
            fileName={resumeMeta?.name}
            fileSize={resumeMeta?.size}
            onChange={(url, meta) => {
              setResumeUrl(url);
              setResumeMeta({ name: meta.name, size: meta.size });
            }}
            onRemove={() => {
              setResumeUrl(undefined);
              setResumeMeta(null);
            }}
          />
          {resumeUrl && (
            <Button
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              sx={{ mt: 1.5 }}
            >
              Preview document
            </Button>
          )}
        </Box>
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <SectionHeader
          icon={<WorkspacePremiumOutlinedIcon />}
          iconColor="#F59E0B"
          title="Certifications"
          subtitle="Certifications add credibility to your profile."
        />
        <TextField
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addCertification();
            }
          }}
          placeholder="e.g. AWS Certified Developer"
          size="small"
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="Add certification" onClick={addCertification} edge="end">
                    <AddIcon />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          helperText="Press Enter to add"
          sx={{ maxWidth: 520, mb: 2 }}
        />
        {certifications.length > 0 ? (
          <Stack direction="row" gap={1} flexWrap="wrap">
            {certifications.map((certification) => (
              <Chip
                key={certification}
                label={certification}
                color="warning"
                variant="outlined"
                onDelete={() => removeCertification(certification)}
                deleteIcon={<CloseIcon />}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No certifications yet — add your first one above.
          </Typography>
        )}
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          size="large"
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          loading={updateProfile.isPending}
          onClick={() => void handleSave()}
        >
          Save Resume
        </Button>
      </Box>
    </Box>
  );
};

export default ResumePage;
