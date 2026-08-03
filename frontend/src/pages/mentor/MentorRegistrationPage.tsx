import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button as MuiButton, Chip, Grid, LinearProgress } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import StarIcon from '@mui/icons-material/Star';
import dayjs from 'dayjs';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { FormInput, FormSelect, FormTextarea } from '@/components';
import { UploadArea } from '@/components/ui/UploadArea';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AvailabilityCalendar, GradientCard, MentorCard, WizardStepper } from '@/components/mentor';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markSubmitted, resetWizard, setStep, updateDraft } from '@/store/slices/mentorSlice';
import { selectMentorDraft, selectMentorStep } from '@/store/selectors';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatCurrency, formatDate, showError } from '@/utils';
import {
  DAYS_OF_WEEK,
  SESSION_TYPES,
  TIMEZONES,
  WIZARD_STEPS,
  type WizardStepId,
} from '@/features/mentor/constants';
import {
  personalSchema,
  toOptionalNumber,
  type PersonalFormValues,
} from '@/features/mentor/schemas';
import { useBecomeMentorMutation, useCategoriesQuery } from '@/features/mentor/hooks';
import {
  availabilityToDraft,
  persistDraft,
  type ExpertiseDraft,
  type MentorDraft,
} from '@/features/mentor/storage';
import {
  AvailabilityEditor,
  CertificationEditor,
  CollectionEditor,
  ExperienceEditor,
  ExpertiseEditor,
  PricingEditor,
  SkillEditor,
} from '@/features/mentor/components';
import type {
  Mentor,
  MentorAvailability,
  MentorCertification,
  MentorExpertise,
  MentorPricing,
} from '@/types';

const tempId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const SESSION_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  SESSION_TYPES.map((option) => [String(option.value), option.label]),
);

const STEP_REQUIRED: Record<WizardStepId, boolean> = {
  personal: true,
  experience: true,
  skills: true,
  expertise: true,
  categories: true,
  pricing: true,
  availability: true,
  certificates: false,
  verification: true,
  preview: true,
};

const slideTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
  transition: { duration: 0.3, ease: 'easeOut' as const },
};

export const MentorRegistrationPage: React.FC = () => {
  useDocumentTitle('Become a Mentor');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const step = useAppSelector(selectMentorStep);
  const draft = useAppSelector(selectMentorDraft);
  const { categories } = useCategoriesQuery();
  const becomeMentor = useBecomeMentorMutation();

  const [lastSaved, setLastSaved] = useState<string | null>(draft.savedAt);
  const [verificationFile, setVerificationFile] = useState<{
    url: string;
    name: string;
    size: number;
  } | null>(null);
  const [availabilityEditor, setAvailabilityEditor] = useState<{
    open: boolean;
    editing: boolean;
    item: MentorDraft['availability'][number] | null;
  }>({ open: false, editing: false, item: null });

  /* ---------------- Auto-save ---------------- */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      persistDraft(draft);
      setLastSaved(new Date().toISOString());
    }, 600);
    return () => window.clearTimeout(timer);
  }, [draft]);

  /* ---------------- Personal form ---------------- */
  const personalForm = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      headline: draft.personal.headline,
      bio: draft.personal.bio,
      aboutMe: draft.personal.aboutMe,
      country: draft.personal.country,
      city: draft.personal.city,
      timezone: draft.personal.timezone,
      yearsOfExperience: draft.personal.yearsOfExperience ?? null,
    },
    mode: 'onChange',
  });

  /* ---------------- Step completion ---------------- */
  const completedSteps = useMemo(() => {
    const complete: number[] = [];
    if (draft.personal.headline.trim()) complete.push(0);
    if (draft.experiences.length > 0) complete.push(1);
    if (draft.skills.length > 0) complete.push(2);
    if (draft.expertise.length > 0) complete.push(3);
    if (draft.categories.length > 0) complete.push(4);
    if (draft.pricing.length > 0) complete.push(5);
    if (draft.availability.length > 0) complete.push(6);
    if (draft.certifications.length > 0) complete.push(7);
    if (draft.verification.agreedToTerms) complete.push(8);
    return complete;
  }, [draft]);

  const progress = Math.round((completedSteps.length / WIZARD_STEPS.length) * 100);
  const stepConfig = WIZARD_STEPS[step];

  /* ---------------- Draft mutations ---------------- */
  const setDraft = (patch: Partial<MentorDraft>) => dispatch(updateDraft(patch));

  const addExperience = (values: Omit<MentorDraft['experiences'][number], 'id'>) =>
    setDraft({ experiences: [...draft.experiences, { id: tempId('exp'), ...values }] });
  const updateExperience = (id: string, values: Omit<MentorDraft['experiences'][number], 'id'>) =>
    setDraft({
      experiences: draft.experiences.map((item) =>
        item.id === id ? { ...item, ...values } : item,
      ),
    });
  const removeExperience = (id: string) =>
    setDraft({ experiences: draft.experiences.filter((item) => item.id !== id) });

  const addSkill = (values: Omit<MentorDraft['skills'][number], 'id'>) =>
    setDraft({ skills: [...draft.skills, { id: tempId('skill'), ...values }] });
  const updateSkill = (id: string, values: Omit<MentorDraft['skills'][number], 'id'>) =>
    setDraft({
      skills: draft.skills.map((item) => (item.id === id ? { ...item, ...values } : item)),
    });
  const removeSkill = (id: string) =>
    setDraft({ skills: draft.skills.filter((item) => item.id !== id) });

  const addExpertise = (values: Omit<ExpertiseDraft, 'id'>) =>
    setDraft({ expertise: [...draft.expertise, { id: tempId('exp'), ...values }] });
  const updateExpertise = (id: string, values: Omit<ExpertiseDraft, 'id'>) =>
    setDraft({
      expertise: draft.expertise.map((item) => (item.id === id ? { ...item, ...values } : item)),
    });
  const removeExpertise = (id: string) =>
    setDraft({ expertise: draft.expertise.filter((item) => item.id !== id) });

  const addPricing = (values: Omit<MentorDraft['pricing'][number], 'id'>) =>
    setDraft({ pricing: [...draft.pricing, { id: tempId('price'), ...values }] });
  const updatePricing = (id: string, values: Omit<MentorDraft['pricing'][number], 'id'>) =>
    setDraft({
      pricing: draft.pricing.map((item) => (item.id === id ? { ...item, ...values } : item)),
    });
  const removePricing = (id: string) =>
    setDraft({ pricing: draft.pricing.filter((item) => item.id !== id) });

  const addAvailability = (values: Omit<MentorDraft['availability'][number], 'id'>) =>
    setDraft({ availability: [...draft.availability, { id: tempId('avail'), ...values }] });
  const updateAvailability = (
    id: string,
    values: Omit<MentorDraft['availability'][number], 'id'>,
  ) =>
    setDraft({
      availability: draft.availability.map((item) =>
        item.id === id ? { ...item, ...values } : item,
      ),
    });
  const removeAvailability = (id: string) =>
    setDraft({ availability: draft.availability.filter((item) => item.id !== id) });

  const addCertification = (values: Omit<MentorDraft['certifications'][number], 'id'>) =>
    setDraft({ certifications: [...draft.certifications, { id: tempId('cert'), ...values }] });
  const updateCertification = (
    id: string,
    values: Omit<MentorDraft['certifications'][number], 'id'>,
  ) =>
    setDraft({
      certifications: draft.certifications.map((item) =>
        item.id === id ? { ...item, ...values } : item,
      ),
    });
  const removeCertification = (id: string) =>
    setDraft({ certifications: draft.certifications.filter((item) => item.id !== id) });

  const toggleCategory = (categoryId: string) => {
    const next = draft.categories.includes(categoryId)
      ? draft.categories.filter((id) => id !== categoryId)
      : [...draft.categories, categoryId];
    setDraft({ categories: next });
  };

  /* ---------------- Navigation ---------------- */
  const goTo = (index: number) =>
    dispatch(setStep(Math.min(Math.max(index, 0), WIZARD_STEPS.length - 1)));
  const handleBack = () => goTo(step - 1);
  const handleStepClick = (index: number) => {
    if (index <= step) goTo(index);
  };

  const handleContinue = () => {
    if (STEP_REQUIRED[stepConfig.id] && completedSteps.includes(step)) {
      goTo(step + 1);
      return;
    }
    if (!STEP_REQUIRED[stepConfig.id]) {
      goTo(step + 1);
      return;
    }
    showError('Please complete this step before continuing.');
  };

  const handleVerificationContinue = () => {
    if (!draft.verification.agreedToTerms) {
      showError('Please agree to the verification terms to continue.');
      return;
    }
    goTo(step + 1);
  };

  const handleSubmit = async () => {
    try {
      const expertiseEntries =
        draft.expertise.length > 0
          ? draft.expertise
          : draft.categories.map((categoryId) => ({
              id: tempId('exp'),
              categoryId,
              categoryName: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
              subCategoryId: '',
              subCategoryName: '',
              skillName: categories.find((c) => c.id === categoryId)?.name ?? categoryId,
              yearsOfExperience: null,
              teachingLevel: 'ALL_LEVELS',
              proficiencyLevel: 'ADVANCED',
              technologies: '',
              description: '',
            }));
      await becomeMentor.mutateAsync({ ...draft, expertise: expertiseEntries });
      dispatch(markSubmitted());
      dispatch(resetWizard());
      navigate(ROUTES.MENTOR_DASHBOARD);
    } catch {
      // Toast handled by the mutation.
    }
  };

  /* ---------------- Preview mentor ---------------- */
  const previewMentor: Mentor = {
    id: 'preview',
    userId: user?.userId ?? 'preview',
    verified: draft.verification.agreedToTerms,
    profile: {
      headline: draft.personal.headline || 'Your headline',
      bio: draft.personal.bio || undefined,
      aboutMe: draft.personal.aboutMe || undefined,
      country: draft.personal.country || undefined,
      city: draft.personal.city || undefined,
      timezone: draft.personal.timezone || undefined,
      yearsOfExperience: draft.personal.yearsOfExperience ?? undefined,
    },
    expertiseList: draft.expertise.map<MentorExpertise>((entry) => ({
      id: entry.id,
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      skillName: entry.skillName,
      teachingLevel: entry.teachingLevel,
      proficiencyLevel: entry.proficiencyLevel,
      technologies: entry.technologies || undefined,
    })),
    availabilities: draft.availability.map<MentorAvailability>((slot) => ({
      id: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDurationMinutes: slot.slotDurationMinutes,
      recurring: slot.recurring,
      timezone: slot.timezone || undefined,
      active: true,
    })),
    pricingList: draft.pricing.map<MentorPricing>((plan) => ({
      id: plan.id,
      sessionType: plan.sessionType,
      price: plan.price,
      originalPrice: plan.originalPrice ?? undefined,
      currency: plan.currency,
      discountPercentage: plan.discountPercentage ?? undefined,
      durationMinutes: plan.durationMinutes,
      isFree: plan.isFree,
      description: plan.description || undefined,
      active: true,
    })),
    certifications: draft.certifications.map<MentorCertification>((cert) => ({
      id: cert.id,
      title: cert.title,
      issuingOrganization: cert.issuingOrganization,
      issueDate: cert.issueDate || undefined,
      doesNotExpire: cert.doesNotExpire,
      description: cert.description || undefined,
      verificationStatus: 'PENDING',
    })),
  };

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="hero" sx={{ mb: 3, p: { xs: 3, md: 3.5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <WorkspacePremiumOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Become a Mentor
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Step {step + 1} of {WIZARD_STEPS.length} · {stepConfig.label}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: { md: 300 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Application progress
                </Typography>
                <Typography variant="caption" fontWeight={800}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.25)',
                  '& .MuiLinearProgress-bar': { borderRadius: 999, backgroundColor: '#5EEAD4' },
                }}
              />
            </Box>
            <Chip
              size="small"
              icon={<SaveOutlinedIcon sx={{ fontSize: 14 }} />}
              label={lastSaved ? `Saved ${dayjs(lastSaved).format('h:mm A')}` : 'Saving…'}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Stack>
      </GradientCard>

      {/* ================= Stepper ================= */}
      <Card sx={{ mb: 3, p: { xs: 1.5, md: 2 }, overflowX: 'auto' }}>
        <WizardStepper
          steps={WIZARD_STEPS}
          activeStep={step}
          completedThrough={Math.max(step - 1, -1)}
          onStepClick={handleStepClick}
        />
      </Card>

      {/* ================= Step content ================= */}
      <Card sx={{ p: { xs: 2.5, md: 4 } }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} {...slideTransition}>
            {/* ---------- 0 · Personal ---------- */}
            {step === 0 && (
              <Box
                component="form"
                onSubmit={personalForm.handleSubmit((values) => {
                  setDraft({
                    personal: {
                      headline: values.headline,
                      bio: values.bio ?? '',
                      aboutMe: values.aboutMe ?? '',
                      country: values.country ?? '',
                      city: values.city ?? '',
                      timezone: values.timezone ?? '',
                      yearsOfExperience: toOptionalNumber(values.yearsOfExperience),
                    },
                  });
                  goTo(step + 1);
                })}
                noValidate
              >
                <Stack spacing={2.5}>
                  <FormInput
                    name="headline"
                    control={personalForm.control}
                    label="Professional headline"
                    required
                    placeholder="e.g. Senior Staff Engineer · System Design & Cloud"
                    helperText="This is the first thing learners see on your profile."
                  />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="country"
                        control={personalForm.control}
                        label="Country"
                        placeholder="e.g. United States"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="city"
                        control={personalForm.control}
                        label="City"
                        placeholder="e.g. San Francisco"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormInput
                        name="yearsOfExperience"
                        control={personalForm.control}
                        label="Years of experience"
                        type="number"
                      />
                    </Grid>
                  </Grid>
                  <FormSelect
                    name="timezone"
                    control={personalForm.control}
                    label="Timezone"
                    options={TIMEZONES}
                    placeholder="Select your timezone"
                  />
                  <FormTextarea
                    name="bio"
                    control={personalForm.control}
                    label="Short bio"
                    rows={3}
                    placeholder="A one-paragraph summary of who you are and what you teach."
                  />
                  <FormTextarea
                    name="aboutMe"
                    control={personalForm.control}
                    label="About me"
                    rows={5}
                    placeholder="Tell learners about your background, teaching style and philosophy."
                  />
                </Stack>
                <StepNav
                  showBack={false}
                  backLabel="Back"
                  onBack={handleBack}
                  continueLabel="Save & Continue"
                  onContinue={undefined}
                  continueType="submit"
                />
              </Box>
            )}

            {/* ---------- 1 · Experience ---------- */}
            {step === 1 && (
              <CollectionEditor<MentorDraft['experiences'][number]>
                items={draft.experiences}
                addLabel="Add experience"
                emptyTitle="No experience yet"
                emptyDescription="Add the roles that built your expertise — learners love concrete career context."
                emptyIcon={<WorkOutlineOutlinedIcon />}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
                renderItem={(item) => (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {item.title} · {item.company}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.currentlyWorking ? 'Current role' : formatDate(item.endDate)} ·{' '}
                      {item.location || 'No location'}
                    </Typography>
                  </Box>
                )}
                renderEditor={({ initial, onCancel, onSubmit }) => (
                  <ExperienceEditor initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
                )}
              />
            )}

            {/* ---------- 2 · Skills ---------- */}
            {step === 2 && (
              <CollectionEditor<MentorDraft['skills'][number]>
                items={draft.skills}
                addLabel="Add skill"
                emptyTitle="No skills added"
                emptyDescription="List the skills you can teach — the more specific, the better your matches."
                emptyIcon={<BoltOutlinedIcon />}
                onAdd={addSkill}
                onUpdate={updateSkill}
                onRemove={removeSkill}
                renderItem={(item) => (
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {item.name}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={item.proficiencyLevel}
                      sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}
                    />
                    {item.yearsOfExperience != null && (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.yearsOfExperience} yrs
                      </Typography>
                    )}
                  </Stack>
                )}
                renderEditor={({ initial, onCancel, onSubmit }) => (
                  <SkillEditor initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
                )}
              />
            )}

            {/* ---------- 3 · Expertise ---------- */}
            {step === 3 && (
              <CollectionEditor<ExpertiseDraft>
                items={draft.expertise}
                addLabel="Add expertise"
                emptyTitle="No expertise entries"
                emptyDescription="Define what you teach in detail — categories, levels and the tools you cover."
                emptyIcon={<LightbulbOutlinedIcon />}
                onAdd={addExpertise}
                onUpdate={updateExpertise}
                onRemove={removeExpertise}
                renderItem={(item) => (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {item.skillName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.categoryName}
                      {item.subCategoryName ? ` · ${item.subCategoryName}` : ''} ·{' '}
                      {item.teachingLevel === 'ALL_LEVELS'
                        ? 'All levels'
                        : item.teachingLevel.toLowerCase()}
                    </Typography>
                  </Box>
                )}
                renderEditor={({ initial, onCancel, onSubmit }) => (
                  <ExpertiseEditor
                    categories={categories}
                    initial={initial}
                    onCancel={onCancel}
                    onSubmit={onSubmit}
                  />
                )}
              />
            )}

            {/* ---------- 4 · Categories ---------- */}
            {step === 4 && (
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Select the domains you teach. Choosing a category adds it to your profile;
                  specific skills are captured in the expertise step.
                </Typography>
                <Grid container spacing={2}>
                  {categories.map((category) => {
                    const selected = draft.categories.includes(category.id);
                    return (
                      <Grid key={category.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Box
                          role="checkbox"
                          aria-checked={selected}
                          tabIndex={0}
                          onClick={() => toggleCategory(category.id)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              toggleCategory(category.id);
                            }
                          }}
                          sx={{
                            height: '100%',
                            p: 2.5,
                            borderRadius: 3,
                            border: 1.5,
                            borderColor: selected ? 'primary.main' : 'divider',
                            bgcolor: selected ? 'action.selected' : 'background.paper',
                            cursor: 'pointer',
                            transition:
                              'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 },
                            '&:focus-visible': {
                              outline: '3px solid rgba(109,93,246,0.3)',
                              outlineOffset: 2,
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            gap={1}
                          >
                            <Typography variant="subtitle1" fontWeight={800}>
                              {category.name}
                            </Typography>
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                border: 1.5,
                                borderColor: selected ? 'primary.main' : 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                bgcolor: selected ? 'primary.main' : 'transparent',
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                              }}
                            >
                              {selected && '✓'}
                            </Box>
                          </Stack>
                          {category.description && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', mt: 0.75, lineHeight: 1.5 }}
                            >
                              {category.description}
                            </Typography>
                          )}
                          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1.5 }}>
                            {category.subCategories.slice(0, 3).map((sub) => (
                              <Chip
                                key={sub.id}
                                size="small"
                                label={sub.name}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                              />
                            ))}
                          </Stack>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            )}

            {/* ---------- 5 · Pricing ---------- */}
            {step === 5 && (
              <CollectionEditor<MentorDraft['pricing'][number]>
                items={draft.pricing}
                addLabel="Add pricing plan"
                emptyTitle="No pricing plans"
                emptyDescription="Define how much each session type costs — you can add discounts and free sessions."
                emptyIcon={<PriceChangeOutlinedIcon />}
                onAdd={addPricing}
                onUpdate={updatePricing}
                onRemove={removePricing}
                renderItem={(item) => (
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {SESSION_TYPE_LABEL[item.sessionType] ?? item.sessionType}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.durationMinutes} min · {item.currency}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={800} sx={{ color: 'primary.main' }}>
                      {item.isFree ? 'Free' : formatCurrency(item.price, item.currency)}
                    </Typography>
                  </Stack>
                )}
                renderEditor={({ initial, onCancel, onSubmit }) => (
                  <PricingEditor initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
                )}
              />
            )}

            {/* ---------- 6 · Availability ---------- */}
            {step === 6 &&
              (availabilityEditor.open ? (
                <AvailabilityEditor
                  initial={availabilityEditor.item}
                  onCancel={() =>
                    setAvailabilityEditor({ open: false, editing: false, item: null })
                  }
                  onSubmit={(values) => {
                    if (availabilityEditor.editing && availabilityEditor.item) {
                      updateAvailability(availabilityEditor.item.id, values);
                    } else {
                      addAvailability(values);
                    }
                    setAvailabilityEditor({ open: false, editing: false, item: null });
                  }}
                />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Add your weekly availability. Tap a slot to edit it, use the × to remove it, or
                    press “Add slot”.
                  </Typography>
                  <AvailabilityCalendar
                    slots={draft.availability}
                    onToggleSlot={(slot) =>
                      setAvailabilityEditor({
                        open: true,
                        editing: true,
                        item: availabilityToDraft(slot),
                      })
                    }
                    onRemoveSlot={(slot) => {
                      if (slot.id) removeAvailability(slot.id);
                    }}
                    onAddSlot={(dayOfWeek) =>
                      setAvailabilityEditor({
                        open: true,
                        editing: false,
                        item: {
                          id: '',
                          dayOfWeek,
                          startTime: '09:00',
                          endTime: '17:00',
                          breakStartTime: '',
                          breakEndTime: '',
                          slotDurationMinutes: 60,
                          recurring: true,
                          timezone: draft.personal.timezone,
                        },
                      })
                    }
                  />
                  <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2.5 }}>
                    <MuiButton
                      variant="outlined"
                      startIcon={<CalendarMonthOutlinedIcon />}
                      onClick={() =>
                        setAvailabilityEditor({ open: true, editing: false, item: null })
                      }
                    >
                      Add slot
                    </MuiButton>
                  </Stack>
                </Box>
              ))}

            {/* ---------- 7 · Certificates ---------- */}
            {step === 7 && (
              <CollectionEditor<MentorDraft['certifications'][number]>
                items={draft.certifications}
                addLabel="Add certification"
                emptyTitle="No certifications yet"
                emptyDescription="Certifications are optional but they significantly boost learner trust. Add them now or later from your studio."
                emptyIcon={<WorkspacePremiumOutlinedIcon />}
                onAdd={addCertification}
                onUpdate={updateCertification}
                onRemove={removeCertification}
                renderItem={(item) => (
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.issuingOrganization}
                        {item.issueDate ? ` · ${formatDate(item.issueDate)}` : ''}
                      </Typography>
                    </Box>
                    <StatusBadge
                      label={item.doesNotExpire ? 'No expiry' : 'Expires'}
                      color={item.doesNotExpire ? 'success' : 'warning'}
                      withDot={false}
                    />
                  </Stack>
                )}
                renderEditor={({ initial, onCancel, onSubmit }) => (
                  <CertificationEditor initial={initial} onCancel={onCancel} onSubmit={onSubmit} />
                )}
              />
            )}

            {/* ---------- 8 · Verification ---------- */}
            {step === 8 && (
              <Stack spacing={3}>
                <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                  Your identity is verified once — it unlocks the verified badge on your public
                  profile. Documents are encrypted and never shared.
                </Alert>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Document type
                  </Typography>
                  <VerificationDocumentPicker
                    documentType={draft.verification.documentType}
                    onChange={(documentType) =>
                      setDraft({ verification: { ...draft.verification, documentType } })
                    }
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Upload a government-issued ID
                  </Typography>
                  <UploadArea
                    variant="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    maxSizeMB={10}
                    label="Upload your ID document"
                    hint="PDF or image · max 10 MB"
                    value={verificationFile?.url}
                    fileName={verificationFile?.name}
                    fileSize={verificationFile?.size}
                    onChange={(url, meta) =>
                      setVerificationFile({ url, name: meta.name, size: meta.size })
                    }
                    onRemove={() => setVerificationFile(null)}
                  />
                </Box>
                <Box
                  role="checkbox"
                  aria-checked={draft.verification.agreedToTerms}
                  tabIndex={0}
                  onClick={() =>
                    setDraft({
                      verification: {
                        ...draft.verification,
                        agreedToTerms: !draft.verification.agreedToTerms,
                      },
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setDraft({
                        verification: {
                          ...draft.verification,
                          agreedToTerms: !draft.verification.agreedToTerms,
                        },
                      });
                    }
                  }}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: 1.5,
                    borderColor: draft.verification.agreedToTerms ? 'success.main' : 'divider',
                    bgcolor: draft.verification.agreedToTerms ? 'success.light' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:focus-visible': {
                      outline: '3px solid rgba(16,185,129,0.3)',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: 1,
                        border: 1.5,
                        borderColor: draft.verification.agreedToTerms ? 'success.main' : 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        bgcolor: draft.verification.agreedToTerms ? 'success.main' : 'transparent',
                        flexShrink: 0,
                      }}
                    >
                      {draft.verification.agreedToTerms && '✓'}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>
                      I confirm the information provided is accurate and agree to Skill Infinity's
                      mentor verification terms.
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* ---------- 9 · Preview ---------- */}
            {step === 9 && (
              <Stack spacing={3}>
                <Alert severity="success" sx={{ borderRadius: 2.5 }}>
                  You're all set! Review your mentor profile below, then submit your application.
                </Alert>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <MentorCard
                      mentor={previewMentor}
                      name={
                        `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username
                      }
                      featured
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <Stack spacing={2}>
                      <PreviewSection
                        title="Experience"
                        count={draft.experiences.length}
                        icon={<WorkOutlineOutlinedIcon />}
                        color="#3B82F6"
                      >
                        {draft.experiences.map((item) => (
                          <PreviewRow
                            key={item.id}
                            title={item.title}
                            subtitle={`${item.company}${item.location ? ` · ${item.location}` : ''}`}
                          />
                        ))}
                      </PreviewSection>
                      <PreviewSection
                        title="Skills & Expertise"
                        count={draft.skills.length}
                        icon={<BoltOutlinedIcon />}
                        color="#F59E0B"
                      >
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {draft.skills.map((skill) => (
                            <Chip
                              key={skill.id}
                              size="small"
                              label={skill.name}
                              sx={{
                                bgcolor: 'action.selected',
                                color: 'primary.main',
                                fontWeight: 600,
                              }}
                            />
                          ))}
                        </Stack>
                      </PreviewSection>
                      <PreviewSection
                        title="Availability"
                        count={draft.availability.length}
                        icon={<CalendarMonthOutlinedIcon />}
                        color="#EC4899"
                      >
                        <Stack direction="row" flexWrap="wrap" gap={0.75}>
                          {draft.availability.map((slot) => (
                            <Chip
                              key={slot.id}
                              size="small"
                              variant="outlined"
                              label={`${DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label ?? slot.dayOfWeek} · ${slot.startTime}–${slot.endTime}`}
                              sx={{ fontWeight: 600 }}
                            />
                          ))}
                        </Stack>
                      </PreviewSection>
                      <PreviewSection
                        title="Pricing"
                        count={draft.pricing.length}
                        icon={<PriceChangeOutlinedIcon />}
                        color="#14B8A6"
                      >
                        {draft.pricing.map((plan) => (
                          <PreviewRow
                            key={plan.id}
                            title={SESSION_TYPE_LABEL[plan.sessionType] ?? plan.sessionType}
                            subtitle={`${plan.durationMinutes} min · ${plan.isFree ? 'Free' : formatCurrency(plan.price, plan.currency)}${plan.discountPercentage ? ` · ${plan.discountPercentage}% off` : ''}`}
                          />
                        ))}
                      </PreviewSection>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ================= Footer nav ================= */}
        {step !== 0 && step !== 9 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mt: 3.5,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <MuiButton
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={handleBack}
              disabled={becomeMentor.isPending}
            >
              Back
            </MuiButton>
            {step === 8 ? (
              <MuiButton
                variant="contained"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={handleVerificationContinue}
              >
                Review Application
              </MuiButton>
            ) : (
              <MuiButton
                variant="contained"
                endIcon={<ArrowForwardOutlinedIcon />}
                onClick={handleContinue}
                disabled={becomeMentor.isPending}
              >
                Continue
              </MuiButton>
            )}
          </Box>
        )}

        {step === 9 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mt: 3.5,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <MuiButton
              startIcon={<ArrowBackOutlinedIcon />}
              onClick={handleBack}
              disabled={becomeMentor.isPending}
            >
              Back
            </MuiButton>
            <MuiButton
              variant="contained"
              size="large"
              loading={becomeMentor.isPending}
              startIcon={<WorkspacePremiumOutlinedIcon />}
              onClick={() => void handleSubmit()}
              sx={{ px: 4 }}
            >
              Submit Application
            </MuiButton>
          </Box>
        )}
      </Card>

      {/* Requirements hint */}
      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 2.5, px: 0.5 }}>
        {WIZARD_STEPS.slice(0, 9).map((s, index) => {
          const done = completedSteps.includes(index);
          return (
            <Stack key={s.id} direction="row" alignItems="center" gap={0.5}>
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: done
                    ? 'success.main'
                    : index === step
                      ? 'primary.main'
                      : 'text.disabled',
                  boxShadow: done ? '0 0 0 3px rgba(16,185,129,0.15)' : 'none',
                }}
              />
              <Typography
                variant="caption"
                fontWeight={600}
                color={done ? 'success.main' : 'text.secondary'}
              >
                {s.label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
};

/* ============================================================
   Local building blocks
   ============================================================ */

interface StepNavProps {
  showBack: boolean;
  backLabel: string;
  onBack: () => void;
  continueLabel: string;
  onContinue?: () => void;
  continueType?: 'button' | 'submit';
  loading?: boolean;
}

const StepNav: React.FC<StepNavProps> = ({
  showBack,
  backLabel,
  onBack,
  continueLabel,
  onContinue,
  continueType = 'button',
  loading = false,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: showBack ? 'space-between' : 'flex-end',
      gap: 2,
      mt: 3.5,
      pt: 3,
      borderTop: 1,
      borderColor: 'divider',
    }}
  >
    {showBack && (
      <MuiButton startIcon={<ArrowBackOutlinedIcon />} onClick={onBack} disabled={loading}>
        {backLabel}
      </MuiButton>
    )}
    <MuiButton
      type={continueType}
      variant="contained"
      endIcon={continueType === 'submit' ? undefined : <ArrowForwardOutlinedIcon />}
      onClick={continueType === 'button' ? onContinue : undefined}
      loading={loading}
    >
      {continueLabel}
    </MuiButton>
  </Box>
);

interface VerificationDocumentPickerProps {
  documentType: string;
  onChange: (documentType: string) => void;
}

const VerificationDocumentPicker: React.FC<VerificationDocumentPickerProps> = ({
  documentType,
  onChange,
}) => {
  const options = [
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'NATIONAL_ID', label: 'National ID' },
    { value: 'DRIVERS_LICENSE', label: 'Driver’s License' },
  ];
  return (
    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
      {options.map((option) => (
        <Chip
          key={option.value}
          clickable
          label={option.label}
          onClick={() => onChange(option.value)}
          sx={{
            py: 1.5,
            fontWeight: 700,
            ...(documentType === option.value && {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }),
          }}
        />
      ))}
    </Stack>
  );
};

interface PreviewSectionProps {
  title: string;
  count?: number;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ title, count, icon, color, children }) => (
  <Box
    sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
  >
    <Stack direction="row" alignItems="center" gap={1.25} sx={{ mb: 1.5 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: `linear-gradient(135deg, ${color}, ${color}99)`,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2" fontWeight={800}>
        {title}
      </Typography>
      {count !== undefined && (
        <Chip size="small" label={`${count}`} sx={{ fontWeight: 800, height: 22 }} />
      )}
      <Box sx={{ flexGrow: 1 }} />
      {count === 0 && <StarIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
    </Stack>
    {children}
  </Box>
);

interface PreviewRowProps {
  title: string;
  subtitle?: string;
}

const PreviewRow: React.FC<PreviewRowProps> = ({ title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        flexShrink: 0,
      }}
    />
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" fontWeight={700} noWrap>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" noWrap>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

export default MentorRegistrationPage;
