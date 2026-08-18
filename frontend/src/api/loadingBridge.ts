import { decrementPendingRequests, incrementPendingRequests } from '@/store/slices/loadingSlice';
import type { UnknownAction } from '@reduxjs/toolkit';

type Dispatch = (action: UnknownAction) => void;

/**
 * Lightweight bridge between the axios client and the Redux loading slice.
 * Registered once by `store/index.ts` — avoids any circular import between
 * the api layer and the store.
 */
let dispatchFn: Dispatch | null = null;

export const registerLoadingDispatch = (dispatch: Dispatch): void => {
  dispatchFn = dispatch;
};

export const requestStarted = (): void => {
  dispatchFn?.(incrementPendingRequests());
};

export const requestFinished = (): void => {
  dispatchFn?.(decrementPendingRequests());
};
