import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { UIEvent } from 'react';

export interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
  height: number;
}

interface UseVirtualListOptions {
  estimateHeight?: number;
  overscan?: number;
  stickToBottom?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  loadMoreThreshold?: number;
  /** Lists below this size render fully (no windowing). */
  virtualizationThreshold?: number;
}

interface UseVirtualListResult<T> {
  containerRef: React.RefObject<HTMLDivElement | null>;
  enabled: boolean;
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  isNearBottom: boolean;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  registerItem: (index: number, element: HTMLDivElement | null) => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  scrollToIndex: (index: number, behavior?: ScrollBehavior) => void;
}

const findStartIndex = (offsets: number[], scrollTop: number): number => {
  let low = 0;
  let high = offsets.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (offsets[mid] <= scrollTop) low = mid;
    else high = mid - 1;
  }
  return low;
};

/**
 * Lightweight dynamic-height windowed list. Items measure themselves and the
 * window follows the scroll position; small lists render in full so the hook
 * stays test-friendly.
 */
export function useVirtualList<T>(items: T[], options: UseVirtualListOptions = {}): UseVirtualListResult<T> {
  const {
    estimateHeight = 76,
    overscan = 8,
    stickToBottom = false,
    hasMore = false,
    loadMore,
    loadMoreThreshold = 140,
    virtualizationThreshold = 50,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const heightsRef = useRef<Map<number, number>>(new Map());
  const stickRef = useRef(stickToBottom);
  const loadingMoreRef = useRef(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    stickRef.current = stickToBottom;
  }, [stickToBottom]);

  /* Observe the scroll container height. */
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setViewportHeight(element.clientHeight);
    update();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /* Cumulative offsets from measured (or estimated) item heights. */
  const { offsetsArr, totalHeight } = useMemo(() => {
    const offsetsArr: number[] = new Array(items.length);
    let total = 0;
    for (let i = 0; i < items.length; i += 1) {
      offsetsArr[i] = total;
      total += heightsRef.current.get(i) ?? estimateHeight;
    }
    return { offsetsArr, totalHeight: total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, estimateHeight, version]);

  const enabled = items.length > virtualizationThreshold && viewportHeight > 0;

  const { virtualItems } = useMemo(() => {
    if (!enabled || items.length === 0) return { virtualItems: [] as VirtualItem<T>[] };
    const start = Math.max(0, findStartIndex(offsetsArr, Math.max(0, scrollTop - overscan * estimateHeight)));
    const endIndexRaw = findStartIndex(
      offsetsArr,
      Math.min(scrollTop + viewportHeight + overscan * estimateHeight, totalHeight),
    );
    const end = Math.min(items.length - 1, endIndexRaw + overscan);

    const list: VirtualItem<T>[] = [];
    for (let index = start; index <= end; index += 1) {
      list.push({
        item: items[index]!,
        index,
        offsetTop: offsetsArr[index]!,
        height: heightsRef.current.get(index) ?? estimateHeight,
      });
    }
    return { virtualItems: list };
  }, [enabled, items, offsetsArr, scrollTop, viewportHeight, totalHeight, overscan, estimateHeight]);

  const isNearBottom = enabled
    ? scrollTop + viewportHeight >= totalHeight - 96
    : true;

  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const element = event.currentTarget;
      setScrollTop(element.scrollTop);
      stickRef.current =
        element.scrollTop + element.clientHeight >= element.scrollHeight - 96;

      if (loadMore && hasMore && !loadingMoreRef.current && element.scrollTop < loadMoreThreshold) {
        loadingMoreRef.current = true;
        loadMore();
        window.setTimeout(() => {
          loadingMoreRef.current = false;
        }, 500);
      }
    },
    [loadMore, hasMore, loadMoreThreshold],
  );

  const registerItem = useCallback((index: number, element: HTMLDivElement | null) => {
    if (!element) return;
    const height = element.getBoundingClientRect().height;
    if (height > 0 && heightsRef.current.get(index) !== height) {
      heightsRef.current.set(index, height);
      setVersion((current) => current + 1);
    }
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const element = containerRef.current;
    if (!element) return;
    stickRef.current = true;
    // Let measured heights settle before the final jump.
    window.requestAnimationFrame(() => {
      element.scrollTo({ top: element.scrollHeight, behavior });
      setScrollTop(element.scrollTop);
    });
  }, []);

  /* Keep the view pinned to the bottom for live conversations. */
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || !stickRef.current) return;
    element.scrollTop = element.scrollHeight;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, totalHeight, version]);

  const scrollToIndex = useCallback(
    (index: number, behavior: ScrollBehavior = 'auto') => {
      const element = containerRef.current;
      if (!element || index < 0) return;
      stickRef.current = false;
      if (!enabled) {
        const target = element.querySelector<HTMLElement>(`[data-index="${index}"]`);
        target?.scrollIntoView({ block: 'start', behavior });
        return;
      }
      const top = offsetsArr[index] ?? 0;
      element.scrollTo({ top, behavior });
      setScrollTop(top);
    },
    [enabled, offsetsArr],
  );

  return {
    containerRef,
    enabled,
    virtualItems,
    totalHeight,
    isNearBottom,
    onScroll,
    registerItem,
    scrollToBottom,
    scrollToIndex,
  };
}
