import { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Typography } from '@/components/ui/Typography';
import {
  Button,
  Card,
  DatePickerField,
  FormInput,
  FormSelect,
  FormTextarea,
  SectionHeader,
  UploadArea,
} from '@/components';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import { useAuth, useDocumentTitle } from '@/hooks';
import {
  countryOptions,
  timezoneOptions,
  useCreateProfileMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/features/profile';
import {
  editProfileSchema,
  type EditProfileFormValues,
} from '@/features/profile/schemas';
import type { UpdateProfileRequest } from '@/types';

export const EditProfilePage: React.FC = () => {
  useDocumentTitle('Edit Profile');
  const { user } = useAuth();
  const { profile, notFound } = useProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const createProfile = useCreateProfileMutation();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(profile?.profilePictureUrl);
  const [photoMeta, setPhotoMeta] = useState<{ name: string; size: number } | null>(
    profile?.profilePictureUrl ? { name: 'profile.jpg', size: 0 } : null,
  );

  // Sync the photo preview when the profile loads asynchronously.
  useEffect(() => {
    if (profile?.profilePictureUrl) {
      setPhotoUrl(profile.profilePictureUrl);
    }
  }, [profile?.profilePictureUrl]);

  const userId = user?.userId;

  const { control, handleSubmit, formState } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile?.firstName ?? '',
      lastName: profile?.lastName ?? '',
      headline: profile?.headline ?? '',
      bio: profile?.bio ?? '',
      phone: profile?.phone ?? '',
      dateOfBirth: profile?.dateOfBirth ?? '',
      country: profile?.country ?? '',
      city: profile?.city ?? '',
      address: profile?.address ?? '',
      timezone: profile?.timezone ?? '',
      website: profile?.website ?? '',
    },
  });

  const onSubmit = async (values: EditProfileFormValues) => {
    if (!userId) return;
    const payload: UpdateProfileRequest = {
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      headline: values.headline || undefined,
      bio: values.bio || undefined,
      phone: values.phone || undefined,
      dateOfBirth: values.dateOfBirth || undefined,
      country: values.country || undefined,
      city: values.city || undefined,
      address: values.address || undefined,
      timezone: values.timezone || undefined,
      website: values.website || undefined,
      profilePictureUrl: photoUrl || undefined,
      certifications: profile?.certifications,
    };

    if (notFound) {
      await createProfile.mutateAsync(payload);
      return;
    }
    await updateProfile.mutateAsync({ userId, payload });
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <SectionHeader
          icon={<PersonOutlineOutlinedIcon />}
          title="Personal Information"
          subtitle="Your name, headline and story — this is how mentors see you."
        />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="firstName" control={control} label="First name" placeholder="e.g. Alex" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="lastName" control={control} label="Last name" placeholder="e.g. Morgan" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormInput
              name="headline"
              control={control}
              label="Headline"
              placeholder="e.g. Senior Frontend Engineer · Design Systems"
              helperText="A short line shown next to your name."
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormTextarea
              name="bio"
              control={control}
              label="Bio"
              rows={4}
              placeholder="Tell mentors about your background, goals and interests…"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="phone" control={control} label="Phone" placeholder="+1 555 000 0000" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DatePickerField name="dateOfBirth" control={control} label="Date of birth" />
          </Grid>
        </Grid>
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <SectionHeader
          icon={<PhotoCameraOutlinedIcon />}
          iconColor="#7C3AED"
          title="Profile Photo"
          subtitle="A clear picture builds trust with mentors and the community."
        />
        <Box sx={{ maxWidth: 440 }}>
          <UploadArea
            variant="image"
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={5}
            value={photoUrl}
            fileName={photoMeta?.name}
            fileSize={photoMeta?.size}
            onChange={(url, meta) => {
              setPhotoUrl(url);
              setPhotoMeta({ name: meta.name, size: meta.size });
            }}
            onRemove={() => {
              setPhotoUrl(undefined);
              setPhotoMeta(null);
            }}
          />
        </Box>
      </Card>

      <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
        <SectionHeader
          icon={<PersonOutlineOutlinedIcon />}
          iconColor="#14B8A6"
          title="Location & Availability"
          subtitle="Helps mentors understand your timezone and where you're based."
        />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="country" control={control} label="Country" options={countryOptions} placeholder="Select country" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput name="city" control={control} label="City" placeholder="e.g. Austin" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormInput name="address" control={control} label="Address" placeholder="Street address (optional)" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="timezone" control={control} label="Timezone" options={timezoneOptions} placeholder="Select timezone" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              name="website"
              control={control}
              label="Portfolio / Website"
              placeholder="https://yourportfolio.dev"
            />
          </Grid>
        </Grid>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 'auto' }}>
          {formState.isDirty ? 'You have unsaved changes' : 'All changes are saved'}
        </Typography>
        <Button
          type="submit"
          size="large"
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          loading={updateProfile.isPending || createProfile.isPending}
        >
          {notFound ? 'Create Profile' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
};

export default EditProfilePage;
