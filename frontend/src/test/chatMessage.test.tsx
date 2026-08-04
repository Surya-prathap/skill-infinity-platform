import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MessageBubble } from '@/components/communication/MessageBubble';
import type { ChatMessage } from '@/types';

const baseMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'm-1',
  conversationId: 'c-sarah',
  senderId: 'user-sarah',
  senderName: 'Sarah Chen',
  content: 'Hello **Alex**! Check https://example.com/docs and `useMemo`.',
  kind: 'text',
  attachments: [],
  reactions: [],
  status: 'delivered',
  createdAt: '2026-08-04T10:00:00.000Z',
  replyTo: null,
  readBy: ['user-sarah', 'user-me'],
  ...overrides,
});

const renderBubble = (message: ChatMessage, isOwn = false, onReply = () => undefined) =>
  render(
    <MessageBubble
      message={message}
      isOwn={isOwn}
      showSender={false}
      onReply={onReply}
      onReact={() => undefined}
    />,
  );

describe('MessageBubble', () => {
  it('renders content with markdown accents (bold, link, inline code)', () => {
    renderBubble(baseMessage());
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'https://example.com/docs' })).toBeInTheDocument();
    expect(screen.getByText('useMemo')).toBeInTheDocument();
  });

  it('shows read receipts (double check) for own read messages', () => {
    renderBubble(baseMessage({ senderId: 'user-me', senderName: 'Alex Morgan', status: 'read' }), true);
    expect(screen.getByTestId('read-receipts')).toBeInTheDocument();
  });

  it('does not render receipts for peer messages', () => {
    renderBubble(baseMessage());
    expect(screen.queryByTestId('read-receipts')).not.toBeInTheDocument();
  });

  it('renders code blocks for code messages', () => {
    renderBubble(baseMessage({ kind: 'code', content: 'const x = 1;' }));
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('renders voice messages with duration', () => {
    renderBubble(
      baseMessage({
        kind: 'voice',
        content: 'Voice message',
        attachments: [{ id: 'a1', name: 'v.m4a', kind: 'audio', size: 1000, durationSeconds: 42 }],
      }),
    );
    expect(screen.getByText('42s')).toBeInTheDocument();
  });

  it('renders reactions as tappable chips', () => {
    const onReact = (_message: ChatMessage, _emoji: string) => undefined;
    render(
      <MessageBubble
        message={baseMessage({
          reactions: [{ emoji: '🔥', count: 3, reactedByMe: true, userIds: ['user-me', 'user-sarah', 'user-maya'] }],
        })}
        isOwn={false}
        showSender={false}
        onReply={() => undefined}
        onReact={onReact}
      />,
    );
    const reaction = screen.getByRole('button', { name: 'Reaction 🔥' });
    expect(reaction).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('triggers reply callback', () => {
    let replied = false;
    renderBubble(baseMessage(), false, () => {
      replied = true;
    });
    fireEvent.click(screen.getByLabelText('Reply'));
    expect(replied).toBe(true);
  });

  it('renders deleted messages as tombstones', () => {
    renderBubble(baseMessage({ deleted: true, content: 'This message was deleted.' }));
    expect(screen.getByText('This message was deleted.')).toBeInTheDocument();
  });
});
