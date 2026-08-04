import type { ReactNode } from 'react';

/* Token order matters: bold, inline code, links, mentions. */
const TOKEN_REGEX = /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s<>]+|@[\w.-]+)/g;

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Renders lightweight markdown (bold, code, links, mentions) + line breaks. */
export const RichText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const parts = text.split(TOKEN_REGEX);

  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} style={{ fontWeight: 700 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={index}
              style={{
                fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
                fontSize: '0.85em',
                background: 'rgba(109, 93, 246, 0.12)',
                color: 'inherit',
                borderRadius: 6,
                padding: '1px 6px',
              }}
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              style={{ color: '#5EEAD4', textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              {part}
            </a>
          );
        }
        if (part.startsWith('@')) {
          return (
            <span
              key={index}
              style={{
                fontWeight: 600,
                color: 'inherit',
                background: 'rgba(109, 93, 246, 0.14)',
                borderRadius: 6,
                padding: '0 4px',
              }}
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

/** Highlights occurrences of `query` inside `text` (case-insensitive). */
export const HighlightedText: React.FC<{ text: string; query: string; maxLength?: number }> = ({
  text,
  query,
  maxLength,
}) => {
  const needle = query.trim();
  const source = maxLength && text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

  if (!needle) {
    return <>{source}</>;
  }

  const pattern = new RegExp(`(${escapeRegExp(needle)})`, 'gi');
  const parts = source.split(pattern);
  const nodes: ReactNode[] = parts.map((part, index) =>
    part.toLowerCase() === needle.toLowerCase() ? (
      <mark
        key={index}
        style={{
          background: 'rgba(245, 158, 11, 0.35)',
          color: 'inherit',
          borderRadius: 4,
          padding: '0 2px',
        }}
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
  return <>{nodes}</>;
};
