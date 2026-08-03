import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button as MuiButton,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Card } from '@/components/ui/Card';
import { UploadArea } from '@/components/ui/UploadArea';
import { EmptyState } from '@/components/feedback';
import { ConfirmDialog } from '@/components/feedback';
import { AnalyticsCard, CertificateCard, GradientCard } from '@/components/mentor';
import { useDocumentTitle } from '@/hooks';
import { certificationToDraft } from '@/features/mentor/storage';
import { CertificationEditor } from '@/features/mentor/components';
import {
  useAddCertificationMutation,
  useDeleteCertificationMutation,
  useMentorProfileQuery,
  useUpdateCertificationMutation,
} from '@/features/mentor/hooks';
import { seedCertifications } from '@/features/mentor/data';
import type { CertificationDraft } from '@/features/mentor/storage';
import type { MentorCertification } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

type FilterKey = 'ALL' | 'VERIFIED' | 'PENDING' | 'REJECTED';
type SortKey = 'recent' | 'oldest' | 'az';

const FILTER_OPTIONS: { value: FilterKey; label: string }[] = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'PENDING', label: 'Pending review' },
  { value: 'REJECTED', label: 'Rejected' },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'recent', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'az', label: 'Title A–Z' },
];

export const MentorCertificatesPage: React.FC = () => {
  useDocumentTitle('Certificates');
  const { mentor, isOffline } = useMentorProfileQuery();
  const addMutation = useAddCertificationMutation();
  const updateMutation = useUpdateCertificationMutation();
  const deleteMutation = useDeleteCertificationMutation();

  const certifications = mentor?.certifications ?? seedCertifications;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [sort, setSort] = useState<SortKey>('recent');
  const [editor, setEditor] = useState<{
    open: boolean;
    editing: boolean;
    item: CertificationDraft | null;
  }>({
    open: false,
    editing: false,
    item: null,
  });
  const [fileUrl, setFileUrl] = useState<{ url: string; name: string; size: number } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MentorCertification | null>(null);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = certifications.filter((cert) => {
      const matchesQuery =
        !query ||
        cert.title.toLowerCase().includes(query) ||
        cert.issuingOrganization.toLowerCase().includes(query);
      const matchesFilter =
        filter === 'ALL' || (cert.verificationStatus ?? 'UNVERIFIED') === filter;
      return matchesQuery && matchesFilter;
    });
    const sorted = [...list];
    if (sort === 'az') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const ta = a.issueDate ? new Date(a.issueDate).getTime() : 0;
        const tb = b.issueDate ? new Date(b.issueDate).getTime() : 0;
        return sort === 'recent' ? tb - ta : ta - tb;
      });
    }
    return sorted;
  }, [certifications, search, filter, sort]);

  const verifiedCount = certifications.filter(
    (cert) => cert.verificationStatus === 'VERIFIED',
  ).length;
  const pendingCount = certifications.filter(
    (cert) => cert.verificationStatus === 'PENDING',
  ).length;

  const openCreate = () => {
    setFileUrl(null);
    setEditor({ open: true, editing: false, item: null });
  };

  const openEdit = (cert: MentorCertification) => {
    setFileUrl(cert.fileUrl ? { url: cert.fileUrl, name: 'certificate', size: 0 } : null);
    setEditor({ open: true, editing: true, item: certificationToDraft(cert) });
  };

  const handleSubmit = (values: Omit<CertificationDraft, 'id'>) => {
    const payload = {
      title: values.title,
      issuingOrganization: values.issuingOrganization,
      credentialId: values.credentialId || undefined,
      credentialUrl: values.credentialUrl || undefined,
      issueDate: values.issueDate || undefined,
      doesNotExpire: values.doesNotExpire,
      description: values.description || undefined,
      fileUrl: fileUrl?.url || undefined,
      sortOrder: 0,
    };
    if (editor.editing && editor.item?.id) {
      updateMutation.mutate({ certificationId: editor.item.id, payload });
    } else {
      addMutation.mutate(payload);
    }
    setEditor({ open: false, editing: false, item: null });
    setFileUrl(null);
  };

  const handleDelete = () => {
    if (!deleteTarget?.id) return;
    deleteMutation.mutate(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="brandWarm" sx={{ mb: 3 }}>
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
              <BadgeOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Certificates
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {certifications.length} certificate{certifications.length === 1 ? '' : 's'} ·{' '}
                {verifiedCount} verified · {pendingCount} pending
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
          <MuiButton
            variant="contained"
            size="large"
            startIcon={<AddOutlinedIcon />}
            onClick={openCreate}
            sx={{
              bgcolor: '#fff',
              color: '#5443D4',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
            }}
          >
            Add certificate
          </MuiButton>
        </Stack>
      </GradientCard>

      {/* ================= Editor ================= */}
      {editor.open && (
        <Card sx={{ mb: 3, p: { xs: 2.5, md: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              {editor.editing ? 'Edit certificate' : 'Add a certificate'}
            </Typography>
            <Tooltip title="Close">
              <IconButton
                size="small"
                aria-label="Close editor"
                onClick={() => {
                  setEditor({ open: false, editing: false, item: null });
                  setFileUrl(null);
                }}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack spacing={2.5}>
            <UploadArea
              variant="image"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              maxSizeMB={10}
              label="Upload certificate document"
              hint="PDF or image · drag & drop or click to browse"
              value={fileUrl?.url}
              fileName={fileUrl?.name}
              fileSize={fileUrl?.size}
              onChange={(url, meta) => setFileUrl({ url, name: meta.name, size: meta.size })}
              onRemove={() => setFileUrl(null)}
            />
            <CertificationEditor
              initial={editor.item}
              onCancel={() => {
                setEditor({ open: false, editing: false, item: null });
                setFileUrl(null);
              }}
              onSubmit={handleSubmit}
            />
          </Stack>
        </Card>
      )}

      {/* ================= Toolbar + grid ================= */}
      <AnalyticsCard
        title="Your Credentials"
        subtitle="Certifications that build learner trust"
        icon={<WorkspacePremiumOutlinedIcon />}
        iconColor="#F59E0B"
        action={
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              size="small"
              label={`${verifiedCount} verified`}
              sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 700 }}
            />
            <Chip
              size="small"
              label={`${pendingCount} pending`}
              sx={{ bgcolor: 'action.selected', color: 'warning.main', fontWeight: 700 }}
            />
          </Stack>
        }
      >
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1.5} sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder="Search by title or issuer…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} />
                ),
                'aria-label': 'Search certificates',
              },
            }}
            sx={{ flexGrow: 1, minWidth: 220 }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="cert-filter-label">Status</InputLabel>
            <Select
              labelId="cert-filter-label"
              value={filter}
              onChange={(event) => setFilter(event.target.value as FilterKey)}
              label="Status"
            >
              {FILTER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="cert-sort-label">Sort by</InputLabel>
            <Select
              labelId="cert-sort-label"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              label="Sort by"
              startAdornment={
                <SortOutlinedIcon sx={{ fontSize: 18, color: 'text.disabled', mr: 1 }} />
              }
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {visible.length === 0 ? (
          certifications.length === 0 ? (
            <EmptyState
              icon={<BadgeOutlinedIcon sx={{ fontSize: 36 }} />}
              title="No certificates yet"
              description="Add your professional certifications to build instant trust with learners."
              actionLabel="Add certificate"
              onAction={openCreate}
            />
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              No certificates match your search or filter.
            </Alert>
          )
        ) : (
          <Grid container spacing={2.5}>
            {visible.map((cert, index) => (
              <Grid key={cert.id ?? `${cert.title}-${index}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={index}
                  style={{ height: '100%' }}
                >
                  <CertificateCard
                    certificate={cert}
                    onEdit={openEdit}
                    onDelete={setDeleteTarget}
                  />
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </AnalyticsCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete certificate?"
        message={`“${deleteTarget?.title ?? ''}” will be permanently removed from your profile.`}
        confirmText="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default MentorCertificatesPage;
