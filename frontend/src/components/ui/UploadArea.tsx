import { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, IconButton, LinearProgress, Tooltip } from '@mui/material';
import { Stack } from './Stack';
import { Typography } from './Typography';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { formatFileSize } from '@/utils';

export interface UploadMeta {
  name: string;
  size: number;
  type: string;
}

interface UploadAreaProps {
  variant?: 'image' | 'file';
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  hint?: string;
  /** Current file URL (data: or http(s):). */
  value?: string;
  fileName?: string;
  fileSize?: number;
  onChange: (url: string, meta: UploadMeta) => void;
  onRemove?: () => void;
}

const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.readAsDataURL(file);
  });

/**
 * Premium drag-and-drop upload surface. Converts the selected file to a data
 * URL (images are previewed inline, documents are listed with metadata).
 */
export const UploadArea: React.FC<UploadAreaProps> = ({
  variant = 'image',
  accept,
  maxSizeMB = 5,
  label,
  hint,
  value,
  fileName,
  fileSize,
  onChange,
  onRemove,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploading = progress !== null;

  useEffect(() => {
    if (!uploading) return;
    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = (current ?? 0) + 18 + Math.random() * 22;
        return next >= 100 ? 100 : next;
      });
    }, 120);
    return () => window.clearInterval(interval);
  }, [uploading]);

  const handleFile = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);

    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim().toLowerCase());
      const matches = acceptedTypes.some((type) =>
        type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : file.type.toLowerCase() === type,
      );
      if (!matches) {
        setError(`File type not supported. Accepted: ${accept}`);
        return;
      }
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds the ${maxSizeMB} MB limit.`);
      return;
    }

    setProgress(0);
    try {
      const url = await readFileAsDataUrl(file);
      // Let the progress bar complete before swapping in the preview.
      window.setTimeout(() => {
        setProgress(null);
        onChange(url, { name: file.name, size: file.size, type: file.type });
      }, 420);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setProgress(null);
    }
  };

  const openPicker = () => inputRef.current?.click();

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFile(event.dataTransfer.files?.[0]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPicker();
    }
  };

  const hasFile = Boolean(value);

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={(event) => void handleFile(event.target.files?.[0])}
        style={{ display: 'none' }}
        aria-hidden="true"
        tabIndex={-1}
      />

      <Box
        role="button"
        tabIndex={0}
        aria-label={label ?? 'Upload file'}
        onKeyDown={handleKeyDown}
        onClick={openPicker}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          border: 2,
          borderStyle: 'dashed',
          borderColor: dragging ? 'primary.main' : 'divider',
          borderRadius: 3,
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease',
          backgroundColor: dragging ? 'action.selected' : 'transparent',
          transform: dragging ? 'scale(1.01)' : 'scale(1)',
          '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
          '&:focus-visible': { borderColor: 'primary.main', boxShadow: '0 0 0 4px rgba(109,93,246,0.18)' },
        }}
      >
        {progress !== null ? (
          <Stack alignItems="center" gap={1.5}>
            <CircularProgress size={40} thickness={4} />
            <Box sx={{ width: '100%', maxWidth: 260 }}>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Uploading… {Math.round(progress)}%
            </Typography>
          </Stack>
        ) : (
          <Stack alignItems="center" gap={1}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.selected',
                color: 'primary.main',
              }}
            >
              <CloudUploadOutlinedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {label ?? (variant === 'image' ? 'Upload an image' : 'Upload a file')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hint ?? `Drag & drop or click to browse · max ${maxSizeMB} MB`}
            </Typography>
          </Stack>
        )}
      </Box>

      {hasFile && variant === 'image' && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'background.paper',
          }}
        >
          <Box
            component="img"
            src={value}
            alt="Uploaded preview"
            sx={{ width: 56, height: 56, borderRadius: 2, objectFit: 'cover' }}
          />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {fileName ?? 'Uploaded image'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fileSize ? `${formatFileSize(fileSize)}` : 'Ready'} · tap to replace
            </Typography>
          </Box>
          {onRemove && (
            <Tooltip title="Remove">
              <IconButton
                size="small"
                aria-label="Remove file"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <DeleteOutlineOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {hasFile && variant === 'file' && (
        <Box
          sx={{
            mt: 1.5,
            p: 1.5,
            borderRadius: 2.5,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: 'background.paper',
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
              bgcolor: 'error.light',
              color: 'error.main',
              flexShrink: 0,
            }}
          >
            <DescriptionOutlinedIcon />
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {fileName ?? 'Resume'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fileSize ? `${formatFileSize(fileSize)}` : 'Document'} · tap to replace
            </Typography>
          </Box>
          {onRemove && (
            <Tooltip title="Remove">
              <IconButton
                size="small"
                aria-label="Remove file"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default UploadArea;
