import { Box, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, FormInput, SectionHeader } from '@/components';
import { Typography } from '@/components/ui/Typography';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import { useProfileQuery, useUpdateProfileMutation } from '@/features/profile';
import { socialLinksSchema, type SocialLinksFormValues } from '@/features/profile/schemas';
import type { UpdateProfileRequest } from '@/types';

export const SocialLinksPage: React.FC = () => {
  useDocumentTitle('Social Links');
  const { user } = useAuth();
  const { profile } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const userId = user?.userId;

  const { control, handleSubmit } = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      website: profile?.website ?? '',
      linkedinUrl: profile?.linkedinUrl ?? '',
      githubUrl: profile?.githubUrl ?? '',
      twitterUrl: profile?.twitterUrl ?? '',
    },
  });

  const onSubmit = async (values: SocialLinksFormValues) => {
    if (!userId) return;
    const payload: UpdateProfileRequest = {
      website: values.website || undefined,
      linkedinUrl: values.linkedinUrl || undefined,
      githubUrl: values.githubUrl || undefined,
      twitterUrl: values.twitterUrl || undefined,
    };
    await updateProfile.mutateAsync({ userId, payload });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
        <SectionHeader
          icon={<ShareOutlinedIcon />}
          iconColor="#EC4899"
          title="Social Links"
          subtitle="Connect your professional profiles — they appear on your public profile."
        />

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              name="linkedinUrl"
              control={control}
              label="LinkedIn"
              placeholder="https://linkedin.com/in/username"
              helperText="Let mentors explore your career history."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              name="githubUrl"
              control={control}
              label="GitHub"
              placeholder="https://github.com/username"
              helperText="Showcase your code and open-source work."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              name="twitterUrl"
              control={control}
              label="X / Twitter"
              placeholder="https://twitter.com/username"
              helperText="Share your thoughts and updates."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormInput
              name="website"
              control={control}
              label="Portfolio / Website"
              placeholder="https://yourportfolio.dev"
              helperText="Your personal site or blog."
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 2.5, display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
          {[
            { icon: <FaLinkedin fontSize={18} />, label: 'LinkedIn', color: '#0A66C2' },
            { icon: <FaGithub fontSize={18} />, label: 'GitHub', color: '#24292E' },
            { icon: <FaXTwitter fontSize={18} />, label: 'X / Twitter', color: '#000000' },
            { icon: <LanguageOutlinedIcon />, label: 'Website', color: '#6D5DF6' },
          ].map((social) => (
            <Box key={social.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  bgcolor: social.color,
                }}
              >
                {social.icon}
              </Box>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {social.label}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            type="submit"
            size="large"
            variant="contained"
            startIcon={<SaveOutlinedIcon />}
            loading={updateProfile.isPending}
          >
            Save Links
          </Button>
        </Box>
      </Card>
    </Box>
  );
};

export default SocialLinksPage;
