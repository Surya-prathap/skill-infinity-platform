import { useRef, useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import CodeIcon from '@mui/icons-material/Code';
import LinkIcon from '@mui/icons-material/Link';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import TagIcon from '@mui/icons-material/Tag';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Stack } from '@/components/ui/Stack';
import { renderMarkdownLite } from './markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  maxRows?: number;
  autoFocus?: boolean;
  disabled?: boolean;
  onSubmit?: () => void;
}

type WrapStyle = '**' | '*' | '`' | '- ' | '> ';

interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  wrap?: WrapStyle;
  prefix?: string;
}

const ACTIONS: ToolbarAction[] = [
  { icon: <FormatBoldIcon fontSize="small" />, label: 'Bold', wrap: '**' },
  { icon: <FormatItalicIcon fontSize="small" />, label: 'Italic', wrap: '*' },
  { icon: <CodeIcon fontSize="small" />, label: 'Inline code', wrap: '`' },
  { icon: <LinkIcon fontSize="small" />, label: 'Link', prefix: '[text](https://)' },
  { icon: <FormatListBulletedIcon fontSize="small" />, label: 'Bullet list', wrap: '- ' },
  { icon: <FormatQuoteIcon fontSize="small" />, label: 'Quote', wrap: '> ' },
  { icon: <AlternateEmailIcon fontSize="small" />, label: 'Mention', prefix: '@' },
  { icon: <TagIcon fontSize="small" />, label: 'Hashtag', prefix: '#' },
];

/** Premium markdown composer with formatting toolbar and live preview. */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write something…',
  minRows = 3,
  maxRows = 12,
  autoFocus = false,
  disabled = false,
  onSubmit,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [preview, setPreview] = useState(false);

  const insert = (style: WrapStyle | undefined, prefix?: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end } = textarea;
    const selected = value.slice(start, end) || (prefix ? '' : 'text');

    let replacement: string;
    if (prefix) {
      replacement = `${prefix}${selected}`;
    } else if (style === '**' || style === '*' || style === '`') {
      replacement = `${style}${selected}${style}`;
    } else {
      replacement = `${style ?? ''}${selected}`;
    }

    const next = value.slice(0, start) + replacement + value.slice(end);
    onChange(next);
    window.requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + replacement.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && onSubmit) {
      event.preventDefault();
      onSubmit();
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      insert(undefined, '  ');
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          gap: 0.25,
          p: 0.75,
          border: 1,
          borderBottom: 'none',
          borderColor: 'divider',
          borderRadius: '12px 12px 0 0',
          bgcolor: 'action.hover',
          flexWrap: 'wrap',
        }}
      >
        {ACTIONS.map((action) => (
          <Tooltip key={action.label} title={action.label} arrow>
            <IconButton
              size="small"
              disabled={disabled}
              onClick={() => insert(action.wrap, action.prefix)}
              aria-label={action.label}
              sx={{ borderRadius: 1.5, '&:hover': { color: 'primary.main' } }}
            >
              {action.icon}
            </IconButton>
          </Tooltip>
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title={preview ? 'Edit' : 'Preview'} arrow>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => setPreview((current) => !current)}
            aria-label={preview ? 'Edit mode' : 'Preview mode'}
            color={preview ? 'primary' : 'default'}
            sx={{ borderRadius: 1.5 }}
          >
            {preview ? <EditOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      {preview ? (
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: '0 0 12px 12px',
            p: 2,
            minHeight: 96,
            fontSize: '0.92rem',
            lineHeight: 1.7,
            color: 'text.primary',
          }}
        >
          {value.trim() ? (
            renderMarkdownLite(value)
          ) : (
            <Box component="span" sx={{ color: 'text.disabled' }}>
              Nothing to preview yet…
            </Box>
          )}
        </Box>
      ) : (
        <Box
          component="textarea"
          ref={textareaRef}
          value={value}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={minRows}
          autoFocus={autoFocus}
          aria-label={placeholder}
          sx={{
            width: '100%',
            border: 1,
            borderColor: 'divider',
            borderRadius: '0 0 12px 12px',
            p: 2,
            fontSize: '0.92rem',
            lineHeight: 1.7,
            fontFamily: 'inherit',
            color: 'text.primary',
            background: 'transparent',
            resize: 'vertical',
            minHeight: minRows * 24,
            maxHeight: maxRows * 26,
            outline: 'none',
            '&:focus': { borderColor: 'primary.main' },
            '&::placeholder': { color: 'text.disabled' },
          }}
        />
      )}
    </Box>
  );
};

export default RichTextEditor;
