import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MessageComposer, type ComposerPayload } from '@/components/communication/MessageComposer';

const renderComposer = (onSend: (payload: ComposerPayload) => void) =>
  render(
    <MessageComposer
      conversationId="c-sarah"
      replyTo={null}
      onCancelReply={() => undefined}
      onSend={onSend}
    />,
  );

describe('MessageComposer', () => {
  it('sends typed content', () => {
    const sent: { payload: ComposerPayload | null } = { payload: null };
    renderComposer((payload) => {
      sent.payload = payload;
    });

    const textarea = screen.getByLabelText('Message');
    fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));

    expect(sent.payload?.content).toBe('Hello there 👋');
    expect(sent.payload?.kind).toBe('text');
  });

  it('sends on Enter and keeps Shift+Enter for newlines', () => {
    const sent: { payload: ComposerPayload | null } = { payload: null };
    renderComposer((payload) => {
      sent.payload = payload;
    });

    const textarea = screen.getByLabelText('Message');
    fireEvent.change(textarea, { target: { value: 'Line one' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(sent.payload).toBeNull();

    fireEvent.keyDown(textarea, { key: 'Enter' });
    expect(sent.payload?.content).toBe('Line one');
  });

  it('inserts emojis from the picker into the draft', async () => {
    const sent: { payload: ComposerPayload | null } = { payload: null };
    renderComposer((payload) => {
      sent.payload = payload;
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add emoji' }));
    const emoji = await screen.findByRole('button', { name: 'Emoji 😀' });
    fireEvent.click(emoji);

    // Dismiss the popover so the composer controls are interactive again.
    const modal = document.querySelector('.MuiModal-root');
    fireEvent.keyDown(modal ?? document.body, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Emoji 😀' })).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send message' }));
    expect(sent.payload?.content).toContain('😀');
  });

  it('shows a reply preview bar and cancels it', () => {
    render(
      <MessageComposer
        conversationId="c-sarah"
        replyTo={{ messageId: 'm-1', senderName: 'Sarah Chen', content: 'Original text', kind: 'text' }}
        onCancelReply={() => undefined}
        onSend={() => undefined}
      />,
    );
    expect(screen.getByText('Replying to Sarah Chen')).toBeInTheDocument();
    expect(screen.getByText('Original text')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel reply' }));
  });

  it('opens the GIF picker and sends a GIF', async () => {
    const sent: { payload: ComposerPayload | null } = { payload: null };
    renderComposer((payload) => {
      sent.payload = payload;
    });

    fireEvent.click(screen.getByRole('button', { name: 'Send a GIF' }));
    const gif = await screen.findByRole('button', { name: 'GIF Cheers' });
    fireEvent.click(gif);

    expect(sent.payload?.kind).toBe('gif');
    expect(sent.payload?.content).toBe('Cheers');
  });

  it('shows upload progress chips when files are attached', async () => {
    renderComposer(() => undefined);

    const fileInput = screen.getByTestId('file-input');
    const file = new File(['content'], 'design.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('design.pdf')).toBeInTheDocument();
    });
  });
});
