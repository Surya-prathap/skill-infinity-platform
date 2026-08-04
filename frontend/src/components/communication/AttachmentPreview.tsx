import { Box, IconButton, Tooltip } from '@mui/material';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Typography } from '@/components/ui/Typography';
import { formatFileSize } from '@/utils';
import { showInfo } from '@/utils';
import type { MessageAttachment } from '@/types';

interface AttachmentPreviewProps {
  attachment: MessageAttachment;
  compact?: boolean;
  onDownload?: (attachment: MessageAttachment) => void;
}

const KIND_ICON: Record<string, React.ReactNode> = {
  pdf: <PictureAsPdfOutlinedIcon fontSize="small" />,
  document: <DescriptionOutlinedIcon fontSize="small" />,
  archive: <ArchiveOutlinedIcon fontSize="small" />,
  video: <MovieOutlinedIcon fontSize="small" />,
  audio: <GraphicEqOutlinedIcon fontSize="small" />,
  certificate: <WorkspacePremiumOutlinedIcon fontSize="small" />,
};

const KIND_COLOR: Record<string, string> = {
  pdf: '#EF4444',
  document: '#3B82F6',
  archive: '#F59E0B',
  video: '#8B5CF6',
  audio: '#14B8A6',
  certificate: '#10B981',
  image: '#6D5DF6',
  other: '#94A3B8',
};

/** Self-contained attachment card — image tiles and file chips without network dependency. */
export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  compact = false,
  onDownload,
}) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload(attachment);
      return;
    }
    showInfo(`Downloading “${attachment.name}” — ${formatFileSize(attachment.size)}`);
  };

  if (attachment.kind === 'image') {
    return (
      <Box
        sx={{
          position: 'relative',
          width: compact ? 120 : 220,
          maxWidth: '100%',
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(109,93,246,0.2)',
          cursor: 'pointer',
          transition: 'transform 180ms ease, box-shadow 180ms ease',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
          },
        }}
        onClick={handleDownload}
        aria-label={`Image ${attachment.name}`}
        role="button"
        tabIndex={0}
      >
        <Box
          sx={{
            height: compact ? 90 : 140,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: compact ? 40 : 60,
            background: `linear-gradient(135deg, ${KIND_COLOR.image ?? '#6D5DF6'}26, rgba(67,198,192,0.18))`,
          }}
        >
          {attachment.emoji ?? '🖼️'}
        </Box>
        <Box
          sx={{
            px: 1,
            py: 0.75,
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(11,18,32,0.75)' : 'rgba(255,255,255,0.85)',
          }}
        >
          <Typography variant="caption" fontWeight={600} noWrap>
            {attachment.name}
          </Typography>
        </Box>
      </Box>
    );
  }

  const icon = KIND_ICON[attachment.kind] ?? <DescriptionOutlinedIcon fontSize="small" />;
  const color = KIND_COLOR[attachment.kind] ?? KIND_COLOR.other ?? '#94A3B8';

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 1,
        borderRadius: 2.5,
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)',
        border: '1px solid rgba(109,93,246,0.18)',
        maxWidth: '100%',
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          minWidth: 34,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: color,
        }}
      >
        {attachment.kind === 'video' ? (
          <Box sx={{ position: 'relative' }}>
            {icon}
            <PlayArrowRoundedIcon sx={{ position: 'absolute', inset: 0, m: 'auto', fontSize: 16 }} />
          </Box>
        ) : (
          icon
        )}
      </Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {attachment.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatFileSize(attachment.size)}
          {attachment.durationSeconds ? ` · ${attachment.durationSeconds}s` : ''}
        </Typography>
      </Box>
      {!compact && (
        <Tooltip title="Download">
          <IconButton size="small" aria-label="Download attachment" onClick={handleDownload}>
            <DownloadOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default AttachmentPreview;
