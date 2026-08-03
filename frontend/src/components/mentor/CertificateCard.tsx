import { Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/utils';
import type { MentorCertification } from '@/types';

interface CertificateCardProps {
  certificate: MentorCertification;
  onEdit?: (certificate: MentorCertification) => void;
  onDelete?: (certificate: MentorCertification) => void;
}

const verificationMeta = (
  status?: string,
): { label: string; color: 'success' | 'warning' | 'error' | 'default' } => {
  switch (status) {
    case 'VERIFIED':
      return { label: 'Verified', color: 'success' };
    case 'PENDING':
      return { label: 'Pending review', color: 'warning' };
    case 'REJECTED':
      return { label: 'Rejected', color: 'error' };
    default:
      return { label: 'Not verified', color: 'default' };
  }
};

const isPreviewable = (url?: string): boolean =>
  Boolean(url && (url.startsWith('data:image') || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(url)));

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onEdit,
  onDelete,
}) => {
  const meta = verificationMeta(certificate.verificationStatus);
  const previewable = isPreviewable(certificate.fileUrl);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{
          height: '100%',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Corner glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.14), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Stack direction="row" alignItems="center" gap={1.5} sx={{ position: 'relative' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              boxShadow: '0 6px 16px rgba(245,158,11,0.35)',
              flexShrink: 0,
            }}
          >
            <WorkspacePremiumOutlinedIcon />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {certificate.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {certificate.issuingOrganization}
            </Typography>
          </Box>
          <StatusBadge label={meta.label} color={meta.color} withDot={false} />
        </Stack>

        {/* File preview */}
        {previewable ? (
          <Box
            component="img"
            src={certificate.fileUrl}
            alt={certificate.title}
            sx={{
              mt: 2,
              width: '100%',
              height: 132,
              borderRadius: 2.5,
              objectFit: 'cover',
              border: 1,
              borderColor: 'divider',
            }}
          />
        ) : (
          <Box
            sx={{
              mt: 2,
              py: 3,
              borderRadius: 2.5,
              border: 1,
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.75,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 34 }} />
            <Typography variant="caption" fontWeight={600}>
              Certificate document
            </Typography>
          </Box>
        )}

        {certificate.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1.5,
              lineHeight: 1.6,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {certificate.description}
          </Typography>
        )}

        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 1.5, color: 'text.secondary' }}>
          <Stack direction="row" alignItems="center" gap={0.5}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" fontWeight={600}>
              {formatDate(certificate.issueDate)}
            </Typography>
          </Stack>
          {certificate.credentialId && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <LinkOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 140 }}>
                {certificate.credentialId}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}
        >
          {certificate.credentialUrl ? (
            <Tooltip title="View credential">
              <Box
                component="a"
                href={certificate.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                View credential
                <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
              </Box>
            </Tooltip>
          ) : (
            <Box />
          )}
          <Stack direction="row" gap={0.5}>
            {onEdit && (
              <Tooltip title="Edit certificate">
                <IconButton
                  size="small"
                  onClick={() => onEdit(certificate)}
                  aria-label={`Edit ${certificate.title}`}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete certificate">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(certificate)}
                  aria-label={`Delete ${certificate.title}`}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;
