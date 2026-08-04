import { describe, expect, it } from 'vitest';
import chatReducer, {
  buildLocalMessage,
  hydrateConversations,
  markConversationRead,
  messageAck,
  messageReacted,
  messageReceived,
  presenceChanged,
  setSocketStatus,
  typingChanged,
} from '@/store/slices/chatSlice';
import { seedConversations, seedPresence } from '@/features/communication/data';
import type { ChatMessage, TypingInfo } from '@/types';

const seed = (conversationId: string, senderId: string, content: string, createdAt: string): ChatMessage =>
  buildLocalMessage(conversationId, content, {
    id: `m-${conversationId}-${Date.now()}-${Math.random()}`,
    senderId,
    senderName: senderId === 'user-me' ? 'Alex Morgan' : 'Sarah Chen',
    createdAt,
  });

describe('chatSlice', () => {
  it('hydrates conversations and initializes unread counts', () => {
    const state = chatReducer(undefined, hydrateConversations(seedConversations));
    expect(state.conversations.length).toBe(seedConversations.length);
    expect(state.unreadCounts['c-sarah']).toBe(2);
    expect(state.unreadCounts['c-devops']).toBe(5);
  });

  it('increments unread only for non-active incoming messages', () => {
    let state = chatReducer(undefined, hydrateConversations(seedConversations));
    state = chatReducer(state, { type: 'chat/setActiveConversation', payload: 'c-sarah' });

    const incoming = seed('c-sarah', 'user-sarah', 'Hello!', new Date().toISOString());
    state = chatReducer(state, messageReceived(incoming));
    expect(state.unreadCounts['c-sarah']).toBe(2); // active → no increment

    const other = seed('c-maya', 'user-maya', 'Hi!', new Date().toISOString());
    state = chatReducer(state, messageReceived(other));
    expect(state.unreadCounts['c-maya']).toBe(1);
    expect(state.messages['c-maya']).toHaveLength(1);
  });

  it('acks optimistic messages by replacing the temp id', () => {
    const temp = buildLocalMessage('c-sarah', 'Hello world');
    let state = chatReducer(undefined, hydrateConversations(seedConversations));
    state = chatReducer(state, { type: 'chat/messageSentOptimistic', payload: temp });
    expect(state.messages['c-sarah']).toContainEqual(expect.objectContaining({ id: temp.id, status: 'sending' }));

    const acked: ChatMessage = { ...temp, id: 'server-1', status: 'read' };
    state = chatReducer(state, messageAck({ tempId: temp.id, message: acked }));
    expect(state.messages['c-sarah'].some((m) => m.id === 'server-1')).toBe(true);
    expect(state.messages['c-sarah'].some((m) => m.id === temp.id)).toBe(false);
  });

  it('toggles reactions and removes zero-count reactions', () => {
    const message = buildLocalMessage('c-sarah', 'Nice work');
    let state = chatReducer(undefined, {
      type: 'chat/messageSentOptimistic',
      payload: message,
    });

    state = chatReducer(state, messageReacted({ conversationId: 'c-sarah', messageId: message.id, emoji: '👍' }));
    expect(state.messages['c-sarah'][0]?.reactions?.[0]).toMatchObject({ emoji: '👍', count: 1, reactedByMe: true });

    state = chatReducer(state, messageReacted({ conversationId: 'c-sarah', messageId: message.id, emoji: '👍' }));
    expect(state.messages['c-sarah'][0]?.reactions).toHaveLength(0);
  });

  it('marks a conversation read and upgrades own messages to read', () => {
    const myMessage = seed('c-maya', 'user-me', 'See you soon', new Date().toISOString());
    let state = chatReducer(undefined, hydrateConversations(seedConversations));
    state = chatReducer(state, { type: 'chat/messageSentOptimistic', payload: { ...myMessage, status: 'delivered' } });
    state = chatReducer(state, markConversationRead('c-maya'));

    expect(state.unreadCounts['c-maya']).toBe(0);
    const stored = state.messages['c-maya'].find((m) => m.id === myMessage.id);
    expect(stored?.status).toBe('read');
  });

  it('upserts typing sessions per conversation', () => {
    let state = chatReducer(undefined, { type: 'chat/clearChat' });
    const typing: TypingInfo = {
      conversationId: 'c-sarah',
      userId: 'user-sarah',
      userName: 'Sarah Chen',
      isTyping: true,
    };
    state = chatReducer(state, typingChanged(typing));
    expect(state.typing['c-sarah']).toHaveLength(1);

    state = chatReducer(state, typingChanged({ ...typing, isTyping: false }));
    expect(state.typing['c-sarah']).toBeUndefined();
  });

  it('merges presence updates and tracks socket status', () => {
    let state = chatReducer(undefined, { type: 'chat/clearChat' });
    state = chatReducer(state, presenceChanged({ userId: 'user-sarah', status: 'busy', customStatus: 'On a call' }));
    expect(state.presence['user-sarah']).toMatchObject({ status: 'busy' });

    state = chatReducer(state, setSocketStatus('connected'));
    expect(state.socketStatus).toBe('connected');
    expect(seedPresence['user-sarah']).toBeDefined();
  });

  it('clears chat state on logout', () => {
    let state = chatReducer(undefined, hydrateConversations(seedConversations));
    state = chatReducer(state, setSocketStatus('connected'));
    state = chatReducer(state, { type: 'chat/clearChat' });
    expect(state.conversations).toHaveLength(0);
    expect(state.socketStatus).toBe('disconnected');
  });
});
