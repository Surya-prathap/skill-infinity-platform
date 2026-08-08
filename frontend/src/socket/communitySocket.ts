import { socketService } from './socket';
import type { AppDispatch } from '@/store';
import { pushLiveEvent } from '@/store/slices/communitySlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import type { CommunityPost } from '@/types';

/**
 * Real-time community layer.
 *
 * Wires community-service events (live likes, comments, new posts, poll
 * updates, notifications) into Redux. All data shown in the UI comes from
 * the real backend via REST + these socket events.
 */

export const COMMUNITY_SOCKET_EVENTS = {
  POST_LIKED: 'community:postLiked',
  COMMENT_CREATED: 'community:commentCreated',
  POST_CREATED: 'community:postCreated',
  POLL_VOTED: 'community:pollVoted',
  NOTIFICATION: 'notification',
} as const;

let bound = false;

/** Attach all community event handlers (idempotent). */
export const connectCommunitySocket = (dispatch: AppDispatch): void => {
  if (bound) return;
  bound = true;

  const socket = socketService.connect();

  socket.on(COMMUNITY_SOCKET_EVENTS.POST_LIKED, (payload: { postId: string; liked: boolean }) => {
    dispatch(
      pushLiveEvent({
        kind: 'LIKE',
        message: payload.liked
          ? `A member liked a post you follow`
          : 'A like was removed from a post you follow',
      }),
    );
  });

  socket.on(
    COMMUNITY_SOCKET_EVENTS.COMMENT_CREATED,
    (payload: { postId: string; authorName: string }) => {
      dispatch(
        pushLiveEvent({
          kind: 'COMMENT',
          message: `${payload.authorName} commented on a post you follow`,
        }),
      );
    },
  );

  socket.on(COMMUNITY_SOCKET_EVENTS.POST_CREATED, (payload: { authorName: string }) => {
    dispatch(
      pushLiveEvent({
        kind: 'POST',
        message: `${payload.authorName} shared a new post`,
      }),
    );
  });

  socket.on(COMMUNITY_SOCKET_EVENTS.POLL_VOTED, () => {
    dispatch(pushLiveEvent({ kind: 'POLL', message: 'A poll you voted on has new results' }));
  });

  socket.on(COMMUNITY_SOCKET_EVENTS.NOTIFICATION, (notification) => {
    dispatch(addNotification(notification));
  });
};

/** Detach community handlers. */
export const disconnectCommunitySocket = (): void => {
  bound = false;
  socketService.disconnect();
};

/* ---------------- Emitters ---------------- */

export const emitCommunityPost = (post: CommunityPost): void => {
  socketService.emit(COMMUNITY_SOCKET_EVENTS.POST_CREATED, post);
};

export const emitCommunityLike = (postId: string, liked: boolean): void => {
  socketService.emit(COMMUNITY_SOCKET_EVENTS.POST_LIKED, { postId, liked });
};
