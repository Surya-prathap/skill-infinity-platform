import type { ReactNode } from 'react';

/* ============================================================
   Lightweight markdown renderer (safe, no innerHTML).
   Supports: headings, bold, italic, inline code, code blocks,
   links, bullet lists, mentions (@name) and hashtags (#tag).
   NOTE: this file emits JSX, so it must live in a .tsx module.
   ============================================================ */

const INLINE_TOKEN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|@[\w-]+|#[\w-]+)/g;

const renderInline = (text: string, keyBase: string, onClickMention?: (name: string) => void): ReactNode[] => {
  const parts = text.split(INLINE_TOKEN);
  return parts.map((part, index) => {
    const key = `${keyBase}-${index}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} style={{ fontWeight: 800 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={key} style={{ fontStyle: 'italic' }}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={key}
          style={{
            fontFamily: '"JetBrains Mono", "Fira Code", monospace',
            fontSize: '0.82em',
            background: 'rgba(109,93,246,0.1)',
            color: '#8E80FF',
            padding: '1px 5px',
            borderRadius: 6,
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#6D5DF6', fontWeight: 700, textDecoration: 'none' }}
          onClick={(event) => event.stopPropagation()}
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (part.startsWith('@')) {
      return (
        <button
          key={key}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClickMention?.(part.slice(1));
          }}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: onClickMention ? 'pointer' : 'default',
            color: '#6D5DF6',
            fontWeight: 700,
          }}
        >
          {part}
        </button>
      );
    }
    if (part.startsWith('#')) {
      return (
        <button
          key={key}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClickMention?.(part.slice(1));
          }}
          style={{
            border: 'none',
            background: 'rgba(20,184,166,0.12)',
            padding: '1px 6px',
            borderRadius: 999,
            cursor: onClickMention ? 'pointer' : 'default',
            color: '#14B8A6',
            fontWeight: 700,
            fontSize: '0.82em',
          }}
        >
          {part}
        </button>
      );
    }
    return <span key={key}>{part}</span>;
  });
};

export interface MarkdownRenderOptions {
  onClickMention?: (name: string) => void;
  compact?: boolean;
}

/** Renders markdown-lite content into React nodes. */
export const renderMarkdownLite = (content: string, options: MarkdownRenderOptions = {}): ReactNode => {
  const { onClickMention } = options;
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let blockIndex = 0;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const flushCode = () => {
    if (codeLines.length === 0) return;
    nodes.push(
      <pre
        key={`code-${blockIndex}`}
        style={{
          background: 'rgba(15,23,42,0.9)',
          color: '#E6E9F2',
          padding: '14px 16px',
          borderRadius: 12,
          overflowX: 'auto',
          fontSize: '0.82rem',
          lineHeight: 1.6,
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
          margin: '8px 0',
          whiteSpace: 'pre',
        }}
      >
        {codeLines.join('\n')}
      </pre>,
    );
    blockIndex += 1;
    codeLines = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        flushCode();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (trimmed === '') continue;
    const key = `line-${blockIndex}`;
    blockIndex += 1;

    if (trimmed.startsWith('### ')) {
      nodes.push(<div key={key} style={{ fontWeight: 800, fontSize: '1rem', margin: '6px 0 2px' }}>{renderInline(trimmed.slice(4), key, onClickMention)}</div>);
    } else if (trimmed.startsWith('## ')) {
      nodes.push(<div key={key} style={{ fontWeight: 800, fontSize: '1.1rem', margin: '8px 0 2px' }}>{renderInline(trimmed.slice(3), key, onClickMention)}</div>);
    } else if (trimmed.startsWith('# ')) {
      nodes.push(<div key={key} style={{ fontWeight: 800, fontSize: '1.2rem', margin: '8px 0 2px' }}>{renderInline(trimmed.slice(2), key, onClickMention)}</div>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      nodes.push(
        <div key={key} style={{ display: 'flex', gap: 8, margin: '2px 0' }}>
          <span style={{ color: '#6D5DF6', fontWeight: 800 }}>•</span>
          <span>{renderInline(trimmed.slice(2), key, onClickMention)}</span>
        </div>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      nodes.push(
        <div key={key} style={{ display: 'flex', gap: 8, margin: '2px 0' }}>
          <span style={{ color: '#6D5DF6', fontWeight: 800, minWidth: 18 }}>{trimmed.match(/^\d+/)?.[0]}.</span>
          <span>{renderInline(trimmed.replace(/^\d+\.\s/, ''), key, onClickMention)}</span>
        </div>,
      );
    } else if (trimmed.startsWith('> ')) {
      nodes.push(
        <blockquote
          key={key}
          style={{
            margin: '6px 0',
            padding: '6px 14px',
            borderLeft: '3px solid #6D5DF6',
            background: 'rgba(109,93,246,0.07)',
            borderRadius: '0 8px 8px 0',
            color: 'inherit',
          }}
        >
          {renderInline(trimmed.slice(2), key, onClickMention)}
        </blockquote>,
      );
    } else {
      nodes.push(
        <div key={key} style={{ margin: '2px 0' }}>
          {renderInline(line, key, onClickMention)}
        </div>,
      );
    }
  }
  flushCode();

  return nodes.length > 0 ? nodes : <span>{content}</span>;
};

/** Extracts @mentions from raw content. */
export const extractMentions = (content: string): string[] => {
  const matches = content.match(/@[\w-]+/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
};

/** Extracts #hashtags from raw content. */
export const extractHashtags = (content: string): string[] => {
  const matches = content.match(/#[\w-]+/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(1)))];
};

/** Estimates read time in minutes for a post. */
export const estimateReadTime = (content: string): number =>
  Math.max(1, Math.round(content.split(/\s+/).filter(Boolean).length / 200));
