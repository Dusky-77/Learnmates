import { useEffect, useRef } from 'react';
import {
  isMeaningfulReadComplete,
  MEANINGFUL_READ_CONFIG,
} from '../utils/meaningfulRead';

type UseMeaningfulReadTrackerOptions = {
  numPages: number;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  pageRefs: React.MutableRefObject<Map<number, HTMLElement>>;
  enabled?: boolean;
  onComplete: () => void;
};

/**
 * Tracks focused reading time and per-page dwell to detect a meaningful read.
 * Fires `onComplete` once when criteria are met.
 */
export function useMeaningfulReadTracker({
  numPages,
  scrollContainerRef,
  pageRefs,
  enabled = true,
  onComplete,
}: UseMeaningfulReadTrackerOptions): void {
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);
  const activeSecondsRef = useRef(0);
  const pageDwellRef = useRef<Map<number, number>>(new Map());
  const visiblePagesRef = useRef<Set<number>>(new Set());
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    completedRef.current = false;
    activeSecondsRef.current = 0;
    pageDwellRef.current = new Map();
    visiblePagesRef.current = new Set();
    lastActivityRef.current = Date.now();
  }, [numPages, enabled]);

  useEffect(() => {
    if (!enabled || numPages <= 0) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const markActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const activityEvents = ['scroll', 'wheel', 'keydown', 'touchstart', 'mousemove'] as const;
    for (const event of activityEvents) {
      container.addEventListener(event, markActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', markActivity);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (!page) continue;
          if (entry.intersectionRatio >= MEANINGFUL_READ_CONFIG.PAGE_VISIBLE_RATIO) {
            visiblePagesRef.current.add(page);
          } else {
            visiblePagesRef.current.delete(page);
          }
        }
      },
      {
        root: container,
        threshold: [0, MEANINGFUL_READ_CONFIG.PAGE_VISIBLE_RATIO, 0.5, 1],
      }
    );

    pageRefs.current.forEach((el) => observer.observe(el));

    const tick = () => {
      if (completedRef.current) return;

      const now = Date.now();
      const tabVisible = document.visibilityState === 'visible';
      const recentlyActive = now - lastActivityRef.current <= MEANINGFUL_READ_CONFIG.IDLE_TIMEOUT_MS;

      if (tabVisible && recentlyActive) {
        activeSecondsRef.current += 1;

        for (const page of visiblePagesRef.current) {
          const prev = pageDwellRef.current.get(page) ?? 0;
          pageDwellRef.current.set(page, prev + 1);
        }
      }

      if (
        isMeaningfulReadComplete(numPages, activeSecondsRef.current, pageDwellRef.current)
      ) {
        completedRef.current = true;
        onCompleteRef.current();
      }
    };

    const intervalId = window.setInterval(tick, MEANINGFUL_READ_CONFIG.TICK_MS);

    return () => {
      window.clearInterval(intervalId);
      observer.disconnect();
      for (const event of activityEvents) {
        container.removeEventListener(event, markActivity);
      }
      document.removeEventListener('visibilitychange', markActivity);
    };
  }, [enabled, numPages, pageRefs, scrollContainerRef]);
}
