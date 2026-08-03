import type { FormEvent, ReactNode } from 'react';
import { Box, Divider } from '@mui/material';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';

interface EditorShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  submitLabel?: string;
  cancelLabel?: string;
  submitting?: boolean;
  onCancel?: () => void;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

/** Consistent card shell for each collection editor inside the wizard. */
export const EditorShell: React.FC<EditorShellProps> = ({
  title,
  subtitle,
  icon,
  iconColor = '#6D5DF6',
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  submitting = false,
  onCancel,
  onSubmit,
  children,
}) => {
  return (
    <Card sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        {icon && (
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${iconColor}, ${iconColor}99)`,
              boxShadow: `0 6px 16px ${iconColor}40`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>

      <Box component="form" onSubmit={onSubmit} noValidate>
        {children}
        <Divider sx={{ my: 2.5 }} />
        <Stack direction="row" justifyContent="flex-end" gap={1.5}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" variant="contained" loading={submitting}>
            {submitLabel}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

export default EditorShell;
