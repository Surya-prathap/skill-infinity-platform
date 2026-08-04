import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import chatReducer, {
  messageReceived,
  setSocketStatus,
  typingChanged,
} from '@/store/slices/chatSlice';
import { simulatePeerReply } from '@/socket/chatSocket';
import { hydrateConversations } from '@/store/slices/chatSlice';
import { seedConversations } from '@/features/communication/data';

describe('chatSocket real-time integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('maps socket connect to the connected status', () => {
    const state = chatReducer(undefined, setSocketStatus('connected'));
    expect(state.socketStatus).toBe('connected');
  });

  it('appends incoming messages from the socket into Redux', () => {
    const incoming = {
      id: 'socket-1',
      conversationId: 'c-sarah',
      senderId: 'user-sarah',
      senderName: 'Sarah Chen',
      content: 'Live from the socket!',
      kind: 'text' as const,
      attachments: [],
      reactions: [],
      status: 'delivered' as const,
      createdAt: new Date().toISOString(),
      replyTo: null,
      readBy: ['user-sarah'],
    };
    let state = chatReducer(undefined, hydrateConversations(seedConversations));
    state = chatReducer(state, { type: 'chat/setActiveConversation', payload: 'c-maya' });
    state = chatReducer(state, messageReceived(incoming));

    expect(state.messages['c-sarah']).toContainEqual(expect.objectContaining({ id: 'socket-1' }));
    expect(state.unreadCounts['c-sarah']).toBeGreaterThan(2);
  });

  it('tracks typing events through the slice', () => {
    let state = chatReducer(undefined, { type: 'chat/clearChat' });
    state = chatReducer(
      state,
      typingChanged({
        conversationId: 'c-sarah',
        userId: 'user-sarah',
        userName: 'Sarah Chen',
        isTyping: true,
      }),
    );
    expect(state.typing['c-sarah']?.[0]?.isTyping).toBe(true);
  });

  it('simulates a peer reply: typing → read → message', () => {
    const actions: unknown[] = [];
    const fakeDispatch = (action: unknown) => {
      actions.push(action);
      return action;
    };

    const cancel = simulatePeerReply(
      fakeDispatch as never,
      'c-sarah',
      { userId: 'user-sarah', name: 'Sarah Chen' },
      'I’ll review your notes right away!',
      1600,
    );

    vi.advanceTimersByTime(1000);
    expect(actions.some((action) => (action as { type: string }).type === 'chat/typingChanged')).toBe(true);

    vi.advanceTimersByTime(1000);
    const received = actions.filter((action) => (action as { type: string }).type === 'chat/messageReceived');
    expect(received.length).toBe(1);
    expect((received[0] as { payload: { content: string } }).payload.content).toBe(
      'I’ll review your notes right away!',
    );

    cancel();
  });
});
